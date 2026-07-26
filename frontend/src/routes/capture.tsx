import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Layout } from "../components/Layout";
import {
  Upload,
  Wand2,
  X,
  Sparkles,
  Check,
  Loader2,
  ImageIcon,
  Video,
  Link as LinkIcon,
  Film,
} from "lucide-react";
import api from "../lib/api";

export const Route = createFileRoute("/capture")({
  head: () => ({ meta: [{ title: "Fashion Capture — FashionOS" }] }),
  component: CapturePage,
});

const STEPS = [
  "Detecting clothing",
  "Understanding colors",
  "Finding similar products",
  "Building outfit",
];

type Mode = "image" | "video" | "imageUrl" | "videoUrl";

const TABS: { id: Mode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "image", label: "Image Upload", icon: ImageIcon },
  { id: "video", label: "Video Upload", icon: Video },
  { id: "imageUrl", label: "Image URL", icon: LinkIcon },
  { id: "videoUrl", label: "Video URL", icon: Film },
];

function CapturePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("image");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const hasInput =
    (mode === "image" && !!imageFile) ||
    (mode === "video" && !!videoFile) ||
    (mode === "imageUrl" && imageUrl.trim().length > 0) ||
    (mode === "videoUrl" && videoUrl.trim().length > 0) ||
    prompt.trim().length > 0;

  const analyze = async () => {
  if (!hasInput) return;

  try {
    let response;

    // -------------------------------
    // IMAGE UPLOAD
    // -------------------------------
    if (mode === "image" && imageFile) {
      const fd = new FormData();
      fd.append("file", imageFile);

      response = await api.post("/api/captures/image", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    // -------------------------------
    // VIDEO UPLOAD
    // -------------------------------
    else if (mode === "video" && videoFile) {
      const fd = new FormData();
      fd.append("file", videoFile);

      response = await api.post("/api/captures/video", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    // -------------------------------
    // IMAGE URL
    // -------------------------------
    else if (mode === "imageUrl") {
      response = await api.post("/api/captures/image-url", {
        url: imageUrl,
      });
    }

    // -------------------------------
    // VIDEO URL / Instagram
    // -------------------------------
    else if (mode === "videoUrl") {
      response = await api.post("/api/captures/video-url", {
        url: videoUrl,
      });
    }

    if (!response) return;

    const captureId = response.data.capture.id;

    navigate({
      to: "/processing",
      search: {
        captureId,
        prompt,
      },
    });
  } catch (err) {
    console.error(err);
    alert("Failed to upload capture.");
  }
};  

  // Kept for compatibility; navigation now handled via /processing route.
  void loading; void setLoading; void step; void setStep;

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-fade-up max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI Fashion Capture
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
            Capture your vibe
          </h1>
          <p className="mt-3 text-muted-foreground">
            Choose a capture method — upload, paste a link, or describe your look. Our AI does the rest.
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-8 card-elevated p-2 inline-flex flex-wrap gap-1 animate-fade-up">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = mode === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setMode(t.id)}
                className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div className="mt-6 card-elevated p-6 sm:p-8 animate-fade-up" key={mode}>
          <div className="animate-fade-up">
            {mode === "image" && (
              <FileDropzone
                accept="image/*"
                file={imageFile}
                preview={imagePreview}
                onFile={(f) => {
                  setImageFile(f);
                  setImagePreview(URL.createObjectURL(f));
                }}
                onClear={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                kind="image"
              />
            )}

            {mode === "video" && (
              <FileDropzone
                accept="video/*"
                file={videoFile}
                preview={videoPreview}
                onFile={(f) => {
                  setVideoFile(f);
                  setVideoPreview(URL.createObjectURL(f));
                }}
                onClear={() => {
                  setVideoFile(null);
                  setVideoPreview(null);
                }}
                kind="video"
              />
            )}

            {mode === "imageUrl" && (
              <UrlInput
                value={imageUrl}
                onChange={setImageUrl}
                placeholder="https://example.com/outfit.jpg"
                kind="image"
              />
            )}

            {mode === "videoUrl" && (
              <UrlInput
                value={videoUrl}
                onChange={setVideoUrl}
                placeholder="https://example.com/lookbook.mp4"
                kind="video"
              />
            )}
          </div>

          {/* Prompt */}
          <div className="mt-8">
            <label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
              <Wand2 className="h-4 w-4 text-primary" /> Fashion Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Recommend a casual blue outfit"
              className="mt-3 h-28 w-full rounded-2xl border border-border bg-background p-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft/60 resize-none transition-all"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {["Casual", "Party", "Formal", "Streetwear", "Boho"].map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    setPrompt((p) => (p ? `${p}, ${t.toLowerCase()}` : t.toLowerCase()))
                  }
                  className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium hover:bg-primary-soft hover:text-primary transition-colors"
                >
                  + {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={analyze}
            disabled={!hasInput}
            className="btn-primary mt-8 w-full rounded-full py-4 text-base font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
          >
            <Sparkles className="h-5 w-5" /> Analyze with AI
          </button>
        </div>
      </div>
    </Layout>
  );
}

function FileDropzone({
  accept,
  file,
  preview,
  onFile,
  onClear,
  kind,
}: {
  accept: string;
  file: File | null;
  preview: string | null;
  onFile: (f: File) => void;
  onClear: () => void;
  kind: "image" | "video";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleSelect = (f: File) => {
    const type = kind === "image" ? "image/" : "video/";
    if (!f.type.startsWith(type)) return;
    onFile(f);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleSelect(f);
        }}
        className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer aspect-[4/3] grid place-items-center overflow-hidden ${
          dragOver
            ? "border-primary bg-primary-soft/60 scale-[1.01]"
            : "border-border hover:border-primary hover:bg-primary-soft/30 bg-muted/30"
        }`}
      >
        <div className="text-center px-6 pointer-events-none">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 animate-float">
            <Upload className="h-7 w-7" />
          </div>
          <p className="mt-4 text-sm font-semibold">
            {dragOver
              ? "Drop it like it's hot 🔥"
              : `Drag & drop your ${kind} here`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or <span className="text-primary font-medium">browse files</span> ·{" "}
            {kind === "image" ? "PNG, JPG up to 10MB" : "MP4, MOV up to 50MB"}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleSelect(e.target.files[0])}
        />
      </div>

      <PreviewPane preview={preview} kind={kind} onClear={file ? onClear : undefined} />
    </div>
  );
}

function UrlInput({
  value,
  onChange,
  placeholder,
  kind,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  kind: "image" | "video";
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
          <LinkIcon className="h-4 w-4 text-primary" /> {kind === "image" ? "Image" : "Video"} URL
        </label>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft/60 transition-all"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Paste a direct link. Preview appears live on the right.
        </p>
      </div>
      <PreviewPane preview={value.trim() || null} kind={kind} />
    </div>
  );
}

function PreviewPane({
  preview,
  kind,
  onClear,
}: {
  preview: string | null;
  kind: "image" | "video";
  onClear?: () => void;
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-muted/40 aspect-[4/3] grid place-items-center border border-border">
      {preview ? (
        <>
          {kind === "image" ? (
            <img
              src={preview}
              alt="preview"
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => ((e.currentTarget.style.opacity = "0.2"))}
            />
          ) : (
            <video
              src={preview}
              controls
              className="absolute inset-0 h-full w-full object-cover bg-black"
            />
          )}
          {onClear && (
            <button
              onClick={onClear}
              className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-3 py-1.5 text-xs font-medium text-foreground hover:text-primary shadow-md"
            >
              <X className="h-3.5 w-3.5" /> Remove
            </button>
          )}
        </>
      ) : (
        <div className="text-center px-8">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary">
            {kind === "image" ? <ImageIcon className="h-7 w-7" /> : <Video className="h-7 w-7" />}
          </div>
          <p className="mt-4 text-sm font-semibold">Preview</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Your {kind} will appear here
          </p>
        </div>
      )}
    </div>
  );
}

function AnalyzingView({
  preview,
  step,
  prompt,
}: {
  preview: string | null;
  step: number;
  prompt: string;
}) {
  const progress = Math.min(100, Math.round((step / STEPS.length) * 100));
  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="card-elevated p-8 sm:p-12 text-center">
          <div className="relative mx-auto h-28 w-28">
            <div className="absolute inset-0 rounded-full bg-primary-soft animate-ping opacity-70" />
            <div className="absolute inset-2 rounded-full bg-primary-soft" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/40 animate-float">
                <Sparkles className="h-8 w-8" />
              </div>
            </div>
          </div>

          <h2 className="mt-8 text-2xl sm:text-3xl font-bold">AI is analyzing your outfit...</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {prompt ? `"${prompt}"` : "Reading colors, silhouette, and vibe"}
          </p>

          {preview && (
            <div className="mx-auto mt-6 h-24 w-24 rounded-2xl overflow-hidden ring-4 ring-primary-soft">
              <img src={preview} alt="analyzing" className="h-full w-full object-cover" />
            </div>
          )}

          <div className="mt-8 mx-auto max-w-md">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-medium text-muted-foreground">{progress}%</p>
          </div>

          <ul className="mt-8 mx-auto max-w-md space-y-3 text-left">
            {STEPS.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li
                  key={label}
                  className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                    done
                      ? "border-primary/30 bg-primary-soft/40"
                      : active
                        ? "border-primary bg-primary-soft/60 scale-[1.02] shadow-sm"
                        : "border-border bg-muted/30 opacity-60"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full shrink-0 ${
                      done || active
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border border-border text-muted-foreground"
                    }`}
                  >
                    {done ? (
                      <Check className="h-4 w-4" />
                    ) : active ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="text-xs font-semibold">{i + 1}</span>
                    )}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      done || active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
