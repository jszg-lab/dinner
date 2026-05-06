import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import VoteForm from '../components/vote/VoteForm.jsx';

export default function CreateVotePage() {
  const { user, canCreateVote } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canCreateVote) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">发起投票</h1>
      <VoteForm />
    </div>
  );
}
