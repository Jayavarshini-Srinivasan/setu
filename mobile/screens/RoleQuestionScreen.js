import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";

import VoiceButton from "../components/VoiceButton";
import useVoiceRecorder, { VOICE_STATE } from "../hooks/useVoiceRecorder";
import { useOnboarding } from "../context/OnboardingContext";
import { useI18n } from "../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../components/OnboardingStepLayout";
import { COLORS, BORDER_RADIUS } from "../constants/theme";

const ROLE_OPTIONS = [
  "auto_driver",
  "cab_driver",
  "delivery_rider",
  "electrician",
  "construction",
  "delivery",
];

const RADIUS_OPTIONS = ["2 km", "5 km", "10 km", "Any"];

export default function RoleQuestionScreen({ navigation }) {
  const { onboardingData, updateField, addTranscript } = useOnboarding();
  const { t } = useI18n();

  const [fullName, setFullName] = useState(onboardingData.resumeSummary?.split("|")[0] || "");
  const [age, setAge] = useState(onboardingData.age?.toString() || "");
  const [city, setCity] = useState(onboardingData.location || "");
  const [phone, setPhone] = useState(onboardingData.phoneNumber || "");
  const [workRadius, setWorkRadius] = useState(onboardingData.workRadius || "5 km");
  const [selectedRole, setSelectedRole] = useState(onboardingData.canonicalRole || "");

  const {
    voiceState,
    extractedProfile,
    startRecording,
    stopRecording,
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
    },
  });

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    updateField("canonicalRole", role);
    updateField("role", role);
  };

  const handleContinue = () => {
    if (!fullName.trim() || !city.trim() || !phone.trim()) {
      Alert.alert(t("required") || "Required", t("labourOnboarding.fillRequiredFields") || "Please fill in your name, city, and phone number.");
      return;
    }
    if (!selectedRole) {
      Alert.alert(t("required") || "Required", t("labourOnboarding.selectRole") || "Please select or speak your role.");
      return;
    }
    const phoneDigits = phone.replace(/[^0-9]/g, "");
    if (phoneDigits.length < 10) {
      Alert.alert(t("required") || "Required", t("labourOnboarding.validPhone") || "Please enter a valid 10-digit phone number.");
      return;
    }

    updateField("resumeSummary", fullName.trim());
    if (age) updateField("age", age);
    updateField("location", city.trim());
    updateField("phoneNumber", phoneDigits);
    updateField("workRadius", workRadius);
    navigation.navigate("SkillsQuestion");
  };

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Your Details (1/4)"
      step={1}
      title="Basic Info"
      subtitle="कुछ बुनियादी जानकारी दें · Let's get started"
      onContinue={handleContinue}
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

      <View style={os.inputRow}>
        <Text style={styles.fieldIcon}>📅</Text>
        <TextInput
          style={os.inputFlex}
          placeholder="Age"
          placeholderTextColor={COLORS.textLight}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
      </View>

      <View style={os.inputRow}>
        <Text style={styles.fieldIcon}>📍</Text>
        <TextInput
          style={os.inputFlex}
          placeholder="Current city / area"
          placeholderTextColor={COLORS.textLight}
          value={city}
          onChangeText={setCity}
        />
      </View>

      <Text style={os.label}>PREFERRED WORK RADIUS</Text>
      <View style={os.chipRow}>
        {RADIUS_OPTIONS.map((r) => (
          <TouchableOpacity
            key={r}
            style={[os.chip, workRadius === r && os.chipSelectedLabour]}
            onPress={() => setWorkRadius(r)}
          >
            <Text style={[os.chipText, workRadius === r && os.chipTextSelected]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={os.inputRow}>
        <Text style={styles.fieldIcon}>📱</Text>
        <TextInput
          style={os.inputFlex}
          placeholder="Phone number"
          placeholderTextColor={COLORS.textLight}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      <Text style={[os.label, { marginTop: 24 }]}>YOUR WORK TYPE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleScroll}>
        {ROLE_OPTIONS.map((role) => (
          <TouchableOpacity
            key={role}
            style={[styles.roleChip, selectedRole === role && styles.roleChipSelected]}
            onPress={() => handleSelectRole(role)}
          >
            <Text style={[styles.roleChipText, selectedRole === role && styles.roleChipTextSelected]}>
              {t(`roles.${role}`) || role}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.voiceRow}>
        <VoiceButton
          isRecording={voiceState === VOICE_STATE.RECORDING}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        />
        <Text style={styles.voiceHint}>{t("holdToSpeak") || "Hold to speak your role"}</Text>
      </View>

      {voiceState === VOICE_STATE.CONFIRMED && extractedProfile?.canonicalRole ? (
        <View style={styles.detectedBox}>
          <Text style={styles.detectedText}>
            {extractedProfile.canonicalRole || extractedProfile.role}
          </Text>
          <TouchableOpacity onPress={confirmExtraction}>
            <Text style={styles.useText}>✓ Use</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={rejectExtraction}>
            <Text style={styles.rejectText}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  fieldIcon: { fontSize: 18, marginRight: 10 },
  roleScroll: { marginBottom: 12 },
  roleChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginRight: 8,
  },
  roleChipSelected: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
  },
  roleChipText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  roleChipTextSelected: { color: COLORS.accent },
  voiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  voiceHint: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  detectedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.accentLight,
    borderRadius: BORDER_RADIUS.md,
  },
  detectedText: { flex: 1, fontWeight: "600", color: COLORS.text },
  useText: { color: COLORS.success, fontWeight: "700" },
  rejectText: { color: COLORS.textLight, fontSize: 18 },
});
