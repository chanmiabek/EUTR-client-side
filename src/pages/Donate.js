/* eslint-disable no-unused-vars */
// Donate.jsx - Compact card-sized panels for all payment methods
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../components/PageHero";
import heroImage from "../assets/hero.jpeg";
import { getApiUrl, postJson, readApiError } from "../utils/api";
import "../pages/Donate.css";

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const DONATION_INITIATE_ENDPOINT =
  process.env.REACT_APP_DONATION_INITIATE_ENDPOINT || "/api/donations/initiate-payment";
const DONATION_STATUS_PATH = process.env.REACT_APP_DONATION_STATUS_PATH || "/donate/status";
const PAYPAL_CAPTURE_ENDPOINT =
  process.env.REACT_APP_PAYPAL_CAPTURE_ENDPOINT || "/api/paypal/capture";

const PAYPAL_PRESET_AMOUNTS = [10, 25, 50];
const DEFAULT_PAYPAL_AMOUNT = PAYPAL_PRESET_AMOUNTS[1];

const defaultPaymentConfig = {
  methods: {
    mpesa: { enabled: true, live: false, currency: "KES" },
    paypal: { enabled: true, live: false, currency: "USD" }
  }
};

const PAYMENT_CHOICES = [
  { key: "paypal", method: "paypal", type: "express", label: "PayPal", helper: "PayPal balance or guest checkout" },
  { key: "card", method: "card", type: "card", label: "Debit or Credit Card (No PayPal account)", helper: "Pay with a card on PayPal checkout" },
  { key: "mpesa", method: "mpesa", type: "mpesa", label: "M-Pesa", helper: "Mobile money - STK push to phone" }
];

// ============================================
// SUB-COMPONENTS
// ============================================

// Compact M-Pesa form
function MpesaDonationFields({ form, onChange, currency, errors }) {
  return (
    <div className="donation-fields-compact">
      <div className="compact-fields">
        <div className="compact-field">
          <label className="compact-label">Phone</label>
          <input
            className={`compact-input ${errors.phone ? "is-invalid" : ""}`}
            type="tel"
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="2547XXXXXXXX"
            required
          />
          {errors.phone && <div className="invalid-feedback compact-feedback">{errors.phone}</div>}
        </div>
        
        <div className="compact-field">
          <label className="compact-label">Email</label>
          <input
            className={`compact-input ${errors.email ? "is-invalid" : ""}`}
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="donor@email.com"
            required
          />
          {errors.email && <div className="invalid-feedback compact-feedback">{errors.email}</div>}
        </div>
        
        <div className="compact-field">
          <label className="compact-label">Amount ({currency || "KES"})</label>
          <input
            className={`compact-input ${errors.amount ? "is-invalid" : ""}`}
            type="number"
            min="10"
            name="amount"
            value={form.amount}
            onChange={onChange}
            placeholder="100"
            required
          />
          {errors.amount && <div className="invalid-feedback compact-feedback">{errors.amount}</div>}
        </div>
      </div>
    </div>
  );
}

function ToastNotification({ toast, setToast }) {
  if (!toast.visible) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      <div className={`toast-card ${toast.type}`}>
        <div className="toast-body">
          <strong>
            {toast.type === "success" ? "Thank you!" : toast.type === "pending" ? "Action needed" : "Payment failed"}
          </strong>
          <span>{toast.message}</span>
        </div>
        <button
          className="toast-close"
          type="button"
          aria-label="Close"
          onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
        >
          ×
        </button>
      </div>
    </div>
  );
}

function LoadingOverlay({ message }) {
  return (
    <div className="payment-loading-overlay">
      <div className="payment-loading-content">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">{message || "Processing..."}</p>
      </div>
    </div>
  );
}

// ============================================
// MAIN DONATE COMPONENT
// ============================================

function Donate() {
  const navigate = useNavigate();

  // Form State
  const [mpesaForm, setMpesaForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    amount: ""
  });
  const [paypalAmount, setPaypalAmount] = useState(DEFAULT_PAYPAL_AMOUNT);
  const [mpesaErrors, setMpesaErrors] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    amount: ""
  });
  const [paymentConfig, setPaymentConfig] = useState(defaultPaymentConfig);

  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [paypalError, setPaypalError] = useState("");
  const [mpesaStatus, setMpesaStatus] = useState({ type: "idle", message: "" });
  const [toast, setToast] = useState({ type: "", message: "", visible: false });

  // Payment Method State
  const [activeMethod, setActiveMethod] = useState("");
  const [activeChoice, setActiveChoice] = useState("");
  const [mpesaConfirmOpen, setMpesaConfirmOpen] = useState(false);

  // Refs
  const toastTimerRef = useRef(null);
  const goToDonationStatus = (donationId, paymentMethod) => {
    if (!donationId) return;
    const query = new URLSearchParams();
    query.set("donationId", donationId);
    if (paymentMethod) query.set("paymentMethod", paymentMethod);
    navigate(`${DONATION_STATUS_PATH}?${query.toString()}`);
  };

  const isPaymentMethodEnabled = (method) => {
    if (method === "mpesa") return Boolean(paymentConfig?.methods?.mpesa?.enabled);
    if (method === "paypal" || method === "card") return Boolean(paymentConfig?.methods?.paypal?.enabled);
    return false;
  };

  // ============================================
  // PAYPAL RETURN HANDLERS (SUCCESS/CANCEL)
  // ============================================

  const handlePayPalReturn = async (token, payerId) => {
    setSubmitting(true);

    try {
      const response = await fetch(getApiUrl(`${PAYPAL_CAPTURE_ENDPOINT}/${token}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payerId })
      });

      const data = await response.json();

      if (data.success || data.status === "COMPLETED") {
        setToast({ type: "success", message: "✅ Payment successful! Thank you for your donation.", visible: true });

        setTimeout(() => {
          setMpesaForm({ firstName: "", lastName: "", phone: "", email: "", amount: "" });
          setActiveChoice("");
          setActiveMethod("");
          window.location.href = "/donate";
        }, 2000);
      } else {
        setPaypalError(data.message || "Payment verification failed.");
        setToast({ type: "error", message: data.message || "Payment verification failed.", visible: true });
      }
    } catch (error) {
      console.error("Error capturing payment:", error);
      setPaypalError("Could not verify payment. Please contact support.");
      setToast({ type: "error", message: "Could not verify payment.", visible: true });
    } finally {
      setSubmitting(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handlePayPalCancel = () => {
    setPaypalError("Payment was cancelled. You can try again.");
    setToast({ type: "error", message: "Payment cancelled. No charges were made.", visible: true });
    window.history.replaceState({}, document.title, window.location.pathname);
    setActiveChoice("");
    setActiveMethod("");
  };

  // ============================================
  // PAYPAL CHECKOUT - Compact
  // ============================================

  const handlePaypalCheckout = async (method) => {
    setPaypalError("");
    setSubmitting(true);

    try {
      const amountNumber = Number(paypalAmount || 0) || DEFAULT_PAYPAL_AMOUNT;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = getApiUrl("/api/donations/paypal/start");
      form.style.display = "none";

      const appendField = (name, value) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = String(value ?? "");
        form.appendChild(input);
      };

      appendField("paymentMethod", "paypal");
      appendField("payment_method", "paypal");
      appendField("checkoutMethod", method);
      appendField("amount", amountNumber);
      appendField("currency", paymentConfig?.methods?.paypal?.currency || "USD");

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("PayPal error:", error);
      setPaypalError(error.message || "Failed to connect. Please try again.");
      setSubmitting(false);
    }
  };

  // ============================================
  // M-PESA HANDLERS
  // ============================================

  const validateMpesaForm = () => {
    const errors = { firstName: "", lastName: "", phone: "", email: "", amount: "" };
    let isValid = true;

    if (!mpesaForm.firstName.trim()) {
      errors.firstName = "Required";
      isValid = false;
    }

    if (!mpesaForm.lastName.trim()) {
      errors.lastName = "Required";
      isValid = false;
    }

    if (!mpesaForm.phone) {
      errors.phone = "Required";
      isValid = false;
    } else {
      const phoneRegex = /^(2547\d{8}|07\d{8}|7\d{8})$/;
      if (!phoneRegex.test(mpesaForm.phone)) {
        errors.phone = "Use 2547XXXXXXXX or 07XXXXXXXX";
        isValid = false;
      }
    }

    if (!mpesaForm.email) {
      errors.email = "Required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(mpesaForm.email)) {
      errors.email = "Invalid email";
      isValid = false;
    }

    if (!mpesaForm.amount || Number(mpesaForm.amount) <= 0) {
      errors.amount = "Required";
      isValid = false;
    }

    setMpesaErrors(errors);
    return isValid;
  };

  const submitMpesaDonation = async () => {
    if (!validateMpesaForm()) return;

    setSubmitting(true);
    setMpesaConfirmOpen(false);
    setMpesaStatus({ type: "idle", message: "" });

    try {
      const payload = {
        firstName: mpesaForm.firstName,
        lastName: mpesaForm.lastName,
        phone: mpesaForm.phone,
        email: mpesaForm.email,
        amount: Number(mpesaForm.amount || 0),
        currency: paymentConfig?.methods?.mpesa?.currency || "KES",
        paymentMethod: "mpesa",
        payment_method: "mpesa"
      };

      const response = await postJson(DONATION_INITIATE_ENDPOINT, payload);
      
      if (!response.ok) {
        const errorMsg = await readApiError(response);
        throw new Error(errorMsg || `Server error: ${response.status}`);
      }

      const data = await response.json();
      const mpesaResult = data?.mpesa;
      
      if (mpesaResult?.requested === false) {
        setMpesaStatus({ type: "error", message: mpesaResult?.detail || "Unable to initiate M-Pesa payment." });
        setToast({ type: "error", message: mpesaResult?.detail || "M-Pesa failed.", visible: true });
        return;
      }

      setMpesaStatus({ type: "success", message: "✅ Prompt sent! Check your phone." });
      setToast({ type: "success", message: "M-Pesa prompt sent! Check your phone.", visible: true });
      const donationId = data?.donation?.id || data?.donationId || data?.id || "";
      goToDonationStatus(donationId, "mpesa");

    } catch (error) {
      console.error("M-Pesa error:", error);
      setMpesaStatus({ type: "error", message: error.message || "Something went wrong." });
      setToast({ type: "error", message: error.message || "M-Pesa failed.", visible: true });
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // UI HANDLERS
  // ============================================

  const handleMpesaChange = (event) => {
    const { name, value } = event.target;
    setMpesaForm((prev) => ({ ...prev, [name]: value }));
    if (mpesaErrors[name]) {
      setMpesaErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const openPaymentChoice = (choice) => {
    if (!isPaymentMethodEnabled(choice.method)) {
      const message =
        choice.method === "mpesa"
          ? "M-Pesa is not configured on the server yet."
          : "PayPal is not configured on the server yet.";
      setToast({ type: "error", message, visible: true });
      return;
    }

    const nextChoice = activeChoice === choice.key ? "" : choice.key;
    setActiveChoice(nextChoice);
    setActiveMethod(nextChoice ? choice.method : "");
    setMpesaConfirmOpen(false);
    setPaypalError("");
    setMpesaStatus({ type: "idle", message: "" });
    
    if (!nextChoice) {
      setMpesaForm({ firstName: "", lastName: "", phone: "", email: "", amount: "" });
      setPaypalAmount(DEFAULT_PAYPAL_AMOUNT);
    }
  };

  const closePaymentPanel = () => {
    setActiveChoice("");
    setActiveMethod("");
    setMpesaConfirmOpen(false);
    setPaypalError("");
    setMpesaStatus({ type: "idle", message: "" });
    setMpesaForm({ firstName: "", lastName: "", phone: "", email: "", amount: "" });
    setPaypalAmount(DEFAULT_PAYPAL_AMOUNT);
  };

  const handleMpesaReview = (event) => {
    event.preventDefault();
    if (!validateMpesaForm()) return;
    setMpesaStatus({ type: "idle", message: "" });
    setMpesaConfirmOpen(true);
  };

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (toast.visible) {
      toastTimerRef.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 5000);
    }
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [toast.visible]);

  useEffect(() => {
    let isActive = true;
    fetch(getApiUrl("/api/payment-section/"))
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!isActive || !data) return;
        setPaymentConfig({
          methods: {
            mpesa: { ...defaultPaymentConfig.methods.mpesa, ...(data?.methods?.mpesa || {}) },
            paypal: { ...defaultPaymentConfig.methods.paypal, ...(data?.methods?.paypal || {}) }
          }
        });
      })
      .catch(() => {});
    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    if (!activeMethod) return;
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        if (mpesaConfirmOpen) setMpesaConfirmOpen(false);
        else closePaymentPanel();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [activeMethod, mpesaConfirmOpen]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="app">
      <ToastNotification toast={toast} setToast={setToast} />
      
      {submitting && <LoadingOverlay message="Processing..." />}

      <div className={`payment-page-shell ${activeMethod ? "payment-page-shell-hidden" : ""}`} aria-hidden={Boolean(activeMethod)}>
        <PageHero
          eyebrow="Donate"
          title="Fuel education, protection, and opportunity."
          copy="Every gift supports community-led programs and direct family support."
          backgroundImage={heroImage}
          backgroundAlt="Donate hero"
        >
          <h5 className="mb-3">Donation on this section</h5>
          {/* <ul className="list-unstyled text-muted mb-3">
            <li className="mb-2">KES 500 supports one learning kit.</li>
            <li className="mb-2">KES 1,200 funds a wellness visit.</li>
            <li className="mb-2">KES 3,000 powers a month of mentorship.</li>
          </ul> */}
        </PageHero>

        <section className="section">
          <div className="container">
            <div className="row gy-4 justify-content-center">
              <div className="col-lg-9">
                <div className="support-card payment-experience-card h-100">
                  <div className="payment-header">
                    <div>
                      <h4 className="mb-2">Choose a payment method</h4>
                      <p className="text-muted mb-0">Select your preferred way to donate</p>
                    </div>
                    <small className="text-muted payment-mode-badge">
                      {paymentConfig?.methods?.paypal?.live || paymentConfig?.methods?.mpesa?.live ? "Live" : "Test Mode"}
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
                          disabled={!isPaymentMethodEnabled(choice.method)}
                        >
                          {choice.type === "express" && (
                            <>
                              <span className="payment-method-label">Choose any payment to Donation here</span>
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
                              <span className="payment-method-label payment-method-label-mpesa">Mobile money</span>
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
                      <span>Secure checkout</span>
                    </div>
                  </div>

                  {!activeMethod && (
                    <div className="payment-method-placeholder">
                      <p className="mb-0">Click any payment method above to continue</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Compact Payment Panels - Card sized */}
      {activeMethod && (
        <div className="compact-panel-overlay" role="dialog" aria-modal="true">
          <div className="compact-panel-backdrop" onClick={closePaymentPanel} />
          <div className={`compact-panel ${activeMethod}-panel`}>
            <div className="compact-panel-header">
              <div>
                <span className="compact-panel-badge">
                  {activeMethod === "mpesa" ? "M-Pesa" : activeMethod === "paypal" ? "PayPal" : "Card"}
                </span>
                <button className="compact-panel-close" type="button" onClick={closePaymentPanel}>
                  ×
                </button>
              </div>
            </div>

            <div className="compact-panel-body">
              {/* PayPal/Card Compact Panel */}
              {(activeMethod === "paypal" || activeMethod === "card") && (
                <>
                  <p className="compact-description">
                    {activeMethod === "card"
                      ? "Pay with credit or debit card via PayPal's secure checkout."
                      : "Pay with PayPal balance or guest checkout."}
                  </p>

                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {PAYPAL_PRESET_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        className={`btn btn-outline-secondary btn-sm ${Number(paypalAmount) === amount ? "active" : ""}`}
                        onClick={() => setPaypalAmount(amount)}
                      >
                        {paymentConfig?.methods?.paypal?.currency || "USD"} {amount}
                      </button>
                    ))}
                  </div>

                  {paypalError && (
                    <div className="compact-error">{paypalError}</div>
                  )}

                  <button 
                    className="compact-button compact-button-paypal" 
                    onClick={() => handlePaypalCheckout(activeMethod)}
                    disabled={submitting}
                  >
                    {submitting ? "Redirecting..." : `Continue to ${activeMethod === "card" ? "Card" : "PayPal"} →`}
                  </button>
                </>
              )}

              {/* M-Pesa Compact Panel */}
              {activeMethod === "mpesa" && (
                <>
                  <p className="compact-description">
                    Enter your details to receive the STK push.
                  </p>

                  <form onSubmit={handleMpesaReview}>
                    <div className="compact-fields">
                      <input
                        className={`compact-input ${mpesaErrors.firstName ? "is-invalid" : ""}`}
                        type="text"
                        name="firstName"
                        value={mpesaForm.firstName}
                        onChange={handleMpesaChange}
                        placeholder="First name"
                        required
                      />
                      {mpesaErrors.firstName && <div className="compact-feedback">{mpesaErrors.firstName}</div>}

                      <input
                        className={`compact-input ${mpesaErrors.lastName ? "is-invalid" : ""}`}
                        type="text"
                        name="lastName"
                        value={mpesaForm.lastName}
                        onChange={handleMpesaChange}
                        placeholder="Last name"
                        required
                      />
                      {mpesaErrors.lastName && <div className="compact-feedback">{mpesaErrors.lastName}</div>}

                      <input
                        className={`compact-input ${mpesaErrors.phone ? "is-invalid" : ""}`}
                        type="tel"
                        name="phone"
                        value={mpesaForm.phone}
                        onChange={handleMpesaChange}
                        placeholder="Phone (2547XXXXXXXX)"
                        required
                      />
                      {mpesaErrors.phone && <div className="compact-feedback">{mpesaErrors.phone}</div>}
                      
                      <input
                        className={`compact-input ${mpesaErrors.email ? "is-invalid" : ""}`}
                        type="email"
                        name="email"
                        value={mpesaForm.email}
                        onChange={handleMpesaChange}
                        placeholder="Email"
                        required
                      />
                      {mpesaErrors.email && <div className="compact-feedback">{mpesaErrors.email}</div>}
                      
                      <input
                        className={`compact-input ${mpesaErrors.amount ? "is-invalid" : ""}`}
                        type="number"
                        name="amount"
                        value={mpesaForm.amount}
                        onChange={handleMpesaChange}
                        placeholder={`Amount (${paymentConfig?.methods?.mpesa?.currency || "KES"})`}
                        required
                      />
                      {mpesaErrors.amount && <div className="compact-feedback">{mpesaErrors.amount}</div>}
                    </div>

                    {mpesaStatus.type === "error" && (
                      <div className="compact-error">{mpesaStatus.message}</div>
                    )}
                    {mpesaStatus.type === "success" && (
                      <div className="compact-success">{mpesaStatus.message}</div>
                    )}

                    <button className="compact-button compact-button-mpesa" type="submit" disabled={submitting}>
                      {submitting ? "Processing..." : "Send Prompt →"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* M-Pesa Confirmation Modal - Compact */}
      {mpesaConfirmOpen && activeMethod === "mpesa" && (
        <div className="compact-modal-overlay" role="dialog" aria-modal="true">
          <div className="compact-modal-backdrop" onClick={() => setMpesaConfirmOpen(false)} />
          <div className="compact-modal">
            <div className="compact-modal-header">
              <h5>Confirm Payment</h5>
              <button className="compact-modal-close" onClick={() => setMpesaConfirmOpen(false)}>×</button>
            </div>
            <div className="compact-modal-body">
              <div className="compact-modal-row">
                <span>Phone:</span>
                <strong>{mpesaForm.phone}</strong>
              </div>
              <div className="compact-modal-row">
                <span>Amount:</span>
                <strong>{paymentConfig?.methods?.mpesa?.currency || "KES"} {mpesaForm.amount}</strong>
              </div>
            </div>
            <div className="compact-modal-footer">
              <button className="compact-modal-btn secondary" onClick={() => setMpesaConfirmOpen(false)}>Back</button>
              <button className="compact-modal-btn primary" onClick={submitMpesaDonation} disabled={submitting}>
                {submitting ? "Sending..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Donate;
