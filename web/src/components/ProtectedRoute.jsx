import { Navigate, Outlet } from "react-router-dom";
import  useAuth  from "../hooks/useAuth";
import Navbar from "./Navbar";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <Outlet />
      </div>
    </div>
  );
}
