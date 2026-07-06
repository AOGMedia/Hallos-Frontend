import { LegalPageLayout, Section } from '@/components/legal/LegalPageLayout';

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="February 12, 2026">
      <Section title="1. Introduction">
        <p>
          At Hallos, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our live learning platform.
        </p>
        <p>
          By using Hallos, you consent to the data practices described in this policy.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <p>
          <strong>Account Information:</strong> When you create an account, we collect your name, email address, password, and profile information.
        </p>
        <p>
          <strong>Payment Information:</strong> Payment details are processed securely through our payment partners (Paystack and Stripe). We store transaction records but not full payment card details.
        </p>
        <p>
          <strong>Content Data:</strong> We collect information about the content you create, upload, view, and purchase on the platform.
        </p>
        <p>
          <strong>Usage Data:</strong> We automatically collect information about how you interact with our platform, including IP address, browser type, device information, pages visited, and time spent on pages.
        </p>
        <p>
          <strong>Communication Data:</strong> We collect information from your communications with us and other users through our platform.
        </p>
        <p>
          <strong>Live Session Data:</strong> During live classes, we may collect audio, video, and chat data as necessary to provide the service.
        </p>
      </Section>

      <Section title="3. How We Use Your Information">
        <p>We use your information to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send transaction notifications</li>
          <li>Send you technical notices, updates, and support messages</li>
          <li>Respond to your comments and questions</li>
          <li>Personalize your experience and recommend relevant content</li>
          <li>Monitor and analyze usage patterns and trends</li>
          <li>Detect, prevent, and address technical issues and fraudulent activity</li>
          <li>Comply with legal obligations</li>
        </ul>
      </Section>

      <Section title="4. Information Sharing and Disclosure">
        <p>
          <strong>With Creators:</strong> When you purchase content, creators receive information necessary to fulfill the transaction (name, email).
        </p>
        <p>
          <strong>With Service Providers:</strong> We share information with third-party service providers who perform services on our behalf:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Payment processors (Paystack, Stripe)</li>
          <li>Live streaming infrastructure (ZegoCloud, Mux)</li>
          <li>Cloud hosting and storage providers</li>
          <li>Analytics services</li>
        </ul>
        <p>
          <strong>For Legal Reasons:</strong> We may disclose information if required by law or in response to valid legal requests.
        </p>
        <p>
          <strong>Business Transfers:</strong> If Hallos is involved in a merger, acquisition, or sale of assets, your information may be transferred.
        </p>
        <p>
          <strong>With Your Consent:</strong> We may share information with your explicit consent.
        </p>
      </Section>

      <Section title="5. Data Security">
        <p>
          We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security assessments</li>
          <li>Access controls and authentication</li>
          <li>Secure payment processing through PCI-compliant providers</li>
        </ul>
        <p>
          However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
        </p>
      </Section>

      <Section title="6. Data Retention">
        <p>
          We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal or legitimate business purposes.
        </p>
      </Section>

      <Section title="7. Your Rights and Choices">
        <p>
          <strong>Access and Update:</strong> You can access and update your account information through your account settings.
        </p>
        <p>
          <strong>Delete Account:</strong> You can delete your account at any time through your account settings.
        </p>
        <p>
          <strong>Marketing Communications:</strong> You can opt out of marketing emails by following the unsubscribe link in the email.
        </p>
        <p>
          <strong>Cookies:</strong> You can control cookies through your browser settings.
        </p>
        <p>
          <strong>Data Portability:</strong> You can request a copy of your personal data in a machine-readable format.
        </p>
      </Section>

      <Section title="8. Cookies and Tracking Technologies">
        <p>
          We use cookies and similar tracking technologies to collect usage information and improve our services. Cookies are small data files stored on your device. You can control cookie preferences through your browser settings.
        </p>
        <p>
          We use cookies for:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Authentication and security</li>
          <li>Preferences and settings</li>
          <li>Analytics and performance monitoring</li>
          <li>Personalization and recommendations</li>
        </ul>
      </Section>

      <Section title="9. Third-Party Services">
        <p>
          Our platform integrates with third-party services (payment processors, streaming providers, analytics tools). These services have their own privacy policies. We encourage you to review their policies.
        </p>
      </Section>

      <Section title="10. Children's Privacy">
        <p>
          Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
        </p>
      </Section>

      <Section title="11. International Data Transfers">
        <p>
          Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.
        </p>
      </Section>

      <Section title="12. Changes to This Privacy Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on our platform. Your continued use of the platform after changes constitutes acceptance of the updated policy.
        </p>
      </Section>

      <Section title="13. Contact Us">
        <p>
          If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
        </p>
        <ul className="list-none space-y-2">
          <li>Email: privacy@hallos.com</li>
          <li>Through our Contact page</li>
        </ul>
      </Section>
    </LegalPageLayout>
  );
}
