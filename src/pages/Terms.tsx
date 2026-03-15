import React from 'react';

export default function Terms() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 text-zinc-300">
      <h1 className="text-4xl font-black text-white">Terms of Service</h1>
      <p className="text-zinc-500">Last updated: March 15, 2026</p>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
        <p>By using PrepMitra, you agree to be bound by these Terms of Service.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">2. User Conduct</h2>
        <p>You agree to use the service only for lawful purposes and in a way that does not infringe the rights of others.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">3. Termination</h2>
        <p>We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms.</p>
      </section>
    </div>
  );
}
