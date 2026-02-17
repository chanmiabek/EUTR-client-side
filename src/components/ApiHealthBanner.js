import React, { useCallback, useEffect, useState } from "react";
import { getApiUrl } from "../utils/api";

function ApiHealthBanner() {
  const [state, setState] = useState("checking");
  const [message, setMessage] = useState("Checking backend connection...");

  const checkHealth = useCallback(async () => {
    setState("checking");
    setMessage("Checking backend connection...");

    const start = Date.now();

    try {
      const response = await fetch(getApiUrl("/api/payment-section/"), {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Unexpected status ${response.status}`);
      }

      const latency = Date.now() - start;
      setState("connected");
      setMessage(`Backend connected (${latency}ms)`);
    } catch (error) {
      setState("disconnected");
      setMessage("Backend unavailable. Check Django server on 127.0.0.1:8000.");
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const timer = setInterval(checkHealth, 30000);
    return () => clearInterval(timer);
  }, [checkHealth]);

  return (
    <div className={`api-health api-health-${state}`} role="status" aria-live="polite">
      <div className="api-health-left">
        <span className="api-health-dot" />
        <span className="api-health-text">{message}</span>
      </div>
      {state !== "connected" && (
        <button className="api-health-retry" type="button" onClick={checkHealth}>
          Retry
        </button>
      )}
    </div>
  );
}

export default ApiHealthBanner;
