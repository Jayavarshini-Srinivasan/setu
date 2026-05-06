const jobs = require("../data/jobs.json");

const {
  calculateMatchScore,
} = require("../services/matchService");

const matchJobs = (req, res) => {
  const workerProfile = req.body;

  const matchedJobs = calculateMatchScore(
    workerProfile,
    jobs
  );

  res.status(200).json(matchedJobs);
};

module.exports = {
  matchJobs,
};