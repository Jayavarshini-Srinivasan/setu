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

      const activeJobsList = [];
      const appCounts = {};
      applicationsSnapshot.docs.forEach((doc) => {
        const app = doc.data();
        if (app.jobId) {
          appCounts[app.jobId] = (appCounts[app.jobId] || 0) + 1;
        }
      });

      jobsSnapshot.docs.forEach((doc) => {
        const job = doc.data();
        if (job.isActive && !job.isDraft) {
          activeJobsList.push({
            ...job,
            applicantCount: appCounts[job.jobId] || 0,
          });
        }
      });

      // Get top 5 recent applications sorted by appliedAt descending
      const recentAppsRaw = applicationsSnapshot.docs.map((doc) => doc.data());
      recentAppsRaw.sort((a, b) => {
        const tA = a.appliedAt?.toDate ? a.appliedAt.toDate().getTime() : (a.appliedAt?._seconds ? a.appliedAt._seconds * 1000 : new Date(a.appliedAt || 0).getTime());
        const tB = b.appliedAt?.toDate ? b.appliedAt.toDate().getTime() : (b.appliedAt?._seconds ? b.appliedAt._seconds * 1000 : new Date(b.appliedAt || 0).getTime());
        return tB - tA;
      });
      const recentAppsSlice = recentAppsRaw.slice(0, 5);

      const recentApplicants = [];
      for (const app of recentAppsSlice) {
        let workerName = "Unknown";
        let jobTitle = "Applicant";

        // Fetch worker name
        if (app.workerId) {
          const workerDoc = await db.collection("users").doc(app.workerId).get();
          if (workerDoc.exists) {
            const wData = workerDoc.data();
            workerName = wData.contactName || wData.name || (wData.profile && wData.profile.name) || "Unknown";
          }
        }

        // Fetch job title
        if (app.jobId) {
          const jobDoc = await db.collection("jobs").doc(app.jobId).get();
          if (jobDoc.exists) {
            jobTitle = jobDoc.data().title || "Job";
          }
        }

        recentApplicants.push({
          applicationId: app.applicationId,
          jobId: app.jobId,
          workerId: app.workerId,
          status: app.status || "pending",
          workerName,
          jobTitle,
          appliedAt: app.appliedAt,
        });
      }

      const totalApplicants = applicationsSnapshot.size;
      const averageMatchScore = totalApplicants > 0 ? Math.round(totalMatchScore / totalApplicants) : 0;

      res.status(200).json({
        totalJobs:
          jobsSnapshot.size,
        activeJobs,
        totalApplicants,
        averageMatchScore,
        hiringFunnel,
        activeJobsList,
        recentApplicants,
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