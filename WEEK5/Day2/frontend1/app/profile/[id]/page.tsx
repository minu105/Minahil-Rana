'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import FollowButton from '@/components/FollowButton';

type Counts = { followers: number; following: number; };
type User = { _id: string; name: string; avatarUrl?: string; bio?: string; };

export default function ProfilePage() {
  const params = useParams() as { id: string };
  const userId = params.id;
  const { user: me, isLoading } = useAuth() as any;

  const [profile, setProfile] = useState<User | null>(null);
  const [counts, setCounts] = useState<Counts>({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        const [uRes, cRes] = await Promise.all([
          api.get(`/users/by-id/${userId}`),
          api.get(`/followers/${userId}/counts`),
        ]);
        if (!mounted) return;
        setProfile(uRes.data);
        setCounts(cRes.data);
      } catch (e) {
        console.error('Profile fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, [userId]);

  const myId = (me as any)?._id ?? (me as any)?.id;
  const isSelf = myId && String(myId) === String(userId);

  if (loading) return <div className="card">Loading profile…</div>;
  if (!profile) return <div className="card">User not found.</div>;

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ alignItems: 'center' }}>
          <img
            src={profile.avatarUrl || `https://api.multiavatar.com/${profile._id}.svg`}
            alt={profile.name}
            style={{ width: 72, height: 72, borderRadius: '50%', border: '1px solid var(--border)', objectFit: 'cover' }}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              const name = encodeURIComponent(profile.name || 'User');
              target.src = `https://ui-avatars.com/api/?name=${name}&background=random&size=128&format=svg`;
            }}
          />
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 22 }}>{profile.name}</h1>
            {!editingBio && (
              <>
                {profile.bio ? (
                  <p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>{profile.bio}</p>
                ) : (
                  <p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>
                    {isSelf ? 'Add a short bio to tell people about yourself.' : 'No bio yet.'}
                  </p>
                )}
              </>
            )}
            {isSelf && !editingBio && (
              <div className="mt-1">
                <button className="btn btn-muted btn-sm" onClick={() => { setBioText(profile.bio || ''); setEditingBio(true); }}>
                  {profile.bio ? 'Edit Bio' : 'Add Bio'}
                </button>
              </div>
            )}
            {isSelf && editingBio && (
              <div className="mt-1" style={{ maxWidth: 520 }}>
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  rows={3}
                  placeholder="Write a short bio..."
                  style={{ width: '100%' }}
                />
                <div className="row mt-1">
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={savingBio}
                    onClick={async () => {
                      setSavingBio(true);
                      try {
                        const { data } = await api.patch('/users/me', { bio: bioText });
                        // optimistic update
                        setProfile((p) => (p ? { ...p, bio: data?.bio ?? bioText } : p));
                        setEditingBio(false);
                      } catch (e) {
                        console.error('Failed updating bio', e);
                        alert('Could not save bio. Please try again.');
                      } finally {
                        setSavingBio(false);
                      }
                    }}
                  >
                    {savingBio ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    className="btn btn-muted btn-sm"
                    onClick={() => setEditingBio(false)}
                    disabled={savingBio}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <div className="row mt-1" style={{ fontSize: 14 }}>
              <span><strong>{counts.followers}</strong> Followers</span>
              <span><strong>{counts.following}</strong> Following</span>
            </div>
          </div>
          {!isSelf && <FollowButton userId={profile._id} />}
        </div>
      </div>
      <div className="mt-2" style={{ fontSize: 14, color: 'var(--muted)' }}>
        <Link href="/">← Back</Link>
      </div>
    </div>
  );
}
