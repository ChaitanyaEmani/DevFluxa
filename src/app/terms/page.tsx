import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - DevFluxa',
  description: 'Terms of Service for DevFluxa online developer tools platform.',
}

export default function TermsPage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using DevFluxa, you accept and agree to be bound by the terms and provision of these Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              DevFluxa is a free online platform providing developer tools for formatting, converting, and validating various data formats including JSON, SQL, HTML, XML, CSS, Base64, timestamps, colors, URLs, and YAML.
            </p>
            <p>
              All processing is performed locally in your browser. We do not store, transmit, or process your data on our servers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Privacy and Data Security</h2>
            <p>
              Your privacy is our priority. All tools operate entirely within your web browser using client-side JavaScript. No data is sent to external servers or stored by us.
            </p>
            <ul className="list-disc list-inside ml-6 space-y-2">
              <li>No data collection or storage</li>
              <li>No tracking of your inputs or outputs</li>
              <li>No transmission of sensitive information</li>
              <li>Complete browser-based processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
            <p>Users are responsible for:</p>
            <ul className="list-disc list-inside ml-6 space-y-2">
              <li>Ensuring data accuracy before processing</li>
              <li>Backing up important data before conversion</li>
              <li>Using tools for legitimate purposes only</li>
              <li>Not attempting to circumvent security measures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Service Availability</h2>
            <p>
              DevFluxa is provided "as is" and "as available" without warranties of any kind. We strive to maintain high uptime but do not guarantee uninterrupted service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p>
              DevFluxa and its operators shall not be liable for any loss or damage arising from your use of our service. Use our tools at your own risk and verify all important conversions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p>
              The service, including its original content, features, and functionality, is and will remain the exclusive property of DevFluxa. You may not copy, modify, or distribute our service without explicit permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of any modifications.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p>
              If you have questions about these Terms of Service, please contact us through our contact page.
            </p>
          </section>

          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <p className="text-center text-sm text-muted-foreground">
              By using DevFluxa, you acknowledge that you have read and understood these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
