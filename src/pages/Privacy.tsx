import React from 'react';

export default function Privacy() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 text-zinc-300">
      <h1 className="text-4xl font-black text-white">Privacy Policy</h1>
      <p className="text-zinc-500">Last updated: March 15, 2026</p>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
        <p>We collect information you provide directly to us when you create an account, such as your name, email address, and study preferences.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">2. How We Use Your Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our services, including matching you with study partners.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">3. Data Security</h2>
        <p>We use Firebase to secure your data. Your information is protected by industry-standard security measures.</p>
      </section>
    </div>
  );
}
