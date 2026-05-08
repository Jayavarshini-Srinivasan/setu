const {
  generateMatchExplanation,
} = require("../services/aiService");

const explainMatch = async (req, res) => {
  try {
    const { workerProfile, job } = req.body;

    const explanation =
      await generateMatchExplanation(
        workerProfile,
        job
      );

    res.status(200).json({
      explanation,
    });
  } catch (error) {
    console.log("full error:", error);

    res.status(500).json({
      error:
        error.message,
    });
  }
};

module.exports = {
  explainMatch,
};