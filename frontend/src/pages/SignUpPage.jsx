import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { dataApi } from "@/api/apiService";
import { toast } from "sonner";
import FloatingThemeToggle from "@/components/FloatingThemeToggle";

const SignUpPage = () => {
  const navigate = useNavigate();
  const { registerStudent, registerAdmin } = useAuth();
  const [role, setRole] = useState(null);
  const [depots, setDepots] = useState([]);
  const [routes, setRoutes] = useState([]);

  const [studentForm, setStudentForm] = useState({ name: "", fatherName: "", email: "", password: "", phone: "" });
  const [adminForm, setAdminForm] = useState({ name: "", depotId: "", routeId: "", password: "" });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [depotsRes, routesRes] = await Promise.all([dataApi.getDepots(), dataApi.getRoutes()]);
        setDepots(depotsRes || []);
        setRoutes(routesRes || []);
      } catch {
        toast.error("Failed to load depot and route data");
      }
    };
    loadData();
  }, []);

  const filteredRoutes = routes.filter(r => r.depotId === adminForm.depotId);

  const handleStudentRegister = async (e) => {
    e.preventDefault();
    const result = await registerStudent(studentForm);
    if (result.ok) {
      toast.success("Registration successful!");
      navigate("/dashboard/student");
    } else {
      toast.error(result.message || "Registration failed");
    }
  };

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    const result = await registerAdmin(adminForm);
    if (result.ok) {
      toast.success("Admin registered!");
      navigate("/dashboard/admin");
    } else {
      toast.error(result.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <FloatingThemeToggle />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Button variant="ghost" onClick={() => role ? setRole(null) : navigate("/")} className="mb-6 text-muted-foreground">
          <ArrowLeft className="mr-2 w-4 h-4" /> {role ? "Change Role" : "Back"}
        </Button>

        <h1 className="text-3xl font-display font-bold mb-2">Sign Up</h1>

        {!role ? (
          <>
            <p className="text-muted-foreground mb-8">Register as:</p>
            <div className="grid gap-4">
              <button onClick={() => setRole("student")} className="glass-card p-5 flex items-center gap-4 hover:border-primary/40 transition-colors text-left">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-primary"><GraduationCap className="w-6 h-6" /></div>
                <div><span className="text-lg font-display font-medium">Student</span><p className="text-sm text-muted-foreground">Apply for bus passes</p></div>
              </button>
              <button onClick={() => setRole("admin")} className="glass-card p-5 flex items-center gap-4 hover:border-primary/40 transition-colors text-left">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-info"><Shield className="w-6 h-6" /></div>
                <div><span className="text-lg font-display font-medium">Admin</span><p className="text-sm text-muted-foreground">Manage bus pass data</p></div>
              </button>
            </div>
          </>
        ) : role === "student" ? (
          <form onSubmit={handleStudentRegister} className="space-y-4 mt-6">
            <div><Label>Student Name</Label><Input value={studentForm.name} onChange={e => setStudentForm(f => ({ ...f, name: e.target.value }))} className="mt-1 bg-muted border-border" required /></div>
            <div><Label>Father Name</Label><Input value={studentForm.fatherName} onChange={e => setStudentForm(f => ({ ...f, fatherName: e.target.value }))} className="mt-1 bg-muted border-border" required /></div>
            <div><Label>Email</Label><Input type="email" value={studentForm.email} onChange={e => setStudentForm(f => ({ ...f, email: e.target.value }))} className="mt-1 bg-muted border-border" required /></div>
            <div><Label>Phone</Label><Input value={studentForm.phone} onChange={e => setStudentForm(f => ({ ...f, phone: e.target.value }))} className="mt-1 bg-muted border-border" required /></div>
            <div><Label>Password</Label><Input type="password" value={studentForm.password} onChange={e => setStudentForm(f => ({ ...f, password: e.target.value }))} className="mt-1 bg-muted border-border" required /></div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display py-5 rounded-xl">Register</Button>
          </form>
        ) : (
          <form onSubmit={handleAdminRegister} className="space-y-4 mt-6">
            <div><Label>Admin Name</Label><Input value={adminForm.name} onChange={e => setAdminForm(f => ({ ...f, name: e.target.value }))} className="mt-1 bg-muted border-border" required /></div>
            <div>
              <Label>Depot</Label>
              <Select value={adminForm.depotId} onValueChange={v => setAdminForm(f => ({ ...f, depotId: v, routeId: "" }))}>
                <SelectTrigger className="mt-1 bg-muted border-border"><SelectValue placeholder="Select depot" /></SelectTrigger>
                <SelectContent>{depots.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Route</Label>
              <Select value={adminForm.routeId} onValueChange={v => setAdminForm(f => ({ ...f, routeId: v }))} disabled={!adminForm.depotId}>
                <SelectTrigger className="mt-1 bg-muted border-border"><SelectValue placeholder="Select route" /></SelectTrigger>
                <SelectContent>{filteredRoutes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Password</Label><Input type="password" value={adminForm.password} onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))} className="mt-1 bg-muted border-border" required /></div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display py-5 rounded-xl">Register</Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default SignUpPage;
