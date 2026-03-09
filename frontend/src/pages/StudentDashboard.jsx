import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataApi } from "@/api/apiService";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import ExpiryReminder from "@/components/ExpiryReminder";
import useExpiryNotifications from "@/hooks/useExpiryNotifications";
import { Bus, CreditCard, Calendar, Loader2 } from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passes, setPasses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      try {
        const [allPasses, allRoutes, allPayments] = await Promise.all([
          dataApi.getBusPassesByStudent(user.id),
          dataApi.getRoutes(),
          dataApi.getPayments(),
        ]);
        const safePasses = Array.isArray(allPasses) ? allPasses : [];
        const safeRoutes = Array.isArray(allRoutes) ? allRoutes : [];
        const safePayments = Array.isArray(allPayments) ? allPayments : [];

        setPasses(safePasses);
        setRoutes(safeRoutes);
        const passIds = new Set(safePasses.map((p) => p.id));
        setPayments(safePayments.filter((p) => passIds.has(p.busPassId)));
      } catch (err) {
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user?.id]);

  const student = user;
  const activePass = passes.find(p => p.status === "ACTIVE");
  const route = routes.find(r => r.id === student?.routeId);
  const studentPayments = payments;
  useExpiryNotifications(passes, routes);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
          <div className="text-destructive font-medium">{error}</div>
          <button onClick={() => window.location.reload()} className="text-primary hover:underline">Try again</button>
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
          <div className="text-muted-foreground font-medium">Session not found. Please sign in again.</div>
          <a href="/signin" className="text-primary hover:underline">Go to Sign In</a>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-display font-bold mb-1">Welcome, {student.name}</h1>
      <p className="text-muted-foreground mb-8">Student Dashboard</p>

      <ExpiryReminder passes={passes} routes={routes} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Bus Pass" value={activePass ? "Active" : "None"} subtitle={route?.name || "No route"} icon={<Bus className="w-5 h-5" />} variant={activePass ? "primary" : "default"} />
        <StatCard title="Expires" value={activePass?.expiryDate || "—"} subtitle={activePass ? `${activePass.months} months` : ""} icon={<Calendar className="w-5 h-5" />} />
        <StatCard title="Payments" value={studentPayments.length} subtitle={`₹${studentPayments.reduce((s, p) => s + p.amount, 0)} total`} icon={<CreditCard className="w-5 h-5" />} variant="secondary" />
      </div>

      <div className="glass-card">
        <div className="p-4 border-b border-border">
          <h3 className="font-display font-bold text-sm uppercase tracking-widest">Pass History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-4 font-medium">Route</th>
                <th className="text-left p-4 font-medium">Start</th>
                <th className="text-left p-4 font-medium">Expiry</th>
                <th className="text-left p-4 font-medium">Months</th>
                <th className="text-left p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {passes.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No bus passes yet. Apply for one!</td></tr>
              ) : passes.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="p-4">{routes.find(r => r.id === p.routeId)?.name}</td>
                  <td className="p-4">{p.startDate}</td>
                  <td className="p-4">{p.expiryDate}</td>
                  <td className="p-4">{p.months}</td>
                  <td className="p-4"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
