import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const RoleProtectedRoute = ({ children, role }) => {
  const { auth } = useAuth();

  if (!auth?.token) return <Navigate to="/login" replace />;

  if (auth?.user?.role !== role) return <Navigate to="/unauthorized" replace />;

  return children;
};

export default RoleProtectedRoute;
