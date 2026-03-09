import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { dataApi } from "@/api/apiService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CreditCard, CheckCircle } from "lucide-react";

const ApplyPassPage = () => {
  const { user } = useAuth();
  const student = user;
  const navigate = useNavigate();
  const [depots, setDepots] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [passPricePerMonth, setPassPricePerMonth] = useState(500);
  const [depotId, setDepotId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [months, setMonths] = useState("");
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [depotsRes, routesRes, priceRes] = await Promise.all([
          dataApi.getDepots(),
          dataApi.getRoutes(),
          dataApi.getPassPrice(),
        ]);
        setDepots(depotsRes || []);
        setRoutes(routesRes || []);
        if (priceRes?.pricePerMonth) {
          setPassPricePerMonth(priceRes.pricePerMonth);
        }
      } catch {
        toast.error("Failed to load pass details");
      }
    };
    loadData();
  }, []);

  const filteredRoutes = routes.filter(r => r.depotId === depotId);
  const total = months ? parseInt(months, 10) * passPricePerMonth : 0;

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

  const handlePayment = async () => {
    if (!routeId || !months) { toast.error("Select route and months"); return; }
    setPaying(true);
    try {
      const createdPass = await dataApi.applyPass({
        studentId: student.id,
        routeId,
        months: parseInt(months, 10),
      });
      if (createdPass?.id) {
        await dataApi.makePayment({ busPassId: createdPass.id, amount: total });
      }
      setSuccess(true);
      toast.success("Bus pass purchased!");
    } catch {
      toast.error("Failed to apply for pass");
    } finally {
      setPaying(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 glow-primary">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">Payment Successful!</h2>
          <p className="text-muted-foreground mb-6">Your bus pass is now active.</p>
          <Button onClick={() => navigate("/dashboard/student")} className="bg-primary text-primary-foreground rounded-xl">Go to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-display font-bold mb-1">Apply for Bus Pass</h1>
      <p className="text-muted-foreground mb-8">Select your route and duration</p>

      <div className="glass-card p-6 max-w-lg space-y-5">
        <div>
          <Label>Depot</Label>
          <Select value={depotId} onValueChange={v => { setDepotId(v); setRouteId(""); }}>
            <SelectTrigger className="mt-1 bg-muted border-border"><SelectValue placeholder="Select depot" /></SelectTrigger>
            <SelectContent>{depots.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Route</Label>
          <Select value={routeId} onValueChange={setRouteId} disabled={!depotId}>
            <SelectTrigger className="mt-1 bg-muted border-border"><SelectValue placeholder="Select route" /></SelectTrigger>
            <SelectContent>{filteredRoutes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Number of Months</Label>
          <Select value={months} onValueChange={setMonths}>
            <SelectTrigger className="mt-1 bg-muted border-border"><SelectValue placeholder="Select months" /></SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 6, 12].map(m => <SelectItem key={m} value={String(m)}>{m} month{m > 1 ? "s" : ""}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {total > 0 && (
          <div className="bg-muted rounded-xl p-4 flex justify-between items-center">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="text-2xl font-display font-bold text-primary">₹{total}</span>
          </div>
        )}

        <Button onClick={handlePayment} disabled={paying || !routeId || !months} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display py-5 rounded-xl">
          <CreditCard className="mr-2 w-5 h-5" />
          {paying ? "Processing..." : "Pay & Get Pass"}
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default ApplyPassPage;
