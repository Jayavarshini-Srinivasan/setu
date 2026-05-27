import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useOnboarding } from "../context/OnboardingContext";
import API from "../services/api";
import { useI18n } from "../context/I18nContext";
import { COLORS, BORDER_RADIUS, SHADOWS } from "../constants/theme";

function getGreeting(t) {
  const hour = new Date().getHours();
  if (hour < 12) return t("greetingMorning") || "Good morning";
  if (hour < 17) return t("greetingAfternoon") || "Good afternoon";
  return t("greetingEvening") || "Good evening";
}

function getInitials(name) {
  if (!name) return "PS";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function computeProfileReadiness(p, isProfessional, matchScore) {
  let score = 0;
  if (isProfessional) {
    if (p.professionalRole) score += 20;
    if ((p.professionalSkills?.length || 0) >= 3) score += 25;
    if (p.education?.degree) score += 15;
    if ((p.experienceDetails?.length || 0) > 0) score += 15;
    if (p.careerGoal || (p.preferredRoles?.length || 0) > 0) score += 10;
    if (p.linkedin || p.github) score += 15;
  } else {
    if (p.canonicalRole || p.role) score += 25;
    if ((p.skills?.length || 0) >= 2) score += 25;
    if (p.experience) score += 20;
    if (p.location) score += 15;
    if (p.availability) score += 15;
  }
  return Math.min(100, Math.round(score * 0.7 + matchScore * 0.3));
}

function formatSalary(salary) {
  if (!salary) return "₹3.5L/yr";
  const n = parseInt(salary, 10);
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L/yr`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K/mo`;
  return `₹${n}/yr`;
}

function matchBadgeStyle(score) {
  if (score >= 85) return { bg: COLORS.matchGreenBg, text: COLORS.successText };
  if (score >= 75) return { bg: COLORS.accentLight, text: COLORS.accent };
  return { bg: "#F3F4F6", text: COLORS.textSecondary };
}

function formatLabourSalary(salary) {
  if (!salary) return "₹600/day";
  const n = parseInt(salary, 10);
  if (n < 10000) return `₹${n}/day`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L/yr`;
  return `₹${Math.round(n / 1000)}K/mo`;
}

function getLabourJobIcon(title = "") {
  const t = title.toLowerCase();
  if (t.includes("delivery") || t.includes("driver")) return "🛵";
  if (t.includes("electric")) return "⚡";
  if (t.includes("plumb")) return "🔧";
  if (t.includes("helper") || t.includes("construction")) return "🧱";
  if (t.includes("security")) return "🛡️";
  return "👷";
}

function getLabourIconBg(title = "") {
  const t = title.toLowerCase();
  if (t.includes("delivery")) return "#FCE7F3";
  if (t.includes("electric")) return "#FFEDD5";
  if (t.includes("helper")) return "#E5E7EB";
  return "#FFF7ED";
}

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [topJobs, setTopJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [matchCount, setMatchCount] = useState(0);
  const [appliedCount, setAppliedCount] = useState(0);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const { t, language } = useI18n();
  const { user } = useAuth();
  const { onboardingRefresh } = useOnboarding();

  useEffect(() => {
    let cancelled = false;

    setProfile(null);
    setNotifications([]);
    setTopJobs([]);
    setAllJobs([]);
    setMatchCount(0);
    setLoading(true);

    if (!user?.uid) {
      setLoading(false);
      return undefined;
    }

    fetchProfile(user, () => cancelled);

    const notifQuery = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
      if (cancelled) return;
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setNotifications(list);
    }, (error) => {
      if (error?.code !== "permission-denied") {
        console.log("NOTIF LISTEN ERROR:", error);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user?.uid, language, onboardingRefresh]);

  useEffect(() => {
    if (!user?.uid) {
      setAppliedCount(0);
      setShortlistedCount(0);
      return undefined;
    }

    const appsQuery = query(
      collection(db, "applications"),
      where("workerId", "==", user.uid)
    );

    const unsubApps = onSnapshot(appsQuery, (snapshot) => {
      let applied = 0;
      let shortlisted = 0;
      snapshot.forEach((docSnap) => {
        applied += 1;
        const status = docSnap.data().status;
        if (status === "shortlisted") shortlisted += 1;
      });
      setAppliedCount(applied);
      setShortlistedCount(shortlisted);
    }, () => {});

    return () => unsubApps();
  }, [user?.uid]);

  const handleMarkAsRead = async (notifId) => {
    try {
      if (!user?.uid) return;
      const notifRef = doc(db, "users", user.uid, "notifications", notifId);
      await updateDoc(notifRef, { status: "read" });
    } catch (err) {
      console.log("MARK READ ERROR:", err);
    }
  };

  const getNotifTitle = () => t("notificationsTitle") || "Notifications";

  const fetchTopMatches = async (userData, activeUser, isCancelled) => {
    try {
      if (!activeUser?.uid) return;

      const profileData = userData.profile || {};
      const isProfessional = userData.workerType === "professional";
      const role = isProfessional
        ? (profileData.professionalRole || "")
        : (profileData.canonicalRole || profileData.role || "");
      const skills = isProfessional
        ? (profileData.professionalSkills || [])
        : (profileData.skills || []);
      const experience = isProfessional
        ? (profileData.experienceDetails?.length || 0)
        : (profileData.experience || 0);

      const response = await API.post("/match", {
        workerId: activeUser.uid,
        role,
        skills,
        location: profileData.location || "",
        experience,
        isProfessional,
        language,
      });
      const jobs = response.data || [];
      if (isCancelled()) return;
      setAllJobs(jobs);
      setMatchCount(jobs.length);
      setTopJobs(jobs.slice(0, 2));
    } catch (err) {
      console.log("HOME MATCH FETCH:", err?.message);
    }
  };

  const fetchProfile = async (activeUser, isCancelled = () => false) => {
    try {
      if (!activeUser?.uid) {
        return;
      }

      const snap = await getDoc(doc(db, "users", activeUser.uid));
      if (snap.exists()) {
        if (isCancelled()) return;
        const data = snap.data();
        setProfile(data);
        // Do not block the home screen on /match (can be slow or offline)
        fetchTopMatches(data, activeUser, isCancelled);
      }
    } catch (err) {
      console.log("HOME PROFILE FETCH:", err);
    } finally {
      if (isCancelled()) return;
      setLoading(false);
    }
  };

  const handleGenerateCareerPath = () => {
    const topJob = allJobs[0] || null;
    const allMissingSkillsSet = new Set();
    allJobs.forEach((job) => {
      (job.analysis?.missingSkills || []).forEach((s) => allMissingSkillsSet.add(s));
    });
    
    const isProf = profile?.workerType === "professional";
    const matchContext = {
      role: isProf ? profile?.profile?.professionalRole : profile?.profile?.role,
      experience: isProf ? (profile?.profile?.experienceDetails?.length || 0) : (profile?.profile?.experience || 0),
      missingSkills: Array.from(allMissingSkillsSet),
      topJobTitle: topJob ? topJob.title : "Preferred Role",
      matchScore: topJob ? topJob.matchScore : 0,
      skills: isProf ? profile?.profile?.professionalSkills : profile?.profile?.skills,
    };
    navigation.navigate("LearningPath", { matchContext });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>{t("noProfileFound") || "No profile found."}</Text>
      </View>
    );
  }

  const isProfessional = profile.workerType === "professional";
  const p = profile.profile || {};
  const emailName = user?.email?.split("@")[0] || "there";
  const displayName = p.fullName || p.name || p.resumeSummary?.split("|")[0] || emailName.replace(/[._]/g, " ");
  const role = isProfessional ? p.professionalRole : (p.canonicalRole || p.role);
  const skills = isProfessional ? (p.professionalSkills || []) : (p.skills || []);
  const location = p.location || "—";
  const topMatchScore = topJobs[0]?.matchScore || 0;
  const profilePct = computeProfileReadiness(p, isProfessional, topMatchScore);
  const learningCount = topJobs[0]?.analysis?.missingSkills?.length || 2;
  const topMissing = topJobs[0]?.analysis?.missingSkills?.[0] || "Power BI";
  const boostPct = topJobs[0]?.matchScore >= 85 ? 14 : 8;

  if (isProfessional) {
    return (
      <View style={styles.proRoot}>
        <View style={styles.proHeader}>
          <View style={styles.proHeaderTop}>
            <View style={styles.proHeaderLeft}>
              <Text style={styles.proGreeting}>{getGreeting(t)}</Text>
              <Text style={styles.proName}>
                {displayName} <Text style={styles.proEmoji}>💼</Text>
              </Text>
            </View>
            <View style={styles.proHeaderRight}>
              <TouchableOpacity
                style={styles.bellButtonPro}
                onPress={() => navigation.navigate("Notifications")}
                activeOpacity={0.8}
              >
                <Text style={styles.bellIcon}>🔔</Text>
                {notifications.filter((n) => n.status === "unread").length > 0 && (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>
                      {notifications.filter((n) => n.status === "unread").length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.initialsCircle}>
                <Text style={styles.initialsText}>{getInitials(displayName)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{matchCount || topJobs.length}</Text>
              <Text style={styles.statLabel}>{t("statMatches") || "Matches"}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profilePct}%</Text>
              <Text style={styles.statLabel}>{t("statProfile") || "Profile"}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{learningCount}</Text>
              <Text style={styles.statLabel}>{t("statLearning") || "Learning"}</Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.proBody}
          contentContainerStyle={styles.proBodyContent}
          showsVerticalScrollIndicator={false}
        >
          {notifications.filter((n) => n.status === "unread").length > 0 && (
            <View style={styles.notificationsContainer}>
              <Text style={styles.notificationsHeader}>
                {getNotifTitle()} ({notifications.filter((n) => n.status === "unread").length})
              </Text>
              {notifications.filter((n) => n.status === "unread").map((notif) => (
                <View key={notif.id} style={styles.notificationCard}>
                  <View style={styles.notificationHeaderRow}>
                    <Text style={styles.notificationTitle}>{notif.title}</Text>
                    <TouchableOpacity onPress={() => handleMarkAsRead(notif.id)} style={styles.dismissBtn}>
                      <Text style={styles.dismissBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.notificationMessage}>{notif.message}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.aiInsightBox}>
            <Text style={styles.aiInsightText}>
              {t("aiInsightTemplate", { skill: topMissing, pct: boostPct }) ||
                `AI Insight: Add ${topMissing} to boost match score by +${boostPct}%`}
            </Text>
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>🎯 {t("topMatches") || "Top Matches"}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Results")} activeOpacity={0.8}>
              <Text style={styles.viewAllLink}>{t("viewAll") || "View all"}</Text>
            </TouchableOpacity>
          </View>

          {topJobs.length > 0 ? (
            topJobs.map((job, idx) => {
              const badge = matchBadgeStyle(job.matchScore);
              return (
                <TouchableOpacity
                  key={`${job.jobId || job.id}-${idx}`}
                  style={styles.homeJobCard}
                  onPress={() =>
                    navigation.navigate("AIAnalysis", {
                      selectedJobId: job.jobId || job.id,
                      jobs: allJobs.length > 0 ? allJobs : topJobs,
                    })
                  }
                  activeOpacity={0.85}
                >
                  <View style={[styles.matchBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.matchBadgeText, { color: badge.text }]}>
                      {job.matchScore}% MATCH
                    </Text>
                  </View>
                  <Text style={styles.homeJobTitle}>{job.title}</Text>
                  <Text style={styles.homeJobCompany}>{job.company}</Text>
                  <Text style={styles.homeJobSalary}>{formatSalary(job.salary)}</Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <TouchableOpacity
              style={styles.homeJobCard}
              onPress={() => navigation.navigate("Results")}
              activeOpacity={0.85}
            >
              <Text style={styles.homeJobTitle}>{t("viewMatchedJobs") || "View Matched Jobs"}</Text>
              <Text style={styles.homeJobCompany}>{t("viewMatchedJobsSub") || "See AI-matched opportunities"}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={handleGenerateCareerPath}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryActionIcon}>🎯</Text>
            <View>
              <Text style={styles.secondaryActionTitle}>{t("generateCareerPath") || "Generate My Career Path"}</Text>
              <Text style={styles.secondaryActionSub}>
                {t("careerPathSubtitle") || "AI-powered roadmap based on your match gaps"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => navigation.navigate("Resume")}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryActionIcon}>📄</Text>
            <View>
              <Text style={styles.secondaryActionTitle}>{t("viewResume") || "View Resume"}</Text>
              <Text style={styles.secondaryActionSub}>
                {t("viewResumeSub") || "Your AI-generated professional resume"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => navigation.navigate("Profile")}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryActionIcon}>✏️</Text>
            <View>
              <Text style={styles.secondaryActionTitle}>{t("editProfile") || "Edit Profile"}</Text>
              <Text style={styles.secondaryActionSub}>
                {t("editProfileSub") || "Update your skills, role, and experience"}
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.poweredBy}>Powered by Setu AI  🌉</Text>
        </ScrollView>
      </View>
    );
  }

  const labourJobs = allJobs.length > 0 ? allJobs.slice(0, 3) : topJobs;

  return (
    <View style={styles.labourRoot}>
      <View style={styles.labourHeader}>
        <View style={styles.labourHeaderTop}>
          <View style={styles.labourHeaderLeft}>
            <Text style={styles.labourGreeting}>{getGreeting(t)}</Text>
            <Text style={styles.labourName}>
              {displayName} <Text style={styles.labourEmoji}>👷</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.labourBellBtn}
            onPress={() => navigation.navigate("Notifications")}
            activeOpacity={0.8}
          >
            <Text style={styles.labourBellIcon}>🔔</Text>
            {notifications.filter((n) => n.status === "unread").length > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>
                  {notifications.filter((n) => n.status === "unread").length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.labourStatsCard}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.labourStatValue]}>{matchCount || labourJobs.length}</Text>
            <Text style={styles.labourStatLabel}>{t("statMatches") || "Matches"}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.labourStatValue]}>{appliedCount}</Text>
            <Text style={styles.labourStatLabel}>Applied</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.labourStatValue]}>{shortlistedCount}</Text>
            <Text style={styles.labourStatLabel}>Shortlisted</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.labourBody}
        contentContainerStyle={styles.labourBodyContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.filter((n) => n.status === "unread").length > 0 && (
          <View style={styles.notificationsContainer}>
            <Text style={styles.notificationsHeader}>
              {getNotifTitle()} ({notifications.filter((n) => n.status === "unread").length})
            </Text>
            {notifications.filter((n) => n.status === "unread").map((notif) => (
              <View key={notif.id} style={styles.notificationCard}>
                <View style={styles.notificationHeaderRow}>
                  <Text style={styles.notificationTitle}>{notif.title}</Text>
                  <TouchableOpacity onPress={() => handleMarkAsRead(notif.id)} style={styles.dismissBtn}>
                    <Text style={styles.dismissBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.notificationMessage}>{notif.message}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🎯 {t("viewMatchedJobs") || "Jobs for you"}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Results")} activeOpacity={0.8}>
            <Text style={styles.viewAllLink}>{t("viewAll") || "View all"}</Text>
          </TouchableOpacity>
        </View>

        {labourJobs.length > 0 ? (
          labourJobs.map((job, idx) => {
            const badge = matchBadgeStyle(job.matchScore);
            return (
              <TouchableOpacity
                key={`${job.jobId || job.id}-${idx}`}
                style={styles.labourJobCard}
                onPress={() =>
                  navigation.navigate("AIAnalysis", {
                    selectedJobId: job.jobId || job.id,
                    jobs: allJobs.length > 0 ? allJobs : labourJobs,
                  })
                }
                activeOpacity={0.85}
              >
                <View style={[styles.labourJobIcon, { backgroundColor: getLabourIconBg(job.title) }]}>
                  <Text style={styles.labourJobIconText}>{getLabourJobIcon(job.title)}</Text>
                </View>
                <View style={styles.labourJobInfo}>
                  <Text style={styles.labourJobTitle}>{job.title}</Text>
                  <Text style={styles.labourJobMeta}>
                    {job.company} — {job.location || location}
                  </Text>
                  <Text style={styles.labourJobSalary}>{formatLabourSalary(job.salary)}</Text>
                </View>
                <View style={[styles.labourMatchPill, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.labourMatchText, { color: badge.text }]}>{job.matchScore}%</Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <TouchableOpacity
            style={styles.labourJobCard}
            onPress={() => navigation.navigate("Results")}
            activeOpacity={0.85}
          >
            <View style={styles.labourJobInfo}>
              <Text style={styles.labourJobTitle}>{t("viewMatchedJobs") || "View Matched Jobs"}</Text>
              <Text style={styles.labourJobMeta}>{t("viewMatchedJobsSubLabour") || "See opportunities near you"}</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.secondaryAction}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryActionIcon}>✏️</Text>
          <View>
            <Text style={styles.secondaryActionTitle}>{t("editProfile") || "Edit Profile"}</Text>
            <Text style={styles.secondaryActionSub}>
              {t("editProfileSub") || "Update your skills, role, and experience"}
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.poweredBy}>Powered by Setu AI  🌉</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  proRoot: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  proHeader: {
    backgroundColor: COLORS.headerBlue,
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  proHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  proHeaderLeft: { flex: 1 },
  proHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  proGreeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
    marginBottom: 6,
  },
  proName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  proEmoji: { fontSize: 22 },
  initialsCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  bellButtonPro: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  proBody: { flex: 1 },
  proBodyContent: {
    padding: 20,
    paddingBottom: 40,
  },
  aiInsightBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 24,
  },
  aiInsightText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
    lineHeight: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  homeJobCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
    ...SHADOWS.card,
  },
  matchBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  matchBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  homeJobTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
    paddingRight: 80,
  },
  homeJobCompany: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  homeJobSalary: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryActionIcon: { fontSize: 24 },
  secondaryActionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  secondaryActionSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  labourRoot: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  labourHeader: {
    backgroundColor: COLORS.labourNavy,
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  labourHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  labourHeaderLeft: { flex: 1 },
  labourGreeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 6,
  },
  labourName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  labourEmoji: { fontSize: 22 },
  labourBellBtn: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  labourBellIcon: { fontSize: 20 },
  labourStatsCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 18,
  },
  labourStatValue: { color: COLORS.accent },
  labourStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    marginTop: 4,
  },
  labourBody: { flex: 1 },
  labourBodyContent: {
    padding: 20,
    paddingBottom: 40,
  },
  labourJobCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  labourJobIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  labourJobIconText: { fontSize: 24 },
  labourJobInfo: { flex: 1, paddingRight: 8 },
  labourJobTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  labourJobMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  labourJobSalary: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.accent,
  },
  labourMatchPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  labourMatchText: {
    fontSize: 13,
    fontWeight: "700",
  },

  container: {
    padding: 20,
    paddingTop: 48,
    paddingBottom: 40,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  emptyText: { color: COLORS.textSecondary, fontSize: 15 },
  greetingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: { flex: 1 },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    ...SHADOWS.sm,
  },
  bellIcon: { fontSize: 22 },
  bellBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: COLORS.accent,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  bellBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "bold",
  },
  greetingHi: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
  },
  greetingRole: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  greetingLocation: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  profileCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: BORDER_RADIUS.lg,
    padding: 20,
    marginBottom: 28,
  },
  profileCardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  profileStat: { flex: 1, alignItems: "center" },
  profileStatValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  profileStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  skillChipText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: BORDER_RADIUS.md,
    padding: 18,
    marginBottom: 12,
  },
  primaryAction: {
    backgroundColor: COLORS.accent,
    ...SHADOWS.card,
  },
  secondaryActionLabour: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionCardIcon: { fontSize: 28 },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  actionCardSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },
  actionCardTitleDark: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 2,
  },
  actionCardSubtitleDark: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  notificationsContainer: {
    marginBottom: 24,
    backgroundColor: COLORS.accentLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#FFEDD5",
  },
  notificationsHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.accent,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  notificationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    ...SHADOWS.sm,
  },
  notificationHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
    paddingRight: 8,
  },
  dismissBtn: { padding: 4 },
  dismissBtnText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  poweredBy: {
    textAlign: "center",
    color: COLORS.textLight,
    fontSize: 12,
    marginTop: 24,
  },
});
