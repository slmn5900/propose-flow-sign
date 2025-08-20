import React from 'react';
import ProposalsList from '@/components/ProposalsList';
import ProtectedRoute from '@/components/ProtectedRoute';

const Proposals = () => {
  return (
    <ProtectedRoute>
      <ProposalsList />
    </ProtectedRoute>
  );
};

export default Proposals;