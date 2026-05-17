import {
  useState,
  useEffect,
} from "react";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  auth,
} from "../firebase";

import {
  useNavigate,
} from "react-router-dom";

import useAuth from "../hooks/useAuth";

export default function LoginPage() {
  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  const [email,
    setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  /*
    REDIRECT AFTER LOGIN
  */
  useEffect(() => {
    if (user) {
      navigate(
        "/dashboard"
      );
    }
  }, [user, navigate]);

  /*
    LOGIN HANDLER
  */
  const handleLogin =
    async () => {
      try {
        setLoading(true);

        console.log(
          "LOGIN START"
        );

        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        console.log(
          "LOGIN SUCCESS"
        );
      } catch (error) {
        console.log(
          "LOGIN ERROR:",
          error
        );

        alert(
          "Login failed"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div
      style={{
        padding: 40,
      }}
    >
      <h1>
        Recruiter Login
      </h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(
            e.target.value
          )
        }
        style={{
          display: "block",
          marginBottom: 20,
          padding: 10,
          width: 300,
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(
            e.target.value
          )
        }
        style={{
          display: "block",
          marginBottom: 20,
          padding: 10,
          width: 300,
        }}
      />

      <button
        onClick={
          handleLogin
        }
        disabled={loading}
      >
        {loading
          ? "Logging in..."
          : "Login"}
      </button>
    </div>
  );
}