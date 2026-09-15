import React, { useEffect, useState } from "react";
import PageHero from "../components/PageHero";
import heroImage from "../assets/Image-1.jpeg";
import gallery1 from "../assets/gallery-1.jpeg";
import { getApiUrl } from "../utils/api";
import { resolveItemImage } from "../utils/media";

function Volunteer() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    let active = true;
    fetch(getApiUrl("/api/testimonials/"))
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.results || [];
        if (active) setTestimonials(items.filter((item) => item?.quote || item?.message || item?.testimonial));
      })
      .catch(() => {
        if (active) setTestimonials([]);
      });
    return () => { active = false; };
  }, []);

  return (
    <div>
      <PageHero
        eyebrow="Volunteer"
        title="Give your time. Grow alongside the community."
        copy="Mentors, coaches, and facilitators are the heartbeat of EUTR."
        backgroundImage={heroImage}
        backgroundAlt="Volunteer hero"
      >
        <h5 className="mb-3">Volunteer roles</h5>
        <ul className="list-unstyled text-muted">
          <li className="mb-2">Learning circle facilitator</li>
          <li className="mb-2"> Youth mentor</li>
          <li className="mb-2"> Skills workshop partner</li>
        </ul>
        <a className="btn btn-accent" href="/volunteer/apply">Apply to volunteer</a>
      </PageHero>

      {testimonials.length > 0 && (
        <section className="section section-tight">
          <div className="container">
            <div className="section-title">Volunteer voices</div>
            <h2 className="section-heading mb-4">Why people volunteer with us.</h2>
            <div className="row gy-4">
              {testimonials.map((item, index) => (
                <div className="col-12" key={item.id || `${item.name}-${index}`}>
                  <div className="program-feature">
                    <div className={`row g-0 align-items-center ${index % 2 === 1 ? "flex-row-reverse" : ""}`}>
                      <div className="col-lg-6">
                        <img
                          className="program-feature-image volunteer-testimonial-image"
                          src={resolveItemImage(item) || gallery1}
                          alt={`${item.name || "Volunteer"} testimonial`}
                        />
                      </div>
                      <div className="col-lg-6">
                        <div className="program-feature-content">
                          <h3>{item.name || "Volunteer"}</h3>
                          <p className="text-muted">{item.quote || item.message || item.testimonial}</p>
                          <p className="text-muted mb-0">{item.role || "Volunteer"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Volunteer;
