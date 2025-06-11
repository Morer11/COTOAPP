import React from 'react';

const Documentation = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-4">COTOAPP📱 Documentation</h1>
      <p className="text-gray-700 mb-4">
        Welcome to the COTOAPP documentation! Here you will find all the information you need to get started with our platform, including guides, tutorials, and API references.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Getting Started</h2>
      <p className="text-gray-700 mb-4">
        To begin using COTOAPP📱, follow our <a href="/installation" className="text-blue-500 hover:underline">installation guide</a> to set up your environment.
      </p>
      <h2 className="text-2xl font-semibold mb-2">API Reference</h2>
      <p className="text-gray-700 mb-4">
        Check out our <a href="/api" className="text-blue-500 hover:underline">API documentation</a> for detailed information on how to interact with our services programmatically.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Tutorials</h2>
      <p className="text-gray-700 mb-4">
        Explore our <a href="/tutorials" className="text-blue-500 hover:underline">tutorials</a> section for step-by-step guides on using COTOAPP📱 effectively.
      </p>
    </div>
  );
};

export default Documentation;
