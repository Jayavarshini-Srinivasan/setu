import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function VoiceQuestionCard({

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

  onVoicePress,

  onContinue,
}) {

  return (

    <View
      style={
        styles.container
      }
    >

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

      <TouchableOpacity
        style={
          styles.voiceButton
        }

        onPress={
          onVoicePress
        }
      >

        <Text
          style={
            styles.voiceText
          }
        >
          🎤 Tap to Speak
        </Text>

      </TouchableOpacity>

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

      justifyContent:
        "center",

      backgroundColor:
        "#fff",
    },

    title: {
      fontSize: 30,

      fontWeight: "bold",

      marginBottom: 12,
    },

    subtitle: {
      fontSize: 16,

      color: "#666",

      marginBottom: 30,
    },

    voiceButton: {
      backgroundColor:
        "#27ae60",

      padding: 18,

      borderRadius: 16,

      alignItems:
        "center",

      marginBottom: 30,
    },

    voiceText: {
      color: "#fff",

      fontSize: 18,

      fontWeight: "bold",
    },

    transcriptBox: {
      backgroundColor:
        "#f4f6f8",

      padding: 18,

      borderRadius: 12,

      marginBottom: 30,
    },

    transcriptLabel: {
      fontWeight: "bold",

      marginBottom: 10,
    },

    transcriptText: {
      fontSize: 16,

      color: "#333",
    },

    optionsContainer: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: 12,

      marginBottom: 40,
    },

    optionChip: {
      borderWidth: 1,

      borderColor:
        "#ccc",

      borderRadius: 30,

      paddingVertical: 12,

      paddingHorizontal: 18,
    },

    selectedChip: {
      backgroundColor:
        "#2980b9",

      borderColor:
        "#2980b9",
    },

    optionText: {
      fontSize: 16,
    },

    selectedText: {
      color: "#fff",

      fontWeight: "bold",
    },

    continueButton: {
      backgroundColor:
        "#000",

      padding: 18,

      borderRadius: 16,

      alignItems:
        "center",
    },

    continueText: {
      color: "#fff",

      fontSize: 18,

      fontWeight: "bold",
    },
  });