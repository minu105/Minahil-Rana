"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import type { Comment } from "@/lib/types";
import RichTextEditor from "./RichTextEditor";

interface CommentFormProps {
  parentId?: string;
  onCreated: (newComment: Comment) => void;
}

export default function CommentForm({
  parentId,
  onCreated,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    
    const normalized = (content || "").replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, "");
    if (!normalized || normalized.trim().length === 0) {
      alert('Please enter some text before posting');
      return;
    }

    setBusy(true);
    try {
      let newComment: Comment;
      if (parentId) {
        newComment = await api.post(`/comments/${parentId}/replies`, {
          content,
        });
      } else {
        newComment = await api.post("/comments", { content });
      }
      setContent("");
    } catch (error) {
      console.error('Comment submission failed:', error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <RichTextEditor
        value={content}
        onChange={setContent}
      />

      <button
        type="submit"
        disabled={busy}
        className="btn btn-primary mt-2"
      >
        {busy ? "Sending…" : parentId ? "Reply" : "Post"}
      </button>
    </form>
  );
}
