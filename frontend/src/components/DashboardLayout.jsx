import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bus, LayoutDashboard, CreditCard, Map, LogOut, RefreshCw, Users, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import ThemeToggle from "@/components/ThemeToggle";

const studentNav = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/student" },
  { icon: Bus, label: "Apply Pass", path: "/dashboard/student/apply" },
  { icon: RefreshCw, label: "Renew Pass", path: "/dashboard/student/renew" },
];

const parentNav = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/parent" },
  { icon: Map, label: "Route Map", path: "/dashboard/parent/map" },
];

const adminNav = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/admin" },
  { icon: Users, label: "Students", path: "/dashboard/admin/students" },
];

const navMap = { student: studentNav, parent: parentNav, admin: adminNav };

const SidebarContent = ({ nav, location, navigate, displayName, role, handleLogout, onNavClick }) => (
  <>
    <div className="p-4 flex items-center gap-3 border-b border-border">
      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <Bus className="w-5 h-5 text-primary" />
      </div>
      <span className="font-display font-bold text-sm tracking-wide">BUS PASS</span>
    </div>

    <nav className="flex-1 py-4 space-y-1 px-2">
      {nav.map(item => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => { navigate(item.path); onNavClick?.(); }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors ${
              active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>

    <div className="p-3 border-t border-border">
      <ThemeToggle />
      <div className="flex items-center gap-3 px-3 py-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-xs font-bold">
          {displayName.charAt(0)}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground capitalize">{role}</p>
        </div>
      </div>
      <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-muted-foreground hover:text-destructive">
        <LogOut className="w-4 h-4 mr-2" /><span>Logout</span>
      </Button>
    </div>
  </>
);

const DashboardLayout = ({ children }) => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const nav = navMap[role] || [];

  const handleLogout = () => { logout(); navigate("/"); };
  const displayName = user && "name" in user ? user.name : user && "fatherName" in user ? user.fatherName : "User";

  const sidebarProps = { nav, location, navigate, displayName, role: role || "", handleLogout };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile top bar */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-card border-b border-border flex items-center px-4 gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-card border-border flex flex-col">
              <SidebarContent {...sidebarProps} onNavClick={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-sm tracking-wide">BUS PASS</span>
          </div>
        </header>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0 sticky top-0 h-screen">
          <SidebarContent {...sidebarProps} />
        </aside>
      )}

      {/* Main */}
      <main className={`flex-1 overflow-auto ${isMobile ? "pt-14" : ""}`}>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
