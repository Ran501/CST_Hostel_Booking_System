"use client";

import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import ConfirmationDialog from "../../confirmation";

const initialConfirmation = {
  isOpen: false,
  message: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
  onConfirm: null,
  onCancel: null,
};

export function useConfirmation() {
  const [confirmation, setConfirmation] = useState(initialConfirmation);
  const [isLoading, setIsLoading] = useState(false);
  const resolverRef = useRef(null);

  const resetConfirmation = useCallback(() => {
    setConfirmation(initialConfirmation);
  }, []);

  const resolveConfirmation = useCallback(
    (value) => {
      resolverRef.current?.(value);
      resolverRef.current = null;
      resetConfirmation();
    },
    [resetConfirmation]
  );

  const confirm = useCallback(
    ({
      message,
      confirmText = "Confirm",
      cancelText = "Cancel",
      onConfirm,
      onCancel,
    }) =>
      new Promise((resolve) => {
        resolverRef.current?.(false);
        resolverRef.current = resolve;
        setConfirmation({
          isOpen: true,
          message,
          confirmText,
          cancelText,
          onConfirm,
          onCancel,
        });
      }),
    []
  );

  const handleCancel = useCallback(() => {
    if (isLoading) return;
    confirmation.onCancel?.();
    resolveConfirmation(false);
  }, [confirmation, isLoading, resolveConfirmation]);

  const handleConfirm = useCallback(async () => {
    if (!confirmation.onConfirm || isLoading) return;

    setIsLoading(true);
    try {
      const result = await confirmation.onConfirm();
      resolveConfirmation(result === undefined ? true : result);
    } catch (error) {
      // Expected validation messages (e.g. "student already exists") land here.
      // Use console.warn (not console.error) so it doesn't trip Next's red error
      // overlay, and show a normal toast instead of a browser alert().
      console.warn("Confirmed action failed:", error);
      toast.error(error?.message || "Action failed");
      resolveConfirmation(false);
    } finally {
      setIsLoading(false);
    }
  }, [confirmation, isLoading, resolveConfirmation]);

  const confirmationDialog = confirmation.isOpen ? (
    <ConfirmationDialog
      message={confirmation.message}
      confirmText={confirmation.confirmText}
      cancelText={confirmation.cancelText}
      isLoading={isLoading}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { confirm, confirmationDialog, isConfirmOpen: confirmation.isOpen };
}
