import { useEffect } from "react";

interface CustomConsole {
  _log: (...keys: unknown[]) => void;
  _warn: (...keys: unknown[]) => void;
  _error: (...keys: unknown[]) => void;
}

export const useAppConsole = (): void => {
  useEffect(() => {
    // eslint-disable-next-line eslint-comments/disable-enable-pair
    /* eslint-disable no-console */
    const customConsole = {} as CustomConsole;

    const handleLog = (type: "log" | "warn" | "error") => {
      return (...message: unknown[]): void => {
        try {
          window.parent.postMessage(
            {
              type,
              message: message.map((msg) => JSON.stringify(msg)).join(", "),
            },
            "*",
          );
        } catch (error) {
          console.error("Error posting message to parent:", error);
        }
        customConsole[`_${type}`](...message);
      };
    };

    // Save the original console methods
    customConsole._log = console.log;
    customConsole._warn = console.warn;
    customConsole._error = console.error;

    // Override the console methods
    console.log = handleLog("log");
    console.warn = handleLog("warn");
    console.error = handleLog("error");

    return (): void => {
      console.log = customConsole._log;
      console.warn = customConsole._warn;
      console.error = customConsole._error;
    };
  }, []);
};
