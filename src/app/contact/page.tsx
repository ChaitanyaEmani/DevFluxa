import { generateMetadata } from '@/lib/generateMetadata'
import { Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { ContactForm } from '@/app/components/ContactForm'

export const metadata = generateMetadata({
  title: 'Contact Devfluxa - Get in Touch',
  description: 'Contact the Devfluxa team with feedback, suggestions, or support. We value your input and are here to help.',
  keywords: ['contact devfluxa', 'support', 'feedback', 'get in touch']
})

export default function ContactPage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-muted-foreground mb-4">
            We'd love to hear from you
          </p>
          <p className="text-muted-foreground">
            Have feedback, suggestions, or need support? Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card p-8 rounded-lg border">
              <ContactForm />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-4">Other Ways to Reach Us</h3>
              <div className="space-y-4">
                <a
                  href="mailto:hello@devfluxa.com"
                  className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>hello@devfluxa.com</span>
                </a>
                <a
                  href="https://github.com/devfluxa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  <span>GitHub</span>
                </a>
                <a
                  href="https://twitter.com/devfluxa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  <span>Twitter</span>
                </a>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-4">Response Time</h3>
              <p className="text-sm text-muted-foreground mb-3">
                We typically respond within 24-48 hours during business days.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Monday - Friday: 9AM - 6PM EST</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span>Weekend: Limited support</span>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Quick Help
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Before reaching out, check out our FAQ section for quick answers to common questions.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View FAQ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
