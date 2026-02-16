import React, { useState } from "react";
import PageHero from "../components/PageHero";
import heroImage from "../assets/hero.jpeg";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  interest: "Community Fellow",
  startDate: "",
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

function JoinUs() {
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
      const response = await fetch("/api/join-us/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRFToken": csrfToken } : {})
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("Join request failed.");
      }

      setStatus({ type: "success", message: "Request submitted successfully." });
      setForm(initialForm);
    } catch (error) {
      setStatus({ type: "error", message: "Unable to submit request." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHero
        eyebrow="Join Us"
        title="Become part of the EUTR family."
        copy="Work alongside local leaders to strengthen education, wellbeing, and opportunity."
        backgroundImage={heroImage}
        backgroundAlt="Join us hero"
      >
        <h5 className="mb-3">Open pathways</h5>
        <p className="text-muted">
          Internships, fellowships, and community fellow roles are available
          each quarter.
        </p>
        <button className="btn btn-outline-light btn-sm">View openings</button>
      </PageHero>

      <section className="section section-tight">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6">
              <form className="support-card" onSubmit={handleSubmit}>
                <h4 className="mb-3">Join the team</h4>
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
                    <label className="form-label">Interested role</label>
                    <select
                      className="form-select"
                      name="interest"
                      value={form.interest}
                      onChange={handleChange}
                    >
                      <option>Community Fellow</option>
                      <option>Program Coordinator</option>
                      <option>Storyteller</option>
                      <option>Operations Support</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Preferred start date</label>
                    <input
                      className="form-control"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      placeholder="2026-05-01"
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
                      {submitting ? "Submitting..." : "Submit request"}
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
              <div className="program-card">
                <h4>Opportunities</h4>
                <p className="text-muted">
                  We recruit locally for program, operations, and storytelling
                  roles aligned to community impact.
                </p>
               
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default JoinUs;
