import React, { useState } from "react";
import PageHero from "../components/PageHero";
import { getApiUrl } from "../utils/api";

const initialForm = {
  organization_name: "",
  contact_name: "",
  email: "",
  phone: "",
  preferred_date: "",
  preferred_time: "",
  topic: "",
  message: ""
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return "";
};

function WorkWithEurt() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });

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
      const response = await fetch(getApiUrl("/api/partner-appointments/"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRFToken": csrfToken } : {})
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("Booking request failed.");
      }

      setStatus({
        type: "success",
        message: "Appointment request submitted. Check your email for confirmation."
      });
      setForm(initialForm);
    } catch (error) {
      setStatus({ type: "error", message: "Unable to submit booking request." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHero
        eyebrow="Work with EURT"
        title="Collaborate on community-driven solutions."
        copy="We partner with NGOs, schools, and businesses to expand our impact."
      >
        <h5 className="mb-3">Partnership focus</h5>
        <p className="text-muted">
          Program co-design, training support, and community activation.
        </p>
        <button className="btn btn-outline-light btn-sm">Start a partnership</button>
      </PageHero>

      <section className="section section-tight">
        <div className="container">
          <div className="row gy-4">
            {[
              {
                title: "Education Partners",
                copy: "Support learning labs, mentorship, and school readiness."
              },
              {
                title: "Health & Protection",
                copy: "Strengthen referral networks and trauma-informed care."
              },
              {
                title: "Economic Growth",
                copy: "Invest in skills training and market access programs."
              }
            ].map((item) => (
              <div className="col-md-4" key={item.title}>
                <div className="program-card">
                  <h4>{item.title}</h4>
                  <p className="text-muted">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="row gy-4 mt-2">
            <div className="col-lg-8">
              <form className="support-card" onSubmit={handleSubmit}>
                <h4 className="mb-3">Book a Partnership Appointment</h4>
                <div className="row gy-3">
                  <div className="col-md-6">
                    <label className="form-label">Organization</label>
                    <input
                      className="form-control"
                      name="organization_name"
                      value={form.organization_name}
                      onChange={handleChange}
                      placeholder="Organization name"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Contact Person</label>
                    <input
                      className="form-control"
                      name="contact_name"
                      value={form.contact_name}
                      onChange={handleChange}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="name@organization.org"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-control"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+254..."
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Preferred Date</label>
                    <input
                      className="form-control"
                      name="preferred_date"
                      type="date"
                      value={form.preferred_date}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Preferred Time</label>
                    <input
                      className="form-control"
                      name="preferred_time"
                      value={form.preferred_time}
                      onChange={handleChange}
                      placeholder="10:00 AM - 12:00 PM"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Meeting Topic</label>
                    <input
                      className="form-control"
                      name="topic"
                      value={form.topic}
                      onChange={handleChange}
                      placeholder="Program co-design / funding / collaboration"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-control"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Share your appointment goals"
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <button className="btn btn-accent" type="submit" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Booking"}
                    </button>
                    {status.type === "success" && (
                      <small className="text-success d-block mt-2">{status.message}</small>
                    )}
                    {status.type === "error" && (
                      <small className="text-danger d-block mt-2">{status.message}</small>
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

export default WorkWithEurt;
