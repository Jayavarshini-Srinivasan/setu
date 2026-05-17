import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function ErrorState({
  message,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Something went wrong
      </Text>

      <Text style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      padding: 20,

      borderRadius: 8,

      backgroundColor:
        "#f8d7da",

      margin: 20,
    },

    title: {
      fontSize: 18,

      fontWeight: "bold",

      color: "#721c24",

      marginBottom: 10,
    },

    message: {
      color: "#721c24",
    },
  });