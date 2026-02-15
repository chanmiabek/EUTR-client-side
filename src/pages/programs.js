import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const fallbackPrograms = [
  {
    title: "Early Learning Foundations",
    focus: "School readiness",
    description: "Play-based learning, literacy, and numeracy support for young learners."
  },
  {
    title: "Education Retention and Policy",
    focus: "Access and equity",
    description: "Community advocacy and school retention support for vulnerable children."
  },
  {
    title: "Arts and Crafts Livelihoods",
    focus: "Women-led enterprise",
    description: "Skills training in crochet, beadwork, and design for income generation."
  }
];

const normalizePrograms = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

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
          setPrograms(
            normalized.map((program) => ({
              title: program?.title || "Program",
              focus: program?.focus || program?.category || "Community program",
              description:
                program?.copy || program?.description || "Program details coming soon."
            }))
          );
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
    <section className="section section-tight">
      <div className="container">
        <div className="row align-items-center gy-4 mb-4">
          <div className="col-lg-8">
            <div className="section-title">Our Programs</div>
            <h1 className="section-heading">Programs, projects, and events.</h1>
            <p className="section-copy">
              Explore what we run across education, protection, and livelihoods.
            </p>
          </div>
          <div className="col-lg-4 d-flex gap-2 flex-wrap justify-content-lg-end">
            <Link className="btn btn-accent" to="/projects">
              View Projects
            </Link>
            <Link className="btn btn-outline-light" to="/events">
              View Events
            </Link>
          </div>
        </div>

        {loading && <p className="text-muted">Loading programs...</p>}

        <div className="row gy-4">
          {programs.map((program, index) => (
            <div className="col-md-4" key={`${program.title}-${index}`}>
              <div className="program-card h-100">
                <div className="badge-pill mb-3">{program.focus}</div>
                <h4>{program.title}</h4>
                <p className="text-muted mb-0">{program.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Programs;
