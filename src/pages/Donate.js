import React, { useEffect, useRef, useState } from "react";
import PageHero from "../components/PageHero";
import heroImage from "../assets/hero.jpeg";
import { getApiUrl } from "../utils/api";

const STRIPE_DONATION_LINK =
  process.env.REACT_APP_STRIPE_DONATION_LINK || "https://donate.stripe.com/test_5kQ28rcEJfcAeaPdKPaVa01";
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || "test";
const PAYPAL_CURRENCY = process.env.REACT_APP_PAYPAL_CURRENCY || "USD";
const PAYPAL_DONATION_LINK = process.env.REACT_APP_PAYPAL_DONATION_LINK || "https://www.paypal.com/donate";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  amount: "",
  currency: "KES"
};

function Donate() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [paypalMessage, setPaypalMessage] = useState("");
  const paypalContainerRef = useRef(null);

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

    try {
      const payload = {
        ...form,
        amount: Number(form.amount || 0),
        paymentMethod: "mpesa",
        payment_method: "mpesa",
        paymentToken: form.phone,
        phone: form.phone
      };

      const response = await fetch(getApiUrl("/api/donations/initiate-payment/"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Donation request failed.");
      }

      const data = await response.json();
      const paymentStatus = data?.payment_status;

      if (paymentStatus === "completed") {
        setStatus({ type: "success", message: "Payment completed successfully." });
      } else if (paymentStatus === "failed") {
        setStatus({
          type: "error",
          message: data?.donation?.failed_reason || "Payment failed. Please try again."
        });
      } else {
        setStatus({
          type: "pending",
          message: "M-Pesa prompt sent. Please complete payment on your phone."
        });
      }

      setForm(initialForm);
    } catch {
      setStatus({ type: "error", message: "Unable to submit M-Pesa donation." });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (PAYPAL_CLIENT_ID === "test" || !paypalContainerRef.current) return undefined;

    let active = true;
    const scriptId = "paypal-sdk-script";
    let script = document.getElementById(scriptId);

    const renderButtons = () => {
      if (!active || !window.paypal || !paypalContainerRef.current) return;
      paypalContainerRef.current.innerHTML = "";

      window.paypal
        .Buttons({
          createOrder: async () => {
            try {
              const response = await fetch(getApiUrl("/api/orders"), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  cart: [{ id: "DONATION", quantity: "1" }]
                })
              });

              const orderData = await response.json();
              if (orderData.id) return orderData.id;

              const errorDetail = orderData?.details?.[0];
              const errorMessage = errorDetail
                ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                : JSON.stringify(orderData);
              throw new Error(errorMessage);
            } catch (error) {
              setPaypalMessage(`Could not initiate PayPal Checkout: ${error}`);
              return "";
            }
          },
          onApprove: async (data, actions) => {
            try {
              const response = await fetch(getApiUrl(`/api/orders/${data.orderID}/capture`), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                }
              });

              const orderData = await response.json();
              const errorDetail = orderData?.details?.[0];

              if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                return actions.restart();
              }

              if (errorDetail) {
                throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
              }

              setPaypalMessage("PayPal payment completed successfully.");
            } catch (error) {
              setPaypalMessage(`Sorry, your transaction could not be processed: ${error}`);
            }
            return null;
          },
          onCancel: () => setPaypalMessage("PayPal payment was cancelled."),
          onError: () => setPaypalMessage("PayPal payment failed. Please try again.")
        })
        .render(paypalContainerRef.current);
    };

    if (script) {
      if (window.paypal) renderButtons();
      else script.addEventListener("load", renderButtons, { once: true });
    } else {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
        PAYPAL_CLIENT_ID
      )}&currency=${encodeURIComponent(PAYPAL_CURRENCY)}`;
      script.async = true;
      script.addEventListener("load", renderButtons, { once: true });
      document.body.appendChild(script);
    }

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="app">
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
          <div className="row gy-4">
            <div className="col-lg-6">
              <div className="support-card h-100">
                <h4 className="mb-3">PayPal Donation</h4>
                <p className="text-muted mb-3">
                  Use PayPal checkout with default PayPal styles.
                </p>

                {PAYPAL_CLIENT_ID === "test" ? (
                  <a
                    className="btn btn-outline-light w-100"
                    href={PAYPAL_DONATION_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Donate with PayPal
                  </a>
                ) : (
                  <div ref={paypalContainerRef} />
                )}

                {paypalMessage && <small className="text-muted d-block mt-2">{paypalMessage}</small>}

                <a
                  className="btn btn-outline-light w-100 mt-3"
                  href={STRIPE_DONATION_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Donate with Card (Stripe)
                </a>
              </div>
            </div>

            <div className="col-lg-6" id="mpesa-donation-form">
              <form className="support-card h-100" onSubmit={handleSubmit}>
                <h4 className="mb-3">M-Pesa Donation</h4>

                <div className="row gy-3">
                  <div className="col-md-6">
                    <label className="form-label">First name</label>
                    <input
                      className="form-control"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
                      placeholder="jane@email.com"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">M-Pesa phone number</label>
                    <input
                      className="form-control"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="2547XXXXXXXX"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Amount (KES)</label>
                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      placeholder="1000"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <button className="btn btn-accent w-100" type="submit" disabled={submitting}>
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
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Donate;
