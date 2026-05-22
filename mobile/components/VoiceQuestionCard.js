import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";

import { useEffect, useRef } from "react";

import VoiceButton from "./VoiceButton";
import { useI18n } from "../context/I18nContext";
import { VOICE_STATE } from "../hooks/useVoiceRecorder";



export default function VoiceQuestionCard({
  step,
  totalSteps,
  title,
  subtitle,
  transcript,
  extractionLabel  = "Detected",
  extractionDisplay,
  options = [],
  selectedOption,
  selectedOptions = [],
  onSelectOption,
  voiceState = VOICE_STATE.IDLE,
  onStartRecording,
  onStopRecording,
  onPlayRecording,
  onRetakeRecording,
  onSubmitRecording,
  onConfirm,
  onReject,
  onContinue,
}) {

  const { t } = useI18n();

  /* ── Pulse animation for RECORDING state ── */
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {

    if (voiceState === VOICE_STATE.RECORDING) {

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 550,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 550,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }

  }, [voiceState]);

  const renderProcessing = () => (
    <View style={styles.voiceCenter}>
      <ActivityIndicator
        size="large"
        color="#E85D26"
        style={{ marginBottom: 14 }}
      />
      <Text style={styles.processingLabel}>
        {t("analyzingResponse") || "Analysing your response…"}
      </Text>
    </View>
  );

  const renderConfirmed = () => (
    <View style={styles.confirmedBox}>

      <View style={styles.confirmedHeader}>
        <Text style={styles.confirmedIcon}>🤖</Text>
        <Text style={styles.confirmedTitle}>
          {extractionLabel}
        </Text>
      </View>

      <Text style={styles.confirmedValue}>
        {extractionDisplay || transcript || "—"}
      </Text>

      {transcript ? (
        <Text style={styles.confirmedTranscript}>
          "{transcript}"
        </Text>
      ) : null}

      <Text style={styles.confirmedPrompt}>
        {t("isThisCorrect") || "Is this correct?"}
      </Text>

      <View style={styles.confirmedActions}>

        <TouchableOpacity
          style={[styles.confirmedBtn, styles.rejectBtn]}
          onPress={onReject}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmedBtnText}>🔄  {t("tryAgain") || "Try Again"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.confirmedBtn, styles.acceptBtn]}
          onPress={onConfirm}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmedBtnText}>✓  {t("looksRight") || "Looks Right"}</Text>
        </TouchableOpacity>

      </View>

    </View>
  );

  const renderReview = () => (
    <View style={styles.voiceCenter}>

      <View style={styles.recordedBadge}>
        <Text style={styles.recordedBadgeText}>🎙️  {t("recordingReady") || "Recording ready"}</Text>
      </View>

      <View style={styles.actionRow}>

        <TouchableOpacity
          style={[styles.actionBtn, styles.playBtn]}
          onPress={onPlayRecording}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>▶</Text>
          <Text style={styles.actionBtnText}>{t("play") || "Play"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.retakeBtn]}
          onPress={onRetakeRecording}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>🔄</Text>
          <Text style={styles.actionBtnText}>{t("retake") || "Retake"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.submitBtn]}
          onPress={onSubmitRecording}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>✅</Text>
          <Text style={styles.actionBtnText}>{t("submit") || "Submit"}</Text>
        </TouchableOpacity>

      </View>

    </View>
  );

  const renderMic = () => (
    <View style={styles.voiceCenter}>

      <Text style={styles.holdLabel}>
        {voiceState === VOICE_STATE.RECORDING
          ? "🔴  " + (t("recordingReleaseToStop") || "Recording…  release to stop")
          : t("holdToSpeak") || "Hold to speak"}
      </Text>

      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <VoiceButton
          isRecording={voiceState === VOICE_STATE.RECORDING}
          onPressIn={onStartRecording}
          onPressOut={onStopRecording}
        />
      </Animated.View>

      {voiceState === VOICE_STATE.IDLE && (
        <Text style={styles.hintText}>
          {t("pressAndHoldHint") || "Press and hold the button while talking"}
        </Text>
      )}

    </View>
  );

  const renderVoiceSection = () => {
    switch (voiceState) {
      case VOICE_STATE.PROCESSING: return renderProcessing();
      case VOICE_STATE.CONFIRMED:  return renderConfirmed();
      case VOICE_STATE.RECORDED:   return renderReview();
      default:                     return renderMic();
    }
  };

  return (
    <View style={styles.container}>

      {step && totalSteps && (
        <View style={styles.progressContainer}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                i + 1 <= step
                  ? styles.progressActive
                  : styles.progressInactive,
              ]}
            />
          ))}
        </View>
      )}

      <Text style={styles.title}>{title}</Text>

      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}

      {renderVoiceSection()}

      {voiceState !== VOICE_STATE.CONFIRMED && (
        <ScrollView contentContainerStyle={styles.optionsContainer}>
          {options.map((option) => {

            const isObject = typeof option === "object" && option !== null;
            const optionValue = isObject ? option.value : option;
            const optionLabel = isObject ? option.label : option;

            const isSelected =
              selectedOptions.length > 0
                ? selectedOptions.includes(optionValue)
                : selectedOption === optionValue;

            return (
              <TouchableOpacity
                key={optionValue}
                style={[
                  styles.optionChip,
                  isSelected && styles.selectedChip,
                ]}
                onPress={() => onSelectOption(optionValue)}
              >
                <Text style={[
                  styles.optionText,
                  isSelected && styles.selectedText,
                ]}>
                  {optionLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {voiceState !== VOICE_STATE.CONFIRMED && (
        <TouchableOpacity
          style={styles.continueButton}
          onPress={onContinue}
        >
          <Text style={styles.continueText}>{t("continue") || "Continue"}</Text>
        </TouchableOpacity>
      )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
    justifyContent: "flex-start",
    backgroundColor: "#F7F5F2",
  },

  progressContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 30,
  },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  progressActive:  { backgroundColor: "#E85D26" },
  progressInactive:{ backgroundColor: "rgba(26,26,46,0.12)" },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1A1A2E",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B6B80",
    marginBottom: 26,
    lineHeight: 22,
  },

  voiceCenter: {
    alignItems: "center",
    marginBottom: 24,
  },
  holdLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 14,
  },
  hintText: { color: "#6B6B80", fontSize: 13, marginTop: 10 },
  processingLabel: { color: "#E85D26", fontWeight: "700", fontSize: 15 },

  recordedBadge: {
    backgroundColor: "#F0FDF4",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  recordedBadgeText: { color: "#15803D", fontWeight: "700", fontSize: 14 },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 80,
  },
  playBtn:    { backgroundColor: "#E85D26" },
  retakeBtn:  { backgroundColor: "#6B6B80" },
  submitBtn:  { backgroundColor: "#16A34A" },
  actionIcon: { fontSize: 18, marginBottom: 3 },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  confirmedBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#E85D26",
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  confirmedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  confirmedIcon: { fontSize: 20 },
  confirmedTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B6B80",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  confirmedValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A2E",
    marginBottom: 8,
  },
  confirmedTranscript: {
    fontSize: 13,
    color: "#6B6B80",
    fontStyle: "italic",
    marginBottom: 16,
    lineHeight: 20,
  },
  confirmedPrompt: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 14,
  },
  confirmedActions: {
    flexDirection: "row",
    gap: 10,
  },
  confirmedBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  rejectBtn:  { backgroundColor: "#6B6B80" },
  acceptBtn:  { backgroundColor: "#E85D26" },
  confirmedBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  /* ── Options ── */
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  optionChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "rgba(26,26,46,0.12)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    elevation: 0,
  },
  selectedChip: {
    backgroundColor: "#FDF0EB",
    borderColor: "#E85D26",
  },
  optionText: { fontSize: 15, color: "#6B6B80", fontWeight: "600" },
  selectedText: { color: "#E85D26", fontWeight: "bold" },

  continueButton: {
    backgroundColor: "#E85D26",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  continueText: { color: "#FFFFFF", fontSize: 17, fontWeight: "bold" },
});