import {
  useEffect,
  useState,
} from "react";

export default function useAsync(
  asyncFunction,
  dependencies = []
) {
  const [data,
    setData] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

  const [error,
    setError] =
    useState(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        setLoading(true);

        setError(null);

        const result =
          await asyncFunction();

        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return {
    data,
    loading,
    error,
  };
}