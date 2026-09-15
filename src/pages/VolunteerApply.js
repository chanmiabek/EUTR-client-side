import React, { useState } from "react";
import { postJson } from "../utils/api";

const initialForm = { name: "", email: "", phone: "", role: "Learning Circle Facilitator", availability: "", message: "" };

function VolunteerApply() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const handleChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  const handleSubmit = async (event) => {
    event.preventDefault(); setSubmitting(true); setStatus({ type: "idle", message: "" });
    try {
      const response = await postJson("/api/volunteer", { fullName: form.name, emailAddress: form.email, phone: form.phone, volunteerRole: form.role, availability: form.availability, motivation: form.message });
      if (!response.ok) throw new Error();
      setStatus({ type: "success", message: "Volunteer request submitted." }); setForm(initialForm);
    } catch { setStatus({ type: "error", message: "Unable to submit volunteer request." }); }
    finally { setSubmitting(false); }
  };
  return <div>
    <section className="section section-tight"><div className="container"><div className="row gy-4"><div className="col-lg-8 mx-auto"><div className="section-title">Volunteer application</div><h1 className="section-heading mb-4">Start your volunteer journey.</h1><form className="support-card" onSubmit={handleSubmit}>
      <h4 className="mb-3">Volunteer application</h4>
      <div className="row gy-3">
        <div className="col-12"><label className="form-label">Full name</label><input required className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Your name" /></div>
        <div className="col-md-6"><label className="form-label">Email</label><input required type="email" className="form-control" name="email" value={form.email} onChange={handleChange} placeholder="Email address" /></div>
        <div className="col-md-6"><label className="form-label">Phone</label><input className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="+254..." /></div>
        <div className="col-12"><label className="form-label">Role interest</label><select className="form-select" name="role" value={form.role} onChange={handleChange}><option>Learning Circle Facilitator</option><option>Youth Mentor</option><option>Skills Workshop Partner</option><option>Community Outreach</option></select></div>
        <div className="col-12"><label className="form-label">Availability</label><input className="form-control" name="availability" value={form.availability} onChange={handleChange} placeholder="Weekends, evenings, etc." /></div>
        <div className="col-12"><label className="form-label">Message</label><textarea className="form-control" name="message" value={form.message} onChange={handleChange} rows="5" placeholder="Tell us about your experience" /></div>
        <div className="col-12"><button className="btn btn-accent" type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit application"}</button>{status.type !== "idle" && <small className={`${status.type === "success" ? "text-success" : "text-danger"} d-block mt-2`}>{status.message}</small>}</div>
      </div>
    </form></div></div></div></section>
  </div>;
}

export default VolunteerApply;
