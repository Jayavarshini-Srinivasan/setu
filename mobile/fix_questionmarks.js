const fs = require("fs");
const path = require("path");

const files = [
  "screens/SkillsQuestionScreen.js",
  "screens/professional/ProfessionalSkillsScreen.js",
  "screens/professional/CareerGoalsScreen.js",
  "screens/professional/ProfessionalLinksScreen.js",
  "screens/professional/ProfessionalExperienceScreen.js",
  "screens/professional/EducationScreen.js",
  "screens/professional/ProfessionalRoleScreen.js"
];

for (const screen of files) {
  const p = path.join(__dirname, screen);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, "utf8");
    content = content.replace(/>\? Keep/g, ">✓ Keep");
    content = content.replace(/>\? Use/g, ">✓ Use");
    content = content.replace(/\{skill\} \?<\/Text>/g, "{skill} ✕</Text>");
    content = content.replace(/>\?<\/Text>/g, ">✕</Text>");
    fs.writeFileSync(p, content, "utf8");
  }
}

