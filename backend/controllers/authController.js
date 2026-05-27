const { admin, db } = require(
  "../config/firebase"
);

const onboardRecruiter = async (req, res) => {
  try {
    const { companyName, contactName, email, role } = req.body;
    const uid = req.user.uid;

    const recruiterData = {
      uid,
      role: role || "recruiter",
      companyName,
      contactName,
      email,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Use admin SDK to bypass client-side Firestore security rules
    await db.collection("users").doc(uid).set(recruiterData);
    await db.collection("recruiters").doc(uid).set(recruiterData);

    res.status(200).json({ message: "Recruiter profile created successfully" });
  } catch (error) {
    console.error("ONBOARD ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    

    /*
      CREATE FIREBASE AUTH USER
    */
    const userRecord =
      await admin.auth().createUser({
        email,
        password,
      });

    /*
      CREATE USER PROFILE
    */
    const userData = {
  uid: userRecord.uid,

  role,

  workerType: "",

  language: "english",

  onboardingCompleted: false,

  profile: {
    name,

    skills: [],

    location: "",

    experience: 0,

    labourData: {
      availability: "",

      preferredShift: "",

      transportAccess: false,
    },

    professionalData: {
      education: "",

      certifications: [],

      expectedSalary: 0,

      preferredRoles: [],
    },
  },

  createdAt: new Date(),

  updatedAt: new Date(),
};

    /*
      SAVE TO FIRESTORE
    */
    await db
      .collection("users")
      .doc(userRecord.uid)
      .set(userData);

    res.status(201).json({
      message:
        "User created successfully",
      uid: userRecord.uid,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

/*
  GET PROFILE
*/
const getProfile = async (
  req,
  res
) => {
  try {
    const userDoc = await db
      .collection("users")
      .doc(req.user.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json(
      userDoc.data()
    );
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  signup,
  getProfile,
  onboardRecruiter,
};