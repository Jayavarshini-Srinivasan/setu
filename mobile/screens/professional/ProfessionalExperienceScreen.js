import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useVoiceRecorder from "../../hooks/useVoiceRecorder";
import VoiceTranscriptionControls from "../../components/VoiceTranscriptionControls";
import { useOnboarding } from "../../context/OnboardingContext";
import { useI18n } from "../../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../../components/OnboardingStepLayout";
import { COLORS, BORDER_RADIUS } from "../../constants/theme";

const Stepper = ({ value, min, max, onChange, label }) => (
  <View style={styles.stepperContainer}>
    <Text style={styles.stepperLabel}>{label}</Text>
    <View style={styles.stepperRow}>
      <TouchableOpacity style={styles.stepperBtn} onPress={() => onChange(Math.max(min, Number(value) - 1))}>
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
      <TouchableOpacity style={styles.stepperBtn} onPress={() => onChange(Math.min(max, Number(value) + 1))}>
        <Text style={styles.stepperBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function ProfessionalExperienceScreen({ navigation }) {
  const { onboardingData, updateField, addTranscript } = useOnboarding();
  const { t } = useI18n();

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [startYear, setStartYear] = useState(2020);
  const [endYear, setEndYear] = useState(2023);
  const [isPresent, setIsPresent] = useState(false);
  const [achievements, setAchievements] = useState("");

  const existingExperience = onboardingData.experienceDetails || [];

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
    onResult: ({ transcript: tx, extractedProfile: ep }) => {
      if (tx) addTranscript(tx);
      const extractedEntries = ep?.experienceDetails || [];
      if (extractedEntries.length > 0) {
        // Read fresh experienceDetails at call-time to avoid stale closure
        const currentEntries = onboardingData.experienceDetails || [];
        const merged = [...currentEntries];
        for (const entry of extractedEntries) {
          if (!entry.company && !entry.role) continue;
          const isDuplicate = merged.some(
            (e) =>
              String(e.company || "").toLowerCase().trim() ===
                String(entry.company || "").toLowerCase().trim() &&
              String(e.role || "").toLowerCase().trim() ===
                String(entry.role || "").toLowerCase().trim()
          );
          if (!isDuplicate) merged.push(entry);
        }
        updateField("experienceDetails", merged);
      }
    },
    screenType: "experience",
  });

  const canAddExperience = Boolean(company.trim()) && Boolean(role.trim());
  const canContinue = existingExperience.length > 0 || (company.trim() && role.trim());

  const handleAddExperience = () => {
    if (!canAddExperience) {
      Alert.alert(t("required") || "Required", "Please provide at least company and role.");
      return;
    }

    const newExperience = {
      company: company.trim(),
      role: role.trim(),
      startYear: startYear,
      endYear: isPresent ? "Present" : endYear,
      achievements: achievements.trim(),
    };

    const updatedExperience = [...existingExperience, newExperience];

    updateField("experienceDetails", updatedExperience);

    setCompany("");
    setRole("");
    setAchievements("");
    setIsPresent(false);

    return updatedExperience;
  };

  const removeExperience = (index) => {
    const updated = [...existingExperience];
    updated.splice(index, 1);
    updateField("experienceDetails", updated);
  };

  const handleContinue = () => {
    let experienceForSave = existingExperience;

    if (canAddExperience) {
      experienceForSave = handleAddExperience() || existingExperience;
    } else if (existingExperience.length === 0) {
      Alert.alert(t("required") || "Required", "Please add at least one work experience.");
      return;
    }
    
    // Calculate total years
    const totalYears = experienceForSave.reduce((sum, item) => {
      if (item.startYear) {
        const end = item.endYear === "Present" ? new Date().getFullYear() : Number(item.endYear);
        return sum + Math.max(1, end - Number(item.startYear));
      }
      return sum + (Number(item.years) || 1);
    }, 0);
    
    updateField("experience", totalYears);

    navigation.navigate("CareerGoals");
  };

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Experience (4/6)"
      step={4}
      totalSteps={6}
      badge="PROFESSIONAL"
      title="Work Experience"
      subtitle="Where have you worked?"
      onContinue={handleContinue}
      continueDisabled={!canContinue}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {existingExperience.map((item, index) => (
          <View key={index} style={styles.experienceCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.role}</Text>
              <Text style={styles.cardSubtitle}>{item.company}</Text>
              <Text style={styles.cardDate}>{item.startYear || "?"} - {item.endYear || "?"}</Text>
            </View>
            <TouchableOpacity onPress={() => removeExperience(index)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.addCard}>
          <Text style={os.label}>{existingExperience.length > 0 ? "ADD ANOTHER ROLE" : "ADD EXPERIENCE"}</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Job Title"
            placeholderTextColor={COLORS.textLight}
            value={role}
            onChangeText={setRole}
          />
          <TextInput
            style={styles.input}
            placeholder="Company Name"
            placeholderTextColor={COLORS.textLight}
            value={company}
            onChangeText={setCompany}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Stepper label="START YEAR" value={startYear} min={1980} max={2026} onChange={setStartYear} />
            </View>
            <View style={{ width: 16 }} />
            <View style={{ flex: 1 }}>
              {!isPresent ? (
                <Stepper label="END YEAR" value={endYear} min={startYear} max={2026} onChange={setEndYear} />
              ) : (
                <View style={[styles.stepperContainer, { opacity: 0.5 }]}>
                  <Text style={styles.stepperLabel}>END YEAR</Text>
                  <View style={[styles.stepperRow, { justifyContent: "center", backgroundColor: COLORS.background }]}>
                    <Text style={{ fontWeight: "bold", color: COLORS.textSecondary }}>PRESENT</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.presentToggle} onPress={() => setIsPresent(!isPresent)}>
            <View style={styles.checkbox}>{isPresent && <View style={styles.checkboxInner} />}</View>
            <Text style={styles.presentText}>I currently work here</Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholder="Brief description of your role..."
            placeholderTextColor={COLORS.textLight}
            multiline
            value={achievements}
            onChangeText={setAchievements}
          />

          <TouchableOpacity style={styles.addBtn} onPress={handleAddExperience}>
            <Text style={styles.addBtnText}>+ Add Experience</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.voiceSection}>
          <VoiceTranscriptionControls
            voiceState={voiceState}
            transcript={transcript}
            extractedProfile={extractedProfile}
            errorMessage={errorMessage}
            isPlaying={isPlaying}
            hint={'Hold mic and say: "I worked at ABC for 3 years as an accountant, then 2 years at XYZ Ltd."'}
            detectedValue={extractedProfile?.experienceDetails?.length ? `Detected ${extractedProfile.experienceDetails.length} roles` : ""}
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
              <Text style={styles.detectedText}>Detected {extractedProfile.experienceDetails.length} roles</Text>
              <View style={styles.detectedActions}>
                <TouchableOpacity onPress={confirmExtraction}><Text style={styles.confirmText}>? Add</Text></TouchableOpacity>
                <TouchableOpacity onPress={rejectExtraction}><Text style={styles.rejectText}>✕</Text></TouchableOpacity>
              </View>
            </View>
          )}
        </View>

      </ScrollView>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  experienceCard: { flexDirection: "row", backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, padding: 16, marginBottom: 12, alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.text },
  cardSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  cardDate: { fontSize: 12, color: COLORS.primary, fontWeight: "600", marginTop: 4 },
  deleteBtn: { padding: 8 },
  addCard: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, padding: 16, marginTop: 12 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, padding: 12, backgroundColor: COLORS.surface, marginBottom: 12, fontSize: 15 },
  row: { flexDirection: "row" },
  stepperContainer: { marginBottom: 12 },
  stepperLabel: { fontSize: 11, fontWeight: "bold", color: COLORS.textLight, marginBottom: 4 },
  stepperRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, padding: 4, height: 44 },
  stepperBtn: { backgroundColor: COLORS.primaryLight, width: 36, height: 36, borderRadius: BORDER_RADIUS.sm, alignItems: "center", justifyContent: "center" },
  stepperBtnText: { fontSize: 20, color: COLORS.primary, fontWeight: "bold" },
  stepperInput: { fontSize: 16, fontWeight: "bold", color: COLORS.text, textAlign: "center", flex: 1 },
  presentToggle: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: COLORS.textLight, borderRadius: 4, marginRight: 8, alignItems: "center", justifyContent: "center" },
  checkboxInner: { width: 10, height: 10, backgroundColor: COLORS.primary, borderRadius: 2 },
  presentText: { fontSize: 14, color: COLORS.textSecondary },
  addBtn: { backgroundColor: COLORS.primaryLight, padding: 12, borderRadius: BORDER_RADIUS.md, alignItems: "center" },
  addBtnText: { color: COLORS.primary, fontWeight: "bold", fontSize: 14 },
  voiceSection: { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  voiceHint: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  voiceRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  detectedBox: { marginTop: 16, backgroundColor: COLORS.primaryLight, padding: 14, borderRadius: 12, flexDirection: "row", alignItems: "center" },
  detectedText: { fontSize: 13, fontWeight: "600", color: COLORS.text, flex: 1 },
  detectedActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  confirmText: { color: COLORS.success, fontWeight: "700" },
  rejectText: { color: COLORS.textLight, fontSize: 18 },
});
