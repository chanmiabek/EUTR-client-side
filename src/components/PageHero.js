import React from "react";

function PageHero({ eyebrow, title, copy, children }) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="row align-items-center gy-4">
          <div className="col-lg-7">
            <div className="badge-pill mb-3">{eyebrow}</div>
            <h1 className="hero-title">{title}</h1>
            <p className="hero-copy">{copy}</p>
          </div>
          <div className="col-lg-5">
            <div className="page-hero-card">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PageHero;
