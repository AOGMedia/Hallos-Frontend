import { LegalPageLayout, Section } from "@/components/legal/LegalPageLayout";

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Use" lastUpdated="February 12, 2026">
      <Section title="1. Acceptance of Terms">
        <p>
          Welcome to Cubed Square Ltd working under the trade name Hallos
          hereafter referred to as “Hallos”. By accessing or using our platform,
          you agree to be bound by these Terms of Use and all applicable laws
          and regulations.
          <br />
          If you do not agree with any of these terms, you are prohibited from
          using or accessing this site.
        </p>
      </Section>

      <Section title="2. Description of Service">
        <p>
          Hallos is an interactive live learning platform that connects creators
          and learners through:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Live streaming classes and educational content</li>
          <li>Pre-recorded video courses</li>
          <li>Real-time interactive sessions using WebRTC technology</li>
          <li>Special courses and educational programs</li>
          <li>Payment processing for paid content</li>
        </ul>
      </Section>

      <Section title="3. User Accounts">
        <p>
          <strong>Registration:</strong> You must create an account to access
          certain features. You agree to provide accurate, current, and complete
          information during registration.
        </p>
        <p>
          <strong>Account Security:</strong> You are responsible for maintaining
          the confidentiality of your account credentials and for all activities
          that occur under your account.
        </p>
        <p>
          <strong>Account Types:</strong> We offer different account types
          including learner accounts and creator accounts, each with specific
          rights and responsibilities.
        </p>
      </Section>

      <Section title="4. Creator Responsibilities">
        <p>If you create and publish content on Hallos, you agree to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Own or have the necessary rights to all content you upload</li>
          <li>
            Ensure your content does not violate any laws or third-party rights
          </li>
          <li>Provide accurate descriptions and pricing for your content</li>
          <li>Deliver scheduled live classes as promised</li>
          <li>Maintain professional conduct during live sessions</li>
          <li>Comply with our content guidelines and community standards</li>
          <li>
            Where you intend to record a live session, comply with the recording
            obligations set out in Section 9.
          </li>
          <li>
            Provide clear refund policies for users and ask that users provide
            consent before paying for your service.
          </li>
        </ul>
      </Section>

      <Section title="5. Payment Terms">
        <p>
          <strong>Pricing:</strong> Creators set their own prices for content.
          All prices are displayed in the applicable currency (NGN or USD).
        </p>
        <p>
          <strong>Payment Processing:</strong> We use third-party payment
          processors (Paystack for NGN, Stripe for USD) to handle transactions
          securely.
        </p>
        <p>
          <strong>Refunds:</strong> Refund policies are determined by individual
          creators. Please review the refund policy before purchasing content.
        </p>
        <p>
          <strong>Creator Payouts:</strong> Creators receive payouts according
          to our creator payment schedule, minus applicable platform fees.
        </p>
      </Section>

      <Section title="6. Intellectual Property">
        <p>
          <strong>Platform Content:</strong> All platform features, design, and
          functionality are owned by Hallos and protected by copyright and
          trademark laws.
        </p>
        <p>
          <strong>User Content:</strong> You retain ownership of content you
          create and upload. By uploading content, you grant Hallos a worldwide,
          non-exclusive license to use, display, and distribute your content on
          the platform.
        </p>
        <p>
          <strong>Prohibited Use:</strong> You may not download, record, or
          redistribute content without explicit permission from the content
          creator, except as permitted for personal, non-commercial use where
          clearly authorised by the creator.
        </p>
      </Section>

      <Section title="7. Prohibited Conduct">
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use the platform for any illegal purpose</li>
          <li>Harass, abuse, or harm other users</li>
          <li>
            Upload malicious code or attempt to compromise platform security
          </li>
          <li>Impersonate others or misrepresent your affiliation</li>
          <li>Spam or send unsolicited communications</li>
          <li>Circumvent payment systems or access controls</li>
          <li>
            Use automated systems to access the platform without permission
          </li>
          <li>
            Record, reproduce, or redistribute live sessions or any other
            content except as expressly permitted by the creator and these
            Terms.
          </li>
        </ul>
      </Section>

      <Section title="8. Content Moderation">
        <p>
          We reserve the right to review, remove, or restrict access to any
          content that violates these terms or our community guidelines. We may
          suspend or terminate accounts that repeatedly violate our policies.
        </p>
      </Section>

      <Section title="9. Live Streaming Terms">
        <p>
          <strong>Technology:</strong> We use IN-APP and custom RTMP streaming
          for live classes. Connection quality depends on your internet
          connection.
        </p>
        <p>
          <strong>Recording:</strong> LCreators may record live sessions. By
          using the platform, you acknowledge that sessions may be recorded.
          <br />
          Before starting a recording, the creator must inform all participants
          that the session will be recorded and obtain their explicit consent.
          This consent shall be obtained via an in‑session prompt or other clear
          notification mechanism.
          <br />
          If a participant does not wish to be recorded, they may withdraw
          consent by muting their microphone, disabling their camera, or leaving
          the session. Remaining in the session after being notified constitutes
          explicit consent to the recording.
          <br />
          Any recording made in violation of this requirement may be removed,
          and the creator’s account may be subject to moderation action.
          <br />
          Conduct – You must maintain respectful behaviour during live sessions.
        </p>
        <p>
          <strong>Conduct:</strong> Maintain respectful behavior during live
          sessions.
        </p>
      </Section>

      <Section title="10. Disclaimer of Warranties">
        <p>
          THE PLATFORM IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY
          KIND. WE DO NOT GUARANTEE UNINTERRUPTED ACCESS, ERROR-FREE OPERATION,
          OR THAT THE PLATFORM WILL MEET YOUR REQUIREMENTS.
        </p>
      </Section>

      <Section title="11. Limitation of Liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, HALLOS SHALL NOT BE LIABLE FOR
          ANY DIRECT OR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
          EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS
          OF BUSINESS, LOSS OF REVENUE, LOSS OF DATA, OR LOSS OF GOODWILL,
          ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF, OR INABILITY TO USE,
          THE PLATFORM.
        </p>
        <p>
          HALLOS&apos;S TOTAL AGGREGATE LIABILITY TO YOU FOR ANY AND ALL CLAIMS
          ARISING OUT OF OR RELATING TO THESE TERMS OF USE OR YOUR USE OF THE
          PLATFORM, WHETHER IN CONTRACT, TORT (INCLUDING NEGLIGENCE), BREACH OF
          STATUTORY DUTY, OR OTHERWISE, SHALL NOT EXCEED THE GREATER OF: (I) THE
          TOTAL FEES PAID BY YOU TO HALLOS IN THE TWELVE (12) MONTHS IMMEDIATELY
          PRECEDING THE EVENT GIVING RISE TO THE CLAIM; OR (II) ₦100,000.
        </p>
        <p>
          NOTHING IN THIS CLAUSE SHALL LIMIT OR EXCLUDE HALLOS&apos;S LIABILITY FOR:
          (I) DEATH OR PERSONAL INJURY CAUSED BY HALLOS&apos;S NEGLIGENCE; (II) FRAUD
          OR FRAUDULENT MISREPRESENTATION; (III) ANY OTHER LIABILITY THAT CANNOT
          BE LIMITED OR EXCLUDED BY APPLICABLE LAW, INCLUDING YOUR STATUTORY
          RIGHTS AS A CONSUMER UNDER THE FEDERAL COMPETITION AND CONSUMER
          PROTECTION ACT, 2018.
        </p>
      </Section>

      <Section title="12. Termination">
        <p>
          We may terminate or suspend your account at any time for violations of
          these terms. You may delete your account at any time through your
          account settings.
        </p>
      </Section>

      <Section title="13. Changes to Terms">
        <p>
          We reserve the right to modify these terms at any time. We will notify
          users of significant changes via email or platform notification.
          Continued use after changes constitutes acceptance of the new terms.
        </p>
      </Section>

      <Section title="14. Governing Law & Dispute Resolution">
        <p>
          These Terms are governed by the laws of the Federal Republic of
          Nigeria.
        </p>
        <p>
          Any dispute arising out of or in connection with these Terms shall be
          resolved through binding arbitration in accordance with the
          Arbitration and Conciliation Act, Cap A18, Laws of the Federation of
          Nigeria 2004.
        </p>
        <p>The arbitration shall be conducted by a single arbitrator.</p>
        <p>
          Notwithstanding clause 14.2, either party may approach a court of
          competent jurisdiction in Nigeria for interim, injunctive, or
          declaratory relief. Further, consumer disputes and small claims may be
          referred to the appropriate small claims court to ensure consumer
          protection rights are preserved.
        </p>
      </Section>

      <Section title="15. Contact Information">
        <p>
          For questions about these Terms of Use, please contact us through our
          Contact page or email us at legal@hallos.com.
        </p>
      </Section>
    </LegalPageLayout>
  );
}
