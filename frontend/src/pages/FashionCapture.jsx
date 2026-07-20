import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

function FashionCapture() {
  const navigate = useNavigate();

  // Capture input states
  const [inputMode, setInputMode] = useState("upload");
  const [mediaType, setMediaType] = useState("image");

  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaUrl, setMediaUrl] = useState("");

  // Capture request states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Fashion transformation states
  const [fashionPrompt, setFashionPrompt] = useState("");
  const [transformLoading, setTransformLoading] = useState(false);
  const [transformResult, setTransformResult] = useState(null);

  // Prompt suggestion chips
  const suggestions = [
    "Make it more Indian",
    "Complete this look",
    "Keep it under ₹3000",
    "Match my personal style",
    "Make it farewell-ready",
  ];

  // Reset current capture
  const resetCapture = () => {
    setSelectedFile(null);
    setMediaUrl("");
    setResult(null);
    setError("");

    setFashionPrompt("");
    setTransformResult(null);
  };

  // Change between Upload and URL mode
  const handleModeChange = (mode) => {
    setInputMode(mode);
    resetCapture();
  };

  // Change between Image and Video
  const handleMediaTypeChange = (type) => {
    setMediaType(type);
    resetCapture();
  };

  // Handle selected image or video
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setSelectedFile(file || null);
    setResult(null);
    setFashionPrompt("");
    setTransformResult(null);
    setError("");
  };

  // Upload image or video
  const uploadFile = async () => {
    if (!selectedFile) {
      throw new Error("Please select a file first.");
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const endpoint =
      mediaType === "image"
        ? "/api/captures/image"
        : "/api/captures/video";

    const response = await api.post(endpoint, formData);

    return response.data;
  };

  // Submit image URL or video URL
  const submitURL = async () => {
    if (!mediaUrl.trim()) {
      throw new Error("Please enter a public URL.");
    }

    const endpoint =
      mediaType === "image"
        ? "/api/captures/image-url"
        : "/api/captures/video-url";

    const response = await api.post(endpoint, {
      url: mediaUrl.trim(),
    });

    return response.data;
  };

  // Capture inspiration
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setResult(null);
      setTransformResult(null);
      setFashionPrompt("");

      let responseData;

      if (inputMode === "upload") {
        responseData = await uploadFile();
      } else {
        responseData = await submitURL();
      }

      setResult(responseData);
    } catch (err) {
      console.error("Capture error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Could not capture your fashion inspiration."
      );
    } finally {
      setLoading(false);
    }
  };

  // Add a suggestion to the natural-language prompt
  const addSuggestion = (suggestion) => {
    setFashionPrompt((previous) => {
      if (!previous.trim()) {
        return suggestion;
      }

      return `${previous}, ${suggestion.toLowerCase()}`;
    });

    setTransformResult(null);
    setError("");
  };

  // Send fashion prompt to backend
  const handleTransform = async () => {
    if (!result?.capture?.id) {
      setError("Please capture an image, video, or URL first.");
      return;
    }

    if (!fashionPrompt.trim()) {
      setError(
        "Please tell Fashion OS what you want to do with this look."
      );
      return;
    }

    try {
      setTransformLoading(true);
      setError("");
      setTransformResult(null);

      const response = await api.post(
        `/api/captures/${result.capture.id}/transform`,
        {
          prompt: fashionPrompt.trim(),
        }
      );

      setTransformResult(response.data);
    } catch (err) {
      console.error("Transform error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Could not understand your fashion instruction."
      );
    } finally {
      setTransformLoading(false);
    }
  };

  return (
    <div>
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
      >
        ← Back to Dashboard
      </button>

      <h1>Universal Fashion Capture</h1>

      <p>
        Found a look you love? Upload an image or video, or paste a
        public media URL. Fashion OS will turn inspiration from
        anywhere into something personal to you.
      </p>

      {/* Upload / URL selection */}
      <div>
        <button
          type="button"
          onClick={() => handleModeChange("upload")}
        >
          {inputMode === "upload" ? "✓ Upload" : "Upload"}
        </button>

        <button
          type="button"
          onClick={() => handleModeChange("url")}
        >
          {inputMode === "url" ? "✓ Paste URL" : "Paste URL"}
        </button>
      </div>

      {/* Image / Video selection */}
      <div>
        <button
          type="button"
          onClick={() => handleMediaTypeChange("image")}
        >
          {mediaType === "image" ? "✓ Image" : "Image"}
        </button>

        <button
          type="button"
          onClick={() => handleMediaTypeChange("video")}
        >
          {mediaType === "video" ? "✓ Video" : "Video"}
        </button>
      </div>

      {/* Capture form */}
      <form onSubmit={handleSubmit}>
        {inputMode === "upload" ? (
          <div>
            <h2>
              Upload{" "}
              {mediaType === "image" ? "an Image" : "a Video"}
            </h2>

            <input
              type="file"
              accept={
                mediaType === "image"
                  ? "image/jpeg,image/png,image/webp"
                  : "video/mp4,video/quicktime,video/webm"
              }
              onChange={handleFileChange}
            />

            {selectedFile && (
              <div>
                <p>
                  <strong>Selected:</strong> {selectedFile.name}
                </p>

                <p>
                  <strong>Size:</strong>{" "}
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2>
              Paste a Public{" "}
              {mediaType === "image" ? "Image" : "Video"} URL
            </h2>

            <input
              type="url"
              placeholder={
                mediaType === "image"
                  ? "https://example.com/fashion-image.jpg"
                  : "https://example.com/fashion-video"
              }
              value={mediaUrl}
              onChange={(event) => {
                setMediaUrl(event.target.value);
                setResult(null);
                setTransformResult(null);
                setError("");
              }}
              required
            />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? "Capturing Inspiration..."
            : "Capture Inspiration"}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <div>
          <p>{error}</p>
        </div>
      )}

      {/* Successful capture result */}
      {result && (
        <section>
          <h2>Capture Successful ✓</h2>

          <p>{result.message}</p>

          <p>
            <strong>Capture ID:</strong>{" "}
            {result.capture.id}
          </p>

          <p>
            <strong>Input type:</strong>{" "}
            {result.capture.input_type}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {result.capture.status}
          </p>

          <hr />

          {/* Natural-language fashion prompt */}
          <div>
            <h3>What do you want to do with this look?</h3>

            <p>
              Tell Fashion OS naturally. You can change the style,
              set a budget, choose an occasion, preserve an item,
              replace something, or complete the entire outfit.
            </p>

            <textarea
              value={fashionPrompt}
              onChange={(event) => {
                setFashionPrompt(event.target.value);
                setTransformResult(null);
                setError("");
              }}
              placeholder='For example: "Make this more Indian, complete the look, and keep it under ₹4000 for my college farewell."'
              rows={5}
              maxLength={500}
            />

            <p>
              {fashionPrompt.length}/500 characters
            </p>

            {/* Suggestion chips */}
            <div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleTransform}
              disabled={
                transformLoading || !fashionPrompt.trim()
              }
            >
              {transformLoading
                ? "Understanding Your Style Request..."
                : "Transform My Look"}
            </button>
          </div>

          {/* Parsed intent result */}
          {transformResult && (
            <div>
              <hr />

              <h3>
                Fashion OS understood your request ✓
              </h3>

              <p>
                <strong>Your instruction:</strong>{" "}
                {
                  transformResult.parsed_intent
                    .original_prompt
                }
              </p>

              <p>
                <strong>Target style:</strong>{" "}
                {transformResult.parsed_intent.target_style ||
                  "No specific style"}
              </p>

              <p>
                <strong>Budget:</strong>{" "}
                {transformResult.parsed_intent.budget_max
                  ? `₹${transformResult.parsed_intent.budget_max}`
                  : "No budget limit specified"}
              </p>

              <p>
                <strong>Occasion:</strong>{" "}
                {transformResult.parsed_intent.occasion ||
                  "No specific occasion"}
              </p>

              <p>
                <strong>Actions:</strong>{" "}
                {transformResult.parsed_intent.actions.length > 0
                  ? transformResult.parsed_intent.actions.join(", ")
                  : "No specific action detected"}
              </p>

              <p>
                <strong>Keep:</strong>{" "}
                {transformResult.parsed_intent.preserve_items.length >
                0
                  ? transformResult.parsed_intent.preserve_items.join(
                      ", "
                    )
                  : "Nothing specifically requested"}
              </p>

              <p>
                <strong>Replace:</strong>{" "}
                {transformResult.parsed_intent.replace_items.length >
                0
                  ? transformResult.parsed_intent.replace_items.join(
                      ", "
                    )
                  : "Nothing specifically requested"}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default FashionCapture;