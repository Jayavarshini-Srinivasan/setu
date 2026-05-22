import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Layout from "./Layout";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", background:"#EDE8DC" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:40, height:40, border:"3px solid #E85D04", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite", margin:"0 auto 12px" }} />
          <p style={{ color:"#6B7280", fontSize:13 }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Layout />;
}
