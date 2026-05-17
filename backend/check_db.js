const { db } = require("./config/firebase");

async function check() {
  try {
    const uid = "bHw4eOwiY3RHhqQVmKdPeT1irjp1";
    const userDoc = await db.collection("users").doc(uid).get();
    console.log("In users:", userDoc.exists);
    const recruiterDoc = await db.collection("recruiters").doc(uid).get();
    console.log("In recruiters:", recruiterDoc.exists);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
