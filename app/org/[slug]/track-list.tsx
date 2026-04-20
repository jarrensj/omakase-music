"use client";

import { useState } from "react";
import { Play, Square, Download, MessageCircle, Send, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type Note = {
  id: string;
  content: string;
  created_at: string;
  users: { email: string } | null;
};

type Track = {
  id: string;
  filename: string;
  created_at: string;
  users: { email: string } | null;
};

function TrackNotes({ trackId, slug }: { trackId: string; slug: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);

  const loadNotes = async () => {
    if (loaded) return;
    const res = await fetch(`/api/org/${slug}/tracks/${trackId}/notes`);
    const data = await res.json();
    setNotes(data);
    setLoaded(true);
  };

  const toggleOpen = () => {
    if (!isOpen && !loaded) {
      loadNotes();
    }
    setIsOpen(!isOpen);
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    setLoading(true);

    const res = await fetch(`/api/org/${slug}/tracks/${trackId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newNote }),
    });

    if (res.ok) {
      const note = await res.json();
      setNotes([...notes, note]);
      setNewNote("");
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 h-8 px-2"
        onClick={toggleOpen}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-xs">{loaded ? `${notes.length}` : "Notes"}</span>
      </Button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          <div className="space-y-2">
            {notes.length === 0 && loaded && (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            )}
            {notes.map((note) => (
              <div key={note.id} className="text-sm bg-muted/50 rounded-lg p-3">
                <p className="text-foreground">{note.content}</p>
                <p className="text-muted-foreground text-xs mt-1.5">
                  {note.users?.email} &middot; {formatDate(note.created_at)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="h-9 text-sm"
              onKeyDown={(e) => e.key === "Enter" && addNote()}
            />
            <Button
              onClick={addNote}
              disabled={loading || !newNote.trim()}
              size="sm"
              className="h-9 w-9 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TrackList({ tracks, slug }: { tracks: Track[]; slug: string }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const playTrack = async (trackId: string) => {
    if (playingId === trackId) {
      setPlayingId(null);
      setAudioUrl(null);
      setProgress(0);
      setDuration(0);
      return;
    }

    const res = await fetch(`/api/org/${slug}/tracks/${trackId}/url`);
    const { url } = await res.json();
    setAudioUrl(url);
    setPlayingId(trackId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (tracks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Music className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No tracks uploaded yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload your first track to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tracks.map((track) => (
        <Card
          key={track.id}
          className={cn(
            "transition-colors",
            playingId === track.id && "border-primary/50 bg-primary/5"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => playTrack(track.id)}
                className={cn(
                  "h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-lg transition-colors",
                  playingId === track.id
                    ? "bg-primary text-primary-foreground"
                    : "border border-input bg-background hover:bg-muted"
                )}
              >
                {playingId === track.id ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{track.filename}</p>
                <p className="text-sm text-muted-foreground">
                  {track.users?.email || "Unknown"} &middot; {formatDate(track.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <TrackNotes trackId={track.id} slug={slug} />
                <a
                  href={`/api/org/${slug}/tracks/${track.id}/download`}
                  download
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>

            {playingId === track.id && audioUrl && (
              <div className="mt-4 space-y-2">
                <audio
                  ref={(el) => setAudioElement(el)}
                  src={audioUrl}
                  autoPlay
                  onTimeUpdate={(e) => {
                    const audio = e.currentTarget;
                    setProgress(audio.currentTime);
                    setDuration(audio.duration || 0);
                  }}
                  onEnded={() => {
                    setPlayingId(null);
                    setAudioUrl(null);
                    setProgress(0);
                    setDuration(0);
                  }}
                  className="hidden"
                />
                <Slider
                  value={[progress]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={(value) => {
                    const newValue = Array.isArray(value) ? value[0] : value;
                    if (audioElement) {
                      audioElement.currentTime = newValue;
                      setProgress(newValue);
                    }
                  }}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
