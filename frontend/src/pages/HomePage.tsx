import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Capture Moments, Reveal Memories</h1>
            <p className="hero-subtitle">
              Memory in a Jar helps you strengthen relationships by privately logging and later revealing shared memories in a meaningful way.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn-primary">Get Started</Link>
              <Link to="/login" className="btn-secondary">Sign In</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title text-center">How It Works</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">1</div>
              <h3>Create a Relationship</h3>
              <p>Connect with someone special and set how often you'll share memories.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">2</div>
              <h3>Record Memories</h3>
              <p>Regularly add text, photos, videos, or audio of special moments.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">3</div>
              <h3>Reveal Together</h3>
              <p>After your chosen time period, view all memories together in chronological order.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">4</div>
              <h3>Keep Forever</h3>
              <p>Export your memories as a beautiful PDF or video montage.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="use-cases">
        <div className="container">
          <h2 className="section-title text-center">Perfect For</h2>
          <div className="use-case-grid">
            <div className="use-case-card">
              <h3>Couples</h3>
              <p>Document your journey together and celebrate your relationship milestones.</p>
            </div>
            <div className="use-case-card">
              <h3>Friends</h3>
              <p>Capture inside jokes and adventures with your closest companions.</p>
            </div>
            <div className="use-case-card">
              <h3>Family</h3>
              <p>Record precious moments with children, siblings, or parents.</p>
            </div>
            <div className="use-case-card">
              <h3>Mentors</h3>
              <p>Track progress and growth in professional or educational relationships.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Start Collecting Memories Today</h2>
            <p>It's free and takes less than a minute to get started.</p>
            <Link to="/register" className="btn-primary">Create Your Account</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
