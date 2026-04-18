import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import heroImage from "../assets/hero.jpeg";
import { getApiUrl } from "../utils/api";

const STATUS_COPY = {
  completed: {
    title: "Donation complete",
    message: "Your donation was received successfully. Thank you for supporting Educate Us To Rise."
  },
  pending: {
    title: "Payment in progress",
    message: "Your payment was started. We are still waiting for final confirmation from the provider."
  },
  failed: {
    title: "Payment not completed",
    message: "The donation was not completed. You can return to the donate page and try again."
  }
};

const normalizeStatus = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (["completed", "complete", "paid", "success", "successful", "succeeded"].includes(normalized)) {
    return "completed";
  }
  if (["failed", "fail", "error", "cancelled", "canceled", "declined"].includes(normalized)) {
    return "failed";
  }
  return "pending";
};

function DonationStatus() {
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const donationId = query.get("donationId") || "";
  const initialStatus = normalizeStatus(query.get("status"));
  const paymentMethod = query.get("paymentMethod") || "";
  const [status, setStatus] = useState(initialStatus);
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(Boolean(donationId));

  useEffect(() => {
    let active = true;
    let pollTimer = null;

    const loadStatus = async () => {
      if (!donationId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(getApiUrl(`/api/donations/${donationId}/status`));
        if (!response.ok) throw new Error("Unable to load donation status.");
        const payload = await response.json();
        if (!active) return;

        const nextStatus = normalizeStatus(payload?.payment_status || payload?.status);
        setStatus(nextStatus);
        setDetail(payload?.detail || payload?.failed_reason || "");

        if (nextStatus === "pending") {
          pollTimer = window.setTimeout(loadStatus, 4000);
        } else {
          setLoading(false);
        }
      } catch (_error) {
        if (!active) return;
        setLoading(false);
      }
    };

    loadStatus();

    return () => {
      active = false;
      if (pollTimer) window.clearTimeout(pollTimer);
    };
  }, [donationId]);

  const copy = STATUS_COPY[status] || STATUS_COPY.pending;

  return (
    <div className="app">
      <PageHero
        eyebrow="Donation status"
        title={copy.title}
        copy={copy.message}
        backgroundImage={heroImage}
        backgroundAlt="Donation status hero"
      />

      <section className="section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <div className="support-card">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                  <h4 className="mb-0">Payment update</h4>
                  <span className={`badge ${status === "completed" ? "bg-success" : status === "failed" ? "bg-danger" : "bg-warning text-dark"}`}>
                    {status}
                  </span>
                </div>

                {donationId && (
                  <p className="text-muted mb-2">
                    Donation ID: <strong>{donationId}</strong>
                  </p>
                )}
                {paymentMethod && (
                  <p className="text-muted mb-3">
                    Payment method: <strong>{paymentMethod}</strong>
                  </p>
                )}

                <p className="mb-4">
                  {detail || copy.message}
                </p>

                {loading && status === "pending" && (
                  <p className="text-muted mb-4">Checking the latest payment status...</p>
                )}

                <div className="d-flex flex-wrap gap-3">
                  <Link to="/donate" className="btn btn-accent">
                    Back to Donate
                  </Link>
                  <Link to="/" className="btn btn-outline-secondary">
                    Back Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DonationStatus;
