const calculateMatchScore =
  (
    workerProfile,
    jobs
  ) => {

    const matchedJobs =
      jobs.map((job) => {

        /*
        =====================================
        NORMALIZE JOB
        =====================================
        */

        const jobRole =
          (
            job.canonicalRole ||
            ""
          ).toLowerCase();

        const jobTitle =
          (
            job.title || ""
          ).toLowerCase();

        const jobSkills = (job.requiredSkills || []).map((skill) =>
          (skill || "").toString().toLowerCase()
        );

        const requiredExperience =
          parseInt(
            job.experienceRequired || 0
          );

        const jobLocation =
          (
            job.location || ""
          ).toLowerCase();

        /*
        =====================================
        NORMALIZE WORKER
        =====================================
        */

        const workerRole =
          (
            workerProfile
              .canonicalRole ||
            ""
          ).toLowerCase();

        const workerSkills = (workerProfile.skills || []).map((skill) =>
          (skill || "").toString().toLowerCase()
        );

        const workerLocation =
          (
            workerProfile.location ||
            ""
          ).toLowerCase();

        const workerExperience =
          parseInt(
            workerProfile
              .experience || 0
          );

        /*
        =====================================
        MATCHED SKILLS
        =====================================
        */

        const matchedSkills =
          workerSkills.filter(
            (skill) =>
              jobSkills.includes(
                skill
              )
          );

        /*
        =====================================
        MISSING SKILLS
        =====================================
        */

        const missingSkills =
          jobSkills.filter(
            (skill) =>
              !workerSkills.includes(
                skill
              )
          );

        /*
        =====================================
        SKILL COVERAGE
        =====================================
        */

        const skillCoverage =
          jobSkills.length > 0
            ? matchedSkills.length /
              jobSkills.length
            : 0;

        /*
        =====================================
        WEIGHTED SCORE
        =====================================
        */

        let score = 0;

        /*
        SKILLS
        50%
        */

        score += Math.round(
          skillCoverage * 50
        );

        /*
        ROLE MATCH
        20%
        */

        if (
          workerRole ===
          jobRole
        ) {

          score += 20;

        } else if (

          jobTitle.includes(
            workerRole
          )

        ) {

          score += 10;

        } else {
            /*
            HEAVY PENALTY FOR ROLE MISMATCH
            Ensures professionals don't see labour jobs
            and vice versa just because of overlapping generic skills.
            */
            score = Math.round(score * 0.1); 
        }

        /*
        LOCATION
        15%
        */

        if (
          workerLocation ===
          jobLocation
        ) {

          score += 15;
        }

        /*
        EXPERIENCE
        15%
        */

        if (
          workerExperience >=
          requiredExperience
        ) {

          score += 15;
        }

        /*
        =====================================
        ANALYSIS
        =====================================
        */

        const skillMatchPercentage =
          Math.round(
            skillCoverage * 100
          );

        const experienceScore =
          workerExperience >=
          requiredExperience
            ? 95
            : 60;

        const locationScore =
          workerLocation ===
          jobLocation
            ? 95
            : 70;

        return {

          ...job,

          matchScore: score,

          analysis: {

            skillMatch:
              skillMatchPercentage,

            matchedSkills,

            missingSkills,

            experienceScore,

            locationScore,
          },
        };
      });

    /*
    =====================================
    SORT DESC
    =====================================
    */

    matchedJobs.sort(
      (a, b) =>
        b.matchScore -
        a.matchScore
    );

    return matchedJobs;
  };

module.exports = {
  calculateMatchScore,
};