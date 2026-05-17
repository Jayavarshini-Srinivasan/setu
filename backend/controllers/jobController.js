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
      } = req.body;

      /*
        VALIDATION
      */
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

          workerCategory,

          requiredSkills:
            requiredSkills.map(
              (skill) =>
                skill.trim()
            ),

          location:
            location.trim(),

          /*
            NUMERIC
            STORAGE
          */
          salary:
            Number(
              salary
            ),

          experienceRequired:
            Number(
              experienceRequired
            ),

          description:
            description.trim(),

          isActive: true,

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
      const jobs = [];

      snapshot.forEach(
        (doc) => {
          jobs.push(
            doc.data()
          );
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
      await jobRef.update({
        title:
          title.trim(),

        workerCategory,

        requiredSkills,

        location:
          location.trim(),

        salary:
          Number(salary),

        experienceRequired:
          Number(
            experienceRequired
          ),

        description:
          description.trim(),

        updatedAt:
          new Date(),
      });

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

module.exports = {
  createJob,
  getRecruiterJobs,
  toggleJobStatus,
  getSingleJob,
  updateJob,
};