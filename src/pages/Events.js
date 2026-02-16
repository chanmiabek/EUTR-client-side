import React, { useEffect, useState } from "react";
import eventImage1 from "../assets/gallery-1.jpeg";
import eventImage2 from "../assets/gallery-2.jpeg";
import eventImage3 from "../assets/gallery-3.jpeg";
import heroImage from "../assets/hero.jpeg";

const fallbackEvents = [
  {
    title: "Back-to-School Learning Fair",
    date: "2026-03-20",
    location: "Kakuma Learning Hub",
    tag: "Education",
    description: "Enrollment support, school kits, and parent orientation.",
    highlights: [
      "School enrollment and re-enrollment desk",
      "Learning kits and caregiver orientation",
      "Child-friendly activity stations"
    ],
    image: eventImage1
  },
  {
    title: "Women in Artistry Showcase",
    date: "2026-04-12",
    location: "Community Market Hall",
    tag: "Livelihoods",
    description: "Community exhibition of crochet, beadwork, and design.",
    highlights: [
      "Live demonstrations and product displays",
      "Sales and market exposure for women groups",
      "Networking with potential partners"
    ],
    image: eventImage2
  },
  {
    title: "Family Unity Dialogue",
    date: "2026-05-08",
    location: "EUTR Community Center",
    tag: "Community",
    description: "Public forum on child protection and social cohesion.",
    highlights: [
      "Community dialogue on safeguarding",
      "Referral pathways for vulnerable children",
      "Joint commitments for social cohesion"
    ],
    image: eventImage3
  }
];

const normalizeEvents = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

const resolveImage = (value) => {
  if (!value || typeof value !== "string") return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
    return value;
  }
  if (value.startsWith("/")) return value;
  return `/${value}`;
};

const fallbackImages = [eventImage1, eventImage2, eventImage3];

const toHighlights = (event) => {
  if (Array.isArray(event?.highlights) && event.highlights.length) return event.highlights;
  if (Array.isArray(event?.agenda) && event.agenda.length) return event.agenda;
  if (Array.isArray(event?.activities) && event.activities.length) return event.activities;
  if (typeof event?.highlights === "string") {
    return event.highlights
      .split(/[.;]\s+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const mapEvent = (event, index = 0) => ({
  title: event?.title || "Event",
  date: event?.date || "TBA",
  location: event?.location || "TBA",
  tag: event?.tag || event?.category || "Community",
  description:
    event?.description || event?.copy || event?.details || "Event details coming soon.",
  highlights: toHighlights(event),
  image:
    resolveImage(event?.image) ||
    resolveImage(event?.photo) ||
    resolveImage(event?.cover_image) ||
    fallbackImages[index % fallbackImages.length]
});

function Events() {
  const [events, setEvents] = useState(fallbackEvents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      try {
        const response = await fetch("/api/events/");
        if (!response.ok) throw new Error("Failed to load events");
        const data = await response.json();
        const normalized = normalizeEvents(data);
        if (isMounted && normalized.length) {
          setEvents(normalized.map((event, index) => mapEvent(event, index)));
        }
      } catch (error) {
        if (isMounted) {
          setEvents(fallbackEvents);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <section className="hero page-image-hero">
        <img className="hero-bg" src={heroImage} alt="Events hero" />
        <div className="container hero-content">
          <div className="row align-items-center gy-4">
            <div className="col-lg-8 section-reveal">
              <div className="badge-pill mb-3">Events</div>
              <h1 className="hero-title">Community gatherings and workshops.</h1>
              <p className="hero-copy mb-0">
                Upcoming events are synced from your backend and shown here for navigation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          {loading && <p className="text-muted">Loading events...</p>}
          <div className="row gy-4 mt-1">
            {events.map((event, index) => (
              <div className="col-12" key={`${event.title}-${index}`}>
                <div className="event-feature">
                  <div className={`row g-0 align-items-center ${index % 2 === 1 ? "flex-row-reverse" : ""}`}>
                    <div className="col-lg-6">
                      <img
                        className="event-feature-image"
                        src={resolveImage(event.image) || fallbackImages[index % fallbackImages.length]}
                        alt={event.title}
                      />
                    </div>
                    <div className="col-lg-6">
                      <div className="event-feature-content">
                        <div className="event-tag">{event.tag}</div>
                        <h3>{event.title}</h3>
                        <div className="event-meta">
                          <span>{event.date}</span>
                          <span>{event.location}</span>
                        </div>
                        <p className="text-muted">{event.description}</p>
                        {event.highlights?.length > 0 && (
                          <ul className="text-muted mb-0">
                            {event.highlights.map((item, itemIndex) => (
                              <li key={`${event.title}-highlight-${itemIndex}`} className="mb-1">
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Events;
