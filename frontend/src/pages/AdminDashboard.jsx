import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataApi } from "@/api/apiService";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Users, Bus, AlertTriangle, Loader2 } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [busPasses, setBusPasses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [depots, setDepots] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentsRes, passesRes, routesRes, depotsRes] = await Promise.all([
          dataApi.getStudents(),
          dataApi.getBusPasses(),
          dataApi.getRoutes(),
          dataApi.getDepots(),
        ]);
        setStudents(Array.isArray(studentsRes) ? studentsRes : []);
        setBusPasses(Array.isArray(passesRes) ? passesRes : []);
        setRoutes(Array.isArray(routesRes) ? routesRes : []);
        setDepots(Array.isArray(depotsRes) ? depotsRes : []);
      } catch (err) {
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

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

  const admin = user;
  if (!admin) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
          <div className="text-muted-foreground font-medium">Session not found. Please sign in again.</div>
          <a href="/signin" className="text-primary hover:underline">Go to Sign In</a>
        </div>
      </DashboardLayout>
    );
  }

  const route = routes.find(r => r.id === admin.routeId);
  const depot = depots.find(d => d.id === admin.depotId);
  const routeStudents = students.filter(s => s.routeId === admin.routeId);
  const routePasses = busPasses.filter(p => routeStudents.some(s => s.id === p.studentId));
  const active = routePasses.filter(p => p.status === "ACTIVE").length;
  const expired = routePasses.filter(p => p.status === "EXPIRED").length;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-display font-bold mb-1">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">{depot?.name} — {route?.name}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Students" value={routeStudents.length} subtitle="on your route" icon={<Users className="w-5 h-5" />} variant="primary" />
        <StatCard title="Active Passes" value={active} icon={<Bus className="w-5 h-5" />} />
        <StatCard title="Expired" value={expired} icon={<AlertTriangle className="w-5 h-5" />} variant="secondary" />
      </div>

      <div className="glass-card">
        <div className="p-4 border-b border-border">
          <h3 className="font-display font-bold text-sm uppercase tracking-widest">Route Students</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-4 font-medium">Student</th>
                <th className="text-left p-4 font-medium">Phone</th>
                <th className="text-left p-4 font-medium">Pass Status</th>
                <th className="text-left p-4 font-medium">Expiry</th>
                <th className="text-left p-4 font-medium">Months</th>
              </tr>
            </thead>
            <tbody>
              {routeStudents.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No students on this route yet.</td></tr>
              ) : routeStudents.map(s => {
                const pass = busPasses.find(p => p.studentId === s.id);
                return (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-4 font-medium">{s.name}</td>
                    <td className="p-4">{s.phone}</td>
                    <td className="p-4"><StatusBadge status={pass?.status || "NOT_PURCHASED"} /></td>
                    <td className="p-4">{pass?.expiryDate || "—"}</td>
                    <td className="p-4">{pass?.months || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
