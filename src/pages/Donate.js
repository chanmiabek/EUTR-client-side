import React, { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import PageHero from "../components/PageHero";
import heroImage from "../assets/hero.jpeg";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  amount: "",
  currency: "USD",
  paymentMethod: "Visa",
  paymentToken: ""
};

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_live_your_publishable_key"
);

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
  const [method, setMethod] = useState("visa");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const cardElementOptions = useMemo(
    () => ({
      style: {
        base: {
          fontSize: "16px",
          color: "#1f2937",
          "::placeholder": { color: "#9ca3af" }
        },
        invalid: { color: "#dc2626" }
      }
    }),
    []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMethodSelect = (nextMethod) => {
    setMethod(nextMethod);
    const paymentMethodMap = {
      visa: "Visa",
      paypal: "PayPal",
      mpesa: "M-Pesa",
      bank: "Bank"
    };

    setForm((prev) => ({
      ...prev,
      paymentMethod: paymentMethodMap[nextMethod] || prev.paymentMethod,
      paymentToken:
        nextMethod === "mpesa"
          ? phone
          : nextMethod === "visa"
          ? prev.paymentToken
          : ""
    }));
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
      setMethod("visa");
      setPhone("");
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
        backgroundImage={heroImage}
        backgroundAlt="Donate hero"
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
              <h2 className="section-heading">Secure and flexible payment options</h2>
              <p className="section-copy">
                We partner with trusted payment providers to ensure your donations are processed securely and efficiently. Choose the method that works best for you, and rest assured that your support is making a difference in the lives of those we serve. 
              </p>
              <div className="program-card">
                <h5 className="mb-3">Suggested integration</h5>
                <p className="text-muted mb-2">donations</p>
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
                    <div className="d-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                      {[
                        { id: "visa", label: "Visa" },
                        { id: "paypal", label: "PayPal" },
                        { id: "mpesa", label: "M-Pesa" },
                        { id: "bank", label: "Bank" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleMethodSelect(item.id)}
                          className={`btn btn-sm ${
                            method === item.id ? "btn-accent" : "btn-outline-light"
                          }`}
                        >
                          <img
                            src={`/icons/${item.id}.svg`}
                            alt={item.label}
                            style={{ width: "32px", height: "22px", objectFit: "contain" }}
                          />
                          <span className="visually-hidden">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="border rounded p-3">
                      {method === "visa" && (
                        <Elements stripe={stripePromise}>
                          <VisaInput
                            onToken={(token) =>
                              setForm((prev) => ({ ...prev, paymentToken: token || "" }))
                            }
                            options={cardElementOptions}
                          />
                        </Elements>
                      )}
                      {method === "paypal" && (
                        <div>
                          <p className="text-muted mb-2">
                            You will be redirected to PayPal to complete payment.
                          </p>
                          <button
                            type="button"
                            className="btn btn-outline-light w-100"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                paymentToken: "paypal_redirect_pending"
                              }))
                            }
                          >
                            Continue with PayPal
                          </button>
                        </div>
                      )}
                      {method === "mpesa" && (
                        <div>
                          <label className="form-label">M-Pesa Phone Number</label>
                          <input
                            className="form-control mb-2"
                            type="tel"
                            placeholder="2547XXXXXXXX"
                            value={phone}
                            onChange={(event) => {
                              const nextPhone = event.target.value;
                              setPhone(nextPhone);
                              setForm((prev) => ({ ...prev, paymentToken: nextPhone }));
                            }}
                          />
                          <button type="button" className="btn btn-success w-100">
                            Pay with M-Pesa
                          </button>
                        </div>
                      )}
                      {method === "bank" && (
                        <button
                          type="button"
                          className="btn btn-primary w-100"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, paymentToken: "plaid_connect_pending" }))
                          }
                        >
                          Connect bank account
                        </button>
                      )}
                    </div>
                  </div>
                  {/* <div className="col-12">
                    <label className="form-label">Payment method token</label>
                    <input
                      className="form-control"
                      name="paymentToken"
                      value={form.paymentToken}
                      onChange={handleChange}
                      placeholder="Generated by gateway SDK"
                    />
                  </div> */}
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
                       Please process your payments securely.
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

function VisaInput({ onToken, options }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardStatus, setCardStatus] = useState("");

  const createToken = async () => {
    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    if (!card) return;

    const { token, error } = await stripe.createToken(card);
    if (error) {
      setCardStatus(error.message || "Unable to validate card");
      onToken("");
      return;
    }

    onToken(token?.id || "");
    setCardStatus("Card validated. Token captured.");
  };

  return (
    <div>
      <label className="form-label">Card details</label>
      <div className="form-control py-3">
        <CardElement options={options} />
      </div>
      <button type="button" className="btn btn-outline-light btn-sm mt-2" onClick={createToken}>
        Validate card
      </button>
      {cardStatus && <small className="d-block mt-2 text-muted">{cardStatus}</small>}
    </div>
  );
}
