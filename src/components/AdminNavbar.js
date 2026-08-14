import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpeg";

function AdminNavbar() {
  return (
    <nav className="navbar admin-navbar fixed-top">
      <div className="container admin-navbar-inner">
        <Link className="admin-navbar-brand" to="/admin" aria-label="EUTR admin home">
          <img src={logo} alt="EUTR logo" />
          <div>
            <div className="admin-navbar-title">EUTR Admin</div>
            <small className="admin-navbar-subtitle">Content workspace</small>
          </div>
        </Link>
      </div>
    </nav>
  );
}

export default AdminNavbar;
