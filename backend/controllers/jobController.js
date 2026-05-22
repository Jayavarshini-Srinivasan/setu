const {
  db,
} = require(
  "../config/firebase"
);

/*
  CREATE RECRUITER JOB
*/
const createJob =
  async (req, res) => {
    try {
      /*
        AUTHENTICATED RECRUITER
      */
      const recruiterId =
        req.user.uid;

      /*
        REQUEST DATA
      */
      const {
        title,
        workerCategory,
        requiredSkills,
        location,
        salary,
        experienceRequired,
        description,
        isDraft,
        isActive,
      } = req.body;

      const isDraftVal = isDraft === true;

      /*
        VALIDATION
      */
      if (isDraftVal) {
        if (!title) {
          return res
            .status(400)
            .json({
              error:
                "Job title is required to save a draft",
            });
        }
      } else {
        if (
          !title ||
          !workerCategory ||
          !requiredSkills ||
          !location ||
          !salary ||
          experienceRequired ===
            undefined ||
          !description
        ) {
          return res
            .status(400)
            .json({
              error:
                "Missing required fields",
            });
        }

        /*
          VALID CATEGORY
        */
        const validCategories =
          [
            "labour",
            "professional",
          ];

        if (
          !validCategories.includes(
            workerCategory
          )
        ) {
          return res
            .status(400)
            .json({
              error:
                "Invalid worker category",
            });
        }
      }

      /*
        CREATE DOC REF
      */
      const newJob =
        db
          .collection(
            "jobs"
          )
          .doc();

      /*
        CLEAN DATA
      */
      const jobData =
        {
          jobId:
            newJob.id,

          recruiterId,

          title:
            title.trim(),

          workerCategory: workerCategory || "professional",

          requiredSkills:
            Array.isArray(requiredSkills)
              ? requiredSkills.map(
                  (skill) =>
                    skill.trim()
                )
              : [],

          location:
            (location || "").trim(),

          /*
            NUMERIC
            STORAGE
          */
          salary:
            Number(
              salary || 0
            ),

          experienceRequired:
            experienceRequired !== undefined
              ? (isNaN(Number(experienceRequired))
                  ? 0
                  : Number(experienceRequired))
              : 0,

          description:
            (description || "").trim(),

          isActive:
            isActive !== undefined
              ? isActive
              : !isDraftVal,

          isDraft: isDraftVal,

          createdAt:
            new Date(),

          updatedAt:
            new Date(),
        };

      /*
        SAVE JOB
      */
      await newJob.set(
        jobData
      );

      res.status(201).json({
        message:
          "Job created successfully",

        job:
          jobData,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        error:
          "Failed to create job",
      });
    }
  };

/*
  GET RECRUITER JOBS
*/
const getRecruiterJobs =
  async (req, res) => {
    try {
      const recruiterId =
        req.user.uid;

      /*
        FETCH JOBS
      */
      const snapshot =
        await db
          .collection(
            "jobs"
          )
          .where(
            "recruiterId",
            "==",
            recruiterId
          )
          .get();

      /*
        EMPTY
      */
      if (
        snapshot.empty
      ) {
        return res
          .status(200)
          .json([]);
      }

      /*
        FORMAT JOBS
      */
      const appsSnapshot = await db
        .collection("applications")
        .where("recruiterId", "==", recruiterId)
        .get();

      const appCounts = {};
      appsSnapshot.forEach(doc => {
        const app = doc.data();
        if (app.jobId) {
          appCounts[app.jobId] = (appCounts[app.jobId] || 0) + 1;
        }
      });

      const jobs = [];

      snapshot.forEach(
        (doc) => {
          const job = doc.data();
          job.applicantCount = appCounts[job.jobId] || 0;
          jobs.push(job);
        }
      );

      res.status(200).json(
        jobs
      );
    } catch (error) {
      console.log(error);

      res.status(500).json({
        error:
          "Failed to fetch jobs",
      });
    }
  };

/*
  TOGGLE JOB STATUS
*/
const toggleJobStatus =
  async (req, res) => {
    try {
      const { jobId } =
        req.params;

      const {
        isActive,
      } = req.body;

      const recruiterId =
        req.user.uid;

      /*
        VALIDATE BOOLEAN
      */
      if (
        typeof isActive !==
        "boolean"
      ) {
        return res
          .status(400)
          .json({
            error:
              "isActive must be boolean",
          });
      }

      /*
        FETCH JOB
      */
      const jobRef =
        db
          .collection(
            "jobs"
          )
          .doc(jobId);

      const jobDoc =
        await jobRef.get();

      /*
        NOT FOUND
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
              "Unauthorized",
          });
      }

      /*
        UPDATE STATUS
      */
      await jobRef.update({
        isActive,

        updatedAt:
          new Date(),
      });

      res.status(200).json({
        message:
          "Job status updated",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        error:
          "Failed to update job status",
      });
    }
  };


  /*
  GET SINGLE JOB
*/
const getSingleJob =
  async (req, res) => {
    try {
      const { jobId } =
        req.params;

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
        NOT FOUND
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
              "Unauthorized",
          });
      }

      res
        .status(200)
        .json(jobData);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        error:
          "Failed to fetch job",
      });
    }
  };

/*
  UPDATE JOB
*/
const updateJob =
  async (req, res) => {
    try {
      const { jobId } =
        req.params;

      const recruiterId =
        req.user.uid;

      const {
        title,
        workerCategory,
        requiredSkills,
        location,
        salary,
        experienceRequired,
        description,
        isDraft,
        isActive,
      } = req.body;

      /*
        FETCH JOB
      */
      const jobRef =
        db
          .collection("jobs")
          .doc(jobId);

      const jobDoc =
        await jobRef.get();

      /*
        NOT FOUND
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
              "Unauthorized",
          });
      }

      /*
        UPDATE DATA
      */
      const updateData = {};
      if (title !== undefined) updateData.title = title.trim();
      if (workerCategory !== undefined) updateData.workerCategory = workerCategory;
      if (requiredSkills !== undefined) {
        updateData.requiredSkills = Array.isArray(requiredSkills)
          ? requiredSkills.map((s) => s.trim())
          : [];
      }
      if (location !== undefined) updateData.location = location.trim();
      if (salary !== undefined) updateData.salary = Number(salary || 0);
      if (experienceRequired !== undefined) {
        updateData.experienceRequired = isNaN(Number(experienceRequired))
          ? 0
          : Number(experienceRequired);
      }
      if (description !== undefined) updateData.description = description.trim();
      if (isDraft !== undefined) updateData.isDraft = isDraft;
      if (isActive !== undefined) updateData.isActive = isActive;
      updateData.updatedAt = new Date();

      await jobRef.update(updateData);

      res.status(200).json({
        message:
          "Job updated successfully",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        error:
          "Failed to update job",
      });
    }
  };

/*
  DELETE JOB
*/
const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const recruiterId = req.user.uid;

    const jobRef = db.collection("jobs").doc(jobId);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) {
      return res.status(404).json({ error: "Job not found" });
    }

    const jobData = jobDoc.data();
    if (jobData.recruiterId !== recruiterId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Delete job
    await jobRef.delete();

    // Delete all associated applications for this job
    const appsSnapshot = await db
      .collection("applications")
      .where("jobId", "==", jobId)
      .get();
    
    const batch = db.batch();
    appsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.status(200).json({ message: "Job and its applications deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete job" });
  }
};

module.exports = {
  createJob,
  getRecruiterJobs,
  toggleJobStatus,
  getSingleJob,
  updateJob,
  deleteJob,
};