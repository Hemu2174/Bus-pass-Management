import { useEffect, useRef } from "react";
import { toast } from "sonner";

const useExpiryNotifications = (passes, routes = []) => {
  const notified = useRef(false);

  useEffect(() => {
    if (notified.current) return;
    notified.current = true;

    const today = new Date();

    passes.forEach((p) => {
      if (p.status !== "ACTIVE") return;
      const expiry = new Date(p.expiryDate);
      const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const route = routes.find((r) => r.id === p.routeId);
      const routeName = route?.name || "Unknown route";

      if (diffDays <= 0) {
        toast.error(`Pass expired: ${routeName}`, {
          description: `Expired on ${p.expiryDate}. Renew immediately!`,
          duration: 8000,
        });
      } else if (diffDays <= 14) {
        toast.warning(`Pass expiring soon: ${routeName}`, {
          description: `${diffDays} day${diffDays !== 1 ? "s" : ""} left — expires ${p.expiryDate}`,
          duration: 6000,
        });
      }
    });
  }, [passes, routes]);
};

export default useExpiryNotifications;
