import React, { useState } from "react";
import PageHero from "../components/PageHero";
import heroImage from "../assets/hero.jpeg";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  role: "Learning Circle Facilitator",
  availability: "",
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

function Volunteer() {
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
      const response = await fetch("/api/volunteer/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRFToken": csrfToken } : {})
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("Volunteer request failed.");
      }

      setStatus({ type: "success", message: "Volunteer request submitted." });
      setForm(initialForm);
    } catch (error) {
      setStatus({ type: "error", message: "Unable to submit volunteer request." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHero
        eyebrow="Volunteer"
        title="Give your time. Grow alongside the community."
        copy="Mentors, coaches, and facilitators are the heartbeat of EUTR."
        backgroundImage={heroImage}
        backgroundAlt="Volunteer hero"
      >
        <h5 className="mb-3">Volunteer roles</h5>
        <ul className="list-unstyled text-muted">
          <li className="mb-2">Learning circle facilitator</li>
          <li className="mb-2"> Youth mentor</li>
          <li className="mb-2"> Skills workshop partner</li>
        </ul>
        <button className="btn btn-accent">Apply to volunteer</button>
      </PageHero>

      <section className="section section-tight">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6">
              <form className="support-card" onSubmit={handleSubmit}>
                <h4 className="mb-3">Volunteer application</h4>
                <div className="row gy-3">
                  <div className="col-12">
                    <label className="form-label">Full name</label>
                    <input
                      className="form-control"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email address"
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
                  <div className="col-12">
                    <label className="form-label">Role interest</label>
                    <select
                      className="form-select"
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                    >
                      <option>Learning Circle Facilitator</option>
                      <option>Youth Mentor</option>
                      <option>Skills Workshop Partner</option>
                      <option>Community Outreach</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Availability</label>
                    <input
                      className="form-control"
                      name="availability"
                      value={form.availability}
                      onChange={handleChange}
                      placeholder="Weekends, evenings, etc."
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
                      placeholder="Tell us about your experience"
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <button className="btn btn-accent w-100" type="submit" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit application"}
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
                    
                  </div>
                </div>
              </form>
            </div>
            <div className="col-lg-6">
              <div className="support-card">
                <h4>Training</h4>
                <p className="text-muted">
                  We provide orientation, facilitation tools, and ongoing coaching.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Volunteer;
