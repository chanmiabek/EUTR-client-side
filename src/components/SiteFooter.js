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
                <small className="text-muted">Education | Unity</small>
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
              <li className="mb-2"><a className="footer-link" href="/about">About</a></li>
              <li className="mb-2"><a className="footer-link" href="/program">Programs</a></li>
              <li className="mb-2"><a className="footer-link" href="/impact">Impact</a></li>
              <li className="mb-2"><a className="footer-link" href="/stories">Stories</a></li>
            </ul>
          </div>
          <div className="col-6 col-lg-2">
            <h6 className="text-uppercase text-muted">Get Involved</h6>
            <ul className="list-unstyled">
              <li className="mb-2">Volunteer</li>
              <li className="mb-2">Work with EUTR</li>
              <li className="mb-2">Join Us</li>
              <li className="mb-2">Donate</li>
            </ul>
          </div>
          <div className="col-6 col-lg-2">
            <h6 className="text-uppercase text-muted">Follow us</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a className="footer-link d-inline-flex align-items-center gap-2" href="https://facebook.com" target="_blank" rel="noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M8.94 6.5V5.33c0-.53.35-.66.6-.66h1.5V2.36L8.97 2.35c-2.3 0-2.82 1.72-2.82 2.82V6.5H4.5V9h1.65v4.65h2.8V9h1.89l.3-2.5H8.94z" />
                  </svg>
                  Facebook
                </a>
              </li>
              <li className="mb-2">
                <a className="footer-link d-inline-flex align-items-center gap-2" href="https://instagram.com" target="_blank" rel="noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M8 3.2c1.56 0 1.74.01 2.35.04.56.03.86.12 1.06.2.26.1.45.22.65.42s.32.39.42.65c.08.2.17.5.2 1.06.03.61.04.79.04 2.35s-.01 1.74-.04 2.35c-.03.56-.12.86-.2 1.06-.1.26-.22.45-.42.65s-.39.32-.65.42c-.2.08-.5.17-1.06.2-.61.03-.79.04-2.35.04s-1.74-.01-2.35-.04c-.56-.03-.86-.12-1.06-.2a1.8 1.8 0 0 1-.65-.42 1.8 1.8 0 0 1-.42-.65c-.08-.2-.17-.5-.2-1.06C3.21 9.74 3.2 9.56 3.2 8s.01-1.74.04-2.35c.03-.56.12-.86.2-1.06.1-.26.22-.45.42-.65s.39-.32.65-.42c.2-.08.5-.17 1.06-.2.61-.03.79-.04 2.35-.04M8 1.75c-1.6 0-1.8.01-2.42.04-.62.03-1.04.13-1.41.27-.39.15-.71.35-1.03.67-.32.32-.52.64-.67 1.03-.14.37-.24.79-.27 1.41-.03.62-.04.82-.04 2.42s.01 1.8.04 2.42c.03.62.13 1.04.27 1.41.15.39.35.71.67 1.03.32.32.64.52 1.03.67.37.14.79.24 1.41.27.62.03.82.04 2.42.04s1.8-.01 2.42-.04c.62-.03 1.04-.13 1.41-.27.39-.15.71-.35 1.03-.67.32-.32.52-.64.67-1.03.14-.37.24-.79.27-1.41.03-.62.04-.82.04-2.42s-.01-1.8-.04-2.42c-.03-.62-.13-1.04-.27-1.41a3.2 3.2 0 0 0-.67-1.03 3.2 3.2 0 0 0-1.03-.67c-.37-.14-.79-.24-1.41-.27-.62-.03-.82-.04-2.42-.04z" />
                    <path d="M8 5.6A2.4 2.4 0 1 0 8 10.4 2.4 2.4 0 1 0 8 5.6zm0 3.95A1.55 1.55 0 1 1 8 6.45a1.55 1.55 0 0 1 0 3.1zM10.75 5.04a.56.56 0 1 0 0-1.12.56.56 0 0 0 0 1.12z" />
                  </svg>
                  Instagram
                </a>
              </li>
              <li className="mb-2">
                <a className="footer-link d-inline-flex align-items-center gap-2" href="https://x.com" target="_blank" rel="noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M9.78 6.76 14.36 1.5h-1.08L9.3 6.07 6.15 1.5H1.5l4.8 6.98L1.5 14.5h1.08l4.2-4.83 3.32 4.83h4.65L9.78 6.76zm-2.4 2.75-.49-.7-3.9-5.6h2.12l3.14 4.5.49.7 4.1 5.9H10.7l-3.33-4.8z" />
                  </svg>
                  X (Twitter)
                </a>
              </li>
            </ul>
          </div>
          <div className="col-6 col-lg-2">
            <h6 className="text-uppercase text-muted">Contact</h6>
            <p className="text-muted mb-1">EUTR Community Hub</p>
            <p className="text-muted mb-1">Kakuma, Kenya</p>
            <p className="text-muted">educateustorrise@gmail.com</p>
          </div>
        </div>
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 pt-3 border-top border-secondary">
          <small> &copy; {currentYear}, Educate Us To Rise(EUTR). All rights reserved.</small>
          <small className="text-muted">Privacy | Terms | Accessibility</small>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
