import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import useVoiceRecorder, { VOICE_STATE } from "../hooks/useVoiceRecorder";
import VoiceButton from "../components/VoiceButton";
import { useOnboarding } from "../context/OnboardingContext";
import { useI18n } from "../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../components/OnboardingStepLayout";
import { COLORS, BORDER_RADIUS } from "../constants/theme";

const COMMON_CITIES = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur"];
const RADIUS_OPTIONS = ["Within 2km", "Within 5km", "Within 10km", "Within 25km", "Open to relocation"];

export default function LocationQuestionScreen({ navigation }) {
  const { onboardingData, updateField, addTranscript } = useOnboarding();
  const { t } = useI18n();

  const [city, setCity] = useState(onboardingData.location || "");
  const [workRadius, setWorkRadius] = useState(onboardingData.workRadius || "");
  const [showSuggestions, setShowSuggestions] = useState(false);

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
      if (ep?.location) setCity(ep.location);
      if (ep?.workRadius) setWorkRadius(ep.workRadius);
    },
  });

  const filteredCities = COMMON_CITIES.filter(c => c.toLowerCase().includes(city.toLowerCase()) && c.toLowerCase() !== city.toLowerCase());

  const handleContinue = () => {
    if (!city.trim() || !workRadius) {
      Alert.alert(t("required") || "Required", "Please provide your city and work radius.");
      return;
    }
    updateField("location", city.trim());
    updateField("workRadius", workRadius);
    navigation.navigate("PreferencesQuestion");
  };

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Location (4/5)"
      step={4}
      title="Where do you live?"
      subtitle="This helps us find jobs near you"
      onContinue={handleContinue}
      continueDisabled={!city.trim() || !workRadius}
      variant="labour"
    >
      <Text style={os.label}>CITY / AREA</Text>
      <View style={{ zIndex: 10 }}>
        <TextInput
          style={styles.input}
          placeholder="e.g. Chennai"
          placeholderTextColor={COLORS.textLight}
          value={city}
          onChangeText={(v) => { setCity(v); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
        />
        {showSuggestions && city.trim().length > 0 && filteredCities.length > 0 && (
          <View style={styles.autocompleteBox}>
            {filteredCities.map(c => (
              <TouchableOpacity key={c} style={styles.suggestionItem} onPress={() => { setCity(c); setShowSuggestions(false); }}>
                <Text style={styles.suggestionText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <Text style={[os.label, { marginTop: 24, marginBottom: 12 }]}>HOW FAR CAN YOU TRAVEL?</Text>
      <View style={styles.cardList}>
        {RADIUS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.cardRow, workRadius === opt && styles.cardRowSelected]}
            onPress={() => setWorkRadius(opt)}
          >
            <View style={styles.radioOuter}>
              {workRadius === opt && <View style={styles.radioInner} />}
            </View>
            <Text style={[styles.cardText, workRadius === opt && styles.cardTextSelected]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.voiceRow}>
        <VoiceButton
          isRecording={voiceState === VOICE_STATE.RECORDING}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        />
        <Text style={styles.voiceHint}>Hold mic and say: "I live in Chennai, I can travel up to 10 km."</Text>
      </View>
      
      {voiceState === VOICE_STATE.CONFIRMED && (extractedProfile?.location || extractedProfile?.workRadius) ? (
        <View style={styles.detectedBox}>
          <Text style={styles.detectedText}>
            Detected: {extractedProfile.location ? `${extractedProfile.location}` : ""} {extractedProfile.workRadius ? `| ${extractedProfile.workRadius}` : ""}
          </Text>
          <TouchableOpacity onPress={confirmExtraction}>
            <Text style={styles.useText}>? Keep</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={rejectExtraction}>
            <Text style={styles.rejectText}>?</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
  autocompleteBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: BORDER_RADIUS.md,
    borderBottomRightRadius: BORDER_RADIUS.md,
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionText: {
    fontSize: 15,
    color: COLORS.text,
  },
  cardList: {
    gap: 12,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
  },
  cardRowSelected: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textLight,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },
  cardText: { fontSize: 16, color: COLORS.textSecondary, fontWeight: "500" },
  cardTextSelected: { color: COLORS.accent, fontWeight: "700" },
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
