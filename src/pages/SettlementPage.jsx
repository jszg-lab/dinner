import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import SettlementForm from '../components/settlement/SettlementForm.jsx';

export default function SettlementPage() {
  const { user, canCreateVote } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canCreateVote) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">结算管理</h1>
      <SettlementForm />
    </div>
  );
}
