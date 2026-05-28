import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useVoiceRecorder from "../../hooks/useVoiceRecorder";
import VoiceTranscriptionControls from "../../components/VoiceTranscriptionControls";
import { useOnboarding } from "../../context/OnboardingContext";
import { useI18n } from "../../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../../components/OnboardingStepLayout";
import { COLORS, BORDER_RADIUS } from "../../constants/theme";

const DEGREES = ["10th", "12th", "Diploma", "BA", "BCom", "BSc", "BTech", "MBA", "MCom", "Other"];
const FIELDS = ["Commerce", "Science", "Arts", "Engineering", "Business Administration", "Computer Science", "Finance", "Accounting"];

const Stepper = ({ value, min, max, onChange, label }) => (
  <View style={styles.stepperContainer}>
    <Text style={os.label}>{label}</Text>
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

export default function EducationScreen({ navigation }) {
  const { onboardingData, updateField, addTranscript } = useOnboarding();
  const { t } = useI18n();

  const [degree, setDegree] = useState(onboardingData.education?.degree || "");
  const [institution, setInstitution] = useState(onboardingData.education?.institution || "");
  const [graduationYear, setGraduationYear] = useState(onboardingData.education?.graduationYear ? Number(onboardingData.education.graduationYear) : new Date().getFullYear());
  const [fieldOfStudy, setFieldOfStudy] = useState(onboardingData.education?.fieldOfStudy || "");
  const [showFieldSuggestions, setShowFieldSuggestions] = useState(false);

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
      if (ep?.education?.degree) setDegree(ep.education.degree);
      if (ep?.education?.institution) setInstitution(ep.education.institution);
      if (ep?.education?.graduationYear) setGraduationYear(Number(ep.education.graduationYear));
      if (ep?.education?.fieldOfStudy) setFieldOfStudy(ep.education.fieldOfStudy);
    },
    contextData: onboardingData,
  });

  const filteredFields = FIELDS.filter(f => f.toLowerCase().includes(fieldOfStudy.toLowerCase()) && f.toLowerCase() !== fieldOfStudy.toLowerCase());

  const handleContinue = () => {
    if (!degree || !institution.trim() || !fieldOfStudy.trim()) {
      Alert.alert(t("required") || "Required", "Please complete all required education fields");
      return;
    }

    updateField("education", {
      degree,
      institution,
      graduationYear,
      fieldOfStudy,
    });

    navigation.navigate("ProfessionalExperience");
  };

  const isFormValid = Boolean(degree) && Boolean(institution.trim()) && Boolean(fieldOfStudy.trim());

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Education (3/6)"
      step={3}
      totalSteps={6}
      badge="PROFESSIONAL"
      title="Education"
      subtitle="Where did you study?"
      onContinue={handleContinue}
      continueDisabled={!isFormValid}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        
        <Text style={os.label}>DEGREE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {DEGREES.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.degreeCard, degree === d && styles.degreeCardSelected]}
              onPress={() => setDegree(d)}
            >
              <Text style={[styles.degreeText, degree === d && styles.degreeTextSelected]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={os.inputRow}>
          <Ionicons name="business-outline" size={20} color={COLORS.textLight} style={os.inputIcon} />
          <TextInput
            style={os.inputFlex}
            placeholder="Institution / College name"
            placeholderTextColor={COLORS.textLight}
            value={institution}
            onChangeText={setInstitution}
          />
        </View>

        <View style={{ marginTop: 16 }}>
          <Stepper 
            label="GRADUATION YEAR"
            value={graduationYear}
            min={1950}
            max={2030}
            onChange={setGraduationYear}
          />
        </View>

        <View style={[os.inputRow, { marginTop: 16, zIndex: 10 }]}>
          <Ionicons name="book-outline" size={20} color={COLORS.textLight} style={os.inputIcon} />
          <TextInput
            style={os.inputFlex}
            placeholder="Field of study (e.g. Commerce)"
            placeholderTextColor={COLORS.textLight}
            value={fieldOfStudy}
            onChangeText={(v) => { setFieldOfStudy(v); setShowFieldSuggestions(true); }}
            onFocus={() => setShowFieldSuggestions(true)}
          />
        </View>
        
        {showFieldSuggestions && fieldOfStudy.trim().length > 0 && filteredFields.length > 0 && (
          <View style={styles.autocompleteBox}>
            {filteredFields.map(f => (
              <TouchableOpacity key={f} style={styles.suggestionItem} onPress={() => { setFieldOfStudy(f); setShowFieldSuggestions(false); }}>
                <Text style={styles.suggestionText}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.voiceSection}>
          <VoiceTranscriptionControls
            voiceState={voiceState}
            transcript={transcript}
            extractedProfile={extractedProfile}
            errorMessage={errorMessage}
            isPlaying={isPlaying}
            hint={'Hold mic and say: "I did BCom from Madras University in 2018."'}
            detectedValue={extractedProfile?.education ? `${extractedProfile.education.degree || ""} - ${extractedProfile.education.institution || ""}` : ""}
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
              <Text style={styles.detectedText}>{extractedProfile.education.degree} - {extractedProfile.education.institution}</Text>
              <View style={styles.detectedActions}>
                <TouchableOpacity onPress={confirmExtraction}><Text style={styles.confirmText}>✓ Keep</Text></TouchableOpacity>
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
  degreeCard: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, marginRight: 8 },
  degreeCardSelected: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  degreeText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: "500" },
  degreeTextSelected: { color: COLORS.primary, fontWeight: "700" },
  stepperContainer: { marginBottom: 16 },
  stepperRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, padding: 8 },
  stepperBtn: { backgroundColor: COLORS.primaryLight, width: 48, height: 48, borderRadius: BORDER_RADIUS.sm, alignItems: "center", justifyContent: "center" },
  stepperBtnText: { fontSize: 24, color: COLORS.primary, fontWeight: "bold" },
  stepperInput: { fontSize: 24, fontWeight: "bold", color: COLORS.text, textAlign: "center", flex: 1 },
  autocompleteBox: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderTopWidth: 0, borderBottomLeftRadius: BORDER_RADIUS.md, borderBottomRightRadius: BORDER_RADIUS.md, maxHeight: 150, zIndex: 10, marginTop: -4 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  suggestionText: { fontSize: 15, color: COLORS.text },
  voiceSection: { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  voiceHint: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  voiceRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  detectedBox: { marginTop: 16, backgroundColor: COLORS.primaryLight, padding: 14, borderRadius: 12, flexDirection: "row", alignItems: "center" },
  detectedText: { fontSize: 13, fontWeight: "600", color: COLORS.text, flex: 1 },
  detectedActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  confirmText: { color: COLORS.success, fontWeight: "700" },
  rejectText: { color: COLORS.textLight, fontSize: 18 },
});
