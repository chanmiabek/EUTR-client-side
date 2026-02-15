import React, { useState } from "react";
import PageHero from "../components/PageHero";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  amount: "",
  currency: "USD",
  paymentMethod: "Bank",
  paymentToken: ""
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return "";
};

function Donate() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch("/api/donations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRFToken": csrfToken } : {})
        },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount || 0)
        })
      });

      if (!response.ok) {
        throw new Error("Donation request failed.");
      }

      setStatus({ type: "success", message: "Donation submitted successfully." });
      setForm(initialForm);
    } catch (error) {
      setStatus({ type: "error", message: "Unable to submit donation." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHero
        eyebrow="Donate"
        title="Fuel education, protection, and opportunity."
        copy="Every gift supports community-led programs and direct family support."
      >
        <h5 className="mb-3">Giving options</h5>
        <ul className="list-unstyled text-muted mb-3">
          <li className="mb-2"> $30 supports one learning kit.</li>
          <li className="mb-2"> $75 funds a wellness visit.</li>
          <li className="mb-2">  $150 powers a month of mentorship.</li>
        </ul>
        <button className="btn btn-accent">Give now</button>
      </PageHero>

      <section className="section section-tight">
        <div className="container">
          <div className="row gy-4">
            {["Monthly Partner", "Sponsor a Student", "Community Grants"].map(
              (item) => (
                <div className="col-md-4" key={item}>
                  <div className="support-card">
                    <h4>{item}</h4>
                    <p className="text-muted">
                      Flexible ways to sustain long-term programs and stability.
                    </p>
                    <button className="btn btn-outline-light btn-sm">
                      Learn more
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row gy-4 align-items-start">
            <div className="col-lg-6">
              <div className="section-title">Payment</div>
              <h2 className="section-heading">Backend-ready payment details.</h2>
              <p className="section-copy">
                This form is structured for easy integration with your payment
                gateway (Stripe, Flutterwave, Paystack). Replace the placeholder
                handler with your backend endpoint.
              </p>
              <div className="program-card">
                <h5 className="mb-3">Suggested integration</h5>
                <p className="text-muted mb-2">POST /api/donations/</p>
                <p className="text-muted mb-0">
                  Payload: amount, currency, donor details, payment method, and
                  payment token.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <form className="support-card" onSubmit={handleSubmit}>
                <h4 className="mb-3">Donation form</h4>
                <div className="row gy-3">
                  <div className="col-md-6">
                    <label className="form-label">First name</label>
                    <input
                      className="form-control"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="Jane"
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
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@email.com"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Amount</label>
                    <input
                      className="form-control"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      placeholder="100"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Currency</label>
                    <select
                      className="form-select"
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                    >
                      <option>USD</option>
                      <option>KES</option>
                      <option>EUR</option>
                      <option>GBP</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Payment method</label>
                    <select
                      className="form-select"
                      name="paymentMethod"
                      value={form.paymentMethod}
                      onChange={handleChange}
                    >
                      <option>Bank</option>
                      <option>Visa</option>
                      <option>M-Pesa</option>
                      <option>PayPal</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Payment method token</label>
                    <input
                      className="form-control"
                      name="paymentToken"
                      value={form.paymentToken}
                      onChange={handleChange}
                      placeholder="Generated by gateway SDK"
                    />
                  </div>
                  <div className="col-12">
                    <button className="btn btn-accent w-100" type="submit" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit donation"}
                    </button>
                    {status.type === "success" && (
                      <small className="text-success d-block mt-2">
                        {status.message}
                      </small>
                    )}
                    {status.type === "error" && (
                      <small className="text-danger d-block mt-2">
                        {status.message}
                      </small>
                    )}
                    <small className="text-muted d-block mt-2">
                      This is a UI placeholder. Connect to your backend to process
                      payments securely.
                    </small>
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
