import React from "react";
import PageHero from "../components/PageHero";

function WorkWithEurt() {
  return (
    <div>
      <PageHero
        eyebrow="Work with EURT"
        title="Collaborate on community-driven solutions."
        copy="We partner with NGOs, schools, and businesses to expand our impact."
      >
        <h5 className="mb-3">Partnership focus</h5>
        <p className="text-muted">
          Program co-design, training support, and community activation.
        </p>
        <button className="btn btn-outline-light btn-sm">Start a partnership</button>
      </PageHero>

      <section className="section section-tight">
        <div className="container">
          <div className="row gy-4">
            {[
              {
                title: "Education Partners",
                copy: "Support learning labs, mentorship, and school readiness."
              },
              {
                title: "Health & Protection",
                copy: "Strengthen referral networks and trauma-informed care."
              },
              {
                title: "Economic Growth",
                copy: "Invest in skills training and market access programs."
              }
            ].map((item) => (
              <div className="col-md-4" key={item.title}>
                <div className="program-card">
                  <h4>{item.title}</h4>
                  <p className="text-muted">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default WorkWithEurt;
