import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataApi } from "@/api/apiService";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import ExpiryReminder from "@/components/ExpiryReminder";
import useExpiryNotifications from "@/hooks/useExpiryNotifications";
import { Users, Bus, CreditCard, RefreshCw, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ParentDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [busPasses, setBusPasses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [passPricePerMonth, setPassPricePerMonth] = useState(500);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      try {
        const [studentsRes, passesRes, routesRes, paymentsRes, priceRes] = await Promise.all([
          dataApi.getStudentsByParent(user.id),
          dataApi.getBusPasses(),
          dataApi.getRoutes(),
          dataApi.getPayments(),
          dataApi.getPassPrice(),
        ]);
        setStudents(Array.isArray(studentsRes) ? studentsRes : []);
        setBusPasses(Array.isArray(passesRes) ? passesRes : []);
        setRoutes(Array.isArray(routesRes) ? routesRes : []);
        setPayments(Array.isArray(paymentsRes) ? paymentsRes : []);
        if (priceRes?.pricePerMonth) {
          setPassPricePerMonth(priceRes.pricePerMonth);
        }
      } catch (err) {
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user?.id]);

  const parent = user;
  const children = students.filter(s => s.parentId === parent?.id);
  const childPasses = busPasses.filter(p => children.some(c => c.id === p.studentId));
  const activePasses = childPasses.filter(p => p.status === "ACTIVE");
  useExpiryNotifications(childPasses, routes);

  const [renewDialog, setRenewDialog] = useState({ open: false, studentId: "", passId: null });
  const [months, setMonths] = useState("");
  const [paying, setPaying] = useState(false);

  const total = months ? parseInt(months, 10) * passPricePerMonth : 0;

  const handleRenewOrPay = async () => {
    if (!months) { toast.error("Select months"); return; }
    const selectedStudent = children.find(c => c.id === renewDialog.studentId);
    if (!renewDialog.passId && !selectedStudent?.routeId) {
      toast.error("No route assigned for this student");
      return;
    }
    setPaying(true);
    try {
      if (renewDialog.passId) {
        await dataApi.renewPass(renewDialog.passId, parseInt(months, 10));
        await dataApi.makePayment({ busPassId: renewDialog.passId, amount: total });
      } else {
        const createdPass = await dataApi.applyPass({
          studentId: selectedStudent.id,
          routeId: selectedStudent.routeId,
          months: parseInt(months, 10),
        });
        if (createdPass?.id) {
          await dataApi.makePayment({ busPassId: createdPass.id, amount: total });
        }
      }

      const [passesRes, paymentsRes] = await Promise.all([dataApi.getBusPasses(), dataApi.getPayments()]);
      setBusPasses(Array.isArray(passesRes) ? passesRes : []);
      setPayments(Array.isArray(paymentsRes) ? paymentsRes : []);

      setRenewDialog({ open: false, studentId: "", passId: null });
      setMonths("");
      toast.success("Payment successful! Pass is now active.");
    } catch (err) {
      toast.error(err?.message || "Failed to complete payment");
    } finally {
      setPaying(false);
    }
  };

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

  if (!parent) {
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
      <h1 className="text-2xl font-display font-bold mb-1">Welcome, {parent.fatherName}</h1>
      <p className="text-muted-foreground mb-8">Parent Dashboard</p>

      <ExpiryReminder passes={childPasses} routes={routes} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Children" value={children.length} icon={<Users className="w-5 h-5" />} variant="primary" />
        <StatCard title="Active Passes" value={activePasses.length} subtitle={`of ${childPasses.length} total`} icon={<Bus className="w-5 h-5" />} />
        <StatCard title="Total Paid" value={`₹${payments.filter(p => childPasses.some(bp => bp.id === p.busPassId)).reduce((s, p) => s + p.amount, 0)}`} icon={<CreditCard className="w-5 h-5" />} variant="secondary" />
      </div>

      {children.map(child => {
        const passes = busPasses.filter(p => p.studentId === child.id);
        const latestPass = passes[passes.length - 1];
        const childPayments = payments.filter(p => passes.some(bp => bp.id === p.busPassId));
        const canRenew = !latestPass || latestPass.status === "EXPIRED" || latestPass.status === "ACTIVE";
        const route = routes.find(r => r.id === child.routeId);

        return (
          <div key={child.id} className="glass-card mb-4">
            <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-display font-bold">{child.name}</h3>
                <p className="text-sm text-muted-foreground">{route?.name || "No route assigned"}</p>
              </div>
              <div className="flex items-center gap-3">
                {latestPass && <StatusBadge status={latestPass.status} />}
                {canRenew && route && (
                  <Button
                    size="sm"
                    onClick={() => setRenewDialog({ open: true, studentId: child.id, passId: latestPass?.id || null })}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg"
                  >
                    <RefreshCw className="mr-1 w-4 h-4" />
                    {!latestPass ? "Buy Pass" : latestPass.status === "ACTIVE" ? "Extend" : "Renew"}
                  </Button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left p-3 font-medium">Period</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Payment</th>
                    <th className="text-left p-3 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {passes.length === 0 ? (
                    <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No passes yet</td></tr>
                  ) : passes.map(p => {
                    const pay = childPayments.find(cp => cp.busPassId === p.id);
                    return (
                      <tr key={p.id} className="border-b border-border/50">
                        <td className="p-3">{p.startDate} → {p.expiryDate}</td>
                        <td className="p-3"><StatusBadge status={p.status} /></td>
                        <td className="p-3"><StatusBadge status={pay?.status || "PENDING"} /></td>
                        <td className="p-3">₹{pay?.amount || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <Dialog open={renewDialog.open} onOpenChange={o => setRenewDialog({ ...renewDialog, open: o })}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>{renewDialog.passId ? "Renew / Extend Pass" : "Buy New Pass"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Duration</Label>
              <Select value={months} onValueChange={setMonths}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select months" /></SelectTrigger>
                <SelectContent>{[1, 2, 3, 6, 12].map(m => <SelectItem key={m} value={String(m)}>{m} month{m > 1 ? "s" : ""}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {total > 0 && <div className="flex justify-between bg-muted rounded-lg p-3"><span className="text-muted-foreground">Total</span><span className="font-display font-bold text-primary">₹{total}</span></div>}
            <Button onClick={handleRenewOrPay} disabled={paying || !months} className="w-full bg-primary text-primary-foreground rounded-xl">
              <CreditCard className="mr-2 w-4 h-4" />{paying ? "Processing..." : "Pay Now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ParentDashboard;
