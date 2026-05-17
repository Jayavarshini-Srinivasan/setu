const {
  db,
} = require(
  "../config/firebase"
);

/*
  GET RECRUITER DASHBOARD STATS
*/
const getDashboardStats =
  async (req, res) => {
    try {
      const recruiterId =
        req.user.uid;

      /*
        FETCH JOBS
      */
      const jobsSnapshot =
        await db
          .collection("jobs")
          .where(
            "recruiterId",
            "==",
            recruiterId
          )
          .get();

      /*
        FETCH APPLICATIONS
      */
      const applicationsSnapshot =
        await db
          .collection(
            "applications"
          )
          .where(
            "recruiterId",
            "==",
            recruiterId
          )
          .get();

      res.status(200).json({
        totalJobs:
          jobsSnapshot.size,

        totalApplicants:
          applicationsSnapshot.size,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        error:
          "Failed to fetch dashboard stats",
      });
    }
  };

module.exports = {
  getDashboardStats,
};