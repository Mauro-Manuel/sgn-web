import { useEffect, useRef, useState } from "react";

const WARNING_AFTER_MS = 13 * 60 * 1000;
const SESSION_LIMIT_MS = 15 * 60 * 1000;

//const WARNING_AFTER_MS = 20 * 1000;
//const SESSION_LIMIT_MS = 30 * 1000;

interface SessionInactivityOptions {
  enabled: boolean;
  onExpire: () => void;
}

export function useSessionInactivity({
  enabled,
  onExpire,
}: SessionInactivityOptions) {
  const [showWarning, setShowWarning] = useState(false);
  const [renewalCount, setRenewalCount] = useState(0);

  const onExpireRef = useRef(onExpire);
  const lastActivityRef = useRef(Date.now());
  const expiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!enabled) {
      setShowWarning(false);
      return;
    }

    let warningTimer: ReturnType<typeof setTimeout>;
    let expiryTimer: ReturnType<typeof setTimeout>;

    expiredRef.current = false;
    lastActivityRef.current = Date.now();

    function checkInactivity() {
      if (expiredRef.current) {
        return;
      }

      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= SESSION_LIMIT_MS) {
        expiredRef.current = true;
        setShowWarning(false);
        onExpireRef.current();
        return;
      }

      if (elapsed >= WARNING_AFTER_MS) {
        setShowWarning(true);
      }
    }

    function scheduleTimers() {
      clearTimeout(warningTimer);
      clearTimeout(expiryTimer);

      const elapsed = Date.now() - lastActivityRef.current;

      warningTimer = setTimeout(
        () => {
          checkInactivity();
        },
        Math.max(0, WARNING_AFTER_MS - elapsed),
      );

      expiryTimer = setTimeout(
        () => {
          checkInactivity();
        },
        Math.max(0, SESSION_LIMIT_MS - elapsed),
      );
    }

    function registerActivity() {
      checkInactivity();

      // Quando o aviso está aberto, apenas o botão
      // "Continuar sessão" deve renovar a actividade.
      if (
        expiredRef.current ||
        Date.now() - lastActivityRef.current >= WARNING_AFTER_MS
      ) {
        return;
      }

      lastActivityRef.current = Date.now();
      scheduleTimers();
    }

    const activityEvents = ["pointerdown", "keydown", "scroll", "touchstart"];

    activityEvents.forEach((event) => {
      window.addEventListener(event, registerActivity, {
        passive: true,
      });
    });

    document.addEventListener("visibilitychange", checkInactivity);

    window.addEventListener("focus", checkInactivity);

    scheduleTimers();

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(expiryTimer);

      activityEvents.forEach((event) => {
        window.removeEventListener(event, registerActivity);
      });

      document.removeEventListener("visibilitychange", checkInactivity);

      window.removeEventListener("focus", checkInactivity);
    };
  }, [enabled, renewalCount]);

  function renewActivity() {
    if (expiredRef.current) {
      return;
    }

    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setRenewalCount((count) => count + 1);
  }

  return {
    showWarning,
    renewActivity,
  };
}
