// src/pages/auth/LoginPage.jsx
import React, { useState } from 'react';
import axios from '../../api';
import { useNavigate } from 'react-router-dom';
import AuthCard from '../../components/ui/AuthCard';
import FormField from '../../components/ui/FormField';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');
  if (token) { navigate('/dashboard'); return null; }

  const submit = async (e) => {
    e.preventDefault();
    try {
      const resp = await axios.post('/api/auth/token', new URLSearchParams({ username: email, password }));
      localStorage.setItem('access_token', resp.data.access_token);
      navigate('/dashboard');
    } catch {
      alert('Login failed');
    }
  };

  return (
    <AuthCard title="Restaurant Login" onSubmit={submit}>
      <FormField label="Email"    type="email"    value={email}    onChange={(e) => setEmail(e.target.value)}    required />
      <FormField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Button type="submit" variant="primary" fullWidth>Sign in</Button>

      <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--muted)' }}>
        ¿No tienes cuenta? <a href="/register" style={{ color: 'var(--amber)', fontWeight: 500 }}>Regístrate</a>
      </p>

    </AuthCard>
  );
}