import {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
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
                FETCH USER PROFILE FROM BACKEND
                This bypasses client-side Firestore security rules.
              */
              let userData;
              try {
                // We use fetch directly with the token to avoid interceptor timing issues
                const token = await firebaseUser.getIdToken();
                const response = await fetch("http://localhost:5000/auth/profile", {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                });
                
                if (!response.ok) {
                  console.log("PROFILE FETCH FAILED OR MISSING");
                  setUser(null);
                  setLoading(false);
                  return;
                }
                
                userData = await response.json();
              } catch (err) {
                console.log("Error fetching profile", err);
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
                  "NOT RECRUITER"
                );

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