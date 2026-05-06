import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import VoteDetail from '../components/vote/VoteDetail.jsx';

export default function VoteDetailPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <VoteDetail />;
}
