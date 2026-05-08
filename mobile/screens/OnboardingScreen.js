import { useState } from "react";

import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from "react-native";

export default function OnboardingScreen({
  navigation,
}) {
  const [role, setRole] = useState("delivery");

  const [skills, setSkills] = useState("");

  const [location, setLocation] =
    useState("");

  const [experience, setExperience] =
    useState("");

  const handleSubmit = () => {
    const workerProfile = {
      role,
      skills: skills.split(","),
      location,
      experience: Number(experience),
    };

    navigation.navigate("Results", {
      workerProfile,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Worker Profile
      </Text>

      <Text>Role</Text>

      <TextInput
        style={styles.input}
        value={role}
        onChangeText={setRole}
      />

      <Text>Skills</Text>

      <TextInput
        style={styles.input}
        value={skills}
        onChangeText={setSkills}
        placeholder="driving,navigation"
      />

      <Text>Location</Text>

      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
      />

      <Text>Experience</Text>

      <TextInput
        style={styles.input}
        value={experience}
        onChangeText={setExperience}
        keyboardType="numeric"
      />

      <Button
        title="Submit"
        onPress={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },

  heading: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
  },
});