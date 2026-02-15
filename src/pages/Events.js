import React, { useEffect, useState } from "react";

const fallbackEvents = [
  {
    title: "Back-to-School Learning Fair",
    date: "2026-03-20",
    location: "Kakuma Learning Hub",
    tag: "Education",
    description: "Enrollment support, school kits, and parent orientation."
  },
  {
    title: "Women in Artistry Showcase",
    date: "2026-04-12",
    location: "Community Market Hall",
    tag: "Livelihoods",
    description: "Community exhibition of crochet, beadwork, and design."
  },
  {
    title: "Family Unity Dialogue",
    date: "2026-05-08",
    location: "EUTR Community Center",
    tag: "Community",
    description: "Public forum on child protection and social cohesion."
  }
];

const normalizeEvents = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

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
          setEvents(
            normalized.map((event) => ({
              title: event?.title || "Event",
              date: event?.date || "TBA",
              location: event?.location || "TBA",
              tag: event?.tag || event?.category || "Community",
              description:
                event?.description || event?.copy || "Event details coming soon."
            }))
          );
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
    <section className="section section-tight">
      <div className="container">
        <div className="section-title">Events</div>
        <h1 className="section-heading">Community gatherings and workshops.</h1>
        <p className="section-copy">
          Upcoming events are synced from your backend and shown here for navigation.
        </p>
        {loading && <p className="text-muted">Loading events...</p>}
        <div className="row gy-3 mt-1">
          {events.map((event, index) => (
            <div className="col-lg-4" key={`${event.title}-${index}`}>
              <div className="event-card">
                <div className="event-tag">{event.tag}</div>
                <h5>{event.title}</h5>
                <div className="event-meta">
                  <span>{event.date}</span>
                  <span>{event.location}</span>
                </div>
                <p className="text-muted mb-0">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Events;
