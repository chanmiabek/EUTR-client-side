import React, { useEffect, useState } from "react";
import { getApiUrl } from "../utils/api";
import hero from "../assets/hero.jpeg";
import gallery1 from "../assets/gallery-1.jpeg";
import gallery2 from "../assets/gallery-2.jpeg";
import gallery3 from "../assets/gallery-3.jpeg";
import EventOverviewVideoSection from "../components/EventOverviewVideoSection";

const fallbackPrograms = [
  {
    title: "Early Learning Foundations",
    copy:
      "We nurture children from age three and up with strong early childhood education, giving them the skills and confidence they need before primary school.",
    focus: "School readiness",
    status: "Active",
    beneficiaries: "Children ages 3+"
  },
  {
    title: "Education Retention and Policy",
    copy:
      "We champion policies that keep children in school and rebuild foundational learning programs so every child stays on the path to success.",
    focus: "Access and equity",
    status: "Active",
    beneficiaries: "Learners at risk of dropping out"
  },
  {
    title: "Arts and Crafts Livelihoods",
    copy:
      "In Kakuma Refugee Camp, we empower women through design, crochet, and beadwork training that creates income and restores dignity.",
    focus: "Women-led enterprise",
    status: "Open enrollment",
    beneficiaries: "Women-led households"
  }
];

const fallbackEvents = [
  {
    title: "Back-to-School Learning Fair",
    date: "2026-03-20",
    location: "Kakuma Learning Hub",
    tag: "Education",
    description:
      "Enrollment support, learning kits, and parent orientation for early learners."
  },
  {
    title: "Women in Artistry Showcase",
    date: "2026-04-12",
    location: "Community Market Hall",
    tag: "Livelihoods",
    description:
      "A celebration of crochet, beadwork, and design led by refugee and host women."
  },
  {
    title: "Family Unity Dialogue",
    date: "2026-05-08",
    location: "EUTR Community Center",
    tag: "Community",
    description:
      "A public conversation on coexistence, respect, and child protection."
  }
];

const fallbackProjects = [
  {
    title: "Community Learning Labs",
    copy:
      "After-school learning hubs with tutoring, tech access, and mentorship.",
    tag: "Education"
  },
  {
    title: "Safe Homes Network",
    copy:
      "Emergency protection, family coaching, and referrals for at-risk youth.",
    tag: "Protection"
  },
  {
    title: "Women in Enterprise",
    copy: "Savings circles, micro-grants, and business training for caregivers.",
    tag: "Livelihoods"
  }
];

const normalizeEvents = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

const normalizePrograms = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

const formatProgram = (program) => ({
  title: program?.title || "Program",
  copy: program?.copy || program?.description || "Program details coming soon.",
  focus: program?.focus || program?.category || "Community program",
  status: program?.status || "Active",
  beneficiaries: program?.beneficiaries || program?.target_group || "Community members"
});

function Home() {
  const [programs, setPrograms] = useState(fallbackPrograms);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [events, setEvents] = useState(fallbackEvents);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadPrograms = async () => {
      try {
        const response = await fetch(getApiUrl("/api/programs/"));
        if (!response.ok) throw new Error("Failed to load programs");
        const data = await response.json();
        const normalized = normalizePrograms(data);
        if (isMounted && normalized.length) {
          setPrograms(normalized.map(formatProgram));
        }
      } catch (error) {
        if (isMounted) {
          setPrograms(fallbackPrograms);
        }
      } finally {
        if (isMounted) {
          setProgramsLoading(false);
        }
      }
    };

    const loadEvents = async () => {
      try {
        const response = await fetch(getApiUrl("/api/events/"));
        if (!response.ok) throw new Error("Failed to load events");
        const data = await response.json();
        const normalized = normalizeEvents(data);
        if (isMounted && normalized.length) {
          setEvents(normalized);
        }
      } catch (error) {
        if (isMounted) {
          setEvents(fallbackEvents);
        }
      } finally {
        if (isMounted) {
          setEventsLoading(false);
        }
      }
    };

    loadPrograms();
    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <section className="hero">
        <img className="hero-bg" src={hero} alt="Community gathering" />
        <div className="container hero-content">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7 section-reveal">
              <div className="badge-pill mb-3">Educate Us To Rise</div>
              <h1 className="hero-title">
                Educate a child today. Empower a generation tomorrow.
              </h1>
              <p className="hero-copy">
                We nurture young minds from age three and above, building the
                knowledge, skills, and confidence children need to thrive.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <button className="btn btn-accent">Donate Now</button>
                <button className="btn btn-outline-light">Join the Movement</button>
              </div>
            </div>
            <div className="col-lg-5 section-reveal delay-1">
              <div className="hero-card">
                <h5>Today at Educate Us To Rise</h5>
                <p className="text-muted">
                  Early learning circles, women-led enterprise, and community
                  protection programs are active across our neighborhoods.
                </p>
                <div className="stats-grid">
                  <div>
                    <div className="text-muted">Learners</div>
                    <div className="fs-3 fw-bold">620+</div>
                  </div>
                  <div>
                    <div className="text-muted">Women Reached</div>
                    <div className="fs-3 fw-bold">310</div>
                  </div>
                  <div>
                    <div className="text-muted">Projects</div>
                    <div className="fs-3 fw-bold">32</div>
                  </div>
                  <div>
                    <div className="text-muted">Communities</div>
                    <div className="fs-3 fw-bold">9</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6 section-reveal">
              <div className="section-title">Our Mission</div>
              <h2 className="section-heading">
                Strong foundations for every child.
              </h2>
              <p className="section-copy">
                Educate Us To Rise prepares children before primary school and
                advocates for policies that keep every child in class. We build
                safe learning spaces, strengthen foundational skills, and
                cultivate unity and mutual respect.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <div className="icon-circle">01</div>
                <div>
                  <h5>Early Childhood Learning</h5>
                  <p className="text-muted">
                    Play-based instruction, literacy, and numeracy for ages 3+.
                  </p>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-3 mt-3">
                <div className="icon-circle">02</div>
                <div>
                  <h5>School Retention</h5>
                  <p className="text-muted">
                    Community advocacy that keeps children learning and thriving.
                  </p>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-3 mt-3">
                <div className="icon-circle">03</div>
                <div>
                  <h5>Coexistence and Care</h5>
                  <p className="text-muted">
                    Values of unity, respect, and shared responsibility.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 section-reveal delay-1">
              <div className="image-stack">
                <img src={gallery1} alt="Learning circle" />
                <img src={gallery2} alt="Community celebration" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-5 section-reveal">
              <div className="section-title">Pathway</div>
              <h2 className="section-heading">A learning journey that lasts.</h2>
              <p className="section-copy">
                From early childhood support to youth leadership and family
                enterprise, we build pathways to opportunity.
              </p>
            </div>
            <div className="col-lg-7 section-reveal delay-1">
              <div className="glow-card">
                <div className="row gy-3">
                  {[
                    {
                      step: "01",
                      title: "Foundation",
                      copy: "Play-based learning, tutoring, and caregiver support."
                    },
                    {
                      step: "02",
                      title: "Retention",
                      copy: "Community advocacy to keep children in school."
                    },
                    {
                      step: "03",
                      title: "Leadership",
                      copy: "Mentorship, guidance, and youth participation."
                    },
                    {
                      step: "04",
                      title: "Livelihoods",
                      copy: "Arts, crafts, and enterprise for women-led households."
                    }
                  ].map((item) => (
                    <div className="col-md-6" key={item.step}>
                      <div className="d-flex gap-3">
                        <div className="icon-circle">{item.step}</div>
                        <div>
                          <h5>{item.title}</h5>
                          <p className="text-muted mb-0">{item.copy}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-6 section-reveal">
              <div className="section-title">Impact</div>
              <h2 className="section-heading">Community impact at a glance.</h2>
              <p className="section-copy">
                Measured progress, real stories, and shared accountability.
              </p>
              <div className="stats-grid mt-4">
                {[
                  { value: "1,200+", label: "Meals served" },
                  { value: "480", label: "Girls in school" },
                  { value: "95%", label: "Retention rate" },
                  { value: "210", label: "Families supported" }
                ].map((stat) => (
                  <div className="stat-card" key={stat.label}>
                    <h3>{stat.value}</h3>
                    <p className="text-muted mb-0">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-6 section-reveal delay-1">
              <img
                src={gallery3}
                alt="Community session"
                style={{ borderRadius: "28px", border: "1px solid var(--border)" }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-5 section-reveal">
              <div className="section-title">Projects</div>
              <h2 className="section-heading">Current projects in motion.</h2>
              <p className="section-copy">
                Co-led with local partners, each project removes barriers to
                learning, safety, and economic stability.
              </p>
              <button className="btn btn-outline-light btn-sm">
                View all projects
              </button>
            </div>
            <div className="col-lg-7 section-reveal delay-1">
              <div className="row gy-3">
                {fallbackProjects.map((project) => (
                  <div className="col-md-12" key={project.title}>
                    <div className="project-card">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="badge-pill mb-2">{project.tag}</div>
                          <h5>{project.title}</h5>
                          <p className="text-muted mb-0">{project.copy}</p>
                        </div>
                        <div className="icon-circle">-&gt;</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="programs" className="section section-tight">
        <div className="container">
          <div className="row align-items-center gy-4 mb-4">
            <div className="col-lg-6 section-reveal">
              <div className="section-title">Programs</div>
              <h2 className="section-heading">Programs that build futures.</h2>
              <p className="section-copy">
                We respond to the realities on the ground with programs that
                prepare children for school, empower women, and strengthen
                community resilience.
              </p>
            </div>
            <div className="col-lg-6 section-reveal delay-1">
              <img
                src={gallery1}
                alt="Learning program"
                className="program-hero"
              />
            </div>
          </div>
          <div className="row gy-4">
            {programsLoading && (
              <p className="text-muted">Loading programs...</p>
            )}
            {programs.map((program, index) => (
              <div className="col-md-4 section-reveal" key={`${program.title}-${index}`}>
                <div className="program-card">
                  <div className="badge-pill mb-3">{program.focus}</div>
                  <h4>{program.title}</h4>
                  <p className="text-muted">{program.copy}</p>
                  <p className="text-muted mb-2">
                    <strong>Status:</strong> {program.status}
                  </p>
                  <p className="text-muted mb-3">
                    <strong>Who it serves:</strong> {program.beneficiaries}
                  </p>
                  <button className="btn btn-outline-light btn-sm">
                    Learn more
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="events-panel mt-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
              <div>
                <div className="section-title">Events</div>
                <h3 className="section-heading">Community gatherings and workshops.</h3>
                <p className="text-muted mb-0">
                  Upcoming activities are managed through our events calendar and
                  can be updated from the backend.
                </p>
              </div>
              <button className="btn btn-accent btn-sm">View calendar</button>
            </div>
            {eventsLoading && (
              <p className="text-muted">Loading events...</p>
            )}
            <div className="row gy-3">
              {events.map((event, index) => (
                <div className="col-lg-4" key={`${event.title}-${index}`}>
                  <div className="event-card">
                    <div className="event-tag">{event.tag}</div>
                    <h5>{event.title}</h5>
                    <div className="event-meta">
                      <span>{event.date}</span>
                      <span>{event.location}</span>
                    </div>
                    <p className="text-muted mb-0">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <EventOverviewVideoSection className="section" />

      <section className="section section-tight">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-6 section-reveal">
              <div className="section-title">Donate</div>
              <h2 className="section-heading">Your gift fuels learning and care.</h2>
              <p className="section-copy">
                Every contribution supports families, empowers youth, and keeps
                learning hubs running.
              </p>
              <button className="btn btn-accent">Give today</button>
            </div>
            <div className="col-lg-6 section-reveal delay-1">
              <div className="glow-card">
                <div className="row gy-3">
                  {[
                    { amount: "$30", label: "Learning kit" },
                    { amount: "$75", label: "Wellness visit" },
                    { amount: "$150", label: "Mentorship month" },
                    { amount: "$300", label: "Community hub day" }
                  ].map((item) => (
                    <div className="col-6" key={item.label}>
                      <div className="stat-card">
                        <h3>{item.amount}</h3>
                        <p className="text-muted mb-0">{item.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="row gy-4">
            {[
              {
                title: "Partner with EUTR",
                copy: "Bring resources, expertise, and shared vision."
              },
              {
                title: "Volunteer",
                copy: "Mentor, coach, or co-create programs with us."
              },
              {
                title: "Donate",
                copy: "Fund a scholarship or power a community hub."
              }
            ].map((item) => (
              <div className="col-md-4 section-reveal" key={item.title}>
                <div className="support-card">
                  <h4>{item.title}</h4>
                  <p className="text-muted">{item.copy}</p>
                  <button className="btn btn-outline-light btn-sm">
                    Get started
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="newsletter section-reveal">
            <div className="row align-items-center gy-3">
              <div className="col-lg-7">
                <h3>Stay connected to Educate Us To Rise.</h3>
                <p className="text-muted">
                  Monthly updates, volunteer opportunities, and impact reports.
                </p>
              </div>
              <div className="col-lg-5">
                <div className="input-group">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email address"
                  />
                  <button className="btn btn-accent" type="button">
                    Subscribe
                  </button>
                </div>
                <small className="text-muted d-block mt-2">
                  We respect your privacy. Unsubscribe anytime.
                </small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;


