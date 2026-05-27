const fs = require("fs");
const path = require("path");

const labourScreens = [
  "SkillsQuestionScreen.js",
  "ExperienceQuestionScreen.js",
  "LocationQuestionScreen.js",
  "PreferencesQuestionScreen.js",
  "ReviewOnboardingScreen.js",
];

const proScreens = [
  "professional/ProfessionalRoleScreen.js",
  "professional/ProfessionalSkillsScreen.js",
  "professional/EducationScreen.js",
  "professional/ProfessionalExperienceScreen.js",
  "professional/CareerGoalsScreen.js",
  "professional/ProfessionalLinksScreen.js",
  "professional/ProfessionalReviewScreen.js",
];

for (const screen of labourScreens) {
  const p = path.join(__dirname, "screens", screen);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, "utf8");
    if (!content.includes("totalSteps={5}")) {
      content = content.replace(/step=\{\d+\}/, "$&\n      totalSteps={5}");
    }
    // Fix emojis
    content = content.replace(/Other \?|Other \?\?/g, "Other ✨");
    content = content.replace(/\? Use/g, "✓ Use");
    content = content.replace(/>\?<\/Text>/g, ">✕</Text>");
    fs.writeFileSync(p, content, "utf8");
  }
}

for (const screen of proScreens) {
  const p = path.join(__dirname, "screens", screen);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, "utf8");
    if (!content.includes("totalSteps={6}")) {
      content = content.replace(/step=\{\d+\}/, "$&\n      totalSteps={6}");
    }
    // Fix emojis
    content = content.replace(/Other \?|Other \?\?/g, "Other ✨");
    content = content.replace(/\? Use/g, "✓ Use");
    content = content.replace(/>\?<\/Text>/g, ">✕</Text>");
    fs.writeFileSync(p, content, "utf8");
  }
}

