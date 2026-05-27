import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getInsights } from "../services/insightsService";
import { handleError } from "../utils/errorHandler";
import LoadingSpinner from "../components/LoadingSpinner";

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await getInsights();
        setInsights(data);
      } catch (err) {
        setError(handleError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) return <LoadingSpinner text="Generating AI Insights..." />;

  if (error) {
    return (
      <div style={{ backgroundColor: "#F9F8F6", minHeight: "100vh", padding: "40px", fontFamily: "Inter, sans-serif", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "100px auto", backgroundColor: "#FFFFFF", padding: "32px", borderRadius: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ color: "#EF4444", margin: "0 0 12px 0", fontFamily: "Georgia, serif" }}>Failed to Load AI Insights</h2>
          <p style={{ color: "#6B7280", margin: "0 0 24px 0", lineHeight: "1.5" }}>{error.message || "An unexpected error occurred while processing pipeline insights."}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ backgroundColor: "#EA580C", color: "#FFFFFF", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalApplicants = insights?.totalApplicants || 0;
  const topCandidates = insights?.topCandidates || [];
  const skillGaps = insights?.topSkillGaps || [];
  const recommendations = insights?.recommendations || [];

  if (totalApplicants === 0) {
    return (
      <div style={{ backgroundColor: "#F9F8F6", minHeight: "100vh", padding: "40px", fontFamily: "Inter, sans-serif" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* HEADER */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <h1 style={{ margin: 0, fontSize: "36px", fontFamily: "Georgia, serif", color: "#111827" }}>
                AI Insights
              </h1>
              <span style={{ 
                backgroundColor: "#FEF3C7", 
                color: "#D97706", 
                fontSize: "12px", 
                fontWeight: "bold", 
                padding: "4px 8px", 
                borderRadius: "4px",
                letterSpacing: "0.5px"
              }}>
                BETA
              </span>
            </div>
            <p style={{ margin: 0, color: "#6B7280", fontSize: "16px" }}>
              Intelligent hiring recommendations powered by AI
            </p>
          </div>

          {/* EMPTY STATE CONTAINER */}
          <div style={{ 
            backgroundColor: "#FFFFFF", 
            borderRadius: "16px", 
            padding: "60px 40px", 
            textAlign: "center",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px"
          }}>
            <div style={{ fontSize: "64px" }}>✨</div>
            <h2 style={{ margin: 0, fontSize: "24px", color: "#111827", fontFamily: "Georgia, serif" }}>
              Ready to Discover Smart Insights?
            </h2>
            <p style={{ margin: 0, color: "#6B7280", fontSize: "16px", maxWidth: "600px", lineHeight: "1.6" }}>
              AI Insights calculates candidate matching scores, analyzes pipeline composition, flags talent skill gaps, and generates tailored hiring recommendations in real-time.
            </p>
            <p style={{ margin: 0, color: "#D97706", fontWeight: "600", fontSize: "14px", backgroundColor: "#FEF3C7", padding: "8px 16px", borderRadius: "20px" }}>
              💡 Post a job and receive your first applicant to see AI Insights in action!
            </p>
            <div style={{ marginTop: "12px" }}>
              <Link to="/jobs" style={{ 
                backgroundColor: "#EA580C", 
                color: "#FFFFFF", 
                textDecoration: "none", 
                padding: "12px 24px", 
                borderRadius: "8px", 
                fontWeight: "600",
                fontSize: "15px",
                boxShadow: "0 4px 6px -1px rgba(234, 88, 12, 0.2)"
              }}>
                Manage My Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#F9F8F6", minHeight: "100vh", padding: "40px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <h1 style={{ margin: 0, fontSize: "36px", fontFamily: "Georgia, serif", color: "#111827" }}>
              AI Insights
            </h1>
            <span style={{ 
              backgroundColor: "#FEF3C7", 
              color: "#D97706", 
              fontSize: "12px", 
              fontWeight: "bold", 
              padding: "4px 8px", 
              borderRadius: "4px",
              letterSpacing: "0.5px"
            }}>
              BETA
            </span>
          </div>
          <p style={{ margin: 0, color: "#6B7280", fontSize: "16px" }}>
            Intelligent hiring recommendations powered by AI
          </p>
        </div>

        {/* TOP ROW: CANDIDATES AND SKILLS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          
          {/* Top Candidates */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", fontWeight: "bold", color: "#374151" }}>
              🏆 <span>Top Candidates in Your Pipeline</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {topCandidates.length === 0 ? (
                <p style={{ margin: 0, color: "#6B7280", fontSize: "14px", fontStyle: "italic" }}>No candidate matches computed yet.</p>
              ) : (
                topCandidates.map((candidate, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ 
                      width: "40px", height: "40px", borderRadius: "50%", 
                      backgroundColor: "#E0F2FE", color: "#0369A1", 
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: "bold", fontSize: "14px", border: "1px solid #BAE6FD"
                    }}>
                      {candidate.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontWeight: "600", color: "#111827", fontSize: "15px" }}>
                          {candidate.name}
                          <span style={{ fontWeight: "normal", color: "#6B7280", fontSize: "12px", marginLeft: "8px" }}>
                            ({candidate.jobTitle})
                          </span>
                        </span>
                        <span style={{ fontWeight: "600", color: candidate.color, fontSize: "15px" }}>{candidate.score}%</span>
                      </div>
                      <div style={{ width: "100%", backgroundColor: "#F3F4F6", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${candidate.score}%`, backgroundColor: candidate.color, height: "100%", borderRadius: "3px" }} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Skill Gap Trends */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", fontWeight: "bold", color: "#374151" }}>
              📊 <span>Skill Gap Trends</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              {skillGaps.length === 0 ? (
                <div style={{ padding: "20px 0", textAlign: "center" }}>
                  <p style={{ margin: 0, color: "#10B981", fontSize: "14px", fontWeight: "600" }}>🎉 Perfect Alignment!</p>
                  <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "13px" }}>Candidates match all required skills perfectly.</p>
                </div>
              ) : (
                skillGaps.map((skill, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontWeight: "500", color: "#111827", fontSize: "14px" }}>{skill.skill}</span>
                      <span style={{ color: "#6B7280", fontSize: "13px" }}>{skill.percentage}% candidates lack this</span>
                    </div>
                    <div style={{ width: "100%", backgroundColor: "#F3F4F6", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${skill.percentage}%`, backgroundColor: "#EA580C", height: "100%", borderRadius: "3px" }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* BOTTOM ROW: HIRING RECOMMENDATIONS */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", fontWeight: "bold", color: "#374151" }}>
            🤖 <span>Hiring Recommendations</span>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            {recommendations.length === 0 ? (
              <p style={{ margin: 0, color: "#6B7280", fontSize: "14px", fontStyle: "italic", gridColumn: "span 3" }}>No hiring recommendations available yet.</p>
            ) : (
              recommendations.map((rec, idx) => (
                <div key={idx} style={{ 
                  backgroundColor: "#F0F9FF", 
                  border: "1px solid #BAE6FD", 
                  borderRadius: "12px", 
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}>
                  <div style={{ fontSize: "24px", backgroundColor: "#FFFFFF", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    {rec.icon}
                  </div>
                  <h3 style={{ margin: 0, fontSize: "16px", color: "#0369A1", fontWeight: "600" }}>{rec.title}</h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#075985", lineHeight: "1.5" }}>{rec.desc}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
