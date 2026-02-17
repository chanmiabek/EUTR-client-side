import React, { useEffect, useMemo, useState } from "react";
import { getApiUrl } from "../utils/api";

const fallbackVideo = {
  title: "Event Overview",
  youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
};

const extractYoutubeId = (url) => {
  if (!url) return "";

  const cleaned = String(url).trim();
  const shortMatch = cleaned.match(/youtu\.be\/([^?&/]+)/i);
  if (shortMatch) return shortMatch[1];

  const watchMatch = cleaned.match(/[?&]v=([^?&/]+)/i);
  if (watchMatch) return watchMatch[1];

  const embedMatch = cleaned.match(/youtube\.com\/embed\/([^?&/]+)/i);
  if (embedMatch) return embedMatch[1];

  return "";
};

function EventOverviewVideoSection({ className = "section section-tight" }) {
  const [video, setVideo] = useState(fallbackVideo);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadVideo = async () => {
      try {
        const response = await fetch(getApiUrl("/api/event-overview-video/"));
        if (!response.ok) throw new Error("No event overview video found");
        const data = await response.json();
        if (isMounted && data?.youtube_url) {
          setVideo({
            title: data.title || fallbackVideo.title,
            youtube_url: data.youtube_url
          });
        }
      } catch (error) {
        if (isMounted) setVideo(fallbackVideo);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadVideo();
    return () => {
      isMounted = false;
    };
  }, []);

  const embedUrl = useMemo(() => {
    const youtubeId = extractYoutubeId(video?.youtube_url);
    return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : "";
  }, [video]);

  return (
    <section className={className}>
      <div className="container">
        <div className="film-card">
          <div className="row align-items-center gy-4 mb-3">
            <div className="col-lg-8">
              <h2>Event Overview Video</h2>
              <p className="section-copy mb-0">
                {video?.title || "Watch our event overview on YouTube."}
              </p>
            </div>
          </div>
          {loading && <p className="text-muted mb-3">Loading video...</p>}
          {embedUrl ? (
            <div className="ratio ratio-16x9 rounded overflow-hidden">
              <iframe
                title="Event overview video"
                src={embedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <p className="text-muted mb-0">No video available yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default EventOverviewVideoSection;
