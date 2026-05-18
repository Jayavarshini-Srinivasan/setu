import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useOnboarding } from "../context/OnboardingContext";
import { useI18n } from "../context/I18nContext";
import API from "../services/api";



/* ── helpers ── */
function scoreColor(score) {
  if (score >= 75) return "#16A34A";
  if (score >= 50) return "#D97706";
  return "#DC2626";
}

function buildAiSummary(p, isProfessional, matchScore, topJob) {
  const role     = isProfessional
    ? (p.professionalRole || "professional")
    : (p.canonicalRole || p.role || "worker");
  const skillCount = isProfessional
    ? (p.professionalSkills?.length || 0)
    : (p.skills?.length || 0);
  const expYears   = isProfessional
    ? (p.experienceDetails?.length || 0)
    : (p.experience || 0);
  const location   = p.location || "India";

  let summary = `${role} based in ${location} with ${skillCount} verified skills`;
  if (expYears > 0) summary += ` and ${expYears} year${expYears !== 1 ? "s" : ""} of experience`;
  summary += ".";

  if (matchScore >= 80 && topJob) {
    summary += ` Strong match for ${topJob.title} (${matchScore}% compatibility).`;
  } else if (matchScore >= 50 && topJob) {
    summary += ` Moderately matched for ${topJob.title} — skill gap present.`;
  } else if (topJob) {
    summary += ` Growing profile — ${topJob.title} match improving.`;
  }

  return summary;
}

function computeProfileReadiness(p, isProfessional, matchScore) {
  let score = 0;

  if (isProfessional) {
    if (p.professionalRole)              score += 20;
    if ((p.professionalSkills?.length || 0) >= 3) score += 25;
    if (p.education?.degree)             score += 15;
    if ((p.experienceDetails?.length || 0) > 0)   score += 15;
    if (p.careerGoal || (p.preferredRoles?.length || 0) > 0) score += 10;
    if (p.linkedin || p.github)          score += 15;
  } else {
    if (p.canonicalRole || p.role)       score += 25;
    if ((p.skills?.length || 0) >= 2)    score += 25;
    if (p.experience)                    score += 20;
    if (p.location)                      score += 15;
    if (p.availability)                  score += 15;
  }

  /* Blend with live match score (30% weight) */
  const blended = Math.round(score * 0.7 + matchScore * 0.3);
  return Math.min(100, blended);
}

export default function ProfileScreen() {

  const { setFullOnboardingData, refreshOnboarding } = useOnboarding();
  const { t } = useI18n();

  const [profile,       setProfile]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [matchLoading,  setMatchLoading]  = useState(false);
  const [matchScore,    setMatchScore]    = useState(0);
  const [topJob,        setTopJob]        = useState(null);
  const [allMissing,    setAllMissing]    = useState([]);

  /* ── Load Firestore profile ── */
  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) { setLoading(false); return; }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        fetchMatchData(data);
      }
    } catch (err) {
      console.log("[ProfileScreen] fetchProfile:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Fetch live match results to derive readiness + missing skills ── */
  const fetchMatchData = async (userData) => {
    try {
      setMatchLoading(true);
      const p              = userData.profile || {};
      const isProfessional = userData.workerType === "professional";

      const payload = {
        role:        isProfessional ? (p.professionalRole || "") : (p.canonicalRole || p.role || ""),
        skills:      isProfessional ? (p.professionalSkills || []) : (p.skills || []),
        location:    p.location || "",
        experience:  isProfessional ? (p.experienceDetails?.length || 0) : (p.experience || 0),
        isProfessional,
      };

      const response = await API.post("/match", payload);
      const jobs     = response.data || [];

      if (jobs.length > 0) {
        setMatchScore(jobs[0].matchScore || 0);
        setTopJob(jobs[0]);

        const missingSet = new Set();
        jobs.forEach((j) => (j.missingSkills || []).forEach((s) => missingSet.add(s)));
        setAllMissing([...missingSet].slice(0, 8));
      }

    } catch (err) {
      console.log("[ProfileScreen] fetchMatchData:", err?.message);
    } finally {
      setMatchLoading(false);
    }
  };

  /* ── Logout ── */
  const handleLogout = async () => {
    try { await signOut(auth); } catch (err) { console.log(err); }
  };

  /* ── Edit profile (re-enter onboarding) ── */
  const handleEditProfile = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;
      await updateDoc(doc(db, "users", user.uid), { onboardingCompleted: false });

      const p = profile.profile || {};
      setFullOnboardingData({
        workerType:        profile.workerType || "",
        language:          "english",
        transcriptHistory: p.transcriptHistory || [],
        role:              p.role || "",
        canonicalRole:     p.canonicalRole || "",
        skills:            p.skills || [],
        experience:        p.experience || 0,
        location:          p.location || "",
        availability:      p.availability || "",
        preferredShift:    p.preferredShift || "",
        professionalRole:  p.professionalRole || "",
        education:         p.education || { degree: "", institution: "", graduationYear: "" },
        professionalSkills:p.professionalSkills || [],
        experienceDetails: p.experienceDetails || [],
        linkedin:          p.linkedin || "",
        github:            p.github || "",
        portfolio:         p.portfolio || "",
        careerGoal:        p.careerGoal || "",
        preferredRoles:    p.preferredRoles || [],
      });
      refreshOnboarding();
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E85D04" />
        <Text style={styles.loadingText}>{t("loadingProfile") || "Loading profile…"}</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text>{t("noProfileFound") || "No profile found"}</Text>
      </View>
    );
  }

  const p              = profile.profile || {};
  const isProfessional = profile.workerType === "professional";
  const role           = isProfessional ? p.professionalRole : (p.canonicalRole || p.role);
  const skills         = isProfessional ? (p.professionalSkills || []) : (p.skills || []);
  const aiSummary      = buildAiSummary(p, isProfessional, matchScore, topJob);
  const readiness      = computeProfileReadiness(p, isProfessional, matchScore);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* ── HEADER CARD ── */}
      <View style={styles.headerCard}>
        <Text style={styles.name}>{role || t("worker") || "Worker"}</Text>
        <Text style={styles.email}>{auth.currentUser?.email}</Text>
        <Text style={styles.locationText}>
          📍 {p.location || t("locationNotSet") || "Location not set"}
        </Text>
        <View style={[styles.typeBadge, isProfessional ? styles.proBadge : styles.labourBadge]}>
          <Text style={styles.typeBadgeText}>
            {isProfessional ? t("professional") || "Professional" : t("labourWorker") || "Labour"}
          </Text>
        </View>
      </View>

      {/* ── AI SUMMARY (dynamic) ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🤖  {t("aiSummary") || "AI Summary"}</Text>
        {matchLoading ? (
          <ActivityIndicator size="small" color="#E85D04" style={{ marginTop: 8 }} />
        ) : (
          <Text style={styles.summaryText}>{aiSummary}</Text>
        )}
      </View>

      {/* ── MATCH READINESS (dynamic) ── */}
      <View style={styles.card}>
        <View style={styles.readinessHeader}>
          <Text style={styles.cardTitle}>📊  {t("matchReadiness") || "Match Readiness"}</Text>
          {topJob && (
            <Text style={styles.topJobLabel}>
              vs. {topJob.title}
            </Text>
          )}
        </View>

        {matchLoading ? (
          <ActivityIndicator size="small" color="#E85D04" style={{ marginTop: 8 }} />
        ) : (
          <>
            <Text style={[styles.readinessScore, { color: scoreColor(readiness) }]}>
              {readiness}%
            </Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${readiness}%`,
                    backgroundColor: scoreColor(readiness),
                  },
                ]}
              />
            </View>
            <Text style={styles.readinessHint}>
              {readiness >= 80
                ? (t("strongProfile") || "Strong profile — ready to apply")
                : readiness >= 50
                ? (t("growingProfile") || "Growing profile — close a few skill gaps")
                : (t("earlyProfile") || "Early stage — complete your profile to improve")}
            </Text>
          </>
        )}
      </View>

      {/* ── MISSING SKILLS ── */}
      {!matchLoading && allMissing.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚠️  {t("skillGaps") || "Skill Gaps"}</Text>
          <Text style={styles.cardSubtitle}>
            {t("skillGapsSubtitle") || "Skills to add to improve your match score"}
          </Text>
          <View style={styles.chipsRow}>
            {allMissing.map((s, i) => (
              <View key={i} style={styles.gapChip}>
                <Text style={styles.gapChipText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── SKILLS ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>✅  {t("skills") || "Skills"}</Text>
        {skills.length === 0 ? (
          <Text style={styles.emptyText}>
            {t("noSkillsAdded") || "No skills added yet"}
          </Text>
        ) : (
          <View style={styles.chipsRow}>
            {skills.map((s, i) => (
              <View key={i} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{s}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ── EXPERIENCE ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💼  {t("experience") || "Experience"}</Text>
        {isProfessional ? (
          (p.experienceDetails || []).length > 0 ? (
            (p.experienceDetails).map((item, i) => (
              <View key={i} style={styles.expItem}>
                <Text style={styles.expRole}>{item.role}</Text>
                <Text style={styles.expMeta}>{item.company} · {item.years} {t("years") || "years"}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>{t("noExperience") || "No experience added"}</Text>
          )
        ) : (
          <Text style={styles.cardValue}>
            {p.experience || 0} {t("years") || "years"}
          </Text>
        )}
      </View>

      {/* ── PROFESSIONAL LINKS ── */}
      {isProfessional && (p.linkedin || p.github || p.portfolio) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔗  {t("professionalLinks") || "Professional Links"}</Text>
          {p.linkedin  && <Text style={styles.linkText}>LinkedIn: {p.linkedin}</Text>}
          {p.github    && <Text style={styles.linkText}>GitHub: {p.github}</Text>}
          {p.portfolio && <Text style={styles.linkText}>Portfolio: {p.portfolio}</Text>}
        </View>
      )}

      {/* ── ACTIONS ── */}
      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <Text style={styles.editButtonText}>
          ✏️  {t("editProfile") || "Edit Profile"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>
          {t("logout") || "Logout"}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    padding: 20,
    backgroundColor: "#F9FAFB",
    paddingBottom: 50,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  loadingText: { color: "#6B7280", fontSize: 14 },

  /* ── Header ── */
  headerCard: {
    backgroundColor: "#111827",
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    textTransform: "capitalize",
    marginBottom: 6,
  },
  email: { color: "#9CA3AF", fontSize: 14, marginBottom: 10 },
  locationText: { color: "#FFFFFF", fontSize: 14, marginBottom: 14 },
  typeBadge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  proBadge:    { backgroundColor: "#1D4ED8" },
  labourBadge: { backgroundColor: "#E85D04" },
  typeBadgeText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },

  /* ── Cards ── */
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 10,
  },
  cardValue: { fontSize: 16, color: "#374151" },
  emptyText: { fontSize: 13, color: "#9CA3AF" },

  /* ── AI Summary ── */
  summaryText: {
    fontSize: 15,
    lineHeight: 23,
    color: "#374151",
  },

  /* ── Readiness ── */
  readinessHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  topJobLabel: { fontSize: 11, color: "#6B7280" },
  readinessScore: {
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 8,
  },
  barTrack: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  barFill: { height: "100%", borderRadius: 4 },
  readinessHint: { fontSize: 13, color: "#6B7280" },

  /* ── Chips ── */
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  skillChipText: { color: "#1D4ED8", fontWeight: "600", fontSize: 13 },
  gapChip: {
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  gapChipText: { color: "#DC2626", fontWeight: "600", fontSize: 13 },

  /* ── Experience ── */
  expItem: { marginBottom: 12 },
  expRole: { fontSize: 15, fontWeight: "bold", color: "#111827", marginBottom: 2 },
  expMeta: { fontSize: 13, color: "#6B7280" },

  /* ── Links ── */
  linkText: { fontSize: 13, color: "#2563EB", marginBottom: 6 },

  /* ── Buttons ── */
  editButton: {
    backgroundColor: "#E85D04",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  editButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },

  logoutButton: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DC2626",
  },
  logoutText: { color: "#DC2626", fontSize: 16, fontWeight: "bold" },
});