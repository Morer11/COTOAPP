import React from 'react';

const Features = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-4">Features of COTOAPP📱</h1>
      <p className="text-gray-700 mb-4">
        COTOAPP📱 offers a range of powerful features designed to make the process of converting web projects into Android APKs seamless and efficient.
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>**Easy Project Upload**: Upload ZIP files containing HTML, CSS, and JavaScript with ease.</li>
        <li>**Real-time APK Generation**: Convert web projects to Android APKs using Capacitor in real-time.</li>
        <li>**User  Authentication**: Secure user accounts with email verification and password protection.</li>
        <li>**Admin Dashboard**: Manage users and builds with a comprehensive admin interface.</li>
        <li>**Build Queue System**: Track the progress of your APK generation with a queue-based system.</li>
        <li>**Custom App Configuration**: Set app names, icons, package names, and modes to suit your needs.</li>
        <li>**Download Management**: Securely download APKs with built-in analytics to track downloads.</li>
        <li>**Role-based Access**: Different user roles (User , Moderator, Admin) for better management.</li>
        <li>**Analytics Dashboard**: Monitor builds, users, and success rates with detailed analytics.</li>
      </ul>
    </div>
  );
};

export default Features;
