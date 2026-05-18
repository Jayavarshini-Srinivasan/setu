import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export default function HomeScreen({ navigation }) {

  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { fetchProfile(); }, []);

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
        <Text style={styles.emptyText}>No profile found.</Text>
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
      <View style={styles.greeting}>
        <Text style={styles.greetingHi}>👋  Hello, {name}</Text>
        <Text style={styles.greetingRole}>
          {role || (isProfessional ? "Professional" : "Worker")}
        </Text>
        <Text style={styles.greetingLocation}>📍 {location}</Text>
      </View>

      {/* ── PROFILE SUMMARY CARD ── */}
      <View style={styles.profileCard}>

        <View style={styles.profileCardRow}>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>{skills.length}</Text>
            <Text style={styles.profileStatLabel}>Skills</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>
              {isProfessional
                ? (p.experienceDetails?.length || 0)
                : (p.experience || 0)}
            </Text>
            <Text style={styles.profileStatLabel}>
              {isProfessional ? "Roles" : "Yrs Exp"}
            </Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>
              {isProfessional ? "Pro" : "Labour"}
            </Text>
            <Text style={styles.profileStatLabel}>Type</Text>
          </View>
        </View>

        {/* SKILLS PREVIEW */}
        {skills.length > 0 && (
          <View style={styles.skillsRow}>
            {skills.slice(0, 5).map((s, i) => (
              <View key={i} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{s}</Text>
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
      <Text style={styles.sectionLabel}>Quick Actions</Text>

      <TouchableOpacity
        style={[styles.actionCard, styles.primaryAction]}
        onPress={() => navigation.navigate("Results")}
        activeOpacity={0.85}
      >
        <Text style={styles.actionCardIcon}>🎯</Text>
        <View>
          <Text style={styles.actionCardTitle}>View Matched Jobs</Text>
          <Text style={styles.actionCardSubtitle}>
            See AI-matched opportunities for you
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
            <Text style={styles.actionCardTitleDark}>View Resume</Text>
            <Text style={styles.actionCardSubtitleDark}>
              Your AI-generated professional resume
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
          <Text style={styles.actionCardTitleDark}>Edit Profile</Text>
          <Text style={styles.actionCardSubtitleDark}>
            Update your skills, role, and experience
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
  greeting: {
    marginBottom: 24,
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

  /* ── Footer ── */
  poweredBy: {
    textAlign: "center",
    color: "#D1D5DB",
    fontSize: 12,
    marginTop: 24,
  },
});