'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoginForm, SignupForm } from '@/components/AuthForms';
import CommentList from '@/components/CommentList';
import Toast from '@/components/Toast';
import './globals.css';

export default function Page() {
  const { user, logout } = useAuth();

  return (
    <>
      <div className="card mb-3">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>Realtime Comments</h2>
          {user ? (
            <div className="row">
              <div style={{ opacity: .85 }}>Hi, {user.name}</div>
              <button className="btn btn-muted" onClick={logout}>Logout</button>
            </div>
          ) : null}
        </div>
      </div>

      {!user && (
        <>
          <SignupForm />
          <LoginForm />
          <div className="card">Create an account or login to start testing.</div>
        </>
      )}

      {user && (
        <>
          <CommentList />
        </>
      )}

      <Toast />
    </>
  );
}
