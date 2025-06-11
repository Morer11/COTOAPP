import React from 'react';

const About = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-4">About COTOAPP</h1>
      <p className="text-gray-700 mb-4">
        COTOAPP is a comprehensive web platform that allows users to upload zipped HTML/CSS/JS projects and instantly convert them into professional Android APK files. Our mission is to simplify the process of app development for everyone, regardless of their technical background.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Our Vision</h2>
      <p className="text-gray-700 mb-4">
        We envision a world where anyone can turn their web projects into mobile applications without needing extensive technical knowledge. Our goal is to empower creators, entrepreneurs, and developers to bring their ideas to life on mobile devices.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Our Team</h2>
      <p className="text-gray-700 mb-4">
        Our team consists of passionate developers, designers, and product managers dedicated to providing the best user experience and support. We believe in collaboration, innovation, and continuous improvement.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Our Journey</h2>
      <p className="text-gray-700 mb-4">
        Founded in 2023, COTOAPP started as a small project aimed at helping developers convert their web applications into mobile apps. Over time, we have grown into a robust platform with a wide range of features, including user authentication, an admin dashboard, and real-time APK generation.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Join Us</h2>
      <p className="text-gray-700 mb-4">
        We are always looking for talented individuals to join our team. If you are passionate about technology and want to make a difference, check out our <a href="/careers" className="text-blue-500 hover:underline">Careers</a> page for open positions.
      </p>
    </div>
  );
};

export default About;
