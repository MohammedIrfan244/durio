import { APP_NAME } from '@/lib/brand';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ChevronLeft size={18} />
            Back
          </Link>
          <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8 text-foreground">
          {/* Introduction */}
          <section>
            <p className="text-lg text-muted-foreground">
              At {APP_NAME}, we take your privacy seriously. This privacy policy explains what data we collect,
              how we use it, and your rights regarding your information.
            </p>
          </section>

          {/* Data Collection */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Data We Collect</h2>
            <p className="text-muted-foreground">
              When you log in with Google, we collect and store only the following information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
              <li><strong>Email Address</strong> - Used to identify your account and enable authentication</li>
              <li><strong>Full Name</strong> - Used to personalize your experience</li>
              <li><strong>Profile Picture URL</strong> - Received from Google but not stored in our database</li>
            </ul>
            <p className="text-sm text-muted-foreground italic mt-4">
              We do not store, process, or retain your profile picture from Google beyond the initial login session.
            </p>
          </section>

          {/* Data Usage */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. How We Use Your Data</h2>
            <p className="text-muted-foreground">
              Your data is used exclusively for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
              <li>Authentication and account creation</li>
              <li>Displaying your profile information within the app</li>
              <li>Personalizing your experience (theme, timezone, preferences)</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              We do not use your data for marketing, analytics, or any other purpose without your explicit consent.
            </p>
          </section>

          {/* Data Storage & Security */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Data Storage & Security</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Your email and name are stored in our secure MongoDB database. Access to this data is:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Restricted to authorized personnel only</li>
                <li>Protected by secure authentication mechanisms</li>
                <li>Encrypted in transit and at rest</li>
                <li>Never shared with third parties (except as required by law)</li>
              </ul>
            </div>
          </section>

          {/* User Rights - Data Access */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Your Right to Access Your Data</h2>
            <p className="text-muted-foreground">
              You can access all your stored data by logging in with your credentials. Your email and name are
              visible in your account settings. You can update your avatar at any time.
            </p>
          </section>

          {/* Account Deletion */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Right to Delete Your Account</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                You have full control over your account deletion. Two options are available:
              </p>

              <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3 mt-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Soft Delete (Deactivation)</h3>
                  <p className="text-sm">
                    Temporarily deactivate your account. Your data remains in our database but is inaccessible
                    and your account cannot be used. This action can be reversed by contacting the author at{' '}
                    <a href="mailto:zemdevwork@gmail.com" className="text-primary hover:underline">
                      zemdevwork@gmail.com
                    </a>
                    .
                  </p>
                </div>
              </div>

              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3 mt-3">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Permanent Hard Delete</h3>
                  <p className="text-sm">
                    Permanently and irreversibly erase your account and all associated data. Once confirmed:
                  </p>
                  <ul className="list-disc list-inside text-sm mt-2 ml-2 space-y-1">
                    <li>All your account data will be permanently deleted within 24 hours</li>
                    <li>This action <strong>cannot be undone</strong> under any circumstances</li>
                    <li>The author cannot recover your data even upon request</li>
                    <li>All tasks, notes, journal entries, calendar items, and personal data are permanently erased</li>
                  </ul>
                </div>
              </div>

              <p className="text-sm mt-4">
                You can request account deletion in your account settings under &quot;Delete Account&quot;.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Contact & Questions</h2>
            <p className="text-muted-foreground">
              If you have questions about this privacy policy or want to manage your data, please contact:
            </p>
            <div className="bg-muted/30 border border-border rounded-lg p-4 mt-4">
              <a
                href="mailto:zemdevwork@gmail.com"
                className="text-primary hover:underline font-medium text-lg"
              >
                zemdevwork@gmail.com
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                We will respond to your inquiry within 7 business days.
              </p>
            </div>
          </section>

          {/* Policy Changes */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. Changes will be posted on this page with an
              updated &quot;Last updated&quot; date. Continued use of {APP_NAME} after changes constitutes your acceptance
              of the revised policy.
            </p>
          </section>

          {/* Footer */}
          <div className="border-t border-border pt-8 mt-8">
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
