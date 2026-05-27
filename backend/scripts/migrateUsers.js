const admin = require("firebase-admin");
const serviceAccount = require("../config/serviceAccountKey.json");

// Initialize Firebase if not already
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const normalizeCanonicalRole = (role = "") => {
  if (!role) return "other";
  return String(role)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

async function migrateUsers() {
  console.log("Starting user migration script...");
  let count = 0;
  
  try {
    const usersSnapshot = await db.collection("users").get();
    
    // We process in batches of 500 max, but for a simple script, sequential or Promise.all over chunks is fine
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      const profile = data.profile || {};
      
      let needsUpdate = false;
      let updatedProfile = { ...profile };

      // 1. Ensure fullName
      if (!updatedProfile.fullName && updatedProfile.name) {
        updatedProfile.fullName = updatedProfile.name;
        needsUpdate = true;
      } else if (!updatedProfile.fullName && data.displayName) {
        updatedProfile.fullName = data.displayName;
        needsUpdate = true;
      }

      // 2. Ensure canonicalRole
      if (!updatedProfile.canonicalRole) {
        const rawRole = updatedProfile.professionalRole || updatedProfile.role || "";
        updatedProfile.canonicalRole = normalizeCanonicalRole(rawRole);
        needsUpdate = true;
      }
      
      // 3. Normalize skills to lowercase array
      if (updatedProfile.skills && Array.isArray(updatedProfile.skills)) {
        const lowerSkills = updatedProfile.skills.map(s => String(s).toLowerCase().trim());
        // Simple check if anything changed
        if (JSON.stringify(lowerSkills) !== JSON.stringify(updatedProfile.skills)) {
          updatedProfile.skills = lowerSkills;
          needsUpdate = true;
        }
      }
      
      // 4. Normalize experience to number
      if (typeof updatedProfile.experience === 'string') {
        updatedProfile.experience = parseInt(updatedProfile.experience, 10) || 0;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await doc.ref.update({
          profile: updatedProfile,
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Migrated user: ${doc.id}`);
        count++;
      }
    }
    
    console.log(`Migration complete. Successfully updated ${count} users.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateUsers();
