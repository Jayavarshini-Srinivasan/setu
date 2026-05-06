const calculateMatchScore = (workerProfile, jobs) => {
  const matchedJobs = jobs.map((job) => {
    let score = 0;

    /*
      ROLE MATCH
    */
    if (
      workerProfile.role.toLowerCase() ===
      job.role.toLowerCase()
    ) {
      score += 40;
    }

    /*
      SKILL MATCH
    */
    const workerSkills = workerProfile.skills.map((skill) =>
      skill.toLowerCase()
    );

    const jobSkills = job.skills.map((skill) =>
      skill.toLowerCase()
    );

    const hasSkillMatch = workerSkills.some((skill) =>
      jobSkills.includes(skill)
    );

    if (hasSkillMatch) {
      score += 30;
    }

    /*
      LOCATION MATCH
    */
    if (
      workerProfile.location.toLowerCase() ===
      job.location.toLowerCase()
    ) {
      score += 20;
    }

    /*
      EXPERIENCE MATCH
    */
    const requiredExperience = parseInt(job.experience_required);

    if (workerProfile.experience >= requiredExperience) {
      score += 10;
    }

    return {
      ...job,
      matchScore: score,
    };
  });

  /*
    SORT DESCENDING
  */
  matchedJobs.sort((a, b) => b.matchScore - a.matchScore);

  return matchedJobs;
};

module.exports = {
  calculateMatchScore,
};