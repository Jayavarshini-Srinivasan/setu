import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { useEffect, useRef } from "react";
import { setuTokens } from "../constants/theme";

export default function SplashScreen() {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>🌉</Text>
        </View>
        <Text style={styles.appName}>Setu</Text>
        <Text style={styles.tagline}>Bridging work and workers.</Text>
        
        <View style={styles.emojiRow}>
          <Text style={styles.emoji}>🌉</Text>
          <Text style={styles.emoji}>✊</Text>
          <Text style={styles.emoji}>💼</Text>
        </View>

        <View style={styles.loadingContainer}>
          <View style={styles.loadingTrack}>
            <View style={styles.loadingFill} />
          </View>
          <Text style={styles.loadingText}>Loading your experience...</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: setuTokens.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 32,
  },
  logoBox: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: setuTokens.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 44,
  },
  appName: {
    fontFamily: "Playfair Display",
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 6,
  },
  tagline: {
    fontFamily: "DM Sans",
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    marginBottom: 24,
  },
  emojiRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 40,
  },
  emoji: {
    fontSize: 22,
  },
  loadingContainer: {
    width: "100%",
    alignItems: "center",
  },
  loadingTrack: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 99,
    marginBottom: 12,
    overflow: "hidden",
  },
  loadingFill: {
    width: "70%",
    height: "100%",
    backgroundColor: setuTokens.primary,
    borderRadius: 99,
  },
  loadingText: {
    fontFamily: "DM Sans",
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
  },
});

