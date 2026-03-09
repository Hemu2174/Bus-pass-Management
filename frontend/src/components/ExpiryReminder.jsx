import { AlertTriangle, Clock } from "lucide-react";

const ExpiryReminder = ({ passes, routes = [], daysThreshold = 14 }) => {
  const routesById = new Map(routes.map((r) => [r.id, r]));
  const today = new Date();
  const expiringSoon = passes.filter(p => {
    if (p.status !== "ACTIVE") return false;
    const expiry = new Date(p.expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= daysThreshold && diffDays > 0;
  });

  const alreadyExpired = passes.filter(p => {
    if (p.status !== "ACTIVE") return false;
    return new Date(p.expiryDate) <= today;
  });

  if (expiringSoon.length === 0 && alreadyExpired.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {alreadyExpired.map(p => {
        const route = routesById.get(p.routeId);
        return (
          <div key={p.id} className="flex items-start gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-4">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Pass Expired!</p>
              <p className="text-sm text-muted-foreground">
                {route?.name} — expired on {p.expiryDate}. Please renew immediately.
              </p>
            </div>
          </div>
        );
      })}
      {expiringSoon.map(p => {
        const route = routesById.get(p.routeId);
        const daysLeft = Math.ceil((new Date(p.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return (
          <div key={p.id} className="flex items-start gap-3 rounded-xl bg-secondary/10 border border-secondary/20 p-4">
            <Clock className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-secondary">Expiring Soon — {daysLeft} day{daysLeft !== 1 ? "s" : ""} left</p>
              <p className="text-sm text-muted-foreground">
                {route?.name} — expires {p.expiryDate}. Consider renewing your pass.
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExpiryReminder;
