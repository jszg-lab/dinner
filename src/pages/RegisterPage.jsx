import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RegisterForm from '../components/auth/RegisterForm.jsx';

export default function RegisterPage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <RegisterForm />;
}
