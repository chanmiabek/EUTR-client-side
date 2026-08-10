import PageHero from "../components/PageHero";
import heroImage from "../assets/hero.jpeg";
import "../pages/Donate.css";

function Donate() {
  return (
    <div className="app">
      <PageHero
        eyebrow="Donate"
        title="Fuel education, protection, and opportunity."
        copy="Every gift supports community-led programs and direct family support."
        backgroundImage={heroImage}
        backgroundAlt="Donate hero"
      >
        <h5 className="mb-3">Make a difference today</h5>
      </PageHero>

      <section className="section donorbox-section">
        <div className="container">
          <div className="support-card donorbox-card">
            <h2>Support our work</h2>
            <p className="text-muted mb-4">
              Choose an amount and complete your donation securely through Donorbox.
            </p>
            <iframe
              className="donorbox-iframe"
              title="Donation form"
              src="https://donorbox.org/embed/donate-here-to-support-the-vulnerable-in-the-communities"
              frameBorder="0"
              scrolling="no"
              allow="payment"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Donate;
