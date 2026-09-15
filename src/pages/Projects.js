import React, { useEffect, useState } from "react";
import { getApiUrl } from "../utils/api";
import PageHero from "../components/PageHero";
import heroImage from "../assets/gallery-2.jpeg";
import gallery1 from "../assets/gallery-1.jpeg";
import gallery2 from "../assets/gallery-2.jpeg";
import gallery3 from "../assets/gallery-3.jpeg";
import { resolveItemImage } from "../utils/media";

const fallbackProjects = [
  {
    title: "Community Learning Labs",
    tag: "Education",
    copy: "After-school tutoring, digital literacy, and mentorship in safe learning spaces.",
    image: gallery1
  },
  {
    title: "Safe Homes Network",
    tag: "Protection",
    copy: "Case support, family referrals, and child safeguarding follow-up.",
    image: gallery2
  },
  {
    title: "Women in Enterprise",
    tag: "Livelihoods",
    copy: "Business skills, savings circles, and market linkage support for caregivers.",
    image: gallery3
  }
];

const normalizeProjects = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

function Projects() {
  const [projects, setProjects] = useState(fallbackProjects);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      try {
        const response = await fetch(getApiUrl("/api/projects/"));
        if (!response.ok) throw new Error("Failed to load projects");
        const data = await response.json();
        const normalized = normalizeProjects(data);
        if (isMounted && normalized.length) {
          setProjects(
            normalized.map((project, index) => ({
              title: project?.title || "Project",
              tag: project?.tag || project?.category || "Community",
              copy: project?.copy || project?.description || "Project details coming soon.",
              image: resolveItemImage(project) || [gallery1, gallery2, gallery3][index % 3]
            }))
          );
        }
      } catch (error) {
        if (isMounted) {
          setProjects(fallbackProjects);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <PageHero
        eyebrow="Projects"
        title="Projects that turn shared goals into lasting change."
        copy="Explore community-led work across education, protection, livelihoods, and empowerment."
        backgroundImage={heroImage}
        backgroundAlt="Children learning together in a classroom"
      />
      <section className="section section-tight">
        <div className="container">
        <div className="section-title">Projects</div>
        <h1 className="section-heading">Current projects in motion.</h1>
        <p className="section-copy">
          These projects are co-led with community partners and can be managed from the backend.
        </p>
        {loading && <p className="text-muted">Loading projects...</p>}
        <div className="row gy-3 mt-1">
          {projects.map((project, index) => (
            <div className="col-md-6" key={`${project.title}-${index}`}>
              <div className="project-card">
                <img
                  src={project.image || [gallery1, gallery2, gallery3][index % 3]}
                  alt={project.title}
                  style={{ width: "100%", height: "220px", objectFit: "cover", borderRadius: "18px", marginBottom: "1rem" }}
                />
                <div className="badge-pill mb-2">{project.tag}</div>
                <h5>{project.title}</h5>
                <p className="text-muted mb-0">{project.copy}</p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>
    </div>
  );
}

export default Projects;


