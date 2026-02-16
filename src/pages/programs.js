import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import programImage1 from "../assets/gallery-1.jpeg";
import programImage2 from "../assets/gallery-2.jpeg";
import programImage3 from "../assets/gallery-3.jpeg";
import heroImage from "../assets/hero.jpeg";

const fallbackPrograms = [
  {
    title: "Early Learning Foundations",
    focus: "School readiness",
    description: "Play-based learning, literacy, and numeracy support for young learners.",
    highlights: [
      "Foundational literacy and numeracy activities",
      "Safe and inclusive early childhood spaces",
      "Parent engagement for home learning"
    ],
    image: programImage1
  },
  {
    title: "Education Retention and Policy",
    focus: "Access and equity",
    description: "Community advocacy and school retention support for vulnerable children.",
    highlights: [
      "Back-to-school campaigns and follow-up",
      "Case support for at-risk learners",
      "Community policy dialogue on education access"
    ],
    image: programImage2
  },
  {
    title: "Arts and Crafts Livelihoods",
    focus: "Women-led enterprise",
    description: "Skills training in crochet, beadwork, and design for income generation.",
    highlights: [
      "Practical craft and design training",
      "Market linkage and small business coaching",
      "Income pathways for women-led households"
    ],
    image: programImage3
  }
];

const normalizePrograms = (data) => {
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

const fallbackImages = [programImage1, programImage2, programImage3];

const toHighlights = (program) => {
  if (Array.isArray(program?.highlights) && program.highlights.length) return program.highlights;
  if (Array.isArray(program?.bullets) && program.bullets.length) return program.bullets;
  if (Array.isArray(program?.activities) && program.activities.length) return program.activities;
  if (typeof program?.highlights === "string") {
    return program.highlights
      .split(/[.;]\s+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const mapProgram = (program, index = 0) => ({
  title: program?.title || "Program",
  focus: program?.focus || program?.category || "Community program",
  description:
    program?.copy ||
    program?.description ||
    program?.content ||
    program?.details ||
    "Program details coming soon.",
  highlights: toHighlights(program),
  image:
    resolveImage(program?.image) ||
    resolveImage(program?.photo) ||
    resolveImage(program?.cover_image) ||
    fallbackImages[index % fallbackImages.length]
});

function Programs() {
  const [programs, setPrograms] = useState(fallbackPrograms);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadPrograms = async () => {
      try {
        const response = await fetch("/api/programs/");
        if (!response.ok) throw new Error("Failed to load programs");
        const data = await response.json();
        const normalized = normalizePrograms(data);
        if (isMounted && normalized.length) {
          setPrograms(normalized.map((program, index) => mapProgram(program, index)));
        }
      } catch (error) {
        if (isMounted) {
          setPrograms(fallbackPrograms);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPrograms();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <section className="hero page-image-hero">
        <img className="hero-bg" src={heroImage} alt="Programs hero" />
        <div className="container hero-content">
          <div className="row align-items-center gy-4">
            <div className="col-lg-8 section-reveal">
              <div className="badge-pill mb-3">Our Programs</div>
              <h1 className="hero-title">Programs, projects, and events.</h1>
              <p className="hero-copy mb-0">
                Explore what we run across education, protection, and livelihoods.
              </p>
            </div>
            <div className="col-lg-4 d-flex gap-2 flex-wrap justify-content-lg-end section-reveal delay-1">
              <Link className="btn btn-accent" to="/projects">
                View Projects
              </Link>
              <Link className="btn btn-outline-light" to="/events">
                View Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          {loading && <p className="text-muted">Loading programs...</p>}

          <div className="row gy-4">
            {programs.map((program, index) => (
              <div className="col-12" key={`${program.title}-${index}`}>
                <div className="program-feature">
                  <div className={`row g-0 align-items-center ${index % 2 === 1 ? "flex-row-reverse" : ""}`}>
                    <div className="col-lg-6">
                      <img
                        className="program-feature-image"
                        src={resolveImage(program.image) || fallbackImages[index % fallbackImages.length]}
                        alt={program.title}
                      />
                    </div>
                    <div className="col-lg-6">
                      <div className="program-feature-content">
                        <div className="badge-pill mb-3">{program.focus}</div>
                        <h3>{program.title}</h3>
                        <p className="text-muted">{program.description}</p>
                        {program.highlights?.length > 0 && (
                          <ul className="text-muted mb-0">
                            {program.highlights.map((item, itemIndex) => (
                              <li key={`${program.title}-highlight-${itemIndex}`} className="mb-1">
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
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

export default Programs;
