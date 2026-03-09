import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataApi } from "@/api/apiService";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Loader2, Pencil, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

const emptyForm = {
  id: null,
  name: "",
  email: "",
  phone: "",
  parentId: "",
  routeId: "",
  password: "",
};

const AdminStudentsPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [busPasses, setBusPasses] = useState([]);
  const [parents, setParents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    try {
      const [studentsRes, passesRes, parentsRes, routesRes] = await Promise.all([
        dataApi.getStudents(),
        dataApi.getBusPasses(),
        dataApi.getParents(),
        dataApi.getRoutes(),
      ]);
      setStudents(Array.isArray(studentsRes) ? studentsRes : []);
      setBusPasses(Array.isArray(passesRes) ? passesRes : []);
      setParents(Array.isArray(parentsRes) ? parentsRes : []);
      setRoutes(Array.isArray(routesRes) ? routesRes : []);
      setError(null);
    } catch (err) {
      setError(err?.message || "Failed to load students data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const admin = user;
  const managedStudents = students;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return managedStudents.filter((s) => {
      const pass = busPasses.find(p => p.studentId === s.id);
      const parent = parents.find(p => p.id === s.parentId);
      const passStatus = pass?.status || "NOT_PURCHASED";

      // Search filter
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        s.name.toLowerCase().includes(q) ||
        (parent?.fatherName || "").toLowerCase().includes(q) ||
        (routes.find(r => r.id === s.routeId)?.name || "").toLowerCase().includes(q);

      // Status filter
      const matchesStatus = statusFilter === "all" || passStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [managedStudents, busPasses, parents, routes, search, statusFilter]);

  const openCreate = () => {
    setForm({ ...emptyForm, routeId: admin?.routeId || "", parentId: parents[0]?.id || "" });
    setDialogOpen(true);
  };

  const openEdit = (student) => {
    setForm({
      id: student.id,
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      parentId: student.parentId || "",
      routeId: student.routeId || "",
      password: "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.parentId || !form.routeId) {
      toast.error("Name, email, parent and route are required");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        parentId: form.parentId,
        routeId: form.routeId,
        ...(form.password.trim() ? { password: form.password.trim() } : {}),
      };

      if (form.id) {
        await dataApi.updateStudent(form.id, payload);
        toast.success("Student updated");
      } else {
        await dataApi.createStudent(payload);
        toast.success("Student created");
      }

      setDialogOpen(false);
      setForm(emptyForm);
      await loadData();
    } catch (err) {
      toast.error(err?.message || "Failed to save student");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (studentId) => {
    const confirmed = window.confirm("Delete this student? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await dataApi.deleteStudent(studentId);
      toast.success("Student deleted");
      await loadData();
    } catch (err) {
      toast.error(err?.message || "Failed to delete student");
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

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">Users Management</h1>
          <p className="text-muted-foreground">Create, edit, and delete student user details</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground rounded-xl">
          <UserPlus className="w-4 h-4 mr-2" /> Add Student
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, parent, or route..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-card border-border">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
            <SelectItem value="NOT_PURCHASED">Not Purchased</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-4 font-medium">Student</th>
                <th className="text-left p-4 font-medium">Parent</th>
                <th className="text-left p-4 font-medium">Route</th>
                <th className="text-left p-4 font-medium">Pass Status</th>
                <th className="text-left p-4 font-medium">Payment</th>
                <th className="text-left p-4 font-medium">Months</th>
                <th className="text-left p-4 font-medium">Expiry</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No students match your search</td></tr>
              ) : filtered.map(s => {
                const pass = busPasses.find(p => p.studentId === s.id);
                const parent = parents.find(p => p.id === s.parentId);
                const route = routes.find(r => r.id === s.routeId);
                return (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-4 font-medium">{s.name}</td>
                    <td className="p-4">{parent?.fatherName || "—"}</td>
                    <td className="p-4">{route?.name || "—"}</td>
                    <td className="p-4"><StatusBadge status={pass?.status || "NOT_PURCHASED"} /></td>
                    <td className="p-4"><StatusBadge status={pass ? "SUCCESS" : "PENDING"} /></td>
                    <td className="p-4">{pass?.months || "—"}</td>
                    <td className="p-4">{pass?.expiryDate || "—"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                          <Pencil className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Student" : "Create Student"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Parent</Label>
              <Select value={form.parentId} onValueChange={(value) => setForm((prev) => ({ ...prev, parentId: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select parent" />
                </SelectTrigger>
                <SelectContent>
                  {parents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.fatherName} ({parent.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Route</Label>
              <Select value={form.routeId} onValueChange={(value) => setForm((prev) => ({ ...prev, routeId: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{form.id ? "New Password (optional)" : "Password (optional)"}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                className="mt-1"
                placeholder={form.id ? "Leave blank to keep existing" : "Defaults to password123 if blank"}
              />
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="w-full bg-primary text-primary-foreground rounded-xl">
              {isSaving ? "Saving..." : form.id ? "Update Student" : "Create Student"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminStudentsPage;
