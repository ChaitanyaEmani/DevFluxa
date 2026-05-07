import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - DevFluxa',
  description: 'Privacy Policy for DevFluxa online developer tools platform.',
}

export default function PrivacyPage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Privacy Commitment</h2>
            <p>
              At DevFluxa, we are committed to protecting your privacy. This policy outlines how we handle your information when you use our online developer tools.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Don't Collect</h2>
            <p>
              DevFluxa operates entirely within your web browser. We do NOT:
            </p>
            <ul className="list-disc list-inside ml-6 space-y-2">
              <li>Collect personal information</li>
              <li>Store your input data</li>
              <li>Track your tool usage</li>
              <li>Use cookies for tracking</li>
              <li>Transmit data to external servers</li>
              <li>Log your IP address</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How Our Tools Work</h2>
            <p>
              All processing happens locally in your browser:
            </p>
            <ul className="list-disc list-inside ml-6 space-y-2">
              <li><strong>Client-side processing:</strong> All formatting and conversion happens using JavaScript in your browser</li>
              <li><strong>No server transmission:</strong> Your data never leaves your device</li>
              <li><strong>Temporary memory:</strong> Data exists only in browser memory during processing</li>
              <li><strong>No persistence:</strong> Data is cleared when you close the tab or navigate away</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Browser Information</h2>
            <p>
              Like all websites, we may collect basic technical information automatically sent by your browser:
            </p>
            <ul className="list-disc list-inside ml-6 space-y-2">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Screen resolution</li>
              <li>Language preferences</li>
              <li>Referring website (if any)</li>
            </ul>
            <p>
              This information is anonymous and used only to improve our service compatibility and user experience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
            <p>
              DevFluxa may use third-party services for:
            </p>
            <ul className="list-disc list-inside ml-6 space-y-2">
              <li><strong>Analytics:</strong> Anonymous usage statistics to improve our service</li>
              <li><strong>CDN:</strong> Content delivery for faster loading</li>
              <li><strong>Hosting:</strong> Website hosting services</li>
            </ul>
            <p>
              These services have their own privacy policies, and we are not responsible for their practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
            <p>
              Since all processing happens locally, your data is inherently secure. We implement:
            </p>
            <ul className="list-disc list-inside ml-6 space-y-2">
              <li>HTTPS encryption for all connections</li>
              <li>Secure hosting infrastructure</li>
              <li>Regular security updates</li>
              <li>No data storage or retention</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies and Local Storage</h2>
            <p>
              DevFluxa uses minimal browser storage:
            </p>
            <ul className="list-disc list-inside ml-6 space-y-2">
              <li><strong>Preferences:</strong> Your tool settings and preferences</li>
              <li><strong>Theme:</strong> Light/dark mode preference</li>
              <li><strong>No tracking cookies:</strong> We don't use cookies for tracking</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
            <p>
              Our service does not collect personal information from anyone, including children under 13. However, we recommend parental supervision for minors using our tools.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc list-inside ml-6 space-y-2">
              <li>Know what data we don't collect (nothing)</li>
              <li>Access our service without providing personal information</li>
              <li>Use our tools anonymously</li>
              <li>Clear your browser data at any time</li>
              <li>Opt out of any analytics through your browser settings</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Changes will be posted on this page with an updated date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us through our contact page. We are committed to addressing your privacy concerns promptly.
            </p>
          </section>

          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-center">Privacy Guarantee</h3>
            <p className="text-center text-sm text-muted-foreground">
              DevFluxa processes all data locally in your browser. We never see, store, or transmit your information. Your privacy is built into our architecture.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
