

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
// Estimates for time to learn skills
const SKILL_WEEK_MAP = {
  // Frontend
  'react': 8, 'vue': 7, 'angular': 9, 'typescript': 3, 'javascript': 6,
  'html-css': 3, 'tailwind': 1, 'next.js': 4,
  // Backend
  'node.js': 6, 'python': 6, 'java': 10, 'express': 3, 'fastapi': 3,
  'django': 5, 'spring': 8,
  // Data
  'sql': 3, 'postgresql': 4, 'mongodb': 4, 'firebase': 2, 'redis': 2,
  // DevOps
  'docker': 4, 'kubernetes': 6, 'aws': 5, 'git': 1, 'linux': 3,
  // Business
  'excel': 2, 'tally': 3, 'accounting': 4, 'gst': 2, 'ms-office': 1,
  'quickbooks': 3, 'sap': 8,
  // Data Science
  'machine-learning': 12, 'pandas': 3, 'power-bi': 3, 'tableau': 3,
};

function weeksForSkill(skill) {
  const norm = skill.toLowerCase();
  if (SKILL_WEEK_MAP[norm]) return SKILL_WEEK_MAP[norm];
  console.warn(`[LearningPath] Skill not in map, defaulting to 4 weeks: ${skill}`);
  return 4;
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

  if (context.workerType && context.workerType !== "professional") {
    return null;
  }

  const {
    role              = "",
    skills            = [],
    careerGoal        = "",
    experience        = [],
    topJob            = null,
    allMissingSkills  = [], // Should be array of objects with count: {skill, count}
    currentMatchScore = 0,
    expectedSalary    = { max: 0 },
  } = context;

  const currentSkillsNorm = skills.map((s) => s.toLowerCase().trim());

  /* Compute skillGaps against top matched job */
  const topJobMissing = (topJob?.requiredSkills || [])
    .map(s => String(s).toLowerCase().trim())
    .filter(s => !currentSkillsNorm.includes(s));

  if (topJobMissing.length === 0) {
    return { message: "No skill gaps. You are fully qualified for this role." };
  }

  /* Sort by importance */
  const gapImportance = topJobMissing.map(skill => {
    // If allMissingSkills is an array of objects { skill, count }
    const freqObj = allMissingSkills.find(s => s.skill === skill);
    const count = freqObj ? freqObj.count : (topJobMissing.includes(skill) ? 1 : 0);
    
    let importance = "LOW";
    if (count > 3) importance = "HIGH";
    else if (count >= 2) importance = "MEDIUM";
    
    return { skill, importance, count };
  });

  const highGaps = gapImportance.filter(g => g.importance === "HIGH").map(g => g.skill);
  const medGaps = gapImportance.filter(g => g.importance === "MEDIUM").map(g => g.skill);
  const lowGaps = gapImportance.filter(g => g.importance === "LOW").map(g => g.skill);

  const prioritized = [...highGaps, ...medGaps, ...lowGaps];

  let cumulativeWeeks = 0;
  let phase1Index = highGaps.length;
  let phase2Index = phase1Index + medGaps.length;

  const roadmap = prioritized.map((skill, index) => {
    const weeks = weeksForSkill(skill);
    cumulativeWeeks += weeks;
    
    let phase = "Phase 3 (LOW)";
    let priority = "low";
    if (index < phase1Index) {
      phase = "Phase 1 (HIGH)";
      priority = "high";
    } else if (index < phase2Index) {
      phase = "Phase 2 (MEDIUM)";
      priority = "medium";
    }

    return {
      step: index + 1,
      phase,
      skill,
      title: `Learn ${skill}`,
      description: priority === "high" ? `High priority: Appears in many target jobs.` : `Required by top match.`,
      estimatedWeeks: weeks,
      cumulativeWeeks,
      priority,
    };
  });

  /*
    ── PROJECTIONS
  */
  const projectedMatchScore  = projectMatchImprovement(currentMatchScore, prioritized.length);
  
  // Salary progression based on topJob max vs expectedSalary
  let salaryGrowthObj = { currentEstimate: 0, projected: 0, percentageIncrease: 0 };
  const jobMax = topJob?.salary?.max || 0;
  const expected = expectedSalary?.max || 0;
  
  if (jobMax > expected && expected > 0) {
    const increase = ((jobMax - expected) / expected) * 100;
    salaryGrowthObj = { 
      currentEstimate: expected, 
      projected: jobMax,
      percentageIncrease: Math.round(increase)
    };
  } else {
    salaryGrowthObj = projectSalaryGrowth(role, currentMatchScore);
  }
  
  const salary = salaryGrowthObj;
  const totalWeeks = cumulativeWeeks;
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