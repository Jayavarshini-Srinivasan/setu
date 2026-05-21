const COMPATIBLE_GROUPS = {
  // Heavy commercial cargo & large passenger transit
  heavy_commercial_transport: [
    "truck_driver",
    "bus_driver",
    "logistics_driver",
    "heavy_vehicle_driver",
  ],

  // Light passenger transport
  light_passenger_transport: [
    "cab_driver",
    "auto_driver",
    "driver",
    "taxi_driver",
  ],

  // Last-mile delivery & lightweight courier routing
  last_mile_delivery: [
    "delivery_rider",
    "delivery_driver",
    "delivery",
  ],

  // Logistics and warehousing operations
  logistics: [
    "delivery",
    "delivery_rider",
    "warehouse",
    "warehouse_worker",
  ],

  // Electrical engineering and maintenance
  electrical: [
    "electrician",
    "electrician_helper",
    "maintenance",
  ],

  // Plumbing systems
  plumbing: [
    "plumber",
    "plumber_helper",
  ],

  // Woodworking
  carpentry: [
    "carpenter",
  ],

  // Construction work and masonry
  construction: [
    "construction",
    "construction_worker",
    "mason",
  ],

  // Security services
  security: [
    "security_guard",
  ],

  // Domestic assistance
  domestic: [
    "domestic_helper",
  ],

  // Software Development and Engineering
  software_development: [
    "frontend_developer",
    "backend_developer",
    "full_stack_developer",
    "software_engineer",
    "react_developer",
    "node_developer",
    "web_developer",
    "software_developer",
  ],

  // UI/UX Design
  design: [
    "ui_ux_designer",
    "uiux_designer",
    "ui_designer",
    "ux_designer",
  ],

  // Data Science and Business Analytics
  analytics: [
    "data_analyst",
    "business_analyst",
    "data_scientist",
    "analytics_associate",
  ],

  // Product and Operations Management
  product: [
    "product_manager",
    "business_analyst",
  ],

  // Marketing and Promotion
  marketing: [
    "marketing_specialist",
  ],
};

/**
 * Normalizes canonical roles to a standardized snake_case format
 * to prevent mismatch due to spacing, capitalization, or special characters.
 */
const normalizeCanonicalRole = (role = "") => {
  if (!role) return "other";
  return String(role)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

/**
 * Evaluates semantic compatibility based on standardized role ontology groups.
 */
const checkRoleCompatibility = (workerRoleRaw, jobRoleRaw) => {
  const workerRole = normalizeCanonicalRole(workerRoleRaw);
  const jobRole = normalizeCanonicalRole(jobRoleRaw);

  if (workerRole === "other" || jobRole === "other") {
    return { score: 0.1, compatibility: "weak" };
  }

  if (workerRole === jobRole) {
    return { score: 1.0, compatibility: "exact" };
  }

  // Determine if both roles belong to the same ontology-aware group
  let isCompatible = false;
  for (const groupName in COMPATIBLE_GROUPS) {
    const members = COMPATIBLE_GROUPS[groupName];
    if (members.includes(workerRole) && members.includes(jobRole)) {
      isCompatible = true;
      break;
    }
  }

  if (isCompatible) {
    return { score: 0.7, compatibility: "compatible" };
  }

  return { score: 0.0, compatibility: "weak" };
};

/**
 * Calculates weighted match scores after applying semantic compatibility filtering.
 * Fundamental rule: If role compatibility is weak AND skill match is 0%,
 * the job is removed BEFORE scoring.
 */
const calculateMatchScore = (workerProfile, jobs) => {
  const workerRole = (workerProfile.canonicalRole || "").toLowerCase();
  const workerSkills = (workerProfile.skills || []).map((skill) =>
    (skill || "").toString().toLowerCase()
  );
  const workerLocation = (workerProfile.location || "").toLowerCase();
  const workerExperience = parseInt(workerProfile.experience || 0);

  const matchedJobs = jobs
    .map((job) => {
      const jobRole = (job.canonicalRole || "").toLowerCase();
      const jobTitle = (job.title || "").toLowerCase();
      const jobSkills = (job.requiredSkills || []).map((skill) =>
        (skill || "").toString().toLowerCase()
      );
      const requiredExperience = parseInt(job.experienceRequired || 0);
      const jobLocation = (job.location || "").toLowerCase();

      // Skill overlap
      const matchedSkills = workerSkills.filter((skill) =>
        jobSkills.includes(skill)
      );
      const missingSkills = jobSkills.filter(
        (skill) => !workerSkills.includes(skill)
      );
      const skillCoverage =
        jobSkills.length > 0 ? matchedSkills.length / jobSkills.length : 0;
      const skillMatchPercentage = Math.round(skillCoverage * 100);

      // 1. Semantic compatibility check
      const compResult = checkRoleCompatibility(workerRole, jobRole);

      // 2. Ontological filtering: Remove completely if compatibility is weak AND skill match is 0%
      if (compResult.compatibility === "weak" && skillMatchPercentage === 0) {
        return null;
      }

      // 3. Weighted scoring
      let score = 0;

      // Skills represent 50% of the total score weight
      score += Math.round(skillCoverage * 50);

      // Role compatibility represents 20% of the total score weight
      if (compResult.compatibility === "exact") {
        score += 20;
      } else if (compResult.compatibility === "compatible") {
        score += 12;
      } else if (
        jobRole.includes(workerRole) ||
        workerRole.includes(jobRole) ||
        jobTitle.includes(workerRole) ||
        workerRole.includes(jobTitle)
      ) {
        score += 12;
      } else {
        // Severe penalty for weak compatibility (multiplied by 0.1)
        score = Math.round(score * 0.1);
      }

      // Location represents 15% of the total score weight
      if (workerLocation === jobLocation) {
        score += 15;
      }

      // Experience represents 15% of the total score weight
      if (workerExperience >= requiredExperience) {
        score += 15;
      }

      // Cap final scores between 0 and 100
      score = Math.max(0, Math.min(100, score));

      const experienceScore = workerExperience >= requiredExperience ? 95 : 60;
      const locationScore = workerLocation === jobLocation ? 95 : 70;

      return {
        ...job,
        matchScore: score,
        analysis: {
          skillMatch: skillMatchPercentage,
          matchedSkills,
          missingSkills,
          experienceScore,
          locationScore,
        },
      };
    })
    .filter((job) => job !== null);

  // Sort by descending matchScore
  matchedJobs.sort((a, b) => b.matchScore - a.matchScore);

  return matchedJobs;
};

module.exports = {
  calculateMatchScore,
};