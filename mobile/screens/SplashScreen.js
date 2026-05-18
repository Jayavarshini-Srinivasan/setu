import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";

import { useEffect, useRef } from "react";

export default function SplashScreen() {

  const scale   = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse   = useRef(new Animated.Value(1)).current;

  useEffect(() => {

    /* Entrance */
    Animated.parallel([
      Animated.timing(opacity, {
        toValue:        1,
        duration:       500,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue:         1,
        tension:         60,
        friction:        8,
        useNativeDriver: true,
      }),
    ]).start(() => {

      /* Subtle pulse loop */
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue:         1.06,
            duration:        900,
            easing:          Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue:         1,
            duration:        900,
            easing:          Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

  }, []);

  return (
    <View style={styles.container}>

      <Animated.View
        style={[
          styles.logoWrap,
          { opacity, transform: [{ scale: Animated.multiply(scale, pulse) }] },
        ]}
      >
        <Text style={styles.logoEmoji}>🌉</Text>
        <Text style={styles.logoText}>Setu</Text>
      </Animated.View>

      <Animated.Text style={[styles.tagline, { opacity }]}>
        Your bridge to better employment
      </Animated.Text>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },

  logoWrap: {
    alignItems: "center",
    gap: 8,
  },

  logoEmoji: {
    fontSize: 72,
  },

  logoText: {
    fontSize: 52,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
  },

  tagline: {
    fontSize: 15,
    color: "#6B7280",
    letterSpacing: 0.3,
    marginTop: 8,
  },
});
