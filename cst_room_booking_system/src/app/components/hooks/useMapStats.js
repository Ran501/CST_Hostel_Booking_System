import { useState, useEffect, useCallback } from "react";
import { calculateStats } from "../utils/stats-utils";

export const useMapStats = (hostels) => {
  const [stats, setStats] = useState({
    totalAvailableRooms: 0,
    bookedRoom: "",
    occupancyRate: 0,
    loading: true,
  });
  const [studentNumber] = useState(() => {
    if (typeof window === "undefined") return "";

    const storedUser = localStorage.getItem("session");
    if (!storedUser) return "";

    try {
      const parsedUser = JSON.parse(storedUser);
      return parsedUser.studentNumber || "";
    } catch {
      console.error("Failed to parse user from local storage");
      return "";
    }
  });

  const fetchStats = useCallback(async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true }));
      const res = await fetch(`/api/stats?studentNumber=${studentNumber}`, {
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success || !data?.stats) {
        throw new Error(data?.error || "Failed to fetch stats");
      }

      const nextStats = {
        totalAvailableRooms: Number(data.stats.totalAvailableRooms ?? 0),
        bookedRoom: data.stats.bookedRoom ?? "None",
        occupancyRate: Number(data.stats.occupancyRate ?? 0),
      };

      const calculatedStats = calculateStats(hostels);

      setStats({
        totalAvailableRooms: Number.isFinite(nextStats.totalAvailableRooms)
          ? nextStats.totalAvailableRooms
          : calculatedStats.totalAvailableRooms,
        bookedRoom:
          nextStats.bookedRoom && typeof nextStats.bookedRoom === "string"
            ? nextStats.bookedRoom
            : "None",
        occupancyRate: Number.isFinite(nextStats.occupancyRate)
          ? nextStats.occupancyRate
          : calculatedStats.occupancyRate,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Fallback to calculated stats if API fails
      const calculatedStats = calculateStats(hostels);
      setStats({
        totalAvailableRooms: calculatedStats.totalAvailableRooms,
        bookedRoom: "None", // Since API failed, assume no booking info
        occupancyRate: calculatedStats.occupancyRate,
        loading: false,
      });
    }
  }, [hostels, studentNumber]);

  useEffect(() => {
    const initialFetchId = window.setTimeout(() => {
      fetchStats();
    }, 0);

    const intervalId = window.setInterval(() => {
      fetchStats();
    }, 30000);

    return () => {
      window.clearTimeout(initialFetchId);
      window.clearInterval(intervalId);
    };
  }, [fetchStats]);

  return { stats, refetch: fetchStats };
};
