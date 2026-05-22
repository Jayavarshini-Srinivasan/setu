const { db } = require("./config/firebase");

async function run() {
  try {
    console.log("=== USERS ===");
    const usersSnapshot = await db.collection("users").get();
    usersSnapshot.forEach(doc => {
      const d = doc.data();
      console.log(`User ID: ${doc.id}, Name: ${d.contactName || d.name || (d.profile && d.profile.name)}, Role: ${d.role}, Email: ${d.email}, Profile: ${JSON.stringify(d.profile || {})}`);
    });

    console.log("\n=== JOBS ===");
    const jobsSnapshot = await db.collection("jobs").get();
    jobsSnapshot.forEach(doc => {
      const d = doc.data();
      console.log(`Job ID: ${doc.id}, Title: ${d.title}, RecruiterID: ${d.recruiterId}, isActive: ${d.isActive}, isDraft: ${d.isDraft}`);
    });

    console.log("\n=== APPLICATIONS ===");
    const appsSnapshot = await db.collection("applications").get();
    appsSnapshot.forEach(doc => {
      const d = doc.data();
      console.log(`App ID: ${doc.id}, JobID: ${d.jobId}, RecruiterID: ${d.recruiterId}, WorkerID: ${d.workerId}, Status: ${d.status}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
