import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useNavigateScreen = (name?: string): (() => void) => {
  const navigate = useNavigate();
  const callback = useCallback(() => {
    if (!name) {
      return;
    }
    navigate(`/${name.toLowerCase()}`);
  }, [name, navigate]);
  return callback;
};
