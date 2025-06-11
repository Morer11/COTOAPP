import React from 'react';

const Blog = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-4">COTOAPP Blog</h1>
      <p className="text-gray-700 mb-4">
        Welcome to the COTOAPP📱 blog! Here, we share updates, tips, and insights about converting web projects into Android applications. Our blog aims to provide valuable information to help you make the most of our platform.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Latest Posts</h2>
      <ul className="list-disc list-inside mb-4">
        <li className="mb-2">
          <a href="#" className="text-blue-500 hover:underline">How to Optimize Your Web Project for APK Conversion</a>
          <p className="text-gray-600">Learn best practices for preparing your web project for a smooth APK conversion process.</p>
        </li>
        <li className="mb-2">
          <a href="#" className="text-blue-500 hover:underline">Understanding the APK Generation Process</a>
          <p className="text-gray-600">A deep dive into how COTOAPP📱 generates APKs from your web projects.</p>
        </li>
        <li className="mb-2">
          <a href="#" className="text-blue-500 hover:underline">Tips for Successful Project Uploads</a>
          <p className="text-gray-600">Essential tips to ensure your project uploads are successful and error-free.</p>
        </li>
      </ul>
      <h2 className="text-2xl font-semibold mb-2">Subscribe to Our Newsletter</h2>
      <p className="text-gray-700 mb-4">
        Stay updated with the latest news and tips from COTOAPP📱. Subscribe to our newsletter for regular updates!
      </p>
      <form className="flex flex-col sm:flex-row mb-4">
        <input type="email" placeholder="Enter your email" className="p-2 border border-gray-300 rounded mb-2 sm:mb-0 sm:mr-2" />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Subscribe</button>
      </form>
    </div>
  );
};

export default Blog;
