import {
  useEffect,
  useState,
} from "react";

import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";

import API from "../../services/api";

import {
  auth,
} from "../../services/firebase";

export default function LearningPathScreen() {

  /*
    STATE
  */
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    learningPath,
    setLearningPath,
  ] = useState(null);

  /*
    LOAD
  */
  useEffect(() => {

    fetchLearningPath();

  }, []);

  /*
    FETCH
  */
  const fetchLearningPath =
    async () => {

      try {

        const userId =
          auth.currentUser.uid;

        /*
          API
        */
        const response =
          await API.post(
            "/learning/path",
            {
              userId,
            }
          );

        setLearningPath(
          response.data
        );

      } catch (error) {

        console.log(error);

        Alert.alert(
          "Error",
          "Failed to load learning path"
        );

      } finally {

        setLoading(false);
      }
    };

  /*
    LOADING
  */
  if (loading) {

    return (

      <View
        style={
          styles.center
        }
      >

        <ActivityIndicator
          size="large"
        />

      </View>
    );
  }

  /*
    EMPTY
  */
  if (!learningPath) {

    return (

      <View
        style={
          styles.center
        }
      >

        <Text>
          No learning path available
        </Text>

      </View>
    );
  }

  return (

    <ScrollView
      contentContainerStyle={
        styles.container
      }
    >

      {/* HEADER */}

      <Text
        style={
          styles.title
        }
      >
        Career Growth Path
      </Text>

      <Text
        style={
          styles.subtitle
        }
      >
        Target Role:
        {" "}
        {
          learningPath.targetRole
        }
      </Text>

      {/* MATCH IMPROVEMENT */}

      <View
        style={
          styles.improvementCard
        }
      >

        <Text
          style={
            styles.improvementValue
          }
        >
          +
          {
            learningPath
              .estimatedMatchImprovement
          }
          %
        </Text>

        <Text
          style={
            styles.improvementText
          }
        >
          Potential Match Improvement
        </Text>

      </View>

      {/* MISSING SKILLS */}

      <View
        style={
          styles.section
        }
      >

        <Text
          style={
            styles.sectionTitle
          }
        >
          Skill Gaps
        </Text>

        <View
          style={
            styles.skillsContainer
          }
        >

          {
            (
              learningPath
                .missingSkills || []
            ).map(
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

      {/* ROADMAP */}

      <View
        style={
          styles.section
        }
      >

        <Text
          style={
            styles.sectionTitle
          }
        >
          Recommended Learning Steps
        </Text>

        {
          (
            learningPath
              .roadmap || []
          ).map(
            (
              item,
              index
            ) => (

              <View
                key={index}
                style={
                  styles.roadmapCard
                }
              >

                <Text
                  style={
                    styles.step
                  }
                >
                  Step {item.step}
                </Text>

                <Text
                  style={
                    styles.roadmapTitle
                  }
                >
                  {item.title}
                </Text>

                <Text
                  style={
                    styles.roadmapDescription
                  }
                >
                  {
                    item.description
                  }
                </Text>

                <TouchableOpacity
                  style={
                    styles.learnButton
                  }
                >

                  <Text
                    style={
                      styles.learnButtonText
                    }
                  >
                    Start Learning
                  </Text>

                </TouchableOpacity>

              </View>
            )
          )
        }

      </View>

    </ScrollView>
  );
}

const styles =
  StyleSheet.create({

    container: {
      padding: 24,

      backgroundColor:
        "#fff",
    },

    center: {
      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    title: {
      fontSize: 32,

      fontWeight: "bold",

      marginTop: 40,

      marginBottom: 12,
    },

    subtitle: {
      fontSize: 18,

      color: "#666",

      marginBottom: 30,
    },

    improvementCard: {
      backgroundColor:
        "#000",

      padding: 28,

      borderRadius: 24,

      marginBottom: 30,

      alignItems:
        "center",
    },

    improvementValue: {
      color: "#fff",

      fontSize: 42,

      fontWeight: "bold",
    },

    improvementText: {
      color: "#ddd",

      marginTop: 8,

      fontSize: 16,
    },

    section: {
      marginBottom: 36,
    },

    sectionTitle: {
      fontSize: 24,

      fontWeight: "bold",

      marginBottom: 18,
    },

    skillsContainer: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: 12,
    },

    skillChip: {
      backgroundColor:
        "#EEF2FF",

      paddingVertical: 10,

      paddingHorizontal: 16,

      borderRadius: 30,
    },

    skillText: {
      color: "#3730A3",

      fontWeight: "600",
    },

    roadmapCard: {
      backgroundColor:
        "#F8FAFC",

      padding: 22,

      borderRadius: 22,

      marginBottom: 18,
    },

    step: {
      fontSize: 14,

      color: "#666",

      marginBottom: 8,
    },

    roadmapTitle: {
      fontSize: 22,

      fontWeight: "bold",

      marginBottom: 10,
    },

    roadmapDescription: {
      fontSize: 16,

      color: "#555",

      lineHeight: 24,

      marginBottom: 18,
    },

    learnButton: {
      backgroundColor:
        "#000",

      paddingVertical: 14,

      borderRadius: 14,

      alignItems:
        "center",
    },

    learnButtonText: {
      color: "#fff",

      fontWeight: "bold",

      fontSize: 16,
    },
  });