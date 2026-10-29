import { useState } from "react";
import { Link } from "react-router-dom";

// Expo card with the floor plan image as the cover (used on Home and Expos)
export default function ExpoCard({ expo }) {
  const [failed, setFailed] = useState(false);
  const showImage = expo.floorPlanImage && !failed;

  return (
    <article className="card expo-card">
      <Link to={`/expos/${expo._id}`} className={`cover ${showImage ? "" : "empty"}`} aria-label={`Open ${expo.title}`}>
        {showImage ? (
          <img src={expo.floorPlanImage} alt={`Floor plan of ${expo.title}`} loading="lazy" onError={() => setFailed(true)} />
        ) : (
          <span className="cover-fallback">🗺️ Floor plan coming soon</span>
        )}
      </Link>
      <h2>{expo.title}</h2>
      {expo.status !== "published" && <span className="chip amber">{expo.status}</span>}
      <p className="muted">
        {new Date(expo.startDate).toLocaleDateString()} – {new Date(expo.endDate).toLocaleDateString()}
        <br />
        {expo.location}
      </p>
      {expo.theme && <p>Theme: {expo.theme}</p>}
      <Link className="btn" to={`/expos/${expo._id}`}>View expo</Link>
    </article>
  );
}
