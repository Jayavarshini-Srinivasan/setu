const {db} = require(
  "../config/firebase"
);

/*
  SAMPLE USERS
*/
const users = [
  {
    uid: "worker123",

    role: "worker",

    workerType: "labour",

    language: "english",

    onboardingCompleted: true,

    profile: {
      name: "Ravi",

      role: "delivery",

      skills: [
        "driving",
        "navigation",
      ],

      location: "Chennai",

      experience: 2,

      labourData: {
        availability:
          "full-time",

        preferredShift:
          "day",

        transportAccess:
          true,
      },

      professionalData: {
        education: "",

        certifications: [],

        expectedSalary: 0,

        preferredRoles: [],
      },
    },

    createdAt:
      new Date(),

    updatedAt:
      new Date(),
  },

  {
    uid: "recruiter123",

    role: "recruiter",

    companyName:
      "Setu Logistics",

    contactName:
      "Jaya",

    email:
      "jaya@test.com",

    createdAt:
      new Date(),
  },
];

/*
  SAMPLE JOBS
*/
const jobs = [
  {
    jobId: "job001",

    recruiterId:
      "recruiter123",

    title:
      "Delivery Driver",

    workerCategory:
      "labour",

    requiredSkills: [
      "driving",
      "navigation",
    ],

    location:
      "Chennai",

    salary: 25000,

    experienceRequired: 2,

    description:
      "Deliver packages across Chennai",

    createdAt:
      new Date(),

    updatedAt:
      new Date(),

    isActive: true,
  },
];

/*
  SEED FUNCTION
*/
const seedFirestore =
  async () => {
    try {
      /*
        USERS
      */
      for (const user of users) {
        await db
          .collection("users")
          .doc(user.uid)
          .set(user);

        console.log(
          `Seeded user: ${user.uid}`
        );
      }

      /*
        JOBS
      */
      for (const job of jobs) {
        await db
          .collection("jobs")
          .doc(job.jobId)
          .set(job);

        console.log(
          `Seeded job: ${job.jobId}`
        );
      }

      console.log(
        "Firestore seed complete"
      );

      process.exit();
    } catch (error) {
      console.log(error);

      process.exit(1);
    }
  };

seedFirestore();