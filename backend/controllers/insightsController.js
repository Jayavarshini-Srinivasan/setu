const { db } = require("../config/firebase");
const { generateInsightsRecommendations } = require("../services/aiService");

const getRecruiterInsights = async (req, res) => {
  try {
    const recruiterId = req.user.uid;

    const applicationsSnapshot = await db.collection("applications").where("recruiterId", "==", recruiterId).get();
    
    const skillCounts = {};
    const workerTypeCounts = { labour: 0, professional: 0 };
    
    const workerPromises = applicationsSnapshot.docs.map(async (doc) => {
      const app = doc.data();
      workerTypeCounts[app.workerType] = (workerTypeCounts[app.workerType] || 0) + 1;
      
      const workerDoc = await db.collection("users").doc(app.workerId).get();
      if (workerDoc.exists) {
        const skills = workerDoc.data().profile?.skills || [];
        skills.forEach(s => {
          skillCounts[s] = (skillCounts[s] || 0) + 1;
        });
      }
    });

    await Promise.all(workerPromises);

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    const stats = {
      totalApplicants: applicationsSnapshot.size,
      workerTypeCounts,
      topSkills
    };

    // Caching Logic
    let recommendations = [];
    const recruiterRef = db.collection("recruiters").doc(recruiterId);
    const recruiterDoc = await recruiterRef.get();
    
    if (recruiterDoc.exists) {
      const data = recruiterDoc.data();
      const cachedInsights = data.cachedInsights;
      
      // Check if cache is less than 1 hour old
      const oneHour = 60 * 60 * 1000;
      if (cachedInsights && cachedInsights.timestamp && (Date.now() - cachedInsights.timestamp.toMillis() < oneHour)) {
        recommendations = cachedInsights.recommendations;
        console.log("Using cached AI insights for recruiter:", recruiterId);
      } else {
        console.log("Generating new AI insights for recruiter:", recruiterId);
        recommendations = await generateInsightsRecommendations(stats);
        
        // Save to cache
        await recruiterRef.update({
          cachedInsights: {
            recommendations,
            timestamp: new Date()
          }
        }).catch(err => console.error("Failed to update insights cache", err));
      }
    } else {
      recommendations = await generateInsightsRecommendations(stats);
    }

    res.status(200).json({
      ...stats,
      recommendations
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch insights" });
  }
};

module.exports = { getRecruiterInsights };
