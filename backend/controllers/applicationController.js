const { db } = require("../config/firebase");
const { calculateMatchScore } = require("../services/matchService");

const applyToJob =
  async (req, res) => {
    try {
      /*
        REQUEST DATA
      */
      const {
        jobId,
        matchScore,
      } = req.body;

      const workerId = req.user.uid;

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
          const workerData = workerDoc.data();
          
          let matchResult = null;
          if (workerData.profile) {
            matchResult = calculateMatchScore(workerData.profile, [jobData])[0];
          }

          applicants.push({
            applicationId:
              application.applicationId,

            status:
              application.status,

            matchScore:
              application.matchScore,

            aiSummary:
              application.aiSummary || "",

            strengths:
              matchResult?.analysis?.matchedSkills || [],

            weaknesses:
              matchResult?.analysis?.missingSkills || [],

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

    // Send localized notification to candidate upon shortlisting (accepting)
    if (status === "shortlisted") {
      try {
        const appData = applicationDoc.data();
        const workerId = appData.workerId;
        const jobId = appData.jobId;

        const workerDoc = await db.collection("users").doc(workerId).get();
        const jobDoc = await db.collection("jobs").doc(jobId).get();

        if (workerDoc.exists && jobDoc.exists) {
          const workerData = workerDoc.data();
          const jobData = jobDoc.data();
          const lang = workerData.profile?.language || workerData.language || "en";
          const jobTitle = jobData.title || "Job";

          let notifTitle = "Application Shortlisted! 🎉";
          let notifMessage = `Congratulations! Your application for "${jobTitle}" has been shortlisted. The recruiter will contact you soon.`;

          if (lang === "hi") {
            notifTitle = "आवेदन शॉर्टलिस्ट किया गया! 🎉";
            notifMessage = `बधाई हो! "${jobTitle}" के लिए आपके आवेदन को शॉर्टलिस्ट किया गया है। भर्तीकर्ता जल्द ही आपसे संपर्क करेगा।`;
          } else if (lang === "ta") {
            notifTitle = "விண்ணப்பம் தேர்ந்தெடுக்கப்பட்டது! 🎉";
            notifMessage = `வாழ்த்துகள்! "${jobTitle}" க்கான உங்கள் விண்ணப்பம் தேர்ந்தெடுக்கப்பட்டுள்ளது. பணியமர்த்துபவர் விரைவில் உங்களைத் தொடர்புகொள்வார்.`;
          } else if (lang === "mr") {
            notifTitle = "अर्ज शॉर्टलिस्ट केला! 🎉";
            notifMessage = `अभिनंदन! "${jobTitle}" साठी तुमचा अर्ज शॉर्टलिस्ट करण्यात आला आहे. रिक्रूटर्स लवकरच तुमच्याशी संपर्क साधतील.`;
          }

          await db
            .collection("users")
            .doc(workerId)
            .collection("notifications")
            .add({
              title: notifTitle,
              message: notifMessage,
              jobId,
              status: "unread",
              createdAt: new Date(),
            });
        }
      } catch (err) {
        console.log("NOTIFICATION ERROR:", err.message);
      }
    }

    res.status(200).json({ message: "Application status updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update application status" });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const recruiterId = req.user.uid;

    const applicationRef = db.collection("applications").doc(applicationId);
    const applicationDoc = await applicationRef.get();

    if (!applicationDoc.exists) return res.status(404).json({ error: "Application not found" });
    
    const application = applicationDoc.data();
    if (application.recruiterId !== recruiterId) return res.status(403).json({ error: "Unauthorized" });

    // Fetch Job
    const jobDoc = await db.collection("jobs").doc(application.jobId).get();
    const jobData = jobDoc.data();

    // Fetch Worker
    const workerDoc = await db.collection("users").doc(application.workerId).get();
    const workerData = workerDoc.data();
    
    let matchResult = null;
    if (workerData.profile) {
      matchResult = calculateMatchScore(workerData.profile, [jobData])[0];
    }

    res.status(200).json({
      ...application,
      strengths: matchResult?.analysis?.matchedSkills || [],
      weaknesses: matchResult?.analysis?.missingSkills || [],
      worker: {
        workerId: workerData.uid,
        workerType: workerData.workerType,
        profile: workerData.profile,
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch application" });
  }
};

module.exports = {
  applyToJob,
  getApplicantsForJob,
  updateApplicationStatus,
  getApplicationById,
};
