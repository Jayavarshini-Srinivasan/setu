import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { collection, query, where, getDoc, doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useI18n } from "../context/I18nContext";
import { COLORS, BORDER_RADIUS, SHADOWS } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATUS_STYLES = {
  shortlisted: { color: "#137333", bg: "#E6F4EA" },
  reviewed: { color: "#1A73E8", bg: "#E8F0FE" },
  pending: { color: "#B06000", bg: "#FEF7E0" },
  rejected: { color: "#C5221F", bg: "#FCE8E6" },
};

const TAB_KEYS = ["all", "pending", "reviewed", "shortlisted", "rejected"];

export default function AppliedScreen({ navigation }) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const topInset = insets.top + 12;
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const getStatusLabel = (statusKey) => {
    const map = {
      shortlisted: t("applied.badgeShortlisted"),
      reviewed: t("applied.badgeReviewed"),
      pending: t("applied.badgePending"),
      rejected: t("applied.badgeRejected"),
    };
    return map[statusKey] || statusKey.toUpperCase();
  };

  const getTabLabel = (tab) => {
    const map = {
      all: t("applied.statusAll"),
      pending: t("applied.statusPending"),
      reviewed: t("applied.statusReviewed"),
      shortlisted: t("applied.statusShortlisted"),
      rejected: t("applied.statusRejected"),
    };
    return map[tab] || tab;
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "applications"),
      where("workerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const appsList = [];
          const jobIdsToFetch = [];

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            appsList.push({ id: docSnap.id, ...data });
            if (data.jobId && !jobIdsToFetch.includes(data.jobId)) {
              jobIdsToFetch.push(data.jobId);
            }
          });

          const newJobsMap = {};
          await Promise.all(
            jobIdsToFetch.map(async (jobId) => {
              try {
                const jobDoc = await getDoc(doc(db, "jobs", jobId));
                if (jobDoc.exists()) {
                  newJobsMap[jobId] = jobDoc.data();
                }
              } catch (err) {
                console.log("Error fetching job details:", err);
              }
            })
          );

          appsList.sort((a, b) => {
            const tA = a.appliedAt?.toDate ? a.appliedAt.toDate() : new Date(a.appliedAt || 0);
            const tB = b.appliedAt?.toDate ? b.appliedAt.toDate() : new Date(b.appliedAt || 0);
            return tB - tA;
          });

          setJobs(newJobsMap);
          setApplications(appsList);
        } catch (err) {
          console.log("APPLIED SNAPSHOT PROCESS ERROR:", err);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.log("APPLIED LISTEN ERROR:", error?.code, error?.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const formatAppliedTime = (appliedAt) => {
    if (!appliedAt) return "";
    const date = appliedAt.toDate ? appliedAt.toDate() : new Date(appliedAt);
    const diffMs = new Date() - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t("applied.appliedToday") || "Applied today";
    if (diffDays === 1) return t("applied.appliedYesterday") || "Applied 1 day ago";
    if (diffDays < 7) {
      return t("applied.appliedDaysAgo", { days: diffDays }) || `Applied ${diffDays} days ago`;
    }
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return t("applied.appliedWeeksAgo", { weeks }) || `Applied ${weeks} week(s) ago`;
    }
    const months = Math.floor(diffDays / 30);
    return t("applied.appliedMonthsAgo", { months }) || `Applied ${months} month(s) ago`;
  };

  const filteredApps = applications.filter((app) => {
    if (activeTab === "all") return true;
    return (app.status || "pending").toLowerCase() === activeTab;
  });

  const renderApplicationItem = ({ item }) => {
    const job = jobs[item.jobId] || {};
    const statusKey = (item.status || "pending").toLowerCase();
    const config = STATUS_STYLES[statusKey] || STATUS_STYLES.pending;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle}>{job.title || item.jobTitle || "Job Title"}</Text>
            <Text style={styles.companyName}>{job.company || "Company"}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.statusText, { color: config.color }]}>
              {getStatusLabel(statusKey)}
            </Text>
          </View>
        </View>

        <Text style={styles.appliedTime}>{formatAppliedTime(item.appliedAt)}</Text>

        {statusKey === "shortlisted" && (
          <View style={styles.interviewAlert}>
            <Ionicons name="calendar-outline" size={16} color="#137333" style={{ marginRight: 6 }} />
            <Text style={styles.interviewText}>
              {t("applied.interviewScheduling") || "Interview being scheduled"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("applied.title") || "My Applications"}</Text>
      </View>

      {/* TABS CONTAINER */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {TAB_KEYS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {getTabLabel(tab)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* APPLICATIONS LIST */}
      <FlatList
        data={filteredApps}
        keyExtractor={(item) => item.id}
        renderItem={renderApplicationItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>
              {t("applied.emptyForTab", { tab: getTabLabel(activeTab) }) ||
                `No applications found for "${getTabLabel(activeTab)}"`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  tabsContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 12,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    marginRight: 4,
  },
  tabButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
    paddingRight: 12,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: "#4B5563",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  appliedTime: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  interviewAlert: {
    backgroundColor: "#E6F4EA",
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  interviewText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#137333",
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },
});
