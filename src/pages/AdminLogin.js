import React, { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import PageHero from "../components/PageHero";
import heroImage from "../assets/hero.jpeg";
import { postJson, readApiError } from "../utils/api";
import {
  ADMIN_SESSION_DURATION_MS,
  readStoredSession,
  writeStoredSession
} from "../utils/adminSession";

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const existingSession = typeof window !== "undefined" ? readStoredSession() : null;
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [resetRequestEmail, setResetRequestEmail] = useState("");
  const [resetForm, setResetForm] = useState({ email: "", code: "", newPassword: "" });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [sessionExpired, setSessionExpired] = useState(false);

  if (existingSession?.token) {
    return <Navigate to="/admin" replace />;
  }

  const setMessage = (type, message) => setStatus({ type, message });

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginSubmitting(true);
    setMessage("", "");

    try {
      const response = await postJson("/api/auth/login", loginForm);
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const data = await response.json();
      writeStoredSession({
        ...data,
        expiresAt: Date.now() + ADMIN_SESSION_DURATION_MS
      });
      setSessionExpired(false);
      navigate(location.state?.from?.pathname || "/admin", { replace: true });
    } catch (error) {
      setMessage("error", error.message || "Unable to log in.");
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setResetSubmitting(true);

    try {
      const response = await postJson("/api/auth/forgot-password", {
        email: resetRequestEmail
      });
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }
      const data = await response.json();
      setResetForm((prev) => ({ ...prev, email: resetRequestEmail }));
      setShowForgotPassword(true);
      setMessage("success", data.detail || "Reset code requested.");
    } catch (error) {
      setMessage("error", error.message || "Unable to request reset code.");
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setResetSubmitting(true);

    try {
      const response = await postJson("/api/auth/reset-password", resetForm);
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }
      const data = await response.json();
      setMessage("success", data.detail || "Reset processed.");
      setSessionExpired(true);
    } catch (error) {
      setMessage("error", error.message || "Unable to verify reset code.");
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div>
      <PageHero
        eyebrow="Admin"
        title="Protected admin access."
        copy="This page is intentionally hidden from the public navigation. Sign in to continue."
        backgroundImage={heroImage}
        backgroundAlt="Admin login hero"
      >
        <h5 className="mb-3">Private access</h5>
        <p className="text-muted mb-0">Open this area directly from the `/admin/login` URL.</p>
      </PageHero>

      <section className="section section-tight">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5">
              <div className="support-card admin-login-card">
                <h4 className="mb-3">Admin login</h4>
                <p className="text-muted mb-4">
                  This area is hidden from the public site navigation and only opens directly through the admin route.
                </p>
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      type="email"
                      value={loginForm.email}
                      onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="admin@eutr.org"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      className="form-control"
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                      placeholder="Enter your admin password"
                      required
                    />
                    <button
                      className="admin-password-toggle"
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? "Hide password" : "Show password"}
                    </button>
                  </div>
                  <button className="btn btn-accent w-100" type="submit" disabled={loginSubmitting}>
                    {loginSubmitting ? "Signing in..." : "Login"}
                  </button>
                  <button
                    className="admin-password-toggle d-block mt-3"
                    type="button"
                    onClick={() => setShowForgotPassword((prev) => !prev)}
                  >
                    {showForgotPassword ? "Hide password reset" : "Forgot password?"}
                  </button>
                  {status.message && (
                    <small className={`d-block mt-2 ${status.type === "error" ? "text-danger" : "text-success"}`}>
                      {status.message}
                    </small>
                  )}
                  {sessionExpired && (
                    <small className="text-muted d-block mt-2">
                      Sessions expire automatically after 8 hours for safety.
                    </small>
                  )}
                </form>
                {showForgotPassword && (
                  <div className="admin-reset-panel mt-4 pt-4">
                    <h5 className="mb-3">Reset admin password</h5>
                    <form onSubmit={handleForgotPassword}>
                      <div className="mb-3">
                        <label className="form-label">Admin email</label>
                        <input
                          className="form-control"
                          type="email"
                          value={resetRequestEmail}
                          onChange={(event) => setResetRequestEmail(event.target.value)}
                          placeholder="admin@eutr.org"
                          required
                        />
                      </div>
                      <button className="btn btn-outline-light w-100" type="submit" disabled={resetSubmitting}>
                        {resetSubmitting ? "Sending code..." : "Send reset code"}
                      </button>
                    </form>

                    <form onSubmit={handleResetPassword} className="mt-4">
                      <div className="mb-3">
                        <label className="form-label">Reset code</label>
                        <input
                          className="form-control"
                          value={resetForm.code}
                          onChange={(event) => setResetForm((prev) => ({ ...prev, code: event.target.value }))}
                          placeholder="Enter 6-digit code"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">New password</label>
                        <input
                          className="form-control"
                          type={showResetPassword ? "text" : "password"}
                          value={resetForm.newPassword}
                          onChange={(event) => setResetForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                          placeholder="Choose a new password"
                          required
                        />
                        <button
                          className="admin-password-toggle"
                          type="button"
                          onClick={() => setShowResetPassword((prev) => !prev)}
                        >
                          {showResetPassword ? "Hide new password" : "Show new password"}
                        </button>
                      </div>
                      <button className="btn btn-accent w-100" type="submit" disabled={resetSubmitting}>
                        {resetSubmitting ? "Verifying..." : "Verify reset code"}
                      </button>
                      <small className="text-muted d-block mt-2">
                        After verification, update `ADMIN PASSWORD` to the new password you chose.
                      </small>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminLogin;
