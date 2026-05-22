import {
  doc,
  setDoc,
} from "firebase/firestore";

import {
  db,
} from "./firebase";

export const updateUserProfile =
  async (uid, profileData) => {
    try {
      const userRef = doc(
        db,
        "users",
        uid
      );

      await setDoc(userRef, {
        ...profileData,

        updatedAt: new Date(),
      }, { merge: true });

      return true;
    } catch (error) {
      console.log(error);

      throw error;
    }
  };    