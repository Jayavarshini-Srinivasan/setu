import {
  View,
  FlatList,
  StyleSheet,
} from "react-native";

import API from "../services/api";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../services/firebase";

import LoadingSpinner from "../components/LoadingSpinner";

import EmptyState from "../components/EmptyState";

import ErrorState from "../components/ErrorState";

import JobCard from "../components/JobCard";

import {
  getErrorMessage,
} from "../utils/errorHandler";

import useAsync from "../hooks/useAsync";

export default function ResultsScreen() {
  /*
    LOAD MATCHES
  */
  const loadMatches =
    async () => {
      const currentUser =
        auth.currentUser;

      /*
        SAFETY
      */
      if (!currentUser) {
        return [];
      }

      /*
        GET USER PROFILE
      */
      const userRef = doc(
        db,
        "users",
        currentUser.uid
      );

      const userSnap =
        await getDoc(userRef);

      if (
        !userSnap.exists()
      ) {
        throw new Error(
          "User profile missing"
        );
      }

      const userData =
        userSnap.data();

      const profile =
        userData.profile;

      /*
        MATCH PAYLOAD
      */
      const payload = {
        role:
            profile.canonicalRole ||
            profile.jobRole ||
            profile.role ||
            "",

        skills:
          Array.isArray(
          profile.skills
        )
          ? profile.skills
          : [],

        location:
          profile.location || "",

        experience:
          profile.experience || 0,
      };

      /*
        CALL MATCH API
      */
      try {

        const response =
          await API.post(
            "/match",
            payload
          );

        console.log(
          "MATCH RESPONSE:"
        );

        console.log(
          JSON.stringify(
            response.data,
            null,
            2
          )
        );

        return response.data;

      } catch (error) {

        console.log(
          "LOAD MATCH ERROR"
        );

        console.log(error);

        console.log(
          error.response?.data
        );

        console.log(
          error.message
        );

        throw error;
      }
        console.log(
          JSON.stringify(
            response.data,
            null,
            2
          )
        );

      return response.data;
    };

  /*
    ASYNC STATE
  */
  const {
    data,
    loading,
    error,
  } = useAsync(
    loadMatches,
    []
  );

  const jobs =
    data || [];

  /*
    APPLY TO JOB
  */
  const handleApply =
    async (job) => {
      try {
        /*
          GET TOKEN
        */
        const token =
          await auth.currentUser.getIdToken();

        /*
          WORKER ID
        */
        const workerId =
          auth.currentUser.uid;

        /*
          APPLY
        */
        await API.post(
          "/apply",

          {
            workerId,

            jobId:
              job.jobId,

            matchScore:
              job.matchScore,
          },

          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        alert(
          "Application submitted successfully"
        );
      } catch (error) {

  console.log(
    "MATCH ERROR:"
  );

  console.log(error);

  console.log(
    error.response?.data
  );

  console.log(
    error.message
  );

  alert(
    JSON.stringify(
      error.response?.data ||
      error.message
    )
  );
}
    };

  /*
    LOADING
  */
  if (loading) {
    return (
      <LoadingSpinner
        text="Loading jobs..."
      />
    );
  }

  /*
    ERROR
  */
  if (error) {
    return (
      <ErrorState
        message={getErrorMessage(
          error
        )}
      />
    );
  }

  /*
    EMPTY
  */
  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No Matches Found"
        description="No matching jobs are available right now."
      />
    );
  }

  /*
    CARD
  */
  const renderItem = ({
    item,
  }) => (
    <JobCard
      job={item}
      onApply={
        handleApply
      }
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        keyExtractor={(
          item,
          index
        ) =>
          `${item.jobId}-${index}`
        }
        renderItem={renderItem}
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      padding: 16,

      backgroundColor:
        "#f4f6f8",
    },
  });