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
import * as Sharing from "expo-sharing";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useOnboarding } from "../../context/OnboardingContext";
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

export default function ResumePreviewScreen({ navigation }) {
  const { resetOnboarding, refreshOnboarding, onboardingData } = useOnboarding() || {};
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  const [approving, setApproving] = useState(false);

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

  const handleApprove = async () => {
    setApproving(true);
    try {
      const uid = auth.currentUser.uid;
      await updateDoc(doc(db, "users", uid), {
        onboardingCompleted: true,
        updatedAt: serverTimestamp(),
      });
      if (refreshOnboarding) refreshOnboarding();
      if (resetOnboarding) resetOnboarding();
    } catch (err) {
      Alert.alert("Error", "Failed to approve profile. Please try again.");
    } finally {
      setApproving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resume) return;
    try {
      const name = getDisplayName(resume);
      const role = resume.role || "Professional";
      const expYears =
        resume.experience?.reduce((sum, e) => sum + (parseInt(e.years, 10) || 0), 0) ||
        resume.experience?.[0]?.years ||
        0;
      const email = auth.currentUser?.email || "Not provided";
      const location = resume.location || "Not specified";
      const competencies = resume.skills || [];
      const phone = resume.phoneNumber || auth.currentUser?.phoneNumber || "Not provided";
      const languages = resume.languages?.join(", ") || "English";

      const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                margin: 0;
                padding: 0;
                color: #1F2937;
                background-color: #FFFFFF;
                -webkit-print-color-adjust: exact;
              }
              .header {
                background-color: #2D7D53;
                color: #FFFFFF;
                padding: 30px;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
              }
              .header-title-container {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
              }
              .avatar {
                width: 60px;
                height: 60px;
                border-radius: 30px;
                background-color: rgba(255, 255, 255, 0.25);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: bold;
                color: #FFFFFF;
                margin-right: 20px;
              }
              .name-role {
                flex: 1;
              }
              .name {
                font-size: 26px;
                font-weight: bold;
                margin: 0 0 5px 0;
                color: #FFFFFF;
              }
              .role {
                font-size: 16px;
                color: rgba(255, 255, 255, 0.85);
                margin: 0;
              }
              .contact-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px 20px;
                font-size: 13px;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
                padding-top: 12px;
              }
              .contact-item {
                display: flex;
                align-items: center;
                color: rgba(255, 255, 255, 0.9);
              }
              .content {
                padding: 30px;
              }
              .section-heading {
                font-size: 13px;
                font-weight: bold;
                color: #2D7D53;
                letter-spacing: 0.5px;
                margin-top: 24px;
                margin-bottom: 12px;
                text-transform: uppercase;
                border-bottom: 1px solid #E5E7EB;
                padding-bottom: 4px;
              }
              .section-heading:first-of-type {
                margin-top: 0;
              }
              .body-text {
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
                margin: 0 0 12px 0;
              }
              .competency-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 12px;
              }
              .competency-item {
                font-size: 14px;
                color: #374151;
                display: flex;
                align-items: center;
              }
              .bullet {
                color: #2D7D53;
                margin-right: 8px;
                font-size: 16px;
                font-weight: bold;
              }
              .exp-block {
                display: flex;
                margin-bottom: 16px;
              }
              .exp-border {
                width: 3px;
                background-color: #2D7D53;
                border-radius: 2px;
                margin-right: 12px;
                flex-shrink: 0;
              }
              .exp-content {
                flex: 1;
              }
              .exp-title {
                font-size: 15px;
                font-weight: bold;
                color: #1F2937;
                margin: 0 0 4px 0;
              }
              .exp-meta {
                font-size: 13px;
                color: #6B7280;
                margin: 0 0 6px 0;
              }
              .link-text {
                font-size: 14px;
                color: #3B82F6;
                margin: 0 0 6px 0;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="header-title-container">
                <div class="avatar">${getInitials(name)}</div>
                <div class="name-role">
                  <h1 class="name">${name}</h1>
                  <p class="role">${role}</p>
                </div>
              </div>
              <div class="contact-grid">
                <div class="contact-item">📞 ${phone}</div>
                <div class="contact-item">✉️ ${email}</div>
                <div class="contact-item">📍 ${location}</div>
                <div class="contact-item">📅 ${expYears} years</div>
              </div>
            </div>
            <div class="content">
              <div class="section-heading">PROFESSIONAL SUMMARY</div>
              <p class="body-text">${resume.summary || ""}</p>
              
              <div class="section-heading">CORE COMPETENCIES</div>
              <div class="competency-grid">
                ${competencies.map(skill => `
                  <div class="competency-item">
                    <span class="bullet">•</span>
                    <span>${skill}</span>
                  </div>
                `).join('')}
              </div>
              
              <div class="section-heading">PROFESSIONAL EXPERIENCE</div>
              ${(resume.experience || []).map(item => `
                <div class="exp-block">
                  <div class="exp-border"></div>
                  <div class="exp-content">
                    <h3 class="exp-title">${item.role || "Role"}</h3>
                    <p class="exp-meta">${item.company || "Company"} · ${item.years || 0} years</p>
                    ${item.description ? `<p class="body-text" style="margin-bottom: 0;">${item.description}</p>` : ""}
                  </div>
                </div>
              `).join('')}
              
              <div class="section-heading">EDUCATION</div>
              <p class="body-text">
                ${resume.education?.degree || "Degree"}${resume.education?.institution ? ` — ${resume.education.institution}` : ""}
              </p>
              
              <div class="section-heading">LANGUAGES</div>
              <p class="body-text">${languages}</p>
              
              ${(resume.links?.linkedin || resume.links?.github) ? `
                <div class="section-heading">LINKS</div>
                ${resume.links?.linkedin ? `<p class="body-text">LinkedIn: <a href="${resume.links.linkedin}" class="link-text">${resume.links.linkedin}</a></p>` : ""}
                ${resume.links?.github ? `<p class="body-text">GitHub: <a href="${resume.links.github}" class="link-text">${resume.links.github}</a></p>` : ""}
              ` : ""}
            </div>
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
  const roleLabel = resume.role || "Professional";
  const expYears =
    resume.experience?.reduce((sum, e) => sum + (parseInt(e.years, 10) || 0), 0) ||
    resume.experience?.[0]?.years ||
    0;
  const email = auth.currentUser?.email || "Not provided";
  const location = resume.location || "Not specified";
  const competencies = resume.skills || [];
  const phone = resume.phoneNumber || auth.currentUser?.phoneNumber || "Not provided";
  const languages = resume.languages?.join(", ") || "English";

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
              <Text style={styles.contactItem}>📞 {phone}</Text>
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
            {phone} • {email} • {location}
          </Text>
          <View style={styles.cvDivider} />

          <Text style={styles.sectionHeading}>PROFESSIONAL SUMMARY</Text>
          <Text style={styles.bodyText}>{resume.summary}</Text>

          <Text style={styles.sectionHeading}>CORE COMPETENCIES</Text>
          <View style={styles.competencyGrid}>
            {competencies.map((skill, i) => (
              <View key={i} style={styles.competencyItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.competencyText}>{skill}</Text>
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
          <Text style={styles.bodyText}>{languages}</Text>

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

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.approveBtn} onPress={handleApprove} disabled={approving}>
          {approving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.approveBtnText}>{t("approveFinish") || "Approve & Finish"}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.downloadIconBtn} onPress={handleDownloadPDF} activeOpacity={0.85}>
          <Ionicons name="download-outline" size={24} color={COLORS.resumeGreen} />
        </TouchableOpacity>
      </View>
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
  actionRow: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: COLORS.resumeGreen,
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.lg,
  },
  approveBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  downloadIconBtn: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.resumeGreen,
    ...SHADOWS.lg,
  },
});
