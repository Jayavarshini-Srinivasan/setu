const fs = require("fs");
const path = require("path");

const files = [
  "screens/ExperienceQuestionScreen.js",
  "screens/LocationQuestionScreen.js",
  "screens/PreferencesQuestionScreen.js",
  "screens/ReviewOnboardingScreen.js",
  "screens/professional/ProfessionalRoleScreen.js",
  "screens/professional/ProfessionalSkillsScreen.js",
  "screens/professional/EducationScreen.js",
  "screens/professional/ProfessionalExperienceScreen.js",
  "screens/professional/CareerGoalsScreen.js",
  "screens/professional/ProfessionalLinksScreen.js",
  "screens/professional/ProfessionalReviewScreen.js",
  "screens/professional/ResumePreviewScreen.js"
];

for (const f of files) {
  const p = path.join(__dirname, f);
  if (!fs.existsSync(p)) continue;
  let content = fs.readFileSync(p, "utf8");

  // Basic replacements for text in JSX
  content = content.replace(/<Text([^>]*)>Review & Confirm<\/Text>/g, `<Text$1>{t("reviewConfirm") || "Review & Confirm"}</Text>`);
  content = content.replace(/<Text([^>]*)>Review Profile<\/Text>/g, `<Text$1>{t("reviewProfile") || "Review Profile"}</Text>`);
  content = content.replace(/<Text([^>]*)>Check your details before we find you the best jobs.<\/Text>/g, `<Text$1>{t("reviewSubtitleLabour") || "Check your details before we find you the best jobs."}</Text>`);
  content = content.replace(/<Text([^>]*)>Check your details before generating your AI resume.<\/Text>/g, `<Text$1>{t("reviewSubtitlePro") || "Check your details before generating your AI resume."}</Text>`);
  content = content.replace(/<Text([^>]*)>Missing Information<\/Text>/g, `<Text$1>{t("missingInformation") || "Missing Information"}</Text>`);
  content = content.replace(/<Text([^>]*)>Fill in<\/Text>/g, `<Text$1>{t("fillIn") || "Fill in"}</Text>`);
  content = content.replace(/<Text([^>]*)>Edit<\/Text>/g, `<Text$1>{t("edit") || "Edit"}</Text>`);
  content = content.replace(/<Text([^>]*)>Confirm & Finish<\/Text>/g, `<Text$1>{t("confirmFinish") || "Confirm & Finish"}</Text>`);
  content = content.replace(/<Text([^>]*)>Save & Generate Resume<\/Text>/g, `<Text$1>{t("saveGenerateResume") || "Save & Generate Resume"}</Text>`);
  content = content.replace(/<Text([^>]*)>Approve & Finish<\/Text>/g, `<Text$1>{t("approveFinish") || "Approve & Finish"}</Text>`);

  // Alert replacements
  content = content.replace(/Alert\.alert\(\s*"Missing Information"\s*,\s*"Please fill in all required fields([^"]*)"\s*\);/g, 
    `Alert.alert(t("missingInfo") || "Missing Information", t("fillRequiredFields") || "Please fill in all required fields$1");`);

  fs.writeFileSync(p, content, "utf8");
}
