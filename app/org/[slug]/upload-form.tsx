"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadForm({ slug }: { slug: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Get presigned URL
      const presignRes = await fetch(`/api/org/${slug}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!presignRes.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, key, orgId } = await presignRes.json();

      // Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Failed to upload file");

      // Save track to database
      const trackRes = await fetch(`/api/org/${slug}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          s3Key: key,
        }),
      });

      if (!trackRes.ok) throw new Error("Failed to save track");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      handleUpload(file);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          dragActive && "border-primary bg-primary/5",
          loading && "opacity-50 pointer-events-none",
          success && "border-green-500 bg-green-50"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          disabled={loading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center gap-2">
          {loading ? (
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          ) : success ? (
            <CheckCircle className="h-8 w-8 text-green-500" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}

          <div>
            <p className="font-medium">
              {loading
                ? "Uploading..."
                : success
                ? "Upload complete!"
                : "Drop audio file here or click to upload"}
            </p>
            {!loading && !success && (
              <p className="text-sm text-muted-foreground mt-1">
                Supports MP3, WAV, FLAC, and other audio formats
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}
