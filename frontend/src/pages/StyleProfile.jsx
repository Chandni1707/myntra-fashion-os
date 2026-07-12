import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

const styleOptions = [
  "Streetwear",
  "Minimalist",
  "Old Money",
  "Y2K",
  "Indo-Western",
  "Casual",
  "Formal",
  "Athleisure",
];

const colorOptions = [
  "Black",
  "White",
  "Beige",
  "Navy",
  "Grey",
  "Brown",
  "Red",
  "Blue",
  "Green",
  "Pink",
];

const fitOptions = ["Slim", "Regular", "Relaxed", "Oversized"];

function StyleProfile() {
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState({
    preferred_styles: [],
    preferred_colors: [],
    preferred_fit: "regular",
    default_budget: 3000,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/api/users/me");
        const userPreferences = response.data.preferences || {};

        setPreferences({
          preferred_styles: userPreferences.styles || [],
          preferred_colors: userPreferences.colors || [],
          preferred_fit: userPreferences.fit || "regular",
          default_budget: userPreferences.default_budget || 3000,
        });
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }

        setError("Could not load your style profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const toggleStyle = (style) => {
    const value = style.toLowerCase();

    setPreferences((previous) => ({
      ...previous,
      preferred_styles: previous.preferred_styles.includes(value)
        ? previous.preferred_styles.filter((item) => item !== value)
        : [...previous.preferred_styles, value],
    }));
  };

  const toggleColor = (color) => {
    const value = color.toLowerCase();

    setPreferences((previous) => ({
      ...previous,
      preferred_colors: previous.preferred_colors.includes(value)
        ? previous.preferred_colors.filter((item) => item !== value)
        : [...previous.preferred_colors, value],
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (preferences.preferred_styles.length === 0) {
      setError("Choose at least one style.");
      return;
    }

    if (preferences.preferred_colors.length === 0) {
      setError("Choose at least one preferred color.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await api.put("/api/users/me/preferences", preferences);

      setMessage("Your style profile has been updated successfully.");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Could not update your style profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading your style profile...</p>;
  }

  return (
    <div>
      <button type="button" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      <h1>My Style Profile</h1>

      <p>
        Your fashion identity can evolve. Change these preferences anytime.
      </p>

      <form onSubmit={handleSave}>
        <section>
          <h2>My Current Styles</h2>

          {styleOptions.map((style) => {
            const selected = preferences.preferred_styles.includes(
              style.toLowerCase()
            );

            return (
              <button
                key={style}
                type="button"
                onClick={() => toggleStyle(style)}
              >
                {selected ? `✓ ${style}` : style}
              </button>
            );
          })}
        </section>

        <section>
          <h2>My Preferred Colors</h2>

          {colorOptions.map((color) => {
            const selected = preferences.preferred_colors.includes(
              color.toLowerCase()
            );

            return (
              <button
                key={color}
                type="button"
                onClick={() => toggleColor(color)}
              >
                {selected ? `✓ ${color}` : color}
              </button>
            );
          })}
        </section>

        <section>
          <h2>My Preferred Fit</h2>

          {fitOptions.map((fit) => {
            const value = fit.toLowerCase();
            const selected = preferences.preferred_fit === value;

            return (
              <button
                key={fit}
                type="button"
                onClick={() =>
                  setPreferences((previous) => ({
                    ...previous,
                    preferred_fit: value,
                  }))
                }
              >
                {selected ? `✓ ${fit}` : fit}
              </button>
            );
          })}
        </section>

        <section>
          <h2>My Typical Fashion Budget</h2>

          <input
            type="number"
            min="1"
            value={preferences.default_budget}
            onChange={(event) =>
              setPreferences((previous) => ({
                ...previous,
                default_budget: Number(event.target.value),
              }))
            }
            required
          />
        </section>

        {message && <p>{message}</p>}
        {error && <p>{error}</p>}

        <button type="submit" disabled={saving}>
          {saving ? "Saving Changes..." : "Save My Style"}
        </button>
      </form>
    </div>
  );
}

export default StyleProfile;