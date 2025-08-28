'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { showToast } from './Toast';
import { useAuth } from '@/context/AuthContext';

export default function FollowButton({ userId }: { userId: string }) {
  const { user, token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const myId = (user as any)?._id ?? (user as any)?.id;
  if (!user || (myId && String(myId) === String(userId))) return null;

  useEffect(() => {
    const myId = (user as any)?._id ?? (user as any)?.id;
    if (!myId) {
      setFollowing(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get(`/followers/${userId}/status/${myId}`)
      .then(({ data }) => {
        // Accept either { following: boolean } or { isFollowing: boolean }
        const value = data?.following ?? data?.isFollowing ?? false;
        setFollowing(Boolean(value));
      })
      .catch((err) => {
        console.error('Failed to check follow status:', err);
        setFollowing(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, user]);

  async function toggle() {
    if (busy || loading) return;
    setBusy(true);
    
    try {
      const myId = (user as any)?._id ?? (user as any)?.id;
      if (!myId) {
        showToast('Please login to follow users');
        return;
      }

      if (!following) {
        // Try to follow (backend expects body { me })
        const response = await api.post(`/followers/${userId}`, { me: myId });

        if (response.status === 200 || response.status === 201) {
          setFollowing(true);
          showToast('Followed successfully');
        } else if (response.data?.reason === 'already_following') {
          setFollowing(true);
          showToast('Already following this user');
        } else if (response.data?.reason === 'self') {
          showToast('Cannot follow yourself');
        } else {
          showToast('Failed to follow user');
        }
      } else {
        // Try to unfollow (backend expects body { me } on DELETE)
        await api.delete(`/followers/${userId}`, { data: { me: myId } });
        setFollowing(false);
        showToast('Unfollowed successfully');
      }
    } catch (error: any) {
      console.error('Follow/unfollow error:', error);
      const serverMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      if (error.response?.status === 409 || error.response?.data?.reason === 'already_following') {
        // Handle duplicate follow attempt
        setFollowing(true);
        showToast('Already following this user');
      } else {
        showToast(serverMsg ? `Action failed: ${serverMsg}` : 'Action failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <button
        disabled
        style={{
          fontSize: 12,
          padding: '4px 8px',
          borderRadius: 4,
          backgroundColor: 'gray',
          color: 'white',
          cursor: 'not-allowed',
        }}
      >
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      style={{
        fontSize: 12,
        padding: '4px 8px',
        borderRadius: 4,
        backgroundColor: following ? '#6b7280' : '#3b82f6',
        color: 'white',
        cursor: busy ? 'not-allowed' : 'pointer',
        opacity: busy ? 0.7 : 1,
      }}
    >
      {busy ? (following ? 'Unfollowing...' : 'Following...') : (following ? 'Unfollow' : 'Follow')}
    </button>
  );
}
