// src/components/ui/FormField.jsx
import React from 'react';
import "../../styles/ui.css";
export default function FormField({ label, type = 'text', value, onChange, required = false }) {
  return (
    <div className="ui-field">
      <label className="ui-field__label">{label}</label>
      <input
        className="ui-field__input"
        type={type}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}