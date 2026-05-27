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
  const workerLocation = (workerProfile.location || "").toLowerCase();
  const workerExperience = parseInt(workerProfile.experience || 0);
  const workerExpectedSalary = workerProfile.expectedSalary?.min || parseInt(workerProfile.expectedWage) || 0;
  const workerSkills = (workerProfile.skills || workerProfile.professionalSkills || []).map((skill) =>
    (skill || "").toString().toLowerCase()
  );
  const workerRole = workerProfile.canonicalRole || workerProfile.role || workerProfile.professionalRole || "";

  const matchedJobs = jobs
    .map((job) => {
      const jobRole = job.canonicalRole || job.role || job.title || "";
      const roleMatch = checkRoleCompatibility(workerRole, jobRole);
      
      const jobSkills = (job.requiredSkills || []).map((skill) =>
        (skill || "").toString().toLowerCase()
      );
      const requiredExperience = parseInt(job.minimumExperience || job.experienceRequired || 0);
      const jobLocation = (job.location || "").toLowerCase();
      
      const matchedSkills = workerSkills.filter((skill) => jobSkills.includes(skill));
      const missingSkills = jobSkills.filter((skill) => !workerSkills.includes(skill));

      const skillOverlapPercentage = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) : 0;
      
      if (roleMatch.compatibility === "weak" && skillOverlapPercentage === 0) {
        return null;
      }

      const roleScore = roleMatch.score * 20; // up to 20 points
      const skillOverlap = skillOverlapPercentage * 30; // up to 30 points
      const experienceScore = requiredExperience > 0 ? Math.min(workerExperience / requiredExperience, 1) * 20 : (workerExperience > 0 ? 20 : 0);
      const locationScore = workerLocation === jobLocation ? 15 : 5;
      
      let salaryScore = 5;
      const jobMin = job.salary?.min || 0;
      const jobMax = job.salary?.max || 0;
      if (workerExpectedSalary >= jobMin && workerExpectedSalary <= jobMax) {
        salaryScore = 15;
      } else if (workerExpectedSalary < jobMin) {
        salaryScore = 15;
      }

      const total = roleScore + skillOverlap + experienceScore + locationScore + salaryScore;
      const score = Math.round(Math.min(100, total));

      return {
        ...job,
        matchScore: score,
        analysis: {
          skillMatch: jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 0,
          matchedSkills,
          missingSkills,
          experienceScore: Math.round((experienceScore / 25) * 100),
          locationScore: locationScore === 20 ? 100 : 50,
        },
      };
    })
    .filter((job) => job !== null);

  matchedJobs.sort((a, b) => b.matchScore - a.matchScore);
  return matchedJobs;
};

module.exports = {
  calculateMatchScore,
};