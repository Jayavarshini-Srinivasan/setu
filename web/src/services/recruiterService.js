import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import {
  db,
} from "../firebase";

/*
  GET RECRUITER PROFILE
*/
export async function getRecruiterProfile(
  uid
) {
  try {
    const userRef =
      doc(
        db,
        "users",
        uid
      );

    const userSnap =
      await getDoc(
        userRef
      );

    if (
      !userSnap.exists()
    ) {
      throw new Error(
        "Recruiter profile not found"
      );
    }

    return userSnap.data();
  } catch (error) {
    console.log(error);

    throw error;
  }
}

/*
  UPDATE RECRUITER PROFILE
*/
export async function updateRecruiterProfile(
  uid,
  data
) {
  try {
    const userRef =
      doc(
        db,
        "users",
        uid
      );

    await updateDoc(
      userRef,
      {
        companyName:
          data.companyName,

        contactName:
          data.contactName,
      }
    );
  } catch (error) {
    console.log(error);

    throw error;
  }
}