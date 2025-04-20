// src/components/Footer.jsx
import React from 'react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import './Footer.css';

const GITHUB_REPO_URL = "https://github.com/YOUR_USERNAME/10-question-quiz";
const LINKEDIN_URL = "https://www.linkedin.com/in/ram-bapat-barrsum-diamos";

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="project-title">10 Question Quiz</p>
        <div className="social-links">
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            title="Connect on LinkedIn"
            className="social-icon-link"
          >
            <FaLinkedin />
          </a>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            title="View Source on GitHub"
            className="social-icon-link"
          >
            <FaGithub />
          </a>
        </div>
        <p className="footer-credit">
        Connect via LinkedIn / View Source on GitHub
        </p>
        <p className="footer-credit">
          Created By Ram Bapat
        </p>
      </div>
    </footer>
  );
}

export default React.memo(Footer);