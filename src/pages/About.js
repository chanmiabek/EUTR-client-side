import React, { useEffect, useState } from "react";
import aboutImage from "../assets/about.jpeg";
import gallery1 from "../assets/gallery-1.jpeg";
import gallery2 from "../assets/gallery-2.jpeg";
import testimonial1 from "../assets/M A Malony.jpeg";
import testimonial2 from "../assets/secretary.jpeg";
import testimonial3 from "../assets/WhatsApp Image 2026-02-16 at 14.46.15.jpeg";
import teamImage1 from "../assets/M A Malony.jpeg";
import teamImage2 from "../assets/secretary.jpeg";
import teamImage3 from "../assets/WhatsApp Image 2026-02-16 at 14.46.14.jpeg";
import teamImage4 from "../assets/WhatsApp Image 2026-02-16 at 14.46.15.jpeg";
import teamImage5 from "../assets/WhatsApp Image 2026-02-16 at 14.46.15 (1).jpeg";
import teamImage6 from "../assets/WhatsApp Image 2026-02-16 at 14.46.15 (2).jpeg";
import teamImage7 from "../assets/gallery-3.jpeg";

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

const partners = [
  { name: "Amala", mark: "AM" },
  { name: "Faulu", mark: "FA" },
  { name: "AReL", mark: "AR" },
  { name: "UNHCR", mark: "UN" },
  { name: "LWF", mark: "LW" },
  { name: "JRS", mark: "JR" }
];

const fallbackTestimonials = [
  {
    name: "M.A. Malony",
    role: "Founder, EUTR",
    image: testimonial1,
    quote:
      "Our mission is practical: start early, protect learning, and ensure every child in Kakuma is ready to thrive."
  },
  {
    name: "Linet Achieng",
    role: "Education Lead",
    image: testimonial2,
    quote:
      "When children receive foundational support, their confidence grows, attendance improves, and families stay hopeful."
  },
  {
    name: "Community Parent Leader",
    role: "Parent Representative",
    image: testimonial3,
    quote:
      "EUTR gives our children structure and joy. The vision is visible in every classroom and every parent meeting."
  }
];

const normalizeTeam = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

const normalizeTestimonials = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

const resolveImage = (value) => {
  if (!value || typeof value !== "string") return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
    return value;
  }
  if (value.startsWith("/")) return value;
  return `/${value}`;
};

const teamImages = [
  teamImage1,
  teamImage2,
  teamImage3,
  teamImage4,
  teamImage5,
  teamImage6,
  teamImage7
];

function About() {
  const [team, setTeam] = useState(fallbackTeam);
  const [teamLoading, setTeamLoading] = useState(true);
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

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

  useEffect(() => {
    let isMounted = true;

    const loadTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials/");
        if (!response.ok) throw new Error("Failed to load testimonials");
        const data = await response.json();
        const normalized = normalizeTestimonials(data);
        if (isMounted && normalized.length) {
          setTestimonials(
            normalized.map((item, index) => ({
              name: item?.name || item?.full_name || "Community Member",
              role: item?.role || item?.title || "Community Voice",
              image:
                resolveImage(item?.image) ||
                resolveImage(item?.photo) ||
                resolveImage(item?.avatar) ||
                teamImages[index % teamImages.length],
              quote: item?.quote || item?.message || item?.testimonial || ""
            }))
          );
        }
      } catch (error) {
        if (isMounted) {
          setTestimonials(fallbackTestimonials);
        }
      } finally {
        if (isMounted) {
          setTestimonialsLoading(false);
        }
      }
    };

    loadTestimonials();

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
              <h1 className="hero-title fw-bold">About Us</h1>
              <p className="hero-copy mb-0">
                We exist to build strong educational foundations for children and
                create resilient, united communities in Kakuma.
              </p>
            </div>
            <div className="col-lg-5 section-reveal delay-1">
              <div className="hero-card">
                <h5>What we believe</h5>
                <p className="text-muted mb-0">
                  Strong foundations in early childhood education unlock lifelong
                  success. We build learning programs that inspire curiosity,
                  unity, and mutual respect.
                </p>
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

      <section className="section section-tight">
        <div className="container">
          <div className="section-title">Our Partners</div>
          <h2 className="section-heading mb-4">
            Collaboration that strengthens our impact.
          </h2>
          <div className="row gy-3">
            {partners.map((partner) => (
              <div className="col-6 col-md-4 col-lg-2" key={partner.name}>
                <div className="partner-card">
                  <div className="partner-logo" aria-label={`${partner.name} logo`}>
                    {partner.mark}
                  </div>
                  <p className="mb-0 fw-semibold">{partner.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-6">
              <img
                src={gallery1}
                alt="Learners in class"
                style={{ borderRadius: "28px", border: "1px solid var(--border)" }}
              />
            </div>
            <div className="col-lg-6">
              <div className="section-title">How We Deliver</div>
              <h2 className="section-heading">Three ways we drive mission to vision.</h2>
              <ul className="list-unstyled">
                <li className="mb-3">
                  <h5 className="mb-1">1. School Readiness</h5>
                  <p className="text-muted mb-0">
                    Safe and structured learning for young children before they
                    transition to primary school.
                  </p>
                </li>
                <li className="mb-3">
                  <h5 className="mb-1">2. Family and Community Partnership</h5>
                  <p className="text-muted mb-0">
                    Parent engagement, referral support, and local leadership to
                    sustain children&apos;s learning.
                  </p>
                </li>
                <li>
                  <h5 className="mb-1">3. Protection and Opportunity</h5>
                  <p className="text-muted mb-0">
                    Child protection, gender-responsive programs, and practical
                    pathways that strengthen dignity and livelihoods.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="section-title">Testimonials</div>
          <h2 className="section-heading mb-4">Voices from our community.</h2>
          {testimonialsLoading && (
            <p className="text-muted mb-3">Loading testimonials...</p>
          )}
          <div className="row gy-4">
            {testimonials.map((item) => (
              <div className="col-lg-4" key={item.name}>
                <div className="testimonial-card">
                  <img
                    className="testimonial-image"
                    src={resolveImage(item.image) || teamImages[0]}
                    alt={`${item.name} testimonial`}
                  />
                  <p className="text-muted fst-italic mt-3 mb-3">&quot;{item.quote}&quot;</p>
                  <h6 className="mb-1">{item.name}</h6>
                  <small className="text-muted">{item.role}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="section-reveal">
            <div className="section-title">Our Team</div>
            <h2 className="section-heading">Neighbors leading the work.</h2>
            <p className="section-copy mb-4">
              Our team blends lived experience with professional expertise to
              keep children learning and families supported.
            </p>
            {teamLoading && (
              <p className="text-muted">Loading team members...</p>
            )}
          </div>
          <div className="row gy-3 section-reveal delay-1">
            {team.map((member, index) => (
              <div className="col-md-6 col-lg-4" key={member.name}>
                <div className="team-card">
                  <img
                    className="team-photo"
                    src={
                      resolveImage(member?.image) ||
                      resolveImage(member?.photo) ||
                      resolveImage(member?.avatar) ||
                      teamImages[index % teamImages.length]
                    }
                    alt={member.name}
                  />
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
      </section>
    </div>
  );
}

export default About;
