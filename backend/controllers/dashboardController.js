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

      const activeJobs = jobsSnapshot.docs.filter((doc) => doc.data().isActive).length;

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

      let totalMatchScore = 0;
      const hiringFunnel = {
        pending: 0,
        reviewed: 0,
        shortlisted: 0,
        rejected: 0,
      };

      applicationsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        totalMatchScore += data.matchScore || 0;
        if (hiringFunnel[data.status] !== undefined) {
          hiringFunnel[data.status]++;
        }
      });

      const totalApplicants = applicationsSnapshot.size;
      const averageMatchScore = totalApplicants > 0 ? Math.round(totalMatchScore / totalApplicants) : 0;

      res.status(200).json({
        totalJobs:
          jobsSnapshot.size,
        activeJobs,
        totalApplicants,
        averageMatchScore,
        hiringFunnel,
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