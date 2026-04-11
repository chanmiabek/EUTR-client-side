import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpeg";

function AdminNavbar() {
  return (
    <nav className="navbar admin-navbar fixed-top">
      <div className="container">
        <Link className="admin-navbar-brand" to="/admin" aria-label="EUTR admin home">
          <img src={logo} alt="EUTR logo" />
          <div>
            <div className="admin-navbar-title">EUTR Admin</div>
            <small className="admin-navbar-subtitle">Education | Unity</small>
          </div>
        </Link>
      </div>
    </nav>
  );
}

export default AdminNavbar;
