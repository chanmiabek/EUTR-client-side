import React, { useEffect, useRef, useState } from "react";
import PageHero from "../components/PageHero";
import heroImage from "../assets/hero.jpeg";
import { getApiUrl, postJson, readApiError } from "../utils/api";

const PAYPAL_DONATION_LINK = process.env.REACT_APP_PAYPAL_DONATION_LINK || "https://www.paypal.com/donate";
const DONATION_INITIATE_ENDPOINT =
  process.env.REACT_APP_DONATION_INITIATE_ENDPOINT || "/api/donations/initiate-payment/";

const PAYMENT_METHODS = {
  paypal: {
    name: "PayPal",
    badge: "Global",
    title: "PayPal or guest checkout",
    description: "Donate in a secure PayPal flow using a PayPal account or, on most PayPal checkouts, a credit or debit card. Card donations still settle into the organization's PayPal account.",
    footer: "You will continue in a new PayPal window to complete your donation. If guest checkout is available for the donor, PayPal may let them pay without signing in, while the donation is still received in the organization's PayPal account.",
    currencyFallback: "USD"
  },
  card: {
    name: "Debit or Credit Card",
    badge: "Secure",
    title: "Official card checkout",
    description: "You do not enter card details on this site. After confirming the donation details, you will be redirected to PayPal's official hosted checkout page to fill in your card details securely there.",
    footer: "Your card number, expiry date, CVV, and billing details are entered only on PayPal's official checkout page.",
    currencyFallback: "USD"
  },
  mpesa: {
    name: "M-Pesa",
    badge: "Kenya",
    title: "Secure mobile money prompt",
    description: "Enter your Safaricom number and complete the donation from the M-Pesa STK push sent to your phone.",
    footer: "Use a valid Safaricom number starting with 2547 for a smoother prompt experience.",
    currencyFallback: "KES"
  }
};

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  amount: "",
  country: "Kenya",
  currency: "KES"
};

const defaultPaymentConfig = {
  methods: {
    mpesa: { enabled: true, mode: "mock", currency: "KES" },
    paypal: { enabled: true, mode: "mock", donation_link: PAYPAL_DONATION_LINK, currency: "USD" }
  }
};

const PAYMENT_CHOICES = [
  { key: "paypal", method: "paypal", funding: "paypal", type: "express", label: "PayPal", helper: "Express checkout option" },
  { key: "card", method: "card", funding: "debit", type: "card", label: "Debit or Credit Card", helper: "Redirect to PayPal hosted card checkout" },
  { key: "mpesa", method: "mpesa", funding: "", type: "mpesa", label: "M-Pesa", helper: "Mobile money checkout" }
];

const PAYPAL_FUNDING_OPTIONS = {
  paypal: {
    label: "PayPal",
    title: "Use a PayPal account",
    description: "Best for donors who want to pay with their PayPal balance or saved wallet.",
    confirmTitle: "PayPal checkout review",
    confirmMethod: "PayPal"
  },
  debit: {
    label: "Debit or Credit Card",
    title: "Pay with card",
    description: "Continue in PayPal guest checkout and donate with a debit or credit card when available.",
    confirmTitle: "Card checkout review",
    confirmMethod: "Debit or credit card via PayPal"
  },
  credit: {
    label: "Credit card",
    title: "Pay with credit card",
    description: "Continue in PayPal guest checkout and donate with a credit card when available.",
    confirmTitle: "Credit card checkout review",
    confirmMethod: "Credit card via PayPal"
  }
};

function HostedCheckoutFields({ form, onChange, currency, method }) {
  return (
    <div className="donation-fields donation-fields-paypal">
      <div className="checkout-section">
        <div className="checkout-section-head">
          <span className="checkout-step">1</span>
          <div>
            <h6>Donation amount</h6>
            <p>
              {method === "card"
                ? "Enter only the donation amount here. Cardholder details will be entered on PayPal's official secure checkout page after redirect."
                : "Enter only the donation amount here. PayPal account details will be entered on PayPal's official secure checkout page after redirect."}
            </p>
          </div>
        </div>
        <div className="row gy-3">
          <div className="col-12">
            <label className="form-label">Donation amount ({currency || "USD"})</label>
            <input
              className="form-control"
              type="number"
              min="1"
              name="amount"
              value={form.amount}
              onChange={onChange}
              placeholder="50"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MpesaDonationFields({ form, onChange, currency }) {
  return (
    <div className="donation-fields donation-fields-mpesa">
      <div className="checkout-section">
        <div className="checkout-section-head">
          <span className="checkout-step">1</span>
          <div>
            <h6>M-Pesa details</h6>
            <p>Enter the number that should receive the STK push and the donor email for follow-up.</p>
          </div>
        </div>
        <div className="row gy-3">
          <div className="col-md-6">
            <label className="form-label">M-Pesa phone number</label>
            <input
              className="form-control"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="2547XXXXXXXX"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Email address</label>
            <input
              className="form-control"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="donor@email.com"
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">Amount ({currency || "KES"})</label>
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
      </div>
    </div>
  );
}

function Donate() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [paypalSubmitting, setPaypalSubmitting] = useState(false);
  const [paypalMessage, setPaypalMessage] = useState("");
  const [activeMethod, setActiveMethod] = useState("");
  const [activeChoice, setActiveChoice] = useState("");
  const [paypalFundingOption, setPaypalFundingOption] = useState("paypal");
  const [paypalConfirmOpen, setPaypalConfirmOpen] = useState(false);
  const [mpesaConfirmOpen, setMpesaConfirmOpen] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState(defaultPaymentConfig);
  const [toast, setToast] = useState({ type: "", message: "", visible: false });
  const toastTimerRef = useRef(null);
  const eventSourceRef = useRef(null);
  const pollTimerRef = useRef(null);

  useEffect(() => {
    if (!activeMethod) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        if (paypalConfirmOpen) {
          setPaypalConfirmOpen(false);
          return;
        }
        if (mpesaConfirmOpen) {
          setMpesaConfirmOpen(false);
          return;
        }
        setActiveChoice("");
        setActiveMethod("");
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [activeMethod, mpesaConfirmOpen, paypalConfirmOpen]);
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
            mpesa: {
              ...defaultPaymentConfig.methods.mpesa,
              ...(data?.methods?.mpesa || {})
            },
            paypal: {
              ...defaultPaymentConfig.methods.paypal,
              ...(data?.methods?.paypal || {})
            }
          }
        };

        setPaymentConfig(normalizedConfig);

      })
      .catch(() => {});

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const donationId = params.get("donationId");
    const queryStatus = params.get("status");

    if (!donationId && !queryStatus) return;

    setStatus({
      type:
        normalizePaymentStatus(queryStatus) === "completed"
          ? "success"
          : normalizePaymentStatus(queryStatus) === "failed"
            ? "error"
            : "pending",
      message:
        normalizePaymentStatus(queryStatus) === "completed"
          ? "Payment successful. Thank you for donating and supporting our programs."
          : normalizePaymentStatus(queryStatus) === "failed"
            ? "The payment was not completed."
            : "Payment initiated. We are waiting for final confirmation."
    });
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openPaymentChoice = (choice) => {
    const nextChoice = activeChoice === choice.key ? "" : choice.key;
    setActiveChoice(nextChoice);
    setActiveMethod(nextChoice ? choice.method : "");
    setPaypalFundingOption(nextChoice ? choice.funding || "paypal" : "paypal");
    setPaypalConfirmOpen(false);
    setMpesaConfirmOpen(false);
    setPaypalMessage("");
    setStatus({ type: "idle", message: "" });
  };

  const closePaymentToast = () => {
    setActiveChoice("");
    setActiveMethod("");
    setPaypalConfirmOpen(false);
    setMpesaConfirmOpen(false);
    setPaypalMessage("");
    setStatus({ type: "idle", message: "" });
  };

  const validateHostedCheckoutForm = () => {
    if (Number(form.amount || 0) <= 0) {
      setPaypalMessage("Please enter a valid donation amount before continuing.");
      return false;
    }
    return true;
  };

  const handleHostedCheckoutReview = (event) => {
    event.preventDefault();
    if (!validateHostedCheckoutForm()) {
      return;
    }
    setPaypalMessage("");
    setStatus({ type: "idle", message: "" });
    setPaypalConfirmOpen(true);
  };

  const validateMpesaForm = () => {
    if (!form.phone || !form.email || Number(form.amount || 0) <= 0) {
      setStatus({ type: "error", message: "Please complete all required M-Pesa fields." });
      return false;
    }
    return true;
  };

  const handleMpesaReview = (event) => {
    event.preventDefault();
    if (!validateMpesaForm()) {
      return;
    }
    setStatus({ type: "idle", message: "" });
    setMpesaConfirmOpen(true);
  };

  const submitMpesaDonation = async () => {
    if (!validateMpesaForm()) {
      return;
    }

    setSubmitting(true);
    setMpesaConfirmOpen(false);
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
    if (!validateHostedCheckoutForm()) {
      return;
    }
    const amount = Number(form.amount || 0);

    setPaypalSubmitting(true);
    setPaypalConfirmOpen(false);
    setPaypalMessage("");
    setStatus({ type: "idle", message: "" });

    try {
      const selectedPaymentMethod = activeChoice === "card" ? "card" : "paypal";
      const payload = {
        amount,
        currency: paymentConfig?.methods?.paypal?.currency || "USD",
        paymentMethod: selectedPaymentMethod,
        payment_method: selectedPaymentMethod,
        paymentToken: `paypal-${paypalFundingOption}`,
        funding_preference: paypalFundingOption
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

      const approvalUrl =
        data?.redirect_url || data?.approval_url || paymentConfig?.methods?.paypal?.donation_link || PAYPAL_DONATION_LINK;

      if (!approvalUrl) {
        throw new Error("The backend did not return a PayPal redirect URL.");
      }

      setPaypalMessage("Redirecting to PayPal...");
      window.location.href = approvalUrl;
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
      <div className={`payment-page-shell ${activeMethod ? "payment-page-shell-hidden" : ""}`} aria-hidden={Boolean(activeMethod)}>
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
              <div className="col-lg-9">
                <div className="support-card payment-experience-card h-100">
                  <div className="payment-header">
                    <div>
                      <h4 className="mb-2">Choose a payment method</h4>
                      <p className="text-muted mb-0">Select the checkout option the donor prefers.</p>
                    </div>
                    <small className="text-muted payment-mode-badge">
                      Backend payment mode: {paymentConfig.mode === "live" ? "Live" : "Mock"}
                    </small>
                  </div>

                  <div className="payment-selector-panel">
                    <div className="payment-method-buttons" role="tablist" aria-label="Payment methods">
                      {PAYMENT_CHOICES.map((choice) => (
                        <button
                          key={choice.key}
                          type="button"
                          className={`payment-method-button ${choice.type} ${activeChoice === choice.key ? "active" : ""}`}
                          onClick={() => openPaymentChoice(choice)}
                          aria-pressed={activeChoice === choice.key}
                        >
                          {choice.type === "express" && (
                            <>
                              <span className="payment-method-label">Express checkout options</span>
                              <span className="payment-card-surface payment-card-surface-paypal">
                                <span className="payment-card-brand paypal-brand" aria-hidden="true">
                                  <span className="paypal-brand-pay">Pay</span>
                                  <span className="paypal-brand-pal">Pal</span>
                                </span>
                              </span>
                            </>
                          )}
                          {choice.type === "card" && (
                            <>
                              <span className="payment-method-divider" aria-hidden="true">
                                <span></span>
                                <em>or pay with card</em>
                                <span></span>
                              </span>
                              <span className="payment-card-surface payment-card-surface-card">
                                <span className="payment-card-brand payment-card-brand-card" aria-hidden="true">
                                  <span className="payment-card-icon"></span>
                                </span>
                                <span className="payment-card-action">{choice.label}</span>
                              </span>
                              <span className="payment-card-brands" aria-hidden="true">
                                <span className="payment-brand-chip">VISA</span>
                                <span className="payment-brand-chip">MC</span>
                                <span className="payment-brand-chip">AMEX</span>
                              </span>
                            </>
                          )}
                          {choice.type === "mpesa" && (
                            <>
                              <span className="payment-method-label payment-method-label-mpesa">Alternative checkout option</span>
                              <span className="payment-card-surface payment-card-surface-mpesa">
                                <span className="payment-card-brand mpesa-brand" aria-hidden="true">
                                  <span className="mpesa-brand-pill">M-PESA</span>
                                </span>
                              </span>
                            </>
                          )}
                          <span className="payment-method-meta">
                            <span className="payment-method-name">{choice.label}</span>
                            <span className="payment-method-copy">{choice.helper}</span>
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="payment-selector-secure" aria-hidden="true">
                      <span className="payment-selector-lock"></span>
                      <span>paypal.com</span>
                    </div>
                  </div>

                  {!activeMethod && (
                    <div className="payment-method-placeholder">
                      <p className="mb-0">Choose PayPal, Debit or Credit Card, or M-Pesa to open the donation details section.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {activeMethod && (
        <div className="payment-toast-overlay" role="dialog" aria-modal="true" aria-label={`${PAYMENT_METHODS[activeMethod]?.name || "Payment"} details`}>
          <div className="payment-toast-backdrop" onClick={closePaymentToast} />
          <div className={`payment-toast-sheet ${activeMethod}-panel`}>
            <div className="payment-toast-header">
              <div>
                <span className="payment-toast-kicker">{PAYMENT_METHODS[activeMethod]?.name}</span>
                <h4 className="mb-1">Complete your donation details</h4>
                <p className="mb-0 text-muted">Close this panel anytime to return to the payment method cards.</p>
              </div>
              <button className="payment-toast-close" type="button" aria-label="Close payment details" onClick={closePaymentToast}>
                x
              </button>
            </div>

            <div className={`payment-method-panel ${activeMethod}-panel`}>
              {(activeMethod === "paypal" || activeMethod === "card") && (
                <div className="payment-provider-shell paypal-shell">
                  <div className="provider-hero provider-hero-paypal">
                    <div>
                      <span className="provider-chip">{activeMethod === "card" ? "Official card checkout" : paypalFundingOption === "paypal" ? "PayPal Checkout" : "Card Checkout"}</span>
                      <h5>
                        {activeMethod === "card"
                          ? "Continue to PayPal's official hosted card page"
                          : paypalFundingOption === "paypal"
                            ? "Donate with PayPal or continue as a guest when available"
                            : "Donate with a debit or credit card through PayPal"}
                      </h5>
                      <p className="mb-0">
                        {activeMethod === "card"
                          ? `Donations are processed in ${paymentConfig?.methods?.paypal?.currency || "USD"} and after you confirm the donor details here, the user is redirected to PayPal's official secure card checkout page to enter card details there.`
                          : `Donations are processed in ${paymentConfig?.methods?.paypal?.currency || "USD"} and continue in a secure PayPal window where donors can often use a credit or debit card without a PayPal account, while the funds still go to your PayPal account.`}
                      </p>
                    </div>
                    <div className="provider-logo-lockup provider-logo-lockup-paypal" aria-hidden="true">
                      <span className="paypal-wordmark paypal-wordmark-dark">Pay</span>
                      <span className="paypal-wordmark paypal-wordmark-light">Pal</span>
                    </div>
                  </div>

                  <form
                    onSubmit={handleHostedCheckoutReview}
                  >
                    <HostedCheckoutFields
                      form={form}
                      onChange={handleChange}
                      currency={paymentConfig?.methods?.paypal?.currency || "USD"}
                      method={activeMethod}
                    />

                    <div className="provider-footer-note">
                      {activeMethod === "card" ? PAYMENT_METHODS.card.footer : PAYMENT_METHODS.paypal.footer}
                    </div>

                    <button
                      className="provider-submit provider-submit-paypal"
                      type="submit"
                      disabled={paypalSubmitting}
                    >
                      {paypalSubmitting
                        ? "Starting secure checkout..."
                        : activeMethod === "card"
                          ? "Review and continue to card checkout"
                          : "Review PayPal checkout"}
                    </button>

                    {paypalMessage && <small className="text-muted d-block mt-3">{paypalMessage}</small>}
                  </form>
                </div>
              )}

              {activeMethod === "mpesa" && (
                <div className="payment-provider-shell mpesa-shell">
                  <div className="provider-hero provider-hero-mpesa">
                    <div>
                      <span className="provider-chip">M-Pesa Express</span>
                      <h5>Trigger an STK push directly to the donor&apos;s phone</h5>
                      <p className="mb-0">
                        Donations are requested in {paymentConfig?.methods?.mpesa?.currency || "KES"} and confirmed through the donor&apos;s handset.
                      </p>
                    </div>
                    <div className="provider-logo-lockup provider-logo-lockup-mpesa" aria-hidden="true">
                      <span className="mpesa-wordmark">M-PESA</span>
                    </div>
                  </div>

                  <form onSubmit={handleMpesaReview}>
                    <MpesaDonationFields
                      form={form}
                      onChange={handleChange}
                      currency={paymentConfig?.methods?.mpesa?.currency || "KES"}
                    />

                    <div className="provider-footer-note">{PAYMENT_METHODS.mpesa.footer}</div>

                    <button className="provider-submit provider-submit-mpesa" type="submit" disabled={submitting}>
                      {submitting ? "Submitting..." : "Review M-Pesa prompt"}
                    </button>

                    {status.type === "success" && (
                      <small className="text-success d-block mt-3">{status.message}</small>
                    )}
                    {status.type === "error" && (
                      <small className="text-danger d-block mt-3">{status.message}</small>
                    )}
                    {status.type === "pending" && (
                      <small className="text-warning d-block mt-3">{status.message}</small>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {mpesaConfirmOpen && activeMethod === "mpesa" && (
        <div className="confirm-toast-overlay" role="dialog" aria-modal="true" aria-label="Confirm M-Pesa details">
          <div className="confirm-toast-backdrop" onClick={() => setMpesaConfirmOpen(false)} />
          <div className="confirm-toast-card">
            <div className="confirm-toast-header">
              <div>
                <span className="confirm-toast-kicker">Step 2</span>
                <h5 className="mb-1">Authorization on phone</h5>
                <p className="mb-0 text-muted">
                  Confirm these details, then we will send the M-Pesa prompt to the donor&apos;s handset.
                </p>
              </div>
              <button
                className="payment-toast-close"
                type="button"
                aria-label="Close M-Pesa confirmation"
                onClick={() => setMpesaConfirmOpen(false)}
              >
                x
              </button>
            </div>

            <div className="checkout-review-card confirm-review-card">
              <div className="checkout-review-row">
                <span>Phone</span>
                <strong>{form.phone || "Add M-Pesa number"}</strong>
              </div>
              <div className="checkout-review-row">
                <span>Total donation</span>
                <strong>
                  {paymentConfig?.methods?.mpesa?.currency || "KES"} {form.amount || "0"}
                </strong>
              </div>
            </div>

            <div className="confirm-toast-actions">
              <p className="confirm-step-note mb-0">Step 1 verification checks the phone number and donation amount before the STK push is sent.</p>
              <button
                className="confirm-toast-secondary"
                type="button"
                onClick={() => setMpesaConfirmOpen(false)}
                disabled={submitting}
              >
                Back
              </button>
              <button
                className="provider-submit provider-submit-mpesa confirm-toast-primary"
                type="button"
                onClick={submitMpesaDonation}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Confirm and send prompt"}
              </button>
            </div>
          </div>
        </div>
      )}

      {paypalConfirmOpen && (activeMethod === "paypal" || activeMethod === "card") && (
        <div className="confirm-toast-overlay" role="dialog" aria-modal="true" aria-label="Confirm PayPal details">
          <div className="confirm-toast-backdrop" onClick={() => setPaypalConfirmOpen(false)} />
          <div className="confirm-toast-card confirm-toast-card-paypal">
            <div className="confirm-toast-header">
              <div>
                <span className="confirm-toast-kicker confirm-toast-kicker-paypal">Step 2</span>
                <h5 className="mb-1">
                  {activeMethod === "card"
                    ? "Card checkout review"
                    : PAYPAL_FUNDING_OPTIONS[paypalFundingOption].confirmTitle}
                </h5>
                <p className="mb-0 text-muted">
                  {activeMethod === "card"
                    ? "Confirm these details, then we will redirect the user to PayPal's official secure hosted page, where they will enter their card details to complete payment."
                    : "Confirm these details, then we will open the secure PayPal checkout window. On most PayPal checkouts, donors can continue with a credit or debit card without signing in, and the donation will still be received in your PayPal account."}
                </p>
              </div>
              <button
                className="payment-toast-close"
                type="button"
                aria-label="Close PayPal confirmation"
                onClick={() => setPaypalConfirmOpen(false)}
              >
                x
              </button>
            </div>

            <div className="checkout-review-card confirm-review-card">
              <div className="checkout-review-row">
                <span>Payment method</span>
                <strong>
                  {activeMethod === "card"
                    ? "Debit or credit card on PayPal"
                    : PAYPAL_FUNDING_OPTIONS[paypalFundingOption].confirmMethod}
                </strong>
              </div>
              <div className="checkout-review-row">
                <span>Total donation</span>
                <strong>
                  {paymentConfig?.methods?.paypal?.currency || "USD"} {form.amount || "0"}
                </strong>
              </div>
            </div>

            <p className="text-muted small mb-3">
              {activeMethod === "card"
                ? "No card details are collected on this site. The user will fill them in only after being redirected to PayPal's official checkout page."
                : "Guest checkout availability is decided by PayPal based on merchant settings, donor location, and risk checks during checkout, but successful card donations still settle into your PayPal account."}
            </p>

            <div className="confirm-toast-actions">
              <button
                className="confirm-toast-secondary"
                type="button"
                onClick={() => setPaypalConfirmOpen(false)}
                disabled={paypalSubmitting}
              >
                Back
              </button>
              <button
                className="provider-submit provider-submit-paypal confirm-toast-primary"
                type="button"
                onClick={handlePaypalCheckout}
                disabled={paypalSubmitting}
              >
                {paypalSubmitting
                  ? "Starting secure checkout..."
                  : activeMethod === "card"
                    ? "Continue to PayPal card checkout"
                    : "Confirm and continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Donate;
