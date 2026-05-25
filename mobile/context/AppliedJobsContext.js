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
import { auth, db } from "../services/firebase";
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

  /* Restore cached ids so UI survives screen unmounts if Firestore is slow */
  useEffect(() => {
    let cancelled = false;
    setHydrated(false);
    setAppliedJobIds(new Set());

    if (!user?.uid) {
      setHydrated(true);
      return undefined;
    }

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey(user.uid));
        if (cancelled || !raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAppliedJobIds((prev) => {
            const next = new Set(prev);
            parsed.forEach((id) => next.add(String(id)));
            return next;
          });
        }
      } catch (e) {
        console.log("APPLIED JOBS CACHE READ:", e);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
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
        setAppliedJobIds((prev) => {
          const next = new Set(prev);
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
    if (!hydrated || !user?.uid) return;
    const ids = [...appliedJobIds];
    AsyncStorage.setItem(storageKey(user.uid), JSON.stringify(ids)).catch((e) => {
      console.log("APPLIED JOBS CACHE WRITE:", e);
    });
  }, [appliedJobIds, hydrated, user?.uid]);

  const markApplied = useCallback((jobId) => {
    if (jobId == null || jobId === "") return;
    setAppliedJobIds((prev) => {
      const next = new Set(prev);
      next.add(String(jobId));
      return next;
    });
  }, []);

  const isApplied = useCallback(
    (job) => {
      const id = getJobId(job);
      if (!id) return false;
      return appliedJobIds.has(id);
    },
    [appliedJobIds]
  );

  const value = useMemo(
    () => ({
      appliedJobIds,
      appliedCount: appliedJobIds.size,
      markApplied,
      isApplied,
    }),
    [appliedJobIds, markApplied, isApplied]
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
