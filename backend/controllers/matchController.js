const {
  jobs,
} = require(
  "../data/jobs"
);

const {
  db,
} = require(
  "../config/firebase"
);

const {
  analyzeMatchedJob,
} = require(
  "../services/ai/jobAnalysisService"
);

const {
  calculateMatchScore,
} = require(
  "../services/matchService"
);

const matchJobs =
  async (req, res) => {

    try {

      const workerProfile = req.body || {};

      if (!workerProfile.role && !workerProfile.canonicalRole) {
        return res.status(400).json({ error: "Missing worker role" });
      }

      /*
      =====================================
      FETCH FIRESTORE JOBS
      =====================================
      */

      const jobsSnapshot =
        await db
          .collection("jobs")
          .where(
            "isActive",
            "==",
            true
          )
          .get();

      let availableJobs = [];

      /*
      =====================================
      FIRESTORE JOBS
      =====================================
      */

      if (
        !jobsSnapshot.empty
      ) {

        availableJobs =
          jobsSnapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        console.log(
          "Using Firestore jobs"
        );

      } else {

        /*
        =====================================
        FALLBACK SAMPLE JOBS
        =====================================
        */

        availableJobs =
          jobs;

        console.log(
          "Using sample jobs fallback"
        );
      }

      /*
      =====================================
      MATCHING
      =====================================
      */

      const matchedJobs =
        calculateMatchScore(
          workerProfile,
          availableJobs
        );

      /*
      =====================================
      FILTER LOW QUALITY
      =====================================
      */

      const filteredJobs =
        matchedJobs.filter(
          (job) =>
            job.matchScore >= 30
        );

      /*
      =====================================
      AI ANALYSIS
      =====================================
      */

      const analyzedJobs =
        await Promise.all(

          filteredJobs.map(
            async (job) =>
              await analyzeMatchedJob(
                workerProfile,
                job
              )
          )
        );

      /*
      =====================================
      SORT DESC
      =====================================
      */

      analyzedJobs.sort(
        (a, b) =>
          b.matchScore -
          a.matchScore
      );

      return res
        .status(200)
        .json(
          analyzedJobs
        );

    } catch (error) {

      console.log(error);

      return res
        .status(500)
        .json({
          error:
            "Failed to match jobs",
        });
    }
  };

module.exports = {
  matchJobs,
};