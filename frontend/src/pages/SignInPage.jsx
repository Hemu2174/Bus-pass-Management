import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import FloatingThemeToggle from "@/components/FloatingThemeToggle";

const roles = [
  { key: "student", label: "Student", icon: GraduationCap, color: "text-primary" },
  { key: "parent", label: "Parent", icon: Users, color: "text-secondary" },
  { key: "admin", label: "Admin", icon: Shield, color: "text-info" },
];

const SignInPage = () => {
  const navigate = useNavigate();
  const { loginStudent, loginParent, loginAdmin } = useAuth();
  const [role, setRole] = useState(null);
  const [form, setForm] = useState({ email: "", password: "", fatherName: "", adminName: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    let success = false;
    if (role === "student") success = await loginStudent(form.email, form.password);
    else if (role === "parent") success = await loginParent(form.email, form.password, form.fatherName);
    else if (role === "admin") success = await loginAdmin(form.adminName, form.password);

    if (success) {
      toast.success("Login successful!");
      navigate(`/dashboard/${role}`);
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <FloatingThemeToggle />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Button variant="ghost" onClick={() => role ? setRole(null) : navigate("/")} className="mb-6 text-muted-foreground">
          <ArrowLeft className="mr-2 w-4 h-4" /> {role ? "Change Role" : "Back"}
        </Button>

        <h1 className="text-3xl font-display font-bold mb-2">Sign In</h1>

        {!role ? (
          <>
            <p className="text-muted-foreground mb-8">Who is logging in?</p>
            <div className="grid gap-4">
              {roles.map(r => (
                <button
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  className="glass-card p-5 flex items-center gap-4 hover:border-primary/40 transition-colors text-left"
                >
                  <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${r.color}`}>
                    <r.icon className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-display font-medium">{r.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5 mt-6">
            <p className="text-muted-foreground mb-4">Logging in as <span className="text-primary font-medium capitalize">{role}</span></p>

            {role === "admin" ? (
              <div>
                <Label>Admin Name</Label>
                <Input value={form.adminName} onChange={e => setForm(f => ({ ...f, adminName: e.target.value }))} placeholder="Admin name" className="mt-1 bg-muted border-border" />
              </div>
            ) : (
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" className="mt-1 bg-muted border-border" />
              </div>
            )}

            {role === "parent" && (
              <div>
                <Label>Father Name</Label>
                <Input value={form.fatherName} onChange={e => setForm(f => ({ ...f, fatherName: e.target.value }))} placeholder="Father's name" className="mt-1 bg-muted border-border" />
              </div>
            )}

            <div>
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="mt-1 bg-muted border-border" />
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-base py-5 rounded-xl">
              Sign In
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default SignInPage;
