import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import PageTransition from "./PageTransition";
import ProtectedRoute from "./ProtectedRoute";

interface AppLayoutProps {
  requiredRole?: string;
  requiredRoles?: string[];
}

const AppLayout = ({ requiredRole, requiredRoles }: AppLayoutProps) => (
  <ProtectedRoute requiredRole={requiredRole} requiredRoles={requiredRoles}>
    <DashboardLayout>
      <PageTransition>
        <Outlet />
      </PageTransition>
    </DashboardLayout>
  </ProtectedRoute>
);

export default AppLayout;
