import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import VoiceButton from "./VoiceButton";
import { VOICE_STATE } from "../hooks/useVoiceRecorder";
import { COLORS, BORDER_RADIUS, SHADOWS } from "../constants/theme";

export default function VoiceTranscriptionControls({
  voiceState,
  transcript,
  extractedProfile,
  errorMessage,
  isPlaying,
  hint,
  detectedLabel = "Detected",
  detectedValue,
  onStartRecording,
  onStopRecording,
  onPlayRecording,
  onRetakeRecording,
  onSubmitRecording,
  onTranscriptChange,
  onConfirm,
  onReject,
}) {
  const isRecording = voiceState === VOICE_STATE.RECORDING;
  const isRecorded = voiceState === VOICE_STATE.RECORDED;
  const isProcessing = voiceState === VOICE_STATE.PROCESSING;
  const isConfirmed = voiceState === VOICE_STATE.CONFIRMED;

  return (
    <View style={styles.container}>
      {!isRecorded && !isProcessing && !isConfirmed ? (
        <View style={styles.recordRow}>
          <VoiceButton
            isRecording={isRecording}
            onPressIn={onStartRecording}
            onPressOut={onStopRecording}
          />
          <Text style={styles.voiceHint}>
            {isRecording ? "Release to stop recording." : hint}
          </Text>
        </View>
      ) : null}

      {isRecorded ? (
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Ionicons name="mic-outline" size={18} color={COLORS.success} />
            <Text style={styles.previewTitle}>Recording ready</Text>
          </View>
          <Text style={styles.previewText}>
            Play it back, retake it, or submit it for transcription.
          </Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onPlayRecording}>
              <Ionicons name={isPlaying ? "volume-high" : "play"} size={16} color={COLORS.primary} />
              <Text style={styles.secondaryBtnText}>{isPlaying ? "Playing" : "Play"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onRetakeRecording}>
              <Ionicons name="refresh" size={16} color={COLORS.textSecondary} />
              <Text style={[styles.secondaryBtnText, { color: COLORS.textSecondary }]}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={onSubmitRecording}>
              <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {isProcessing ? (
        <View style={styles.previewCard}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.processingText}>Transcribing your recording...</Text>
        </View>
      ) : null}

      {isConfirmed ? (
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
            <Text style={styles.previewTitle}>Transcript preview</Text>
          </View>

          {detectedValue || extractedProfile ? (
            <View style={styles.detectedBox}>
              <Text style={styles.detectedLabel}>{detectedLabel}</Text>
              <Text style={styles.detectedValue}>{detectedValue || "Profile details detected"}</Text>
            </View>
          ) : null}

          <TextInput
            style={styles.transcriptInput}
            value={transcript}
            onChangeText={onTranscriptChange}
            multiline
            textAlignVertical="top"
            placeholder="Review or edit transcription..."
            placeholderTextColor={COLORS.textLight}
          />

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onPlayRecording}>
              <Ionicons name={isPlaying ? "volume-high" : "play"} size={16} color={COLORS.primary} />
              <Text style={styles.secondaryBtnText}>{isPlaying ? "Playing" : "Play"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onReject}>
              <Ionicons name="refresh" size={16} color={COLORS.textSecondary} />
              <Text style={[styles.secondaryBtnText, { color: COLORS.textSecondary }]}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, !transcript?.trim() && styles.disabledBtn]}
              onPress={onConfirm}
              disabled={!transcript?.trim()}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  voiceHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 19,
  },
  previewCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
    ...SHADOWS.sm,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  previewText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: COLORS.surface,
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  submitBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: COLORS.primary,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  disabledBtn: {
    opacity: 0.5,
  },
  processingText: {
    marginTop: 10,
    textAlign: "center",
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  detectedBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.sm,
    padding: 10,
    marginBottom: 10,
  },
  detectedLabel: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  detectedValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
  },
  transcriptInput: {
    minHeight: 86,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    padding: 10,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  errorText: {
    marginTop: 8,
    color: COLORS.error,
    fontSize: 12,
    fontWeight: "600",
  },
});
