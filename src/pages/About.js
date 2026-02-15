import React, { useEffect, useState } from "react";
import gallery2 from "../assets/gallery-2.jpeg";
import aboutImage from "../assets/about.jpeg";

const fallbackTeam = [
  {
    name: "M.A. Malony",
    role: "Founder and Executive Director",
    initials: "MM",
    copy: "Leads the vision for early learning, equity, and community care."
  },
  {
    name: "Maggiso L.",
    role: "Programs Coordinator",
    initials: "ML",
    copy: "Coordinates learning circles and family engagement."
  },
  {
    name: "Linet Achieng",
    role: "Education Lead",
    initials: "LA",
    copy: "Strengthens foundational learning and teacher support."
  },
  {
    name: "Joseph Wanjala",
    role: "Community Partnerships",
    initials: "JW",
    copy: "Builds partnerships with schools and local leaders."
  },
  {
    name: "Rose Atieno",
    role: "Women in Enterprise",
    initials: "RA",
    copy: "Guides arts and crafts training for women-led households."
  },
  {
    name: "Peter Lomo",
    role: "Protection Officer",
    initials: "PL",
    copy: "Leads child protection, safeguarding, and referrals."
  },
  {
    name: "Grace Njeri",
    role: "Monitoring and Learning",
    initials: "GN",
    copy: "Tracks impact and shares evidence for better programs."
  }
];

const normalizeTeam = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

function About() {
  const [team, setTeam] = useState(fallbackTeam);
  const [teamLoading, setTeamLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadTeam = async () => {
      try {
        const response = await fetch("/api/team/");
        if (!response.ok) throw new Error("Failed to load team");
        const data = await response.json();
        const normalized = normalizeTeam(data);
        if (isMounted && normalized.length) {
          setTeam(normalized);
        }
      } catch (error) {
        if (isMounted) {
          setTeam(fallbackTeam);
        }
      } finally {
        if (isMounted) {
          setTeamLoading(false);
        }
      }
    };

    loadTeam();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <section className="hero about-hero">
        <img className="hero-bg" src={aboutImage} alt="EUTR community" />
        <div className="container hero-content">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7 section-reveal">
              <div className="badge-pill mb-3">About Educate Us To Rise</div>
              <h1 className="hero-title">
                Educate a child today. Empower a generation tomorrow.
              </h1>
              <p className="hero-copy">
                We are dedicated to nurturing young minds with the knowledge,
                skills, and confidence they need to thrive.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <button className="btn btn-accent">Download Profile</button>
                <button className="btn btn-outline-light">Join the Movement</button>
              </div>
            </div>
            <div className="col-lg-5 section-reveal delay-1">
              <div className="hero-card">
                <h5>What we believe</h5>
                <p className="text-muted">
                  Strong foundations in early childhood education unlock lifelong
                  success. We build learning programs that inspire curiosity,
                  unity, and mutual respect.
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
          <div className="row align-items-center gy-4">
            <div className="col-lg-6">
              <img
                src={gallery2}
                alt="Community leaders"
                style={{ borderRadius: "28px", border: "1px solid var(--border)" }}
              />
            </div>
            <div className="col-lg-6">
              <div className="section-title">Our Story</div>
              <h2 className="section-heading">Born from a passion for change.</h2>
              <p className="section-copy">
                Educate Us To Rise grew out of the challenges we witnessed every
                day: overcrowded classrooms, limited learning materials, and
                declining performance. We chose to act, building strong
                foundations before children enter primary school.
              </p>
              <ul className="list-unstyled text-muted">
                <li className="mb-2">Early learning support for ages 3 and above.</li>
                <li className="mb-2">Programs serving refugee and host communities.</li>
                <li className="mb-2">Community-led leadership and accountability.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6">
              <div className="glow-card">
                <div className="section-title">Mission</div>
                <h3>Build strong foundations for every child.</h3>
                <p className="text-muted mb-0">
                  We prepare children before primary school, strengthen
                  foundational learning, and protect the right of every child to
                  stay in school.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="glow-card">
                <div className="section-title">Vision</div>
                <h3>Communities that rise together.</h3>
                <p className="text-muted mb-0">
                  A generation of confident learners and resilient families
                  where education builds unity, dignity, and opportunity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cover-section">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <div className="cover-content">
                <div className="badge-pill">Programs</div>
                <h2 className="section-heading">Programs that build futures.</h2>
                <p className="cover-copy">
                  From early childhood learning to women-led enterprise, our
                  programs respond to real community needs with long-term
                  solutions.
                </p>
                <button className="btn btn-accent">Explore Programs</button>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="cover-card">
                <h5>Program Focus</h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">Early learning foundations</li>
                  <li className="mb-2">School retention support</li>
                  <li className="mb-2">Arts and crafts livelihoods</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cover-section cover-section-alt">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <div className="cover-content">
                <div className="badge-pill">Contact</div>
                <h2 className="section-heading">Talk with our team.</h2>
                <p className="cover-copy">
                  Reach out for partnerships, questions, or to learn how you can
                  support Educate Us To Rise.
                </p>
                <button className="btn btn-accent">Contact Us</button>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="cover-card">
                <h5>Get in touch</h5>
                <p className="text-muted mb-2">Kakuma, Kenya</p>
                <p className="text-muted mb-0">educateustorrise@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cover-section">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <div className="cover-content">
                <div className="badge-pill">Join Us</div>
                <h2 className="section-heading">Be part of the movement.</h2>
                <p className="cover-copy">
                  Volunteer, mentor, or collaborate with us to expand learning
                  opportunities for every child.
                </p>
                <button className="btn btn-accent">Join the Movement</button>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="cover-card">
                <h5>Ways to join</h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">Volunteer in learning hubs</li>
                  <li className="mb-2">Mentor youth leaders</li>
                  <li className="mb-2">Partner with programs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cover-section cover-section-alt">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <div className="cover-content">
                <div className="badge-pill">Donate</div>
                <h2 className="section-heading">Give today. Change tomorrow.</h2>
                <p className="cover-copy">
                  Your support keeps learning spaces open, supplies available,
                  and families supported year-round.
                </p>
                <button className="btn btn-accent">Donate Now</button>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="cover-card">
                <h5>Giving options</h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">$30 learning kit</li>
                  <li className="mb-2">$75 family support</li>
                  <li className="mb-2">$150 mentorship month</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-5 section-reveal">
              <div className="section-title">Our Team</div>
              <h2 className="section-heading">Neighbors leading the work.</h2>
              <p className="section-copy">
                Our team blends lived experience with professional expertise to
                keep children learning and families supported.
              </p>
              {teamLoading && (
                <p className="text-muted">Loading team members...</p>
              )}
            </div>
            <div className="col-lg-7 section-reveal delay-1">
              <div className="row gy-3">
                {team.map((member) => (
                  <div className="col-md-6" key={member.name}>
                    <div className="team-card">
                      <div className="team-avatar">{member.initials}</div>
                      <div>
                        <h5 className="mb-1">{member.name}</h5>
                        <div className="text-muted mb-2">{member.role}</div>
                        <p className="text-muted mb-0">{member.copy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
