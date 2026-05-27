const fs = require("fs");
const path = require("path");

const p = path.join(__dirname, "screens", "professional", "ProfessionalReviewScreen.js");
if (fs.existsSync(p)) {
  let content = fs.readFileSync(p, "utf8");
  content = content.replace(/onboardingCompleted: false, \/\/ Set to true only after Resume Approve/, "onboardingCompleted: true,");
  content = content.replace(/const \{ onboardingData \} = useOnboarding\(\);/, "const { onboardingData, refreshOnboarding } = useOnboarding();");
  content = content.replace(/navigation\.navigate\("Resume"\);/, "refreshOnboarding();");
  content = content.replace(/t\("saveGenerateResume"\) \|\| "Save & Generate Resume"/, "t(\"completeOnboarding\") || \"Complete Onboarding\"");
  content = content.replace(//g, "—");
  fs.writeFileSync(p, content, "utf8");
}

