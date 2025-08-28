'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('minahil@example.com');
  const [password, setPassword] = useState('123456');

  return (
    <div className="card mb-3">
      <h3 style={{ margin: 0 }}>Login</h3>
      <div className="row mt-2">
        <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn btn-primary" onClick={() => login(email, password)}>Login</button>
      </div>
    </div>
  );
}

export function SignupForm() {
  const { signup } = useAuth();
  const [name, setName] = useState('Minahil');
  const [email, setEmail] = useState('minahil@example.com');
  const [password, setPassword] = useState('123456');

  return (
    <div className="card mb-3">
      <h3 style={{ margin: 0 }}>Signup</h3>
      <div className="row mt-2">
        <input placeholder="name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn btn-primary" onClick={() => signup(name, email, password)}>Create</button>
      </div>
    </div>
  );
}
