import React, { useEffect, useState } from "react";
import { getApiUrl } from "../utils/api";
import { resolveItemImage } from "../utils/media";
import { Link } from "react-router-dom";
// import programImage1 from "../assets/gallery-1.jpeg";
import Image2 from "../assets/image-2.jpeg";
import programImage3 from "../assets/gallery-3.jpeg";
import image4 from "../assets/image-4.jpeg"
import image5 from "../assets/image-5.jpeg"

const fallbackPrograms = [
  {
    title: "Early Childhood Development",
    focus: "Education",
    description: "While educational services exist within the camp, many children continue to face barriers including overcrowded classrooms, limited learning resources, and inadequate nutritional support. EUR seeks to complement existing services by providing additional educational opportunities and supportive learning environments.",
    highlights: [
      "Foundational literacy and numeracy activities",
      "Safe and inclusive early childhood spaces",
      "Parent engagement for home learning"
    ],
    image: image4
  },
  {
    title: "Women Empowerment",
    focus: "Livelihoods",
    description: "Through practical vocational training, entrepreneurship development, and market linkages, women are supported to build sustainable livelihoods, strengthen economic independence, and reduce vulnerability to poverty and exploitation.",
    highlights: [
      "Back-to-school campaigns and follow-up",
      "Case support for at-risk learners",
      "Community policy dialogue on education access"
    ],
    image: image4
  },
  {
    title: "Gender-Based Violence Prevention",
    focus: "Protection and empowerment",
    description: "EUR recognizes that gender-based violence remains a significant challenge affecting women and girls in displacement settings. Through awareness raising, community dialogue, education, and empowerment initiatives, EUR works to promote safety, dignity, and resilience.",
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

const fallbackImages = [image4, image5, programImage3];

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
  image: resolveItemImage(program) || fallbackImages[index % fallbackImages.length]
});

function Programs() {
  const [programs, setPrograms] = useState(fallbackPrograms);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadPrograms = async () => {
      try {
        const response = await fetch(getApiUrl("/api/programs/"));
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
        <img className="hero-bg" src={Image2} alt="Children learning in a classroom" />
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
                        src={program.image || fallbackImages[index % fallbackImages.length]}
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


