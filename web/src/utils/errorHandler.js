/*
  EXTRACT ERROR MESSAGE
*/
export function getErrorMessage(
  error
) {
  /*
    BACKEND ERROR
  */
  if (
    error?.response?.data
      ?.error
  ) {
    return error.response
      .data.error;
  }

  /*
    NORMAL ERROR
  */
  if (error?.message) {
    return error.message;
  }

  /*
    FALLBACK
  */
  return "Something went wrong";
}

/*
  HANDLE ERROR
*/
export function handleError(
  error
) {
  console.log(error);

  return getErrorMessage(
    error
  );
}