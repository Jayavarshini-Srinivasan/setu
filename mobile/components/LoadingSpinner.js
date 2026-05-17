import {
  ActivityIndicator,
  Text,
  View,
  StyleSheet,
} from "react-native";

export default function LoadingSpinner({
  text,
}) {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
      />

      <Text style={styles.text}>
        {text ||
          "Loading..."}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",

      padding: 20,
    },

    text: {
      marginTop: 10,

      fontSize: 16,
    },
  });