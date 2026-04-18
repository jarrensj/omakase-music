"use client";

import { useState } from "react";

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
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);

  const loadNotes = async () => {
    if (loaded) return;
    const res = await fetch(`/api/org/${slug}/tracks/${trackId}/notes`);
    const data = await res.json();
    setNotes(data);
    setLoaded(true);
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
    <div className="mt-3 border-t pt-3">
      <button
        onClick={loadNotes}
        className="text-sm text-gray-600 hover:underline"
      >
        {loaded ? "Notes" : "Show notes"}
      </button>

      {loaded && (
        <div className="mt-2 space-y-2">
          {notes.map((note) => (
            <div key={note.id} className="text-sm bg-gray-50 p-2 rounded">
              <p>{note.content}</p>
              <p className="text-gray-500 text-xs mt-1">
                {note.users?.email} • {formatDate(note.created_at)}
              </p>
            </div>
          ))}

          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="flex-1 px-2 py-1 text-sm border rounded"
              onKeyDown={(e) => e.key === "Enter" && addNote()}
            />
            <button
              onClick={addNote}
              disabled={loading || !newNote.trim()}
              className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TrackList({ tracks, slug }: { tracks: Track[]; slug: string }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

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
            <button
              onClick={() => playTrack(track.id)}
              className="px-3 py-1 text-sm bg-black text-white rounded-md hover:bg-gray-800"
            >
              {playingId === track.id ? "Stop" : "Play"}
            </button>
          </div>
          {playingId === track.id && audioUrl && (
            <audio
              src={audioUrl}
              controls
              autoPlay
              className="w-full mt-2"
              onEnded={() => {
                setPlayingId(null);
                setAudioUrl(null);
              }}
            />
          )}
          <TrackNotes trackId={track.id} slug={slug} />
        </div>
      ))}
    </div>
  );
}
