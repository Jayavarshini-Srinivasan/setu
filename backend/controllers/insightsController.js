const { db } = require("../config/firebase");
const { generateInsightsRecommendations } = require("../services/aiService");

const getRecruiterInsights = async (req, res) => {
  try {
    const recruiterId = req.user.uid;

    // Fetch Recruiter Applications
    const applicationsSnapshot = await db
      .collection("applications")
      .where("recruiterId", "==", recruiterId)
      .get();
    
    const skillCounts = {};
    const workerTypeCounts = { labour: 0, professional: 0 };
    const allCandidatesList = [];
    const skillGapCounts = {};
    
    // We also want to query the recruiter's jobs to calculate the skill gap precisely
    const jobsSnapshot = await db
      .collection("jobs")
      .where("recruiterId", "==", recruiterId)
      .get();
    
    const jobsMap = {};
    jobsSnapshot.docs.forEach((doc) => {
      const jobData = doc.data();
      jobsMap[doc.id] = jobData;
    });

    const workerPromises = applicationsSnapshot.docs.map(async (doc) => {
      const app = doc.data();
      const workerType = app.workerType || "labour";
      workerTypeCounts[workerType] = (workerTypeCounts[workerType] || 0) + 1;
      
      const workerDoc = await db.collection("users").doc(app.workerId).get();
      const jobData = jobsMap[app.jobId] || {};
      
      if (workerDoc.exists) {
        const workerData = workerDoc.data();
        const profile = workerData.profile || {};
        const workerSkills = (profile.skills || []).map((s) => s.toLowerCase());
        
        // Compute skills present in pipeline
        workerSkills.forEach((s) => {
          skillCounts[s] = (skillCounts[s] || 0) + 1;
        });

        // Compute missing skills (skill gaps) for this job
        const requiredSkills = (jobData.requiredSkills || []).map((s) => s.toLowerCase());
        if (requiredSkills.length > 0) {
          const missing = requiredSkills.filter((s) => !workerSkills.includes(s));
          missing.forEach((s) => {
            skillGapCounts[s] = (skillGapCounts[s] || 0) + 1;
          });
        }

        // Push candidate details for top candidates list
        const fullName = profile.name || "Candidate";
        const initials = fullName
          .split(" ")
          .filter(Boolean)
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "C";
          
        const score = app.matchScore || 0;
        let color = "#EF4444"; // red
        if (score >= 80) color = "#10B981"; // green
        else if (score >= 50) color = "#F97316"; // orange

        allCandidatesList.push({
          name: fullName,
          initials,
          score,
          color,
          jobTitle: jobData.title || "Job Role"
        });
      }
    });

    await Promise.all(workerPromises);

    // Top Skills Present
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    // Calculate Top Skill Gaps
    const totalApplicantsCount = applicationsSnapshot.size;
    const skillGaps = Object.entries(skillGapCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => {
        const percentage = totalApplicantsCount > 0 
          ? Math.round((count / totalApplicantsCount) * 100) 
          : 0;
        // Format to match Priya/mock UI format
        // E.g., Power BI is lack by 68% -> "percentage: 68"
        // Let's capitalize skill name properly for aesthetics
        const displaySkill = skill
          .split(" ")
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        return {
          skill: displaySkill,
          percentage
        };
      });

    // Top Candidates
    const topCandidates = allCandidatesList
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const stats = {
      totalApplicants: totalApplicantsCount,
      workerTypeCounts,
      topSkills,
      topSkillGaps: skillGaps,
      topCandidates
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
