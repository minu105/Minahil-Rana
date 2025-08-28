'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import type { Comment } from '@/lib/types';
import CommentForm from './CommentForm';
import { showToast } from './Toast';
import FollowButton from './FollowButton';
import { useAuth } from '@/context/AuthContext';
import { ThumbsUp, Undo2, Trash2 } from 'lucide-react';

export default function CommentList() {
  const { user, isLoading: authLoading } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [openReplyFor, setOpenReplyFor] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data: tops } = await api.get<Comment[]>('/comments');
      const repliesArrays = await Promise.all(
        tops.map((c) =>
          api.get<Comment[]>(`/comments/${c._id}/replies`).then((r) => r.data).catch(() => [])
        )
      );
      const flatReplies = repliesArrays.flat();
      setComments([...tops, ...flatReplies]);
    } finally {
      setLoading(false);
    }
  }

  // When a new comment (or reply) is created, update the list immediately.
  function handleNewComment(newComment: Comment) {
    setComments(prev =>
      !newComment.parentId
        ? [newComment, ...prev] // top-level comment: add to beginning
        : [...prev, newComment]  // reply: append at the end
    );
  }

  useEffect(() => {
    load();
    const s = getSocket();

    s.on('comment.created', (c: Comment) => {
      setComments(prev => {
        if (prev.some(existing => existing._id === c._id)) return prev; // dedupe
        return [c, ...prev];
      });
      showToast('New comment added');
    });
    s.on('comment.replied', (reply: Comment) => {
      setComments((prev) => {
        if (prev.some((c) => c._id === reply._id)) return prev; // dedupe
        return [...prev, reply];
      });
      showToast('Someone replied to your comment');
    });
    s.on('comment.liked', () => {
      load();
      showToast('Your comment got a like');
    });
    s.on('notification.created', () => {
      showToast('🔔 Notification received');
    });

    return () => {
      s.off('comment.created');
      s.off('comment.replied');
      s.off('comment.liked');
      s.off('notification.created');
    };
  }, []);

  // Memoize current user id across possible shapes
  const currentUserIdMemo = useMemo(() => {
    return (user as any)?._id ?? (user as any)?.id ?? null;
  }, [user]);

  // Reload when auth changes to refresh ownership-dependent UI (delete buttons)
  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, currentUserIdMemo]);

  async function like(id: string) {
    await api.post(`/likes/${id}`);
    setComments(prev => prev.map(c => c._id === id ? { ...c, likesCount: (c.likesCount ?? 0) + 1 } : c));
  }
  async function unlike(id: string) {
    await api.delete(`/likes/${id}`);
    setComments(prev => prev.map(c => c._id === id ? { ...c, likesCount: Math.max((c.likesCount ?? 0) - 1, 0) } : c));
  }

  async function deleteComment(id: string) {
    if (!confirm('Are you sure you want to delete this comment? This will also delete all replies.')) {
      return;
    }
    try {
      // mark as removing to animate out
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.add(id);
        // also mark direct replies of this comment
        comments.forEach(c => { if (c.parentId === id) next.add(c._id); });
        return next;
      });
      await api.delete(`/comments/${id}`);
      // delay actual removal to allow fade-out
      setTimeout(() => {
        setComments(prev => prev.filter(c => c._id !== id && c.parentId !== id));
        setRemovingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          comments.forEach(c => { if (c.parentId === id) next.delete(c._id); });
          return next;
        });
      }, 200);
      showToast('Comment deleted successfully');
    } catch (error: any) {
      // rollback removing state if any
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        comments.forEach(c => { if (c.parentId === id) next.delete(c._id); });
        return next;
      });
      showToast(`Failed to delete comment: ${error.response?.data?.message || error.message}`);
    }
  }

  const topLevel = useMemo(() => comments.filter(c => !c.parentId), [comments]);
  const repliesByParent = useMemo(() => {
    const m: Record<string, Comment[]> = {};
    comments.forEach(c => {
      if (c.parentId) {
        const key = String(c.parentId as any);
        if (!m[key]) m[key] = [];
        m[key].push(c);
      }
    });
    return m;
  }, [comments]);

  if (loading) return <div className="card">Loading…</div>;

  return (
    <div className="container">
      {/* New top-level comment form */}
      <div className="card mb-3">
        <CommentForm onCreated={handleNewComment} />
      </div>

      {topLevel.map(c => {
        const authorObj = typeof c.author === 'string' ? null : (c.author as any);
        const authorName = authorObj?.name ?? (typeof c.author === 'string' ? c.author : 'Unknown');
        const authorId = authorObj?._id ?? (typeof c.author === 'string' ? c.author : null);
        const replies = repliesByParent[c._id] || [];
        const currentUserId = (user as any)?._id ?? (user as any)?.id;
        const isOwner = !authLoading && !!currentUserId && authorId === currentUserId;

        const isRemoving = removingIds.has(c._id);
        return (
          <div key={c._id} className={`card mt-2 ${isRemoving ? 'anim-out' : 'anim-in'}`}>
            <div className="row" style={{ opacity: 0.9, fontSize: 14 }}>
              <span>
                {authorId ? <Link href={`/profile/${authorId}`}>{authorName}</Link> : authorName} • {new Date(c.createdAt).toLocaleString()}
              </span>
              {authorObj?._id ? <FollowButton userId={authorObj._id} /> : null}
            </div>

            {/* comment content */}
            <div className="comment-bubble mt-2">
              {c.content}
            </div>

            <div className="row mt-2">
              <button
                className="btn btn-muted btn-sm"
                onClick={() => like(c._id)}
                aria-label="Like comment"
                title="Like"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ThumbsUp size={16} />
                  <span>Like ({c.likesCount || 0})</span>
                </span>
              </button>
              <button
                className="btn btn-muted btn-sm"
                onClick={() => unlike(c._id)}
                aria-label="Unlike comment"
                title="Unlike"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Undo2 size={16} />
                  <span>Unlike</span>
                </span>
              </button>
              <button
                className="btn btn-muted btn-sm"
                onClick={() => setOpenReplyFor(prev => (prev === c._id ? null : c._id))}
                aria-label="Reply to comment"
                title={openReplyFor === c._id ? 'Cancel reply' : 'Reply'}
              >
                {openReplyFor === c._id ? 'Cancel' : 'Reply'}
              </button>
              {isOwner && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteComment(c._id)}
                  aria-label="Delete comment"
                  title="Delete"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </span>
                </button>
              )}
            </div>

            {!!replies.length && (
              <div style={{ marginTop: 10, paddingLeft: 14, borderLeft: '2px solid #223255', display: 'grid', gap: 8 }}>
                {replies.map(r => {
                  const rAuthorObj = typeof r.author === 'string' ? null : (r.author as any);
                  const rAuthorName = rAuthorObj?.name ?? (typeof r.author === 'string' ? r.author : 'Unknown');
                  const rAuthorId = rAuthorObj?._id ?? (typeof r.author === 'string' ? r.author : null);
                  const currentUserId = (user as any)?._id ?? (user as any)?.id;
                  const rIsOwner = !authLoading && !!currentUserId && rAuthorId === currentUserId;
                  const rRemoving = removingIds.has(r._id);

                  return (
                    <div key={r._id} className={rRemoving ? 'anim-out' : 'anim-in'}>
                      <div className="row" style={{ opacity: 0.85, fontSize: 13 }}>
                        <span>
                          {rAuthorId ? <Link href={`/profile/${rAuthorId}`}>{rAuthorName}</Link> : rAuthorName} • {new Date(r.createdAt).toLocaleString()}
                        </span>
                        {rAuthorObj?._id ? <FollowButton userId={rAuthorObj._id} /> : null}
                        {rIsOwner && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => deleteComment(r._id)}
                            aria-label="Delete reply"
                            title="Delete"
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </span>
                          </button>
                        )}
                      </div>
                      <div className="comment-bubble reply mt-1">
                        {r.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {openReplyFor === c._id && (
              <div className="mt-2">
                <CommentForm parentId={c._id} onCreated={handleNewComment} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
