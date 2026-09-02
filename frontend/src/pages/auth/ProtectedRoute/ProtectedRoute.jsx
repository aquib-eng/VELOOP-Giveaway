import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

function ProtectedRoute() {
  const { user, token, loading } = useAuth();

  console.log("ProtectedRoute:", {
    user,
    token,
    loading,
  });

  // Wait until authentication is checked
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
        }}
      >
        Loading...
      </div>
    );
  }

  // User is not authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated
  return <Outlet />;
}

export default ProtectedRoute;