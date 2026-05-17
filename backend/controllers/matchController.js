const sampleJobs =
  require(
    "../data/jobs.json"
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
      const workerProfile =
        req.body;

      /*
        FETCH FIRESTORE JOBS
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

      let jobs = [];

      /*
        FIRESTORE JOBS
      */
      if (
        !jobsSnapshot.empty
      ) {
        jobs =
          jobsSnapshot.docs.map(
            (doc) =>
              doc.data()
          );
          console.log(
  JSON.stringify(
    jobs,
    null,
    2
  )
);

        console.log(
          "Using Firestore jobs"
        );
      } else {
        /*
          FALLBACK
        */
        jobs =
          sampleJobs;

        console.log(
          "Using sample jobs fallback"
        );
      }

      /*
        MATCHING
      */
      const matchedJobs =
        calculateMatchScore(
          workerProfile,
          jobs
        );

      /*
        FILTER LOW SCORES
      */
      const filteredJobs =
        matchedJobs.filter(
          (job) =>
            job.matchScore >=
            30
        );
        console.log(
  matchedJobs.map(
    (job) => ({
      title: job.title,
      score: job.matchScore,
    })
  )
);
      /*
        AI ANALYSIS
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
        SORT DESC
      */
      analyzedJobs.sort(
        (a, b) =>
          b.matchScore -
          a.matchScore
      );

      res
        .status(200)
        .json(analyzedJobs);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        error:
          "Failed to match jobs",
      });
    }
  };

module.exports = {
  matchJobs,
};