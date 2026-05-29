
const { getRoleSkills } = require("../data/professionalRoleSkillMap");

/* ─── Salary range lookup by role ─────────────────────────────────── */
const ROLE_SALARY_MAP = {
  "Software Engineer":        { entry: 600000,  senior: 1800000 },
  "Frontend Developer":       { entry: 500000,  senior: 1500000 },
  "Backend Developer":        { entry: 600000,  senior: 1800000 },
  "Full Stack Developer":     { entry: 700000,  senior: 2000000 },
  "Data Analyst":             { entry: 550000,  senior: 1600000 },
  "Data Scientist":           { entry: 700000,  senior: 2200000 },
  "Machine Learning Engineer":{ entry: 800000,  senior: 2800000 },
  "UI/UX Designer":           { entry: 450000,  senior: 1400000 },
  "Product Manager":          { entry: 900000,  senior: 2500000 },
  "DevOps Engineer":          { entry: 700000,  senior: 2000000 },
  "Mobile Developer":         { entry: 600000,  senior: 1800000 },
  "Marketing Specialist":     { entry: 400000,  senior: 1200000 },
  "HR Executive":             { entry: 350000,  senior: 1000000 },
  "Finance Associate":        { entry: 500000,  senior: 1500000 },
  "Business Analyst":         { entry: 600000,  senior: 1700000 },
};

/* ─── Typical weeks to build each skill ──────────────────────────── */
const SKILL_WEEK_MAP = {
  // Frontend
  "react": 8, "vue": 7, "vue.js": 7, "angular": 9,
  "typescript": 3, "javascript": 6, "html": 2, "css": 2,
  "html-css": 3, "tailwind": 1, "next.js": 4, "storybook": 2,
  "webpack": 2, "responsive design": 2, "accessibility": 3,
  // Backend
  "node.js": 6, "python": 6, "java": 10, "express": 3,
  "fastapi": 3, "django": 5, "spring": 8, "spring boot": 8,
  "rest api": 3, "graphql": 4, "authentication": 2,
  "database design": 4, "microservices": 6, "websockets": 2,
  // Data
  "sql": 3, "postgresql": 4, "mongodb": 4, "firebase": 2,
  "redis": 2, "mysql": 3, "bigquery": 3, "etl": 4,
  // DevOps
  "docker": 4, "kubernetes": 6, "aws": 5, "git": 1, "linux": 3,
  "ci/cd": 3, "bash scripting": 3, "terraform": 5, "ansible": 4,
  "gcp": 5, "azure": 5, "monitoring": 2, "nginx": 2, "helm": 3,
  // ML/AI
  "scikit-learn": 4, "tensorflow": 6, "pytorch": 6, "pandas": 3,
  "numpy": 2, "statistics": 4, "data preprocessing": 3,
  "feature engineering": 4, "model evaluation": 3, "mlops": 6,
  "nlp": 6, "computer vision": 6, "huggingface": 3, "mlflow": 2,
  "machine learning": 8, "deep learning": 8, "spark": 5, "jupyter": 1,
  // Design
  "figma": 3, "user research": 4, "wireframing": 2, "prototyping": 3,
  "usability testing": 3, "design systems": 4, "visual design": 4,
  "typography": 2, "colour theory": 2, "adobe xd": 3, "sketch": 3,
  "motion design": 5, "information architecture": 3, "framer": 3,
  // Business / PM
  "excel": 2, "tally": 3, "accounting": 4, "gst": 2, "ms-office": 1,
  "quickbooks": 3, "sap": 8, "power bi": 3, "tableau": 3,
  "product strategy": 6, "agile": 2, "roadmapping": 3,
  "stakeholder management": 4, "data analysis": 4, "market research": 3,
  "wireframing": 2, "prioritisation": 2, "requirements gathering": 3,
  "process mapping": 3, "use case analysis": 3, "documentation": 2,
  // General
  "data structures": 6, "algorithms": 8, "oop": 4, "testing": 3,
  "problem solving": 4, "system design": 8, "code review": 2,
  "design patterns": 4, "performance optimisation": 4,
  // Marketing / HR
  "seo": 3, "google analytics": 2, "content creation": 3,
  "social media marketing": 2, "email marketing": 2, "copywriting": 4,
  "recruitment": 4, "onboarding": 2, "payroll": 3, "employee relations": 3,
  "labour law": 4, "performance management": 3, "hrms": 2,
};

function weeksForSkill(skill) {
  const norm = skill.toLowerCase().trim();
  if (SKILL_WEEK_MAP[norm]) return SKILL_WEEK_MAP[norm];
  // Partial key match
  for (const [key, weeks] of Object.entries(SKILL_WEEK_MAP)) {
    if (norm.includes(key) || key.includes(norm)) return weeks;
  }
  return 4; // sensible default
}

/* ─── Match improvement projection ────────────────────────────────── */
function projectMatchImprovement(currentScore, missingSkillCount) {
  const gainPerSkill = missingSkillCount > 0
    ? Math.round((100 - currentScore) / missingSkillCount * 0.7)
    : 0;
  return Math.min(100, currentScore + gainPerSkill * missingSkillCount);
}

/* ─── Salary projection ────────────────────────────────────────────── */
function projectSalaryGrowth(role, currentMatchScore) {
  // Try exact match first, then case-insensitive
  const normRole = (role || "").toLowerCase();
  let map = null;
  for (const [key, val] of Object.entries(ROLE_SALARY_MAP)) {
    if (key.toLowerCase() === normRole) { map = val; break; }
  }
  if (!map) map = { entry: 500000, senior: 1500000 };

  const ratio = (currentMatchScore || 50) / 100;
  const currentEstimate = Math.round(map.entry + (map.senior - map.entry) * ratio);
  const projected       = Math.round(map.entry + (map.senior - map.entry) * Math.min(1, ratio + 0.35));
  return { currentEstimate, projected };
}

/* ─── MAIN ─────────────────────────────────────────────────────────── */
const generateLearningPath = async (context) => {

  if (context.workerType && context.workerType !== "professional") {
    return null;
  }

  const {
    role              = "",
    skills            = [],
    careerGoal        = "",
    experience        = [],
    topJob            = null,
    allMissingSkills  = [],
    currentMatchScore = 0,
    expectedSalary    = { max: 0 },
  } = context;

  const currentSkillsNorm = (Array.isArray(skills) ? skills : [])
    .map((s) => String(s).toLowerCase().trim())
    .filter(Boolean);

  /* ── Step 1: Look up expected skills from role map ─────────────── */
  const roleEntry = getRoleSkills(role);

  let requiredSkills   = [];
  let niceToHaveSkills = [];

  if (roleEntry) {
    requiredSkills   = (roleEntry.required   || []).map(s => s.toLowerCase().trim());
    niceToHaveSkills = (roleEntry.nice_to_have || []).map(s => s.toLowerCase().trim());
    console.log(`[LearningPath] Role map found for "${role}": ${requiredSkills.length} required, ${niceToHaveSkills.length} nice-to-have`);
  } else {
    // Fallback: use top job required skills
    console.warn(`[LearningPath] No role map entry for "${role}", falling back to job-based skills`);
    const fallbackJob = topJob || (() => {
      try {
        const { jobs: localJobs } = require("../data/jobs");
        return localJobs.find(j =>
          j.category === "professional" &&
          (j.title.toLowerCase().includes((role || "").toLowerCase()) ||
           (role || "").toLowerCase().includes(j.title.toLowerCase()))
        ) || {
          title: role || "Software Engineer",
          requiredSkills: ["javascript", "react", "node.js", "git", "html", "css"],
          salary: { max: 900000 },
          matchScore: 50,
        };
      } catch (e) {
        return {
          title: role || "Software Engineer",
          requiredSkills: ["javascript", "react", "node.js", "git", "html", "css"],
          salary: { max: 900000 },
          matchScore: 50,
        };
      }
    })();

    requiredSkills = (fallbackJob?.requiredSkills || [])
      .map(s => String(s).toLowerCase().trim());
  }

  /* ── Step 2: Compute gaps ──────────────────────────────────────── */
  // Primary gaps: required skills the user is missing
  const requiredGaps = requiredSkills.filter(s => !currentSkillsNorm.includes(s));

  // Secondary gaps: nice-to-have skills user is also missing
  const niceGaps = niceToHaveSkills.filter(s => !currentSkillsNorm.includes(s));

  // Also include any skills flagged missing in job matches but not yet in our lists
  const normalizedJobMissing = (allMissingSkills || [])
    .map(s => (typeof s === "string" ? s : (s.skill || "")).toLowerCase().trim())
    .filter(s => s && !currentSkillsNorm.includes(s) && !requiredGaps.includes(s) && !niceGaps.includes(s));

  /* ── Step 3: Build frequency map from job match missing skills ─── */
  // Skills that appear missing in many jobs get boosted priority
  const jobMissingFrequency = {};
  (allMissingSkills || []).forEach((s) => {
    const norm = (typeof s === "string" ? s : (s.skill || "")).toLowerCase().trim();
    if (norm) {
      jobMissingFrequency[norm] = (jobMissingFrequency[norm] || 0) +
        (typeof s === "object" && s.count ? s.count : 1);
    }
  });

  /* ── Step 4: Assign priorities ─────────────────────────────────── */
  function getSkillPriority(skill, isRequired, isNice) {
    const freq = jobMissingFrequency[skill] || 0;
    if (isRequired && freq >= 2) return "high";
    if (isRequired) return "high"; // ALL required gaps are high by default
    if (freq >= 3) return "high";
    if (isNice && freq >= 2) return "medium";
    if (isNice) return "medium";
    return "low"; // job-only extras
  }

  const allGapsWithPriority = [
    ...requiredGaps.map(s  => ({ skill: s, isRequired: true,  isNice: false })),
    ...niceGaps.map(s      => ({ skill: s, isRequired: false, isNice: true  })),
    ...normalizedJobMissing.map(s => ({ skill: s, isRequired: false, isNice: false })),
  ].map(({ skill, isRequired, isNice }) => ({
    skill,
    priority: getSkillPriority(skill, isRequired, isNice),
  }));

  // Sort: high → medium → low
  const ORDER = { high: 0, medium: 1, low: 2 };
  allGapsWithPriority.sort((a, b) => ORDER[a.priority] - ORDER[b.priority]);

  if (allGapsWithPriority.length === 0) {
    // User is fully qualified — return a "no gaps" response
    const salaryEst = topJob?.salary?.max || expectedSalary?.max || 500000;
    return {
      role,
      targetRole:   careerGoal || (role ? `Senior ${role}` : "Target Role"),
      careerGoal,
      currentSkills: currentSkillsNorm,
      skillGaps: [],
      totalGapCount: 0,
      roadmap: [],
      totalWeeks: 0,
      currentMatchScore: currentMatchScore || 100,
      projectedMatchScore: currentMatchScore || 100,
      matchImprovementDelta: 0,
      salary: {
        currentEstimate: salaryEst,
        projectedEstimate: salaryEst,
        currency: "INR",
      },
      currentAssessment: {
        role,
        skillCount: currentSkillsNorm.length,
        matchScore: currentMatchScore || 100,
        experienceYears: Array.isArray(experience) ? experience.length : (experience || 0),
        strengths: currentSkillsNorm.slice(0, 5),
        topMatchedJob: topJob ? {
          title: topJob.title,
          matchScore: topJob.matchScore || currentMatchScore || 100,
          location: topJob.location,
        } : null,
      },
      topJob,
      message: "No skill gaps. You are fully qualified for this role.",
    };
  }

  /* ── Step 5: Build roadmap ─────────────────────────────────────── */
  let cumulativeWeeks = 0;
  const roadmap = allGapsWithPriority.map(({ skill, priority }, index) => {
    const weeks = weeksForSkill(skill);
    cumulativeWeeks += weeks;

    const phaseLabel =
      priority === "high"   ? "Phase 1 (Core)"    :
      priority === "medium" ? "Phase 2 (Growth)"  :
                              "Phase 3 (Advanced)";

    const description =
      priority === "high"
        ? `Core requirement: Every ${role || "professional in your field"} must have this skill. Building it now will have the biggest impact on your career prospects.`
        : priority === "medium"
        ? `Recommended: Commonly valued in ${role || "your target role"} positions and will make you a stronger candidate.`
        : `Nice to have: Adds depth to your ${role || "professional"} profile and unlocks additional opportunities.`;

    return {
      step: index + 1,
      phase: phaseLabel,
      skill,
      title: `Master ${skill.charAt(0).toUpperCase() + skill.slice(1)}`,
      description,
      estimatedWeeks: weeks,
      cumulativeWeeks,
      priority,
    };
  });

  /* ── Step 6: Projections ───────────────────────────────────────── */
  const projectedMatchScore = projectMatchImprovement(currentMatchScore, allGapsWithPriority.length);

  let salaryGrowthObj;
  const jobMax    = topJob?.salary?.max || 0;
  const expected  = expectedSalary?.max || 0;

  if (jobMax > expected && expected > 0) {
    const increase = ((jobMax - expected) / expected) * 100;
    salaryGrowthObj = {
      currentEstimate: expected,
      projected: jobMax,
      percentageIncrease: Math.round(increase),
    };
  } else {
    salaryGrowthObj = projectSalaryGrowth(role, currentMatchScore);
  }

  const totalWeeks  = cumulativeWeeks;
  const targetRole  = careerGoal || (role ? `Senior ${role}` : "Target Role");

  const currentAssessment = {
    role,
    skillCount:      currentSkillsNorm.length,
    matchScore:      currentMatchScore,
    experienceYears: Array.isArray(experience) ? experience.length : (experience || 0),
    strengths:       currentSkillsNorm.slice(0, 5),
    topMatchedJob:   topJob ? {
      title:      topJob.title,
      matchScore: topJob.matchScore || currentMatchScore,
      location:   topJob.location,
    } : null,
  };

  return {
    role,
    targetRole,
    careerGoal,

    currentSkills: currentSkillsNorm,
    skillGaps:     allGapsWithPriority.map(g => g.skill),
    totalGapCount: allGapsWithPriority.length,

    roadmap,
    totalWeeks,

    currentMatchScore,
    projectedMatchScore,
    matchImprovementDelta: projectedMatchScore - currentMatchScore,

    salary: {
      currentEstimate:   salaryGrowthObj.currentEstimate,
      projectedEstimate: salaryGrowthObj.projected,
      currency:          "INR",
    },

    currentAssessment,
    topJob,
  };
};

module.exports = { generateLearningPath };