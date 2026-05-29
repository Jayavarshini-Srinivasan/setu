/**
 * test_learning.js
 * Run: node test_learning.js
 * Tests the learning path service with different profile scenarios.
 */

const { generateLearningPath } = require("./services/learningPathService");

async function runTest(label, context) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`TEST: ${label}`);
  console.log("=".repeat(60));

  const result = await generateLearningPath(context);

  if (!result) {
    console.log("Result: null (non-professional worker type)");
    return;
  }

  console.log(`Role: ${result.role}`);
  console.log(`Target: ${result.targetRole}`);
  console.log(`Current skills: [${result.currentSkills.join(", ")}]`);
  console.log(`Skill gaps (${result.totalGapCount}): [${result.skillGaps.join(", ")}]`);
  console.log(`Total weeks to close gaps: ${result.totalWeeks}`);
  console.log(`Match score: ${result.currentMatchScore} → ${result.projectedMatchScore}`);
  console.log(`Salary: ₹${result.salary?.currentEstimate?.toLocaleString()} → ₹${result.salary?.projectedEstimate?.toLocaleString()}`);

  if (result.roadmap.length > 0) {
    console.log("\nRoadmap steps:");
    result.roadmap.forEach((step) => {
      console.log(`  [${step.priority.toUpperCase()}] Step ${step.step}: ${step.title} (~${step.estimatedWeeks}w)`);
    });
  } else {
    console.log("\nMessage:", result.message || "No gaps — fully qualified!");
  }
}

(async () => {
  // 1. ML Engineer with NO skills
  await runTest("ML Engineer — ZERO skills", {
    role: "Machine Learning Engineer",
    skills: [],
    currentMatchScore: 0,
    allMissingSkills: ["python", "tensorflow", "pandas", "sql", "scikit-learn"],
  });

  // 2. UI/UX Designer with partial skills
  await runTest("UI/UX Designer — partial skills", {
    role: "UI/UX Designer",
    skills: ["figma", "wireframing"],
    currentMatchScore: 30,
    allMissingSkills: ["user research", "prototyping", "usability testing"],
  });

  // 3. Full Stack Developer with some skills
  await runTest("Full Stack Developer — moderate skills", {
    role: "Full Stack Developer",
    skills: ["javascript", "react", "html", "css", "git"],
    currentMatchScore: 55,
    allMissingSkills: ["node.js", "sql", "mongodb", "typescript", "docker"],
  });

  // 4. Full Stack Developer with all required skills (should show no gaps or only nice-to-haves)
  await runTest("Full Stack Developer — fully skilled", {
    role: "Full Stack Developer",
    skills: ["javascript", "react", "node.js", "sql", "mongodb", "rest api", "git", "html", "css", "typescript"],
    currentMatchScore: 95,
    allMissingSkills: [],
  });

  // 5. Alias test — "ML Engineer" (alias)
  await runTest("ML Engineer alias test", {
    role: "ML Engineer",
    skills: ["python", "pandas"],
    currentMatchScore: 20,
    allMissingSkills: [],
  });
})();
