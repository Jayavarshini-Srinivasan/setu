const jobs = require("../data/jobs.json");

const getAllJobs = (req, res) => {
  res.status(200).json(jobs);
};

module.exports = {
  getAllJobs,
};