import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { dataApi } from "@/api/apiService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";
import { RefreshCw, CheckCircle } from "lucide-react";

const RenewPassPage = () => {
  const { user } = useAuth();
  const student = user;
  const navigate = useNavigate();
  const [busPasses, setBusPasses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [passPricePerMonth, setPassPricePerMonth] = useState(500);
  const [months, setMonths] = useState("");
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!student?.id) return;
      try {
        const [passesRes, routesRes, priceRes] = await Promise.all([
          dataApi.getBusPassesByStudent(student.id),
          dataApi.getRoutes(),
          dataApi.getPassPrice(),
        ]);
        setBusPasses(passesRes || []);
        setRoutes(routesRes || []);
        if (priceRes?.pricePerMonth) {
          setPassPricePerMonth(priceRes.pricePerMonth);
        }
      } catch {
        toast.error("Failed to load pass details");
      }
    };
    loadData();
  }, [student?.id]);

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

  const expiredPasses = busPasses.filter(p => p.studentId === student.id && p.status === "EXPIRED");
  const total = months ? parseInt(months, 10) * passPricePerMonth : 0;

  const handleRenew = async (passId) => {
    if (!months) { toast.error("Select months"); return; }
    setPaying(true);
    try {
      await dataApi.renewPass(passId, parseInt(months, 10));
      await dataApi.makePayment({ busPassId: passId, amount: total });
      setSuccess(true);
      toast.success("Bus pass renewed!");
    } catch {
      toast.error("Failed to renew pass");
    } finally {
      setPaying(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 glow-primary"><CheckCircle className="w-10 h-10 text-primary" /></div>
          <h2 className="text-2xl font-display font-bold mb-2">Renewal Successful!</h2>
          <p className="text-muted-foreground mb-6">Your bus pass is active again.</p>
          <Button onClick={() => navigate("/dashboard/student")} className="bg-primary text-primary-foreground rounded-xl">Go to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-display font-bold mb-1">Renew Bus Pass</h1>
      <p className="text-muted-foreground mb-8">Renew your expired bus passes</p>

      {expiredPasses.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground">No expired passes to renew.</p>
          <Button onClick={() => navigate("/dashboard/student/apply")} className="mt-4 bg-primary text-primary-foreground rounded-xl">Apply for New Pass</Button>
        </div>
      ) : (
        <div className="space-y-4 max-w-lg">
          <div><Label>Renewal Duration</Label>
            <Select value={months} onValueChange={setMonths}>
              <SelectTrigger className="mt-1 bg-muted border-border"><SelectValue placeholder="Select months" /></SelectTrigger>
              <SelectContent>{[1, 2, 3, 6, 12].map(m => <SelectItem key={m} value={String(m)}>{m} month{m > 1 ? "s" : ""}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {total > 0 && <div className="bg-muted rounded-xl p-4 flex justify-between"><span className="text-muted-foreground">Total</span><span className="text-2xl font-display font-bold text-primary">₹{total}</span></div>}
          {expiredPasses.map(p => (
            <div key={p.id} className="glass-card p-5 flex items-center justify-between">
              <div>
                <p className="font-medium">{routes.find(r => r.id === p.routeId)?.name}</p>
                <p className="text-sm text-muted-foreground">Expired: {p.expiryDate}</p>
                <StatusBadge status={p.status} />
              </div>
              <Button onClick={() => handleRenew(p.id)} disabled={paying || !months} className="bg-secondary text-secondary-foreground rounded-xl">
                <RefreshCw className="mr-2 w-4 h-4" />{paying ? "..." : "Renew"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default RenewPassPage;
