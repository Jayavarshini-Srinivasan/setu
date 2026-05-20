

/* ─── Salary range lookup by role ─────────────────────────────────── */
const ROLE_SALARY_MAP = {
  "Software Engineer":    { entry: 600000,  senior: 1800000 },
  "Frontend Developer":   { entry: 500000,  senior: 1500000 },
  "Backend Developer":    { entry: 600000,  senior: 1800000 },
  "Full Stack Developer": { entry: 700000,  senior: 2000000 },
  "Data Analyst":         { entry: 550000,  senior: 1600000 },
  "UI/UX Designer":       { entry: 450000,  senior: 1400000 },
  "Product Manager":      { entry: 900000,  senior: 2500000 },
  "Marketing Specialist": { entry: 400000,  senior: 1200000 },
  "HR Executive":         { entry: 350000,  senior: 1000000 },
  "Finance Associate":    { entry: 500000,  senior: 1500000 },
  "Business Analyst":     { entry: 600000,  senior: 1700000 },
};

/* ─── Typical weeks to build each skill ──────────────────────────── */
const SKILL_WEEK_MAP = {
  default: 3,
  "machine learning": 8,
  "deep learning": 8,
  "pytorch": 6,
  "react": 5,
  "react native": 5,
  "node.js": 4,
  "mongodb": 3,
  "python": 4,
  "sql": 3,
  "aws": 6,
  "docker": 4,
  "kubernetes": 6,
  "typescript": 3,
  "graphql": 3,
  "figma": 2,
  "data structures": 4,
  "system design": 6,
};

function weeksForSkill(skill) {
  return SKILL_WEEK_MAP[skill.toLowerCase()] || SKILL_WEEK_MAP.default;
}

/* ─── Phase labels ─────────────────────────────────────────────────── */
function phaseLabel(index) {
  if (index < 2) return "Foundation";
  if (index < 5) return "Core Growth";
  return "Advanced";
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
  const map   = ROLE_SALARY_MAP[role] || { entry: 500000, senior: 1500000 };
  const ratio = currentMatchScore / 100;
  const currentEstimate = Math.round(
    map.entry + (map.senior - map.entry) * ratio
  );
  const projected = Math.round(
    map.entry + (map.senior - map.entry) * Math.min(1, ratio + 0.35)
  );
  return { currentEstimate, projected };
}

/* ─── MAIN ─────────────────────────────────────────────────────────── */
const generateLearningPath = async (context) => {

  const {
    role              = "",
    skills            = [],
    careerGoal        = "",
    experience        = [],
    topJob            = null,
    allMissingSkills  = [],
    currentMatchScore = 0,
  } = context;

  const currentSkillsNorm = skills.map((s) => s.toLowerCase().trim());

  /*
    ── SKILL GAP
    Derive from REAL match failures (allMissingSkills from /match),
    fall back to job-specific missing skills if context is partial.
  */
  const rawGaps =
    allMissingSkills.length > 0
      ? allMissingSkills
      : topJob?.missingSkills || [];

  /* De-duplicate and exclude already-held skills */
  const skillGaps = [...new Set(
    rawGaps
      .map((s) => s.toLowerCase().trim())
      .filter((s) => !currentSkillsNorm.includes(s))
  )];

  /*
    ── PRIORITY ORDER
    Skills missing from the TOP job are highest priority.
  */
  const topJobMissing = (topJob?.missingSkills || []).map((s) =>
    s.toLowerCase().trim()
  );

  const prioritized = [
    ...skillGaps.filter((s) => topJobMissing.includes(s)),
    ...skillGaps.filter((s) => !topJobMissing.includes(s)),
  ];

  /*
    ── ROADMAP PHASES
    Each skill becomes a step with a phase label, weeks estimate,
    and a description rooted in WHY it matters for this specific role.
  */
  let cumulativeWeeks = 0;

  const roadmap = prioritized.map((skill, index) => {
    const weeks        = weeksForSkill(skill);
    cumulativeWeeks   += weeks;
    const phase        = phaseLabel(index);
    const fromTopJob   = topJobMissing.includes(skill);

    return {
      step:         index + 1,
      phase,
      skill,
      title:        `Build ${skill.charAt(0).toUpperCase() + skill.slice(1)} Proficiency`,
      description:  fromTopJob
        ? `Required by "${topJob?.title || "your top matched job"}" — closing this gap directly improves your match score.`
        : `Present across multiple matched roles for ${role} — adding this skill broadens your opportunities.`,
      estimatedWeeks: weeks,
      cumulativeWeeks,
      priority: fromTopJob ? "high" : "medium",
    };
  });

  /*
    ── PROJECTIONS
  */
  const projectedMatchScore  = projectMatchImprovement(currentMatchScore, prioritized.length);
  const salary               = projectSalaryGrowth(role, currentMatchScore);
  const totalWeeks           = cumulativeWeeks;
  const targetRole           = careerGoal || (role ? `Senior ${role}` : "Target Role");

  /*
    ── CURRENT ASSESSMENT
  */
  const currentAssessment = {
    role,
    skillCount:    currentSkillsNorm.length,
    matchScore:    currentMatchScore,
    experienceYears: Array.isArray(experience) ? experience.length : 0,
    strengths:     currentSkillsNorm.slice(0, 5),
    topMatchedJob: topJob ? {
      title:      topJob.title,
      matchScore: topJob.matchScore,
      location:   topJob.location,
    } : null,
  };

  return {
    /* Header info */
    role,
    targetRole,
    careerGoal,

    /* Gap analysis */
    currentSkills:   currentSkillsNorm,
    skillGaps:       prioritized,
    totalGapCount:   prioritized.length,

    /* Roadmap */
    roadmap,
    totalWeeks,

    /* Projections */
    currentMatchScore,
    projectedMatchScore,
    matchImprovementDelta: projectedMatchScore - currentMatchScore,

    salary: {
      currentEstimate:   salary.currentEstimate,
      projectedEstimate: salary.projected,
      currency:          "INR",
    },

    /* Context */
    currentAssessment,
    topJob,
  };
};

module.exports = { generateLearningPath };