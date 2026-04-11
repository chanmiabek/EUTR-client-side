import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import SiteNavbar from "./components/SiteNavbar";
import SiteFooter from "./components/SiteFooter";
import AdminNavbar from "./components/AdminNavbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Donate from "./pages/Donate";
import WorkWithEurt from "./pages/WorkWithEurt";
import Volunteer from "./pages/Volunteer";
import JoinUs from "./pages/JoinUs";
import Contact from "./pages/Contact";
import Programs from "./pages/programs";
import Projects from "./pages/Projects";
import Events from "./pages/Events";
import AdminContent from "./pages/AdminContent";
import AdminLogin from "./pages/AdminLogin";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="app">
      {isAdminRoute ? <AdminNavbar /> : <SiteNavbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/work-with-eurt" element={<WorkWithEurt />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/join-us" element={<JoinUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/events" element={<Events />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminContent />} />
          </Route>
        </Routes>
      </main>
      {!isAdminRoute && <SiteFooter />}
    </div>
  );
}

export default App;
