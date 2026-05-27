import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { getJobId } from "../utils/jobId";
import { useAuth } from "./AuthContext";

const AppliedJobsContext = createContext(null);

function storageKey(uid) {
  return `@setu_applied_job_ids_${uid || "guest"}`;
}

export function AppliedJobsProvider({ children }) {
  const { user } = useAuth();
  const [appliedJobIds, setAppliedJobIds] = useState(() => new Set());
  const [hydrated, setHydrated] = useState(false);
  const [cacheUid, setCacheUid] = useState(null);

  /* Start clean for each uid; Firestore is the source of truth for applied jobs. */
  useEffect(() => {
    setHydrated(false);
    setCacheUid(null);
    setAppliedJobIds(new Set());

    if (!user?.uid) {
      setHydrated(true);
      return undefined;
    }

    setCacheUid(user.uid);
    setHydrated(true);

    return () => {
      setCacheUid(null);
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setAppliedJobIds(new Set());
      return undefined;
    }

    const q = query(
      collection(db, "applications"),
      where("workerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setAppliedJobIds(() => {
          const next = new Set();
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const jobId = data.jobId ?? data.job?.id;
            if (jobId != null) next.add(String(jobId));
          });
          return next;
        });
      },
      (err) => {
        console.log("APPLIED JOBS LISTENER ERROR:", err?.code, err?.message);
      }
    );

    return unsubscribe;
  }, [user?.uid]);

  /* Persist whenever the set grows */
  useEffect(() => {
    if (!hydrated || !user?.uid || cacheUid !== user.uid) return;
    const ids = [...appliedJobIds];
    AsyncStorage.setItem(storageKey(user.uid), JSON.stringify(ids)).catch((e) => {
      console.log("APPLIED JOBS CACHE WRITE:", e);
    });
  }, [appliedJobIds, cacheUid, hydrated, user?.uid]);

  const markApplied = useCallback((jobId) => {
    if (jobId == null || jobId === "") return;
    setAppliedJobIds((prev) => {
      const next = new Set(prev);
      next.add(String(jobId));
      return next;
    });
  }, []);

  const hasCurrentUserData =
    Boolean(user?.uid && cacheUid === user.uid && hydrated);

  const isApplied = useCallback(
    (job) => {
      if (!hasCurrentUserData) return false;
      const id = getJobId(job);
      if (!id) return false;
      return appliedJobIds.has(id);
    },
    [appliedJobIds, hasCurrentUserData]
  );

  const value = useMemo(
    () => ({
      appliedJobIds: hasCurrentUserData ? appliedJobIds : new Set(),
      appliedCount: hasCurrentUserData ? appliedJobIds.size : 0,
      markApplied,
      isApplied,
    }),
    [appliedJobIds, hasCurrentUserData, markApplied, isApplied]
  );

  return (
    <AppliedJobsContext.Provider value={value}>
      {children}
    </AppliedJobsContext.Provider>
  );
}

export function useAppliedJobs() {
  const ctx = useContext(AppliedJobsContext);
  if (!ctx) {
    throw new Error("useAppliedJobs must be used within AppliedJobsProvider");
  }
  return ctx;
}
