export function isValidEmployeeId(id) {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  if (trimmed.length === 0) return false;
  return /^[A-Za-z0-9_-]{3,32}$/.test(trimmed);
}

export function isValidPhoneNumber(phoneNumber) {
  if (typeof phoneNumber !== "string") return false;
  const trimmed = phoneNumber.trim();
  if (trimmed.length === 0) return false;
  return /^\+?[0-9]{6,15}$/.test(trimmed);
}