import React, { useEffect, useState } from "react";

const fallbackProjects = [
  {
    title: "Community Learning Labs",
    tag: "Education",
    copy: "After-school tutoring, digital literacy, and mentorship in safe learning spaces."
  },
  {
    title: "Safe Homes Network",
    tag: "Protection",
    copy: "Case support, family referrals, and child safeguarding follow-up."
  },
  {
    title: "Women in Enterprise",
    tag: "Livelihoods",
    copy: "Business skills, savings circles, and market linkage support for caregivers."
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
        const response = await fetch("/api/projects/");
        if (!response.ok) throw new Error("Failed to load projects");
        const data = await response.json();
        const normalized = normalizeProjects(data);
        if (isMounted && normalized.length) {
          setProjects(
            normalized.map((project) => ({
              title: project?.title || "Project",
              tag: project?.tag || project?.category || "Community",
              copy: project?.copy || project?.description || "Project details coming soon."
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
                <div className="badge-pill mb-2">{project.tag}</div>
                <h5>{project.title}</h5>
                <p className="text-muted mb-0">{project.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;
