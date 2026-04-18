// src/components/ui/Button.jsx
import React from 'react';
import "../../styles/ui.css";


export default function Button({ children, variant = 'primary', type = 'button', onClick, fullWidth = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`ui-btn ui-btn--${variant}${fullWidth ? ' ui-btn--full' : ''}`}
    >
      {children}
    </button>
  );
}