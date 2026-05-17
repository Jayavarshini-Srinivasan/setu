const calculateMatchScore =
  (
    workerProfile,
    jobs
  ) => {

    const matchedJobs =
      jobs.map((job) => {

        /*
          NORMALIZE JOB DATA
        */
        const jobRole =
          (
            job.role ||
            job.workerCategory ||
            ""
          ).toLowerCase();

        const jobTitle =
          (
            job.title || ""
          ).toLowerCase();

        const jobSkills =
          (
            job.skills ||
            job.requiredSkills ||
            []
          ).map((skill) =>
            skill.toLowerCase()
          );

        const requiredExperience =
          parseInt(
            job.experience_required ||
            job.experienceRequired ||
            0
          );

        const jobLocation =
          (
            job.location ||
            ""
          ).toLowerCase();

        /*
          NORMALIZE WORKER
        */
        const workerRole =
          (
            workerProfile
              .canonicalRole ||

            workerProfile
              .jobRole ||

            workerProfile
              .role ||

            ""
          ).toLowerCase();

        const workerSkills =
          (
            workerProfile.skills ||
            []
          ).map((skill) =>
            skill.toLowerCase()
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
          MATCHED SKILLS
        */
        const matchedSkills =
          workerSkills.filter(
            (skill) =>
              jobSkills.includes(
                skill
              )
          );

        /*
          SKILL COVERAGE
        */
        const skillCoverage =
          jobSkills.length > 0
            ? matchedSkills.length /
              jobSkills.length
            : 0;

        /*
          WEIGHTED SCORE
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
          ROLE COMPATIBILITY
        */
        const compatibleRoles = {

          auto_driver: [
            "driver",
            "delivery",
          ],

          truck_driver: [
            "driver",
          ],

          cab_driver: [
            "driver",
          ],

          delivery_worker: [
            "delivery",
          ],

          warehouse_worker: [
            "warehouse",
          ],

          electrician_helper: [
            "electrician",
          ],
        };

        /*
          ROLE MATCH
          20%
        */

        /*
          DIRECT MATCH
        */
        if (
          jobRole ===
          workerRole
        ) {

          score += 20;
        }

        /*
          TITLE MATCH
        */
        else if (

          jobTitle.includes(
            workerRole
          )

        ) {

          score += 15;
        }

        /*
          COMPATIBILITY MATCH
        */
        else if (

          compatibleRoles[
            workerRole
          ]?.includes(
            jobRole
          )

        ) {

          score += 15;
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
          ANALYSIS
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

            missingSkills:
              jobSkills.filter(
                (skill) =>
                  !workerSkills.includes(
                    skill
                  )
              ),

            experienceScore,

            locationScore,
          },
        };
      });

    /*
      SORT DESC
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