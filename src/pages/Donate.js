import React, { useState } from "react";
import PageHero from "../components/PageHero";
import heroImage from "../assets/hero.jpeg";
import { postJson, readApiError } from "../utils/api";

const STRIPE_DONATION_LINK =
  process.env.REACT_APP_STRIPE_DONATION_LINK || "https://donate.stripe.com/test_5kQ28rcEJfcAeaPdKPaVa01";
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
  const [paypalSubmitting, setPaypalSubmitting] = useState(false);
  const [paypalMessage, setPaypalMessage] = useState("");

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

      const response = await postJson("/api/donations/initiate-payment/", payload);

      if (!response.ok) {
        throw new Error(await readApiError(response));
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
        paymentMethod: "paypal",
        payment_method: "paypal",
        paymentToken: "paypal-web"
      };

      const response = await postJson("/api/donations/initiate-payment/", payload);
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const data = await response.json();
      if (data?.approval_url) {
        window.open(data.approval_url, "_blank", "noopener,noreferrer");
        setPaypalMessage("PayPal checkout opened in a new tab.");
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
                  Start PayPal through your backend payment endpoint.
                </p>

                <button
                  className="btn btn-outline-light w-100"
                  type="button"
                  onClick={handlePaypalCheckout}
                  disabled={paypalSubmitting}
                >
                  {paypalSubmitting ? "Starting PayPal..." : "Donate with PayPal"}
                </button>

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
