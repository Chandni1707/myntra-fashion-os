import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

function FashionCapture() {
  const navigate = useNavigate();

  const [inputMode, setInputMode] = useState("upload");
  const [mediaType, setMediaType] = useState("image");

  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaUrl, setMediaUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    setSelectedFile(file || null);
    setError("");
    setResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const endpoint =
      mediaType === "image"
        ? "/api/captures/image"
        : "/api/captures/video";

    const response = await api.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  };

  const handleURL = async () => {
    if (!mediaUrl.trim()) {
      setError("Please enter a URL.");
      return;
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setResult(null);

      let responseData;

      if (inputMode === "upload") {
        responseData = await handleUpload();
      } else {
        responseData = await handleURL();
      }

      if (responseData) {
        setResult(responseData);
      }
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Could not process your fashion inspiration."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
      >
        ← Back to Dashboard
      </button>

      <h1>Universal Fashion Capture</h1>

      <p>
        Found a look you love? Upload it or paste a public URL.
        Fashion OS will turn inspiration from anywhere into something
        personal to you.
      </p>

      <div>
        <button
          type="button"
          onClick={() => {
            setInputMode("upload");
            setResult(null);
            setError("");
          }}
        >
          Upload
        </button>

        <button
          type="button"
          onClick={() => {
            setInputMode("url");
            setResult(null);
            setError("");
          }}
        >
          Paste URL
        </button>
      </div>

      <div>
        <button
          type="button"
          onClick={() => {
            setMediaType("image");
            setSelectedFile(null);
            setResult(null);
            setError("");
          }}
        >
          Image
        </button>

        <button
          type="button"
          onClick={() => {
            setMediaType("video");
            setSelectedFile(null);
            setResult(null);
            setError("");
          }}
        >
          Video
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {inputMode === "upload" ? (
          <div>
            <h2>
              Upload {mediaType === "image" ? "an Image" : "a Video"}
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
                  Selected file: {selectedFile.name}
                </p>

                <p>
                  Size:{" "}
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
              onChange={(event) => setMediaUrl(event.target.value)}
            />
          </div>
        )}

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading
            ? "Processing Inspiration..."
            : "Capture Inspiration"}
        </button>
      </form>

      {result && (
        <section>
          <h2>Capture Successful</h2>

          <p>{result.message}</p>

          <p>
            Capture ID: {result.capture.id}
          </p>

          <p>
            Input type: {result.capture.input_type}
          </p>

          <p>
            Status: {result.capture.status}
          </p>

          <p>
            Your inspiration has been saved. AI fashion analysis
            will be connected in the next stage.
          </p>
        </section>
      )}
    </div>
  );
}

export default FashionCapture;