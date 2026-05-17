
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {db} = require("./config/firebase");
const jobsRoutes = require("./routes/jobsRoutes");
const app = express();
const dashboardRoutes = require("./routes/dashboardRoutes");
const matchRoutes = require("./routes/matchRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const authRoutes = require("./routes/authRoutes");
const explanationRoutes = require("./routes/explanationRoutes");
const voiceRoutes = require("./routes/voiceRoutes");
const extractionRoutes = require("./routes/extractionRoutes");

const PORT = 5000;

/*
  MIDDLEWARE
*/
app.use(cors());
app.use(express.json());


  
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
app.use("/auth", authRoutes);
app.use("/dashboard",dashboardRoutes);
app.use("/voice",voiceRoutes);
app.use("/ai",extractionRoutes);

/*
  SERVER
*/
app.get(
  "/ping",
  (req, res) => {

    console.log(
      "PING HIT"
    );

    res.json({
      success: true,
    });
  }
);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});