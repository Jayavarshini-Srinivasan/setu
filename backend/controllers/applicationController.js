const db = require("../config/firebase");

const applyToJob = async (req, res) => {
  try {
    const { workerProfile, jobId } = req.body;

    const applicationData = {
      workerProfile,
      jobId,
      appliedAt: new Date(),
    };

    await db
      .collection("applications")
      .add(applicationData);

    res.status(201).json({
      message:
        "Application submitted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to submit application",
    });
  }
};

module.exports = {
  applyToJob,
};