import React, { useEffect, useMemo, useRef, useState } from "react";
import PageHero from "../components/PageHero";
import heroImage from "../assets/hero.jpeg";
import { getApiUrl, postJson, readApiError } from "../utils/api";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const PAYPAL_DONATION_LINK = process.env.REACT_APP_PAYPAL_DONATION_LINK || "https://www.paypal.com/donate";
const DONATION_INITIATE_ENDPOINT = "/api/donations/initiate-payment/";


const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  amount: "",
  currency: "KES"
};

const defaultPaymentConfig = {
  mode: "mock",
  methods: {
    mpesa: { enabled: true, mode: "mock", currency: "KES" },
    paypal: { enabled: true, mode: "mock", donation_link: PAYPAL_DONATION_LINK, currency: "USD" },
    stripe: { enabled: true, mode: "mock", publishable_key: "", currency: "KES" }
  }
};

function DonationFields({ form, onChange, includePhone = true, requirePhone = false }) {
  return (
    <div className="row gy-3">
      <div className="col-md-6">
        <label className="form-label">First name</label>
        <input
          className="form-control"
          name="firstName"
          value={form.firstName}
          onChange={onChange}
          placeholder="Jane"
          required
        />
      </div>

      <div className="col-md-6">
        <label className="form-label">Last name</label>
        <input
          className="form-control"
          name="lastName"
          value={form.lastName}
          onChange={onChange}
          placeholder="Doe"
          required
        />
      </div>

      <div className="col-12">
        <label className="form-label">Email</label>
        <input
          className="form-control"
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="jane@email.com"
        />
      </div>

      {includePhone && (
        <div className="col-md-6">
          <label className="form-label">Phone number</label>
          <input
            className="form-control"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="2547XXXXXXXX"
            required={requirePhone}
          />
        </div>
      )}

      <div className={includePhone ? "col-md-6" : "col-12"}>
        <label className="form-label">Amount ({form.currency || "KES"})</label>
        <input
          className="form-control"
          type="number"
          min="1"
          name="amount"
          value={form.amount}
          onChange={onChange}
          placeholder="1000"
          required
        />
      </div>
    </div>
  );
}

function StripeCheckoutForm({ form, onChange, stripeSubmitting, stripeMessage, onSubmit, isLiveMode }) {
  const stripe = useStripe();
  const elements = useElements();

  return (
    <form onSubmit={(event) => onSubmit(stripe, elements, event)}>
      <DonationFields form={form} onChange={onChange} includePhone requirePhone={false} />

      {isLiveMode ? (
        <div className="mb-3 mt-3">
          <label className="form-label">Card details</label>
          <div className="stripe-card-field">
            <CardElement
              options={{
                style: {
                  base: {
                    color: "#1b1f24",
                    fontSize: "16px",
                    fontFamily: "inherit",
                    "::placeholder": { color: "#8b97a6" }
                  },
                  invalid: { color: "#c93a3a" }
                }
              }}
            />
          </div>
        </div>
      ) : (
        <small className="text-muted d-block mt-3">
          Card payments are running in mock mode until live Stripe keys are added.
        </small>
      )}

      <button className="btn btn-outline-light w-100 mt-3" type="submit" disabled={stripeSubmitting || (isLiveMode && !stripe)}>
        {stripeSubmitting ? "Processing..." : "Donate with Card (Stripe)"}
      </button>

      {stripeMessage && <small className="text-muted d-block mt-2">{stripeMessage}</small>}

      {!form.amount && (
        <small className="text-muted d-block mt-2">Enter an amount before paying by card.</small>
      )}
    </form>
  );
}

function Donate() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [paypalSubmitting, setPaypalSubmitting] = useState(false);
  const [paypalMessage, setPaypalMessage] = useState("");
  const [activeMethod, setActiveMethod] = useState("mpesa");
  const [paymentConfig, setPaymentConfig] = useState(defaultPaymentConfig);
  const [stripeKey, setStripeKey] = useState(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "");
  const [stripeSubmitting, setStripeSubmitting] = useState(false);
  const [stripeMessage, setStripeMessage] = useState("");
  const [toast, setToast] = useState({ type: "", message: "", visible: false });
  const toastTimerRef = useRef(null);
  const eventSourceRef = useRef(null);
  const pollTimerRef = useRef(null);
  const stripePromise = useMemo(() => (stripeKey ? loadStripe(stripeKey) : null), [stripeKey]);
  const selectedCurrency =
    activeMethod === "paypal"
      ? paymentConfig?.methods?.paypal?.currency || "USD"
      : activeMethod === "stripe"
      ? String(paymentConfig?.methods?.stripe?.currency || "KES").toUpperCase()
      : paymentConfig?.methods?.mpesa?.currency || "KES";

  useEffect(() => {
    if (status.type !== "success" && status.type !== "error" && status.type !== "pending") return;

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    const message =
      status.type === "success"
        ? status.message ||
          "Payment successful. Thank you for donating and supporting our programs."
        : status.type === "pending"
        ? status.message ||
          "Payment initiated. Please complete any required steps to finish your donation."
        : status.message?.trim()
        ? `${status.message} Please try again.`
        : "We could not complete the payment. Please try again.";

    setToast({ type: status.type, message, visible: true });

    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 5000);
  }, [status.type, status.message]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    fetch(getApiUrl("/api/donations/payment-section/"))
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!isActive || !data) return;

        const normalizedConfig = {
          mode: data?.mode || "mock",
          methods: {
            mpesa: data?.methods?.mpesa || defaultPaymentConfig.methods.mpesa,
            paypal: data?.methods?.paypal || defaultPaymentConfig.methods.paypal,
            stripe: data?.methods?.stripe || defaultPaymentConfig.methods.stripe
          }
        };

        setPaymentConfig(normalizedConfig);

        const nextKey =
          data?.methods?.stripe?.publishable_key ||
          data?.stripe?.publishable_key ||
          "";

        if (nextKey) {
          setStripeKey(nextKey);
        }
      })
      .catch(() => {});

    return () => {
      isActive = false;
    };
  }, []);

  const normalizePaymentStatus = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    if (["completed", "complete", "paid", "success", "successful", "succeeded"].includes(normalized)) {
      return "completed";
    }
    if (["failed", "fail", "error", "cancelled", "canceled", "declined"].includes(normalized)) {
      return "failed";
    }
    return "pending";
  };

  const setPaymentStatus = (statusValue, { detail, failedReason } = {}) => {
    const normalized = normalizePaymentStatus(statusValue);

    if (normalized === "completed") {
      setStatus({
        type: "success",
        message: detail || "Payment completed successfully."
      });
      return normalized;
    }

    if (normalized === "failed") {
      setStatus({
        type: "error",
        message: failedReason || detail || "Payment failed. Please try again."
      });
      return normalized;
    }

    setStatus({
      type: "pending",
      message: detail || "Payment initiated. Please complete any required steps to finish your donation."
    });
    return normalized;
  };

  const stopRealtimeTracking = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const startPolling = (statusEndpoint) => {
    if (!statusEndpoint) return;

    stopRealtimeTracking();

    let attempts = 0;
    const maxAttempts = 30;

    pollTimerRef.current = setInterval(async () => {
      attempts += 1;
      try {
        const response = await fetch(getApiUrl(statusEndpoint));
        if (response.ok) {
          const payload = await response.json();
          const normalized = setPaymentStatus(payload?.payment_status || payload?.status, {
            failedReason: payload?.failed_reason
          });
          if (normalized === "completed" || normalized === "failed") {
            stopRealtimeTracking();
            return;
          }
        }
      } catch {
        // Ignore transient polling errors.
      }

      if (attempts >= maxAttempts) {
        stopRealtimeTracking();
      }
    }, 4000);
  };

  const startStream = (streamEndpoint, statusEndpoint) => {
    if (!streamEndpoint || typeof window === "undefined" || !("EventSource" in window)) {
      startPolling(statusEndpoint);
      return;
    }

    stopRealtimeTracking();

    const streamUrl = /^https?:\/\//i.test(streamEndpoint) ? streamEndpoint : getApiUrl(streamEndpoint);
    const source = new EventSource(streamUrl);
    eventSourceRef.current = source;

    source.addEventListener("status", (event) => {
      try {
        const payload = JSON.parse(event.data);
        const normalized = setPaymentStatus(payload?.payment_status || payload?.status, {
          failedReason: payload?.failed_reason
        });
        if (normalized === "completed" || normalized === "failed") {
          stopRealtimeTracking();
        }
      } catch {
        // Ignore malformed SSE payloads.
      }
    });

    source.addEventListener("error", () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (statusEndpoint) {
        startPolling(statusEndpoint);
      }
    });
  };

  const handleStripeCheckout = async (stripe, elements, event) => {
    event.preventDefault();
    setStripeMessage("");

    const isMockStripeMode = paymentConfig?.methods?.stripe?.mode !== "live";

    if (!isMockStripeMode && (!stripe || !elements)) {
      setStripeMessage("Stripe is still loading. Please try again.");
      return;
    }

    if (!form.firstName || !form.lastName || Number(form.amount || 0) <= 0) {
      setStripeMessage("Please complete all required card fields.");
      return;
    }

    setStripeSubmitting(true);
    setStatus({ type: "idle", message: "" });
    stopRealtimeTracking();

    try {
      const payload = {
        ...form,
        amount: Number(form.amount || 0),
        currency: selectedCurrency,
        paymentMethod: "card",
        payment_method: "card",
        paymentToken: "stripe-card"
      };

      const response = await postJson(DONATION_INITIATE_ENDPOINT, payload);
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const data = await response.json();
      const stripePayload = data?.stripe || {};

      setPaymentStatus(data?.payment_status || data?.donation?.status, {
        detail: data?.detail,
        failedReason: data?.donation?.failed_reason
      });

      if (data?.stream_endpoint) {
        startStream(data.stream_endpoint, data?.status_endpoint);
      } else if (data?.status_endpoint) {
        startPolling(data.status_endpoint);
      }

      if (stripePayload?.mock || isMockStripeMode) {
        setStripeMessage("Card payment started in mock mode. Status will update automatically.");
        return;
      }

      if (!stripePayload?.client_secret) {
        throw new Error("Stripe setup incomplete. Please try again.");
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card details are missing. Please re-enter your card.");
      }

      const billingName = `${form.firstName} ${form.lastName}`.trim();
      const result = await stripe.confirmCardPayment(stripePayload.client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: billingName || undefined,
            email: form.email || undefined,
            phone: form.phone || undefined
          }
        }
      });

      if (result.error) {
        throw new Error(result.error.message || "Stripe payment failed.");
      }

      const intentStatus = result.paymentIntent?.status || "pending";
      if (data?.donation?.id && result.paymentIntent?.id) {
        try {
          await postJson(`/api/donations/${data.donation.id}/stripe/sync/`, {
            payment_intent_id: result.paymentIntent.id
          });
        } catch {
          // Webhooks or polling can still update the final status if sync fails.
        }
      }
      if (intentStatus === "succeeded") {
        setPaymentStatus("completed", { detail: "Payment completed successfully." });
      } else if (intentStatus === "processing") {
        setPaymentStatus("pending", { detail: "Payment processing. We'll update shortly." });
      } else if (intentStatus === "requires_action") {
        setPaymentStatus("pending", { detail: "Additional authentication required." });
      } else if (intentStatus === "canceled") {
        setPaymentStatus("failed", { detail: "Payment canceled." });
      } else {
        setPaymentStatus(intentStatus, { detail: `Payment status: ${intentStatus}.` });
      }
    } catch (error) {
      const message = error.message || "Unable to start Stripe payment.";
      setStripeMessage(message);
      setStatus({ type: "error", message });
    } finally {
      setStripeSubmitting(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.firstName || !form.lastName || !form.phone || Number(form.amount || 0) <= 0) {
      setStatus({ type: "error", message: "Please complete all required M-Pesa fields." });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "idle", message: "" });
    stopRealtimeTracking();

    try {
      const payload = {
        ...form,
        amount: Number(form.amount || 0),
        currency: paymentConfig?.methods?.mpesa?.currency || "KES",
        paymentMethod: "mpesa",
        payment_method: "mpesa",
        paymentToken: form.phone,
        phone: form.phone
      };

      const response = await postJson(DONATION_INITIATE_ENDPOINT, payload);

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const data = await response.json();
      const mpesaResult = data?.mpesa;
      if (mpesaResult?.requested === false) {
        setStatus({
          type: "error",
          message: mpesaResult?.detail || "Unable to initiate M-Pesa payment."
        });
        return;
      }

      setPaymentStatus(data?.payment_status || data?.donation?.status, {
        detail: mpesaResult?.detail || data?.detail,
        failedReason: data?.donation?.failed_reason
      });

      if (data?.stream_endpoint) {
        startStream(data.stream_endpoint, data?.status_endpoint);
      } else if (data?.status_endpoint) {
        startPolling(data.status_endpoint);
      }

      setForm(initialForm);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to submit M-Pesa donation."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaypalCheckout = async () => {
    const amount = Number(form.amount || 0);
    if (amount <= 0) {
      setPaypalMessage("Enter a valid amount before starting PayPal checkout.");
      return;
    }

    setPaypalSubmitting(true);
    setPaypalMessage("");

    try {
      const payload = {
        ...form,
        amount,
        currency: paymentConfig?.methods?.paypal?.currency || "USD",
        paymentMethod: "paypal",
        payment_method: "paypal",
        paymentToken: "paypal-web"
      };

      const response = await postJson(DONATION_INITIATE_ENDPOINT, payload);
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const data = await response.json();
      setPaymentStatus(data?.payment_status || data?.donation?.status, {
        detail: data?.detail,
        failedReason: data?.donation?.failed_reason
      });

      if (data?.stream_endpoint) {
        startStream(data.stream_endpoint, data?.status_endpoint);
      } else if (data?.status_endpoint) {
        startPolling(data.status_endpoint);
      }

      if (data?.approval_url) {
        window.open(data.approval_url, "_blank", "noopener,noreferrer");
        setPaypalMessage(
          paymentConfig?.methods?.paypal?.mode === "mock"
            ? "Mock PayPal checkout opened in a new tab. Donation status will update automatically."
            : "PayPal checkout opened in a new tab."
        );
      } else {
        window.open(PAYPAL_DONATION_LINK, "_blank", "noopener,noreferrer");
        setPaypalMessage("PayPal started. If no tab opened, use the fallback donation link.");
      }
    } catch (error) {
      setPaypalMessage(error.message || "Could not initiate PayPal checkout.");
    } finally {
      setPaypalSubmitting(false);
    }
  };

  return (
    <div className="app">
      {toast.visible && (
        <div className="toast-stack" role="status" aria-live="polite">
          <div className={`toast-card ${toast.type}`}>
            <div className="toast-body">
              <strong>
                {toast.type === "success"
                  ? "Thank you!"
                  : toast.type === "pending"
                  ? "Action needed"
                  : "Payment failed"}
              </strong>
              <span>{toast.message}</span>
            </div>
            <button
              className="toast-close"
              type="button"
              aria-label="Close"
              onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
            >
              x
            </button>
          </div>
        </div>
      )}
      <PageHero
        eyebrow="Donate"
        title="Fuel education, protection, and opportunity."
        copy="Every gift supports community-led programs and direct family support."
        backgroundImage={heroImage}
        backgroundAlt="Donate hero"
      >
        <h5 className="mb-3">Giving options</h5>
        <ul className="list-unstyled text-muted mb-3">
          <li className="mb-2">KES 500 supports one learning kit.</li>
          <li className="mb-2">KES 1,200 funds a wellness visit.</li>
          <li className="mb-2">KES 3,000 powers a month of mentorship.</li>
        </ul>
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="row gy-4 justify-content-center">
            <div className="col-lg-8">
              <div className="support-card h-100">
                <h4 className="mb-3">Choose a payment method</h4>
                <p className="text-muted mb-4">Select a method to enter the required details.</p>
                <small className="text-muted d-block mb-3">
                  Backend payment mode: {paymentConfig.mode === "live" ? "Live" : "Mock"}.
                </small>

                <div className="payment-method-buttons">
                  <button
                    type="button"
                    className={`payment-method-button paypal ${activeMethod === "paypal" ? "active" : ""}`}
                    onClick={() => setActiveMethod("paypal")}
                  >
                    PayPal
                  </button>
                  <button
                    type="button"
                    className={`payment-method-button stripe ${activeMethod === "stripe" ? "active" : ""}`}
                    onClick={() => setActiveMethod("stripe")}
                  >
                    Stripe
                  </button>
                  <button
                    type="button"
                    className={`payment-method-button mpesa ${activeMethod === "mpesa" ? "active" : ""}`}
                    onClick={() => setActiveMethod("mpesa")}
                  >
                    M-Pesa
                  </button>
                </div>

                <div className="payment-method-panel">
                  {activeMethod === "paypal" && (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        handlePaypalCheckout();
                      }}
                    >
                      <DonationFields
                        form={{ ...form, currency: paymentConfig?.methods?.paypal?.currency || "USD" }}
                        onChange={handleChange}
                        includePhone={false}
                        requirePhone={false}
                      />
                      <small className="text-muted d-block mt-2">
                        PayPal donations are processed in {paymentConfig?.methods?.paypal?.currency || "USD"}.
                      </small>

                      <button
                        className="btn btn-outline-light w-100 mt-3"
                        type="submit"
                        disabled={paypalSubmitting}
                      >
                        {paypalSubmitting ? "Starting PayPal..." : "Continue with PayPal"}
                      </button>

                      {paypalMessage && <small className="text-muted d-block mt-2">{paypalMessage}</small>}
                    </form>
                  )}

                  {activeMethod === "stripe" && (stripePromise || paymentConfig?.methods?.stripe?.mode !== "live") ? (
                    <Elements stripe={stripePromise}>
                      <StripeCheckoutForm
                        form={{ ...form, currency: selectedCurrency }}
                        onChange={handleChange}
                        stripeSubmitting={stripeSubmitting}
                        stripeMessage={stripeMessage}
                        onSubmit={handleStripeCheckout}
                        isLiveMode={paymentConfig?.methods?.stripe?.mode === "live"}
                      />
                    </Elements>
                  ) : activeMethod === "stripe" ? (
                    <div>
                      <p className="text-muted mb-3">
                        Stripe is unavailable until a publishable key is configured on the backend.
                      </p>
                    </div>
                  ) : null}

                  {activeMethod === "mpesa" && (
                    <form onSubmit={handleSubmit}>
                      <DonationFields
                        form={{ ...form, currency: paymentConfig?.methods?.mpesa?.currency || "KES" }}
                        onChange={handleChange}
                        includePhone
                        requirePhone
                      />

                      <button className="btn btn-accent w-100 mt-3" type="submit" disabled={submitting}>
                        {submitting ? "Submitting..." : "Pay with M-Pesa"}
                      </button>

                      {status.type === "success" && (
                        <small className="text-success d-block mt-2">{status.message}</small>
                      )}
                      {status.type === "error" && (
                        <small className="text-danger d-block mt-2">{status.message}</small>
                      )}
                      {status.type === "pending" && (
                        <small className="text-warning d-block mt-2">{status.message}</small>
                      )}
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Donate;
