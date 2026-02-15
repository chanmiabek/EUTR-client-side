import React from "react";
import logo from "../assets/logo.jpeg";
const currentYear = new Date().getFullYear();

function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row gy-4 align-items-start">
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-3 mb-3">
              <img
                src={logo}
                alt="EUTR logo"
                style={{ width: "56px", height: "56px", borderRadius: "50%" }}
              />
              <div>
                <h5 className="mb-1">Educate Us To Rise(EUTR)</h5>
                <small className="text-muted">Education | Unity | Transformation | Resilience</small>
              </div>
            </div>
            <p className="text-muted">
              A community-powered movement restoring dignity, opportunity, and
              leadership through education, skills, and collective action.
            </p>
          </div>
          <div className="col-6 col-lg-2">
            <h6 className="text-uppercase text-muted">Explore</h6>
            <ul className="list-unstyled">
              <li className="mb-2" href='/about'>About</li>
              <li className="mb-2" href='/program'>Programs</li>
              <li className="mb-2" href='/impact'>Impact</li>
              <li className="mb-2" href='/stories'>Stories</li>
            </ul>
          </div>
          <div className="col-6 col-lg-3">
            <h6 className="text-uppercase text-muted">Get Involved</h6>
            <ul className="list-unstyled">
              <li className="mb-2">Volunteer</li>
              <li className="mb-2">Work with EUTR</li>
              <li className="mb-2">Join Us</li>
              <li className="mb-2">Donate</li>
            </ul>
          </div>
          <div className="col-lg-3">
            <h6 className="text-uppercase text-muted">Contact</h6>
            <p className="text-muted mb-1">EUTR Community Hub</p>
            <p className="text-muted mb-1">Kakuma, Kenya</p>
            <p className="text-muted">educateustorrise@gmail.com</p>
          </div>
        </div>
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 pt-3 border-top border-secondary">
          <small> &copy; {currentYear}, EUTR. All rights reserved.</small>
          <small className="text-muted">Privacy | Terms | Accessibility</small>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
