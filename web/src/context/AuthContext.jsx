import {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase";

export const AuthContext =
  createContext();

export const AuthProvider =
  ({ children }) => {
    const [user,
      setUser] =
      useState(null);

    const [loading,
      setLoading] =
      useState(true);

    useEffect(() => {
      console.log(
        "AUTH CONTEXT STARTED"
      );

      const unsubscribe =
        onAuthStateChanged(
          auth,

          async (
            firebaseUser
          ) => {
            console.log(
              "AUTH STATE:",
              firebaseUser
            );

            try {
              /*
                NOT LOGGED IN
              */
              if (
                !firebaseUser
              ) {
                console.log(
                  "NO USER"
                );

                setUser(null);

                setLoading(
                  false
                );

                return;
              }

              /*
                FETCH USER PROFILE FROM BACKEND WITH RETRY
                This bypasses client-side Firestore security rules and handles signup race conditions.
              */
              const fetchProfileWithRetry = async (token, retries = 3, delay = 600) => {
                try {
                  const response = await fetch("http://localhost:5000/auth/profile", {
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  });
                  
                  if (response.ok) {
                    return await response.json();
                  }
                  
                  if (response.status === 404 && retries > 0) {
                    console.log(`Profile not found, retrying... (${retries} retries left)`);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    return await fetchProfileWithRetry(token, retries - 1, delay);
                  }
                  
                  throw new Error(`Profile fetch failed with status: ${response.status}`);
                } catch (err) {
                  if (retries > 0) {
                    console.log(`Error fetching profile, retrying... (${retries} retries left)`, err);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    return await fetchProfileWithRetry(token, retries - 1, delay);
                  }
                  throw err;
                }
              };

              let userData;
              try {
                const token = await firebaseUser.getIdToken();
                userData = await fetchProfileWithRetry(token);
              } catch (err) {
                console.log("Final error fetching profile, signing out", err);
                await signOut(auth);
                setUser(null);
                setLoading(false);
                return;
              }

              console.log(
                "USER DATA:",
                userData
              );

              /*
                RECRUITER ONLY
              */
              if (
                userData.role !==
                "recruiter"
              ) {
                console.log(
                  "NOT RECRUITER, signing out"
                );
                await signOut(auth);
                setUser(null);
                setLoading(
                  false
                );
                return;
              }

              /*
                SUCCESS
              */
              console.log(
                "RECRUITER AUTH SUCCESS"
              );

              setUser({
                uid:
                  firebaseUser.uid,

                email:
                  firebaseUser.email,

                ...userData,
              });

              setLoading(
                false
              );
            } catch (error) {
              console.log(
                "AUTH ERROR:",
                error
              );
              try {
                await signOut(auth);
              } catch (signoutError) {
                console.log("Error signing out in catch block", signoutError);
              }
              setUser(null);

              setLoading(
                false
              );
            }
          }
        );

      return () =>
        unsubscribe();
    }, []);

    return (
      <AuthContext.Provider
        value={{
          user,
          loading,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  };