import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import {
  formatSalary,
} from "../utils/formatters";

import PrimaryButton from "./PrimaryButton";

export default function JobCard({
  job,
  onApply,
}) {

  return (

    <View style={styles.card}>

      <Text style={styles.title}>
        {job.title}
      </Text>

      <Text style={styles.meta}>
        📍 {job.location}
      </Text>

      <Text style={styles.meta}>
        💰{" "}
        {formatSalary(
          job.salary
        )}
      </Text>

      <Text style={styles.match}>
        Overall Score:{" "}
        {job.matchScore}%
      </Text>

      {/* AI SUMMARY */}

      <Text style={styles.summary}>
        {job.aiSummary}
      </Text>

      {/* METRICS */}

      <Text style={styles.metric}>
        Skill Match:
        {" "}
        {
          job.metrics
            ?.skillMatch
        }%
      </Text>

      <Text style={styles.metric}>
        Recommendation:
        {" "}
        {
          job.recommendationType
        }
      </Text>

      {/* IMPROVE MATCH */}

      {
        (
          job.missingSkills || []
        ).length > 0 && (

          <View
            style={
              styles.improvementSection
            }
          >

            <Text
              style={
                styles.improvementTitle
              }
            >
              Improve Match
            </Text>

            <Text
              style={
                styles.improvementText
              }
            >
              Potential Match:
              {" "}
              {job.matchScore}%
              →
              {
                job.potentialMatchScore
              }%
            </Text>

            <View
              style={
                styles.skillsContainer
              }
            >

              {
                job.missingSkills.map(
                  (
                    skill,
                    index
                  ) => (

                    <View
                      key={index}
                      style={
                        styles.skillChip
                      }
                    >

                      <Text
                        style={
                          styles.skillText
                        }
                      >
                        {skill}
                      </Text>

                    </View>
                  )
                )
              }

            </View>

          </View>
        )
      }

      {/* APPLY */}

      <PrimaryButton
        title="Apply"
        onPress={() =>
          onApply(job)
        }
      />

    </View>
  );
}

const styles =
  StyleSheet.create({

    card: {

      backgroundColor:
        "#fff",

      borderRadius: 16,

      padding: 18,

      marginBottom: 18,

      elevation: 3,
    },

    title: {

      fontSize: 20,

      fontWeight: "bold",

      marginBottom: 12,

      color: "#111827",
    },

    meta: {

      marginBottom: 8,

      color: "#555",
    },

    match: {

      marginTop: 10,

      marginBottom: 16,

      fontWeight: "bold",

      fontSize: 17,

      color: "#16A34A",
    },

    summary: {

      fontSize: 15,

      lineHeight: 22,

      color: "#444",

      marginBottom: 16,
    },

    metric: {

      fontSize: 14,

      color: "#555",

      marginBottom: 8,
    },

    improvementSection: {

      marginTop: 18,

      paddingTop: 16,

      borderTopWidth: 1,

      borderTopColor:
        "#E5E7EB",

      marginBottom: 20,
    },

    improvementTitle: {

      fontSize: 18,

      fontWeight: "bold",

      marginBottom: 10,
    },

    improvementText: {

      fontSize: 15,

      color: "#555",

      marginBottom: 14,
    },

    skillsContainer: {

      flexDirection: "row",

      flexWrap: "wrap",

      gap: 10,
    },

    skillChip: {

      backgroundColor:
        "#EEF2FF",

      paddingVertical: 8,

      paddingHorizontal: 14,

      borderRadius: 30,
    },

    skillText: {

      color: "#3730A3",

      fontWeight: "600",
    },
  });