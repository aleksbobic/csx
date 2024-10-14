import { useEffect, useState } from "react";

import { useCallback } from "react";

export function useKeyPress(customKey, customMetaKey) {
  const [keyPressed, setKeyPressed] = useState(false);

  const downHandler = useCallback(
    ({ key, shiftKey, ctrlKey, altKey }) => {
      if (!customMetaKey && key.toLowerCase() === customKey.toLowerCase()) {
        setKeyPressed(true);
      } else if (
        customMetaKey !== "" &&
        key.toLowerCase() === customKey.toLowerCase()
      ) {
        switch (customMetaKey) {
          case "shift":
            if (shiftKey) {
              setKeyPressed(true);
            }
            break;
          case "ctrl":
            if (ctrlKey) {
              setKeyPressed(true);
            }
            break;
          default:
            if (altKey) {
              setKeyPressed(true);
            }
            break;
        }
      }
    },
    [customKey, customMetaKey]
  );

  const upHandler = useCallback(
    ({ key, shiftKey, ctrlKey, altKey }) => {
      if (key.toLowerCase() === customKey.toLowerCase()) {
        setKeyPressed(false);
      } else if (customMetaKey !== "") {
        switch (customMetaKey) {
          case "shift":
            if (shiftKey) {
              setKeyPressed(false);
            }
            break;
          case "ctrl":
            if (ctrlKey) {
              setKeyPressed(false);
            }
            break;
          default:
            if (altKey) {
              setKeyPressed(false);
            }
            break;
        }
      }
    },
    [customKey, customMetaKey]
  );

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [downHandler, upHandler]);
  return keyPressed;
}
