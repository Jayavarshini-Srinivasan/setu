const jobs = require(
  "../data/jobs.json"
);

/*
  GET ALL SAMPLE JOBS
*/
const getJobs = (
  req,
  res
) => {
  try {
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

module.exports = {
  getJobs,
};