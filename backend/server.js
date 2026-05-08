
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/firebase");
const jobsRoutes = require("./routes/jobsRoutes");
const app = express();
const matchRoutes = require("./routes/matchRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const explanationRoutes = require("./routes/explanationRoutes");

const PORT = 5000;

/*
  MIDDLEWARE
*/
app.use(cors());
app.use(express.json());

db.collection("test")
  .add({
    message: "Firebase connected",
    createdAt: new Date(),
  })
  .then(() => {
    console.log("Firebase test document added");
  })
  .catch((error) => {
    console.log(error);
  });
  
/*
  ROUTES
*/
app.get("/", (req, res) => {
  res.send("API is running");
});
app.use("/jobs", jobsRoutes);
app.use("/match", matchRoutes);
app.use("/apply", applicationRoutes);
app.use("/explain-match",explanationRoutes);

/*
  SERVER
*/
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});