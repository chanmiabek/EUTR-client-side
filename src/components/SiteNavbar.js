import React from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "../assets/logo.jpeg";

const links = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Our Programs", to: "/programs" },
  { label: "Donate", to: "/donate" },
  { label: "Volunteer", to: "/volunteer" },
  { label: "Join Us", to: "/join-us" },
  { label: "Contact", to: "/contact" }
];

function SiteNavbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top navbar-eutr">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} alt="EUTR logo" />
          <div>
            <div className="fw-bold">Educate Us To Rise (EUTR)</div>
            <small className="text-muted">Education | Unity | Transformation</small>
          </div>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-lg-2">
            {links.map((link) => (
              <li className="nav-item" key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  end={link.to === "/"}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="ms-lg-3">
            <Link className="btn btn-accent" to="/donate">
              Support EUTR
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default SiteNavbar;
