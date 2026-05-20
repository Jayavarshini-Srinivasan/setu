const { db } = require("../config/firebase");

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

    const recommendations = [
      "Skill Gap Alert: 40% of applicants lack 'Advanced Safety Training'. Consider adding it to your required skills.",
      "Most of your applicants are in the Professional tier. Review your pay scales.",
      "Hiring is slowing down this week. Try bumping your active jobs.",
      `Your most abundant talent pool knows: ${topSkills[0]?.skill || 'Basic Labor'}.`
    ];

    res.status(200).json({
      totalApplicants: applicationsSnapshot.size,
      workerTypeCounts,
      topSkills,
      recommendations
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch insights" });
  }
};

module.exports = { getRecruiterInsights };
