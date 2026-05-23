import { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { auth } from "../../services/firebase";
import API from "../../services/api";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useI18n } from "../../context/I18nContext";
import { COLORS, BORDER_RADIUS, SHADOWS } from "../../constants/theme";

function getInitials(name) {
  if (!name) return "RK";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getDisplayName(resume) {
  const email = auth.currentUser?.email || "";
  const fromSummary = resume?.resumeSummary?.split("|")[0];
  if (fromSummary) return fromSummary;
  return email.split("@")[0]?.replace(/[._]/g, " ") || "Candidate";
}

export default function ResumePreviewScreen() {
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  const { t } = useI18n();

  useEffect(() => {
    generateResume();
  }, []);

  const generateResume = async () => {
    try {
      const userId = auth.currentUser.uid;
      const response = await API.post("/resume/generate", { userId });
      setResume(response.data);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to generate resume");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resume) return;
    try {
      const name = getDisplayName(resume);
      const role = t("roles." + resume.role) || resume.role || "Professional";
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Helvetica, sans-serif; padding: 40px; color: #333; }
              h1 { color: #2D7D53; }
              h2 { color: #2D7D53; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
            </style>
          </head>
          <body>
            <h1>${name}</h1>
            <h2>${role}</h2>
            <p>${resume.summary || ""}</p>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch (error) {
      console.log("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate PDF");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.resumeGreen} />
      </View>
    );
  }

  if (!resume) {
    return (
      <View style={styles.center}>
        <Text>Resume unavailable</Text>
      </View>
    );
  }

  const displayName = getDisplayName(resume);
  const roleLabel = t("roles." + resume.role) || resume.role || "Professional";
  const expYears =
    resume.experience?.reduce((sum, e) => sum + (parseInt(e.years, 10) || 0), 0) ||
    resume.experience?.[0]?.years ||
    0;
  const email = auth.currentUser?.email || "email@example.com";
  const location = resume.location || "Mumbai";
  const competencies = resume.skills || [];

  return (
    <View style={styles.root}>
      <View style={styles.topHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
        </View>
        <View style={styles.topHeaderInfo}>
          <Text style={styles.topName}>{displayName}</Text>
          <Text style={styles.topRole}>{roleLabel}</Text>
          <View style={styles.contactGrid}>
            <View style={styles.contactCol}>
              <Text style={styles.contactItem}>📞 +91 98765 43210</Text>
              <Text style={styles.contactItem}>📍 {location}</Text>
            </View>
            <View style={styles.contactCol}>
              <Text style={styles.contactItem}>✉️ Email</Text>
              <Text style={styles.contactItem}>📅 {expYears} years</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cvCard}>
          <Text style={styles.cvName}>{displayName}</Text>
          <Text style={styles.cvRole}>{roleLabel}</Text>
          <Text style={styles.cvContactLine}>
            +91 98765 43210 • {email} • {location}
          </Text>
          <View style={styles.cvDivider} />

          <Text style={styles.sectionHeading}>PROFESSIONAL SUMMARY</Text>
          <Text style={styles.bodyText}>{resume.summary}</Text>

          <Text style={styles.sectionHeading}>CORE COMPETENCIES</Text>
          <View style={styles.competencyGrid}>
            {competencies.map((skill, i) => (
              <View key={i} style={styles.competencyItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.competencyText}>{t("skills." + skill) || skill}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionHeading}>PROFESSIONAL EXPERIENCE</Text>
          {(resume.experience || []).map((item, index) => (
            <View key={index} style={styles.expBlock}>
              <View style={styles.expBorder} />
              <View style={styles.expContent}>
                <Text style={styles.expTitle}>{item.role || "Role"}</Text>
                <Text style={styles.expMeta}>
                  {item.company || "Company"} · {item.years || 0} years
                </Text>
                {item.description ? (
                  <Text style={styles.bodyText}>{item.description}</Text>
                ) : null}
              </View>
            </View>
          ))}

          <Text style={styles.sectionHeading}>EDUCATION</Text>
          <Text style={styles.bodyText}>
            {resume.education?.degree || "Degree"}
            {resume.education?.institution ? ` — ${resume.education.institution}` : ""}
          </Text>

          <Text style={styles.sectionHeading}>LANGUAGES</Text>
          <Text style={styles.bodyText}>Hindi, English, Marathi</Text>

          {(resume.links?.linkedin || resume.links?.github) && (
            <>
              <Text style={styles.sectionHeading}>LINKS</Text>
              {resume.links?.linkedin ? (
                <Text style={styles.linkText}>LinkedIn: {resume.links.linkedin}</Text>
              ) : null}
              {resume.links?.github ? (
                <Text style={styles.linkText}>GitHub: {resume.links.github}</Text>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadPDF} activeOpacity={0.85}>
        <Ionicons name="download-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.downloadBtnText}>Download PDF</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.resumeGreen,
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  topHeaderInfo: { flex: 1 },
  topName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  topRole: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 10,
  },
  contactGrid: {
    flexDirection: "row",
    gap: 16,
  },
  contactCol: { flex: 1 },
  contactItem: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 4,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  cvCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cvName: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 4,
  },
  cvRole: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  cvContactLine: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  cvDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 18,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.resumeGreen,
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 8,
  },
  bodyText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  competencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  competencyItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    paddingRight: 8,
  },
  bullet: {
    color: COLORS.resumeGreen,
    fontSize: 16,
    marginRight: 6,
  },
  competencyText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  expBlock: {
    flexDirection: "row",
    marginBottom: 14,
  },
  expBorder: {
    width: 3,
    backgroundColor: COLORS.resumeGreen,
    borderRadius: 2,
    marginRight: 12,
  },
  expContent: { flex: 1 },
  expTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  expMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 6,
  },
  downloadBtn: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: "row",
    backgroundColor: COLORS.resumeGreen,
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.lg,
  },
  downloadBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
