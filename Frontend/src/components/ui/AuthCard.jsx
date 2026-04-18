// src/components/ui/AuthCard.jsx
import React from 'react';
import "../../styles/ui.css";

export default function AuthCard({ title, onSubmit, children }) {
  return (
    <div className="auth-layout">
      <h1 className="auth-layout__title">{title}</h1>
      <form className="auth-layout__card" onSubmit={onSubmit}>
        {children}
      </form>
    </div>
  );
}