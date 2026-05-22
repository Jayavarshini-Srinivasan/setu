import {
  useEffect,
  useState,
} from "react";

import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import {
  auth,
} from "../../services/firebase";

import API from "../../services/api";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useI18n } from "../../context/I18nContext";

export default function ResumePreviewScreen() {

  /*
    STATE
  */
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    resume,
    setResume,
  ] = useState(null);
  
  const { t } = useI18n();

  /*
    LOAD RESUME
  */
  useEffect(() => {

    generateResume();

  }, []);

  const generateResume =
    async () => {

      try {

        const userId =
          auth.currentUser.uid;

        /*
          API
        */
        const response =
          await API.post(
            "/resume/generate",
            {
              userId,
            }
          );

        setResume(
          response.data
        );

      } catch (error) {

        console.log(error);

        Alert.alert(
          "Error",
          "Failed to generate resume"
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
  if (!resume) {

    return (

      <View
        style={
          styles.center
        }
      >

        <Text>
          Resume unavailable
        </Text>

      </View>
    );
  }

  /*
    DOWNLOAD PDF
  */
  const handleDownloadPDF = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
              h1 { font-size: 36px; color: #111; margin-bottom: 10px; }
              h2 { font-size: 24px; color: #444; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-top: 30px; }
              p { font-size: 16px; line-height: 1.5; }
              .summary { font-style: italic; color: #555; }
              .skill-tag { display: inline-block; background-color: #eee; padding: 5px 10px; border-radius: 15px; margin: 5px; font-size: 14px; }
              .job { margin-bottom: 20px; }
              .job-title { font-weight: bold; font-size: 18px; }
              .job-company { color: #666; font-size: 16px; }
              .links p { margin: 5px 0; }
            </style>
          </head>
          <body>
            <h1>${t("roles." + resume.role) || resume.role || "Professional"}</h1>
            <h2>Professional Summary</h2>
            <p class="summary">${(resume.summary || "").replace(/\n/g, '<br/>')}</p>
            
            <h2>Skills</h2>
            <div>
              ${(resume.skills || []).map(skill => `<span class="skill-tag">${t("skills." + skill) || skill}</span>`).join('')}
            </div>
            
            <h2>Experience</h2>
            ${(resume.experience || []).map(exp => `
              <div class="job">
                <div class="job-title">${exp.role || 'Role'}</div>
                <div class="job-company">${exp.company || 'Company'} &bull; ${exp.years || 0} years</div>
              </div>
            `).join('')}
            
            <h2>Education</h2>
            <div class="job">
              <div class="job-title">${resume.education?.degree || 'Degree'}</div>
              <div class="job-company">${resume.education?.institution || 'Institution'} &bull; Graduated: ${resume.education?.graduationYear || 'Year'}</div>
            </div>
            
            <h2>Professional Links</h2>
            <div class="links">
              ${resume.links?.linkedin ? `<p><strong>LinkedIn:</strong> ${resume.links.linkedin}</p>` : ''}
              ${resume.links?.github ? `<p><strong>GitHub:</strong> ${resume.links.github}</p>` : ''}
              ${resume.links?.portfolio ? `<p><strong>Portfolio:</strong> ${resume.links.portfolio}</p>` : ''}
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.log('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  return (

    <ScrollView
      contentContainerStyle={
        styles.container
      }
    >

      {/* HEADER */}

      <Text
        style={
          styles.role
        }
      >
        {
          t("roles." + resume.role) || resume.role
        }
      </Text>

      {/* SUMMARY */}

      <View
        style={
          styles.section
        }
      >

        <Text
          style={
            styles.heading
          }
        >
          Professional Summary
        </Text>

        <Text
          style={
            styles.text
          }
        >
          {
            resume.summary
          }
        </Text>

      </View>

      {/* SKILLS */}

      <View
        style={
          styles.section
        }
      >

        <Text
          style={
            styles.heading
          }
        >
          Skills
        </Text>

        <View
          style={
            styles.skillsContainer
          }
        >

          {
            (
              resume.skills || []
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
                    {t("skills." + skill) || skill}
                  </Text>

                </View>
              )
            )
          }

        </View>

      </View>

      {/* EXPERIENCE */}

      <View
        style={
          styles.section
        }
      >

        <Text
          style={
            styles.heading
          }
        >
          Experience
        </Text>

        {
          (
            resume.experience || []
          ).map(
            (
              item,
              index
            ) => (

              <View
                key={index}
                style={
                  styles.card
                }
              >

                <Text
                  style={
                    styles.cardTitle
                  }
                >
                  {item.role}
                </Text>

                <Text
                  style={
                    styles.cardSubtitle
                  }
                >
                  {item.company}
                </Text>

                <Text
                  style={
                    styles.cardSubtitle
                  }
                >
                  {item.years} years
                </Text>

              </View>
            )
          )
        }

      </View>

      {/* EDUCATION */}

      <View
        style={
          styles.section
        }
      >

        <Text
          style={
            styles.heading
          }
        >
          Education
        </Text>

        <View
          style={
            styles.card
          }
        >

          <Text
            style={
              styles.cardTitle
            }
          >
            {
              resume.education
                ?.degree
            }
          </Text>

          <Text
            style={
              styles.cardSubtitle
            }
          >
            {
              resume.education
                ?.institution
            }
          </Text>

          <Text
            style={
              styles.cardSubtitle
            }
          >
            Graduation:
            {" "}
            {
              resume.education
                ?.graduationYear
            }
          </Text>

        </View>

      </View>

      {/* LINKS */}

      <View
        style={
          styles.section
        }
      >

        <Text
          style={
            styles.heading
          }
        >
          Professional Links
        </Text>

        {
          resume.links
            ?.linkedin ? (
            <Text
              style={
                styles.link
              }
            >
              LinkedIn:
              {" "}
              {
                resume.links
                  .linkedin
              }
            </Text>
          ) : null
        }

        {
          resume.links
            ?.github ? (
            <Text
              style={
                styles.link
              }
            >
              GitHub:
              {" "}
              {
                resume.links
                  .github
              }
            </Text>
          ) : null
        }

        {
          resume.links
            ?.portfolio ? (
            <Text
              style={
                styles.link
              }
            >
              Portfolio:
              {" "}
              {
                resume.links
                  .portfolio
              }
            </Text>
          ) : null
        }

      </View>

      {/* DOWNLOAD BUTTON */}

      <TouchableOpacity
        style={
          styles.button
        }
        onPress={handleDownloadPDF}
      >

        <Text
          style={
            styles.buttonText
          }
        >
          Download Resume PDF
        </Text>

      </TouchableOpacity>

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

    role: {
      fontSize: 34,

      fontWeight: "bold",

      marginTop: 40,

      marginBottom: 30,
    },

    section: {
      marginBottom: 30,
    },

    heading: {
      fontSize: 22,

      fontWeight: "bold",

      marginBottom: 14,
    },

    text: {
      fontSize: 16,

      lineHeight: 26,

      color: "#333",
    },

    skillsContainer: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: 10,
    },

    skillChip: {
      backgroundColor:
        "#000",

      paddingVertical: 10,

      paddingHorizontal: 16,

      borderRadius: 30,
    },

    skillText: {
      color: "#fff",

      fontWeight: "600",
    },

    card: {
      backgroundColor:
        "#F7F5F2",

      padding: 18,

      borderRadius: 18,

      marginBottom: 14,
    },

    cardTitle: {
      fontSize: 18,

      fontWeight: "bold",

      marginBottom: 6,
    },

    cardSubtitle: {
      fontSize: 15,

      color: "#555",
    },

    link: {
      fontSize: 15,

      color: "#E85D26",

      marginBottom: 8,
    },

    button: {
      backgroundColor:
        "#000",

      padding: 20,

      borderRadius: 16,

      alignItems:
        "center",

      marginBottom: 60,
    },

    buttonText: {
      color: "#fff",

      fontSize: 18,

      fontWeight: "bold",
    },
  });