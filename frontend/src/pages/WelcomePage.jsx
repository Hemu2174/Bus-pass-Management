import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bus, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingThemeToggle from "@/components/FloatingThemeToggle";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <FloatingThemeToggle />
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 text-center px-6"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border border-primary/20 mb-8 glow-primary">
          <Bus className="w-12 h-12 text-primary" />
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-4">
          BUS PASS
        </h1>
        <p className="text-lg text-muted-foreground mb-2 font-display tracking-widest uppercase">
          Management System
        </p>
        <p className="text-muted-foreground max-w-md mx-auto mb-12">
          Apply, renew, and manage bus passes. Track routes and payments — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/signin")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg px-8 py-6 rounded-xl glow-primary"
          >
            <LogIn className="mr-2 w-5 h-5" />
            Sign In
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/signup")}
            className="border-border text-foreground hover:bg-muted font-display text-lg px-8 py-6 rounded-xl"
          >
            <UserPlus className="mr-2 w-5 h-5" />
            Sign Up
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
