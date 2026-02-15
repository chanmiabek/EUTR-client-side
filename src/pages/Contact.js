import React, { useState } from "react";
import PageHero from "../components/PageHero";

const initialForm = {
  name: "",
  email: "",
  message: ""
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return "";
};

function Contact() {
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
      const response = await fetch("/api/contact/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRFToken": csrfToken } : {})
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("Contact request failed.");
      }

      setStatus({ type: "success", message: "Message sent successfully." });
      setForm(initialForm);
    } catch (error) {
      setStatus({ type: "error", message: "Unable to send message." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="Let us know how we can work together."
        copy="We welcome partnership inquiries, volunteer interest, and community referrals."
      >
        <h5 className="mb-3">Reach us</h5>
        <p className="text-muted mb-1">Email: hello@eutr.org</p>
        <p className="text-muted mb-1">Phone: +254 700 000 000</p>
        <p className="text-muted">Location: Kakuma, Kenya</p>
      </PageHero>

      <section className="section section-tight">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6">
              <form className="support-card" onSubmit={handleSubmit}>
                <h4>Send a message</h4>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email address"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows="4"
                    placeholder="How can we help?"
                  ></textarea>
                </div>
                <button className="btn btn-accent" type="submit" disabled={submitting}>
                  {submitting ? "Sending..." : "Send message"}
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
                  This form is ready for backend integration. Connect it to your
                  messaging API to store or forward submissions.
                </small>
              </form>
            </div>
            <div className="col-lg-6">
              <div className="program-card">
                <h4>Backend integration</h4>
                <p className="text-muted">Suggested endpoint: POST /api/contact/</p>
                <p className="text-muted">
                  Payload: name, email, message, source, and timestamp.
                </p>
                <div className="support-card">
                  <h5 className="mb-3">Visit a community hub</h5>
                  <p className="text-muted">
                    Schedule a visit to see our learning spaces, meet families, and
                    explore partnership opportunities.
                  </p>
                  <ul className="list-unstyled text-muted">
                    <li className="mb-2"> Mondays - Fridays, 9am - 5pm</li>
                    <li className="mb-2">Guided tours for partners</li>
                    <li className="mb-2">Volunteer orientation every Friday</li>
                  </ul>
                  <button className="btn btn-outline-light btn-sm">Book a visit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
