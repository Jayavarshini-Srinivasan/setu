import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import VoiceButton from "./VoiceButton";
import { useI18n } from "../context/I18nContext";

export default function VoiceQuestionCard({
  step,
  totalSteps,
  title,

  subtitle,

  transcript,

  options = [],

  /*
    SINGLE SELECT
  */
  selectedOption,

  /*
    MULTI SELECT
  */
  selectedOptions = [],

  onSelectOption,

  onStartRecording,

  onStopRecording,

  isRecording,

  isProcessing,

  onContinue,
}) {

  const { t } = useI18n();

  return (

    <View
      style={
        styles.container
      }
    >

      {/* PROGRESS BAR */}
      {step && totalSteps && (
        <View style={styles.progressContainer}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressSegment,
                index + 1 <= step ? styles.progressActive : styles.progressInactive,
              ]}
            />
          ))}
        </View>
      )}

      <Text
        style={
          styles.title
        }
      >
        {title}
      </Text>

      {
        subtitle ? (

          <Text
            style={
              styles.subtitle
            }
          >
            {subtitle}
          </Text>

        ) : null
      }

      {/* MIC BUTTON */}

      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        {isProcessing ? (
          <>
            <ActivityIndicator size="large" color="#E85D04" style={{ marginBottom: 10, padding: 18 }} />
            <Text style={{ color: '#E85D04', fontWeight: 'bold' }}>{t("analyzingResponse")}</Text>
          </>
        ) : (
          <>
            <Text style={{ marginBottom: 10, fontWeight: 'bold', fontSize: 18 }}>
              {isRecording ? "Recording... Release to stop" : "Hold to Speak"}
            </Text>
            <VoiceButton
              isRecording={isRecording}
              onPressIn={onStartRecording}
              onPressOut={onStopRecording}
            />
            {!isRecording && <Text style={{ color: '#666', marginTop: 10 }}>Press and hold the button while talking</Text>}
          </>
        )}
      </View>

      {/* TRANSCRIPT */}

      {
        transcript ? (

          <View
            style={
              styles.transcriptBox
            }
          >

            <Text
              style={
                styles.transcriptLabel
              }
            >
              Transcript
            </Text>

            <Text
              style={
                styles.transcriptText
              }
            >
              {transcript}
            </Text>

          </View>

        ) : null
      }

      {/* OPTIONS */}

      <ScrollView
        contentContainerStyle={
          styles.optionsContainer
        }
      >

        {
          options.map(
            (option) => {

              /*
                SUPPORT:
                - SINGLE SELECT
                - MULTI SELECT
              */
              const isSelected =

                selectedOptions
                  .length > 0

                  ? selectedOptions.includes(
                      option
                    )

                  : selectedOption ===
                    option;

              return (

                <TouchableOpacity
                  key={option}

                  style={[
                    styles.optionChip,

                    isSelected &&
                      styles.selectedChip,
                  ]}

                  onPress={() =>
                    onSelectOption(
                      option
                    )
                  }
                >

                  <Text
                    style={[
                      styles.optionText,

                      isSelected &&
                        styles.selectedText,
                    ]}
                  >
                    {option}
                  </Text>

                </TouchableOpacity>
              );
            }
          )
        }

      </ScrollView>

      {/* CONTINUE */}

      <TouchableOpacity
        style={
          styles.continueButton
        }

        onPress={
          onContinue
        }
      >

        <Text
          style={
            styles.continueText
          }
        >
          Continue
        </Text>

      </TouchableOpacity>

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      padding: 24,
      paddingTop: 40,
      justifyContent: "flex-start", // changed from center to allow progress bar at top
      backgroundColor: "#FAF9F6", // Premium off-white
    },

    progressContainer: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 30,
    },

    progressSegment: {
      flex: 1,
      height: 4,
      borderRadius: 2,
    },

    progressActive: {
      backgroundColor: "#E85D04",
    },

    progressInactive: {
      backgroundColor: "#E5E7EB",
    },

    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#111827",
      marginBottom: 10,
    },

    subtitle: {
      fontSize: 16,
      color: "#6B7280",
      marginBottom: 32,
      lineHeight: 24,
    },

    transcriptBox: {
      backgroundColor: "#FFFFFF",
      padding: 16,
      borderRadius: 12,
      marginBottom: 30,
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },

    transcriptLabel: {
      fontWeight: "bold",
      color: "#9CA3AF",
      fontSize: 12,
      textTransform: "uppercase",
      marginBottom: 8,
    },

    transcriptText: {
      fontSize: 16,
      color: "#1F2937",
      fontStyle: "italic",
    },

    optionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 40,
    },

    optionChip: {
      backgroundColor: "#FFFFFF",
      borderWidth: 1.5,
      borderColor: "#E5E7EB",
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },

    selectedChip: {
      backgroundColor: "#FFF4ED",
      borderColor: "#E85D04", // Premium Orange
    },

    optionText: {
      fontSize: 16,
      color: "#4B5563",
      fontWeight: "600",
    },

    selectedText: {
      color: "#E85D04",
      fontWeight: "bold",
    },

    continueButton: {
      backgroundColor: "#E85D04", // Premium Orange
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 10,
      shadowColor: "#E85D04",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },

    continueText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "bold",
    },
  });