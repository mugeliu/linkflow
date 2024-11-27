import { useEffect, useCallback } from "react";

type KeyCombo = string;
type Callback = (e: KeyboardEvent) => void;

const parseKeyCombo = (combo: KeyCombo) => {
  const keys = combo.toLowerCase().split("+");
  const modifiers = {
    ctrl: keys.includes("ctrl") || keys.includes("control"),
    alt: keys.includes("alt"),
    shift: keys.includes("shift"),
    meta: keys.includes("meta") || keys.includes("cmd") || keys.includes("mod"),
  };
  const key = keys[keys.length - 1];
  return { modifiers, key };
};

export const useHotkeys = (keyCombo: KeyCombo, callback: Callback) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { modifiers, key } = parseKeyCombo(keyCombo);
      const eventKey = event.key.toLowerCase();

      const modifiersMatch =
        !!event.ctrlKey === modifiers.ctrl &&
        !!event.altKey === modifiers.alt &&
        !!event.shiftKey === modifiers.shift &&
        !!event.metaKey === modifiers.meta;

      if (modifiersMatch && eventKey === key) {
        event.preventDefault();
        callback(event);
      }
    },
    [keyCombo, callback]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};
