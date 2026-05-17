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

      <PrimaryButton
            title="Apply"
            onPress={() =>
                onApply(job)
            }
        />
        <Text>
  {job.aiSummary}
</Text>

<Text>
  Skill Match:
  {job.metrics?.skillMatch}%
</Text>

<Text>
  Missing:
  {
    job.analysis
      ?.missingSkills
      ?.join(", ")
  }
</Text>

<Text>
  Type:
  {
    job.recommendationType
  }
</Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        "#fff",

      borderRadius: 12,

      padding: 16,

      marginBottom: 16,

      elevation: 2,
    },

    title: {
      fontSize: 18,

      fontWeight: "bold",

      marginBottom: 10,

      color: "#2c3e50",
    },

    meta: {
      marginBottom: 6,

      color: "#555",
    },

    match: {
      marginTop: 10,

      marginBottom: 15,

      fontWeight: "bold",

      color: "#27ae60",
    },

    button: {
      backgroundColor:
        "#3498db",

      paddingVertical: 12,

      borderRadius: 8,

      alignItems:
        "center",
    },

    buttonText: {
      color: "white",

      fontWeight: "bold",

      fontSize: 16,
    },
  });