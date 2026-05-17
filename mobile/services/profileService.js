import {
  doc,
  updateDoc,
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

      await updateDoc(userRef, {
        ...profileData,

        updatedAt: new Date(),
      });

      return true;
    } catch (error) {
      console.log(error);

      throw error;
    }
  };    