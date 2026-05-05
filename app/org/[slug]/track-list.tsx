"use client";

import { useRef, useState } from "react";
import {
  Play,
  Square,
  Download,
  MessageCircle,
  Send,
  MapPin,
  X,
} from "lucide-react";

type Note = {
  id: string;
  content: string;
  created_at: string;
  start_seconds: number | null;
  end_seconds: number | null;
  users: { email: string } | null;
};

type Track = {
  id: string;
  filename: string;
  created_at: string;
  users: { email: string } | null;
};

const formatTime = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
};

function TrackNotes({
  trackId,
  slug,
  audioRef,
  isActive,
}: {
  trackId: string;
  slug: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isActive: boolean;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingStart, setPendingStart] = useState<number | null>(null);
  const [pendingEnd, setPendingEnd] = useState<number | null>(null);

  const loadNotes = async () => {
    if (loaded) return;
    const res = await fetch(`/api/org/${slug}/tracks/${trackId}/notes`);
    const data = await res.json();
    setNotes(data);
    setLoaded(true);
  };

  const currentTime = () => {
    if (!isActive || !audioRef.current) return null;
    return audioRef.current.currentTime;
  };

  const captureStart = () => {
    const t = currentTime();
    if (t === null) return;
    setPendingStart(t);
    if (pendingEnd !== null && t > pendingEnd) setPendingEnd(null);
  };

  const captureEnd = () => {
    const t = currentTime();
    if (t === null) return;
    if (pendingStart !== null && t < pendingStart) return;
    setPendingEnd(t);
  };

  const clearRange = () => {
    setPendingStart(null);
    setPendingEnd(null);
  };

  const seekTo = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !isActive) return;
    audio.currentTime = seconds;
    audio.play().catch(() => {});
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    setLoading(true);

    const res = await fetch(`/api/org/${slug}/tracks/${trackId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: newNote,
        startSeconds: pendingStart,
        endSeconds: pendingEnd,
      }),
    });

    if (res.ok) {
      const note = await res.json();
      setNotes([...notes, note]);
      setNewNote("");
      clearRange();
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const rangeLabel = (() => {
    if (pendingStart === null) return null;
    if (pendingEnd === null) return `@ ${formatTime(pendingStart)}`;
    return `${formatTime(pendingStart)} – ${formatTime(pendingEnd)}`;
  })();

  return (
    <div className="mt-3 border-t pt-3">
      <button
        onClick={loadNotes}
        className="flex items-center gap-1 text-sm text-gray-600 hover:underline"
      >
        <MessageCircle size={14} />
        {loaded ? "Notes" : "Show notes"}
      </button>

      {loaded && (
        <div className="mt-2 space-y-2">
          {notes.map((note) => {
            const hasStart = note.start_seconds !== null;
            const hasEnd = note.end_seconds !== null;
            const stamp = hasStart
              ? hasEnd
                ? `${formatTime(note.start_seconds!)}–${formatTime(note.end_seconds!)}`
                : formatTime(note.start_seconds!)
              : null;
            return (
              <div key={note.id} className="text-sm bg-gray-50 p-2 rounded">
                <div className="flex items-start gap-2">
                  {stamp && (
                    <button
                      onClick={() => seekTo(note.start_seconds!)}
                      disabled={!isActive}
                      title={isActive ? "Jump to this point" : "Play this track to jump"}
                      className="shrink-0 px-1.5 py-0.5 text-xs font-mono bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                    >
                      {stamp}
                    </button>
                  )}
                  <p className="flex-1">{note.content}</p>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  {note.users?.email} • {formatDate(note.created_at)}
                </p>
              </div>
            );
          })}

          <div className="mt-2 space-y-2">
            {(isActive || pendingStart !== null) && (
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <button
                  onClick={captureStart}
                  disabled={!isActive}
                  title={isActive ? "" : "Play this track to pin a time"}
                  className="flex items-center gap-1 px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <MapPin size={12} />
                  {pendingStart === null
                    ? "Pin start"
                    : `Start ${formatTime(pendingStart)}`}
                </button>
                <button
                  onClick={captureEnd}
                  disabled={!isActive || pendingStart === null}
                  className="flex items-center gap-1 px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <MapPin size={12} />
                  {pendingEnd === null
                    ? "Pin end"
                    : `End ${formatTime(pendingEnd)}`}
                </button>
                {rangeLabel && (
                  <>
                    <span className="font-mono text-gray-600">
                      {rangeLabel}
                    </span>
                    <button
                      onClick={clearRange}
                      className="flex items-center gap-1 text-gray-500 hover:text-gray-800"
                    >
                      <X size={12} />
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={
                  isActive
                    ? "Add a note — pin to a moment or range above"
                    : "Add a note..."
                }
                className="flex-1 px-2 py-1 text-sm border rounded"
                onKeyDown={(e) => e.key === "Enter" && addNote()}
              />
              <button
                onClick={addNote}
                disabled={loading || !newNote.trim()}
                className="p-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function TrackList({ tracks, slug }: { tracks: Track[]; slug: string }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTrack = async (trackId: string) => {
    if (playingId === trackId) {
      setPlayingId(null);
      setAudioUrl(null);
      return;
    }

    const res = await fetch(`/api/org/${slug}/tracks/${trackId}/url`);
    const { url } = await res.json();
    setAudioUrl(url);
    setPlayingId(trackId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (tracks.length === 0) {
    return <p className="text-gray-500">No tracks uploaded yet.</p>;
  }

  return (
    <div className="space-y-4">
      {tracks.map((track) => (
        <div key={track.id} className="border rounded-md p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{track.filename}</p>
              <p className="text-sm text-gray-500">
                {track.users?.email || "Unknown"} • {formatDate(track.created_at)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => playTrack(track.id)}
                className="p-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                {playingId === track.id ? <Square size={16} /> : <Play size={16} />}
              </button>
              <a
                href={`/api/org/${slug}/tracks/${track.id}/download`}
                download
                className="p-2 border border-black rounded-md hover:bg-gray-100"
              >
                <Download size={16} />
              </a>
            </div>
          </div>
          {playingId === track.id && audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              autoPlay
              className="w-full mt-2"
            />
          )}
          <TrackNotes
            trackId={track.id}
            slug={slug}
            audioRef={audioRef}
            isActive={playingId === track.id}
          />
        </div>
      ))}
    </div>
  );
}
