/**
 * professionalRoleSkillMap.js
 *
 * Defines the expected skill set for each professional role.
 * Used by learningPathService to compute skill gaps against
 * the IDEAL CANDIDATE for a role — not a specific open job.
 *
 * Structure per role:
 *   required      – core skills every professional in this role must have
 *   nice_to_have  – valuable extras that differentiate strong candidates
 *   aliases       – alternate names / spellings the role might appear as
 */

const professionalRoleSkillMap = {

  /* ── ML / AI ─────────────────────────────────────────────────── */
  "machine learning engineer": {
    aliases: ["ml engineer", "ai engineer", "machine learning developer",
              "ai/ml engineer", "ml developer", "deep learning engineer"],
    required: [
      "python", "scikit-learn", "tensorflow", "pytorch", "pandas",
      "numpy", "sql", "git", "statistics", "data preprocessing",
      "model evaluation", "feature engineering",
    ],
    nice_to_have: [
      "mlops", "docker", "kubernetes", "aws sagemaker", "spark",
      "kafka", "nlp", "computer vision", "huggingface", "mlflow",
      "airflow", "fastapi",
    ],
  },

  "data scientist": {
    aliases: ["data science engineer", "applied scientist",
              "research scientist", "ml scientist"],
    required: [
      "python", "statistics", "machine learning", "pandas", "numpy",
      "sql", "data visualization", "git", "jupyter", "scikit-learn",
    ],
    nice_to_have: [
      "tensorflow", "pytorch", "r", "spark", "tableau", "power bi",
      "a/b testing", "nlp", "deep learning", "docker",
    ],
  },

  /* ── Design ───────────────────────────────────────────────────── */
  "ui/ux designer": {
    aliases: ["ux designer", "ui designer", "product designer",
              "ux/ui designer", "interaction designer", "visual designer",
              "ux researcher"],
    required: [
      "figma", "user research", "wireframing", "prototyping",
      "usability testing", "design systems", "information architecture",
      "visual design", "typography", "colour theory",
    ],
    nice_to_have: [
      "adobe xd", "sketch", "zeplin", "invision", "motion design",
      "css", "html", "accessibility", "framer", "lottie animations",
    ],
  },

  /* ── Full Stack ───────────────────────────────────────────────── */
  "full stack developer": {
    aliases: ["fullstack developer", "full-stack developer",
              "full stack engineer", "fullstack engineer",
              "full-stack engineer", "mern developer", "mean developer"],
    required: [
      "javascript", "react", "node.js", "sql", "mongodb", "rest api",
      "git", "html", "css", "typescript",
    ],
    nice_to_have: [
      "next.js", "graphql", "docker", "redis", "aws", "testing",
      "ci/cd", "nginx", "websockets", "microservices",
    ],
  },

  /* ── Frontend ─────────────────────────────────────────────────── */
  "frontend developer": {
    aliases: ["front-end developer", "front end developer",
              "frontend engineer", "react developer", "vue developer",
              "angular developer", "ui developer"],
    required: [
      "javascript", "html", "css", "react", "typescript", "git",
      "rest api", "responsive design",
    ],
    nice_to_have: [
      "next.js", "vue.js", "angular", "tailwind", "testing",
      "webpack", "performance optimisation", "accessibility",
      "graphql", "storybook",
    ],
  },

  /* ── Backend ──────────────────────────────────────────────────── */
  "backend developer": {
    aliases: ["back-end developer", "back end developer",
              "backend engineer", "server-side developer",
              "node developer", "python developer", "java developer"],
    required: [
      "node.js", "sql", "rest api", "git", "authentication",
      "database design", "testing", "docker",
    ],
    nice_to_have: [
      "python", "java", "spring boot", "graphql", "redis",
      "rabbitmq", "kafka", "kubernetes", "aws", "microservices",
    ],
  },

  /* ── General SWE ──────────────────────────────────────────────── */
  "software engineer": {
    aliases: ["software developer", "sde", "programmer",
              "application developer", "swe"],
    required: [
      "data structures", "algorithms", "git", "sql", "oop",
      "testing", "rest api", "problem solving",
    ],
    nice_to_have: [
      "system design", "docker", "ci/cd", "cloud computing",
      "design patterns", "agile", "code review",
    ],
  },

  /* ── Data ─────────────────────────────────────────────────────── */
  "data analyst": {
    aliases: ["business intelligence analyst", "bi analyst",
              "analytics engineer", "reporting analyst"],
    required: [
      "sql", "excel", "data visualisation", "statistics",
      "reporting", "python", "dashboard creation",
    ],
    nice_to_have: [
      "power bi", "tableau", "looker", "google analytics", "r",
      "etl", "bigquery", "spark",
    ],
  },

  /* ── Product ──────────────────────────────────────────────────── */
  "product manager": {
    aliases: ["pm", "product owner", "associate product manager",
              "senior product manager", "technical product manager"],
    required: [
      "product strategy", "agile", "user research", "roadmapping",
      "stakeholder management", "data analysis", "prioritisation",
      "wireframing", "market research",
    ],
    nice_to_have: [
      "sql", "google analytics", "a/b testing", "figma",
      "jira", "okr management", "go-to-market", "technical writing",
    ],
  },

  /* ── DevOps / Cloud ───────────────────────────────────────────── */
  "devops engineer": {
    aliases: ["site reliability engineer", "sre", "cloud engineer",
              "infrastructure engineer", "platform engineer",
              "devops developer"],
    required: [
      "docker", "kubernetes", "ci/cd", "linux", "git",
      "bash scripting", "monitoring", "aws",
    ],
    nice_to_have: [
      "terraform", "ansible", "gcp", "azure", "prometheus",
      "grafana", "jenkins", "argocd", "helm", "security",
    ],
  },

  /* ── Mobile ───────────────────────────────────────────────────── */
  "mobile developer": {
    aliases: ["android developer", "ios developer", "react native developer",
              "flutter developer", "app developer", "mobile engineer"],
    required: [
      "react native", "javascript", "git", "rest api", "app store deployment",
      "mobile ui design", "debugging",
    ],
    nice_to_have: [
      "flutter", "swift", "kotlin", "firebase", "push notifications",
      "performance optimisation", "testing", "animations",
    ],
  },

  /* ── Business Analyst ─────────────────────────────────────────── */
  "business analyst": {
    aliases: ["ba", "systems analyst", "functional analyst",
              "requirements analyst"],
    required: [
      "requirements gathering", "process mapping", "sql", "excel",
      "agile", "documentation", "stakeholder communication",
      "use case analysis",
    ],
    nice_to_have: [
      "power bi", "jira", "visio", "uml", "api testing",
      "data modelling", "crm tools",
    ],
  },

  /* ── Marketing ────────────────────────────────────────────────── */
  "marketing specialist": {
    aliases: ["digital marketer", "growth marketer", "marketing executive",
              "content marketer", "marketing manager", "seo specialist"],
    required: [
      "seo", "google analytics", "content creation", "social media marketing",
      "email marketing", "market research", "copywriting",
    ],
    nice_to_have: [
      "google ads", "facebook ads", "hubspot", "crm", "video editing",
      "canva", "a/b testing", "marketing automation",
    ],
  },

  /* ── HR ───────────────────────────────────────────────────────── */
  "hr executive": {
    aliases: ["human resources executive", "hr generalist", "hr manager",
              "talent acquisition specialist", "recruiter"],
    required: [
      "recruitment", "onboarding", "payroll", "employee relations",
      "labour law", "performance management", "hrms",
    ],
    nice_to_have: [
      "talent development", "compensation benchmarking", "employer branding",
      "data analysis", "training design", "hr analytics",
    ],
  },

  /* ── Finance ──────────────────────────────────────────────────── */
  "finance associate": {
    aliases: ["financial analyst", "finance executive", "accountant",
              "accounts executive", "cost analyst"],
    required: [
      "accounting", "excel", "financial reporting", "tally", "gst",
      "budgeting", "accounts payable", "accounts receivable",
    ],
    nice_to_have: [
      "sap", "quickbooks", "sql", "power bi", "financial modelling",
      "taxation", "audit", "ifrs",
    ],
  },

};

/* ─── Lookup helper ─────────────────────────────────────────────────────── */

/**
 * Look up the expected skill set for a given role string.
 * Matches against canonical key and all aliases (case-insensitive, trimmed).
 *
 * @param {string} roleInput – role from user profile (e.g. "ML Engineer")
 * @returns {{ required: string[], nice_to_have: string[] } | null}
 */
function getRoleSkills(roleInput) {
  if (!roleInput) return null;

  const norm = roleInput.toLowerCase().trim();

  // 1. Exact match on canonical key
  if (professionalRoleSkillMap[norm]) {
    return professionalRoleSkillMap[norm];
  }

  // 2. Alias match
  for (const [, entry] of Object.entries(professionalRoleSkillMap)) {
    if (entry.aliases && entry.aliases.some((a) => a === norm)) {
      return entry;
    }
  }

  // 3. Partial / contains match (e.g. "senior full stack developer")
  for (const [key, entry] of Object.entries(professionalRoleSkillMap)) {
    if (norm.includes(key) || key.includes(norm)) {
      return entry;
    }
    if (entry.aliases && entry.aliases.some((a) => norm.includes(a) || a.includes(norm))) {
      return entry;
    }
  }

  return null;
}

module.exports = { professionalRoleSkillMap, getRoleSkills };
