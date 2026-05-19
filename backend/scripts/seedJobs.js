const { db } = require("../config/firebase");
const { jobs } = require("../data/jobs");

async function seedJobs() {
  console.log(`Starting to seed ${jobs.length} jobs...`);
  let count = 0;

  try {
    const batch = db.batch();

    for (const job of jobs) {
      const jobData = {
        jobId: job.id,
        title: job.title,
        canonicalRole: job.canonicalRole || job.title,
        workerCategory: job.category, 
        category: job.category, 
        requiredSkills: job.requiredSkills || [],
        experienceRequired: job.experienceRequired || 0,
        location: job.location || "Any",
        salary: job.salary || 0,
        isActive: true,
        description: `We are looking for a skilled ${job.title} to join our team.`,
        createdAt: new Date(),
        updatedAt: new Date(),
        recruiterId: "system_seed", 
      };

      const docRef = db.collection("jobs").doc(job.id);
      batch.set(docRef, jobData, { merge: true });
      count++;
    }

    await batch.commit();
    console.log(`✅ Successfully seeded ${count} jobs to Firestore.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding jobs: ", error);
    process.exit(1);
  }
}

seedJobs();
