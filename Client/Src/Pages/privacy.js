import React from 'react';

const Privacy = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-gray-700 mb-4">
        At COTOAPP📱, we value your privacy. This Privacy Policy outlines how we collect, use, and protect your information when you use our services. By using our platform, you consent to the data practices described in this policy.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Information We Collect</h2>
      <p className="text-gray-700 mb-4">
        We collect information that you provide to us directly, such as when you register for an account, upload projects, or contact us for support. This may include:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Personal Information: Name, email address, and contact details.</li>
        <li>Project Information: Files and data related to your uploaded projects.</li>
        <li>Usage Data: Information about how you use our services, including IP address, browser type, and access times.</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-2">How We Use Your Information</h2>
      <p className="text-gray-700 mb-4">
        We use your information to provide and improve our services, communicate with you, and ensure the security of our platform. Specifically, we may use your information to:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Process your project uploads and generate APKs.</li>
        <li>Send you updates, newsletters, and promotional materials.</li>
        <li>Respond to your inquiries and provide customer support.</li>
        <li>Monitor and analyze usage trends to improve our services.</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-2">Data Security</h2>
      <p className="text-gray-700 mb-4">
        We implement a variety of security measures to maintain the safety of your personal information. This includes:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Encryption of sensitive data during transmission.</li>
        <li>Regular security audits and vulnerability assessments.</li>
        <li>Access controls to limit who can view and manage your data.</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-2">Your Rights</h2>
      <p className="text-gray-700 mb-4">
        You have the right to access, correct, or delete your personal information at any time. If you wish to exercise these rights, please contact us at <a href="mailto:aliyuaadam1111@gmail.com" className="text-blue-500 hover:underline">support@cotoapp.com</a>.
      </p>
    </div>
  );
};

export default Privacy;
