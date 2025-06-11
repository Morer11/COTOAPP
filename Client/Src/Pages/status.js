import React from 'react';

const Status = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-4">System Status</h1>
      <p className="text-gray-700 mb-4">
        Check the current status of COTOAPP services. We strive to maintain high availability and performance.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Current Status</h2>
      <ul className="list-disc list-inside mb-4">
        <li>API: <span className="text-green-500">Operational</span></li>
        <li>Web Application: <span className="text-green-500">Operational</span></li>
        <li>Database: <span className="text-yellow-500">Degraded Performance</span></li>
      </ul>
      <h2 className="text-2xl font-semibold mb-2">Incident History</h2>
      <p className="text-gray-700 mb-4">No recent incidents reported.</p>
    </div>
  );
};

export default Status;
