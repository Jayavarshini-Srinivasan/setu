import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { mapUserDocToOnboardingData, useOnboarding } from "../context/OnboardingContext";
import { useI18n } from "../context/I18nContext";
import API from "../services/api";
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

/* ── helpers ── */
function scoreColor(score) {
  if (score >= 75) return "#16A34A";
  if (score >= 50) return "#D97706";
  return "#DC2626";
}

function buildAiSummary(p, isProfessional, matchScore, topJob, t) {
  const role = isProfessional
    ? (p.professionalRole || t("professional") || "professional")
    : (t("roles." + (p.canonicalRole || p.role)) || p.canonicalRole || p.role || t("worker") || "worker");
  const skillCount = isProfessional
    ? (p.professionalSkills?.length || 0)
    : (p.skills?.length || 0);
  const expYears = isProfessional
    ? (p.experienceDetails?.length || 0)
    : (p.experience || 0);
  const location = p.location || t("india") || "India";

  let summary = `${role} based in ${location} with ${skillCount} verified skills`;
  if (expYears > 0) summary += ` and ${expYears} years of experience`;
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

  const blended = Math.round(score * 0.7 + matchScore * 0.3);
  return Math.min(100, blended);
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { onboardingRefresh, refreshOnboarding, setFullOnboardingData } = useOnboarding();
  const { t, language, changeLanguage } = useI18n();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [topJob, setTopJob] = useState(null);
  const [allMissing, setAllMissing] = useState([]);

  // Interactive settings state
  const [voiceGuidance, setVoiceGuidance] = useState(true);
  const [literacyMode, setLiteracyMode] = useState(false);
  const [jobAlerts, setJobAlerts] = useState(true);

  /* ── Load Firestore profile ── */
  useEffect(() => { fetchProfile(); }, [onboardingRefresh]);

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
      const p = userData.profile || {};
      const isProfessional = userData.workerType === "professional";

      const payload = {
        role: isProfessional ? (p.professionalRole || "") : (p.canonicalRole || p.role || ""),
        skills: isProfessional ? (p.professionalSkills || []) : (p.skills || []),
        location: p.location || "",
        experience: isProfessional ? (p.experienceDetails?.length || 0) : (p.experience || 0),
        isProfessional,
        language,
      };

      const response = await API.post("/match", payload);
      const jobs = response.data || [];

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

  /* ── Create fresh profile (re-enter onboarding blank) ── */
  const getDisplayName = () => {
    const p = profile?.profile || {};
    const emailName = auth.currentUser?.email?.split("@")[0] || "User";
    const rawName = p.fullName || p.name || p.resumeSummary?.split("|")[0] || emailName;
    return rawName
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getInitials = (displayName) => {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (displayName.length >= 2) {
      return displayName.slice(0, 2).toUpperCase();
    }
    if (displayName.length === 1) {
      return (displayName + "S").toUpperCase();
    }
    return "PS";
  };

  const handleEditProfile = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const userData = snap.data();
        setFullOnboardingData(mapUserDocToOnboardingData(userData, user));
      }
      await updateDoc(userRef, { onboardingCompleted: false });
      refreshOnboarding();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Get Name & Initials ── */
  const name = getDisplayName();
  const initials = getInitials(name);

  const getLanguageLabel = () => {
    if (language === "en") return "English";
    if (language === "hi") return "Hindi";
    if (language === "ta") return "Tamil";
    return "English";
  };

  const handleLanguageToggle = () => {
    if (language === "en") changeLanguage("hi");
    else if (language === "hi") changeLanguage("ta");
    else changeLanguage("en");
  };

  const handleDownloadCV = () => {
    if (profile.workerType === "professional") {
      navigation.navigate("Resume");
    } else {
      Alert.alert(
        t("downloadCV") || "Download CV",
        t("cvDownloaded") || "Your Profile Card CV has been generated and saved successfully!"
      );
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

  const p = profile.profile || {};
  const isProfessional = profile.workerType === "professional";
  const role = isProfessional ? p.professionalRole : (p.canonicalRole || p.role);
  const skills = isProfessional ? (p.professionalSkills || []) : (p.skills || []);
  const aiSummary = buildAiSummary(p, isProfessional, matchScore, topJob, t);
  const readiness = computeProfileReadiness(p, isProfessional, matchScore);
  const subtitleInfo = isProfessional ? (p.education?.degree || "Professional") : (t("roles." + role) || role || "Worker");

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER CARD (Solid Premium Blue Card with Rounded Bottom Corners) ── */}
      <View style={styles.headerCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.nameText} numberOfLines={1}>{name}</Text>
            <Text style={styles.subtitleText} numberOfLines={1}>{subtitleInfo}</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              📍 {p.location || t("locationNotSet") || "Location not set"}
            </Text>
          </View>
        </View>

        {/* Readiness progress container */}
        <View style={styles.readinessContainer}>
          <View style={styles.readinessTextRow}>
            <Text style={styles.readinessLabel}>PROFILE READINESS</Text>
            <Text style={styles.readinessPercent}>{readiness}% COMPLETE</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${readiness}%` }]} />
          </View>
        </View>
      </View>

      {/* ── ACTION BUTTON ROW (Edit Profile & Download CV Side-by-Side) ── */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.editOutlineBtn} 
          onPress={handleEditProfile}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={18} color="#E85D04" style={{ marginRight: 6 }} />
          <Text style={styles.editOutlineText}>
            {t("editProfile") || "Edit Profile"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.downloadSolidBtn} 
          onPress={handleDownloadCV}
          activeOpacity={0.8}
        >
          <Ionicons name="download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.downloadSolidText}>Download CV</Text>
        </TouchableOpacity>
      </View>

      {/* ── PROFILE INFO / SUMMARY SECTION ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🤖 {t("aiSummary") || "AI Summary"}</Text>
        {matchLoading ? (
          <ActivityIndicator size="small" color="#E85D04" style={{ marginTop: 8 }} />
        ) : (
          <Text style={styles.summaryText}>{aiSummary}</Text>
        )}
      </View>

      {/* ── SKILLS & LANGUAGES TAG CLOUDS (Light green background, green text chips) ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚡ Skills & Languages</Text>
        
        {skills.length === 0 ? (
          <Text style={styles.emptyText}>{t("noSkillsAdded") || "No skills added yet"}</Text>
        ) : (
          <View style={styles.chipsCloud}>
            {/* Render language tag */}
            <View style={styles.greenChip}>
              <Text style={styles.greenChipText}>🗣️ {getLanguageLabel()}</Text>
            </View>
            
            {/* Render skills */}
            {skills.map((s, i) => (
              <View key={i} style={styles.greenChip}>
                <Text style={styles.greenChipText}>{t(`skills.${s}`) || s}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ── EXPERIENCE SECTION ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💼 {t("experience") || "Experience"}</Text>
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

      {/* ── SKILL GAPS / MISSING SKILLS ── */}
      {!matchLoading && allMissing.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚠️ {t("skillGaps") || "Skill Gaps"}</Text>
          <Text style={styles.cardSubtitle}>
            {t("skillGapsSubtitle") || "Skills to add to improve your match score"}
          </Text>
          <View style={styles.chipsRow}>
            {allMissing.map((s, i) => (
              <View key={i} style={styles.gapChip}>
                <Text style={styles.gapChipText}>{t(`skills.${s}`) || s}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── SETTINGS / OPTIONS LIST (Interactive rows with Chevron arrows) ── */}
      <View style={styles.settingsContainer}>
        <Text style={styles.settingsTitle}>Preferences & Settings</Text>

        {/* Preferred Language */}
        <TouchableOpacity style={styles.settingRow} onPress={handleLanguageToggle} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconBg, { backgroundColor: "#EBF5FF" }]}>
              <Ionicons name="language-outline" size={20} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.settingLabel}>Preferred Language</Text>
              <Text style={styles.settingSubtext}>Tap to change translation</Text>
            </View>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingStatusText}>{getLanguageLabel()}</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Voice Guidance */}
        <TouchableOpacity style={styles.settingRow} onPress={() => setVoiceGuidance(!voiceGuidance)} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconBg, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons name={voiceGuidance ? "volume-medium-outline" : "volume-mute-outline"} size={20} color="#10B981" />
            </View>
            <View>
              <Text style={styles.settingLabel}>Voice Guidance</Text>
              <Text style={styles.settingSubtext}>Hear instructions read aloud</Text>
            </View>
          </View>
          <View style={styles.settingRight}>
            <Text style={[styles.settingStatusText, { color: voiceGuidance ? "#10B981" : "#6B7280" }]}>
              {voiceGuidance ? "ON" : "OFF"}
            </Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Literacy Mode */}
        <TouchableOpacity style={styles.settingRow} onPress={() => setLiteracyMode(!literacyMode)} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconBg, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="book-outline" size={20} color="#D97706" />
            </View>
            <View>
              <Text style={styles.settingLabel}>Literacy Mode</Text>
              <Text style={styles.settingSubtext}>Simplified text and layout assistance</Text>
            </View>
          </View>
          <View style={styles.settingRight}>
            <Text style={[styles.settingStatusText, { color: literacyMode ? "#D97706" : "#6B7280" }]}>
              {literacyMode ? "ON" : "OFF"}
            </Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Job Alerts */}
        <TouchableOpacity style={styles.settingRow} onPress={() => setJobAlerts(!jobAlerts)} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconBg, { backgroundColor: "#FDF2F8" }]}>
              <Ionicons name={jobAlerts ? "notifications-outline" : "notifications-off-outline"} size={20} color="#DB2777" />
            </View>
            <View>
              <Text style={styles.settingLabel}>Job Alerts</Text>
              <Text style={styles.settingSubtext}>Get notifications for new matches</Text>
            </View>
          </View>
          <View style={styles.settingRight}>
            <Text style={[styles.settingStatusText, { color: jobAlerts ? "#DB2777" : "#6B7280" }]}>
              {jobAlerts ? "ON" : "OFF"}
            </Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Logout button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 6 }} />
        <Text style={styles.logoutText}>{t("logout") || "Logout"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    paddingBottom: 50,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
  },
  loadingText: { 
    color: "#6B7280", 
    fontSize: 14,
  },

  /* ── Header Card (Sleek Blue, rounded bottom corners) ── */
  headerCard: {
    backgroundColor: "#2563EB", // Primary theme blue
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...SHADOWS.lg,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    ...SHADOWS.card,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2563EB",
  },
  headerInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 14,
    color: "#BFDBFE",
    fontWeight: "600",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "500",
  },

  /* ── Readiness progress inside header card ── */
  readinessContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 14,
    padding: 16,
  },
  readinessTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  readinessLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#BFDBFE",
    letterSpacing: 0.8,
  },
  readinessPercent: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10B981", // bright green success color
    borderRadius: 3,
  },

  /* ── Action buttons side-by-side ── */
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 10,
    gap: 12,
  },
  editOutlineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E85D04", // Accent color orange
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  editOutlineText: {
    color: "#E85D04",
    fontSize: 15,
    fontWeight: "700",
  },
  downloadSolidBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E3A8A", // Premium deep blue
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 12,
    ...SHADOWS.card,
  },
  downloadSolidText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  /* ── Content cards ── */
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...SHADOWS.card,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 12,
  },
  cardValue: { 
    fontSize: 16, 
    fontWeight: "600",
    color: "#374151",
  },
  emptyText: { 
    fontSize: 13, 
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4B5563",
    fontWeight: "500",
  },

  /* ── Green skills tag cloud ── */
  chipsCloud: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  greenChip: {
    backgroundColor: "#E6F4EA", // Light green background
    borderWidth: 0.5,
    borderColor: "#A3F5B8",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  greenChipText: {
    color: "#137333", // Dark green text
    fontWeight: "600",
    fontSize: 13,
  },

  /* ── Skill gaps / missing ── */
  chipsRow: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 8,
  },
  gapChip: {
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  gapChipText: { 
    color: "#DC2626", 
    fontWeight: "600", 
    fontSize: 13,
  },

  /* ── Experience items ── */
  expItem: { 
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  expRole: { 
    fontSize: 15, 
    fontWeight: "700", 
    color: "#111827", 
    marginBottom: 4,
  },
  expMeta: { 
    fontSize: 13, 
    color: "#6B7280",
    fontWeight: "500",
  },

  /* ── Settings list ── */
  settingsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    ...SHADOWS.card,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  settingSubtext: {
    fontSize: 11,
    color: "#6B7280",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  settingStatusText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },

  /* ── Logout Button ── */
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: "#DC2626",
    ...SHADOWS.card,
  },
  logoutText: { 
    color: "#DC2626", 
    fontSize: 15, 
    fontWeight: "700",
  },
});
