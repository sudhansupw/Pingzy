import { useEffect, useState } from "react";

export const useCountdown = (expiresAt) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const diff = new Date(expiresAt) - new Date();

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return timeLeft;
};
