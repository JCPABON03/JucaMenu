// src/pages/auth/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../api';
import { useNavigate } from 'react-router-dom';
import AuthCard from '../../components/ui/AuthCard';
import FormField from '../../components/ui/FormField';
import Button from '../../components/ui/Button';

export default function RegisterPage() {
  const [email, setEmail]       = useState('');
  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) navigate('/dashboard');
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', { email, name, password });
      alert('Registered! You can now log in.');
      navigate('/login');
    } catch {
      alert('Registration failed');
    }
  };

  return (
    <AuthCard title="Register Restaurant Owner" onSubmit={submit}>  {/* ← onSubmit aquí */}
      {/* ← sin <form> adentro */}
      <FormField label="Email"    type="email"    value={email}    onChange={(e) => setEmail(e.target.value)}    required />
      <FormField label="Name"                     value={name}     onChange={(e) => setName(e.target.value)}     required />
      <FormField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Button type="submit" variant="primary" fullWidth>Sign up</Button>

      <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--muted)' }}>
        ¿Ya tienes cuenta? <a href="/login" style={{ color: 'var(--amber)', fontWeight: 500 }}>Inicia sesión</a>
      </p>
    </AuthCard>
  );
}