import React from 'react';

export function AsyncFeedback({ loading, error, success }: { loading?: boolean; error?: string | null; success?: string | null }) {
  if (loading) return <div className="text-blue-500">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (success) return <div className="text-green-600">{success}</div>;
  return null;
}
