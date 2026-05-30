import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import VoiceTranscriptionControls from "../components/VoiceTranscriptionControls";
import useVoiceRecorder from "../hooks/useVoiceRecorder";
import { useOnboarding } from "../context/OnboardingContext";
import { useI18n } from "../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../components/OnboardingStepLayout";
import { COLORS, BORDER_RADIUS } from "../constants/theme";

const ROLE_OPTIONS = [
  { id: "Electrician", icon: "⚡" },
  { id: "Plumber", icon: "🚰" },
  { id: "Welder", icon: "🔧" },
  { id: "Driver", icon: "🚚" },
  { id: "Tailor", icon: "🧵" },
  { id: "Helper", icon: "🏗️" },
  { id: "Carpenter", icon: "🔨" },
  { id: "Mason", icon: "🧱" },
  { id: "Painter", icon: "🖌️" },
  { id: "Mechanic", icon: "⚙️" },
  { id: "Delivery", icon: "📦" },
  { id: "Security", icon: "🛡️" },
  { id: "Cook", icon: "🍳" },
  { id: "Factory Operator", icon: "🏭" },
  { id: "Cleaner", icon: "🧹" },
  { id: "Gardener", icon: "🌿" },
  { id: "AC Technician", icon: "❄️" },
  { id: "Tiler", icon: "📏" },
  { id: "Fabricator", icon: "🛠️" },
  { id: "Other", icon: "✨" }
];

export default function RoleQuestionScreen({ navigation }) {
  const { onboardingData, updateField, addTranscript } = useOnboarding();
  const { t } = useI18n();

  const [fullName, setFullName] = useState(onboardingData.resumeSummary?.split("|")[0] || "");
  const [selectedRole, setSelectedRole] = useState(onboardingData.canonicalRole || "");

  const {
    voiceState,
    transcript,
    setTranscript,
    extractedProfile,
    errorMessage,
    isPlaying,
    startRecording,
    stopRecording,
    playRecording,
    retakeRecording,
    submitRecording,
    confirmExtraction,
    rejectExtraction,
  } = useVoiceRecorder({
    onResult: ({ transcript: tx, extractedProfile: profile }) => {
      if (tx) addTranscript(tx);
      const role = profile?.canonicalRole || profile?.role || "";
      if (role) {
        setSelectedRole(role);
        updateField("canonicalRole", role);
        updateField("role", role);
      }
      if (profile?.fullName) {
        setFullName(profile.fullName);
      }
    },
    screenType: "labour_role",
  });

  const detectedDisplay = extractedProfile?.fullName || extractedProfile?.canonicalRole || extractedProfile?.role
    ? `${extractedProfile?.fullName ? extractedProfile.fullName + " - " : ""}${extractedProfile?.canonicalRole || extractedProfile?.role || ""}`
    : "";

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    updateField("canonicalRole", role);
    updateField("role", role);
  };

  const handleContinue = () => {
    if (!isFormValid) {
      Alert.alert(t("required") || "Required", t("labourOnboarding.fillRequiredFields") || "Please fill in your name and select a role.");
      return;
    }
    updateField("resumeSummary", fullName.trim());
    updateField("fullName", fullName.trim());
    navigation.navigate("SkillsQuestion");
  };

  const isFormValid = Boolean(fullName.trim()) && Boolean(selectedRole);

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Role (1/5)"
      step={1}
      totalSteps={5}
      title="What do you do?"
      subtitle="Speak or select your role"
      onContinue={handleContinue}
      continueDisabled={!isFormValid}
      variant="labour"
    >
      <View style={os.inputRow}>
        <Text style={styles.fieldIcon}>👤</Text>
        <TextInput
          style={os.inputFlex}
          placeholder="Your full name"
          placeholderTextColor={COLORS.textLight}
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      <Text style={[os.label, { marginTop: 24, marginBottom: 12 }]}>YOUR ROLE</Text>
      <View style={styles.gridContainer}>
        {ROLE_OPTIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.gridCard, selectedRole === item.id && styles.gridCardSelected]}
            onPress={() => handleSelectRole(item.id)}
          >
            <Text style={styles.gridIcon}>{item.icon}</Text>
            <Text style={[styles.gridText, selectedRole === item.id && styles.gridTextSelected]} numberOfLines={1}>
              {item.id}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <VoiceTranscriptionControls
        voiceState={voiceState}
        transcript={transcript}
        extractedProfile={extractedProfile}
        errorMessage={errorMessage}
        isPlaying={isPlaying}
        hint={'Hold mic and say: "My name is Rajan, I am an electrician."'}
        detectedValue={detectedDisplay}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onPlayRecording={playRecording}
        onRetakeRecording={retakeRecording}
        onSubmitRecording={submitRecording}
        onTranscriptChange={setTranscript}
        onConfirm={confirmExtraction}
        onReject={rejectExtraction}
      />

      {false && (
        <View style={styles.detectedBox}>
          <Text style={styles.detectedText}>
            {extractedProfile.fullName ? extractedProfile.fullName + " - " : ""}{extractedProfile.canonicalRole || extractedProfile.role}
          </Text>
          <TouchableOpacity onPress={confirmExtraction}>
            <Text style={styles.useText}>✓ Use</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={rejectExtraction}>
            <Text style={styles.rejectText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  fieldIcon: { fontSize: 18, marginRight: 10 },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCard: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    padding: 8,
  },
  gridCardSelected: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
  },
  gridIcon: { fontSize: 24, marginBottom: 8 },
  gridText: { fontSize: 12, color: COLORS.textSecondary, textAlign: "center", fontWeight: "500" },
  gridTextSelected: { color: COLORS.accent, fontWeight: "700" },
  voiceRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16 },
  voiceHint: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  detectedBox: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, padding: 12, backgroundColor: COLORS.accentLight, borderRadius: BORDER_RADIUS.md },
  detectedText: { flex: 1, fontWeight: "600", color: COLORS.text },
  useText: { color: COLORS.success, fontWeight: "700" },
  rejectText: { color: COLORS.textLight, fontSize: 18 },
});
