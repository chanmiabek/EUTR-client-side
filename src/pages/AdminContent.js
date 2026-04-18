import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import PageHero from "../components/PageHero";
import heroImage from "../assets/hero.jpeg";
import {
  deleteJson,
  getApiUrl,
  postFormData,
  putFormData,
  readApiError
} from "../utils/api";
import { readStoredSession, writeStoredSession } from "../utils/adminSession";

const initialTeamForm = { name: "", role: "", copy: "", image: "", imageFile: null };
const initialTestimonialForm = { name: "", role: "", quote: "", image: "", imageFile: null };
const initialVideoForm = { title: "", youtube_url: "", video_url: "", videoFile: null };
const initialProgramForm = {
  title: "",
  focus: "",
  status: "",
  beneficiaries: "",
  description: "",
  image: "",
  imageFile: null,
  highlights: ""
};
const initialEventForm = {
  title: "",
  date: "",
  location: "",
  tag: "",
  description: "",
  image: "",
  imageFile: null,
  highlights: ""
};
const initialPartnerForm = { name: "", link: "", logo_url: "", logoFile: null };

const resolveImageAsset = (item) => item?.image || item?.photo || item?.avatar || "";
const resolvePartnerAsset = (item) => item?.logo_url || item?.logo || item?.image || "";
const resolveVideoAsset = (item) => item?.video_url || item?.video || item?.file || item?.media || "";

const buildFormData = (values, fileField) => {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (key.endsWith("File")) return;
    if (value === undefined || value === null || value === "") return;
    formData.append(key, value);
  });

  if (fileField) {
    const file = values[`${fileField}File`];
    if (file instanceof File) {
      formData.append(fileField, file);
    }
  }

  return formData;
};

function AssetField({
  label,
  accept,
  fileName,
  currentAsset,
  assetType = "image",
  urlLabel,
  urlValue,
  onUrlChange,
  onFileChange,
  placeholder
}) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input className="form-control" type="file" accept={accept} onChange={onFileChange} />
      <small className="text-muted d-block mt-2">
        {fileName ? `Selected file: ${fileName}` : "No file selected yet."}
      </small>
      {currentAsset && (
        <div className="admin-asset-preview mt-3">
          {assetType === "video" ? (
            <video className="admin-asset-preview-media" src={currentAsset} controls preload="metadata" />
          ) : (
            <img className="admin-asset-preview-media" src={currentAsset} alt={label} />
          )}
        </div>
      )}
      <label className="form-label mt-3">{urlLabel}</label>
      <input
        className="form-control"
        value={urlValue}
        onChange={onUrlChange}
        placeholder={placeholder}
      />
    </div>
  );
}

function AdminContent() {
  const [session, setSession] = useState(() => (typeof window !== "undefined" ? readStoredSession() : null));
  const [team, setTeam] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [events, setEvents] = useState([]);
  const [partners, setPartners] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [video, setVideo] = useState(initialVideoForm);
  const [programForm, setProgramForm] = useState(initialProgramForm);
  const [eventForm, setEventForm] = useState(initialEventForm);
  const [partnerForm, setPartnerForm] = useState(initialPartnerForm);
  const [teamForm, setTeamForm] = useState(initialTeamForm);
  const [testimonialForm, setTestimonialForm] = useState(initialTestimonialForm);
  const [programEditingId, setProgramEditingId] = useState("");
  const [eventEditingId, setEventEditingId] = useState("");
  const [partnerEditingId, setPartnerEditingId] = useState("");
  const [teamEditingId, setTeamEditingId] = useState("");
  const [testimonialEditingId, setTestimonialEditingId] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const adminHeaders = session?.token ? { Authorization: `Bearer ${session.token}` } : {};
  const setMessage = (type, message) => setStatus({ type, message });

  const loadContent = useCallback(async () => {
    if (!session?.token) return;
    setLoading(true);
    try {
      const [programResponse, eventResponse, teamResponse, partnerResponse, testimonialResponse, videoResponse] = await Promise.all([
        fetch(getApiUrl("/api/programs/")),
        fetch(getApiUrl("/api/events/")),
        fetch(getApiUrl("/api/team/")),
        fetch(getApiUrl("/api/partners/")),
        fetch(getApiUrl("/api/testimonials/")),
        fetch(getApiUrl("/api/event-overview-video/"))
      ]);

      const programData = programResponse.ok ? await programResponse.json() : [];
      const eventData = eventResponse.ok ? await eventResponse.json() : [];
      const teamData = teamResponse.ok ? await teamResponse.json() : [];
      const partnerData = partnerResponse.ok ? await partnerResponse.json() : [];
      const testimonialData = testimonialResponse.ok ? await testimonialResponse.json() : [];
      const videoData = videoResponse.ok ? await videoResponse.json() : initialVideoForm;

      setPrograms(Array.isArray(programData) ? programData : programData?.results || []);
      setEvents(Array.isArray(eventData) ? eventData : eventData?.results || []);
      setTeam(Array.isArray(teamData) ? teamData : teamData?.results || []);
      setPartners(Array.isArray(partnerData) ? partnerData : partnerData?.results || []);
      setTestimonials(Array.isArray(testimonialData) ? testimonialData : testimonialData?.results || []);
      setVideo({
        title: videoData?.title || "",
        youtube_url: videoData?.youtube_url || "",
        video_url: resolveVideoAsset(videoData),
        videoFile: null
      });
    } catch {
      setMessage("error", "Unable to load admin content.");
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const toLines = (value) => (Array.isArray(value) ? value.join("\n") : String(value || ""));

  const storeSession = (nextSession) => {
    setSession(nextSession);
    writeStoredSession(nextSession);
  };

  useEffect(() => {
    if (!session?.expiresAt) return undefined;

    const timeout = window.setTimeout(() => {
      storeSession(null);
      setMessage("error", "Your admin session expired. Please log in again.");
    }, Math.max(session.expiresAt - Date.now(), 0));

    return () => window.clearTimeout(timeout);
  }, [session]);

  const handleLogout = () => {
    storeSession(null);
    setStatus({ type: "success", message: "Logged out successfully." });
  };

  const saveRequest = async (requestPromise, successMessage, resetter) => {
    try {
      const response = await requestPromise;
      if (!response.ok) throw new Error(await readApiError(response));
      if (resetter) resetter();
      setMessage("success", successMessage);
      await loadContent();
    } catch (error) {
      setMessage("error", error.message || "Request failed.");
    }
  };

  const handleProgramSubmit = async (event) => {
    event.preventDefault();
    const payload = buildFormData(programForm, "image");
    await saveRequest(
      programEditingId
        ? putFormData(`/api/programs/${programEditingId}`, payload, { headers: adminHeaders })
        : postFormData("/api/programs", payload, { headers: adminHeaders }),
      programEditingId ? "Program updated." : "Program added.",
      () => {
        setProgramEditingId("");
        setProgramForm(initialProgramForm);
      }
    );
  };

  const handleEventSubmit = async (event) => {
    event.preventDefault();
    const payload = buildFormData(eventForm, "image");
    await saveRequest(
      eventEditingId
        ? putFormData(`/api/events/${eventEditingId}`, payload, { headers: adminHeaders })
        : postFormData("/api/events", payload, { headers: adminHeaders }),
      eventEditingId ? "Event updated." : "Event added.",
      () => {
        setEventEditingId("");
        setEventForm(initialEventForm);
      }
    );
  };

  const handlePartnerSubmit = async (event) => {
    event.preventDefault();
    const payload = buildFormData(partnerForm, "logo");
    await saveRequest(
      partnerEditingId
        ? putFormData(`/api/admin/partners/${partnerEditingId}`, payload, { headers: adminHeaders })
        : postFormData("/api/admin/partners", payload, { headers: adminHeaders }),
      partnerEditingId ? "Partner updated." : "Partner added.",
      () => {
        setPartnerEditingId("");
        setPartnerForm(initialPartnerForm);
      }
    );
  };

  const handleTeamSubmit = async (event) => {
    event.preventDefault();
    const payload = buildFormData(teamForm, "image");
    await saveRequest(
      teamEditingId
        ? putFormData(`/api/admin/team/${teamEditingId}`, payload, { headers: adminHeaders })
        : postFormData("/api/admin/team", payload, { headers: adminHeaders }),
      teamEditingId ? "Team member updated." : "Team member added.",
      () => {
        setTeamEditingId("");
        setTeamForm(initialTeamForm);
      }
    );
  };

  const handleTestimonialSubmit = async (event) => {
    event.preventDefault();
    const payload = buildFormData(testimonialForm, "image");
    await saveRequest(
      testimonialEditingId
        ? putFormData(`/api/admin/testimonials/${testimonialEditingId}`, payload, { headers: adminHeaders })
        : postFormData("/api/admin/testimonials", payload, { headers: adminHeaders }),
      testimonialEditingId ? "Testimonial updated." : "Testimonial added.",
      () => {
        setTestimonialEditingId("");
        setTestimonialForm(initialTestimonialForm);
      }
    );
  };

  const handleVideoSubmit = async (event) => {
    event.preventDefault();
    const payload = buildFormData(video, "video");
    await saveRequest(
      putFormData("/api/admin/event-overview-video", payload, { headers: adminHeaders }),
      "Event overview video updated."
    );
  };

  const handleDelete = async (path, successMessage) => {
    await saveRequest(deleteJson(path, { headers: adminHeaders }), successMessage);
  };

  if (!session?.token) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div>
      <PageHero
        eyebrow="Admin"
        title="Manage site content from one place."
        copy="Update programs, events, partners, team members, testimonials, and the event overview video."
        backgroundImage={heroImage}
        backgroundAlt="Admin dashboard hero"
      >
        <h5 className="mb-3">Admin dashboard</h5>
        <p className="text-muted mb-3">You are signed in. This page stays hidden from the main navbar.</p>
        <button className="btn btn-outline-light btn-sm" type="button" onClick={handleLogout}>
          Logout
        </button>
      </PageHero>

      <section className="section section-tight">
        <div className="container">
          <div className="support-card mb-4 admin-session-bar">
            <div>
              <strong>{session?.user?.name || "Admin session"}</strong>
              <div className="text-muted">
                Signed in as {session?.user?.email || "admin"}.
                {session?.expiresAt ? ` Session ends at ${new Date(session.expiresAt).toLocaleTimeString()}.` : ""}
              </div>
            </div>
            <button className="btn btn-outline-light btn-sm" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>

          {status.message && (
            <div className="support-card mb-4">
              <small className={`${status.type === "error" ? "text-danger" : "text-success"}`}>{status.message}</small>
            </div>
          )}

          {loading && <p className="text-muted">Loading admin content...</p>}

          <div className="row gy-4">
            <div className="col-lg-6">
              <div className="support-card h-100">
                <h4 className="mb-3">{programEditingId ? "Edit program" : "Add program"}</h4>
                <form onSubmit={handleProgramSubmit}>
                  <div className="mb-3"><label className="form-label">Title</label><input className="form-control" value={programForm.title} onChange={(event) => setProgramForm((prev) => ({ ...prev, title: event.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Focus</label><input className="form-control" value={programForm.focus} onChange={(event) => setProgramForm((prev) => ({ ...prev, focus: event.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Status</label><input className="form-control" value={programForm.status} onChange={(event) => setProgramForm((prev) => ({ ...prev, status: event.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Beneficiaries</label><input className="form-control" value={programForm.beneficiaries} onChange={(event) => setProgramForm((prev) => ({ ...prev, beneficiaries: event.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" rows="4" value={programForm.description} onChange={(event) => setProgramForm((prev) => ({ ...prev, description: event.target.value }))} /></div>
                  <AssetField
                    label="Program image"
                    accept="image/*"
                    fileName={programForm.imageFile?.name}
                    currentAsset={programForm.image}
                    urlLabel="Image URL fallback"
                    urlValue={programForm.image}
                    onUrlChange={(event) => setProgramForm((prev) => ({ ...prev, image: event.target.value }))}
                    onFileChange={(event) => setProgramForm((prev) => ({ ...prev, imageFile: event.target.files?.[0] || null }))}
                    placeholder="https://example.com/program.jpg"
                  />
                  <div className="mb-3"><label className="form-label">Highlights</label><textarea className="form-control" rows="4" value={programForm.highlights} onChange={(event) => setProgramForm((prev) => ({ ...prev, highlights: event.target.value }))} placeholder="One per line" /></div>
                  <div className="d-flex gap-2 flex-wrap">
                    <button className="btn btn-accent" type="submit">{programEditingId ? "Update program" : "Add program"}</button>
                    {programEditingId && <button className="btn btn-outline-light" type="button" onClick={() => { setProgramEditingId(""); setProgramForm(initialProgramForm); }}>Cancel</button>}
                  </div>
                </form>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="support-card h-100">
                <h4 className="mb-3">Current programs</h4>
                <div className="admin-list">
                  {programs.map((item) => (
                    <div className="admin-list-card" key={item.id || item.title}>
                      <div>
                        <strong>{item.title}</strong>
                        <div className="text-muted">{item.focus}</div>
                        <small className="text-muted d-block mb-2">{item.description || item.copy}</small>
                        <small className="text-muted">{resolveImageAsset(item) ? "Image attached" : "No image yet"}</small>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-light btn-sm" type="button" onClick={() => { setProgramEditingId(item.id); setProgramForm({ title: item.title || "", focus: item.focus || "", status: item.status || "", beneficiaries: item.beneficiaries || "", description: item.description || item.copy || "", image: resolveImageAsset(item), imageFile: null, highlights: toLines(item.highlights) }); }}>Edit</button>
                        <button className="btn btn-outline-light btn-sm" type="button" onClick={() => handleDelete(`/api/programs/${item.id}`, "Program deleted.")}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="support-card h-100">
                <h4 className="mb-3">{eventEditingId ? "Edit event" : "Add event"}</h4>
                <form onSubmit={handleEventSubmit}>
                  <div className="mb-3"><label className="form-label">Title</label><input className="form-control" value={eventForm.title} onChange={(event) => setEventForm((prev) => ({ ...prev, title: event.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Date</label><input className="form-control" value={eventForm.date} onChange={(event) => setEventForm((prev) => ({ ...prev, date: event.target.value }))} placeholder="2026-05-08" /></div>
                  <div className="mb-3"><label className="form-label">Location</label><input className="form-control" value={eventForm.location} onChange={(event) => setEventForm((prev) => ({ ...prev, location: event.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Tag</label><input className="form-control" value={eventForm.tag} onChange={(event) => setEventForm((prev) => ({ ...prev, tag: event.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" rows="4" value={eventForm.description} onChange={(event) => setEventForm((prev) => ({ ...prev, description: event.target.value }))} /></div>
                  <AssetField
                    label="Event image"
                    accept="image/*"
                    fileName={eventForm.imageFile?.name}
                    currentAsset={eventForm.image}
                    urlLabel="Image URL fallback"
                    urlValue={eventForm.image}
                    onUrlChange={(event) => setEventForm((prev) => ({ ...prev, image: event.target.value }))}
                    onFileChange={(event) => setEventForm((prev) => ({ ...prev, imageFile: event.target.files?.[0] || null }))}
                    placeholder="https://example.com/event.jpg"
                  />
                  <div className="mb-3"><label className="form-label">Highlights</label><textarea className="form-control" rows="4" value={eventForm.highlights} onChange={(event) => setEventForm((prev) => ({ ...prev, highlights: event.target.value }))} placeholder="One per line" /></div>
                  <div className="d-flex gap-2 flex-wrap">
                    <button className="btn btn-accent" type="submit">{eventEditingId ? "Update event" : "Add event"}</button>
                    {eventEditingId && <button className="btn btn-outline-light" type="button" onClick={() => { setEventEditingId(""); setEventForm(initialEventForm); }}>Cancel</button>}
                  </div>
                </form>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="support-card h-100">
                <h4 className="mb-3">Current events</h4>
                <div className="admin-list">
                  {events.map((item) => (
                    <div className="admin-list-card" key={item.id || item.title}>
                      <div>
                        <strong>{item.title}</strong>
                        <div className="text-muted">{item.date} | {item.location}</div>
                        <small className="text-muted d-block mb-2">{item.description}</small>
                        <small className="text-muted">{resolveImageAsset(item) ? "Image attached" : "No image yet"}</small>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-light btn-sm" type="button" onClick={() => { setEventEditingId(item.id); setEventForm({ title: item.title || "", date: item.date || "", location: item.location || "", tag: item.tag || "", description: item.description || "", image: resolveImageAsset(item), imageFile: null, highlights: toLines(item.highlights) }); }}>Edit</button>
                        <button className="btn btn-outline-light btn-sm" type="button" onClick={() => handleDelete(`/api/events/${item.id}`, "Event deleted.")}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="support-card h-100">
                <h4 className="mb-3">{partnerEditingId ? "Edit partner" : "Add partner"}</h4>
                <form onSubmit={handlePartnerSubmit}>
                  <div className="mb-3"><label className="form-label">Name</label><input className="form-control" value={partnerForm.name} onChange={(event) => setPartnerForm((prev) => ({ ...prev, name: event.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Link</label><input className="form-control" value={partnerForm.link} onChange={(event) => setPartnerForm((prev) => ({ ...prev, link: event.target.value }))} /></div>
                  <AssetField
                    label="Partner logo"
                    accept="image/*"
                    fileName={partnerForm.logoFile?.name}
                    currentAsset={partnerForm.logo_url}
                    urlLabel="Logo URL fallback"
                    urlValue={partnerForm.logo_url}
                    onUrlChange={(event) => setPartnerForm((prev) => ({ ...prev, logo_url: event.target.value }))}
                    onFileChange={(event) => setPartnerForm((prev) => ({ ...prev, logoFile: event.target.files?.[0] || null }))}
                    placeholder="https://example.com/logo.png"
                  />
                  <div className="d-flex gap-2 flex-wrap">
                    <button className="btn btn-accent" type="submit">{partnerEditingId ? "Update partner" : "Add partner"}</button>
                    {partnerEditingId && <button className="btn btn-outline-light" type="button" onClick={() => { setPartnerEditingId(""); setPartnerForm(initialPartnerForm); }}>Cancel</button>}
                  </div>
                </form>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="support-card h-100">
                <h4 className="mb-3">Current partners</h4>
                <div className="admin-list">
                  {partners.map((item) => (
                    <div className="admin-list-card" key={item.id || item.name}>
                      <div>
                        <strong>{item.name}</strong>
                        <div className="text-muted">{item.link || "No link"}</div>
                        <small className="text-muted">{resolvePartnerAsset(item) ? "Logo attached" : "No logo yet"}</small>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-light btn-sm" type="button" onClick={() => { setPartnerEditingId(item.id); setPartnerForm({ name: item.name || "", link: item.link || "", logo_url: resolvePartnerAsset(item), logoFile: null }); }}>Edit</button>
                        <button className="btn btn-outline-light btn-sm" type="button" onClick={() => handleDelete(`/api/admin/partners/${item.id}`, "Partner deleted.")}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="support-card h-100">
                <h4 className="mb-3">{teamEditingId ? "Edit team member" : "Add team member"}</h4>
                <form onSubmit={handleTeamSubmit}>
                  <div className="mb-3"><label className="form-label">Name</label><input className="form-control" value={teamForm.name} onChange={(event) => setTeamForm((prev) => ({ ...prev, name: event.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Role</label><input className="form-control" value={teamForm.role} onChange={(event) => setTeamForm((prev) => ({ ...prev, role: event.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Bio</label><textarea className="form-control" rows="4" value={teamForm.copy} onChange={(event) => setTeamForm((prev) => ({ ...prev, copy: event.target.value }))} /></div>
                  <AssetField
                    label="Team profile image"
                    accept="image/*"
                    fileName={teamForm.imageFile?.name}
                    currentAsset={teamForm.image}
                    urlLabel="Image URL fallback"
                    urlValue={teamForm.image}
                    onUrlChange={(event) => setTeamForm((prev) => ({ ...prev, image: event.target.value }))}
                    onFileChange={(event) => setTeamForm((prev) => ({ ...prev, imageFile: event.target.files?.[0] || null }))}
                    placeholder="https://example.com/profile.jpg"
                  />
                  <div className="d-flex gap-2 flex-wrap">
                    <button className="btn btn-accent" type="submit">{teamEditingId ? "Update team member" : "Add team member"}</button>
                    {teamEditingId && <button className="btn btn-outline-light" type="button" onClick={() => { setTeamEditingId(""); setTeamForm(initialTeamForm); }}>Cancel</button>}
                  </div>
                </form>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="support-card h-100">
                <h4 className="mb-3">Current team</h4>
                <div className="admin-list">
                  {team.map((member) => (
                    <div className="admin-list-card" key={member.id || member.name}>
                      <div>
                        <strong>{member.name}</strong>
                        <div className="text-muted">{member.role}</div>
                        <small className="text-muted d-block mb-2">{member.copy}</small>
                        <small className="text-muted">{resolveImageAsset(member) ? "Profile image attached" : "No profile image yet"}</small>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-light btn-sm" type="button" onClick={() => { setTeamEditingId(member.id); setTeamForm({ name: member.name || "", role: member.role || "", copy: member.copy || "", image: resolveImageAsset(member), imageFile: null }); }}>Edit</button>
                        <button className="btn btn-outline-light btn-sm" type="button" onClick={() => handleDelete(`/api/admin/team/${member.id}`, "Team member deleted.")}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="support-card h-100">
                <h4 className="mb-3">{testimonialEditingId ? "Edit testimonial" : "Add testimonial"}</h4>
                <form onSubmit={handleTestimonialSubmit}>
                  <div className="mb-3"><label className="form-label">Name</label><input className="form-control" value={testimonialForm.name} onChange={(event) => setTestimonialForm((prev) => ({ ...prev, name: event.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Role</label><input className="form-control" value={testimonialForm.role} onChange={(event) => setTestimonialForm((prev) => ({ ...prev, role: event.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Quote</label><textarea className="form-control" rows="4" value={testimonialForm.quote} onChange={(event) => setTestimonialForm((prev) => ({ ...prev, quote: event.target.value }))} /></div>
                  <AssetField
                    label="Testimonial image"
                    accept="image/*"
                    fileName={testimonialForm.imageFile?.name}
                    currentAsset={testimonialForm.image}
                    urlLabel="Image URL fallback"
                    urlValue={testimonialForm.image}
                    onUrlChange={(event) => setTestimonialForm((prev) => ({ ...prev, image: event.target.value }))}
                    onFileChange={(event) => setTestimonialForm((prev) => ({ ...prev, imageFile: event.target.files?.[0] || null }))}
                    placeholder="https://example.com/testimonial.jpg"
                  />
                  <div className="d-flex gap-2 flex-wrap">
                    <button className="btn btn-accent" type="submit">{testimonialEditingId ? "Update testimonial" : "Add testimonial"}</button>
                    {testimonialEditingId && <button className="btn btn-outline-light" type="button" onClick={() => { setTestimonialEditingId(""); setTestimonialForm(initialTestimonialForm); }}>Cancel</button>}
                  </div>
                </form>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="support-card h-100">
                <h4 className="mb-3">Current testimonials</h4>
                <div className="admin-list">
                  {testimonials.map((item) => (
                    <div className="admin-list-card" key={item.id || `${item.name}-${item.role}`}>
                      <div>
                        <strong>{item.name}</strong>
                        <div className="text-muted">{item.role}</div>
                        <small className="text-muted d-block mb-2">{item.quote}</small>
                        <small className="text-muted">{resolveImageAsset(item) ? "Image attached" : "No image yet"}</small>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-light btn-sm" type="button" onClick={() => { setTestimonialEditingId(item.id); setTestimonialForm({ name: item.name || "", role: item.role || "", quote: item.quote || "", image: resolveImageAsset(item), imageFile: null }); }}>Edit</button>
                        <button className="btn btn-outline-light btn-sm" type="button" onClick={() => handleDelete(`/api/admin/testimonials/${item.id}`, "Testimonial deleted.")}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="support-card">
                <h4 className="mb-3">Event overview video</h4>
                <form onSubmit={handleVideoSubmit}>
                  <div className="row gy-3">
                    <div className="col-md-6"><label className="form-label">Title</label><input className="form-control" value={video.title} onChange={(event) => setVideo((prev) => ({ ...prev, title: event.target.value }))} /></div>
                    <div className="col-md-6"><label className="form-label">YouTube URL fallback</label><input className="form-control" value={video.youtube_url} onChange={(event) => setVideo((prev) => ({ ...prev, youtube_url: event.target.value }))} placeholder="https://youtube.com/watch?v=..." /></div>
                    <div className="col-12">
                      <AssetField
                        label="Upload event video"
                        accept="video/*"
                        fileName={video.videoFile?.name}
                        currentAsset={video.video_url}
                        assetType="video"
                        urlLabel="Hosted video URL fallback"
                        urlValue={video.video_url}
                        onUrlChange={(event) => setVideo((prev) => ({ ...prev, video_url: event.target.value }))}
                        onFileChange={(event) => setVideo((prev) => ({ ...prev, videoFile: event.target.files?.[0] || null }))}
                        placeholder="https://example.com/event-overview.mp4"
                      />
                    </div>
                    <div className="col-12"><button className="btn btn-accent" type="submit">Update event video</button></div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminContent;
