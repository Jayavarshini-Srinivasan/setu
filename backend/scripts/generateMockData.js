const { admin, db } = require("../config/firebase");
const { jobs } = require("../data/jobs");

// Realistic random data generators
const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Ravi", "Suresh", "Ramesh", "Priya", "Anjali", "Neha", "Pooja", "Aarti", "Kavita", "Sita", "Rohit", "Rahul", "Vikram", "Sanjay", "Anil", "Sunil", "Prakash", "Amit", "Rajesh", "Deepak"];
const lastNames = ["Sharma", "Patel", "Singh", "Kumar", "Rao", "Das", "Reddy", "Gupta", "Mehta", "Bose", "Nair", "Iyer", "Pillai", "Verma", "Chauhan", "Yadav", "Jain", "Mishra", "Pandey", "Dixit", "Agarwal", "Kaur"];
const cities = ["Bangalore", "Mumbai", "Delhi", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad", "Surat", "Jaipur"];
const companySuffixes = ["Logistics", "Technologies", "Solutions", "Services", "Consulting", "Group", "Enterprises", "Corp", "Systems", "Retail"];
const statuses = ["pending", "reviewed", "shortlisted", "rejected"];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const generateEmail = (firstName, lastName) => `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1, 99)}@example.com`;

async function seedData() {
  console.log("Starting mock data generation...");
  
  try {
    // 1. Generate Recruiters
    console.log("Generating recruiters...");
    const recruiters = [];
    const recruiterBatch = db.batch();
    for (let i = 1; i <= 10; i++) {
      const fName = getRandom(firstNames);
      const lName = getRandom(lastNames);
      const uid = `mock_recruiter_${i}`;
      const companyName = `${fName} ${getRandom(companySuffixes)}`;
      
      const recruiterData = {
        uid,
        role: "recruiter",
        companyName,
        contactName: `${fName} ${lName}`,
        email: generateEmail(fName, lName),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      // Save to users collection
      recruiterBatch.set(db.collection("users").doc(uid), recruiterData);
      // Save to recruiters collection as well
      recruiterBatch.set(db.collection("recruiters").doc(uid), recruiterData);
      
      recruiters.push(recruiterData);
    }
    await recruiterBatch.commit();
    console.log(`Seeded 10 recruiters`);

    // 2. Generate Jobs
    console.log("Generating jobs...");
    const generatedJobs = [];
    for (let i = 1; i <= 45; i++) {
      const ontologyJob = getRandom(jobs);
      const recruiter = getRandom(recruiters);
      const jobId = `mock_job_${i}`;
      
      const jobData = {
        jobId,
        recruiterId: recruiter.uid,
        title: ontologyJob.title,
        canonicalRole: ontologyJob.canonicalRole,
        category: ontologyJob.category,
        workerCategory: ontologyJob.category,
        requiredSkills: ontologyJob.requiredSkills,
        experienceRequired: getRandomInt(0, 5),
        location: getRandom(cities),
        salary: ontologyJob.salary + getRandomInt(-2, 5) * 1000,
        description: `We are urgently looking for a skilled ${ontologyJob.title} in ${getRandom(cities)}.`,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      await db.collection("jobs").doc(jobId).set(jobData);
      generatedJobs.push(jobData);
    }
    console.log(`Seeded 45 jobs`);

    // 3. Generate Users (Workers)
    console.log("Generating workers...");
    const workers = [];
    for (let i = 1; i <= 55; i++) {
      const isProfessional = Math.random() > 0.5;
      const fName = getRandom(firstNames);
      const lName = getRandom(lastNames);
      const uid = `mock_worker_${i}`;
      
      // Pick an ontology job to mimic the worker's role and skills
      const possibleOntologyJobs = jobs.filter(j => j.category === (isProfessional ? "professional" : "labour"));
      const ontologyRole = getRandom(possibleOntologyJobs);
      
      // Give them some or all skills
      const numSkills = getRandomInt(1, ontologyRole.requiredSkills.length);
      const workerSkills = [...ontologyRole.requiredSkills].sort(() => 0.5 - Math.random()).slice(0, numSkills);
      
      const workerData = {
        uid,
        role: "worker",
        workerType: isProfessional ? "professional" : "labour",
        language: "english",
        onboardingCompleted: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        profile: {
          name: `${fName} ${lName}`,
          role: ontologyRole.canonicalRole,
          skills: workerSkills,
          location: getRandom(cities),
          experience: getRandomInt(0, 10),
          labourData: !isProfessional ? {
            availability: "full-time",
            preferredShift: getRandom(["day", "night", "any"]),
            transportAccess: Math.random() > 0.5,
          } : null,
          professionalData: isProfessional ? {
            education: getRandom(["B.Tech", "B.Sc", "MBA", "MCA", "B.Com", "BA"]),
            certifications: [],
            expectedSalary: ontologyRole.salary + getRandomInt(-10, 20) * 1000,
            preferredRoles: [ontologyRole.canonicalRole],
          } : null,
        }
      };
      
      await db.collection("users").doc(uid).set(workerData);
      workers.push(workerData);
    }
    console.log(`Seeded 55 workers`);

    // 4. Generate Applications
    console.log("Generating applications...");
    let appCount = 0;
    
    for (const job of generatedJobs) {
      // Randomly assign 2 to 6 workers per job
      const numApplicants = getRandomInt(2, 6);
      const possibleWorkers = workers.filter(w => w.workerType === job.category);
      
      // Shuffle possible workers
      const applicants = [...possibleWorkers].sort(() => 0.5 - Math.random()).slice(0, numApplicants);
      
      for (const applicant of applicants) {
        appCount++;
        const applicationId = `mock_app_${appCount}`;
        
        // Calculate match score
        const workerSkills = applicant.profile.skills || [];
        const jobSkills = job.requiredSkills || [];
        let overlap = 0;
        jobSkills.forEach(skill => {
          if (workerSkills.includes(skill)) overlap++;
        });
        const matchScore = jobSkills.length > 0 ? Math.round((overlap / jobSkills.length) * 100) : 100;
        
        const status = getRandom(statuses);
        
        // Realistic AI Summary based on match score
        let aiSummary = "";
        if (matchScore >= 80) {
          aiSummary = `Strong match for ${job.title} (${matchScore}% compatibility). Excellent skill alignment.`;
        } else if (matchScore >= 50) {
          aiSummary = `Moderately matched for ${job.title} — skill gap present. Matches ${overlap} out of ${jobSkills.length} required skills.`;
        } else {
          aiSummary = `Growing profile — ${job.title} match improving. Lacks key required skills.`;
        }

        const appData = {
          applicationId,
          workerId: applicant.uid,
          recruiterId: job.recruiterId,
          jobId: job.jobId,
          workerType: applicant.workerType,
          matchScore,
          status,
          aiSummary,
          appliedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        
        await db.collection("applications").doc(applicationId).set(appData);
      }
    }
    console.log(`Seeded ${appCount} applications`);
    
    console.log("Mock data generation completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error generating mock data:", error);
    process.exit(1);
  }
}

seedData();
