import { useEffect } from "react";
import { getApiUrl } from "../utils/api";

function RealtimeBridge() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.EventSource === "undefined") return undefined;
    const source = new EventSource(getApiUrl("/api/realtime"));
    let timer;
    source.addEventListener("data-changed", () => {
      if (window.location.pathname.startsWith("/admin")) {
        window.dispatchEvent(new CustomEvent("eutr:data-changed"));
        return;
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => window.location.reload(), 150);
    });
    return () => { window.clearTimeout(timer); source.close(); };
  }, []);
  return null;
}

export default RealtimeBridge;
