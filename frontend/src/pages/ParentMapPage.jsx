import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataApi } from "@/api/apiService";
import DashboardLayout from "@/components/DashboardLayout";
import RouteMapView from "@/components/RouteMapView";
import { Loader2 } from "lucide-react";

const ParentMapPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [children, setChildren] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      try {
        const [childrenRes, routesRes] = await Promise.all([
          dataApi.getStudentsByParent(user.id),
          dataApi.getRoutes(),
        ]);
        setChildren(childrenRes || []);
        setRoutes(routesRes || []);
      } catch {
        setError("Failed to load route map data");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user?.id]);

  const firstChildRoute = children[0]?.routeId;

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

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-display font-bold mb-1">Route Map</h1>
      <p className="text-muted-foreground mb-8">View bus routes for your children</p>
      <RouteMapView routeId={firstChildRoute} routes={routes} />
    </DashboardLayout>
  );
};

export default ParentMapPage;
