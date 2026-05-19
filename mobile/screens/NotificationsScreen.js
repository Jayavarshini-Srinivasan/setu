import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useI18n } from "../context/I18nContext";

export default function NotificationsScreen({ navigation }) {
  const { t, locale } = useI18n();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time Firestore Listener
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const notifQuery = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      notifQuery,
      (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setNotifications(list);
        setLoading(false);
      },
      (error) => {
        if (error?.code === "permission-denied") {
          console.log("Notifications Load: Local updates synced");
        } else {
          console.log("NOTIFICATIONS LOAD ERROR:", error);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Action: Mark single notification as read
  const handleMarkAsRead = async (notif) => {
    try {
      const user = auth.currentUser;
      if (!user || notif.status === "read") return;

      const notifRef = doc(db, "users", user.uid, "notifications", notif.id);
      await updateDoc(notifRef, { status: "read" });
    } catch (err) {
      console.log("MARK AS READ ERROR:", err);
    }
  };

  // Action: Mark all notifications as read in a batch
  const handleMarkAllRead = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const unreadNotifs = notifications.filter((n) => n.status === "unread");
      if (unreadNotifs.length === 0) return;

      const batch = writeBatch(db);
      unreadNotifs.forEach((notif) => {
        const ref = doc(db, "users", user.uid, "notifications", notif.id);
        batch.update(ref, { status: "read" });
      });

      await batch.commit();
    } catch (err) {
      console.log("MARK ALL READ ERROR:", err);
    }
  };

  // Helper: Localized relative time formatter
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "";
    
    // Support both firestore Timestamp objects and standard Dates
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    const lang = locale || "en";

    // English formatting
    if (lang === "en") {
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffHours < 48) return "Yesterday";
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    // Hindi formatting
    if (lang === "hi") {
      if (diffMins < 1) return "अभी-अभी";
      if (diffMins < 60) return `${diffMins} मिनट पहले`;
      if (diffHours < 24) return `${diffHours} घंटे पहले`;
      if (diffHours < 48) return "कल";
      return date.toLocaleDateString("hi-IN", { month: "short", day: "numeric" });
    }

    // Tamil formatting
    if (lang === "ta") {
      if (diffMins < 1) return "இப்போது";
      if (diffMins < 60) return `${diffMins} நிமிடங்களுக்கு முன்பு`;
      if (diffHours < 24) return `${diffHours} மணிநேரத்திற்கு முன்பு`;
      if (diffHours < 48) return "நேற்று";
      return date.toLocaleDateString("ta-IN", { month: "short", day: "numeric" });
    }

    // Marathi formatting
    if (lang === "mr") {
      if (diffMins < 1) return "आत्ताच";
      if (diffMins < 60) return `${diffMins} मिनिटांपूर्वी`;
      if (diffHours < 24) return `${diffHours} तासांपूर्वी`;
      if (diffHours < 48) return "काल";
      return date.toLocaleDateString("mr-IN", { month: "short", day: "numeric" });
    }

    return date.toLocaleDateString();
  };

  // Helper: dynamic translation mapping
  const getLocalizedContent = (notif) => {
    let category = "update";
    const rawTitle = (notif.title || "").toLowerCase();
    const rawMsg = (notif.message || "").toLowerCase();

    // Categorization
    if (notif.type === "shortlisted" || rawTitle.includes("shortlist") || rawMsg.includes("shortlist")) {
      category = "shortlisted";
    } else if (notif.type === "rejected" || rawTitle.includes("reject") || rawMsg.includes("reject")) {
      category = "rejected";
    } else if (notif.type === "interview" || rawTitle.includes("interview") || rawMsg.includes("interview")) {
      category = "interview";
    } else if (notif.type === "selected" || rawTitle.includes("select") || rawMsg.includes("select")) {
      category = "selected";
    }

    // Extract dynamic job and company name
    let jobTitle = notif.jobTitle || "";
    let companyName = notif.companyName || "";

    if (!jobTitle) {
      const jobMatch = notif.message?.match(/application for "([^"]+)"/i) || notif.message?.match(/application for ([a-zA-Z0-9\s\-]+) (was|has been)/i);
      jobTitle = jobMatch ? jobMatch[1] : "";
    }

    if (!companyName) {
      const companyMatch = notif.message?.match(/by "([^"]+)"/i) || notif.message?.match(/by ([a-zA-Z0-9\s\-]+)\./i);
      companyName = companyMatch ? companyMatch[1] : "";
    }

    // Fallbacks
    if (!jobTitle) jobTitle = t("job") || "job";
    if (!companyName) companyName = t("company") || "company";

    // Translation Lookups
    const localizedTitle = t(`notifications.${category}.title`) || notif.title;
    let localizedMessage = t(`notifications.${category}.message`) || notif.message;

    // Apply template replacements
    if (typeof localizedMessage === "string") {
      localizedMessage = localizedMessage
        .replace("{jobTitle}", jobTitle)
        .replace("{companyName}", companyName);
    }

    // Dynamic Category Icons and Styles
    let icon = "🔔";
    let iconBg = "#E5E7EB";
    let iconColor = "#4B5563";

    switch (category) {
      case "shortlisted":
        icon = "🎉";
        iconBg = "#D4EFDF";
        iconColor = "#196F3D";
        break;
      case "rejected":
        icon = "❌";
        iconBg = "#FADBD8";
        iconColor = "#922B21";
        break;
      case "interview":
        icon = "📅";
        iconBg = "#FCF3CF";
        iconColor = "#7D6608";
        break;
      case "selected":
        icon = "🏆";
        iconBg = "#D6EAF8";
        iconColor = "#1B4F72";
        break;
    }

    return {
      title: localizedTitle,
      message: localizedMessage,
      icon,
      iconBg,
      iconColor,
    };
  };

  const renderNotifCard = ({ item }) => {
    const isUnread = item.status === "unread";
    const { title, message, icon, iconBg } = getLocalizedContent(item);

    return (
      <TouchableOpacity
        style={[styles.card, isUnread ? styles.cardUnread : styles.cardRead]}
        onPress={() => {
          handleMarkAsRead(item);
          // Optional dynamic routing based on status
          if (item.jobId) {
            navigation.navigate("Results");
          }
        }}
        activeOpacity={0.85}
      >
        {/* Dynamic Category Badge */}
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>

        {/* Text Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.cardTitle, isUnread && styles.cardTitleUnread]} numberOfLines={1}>
              {title}
            </Text>
            {isUnread && <View style={styles.unreadBadgeDot} />}
          </View>
          
          <Text style={styles.cardMessage}>{message}</Text>
          
          <Text style={styles.cardTime}>{getRelativeTime(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  return (
    <SafeAreaView style={styles.container}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {t("notifications.title") || "Notifications"}
          </Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSubtitle}>
              {unreadCount} {unreadCount === 1 ? "unread update" : "unread updates"}
            </Text>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>
              {t("notifications.markAllRead") || "Mark all read"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── LIST OR STATES ── */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E85D04" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={styles.emptyTitle}>
            {t("notifications.emptyState") || "All Caught Up!"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {t("notifications.emptyStateSubtitle") || "We'll notify you when companies update your applications."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotifCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#E85D04",
    fontWeight: "600",
    marginTop: 2,
  },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#FFF8F2",
    borderWidth: 1,
    borderColor: "#FFE5D9",
  },
  markAllText: {
    fontSize: 12,
    color: "#E85D04",
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
  },
  cardUnread: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFE5D9",
    borderLeftWidth: 4,
    borderLeftColor: "#E85D04",
  },
  cardRead: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconText: {
    fontSize: 20,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
    flex: 1,
  },
  cardTitleUnread: {
    fontWeight: "700",
    color: "#111827",
  },
  unreadBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E85D04",
    marginLeft: 6,
  },
  cardMessage: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
