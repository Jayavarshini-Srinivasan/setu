import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import VoiceButton from "../../components/VoiceButton";
import { useOnboarding } from "../../context/OnboardingContext";
import { useI18n } from "../../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../../components/OnboardingStepLayout";
import { COLORS } from "../../constants/theme";
import useVoiceRecorder, { VOICE_STATE } from "../../hooks/useVoiceRecorder";

const EXP_OPTIONS = ["Fresher", "1-3", "3-7", "7+"];

export default function ProfessionalRoleScreen({ navigation }) {
  const { onboardingData, updateField, addTranscript } = useOnboarding();
  const { t } = useI18n();

  const [fullName, setFullName] = useState(onboardingData.resumeSummary?.split("|")[0] || "");
  const [email, setEmail] = useState(onboardingData.email || "");
  const [location, setLocation] = useState(onboardingData.location || "");
  const [jobTitle, setJobTitle] = useState(onboardingData.professionalRole || "");
  const [expBand, setExpBand] = useState(onboardingData.experienceBand || "");

  const {
    voiceState,
    transcript,
    extractedProfile,
    startRecording,
    stopRecording,
    playRecording,
    retakeRecording,
    submitRecording,
    confirmExtraction,
    rejectExtraction,
  } = useVoiceRecorder({
    onResult: ({ transcript: tx, extractedProfile: ep }) => {
      if (tx) addTranscript(tx);
      const role = ep?.rawRole || ep?.canonicalRole || "";
      if (role && role !== "other") {
        setJobTitle(role);
        updateField("professionalRole", role);
        updateField("workerType", "professional");
      }
    },
  });

  const handleContinue = () => {
    if (!isFormValid) {
      Alert.alert(
        t("required") || "Required",
        t("selectRoleError") || "Please complete all profile fields."
      );
      return;
    }

    updateField("professionalRole", jobTitle.trim());
    updateField("workerType", "professional");
    if (email.trim()) updateField("email", email.trim());
    if (location.trim()) updateField("location", location.trim());
    if (fullName.trim()) {
      updateField("resumeSummary", `${fullName.trim()}|${jobTitle.trim()}`);
    }
    updateField("experienceBand", expBand);

    navigation.navigate("ProfessionalSkills");
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isFormValid =
    Boolean(fullName.trim()) &&
    emailRegex.test(email.trim()) &&
    Boolean(location.trim()) &&
    Boolean(jobTitle.trim()) &&
    Boolean(expBand);

  const isRecording = voiceState === VOICE_STATE.RECORDING;

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Profile (1/4)"
      step={1}
      badge="PROFESSIONAL"
      title="Your Profile"
      subtitle="We'll use this to match you to top roles."
      onContinue={handleContinue}
      continueDisabled={!isFormValid}
    >
      <View style={os.inputRow}>
        <Ionicons name="person-outline" size={20} color={COLORS.textLight} style={os.inputIcon} />
        <TextInput
          style={os.inputFlex}
          placeholder={t("fullName") || "Full name"}
          placeholderTextColor={COLORS.textLight}
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      <View style={os.inputRow}>
        <Ionicons name="mail-outline" size={20} color={COLORS.textLight} style={os.inputIcon} />
        <TextInput
          style={os.inputFlex}
          placeholder={t("emailPlaceholder") || "Professional email"}
          placeholderTextColor={COLORS.textLight}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={os.inputRow}>
        <Ionicons name="location-outline" size={20} color={COLORS.textLight} style={os.inputIcon} />
        <TextInput
          style={os.inputFlex}
          placeholder="City / location"
          placeholderTextColor={COLORS.textLight}
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <View style={os.inputRow}>
        <Ionicons name="briefcase-outline" size={20} color={COLORS.textLight} style={os.inputIcon} />
        <TextInput
          style={os.inputFlex}
          placeholder="Current / last job title"
          placeholderTextColor={COLORS.textLight}
          value={jobTitle}
          onChangeText={(v) => {
            setJobTitle(v);
            updateField("professionalRole", v);
          }}
        />
      </View>

      <Text style={os.label}>YEARS OF EXPERIENCE</Text>
      <View style={os.chipRow}>
        {EXP_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[os.chip, expBand === opt && os.chipSelected]}
            onPress={() => setExpBand(opt)}
          >
            <Text style={[os.chipText, expBand === opt && os.chipTextSelected]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.voiceSection}>
        <Text style={styles.voiceHint}>
          {t("professionalRoleSubtitle") ||
            "Or hold the mic and speak your role in your own language."}
        </Text>
        <View style={styles.voiceRow}>
          <VoiceButton
            isRecording={isRecording}
            onPressIn={startRecording}
            onPressOut={stopRecording}
          />
          {voiceState === VOICE_STATE.RECORDED && (
            <View style={styles.voiceActions}>
              <TouchableOpacity onPress={playRecording} style={styles.voiceActionBtn}>
                <Text style={styles.voiceActionText}>Play</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={retakeRecording} style={styles.voiceActionBtn}>
                <Text style={styles.voiceActionText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitRecording} style={styles.voiceActionBtn}>
                <Text style={styles.voiceActionText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}
          {voiceState === VOICE_STATE.PROCESSING && (
            <Text style={styles.voiceHint}>Analysing your response…</Text>
          )}
        </View>
        {voiceState === VOICE_STATE.CONFIRMED && extractedProfile?.rawRole ? (
          <View style={styles.detectedBox}>
            <Text style={styles.detectedLabel}>{t("detectedRole") || "Detected Role"}</Text>
            <Text style={styles.detectedValue}>
              {extractedProfile.rawRole || extractedProfile.canonicalRole}
            </Text>
            <View style={styles.detectedActions}>
              <TouchableOpacity onPress={confirmExtraction} style={styles.confirmBtn}>
                <Text style={styles.confirmText}>✓ Use</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={rejectExtraction}>
                <Text style={styles.rejectText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        {transcript && voiceState === VOICE_STATE.CONFIRMED ? (
          <Text style={styles.transcriptQuote}>"{transcript}"</Text>
        ) : null}
      </View>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  voiceSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  voiceHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
    textAlign: "center",
  },
  voiceRow: {
    alignItems: "center",
    gap: 12,
  },
  voiceActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  voiceActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },
  voiceActionText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  detectedBox: {
    marginTop: 16,
    backgroundColor: COLORS.primaryLight,
    padding: 14,
    borderRadius: 12,
  },
  detectedLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 4,
  },
  detectedValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 10,
  },
  detectedActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  confirmBtn: {},
  confirmText: { color: COLORS.success, fontWeight: "700" },
  rejectText: { color: COLORS.textLight, fontSize: 18 },
  transcriptQuote: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },
});
