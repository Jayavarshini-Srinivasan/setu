import {
  useState,
  useEffect,
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

  /*
    EXECUTE
  */
  const execute =
    async () => {
      try {
        setLoading(true);

        setError(null);

        const result =
          await asyncFunction();

        setData(result);
      } catch (err) {
        console.log(err);

        setError(err);
      } finally {
        setLoading(false);
      }
    };

  /*
    AUTO RUN
  */
  useEffect(() => {
    execute();
  }, dependencies);

  return {
    data,

    loading,

    error,

    refetch:
      execute,
  };
}