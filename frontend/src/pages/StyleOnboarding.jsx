import { useState } from "react";
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

const fitOptions = [
  "Slim",
  "Regular",
  "Relaxed",
  "Oversized",
];

function StyleOnboarding() {
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState({
    preferred_styles: [],
    preferred_colors: [],
    preferred_fit: "Regular",
    default_budget: 3000,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleStyle = (style) => {
    setPreferences((previous) => ({
      ...previous,

      preferred_styles: previous.preferred_styles.includes(style)
        ? previous.preferred_styles.filter((item) => item !== style)
        : [...previous.preferred_styles, style],
    }));
  };

  const toggleColor = (color) => {
    setPreferences((previous) => ({
      ...previous,

      preferred_colors: previous.preferred_colors.includes(color)
        ? previous.preferred_colors.filter((item) => item !== color)
        : [...previous.preferred_colors, color],
    }));
  };

  const handleSubmit = async (event) => {
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
      setLoading(true);
      setError("");

      await api.put("/api/users/me/preferences", {
        preferred_styles: preferences.preferred_styles.map((style) =>
          style.toLowerCase()
        ),

        preferred_colors: preferences.preferred_colors.map((color) =>
          color.toLowerCase()
        ),

        preferred_fit: preferences.preferred_fit.toLowerCase(),

        default_budget: Number(preferences.default_budget),
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Could not save your preferences. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>What's Your Style Right Now?</h1>

      <p>
        Choose what you're into today. You can change these preferences
        anytime as your taste evolves.
      </p>

      <form onSubmit={handleSubmit}>
        <section>
          <h2>Choose Your Styles</h2>

          <div>
            {styleOptions.map((style) => {
              const selected =
                preferences.preferred_styles.includes(style);

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
          </div>
        </section>

        <section>
          <h2>Choose Your Preferred Colors</h2>

          <div>
            {colorOptions.map((color) => {
              const selected =
                preferences.preferred_colors.includes(color);

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
          </div>
        </section>

        <section>
          <h2>Preferred Fit</h2>

          <div>
            {fitOptions.map((fit) => {
              const selected =
                preferences.preferred_fit === fit;

              return (
                <button
                  key={fit}
                  type="button"
                  onClick={() =>
                    setPreferences((previous) => ({
                      ...previous,
                      preferred_fit: fit,
                    }))
                  }
                >
                  {selected ? `✓ ${fit}` : fit}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2>Typical Fashion Budget</h2>

          <p>
            We'll use this as your default, but you can always set a
            different budget for a specific look or event.
          </p>

          <input
            type="number"
            min="1"
            value={preferences.default_budget}
            onChange={(event) =>
              setPreferences((previous) => ({
                ...previous,
                default_budget: event.target.value,
              }))
            }
            required
          />
        </section>

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading
            ? "Building Your Style Profile..."
            : "Build My Style Profile"}
        </button>
      </form>
    </div>
  );
}

export default StyleOnboarding;