const {
  db,
} = require(
  "../config/firebase"
);

const applyToJob =
  async (req, res) => {
    try {
      /*
        REQUEST DATA
      */
      const {
        workerId,
        jobId,
        matchScore,
      } = req.body;

      /*
        FETCH WORKER
      */
      const workerDoc =
        await db
          .collection("users")
          .doc(workerId)
          .get();

      /*
        WORKER NOT FOUND
      */
      if (
        !workerDoc.exists
      ) {
        return res
          .status(404)
          .json({
            error:
              "Worker not found",
          });
      }

      const workerData =
        workerDoc.data();

      /*
        FETCH JOB
      */
      const jobDoc =
        await db
          .collection("jobs")
          .doc(jobId)
          .get();

      /*
        JOB NOT FOUND
      */
      if (
        !jobDoc.exists
      ) {
        return res
          .status(404)
          .json({
            error:
              "Job not found",
          });
      }

      const jobData =
        jobDoc.data();

      /*
        DUPLICATE CHECK
      */
      const existingApplication =
        await db
          .collection(
            "applications"
          )
          .where(
            "workerId",
            "==",
            workerId
          )
          .where(
            "jobId",
            "==",
            jobId
          )
          .get();

      if (
        !existingApplication.empty
      ) {
        return res
          .status(400)
          .json({
            error:
              "Already applied to this job",
          });
      }

      /*
        CREATE APPLICATION
      */
      const applicationRef =
        db
          .collection(
            "applications"
          )
          .doc();

      const applicationData =
        {
          applicationId:
            applicationRef.id,

          workerId,

          recruiterId:
            jobData.recruiterId,

          jobId,

          workerType:
            workerData.workerType,

          matchScore,

          status:
            "pending",

          appliedAt:
            new Date(),
        };

      /*
        SAVE
      */
      await applicationRef.set(
        applicationData
      );

      res.status(201).json({
        message:
          "Application submitted successfully",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        error:
          "Failed to submit application",
      });
    }
  };

const getApplicantsForJob =
  async (req, res) => {
    try {
      /*
        JOB ID
      */
      const { jobId } =
        req.params;

      /*
        RECRUITER
      */
      const recruiterId =
        req.user.uid;

      /*
        FETCH JOB
      */
      const jobDoc =
        await db
          .collection("jobs")
          .doc(jobId)
          .get();

      /*
        JOB NOT FOUND
      */
      if (!jobDoc.exists) {
        return res
          .status(404)
          .json({
            error:
              "Job not found",
          });
      }

      const jobData =
        jobDoc.data();

      /*
        OWNERSHIP CHECK
      */
      if (
        jobData.recruiterId !==
        recruiterId
      ) {
        return res
          .status(403)
          .json({
            error:
              "Unauthorized access",
          });
      }

      /*
        FETCH APPLICATIONS
      */
      const applicationsSnapshot =
        await db
          .collection(
            "applications"
          )
          .where(
            "jobId",
            "==",
            jobId
          )
          .get();

      /*
        EMPTY
      */
      if (
        applicationsSnapshot.empty
      ) {
        return res
          .status(200)
          .json([]);
      }

      const applicants =
        [];

      /*
        ENRICH APPLICANTS
      */
      for (const doc of applicationsSnapshot.docs) {
        const application =
          doc.data();

        /*
          FETCH WORKER
        */
        const workerDoc =
          await db
            .collection(
              "users"
            )
            .doc(
              application.workerId
            )
            .get();

        if (
          workerDoc.exists
        ) {
          const workerData =
            workerDoc.data();

          applicants.push({
            applicationId:
              application.applicationId,

            status:
              application.status,

            matchScore:
              application.matchScore,

            appliedAt:
              application.appliedAt,

            worker: {
              workerId:
                workerData.uid,

              workerType:
                workerData.workerType,

              profile:
                workerData.profile,
            },
          });
        }
      }

      res
        .status(200)
        .json(applicants);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        error:
          "Failed to fetch applicants",
      });
    }
  };

const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const recruiterId = req.user.uid;

    const applicationRef = db.collection("applications").doc(applicationId);
    const applicationDoc = await applicationRef.get();

    if (!applicationDoc.exists) return res.status(404).json({ error: "Application not found" });
    if (applicationDoc.data().recruiterId !== recruiterId) return res.status(403).json({ error: "Unauthorized" });

    await applicationRef.update({ status, updatedAt: new Date() });
    res.status(200).json({ message: "Application status updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update application status" });
  }
};

module.exports = {
  applyToJob,
  getApplicantsForJob,
  updateApplicationStatus,
};