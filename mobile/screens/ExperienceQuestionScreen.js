import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import useVoiceRecorder, { VOICE_STATE } from "../hooks/useVoiceRecorder";
import VoiceButton from "../components/VoiceButton";
import { useOnboarding } from "../context/OnboardingContext";
import { useI18n } from "../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../components/OnboardingStepLayout";
import { COLORS, BORDER_RADIUS } from "../constants/theme";

const Stepper = ({ value, min, max, onChange, label }) => (
  <View style={styles.stepperContainer}>
    <Text style={os.label}>{label}</Text>
    <View style={styles.stepperRow}>
      <TouchableOpacity 
        style={styles.stepperBtn} 
        onPress={() => onChange(Math.max(min, Number(value) - 1))}
      >
        <Text style={styles.stepperBtnText}>-</Text>
      </TouchableOpacity>
      
      <TextInput 
        style={styles.stepperInput}
        value={String(value)}
        onChangeText={val => {
          const num = Number(val.replace(/[^0-9]/g, ""));
          onChange(Math.min(max, Math.max(min, num)));
        }}
        keyboardType="numeric"
      />
      
      <TouchableOpacity 
        style={styles.stepperBtn} 
        onPress={() => onChange(Math.min(max, Number(value) + 1))}
      >
        <Text style={styles.stepperBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function ExperienceQuestionScreen({ navigation }) {
  const { onboardingData, updateField, addTranscript } = useOnboarding();
  const { t } = useI18n();

  const [experience, setExperience] = useState(onboardingData.experience !== "" && onboardingData.experience != null ? Number(onboardingData.experience) : 0);
  const [age, setAge] = useState(onboardingData.age ? Number(onboardingData.age) : 25);

  const {
    voiceState,
    extractedProfile,
    startRecording,
    stopRecording,
    confirmExtraction,
    rejectExtraction,
  } = useVoiceRecorder({
    onResult: ({ transcript: tx, extractedProfile: ep }) => {
      if (tx) addTranscript(tx);
      if (ep?.experience !== undefined && ep.experience !== null) {
        setExperience(Number(ep.experience));
      }
      if (ep?.age !== undefined && ep.age !== null) {
        setAge(Number(ep.age));
      }
    },
  });

  const handleContinue = () => {
    updateField("experience", experience);
    updateField("age", age);
    navigation.navigate("LocationQuestion");
  };

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Experience (3/5)"
      step={3}
      totalSteps={5}
      title="Experience & Age"
      subtitle="How long have you been working?"
      onContinue={handleContinue}
      continueDisabled={false}
      variant="labour"
    >
      <Stepper 
        label="YEARS OF EXPERIENCE (0-60)"
        value={experience}
        min={0}
        max={60}
        onChange={setExperience}
      />
      
      <Stepper 
        label="AGE (16-80) [Optional]"
        value={age}
        min={16}
        max={80}
        onChange={setAge}
      />

      <View style={styles.voiceRow}>
        <VoiceButton
          isRecording={voiceState === VOICE_STATE.RECORDING}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        />
        <Text style={styles.voiceHint}>Hold mic and say: "I have been doing this for 8 years, I am 32 years old."</Text>
      </View>
      
      {voiceState === VOICE_STATE.CONFIRMED && (extractedProfile?.experience !== undefined || extractedProfile?.age !== undefined) ? (
        <View style={styles.detectedBox}>
          <Text style={styles.detectedText}>
            Detected: {extractedProfile.experience !== undefined ? `${extractedProfile.experience} years` : ""} {extractedProfile.age !== undefined ? `| ${extractedProfile.age} yrs old` : ""}
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
  stepperContainer: {
    marginBottom: 30,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: 8,
  },
  stepperBtn: {
    backgroundColor: COLORS.primaryLight,
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  stepperInput: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    flex: 1,
  },
  voiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
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
  detectedText: { flex: 1, fontSize: 13, color: COLORS.text },
  useText: { color: COLORS.success, fontWeight: "700" },
  rejectText: { color: COLORS.textLight, fontSize: 18 },
});
