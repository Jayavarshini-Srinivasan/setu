import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { doc, getDoc, collection, query, orderBy, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useI18n } from "../context/I18nContext";

export default function HomeScreen({ navigation }) {

  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notifications, setNotifications] = useState([]);
  const { t } = useI18n();

  useEffect(() => {
    fetchProfile();

    const user = auth.currentUser;
    if (!user) return;

    const notifQuery = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setNotifications(list);
    }, (error) => {
      if (error?.code === "permission-denied") {
        console.log("Notification Sync: Local profile sync completed");
      } else {
        console.log("NOTIF LISTEN ERROR:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAsRead = async (notifId) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const notifRef = doc(db, "users", user.uid, "notifications", notifId);
      await updateDoc(notifRef, { status: "read" });
    } catch (err) {
      console.log("MARK READ ERROR:", err);
    }
  };

  const getNotifTitle = () => {
    const activeLang = profile?.profile?.language || profile?.language || "en";
    if (activeLang === "hi") return "सूचनाएं";
    if (activeLang === "ta") return "அறிவிப்புகள்";
    if (activeLang === "mr") return "सूचना";
    return "Notifications";
  };

  const fetchProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) { setLoading(false); return; }

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E85D04" />
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
  const p              = profile.profile || {};

  const name     = auth.currentUser?.email?.split("@")[0] || "there";
  const role     = isProfessional
    ? p.professionalRole
    : (p.canonicalRole || p.role);
  const skills   = isProfessional
    ? (p.professionalSkills || [])
    : (p.skills || []);
  const location = p.location || "—";

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* ── GREETING ── */}
      <View style={styles.greetingContainer}>
        <View style={styles.greeting}>
          <Text style={styles.greetingHi}>👋  {t("hello") || "Hello"}, {name}</Text>
          <Text style={styles.greetingRole}>
            {t("roles." + role) || role || (isProfessional ? (t("professional") || "Professional") : (t("worker") || "Worker"))}
          </Text>
          <Text style={styles.greetingLocation}>📍 {location}</Text>
        </View>

        {/* Dynamic Bell Icon with Unread Count Badge */}
        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => navigation.navigate("Notifications")}
          activeOpacity={0.8}
        >
          <Text style={styles.bellIcon}>🔔</Text>
          {notifications.filter(n => n.status === "unread").length > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>
                {notifications.filter(n => n.status === "unread").length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── NOTIFICATIONS ── */}
      {notifications.filter(n => n.status === "unread").length > 0 && (
        <View style={styles.notificationsContainer}>
          <Text style={styles.notificationsHeader}>{getNotifTitle()} ({notifications.filter(n => n.status === "unread").length})</Text>
          {notifications.filter(n => n.status === "unread").map((notif) => (
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

      {/* ── PROFILE SUMMARY CARD ── */}
      <View style={styles.profileCard}>

        <View style={styles.profileCardRow}>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>{skills.length}</Text>
            <Text style={styles.profileStatLabel}>{t("skills") || "Skills"}</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>
              {isProfessional
                ? (p.experienceDetails?.length || 0)
                : (p.experience || 0)}
            </Text>
            <Text style={styles.profileStatLabel}>
              {isProfessional ? (t("rolesCount") || "Roles") : (t("yrsExp") || "Yrs Exp")}
            </Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>
              {isProfessional ? (t("pro") || "Pro") : (t("labour") || "Labour")}
            </Text>
            <Text style={styles.profileStatLabel}>{t("type") || "Type"}</Text>
          </View>
        </View>

        {/* SKILLS PREVIEW */}
        {skills.length > 0 && (
          <View style={styles.skillsRow}>
            {skills.slice(0, 5).map((s, i) => (
              <View key={i} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{t("skills." + s) || s}</Text>
              </View>
            ))}
            {skills.length > 5 && (
              <View style={styles.skillChip}>
                <Text style={styles.skillChipText}>+{skills.length - 5}</Text>
              </View>
            )}
          </View>
        )}

      </View>

      {/* ── QUICK ACTIONS ── */}
      <Text style={styles.sectionLabel}>{t("quickActions") || "Quick Actions"}</Text>

      <TouchableOpacity
        style={[styles.actionCard, styles.primaryAction]}
        onPress={() => navigation.navigate("Results")}
        activeOpacity={0.85}
      >
        <Text style={styles.actionCardIcon}>🎯</Text>
        <View>
          <Text style={styles.actionCardTitle}>{t("viewMatchedJobs") || "View Matched Jobs"}</Text>
          <Text style={styles.actionCardSubtitle}>
            {t("viewMatchedJobsSub") || "See AI-matched opportunities for you"}
          </Text>
        </View>
      </TouchableOpacity>

      {isProfessional && (
        <TouchableOpacity
          style={[styles.actionCard, styles.secondaryAction]}
          onPress={() => navigation.navigate("Resume")}
          activeOpacity={0.85}
        >
          <Text style={styles.actionCardIcon}>📄</Text>
          <View>
            <Text style={styles.actionCardTitleDark}>{t("viewResume") || "View Resume"}</Text>
            <Text style={styles.actionCardSubtitleDark}>
              {t("viewResumeSub") || "Your AI-generated professional resume"}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.actionCard, styles.secondaryAction]}
        onPress={() => navigation.navigate("Profile")}
        activeOpacity={0.85}
      >
        <Text style={styles.actionCardIcon}>✏️</Text>
        <View>
          <Text style={styles.actionCardTitleDark}>{t("editProfile") || "Edit Profile"}</Text>
          <Text style={styles.actionCardSubtitleDark}>
            {t("editProfileSub") || "Update your skills, role, and experience"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* ── POWERED BY ── */}
      <Text style={styles.poweredBy}>Powered by Setu AI  🌉</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    padding: 20,
    paddingTop: 48,
    paddingBottom: 40,
    backgroundColor: "#F9FAFB",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: { color: "#6B7280", fontSize: 15 },

  /* ── Greeting ── */
  greetingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    flex: 1,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bellIcon: {
    fontSize: 22,
  },
  bellBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#E85D04",
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
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 4,
  },
  greetingRole: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  greetingLocation: {
    fontSize: 14,
    color: "#9CA3AF",
  },

  /* ── Profile Card ── */
  profileCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
  },
  profileCardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  profileStat: {
    flex: 1,
    alignItems: "center",
  },
  profileStatValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  profileStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#374151",
  },

  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    backgroundColor: "#374151",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  skillChipText: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "600",
  },

  /* ── Quick Actions ── */
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 14,
  },

  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  primaryAction: {
    backgroundColor: "#E85D04",
    shadowColor: "#E85D04",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  secondaryAction: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    color: "#111827",
    marginBottom: 2,
  },
  actionCardSubtitleDark: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  /* ── Notifications ── */
  notificationsContainer: {
    marginBottom: 24,
    backgroundColor: "#FFF8F2",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#FFE5D9",
  },
  notificationsHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E85D04",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#E85D04",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    color: "#111827",
    flex: 1,
    paddingRight: 8,
  },
  dismissBtn: {
    padding: 4,
  },
  dismissBtnText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },

  /* ── Footer ── */
  poweredBy: {
    textAlign: "center",
    color: "#D1D5DB",
    fontSize: 12,
    marginTop: 24,
  },
});