import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Terms of Service</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <div className="bg-white dark:bg-neutral-800/50 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
          <p className="mb-6">
            By accessing and using this software, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
          </p>

          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">2. Use License</h2>
          <p className="mb-4">
            Permission is granted to temporarily use the software for personal, non-commercial, or commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>modify or copy the materials;</li>
            <li>use the materials for any illegal purpose;</li>
            <li>attempt to decompile or reverse engineer any software contained on the platform;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">3. Privacy Policy</h2>
          <p className="mb-6">
            Your use of the service is also governed by our Privacy Policy. We collect, store, and use your personal information in accordance with this policy. By using the service, you consent to such processing and you warrant that all data provided by you is accurate.
          </p>

          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">4. User Content</h2>
          <p className="mb-6">
            You retain all your ownership rights in your User Content. By submitting User Content to the service, you hereby grant us a worldwide, non-exclusive, royalty-free, sublicenseable and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the User Content in connection with the service.
          </p>

          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">5. Disclaimer</h2>
          <p className="mb-6">
            The materials on the service are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>

          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">6. Limitations</h2>
          <p className="mb-6">
            In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the service.
          </p>
        </div>
      </div>
    </div>
  );
};
