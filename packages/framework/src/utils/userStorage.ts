export const getUserFromStorage = <T = unknown>(): T => {
  try {
    const raw = sessionStorage.getItem("ensemble.user");
    return (raw ? JSON.parse(raw) : {}) as T;
  } catch {
    return {} as T;
  }
};

export const setUserInStorage = (user: unknown): void => {
  try {
    sessionStorage.setItem("ensemble.user", JSON.stringify(user));
  } catch (err) {
    // no-op
  }
};
