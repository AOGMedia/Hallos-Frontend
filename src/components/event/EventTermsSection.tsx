const TERMS = [
  {
    heading: '1. Registration',
    body: 'All participants are required to complete the registration form and pay a non-refundable commitment fee of ₦1,000 to successfully register for the Program.',
  },
  {
    heading: '2. Selection Process',
    body: 'All registered participants will be invited to take part in a selection tournament consisting of educational and interactive activities designed to assess skills, engagement, and performance.',
  },
  {
    heading: '3. Shortlisting',
    body: 'Following the tournament, only the top 50 participants will be selected and invited to participate in the full 2-day, all-expense paid FastTrack Your Growth to Success experience.',
  },
  {
    heading: '4. Participation Requirement',
    body: 'Participants who are shortlisted must be available and fully committed to attending the entire duration of the 2-day program. Failure to attend may result in forfeiture of the opportunity.',
  },
  {
    heading: '5. Non-Transferability',
    body: 'Participation in the Program is non-transferable. Shortlisted slots cannot be transferred to another individual.',
  },
  {
    heading: "6. User's Discretion",
    body: 'The organizers reserve the right to make final decisions regarding participant selection and may modify, reschedule, or cancel any part of the Program if necessary.',
  },
  {
    heading: '7. Code of Conduct',
    body: 'All participants are expected to behave respectfully and professionally throughout the selection process and the Program. Any form of misconduct may result in disqualification.',
  },
  {
    heading: '8. Acceptance of Terms',
    body: 'By registering, you acknowledge that you have read, understood, and agreed to these terms and conditions. For further inquiries, please contact the Program organizers.',
  },
];

export function EventTermsSection() {
  return (
    <section
      aria-label="Terms and conditions"
      className="event-section-dark w-full py-16 sm:py-24 px-4 sm:px-8 lg:px-16"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col gap-6">
        {/* Heading block */}
        <div className="flex flex-col items-center gap-6 text-center">
          <h2
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 800,
              lineHeight: '80px',
              color: '#f2f2f2',
            }}
          >
            Terms and Conditions
          </h2>
          <p
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(16px, 2vw, 24px)',
              fontWeight: 400,
              lineHeight: '33.60px',
              color: '#f2f2f2',
              maxWidth: '800px',
            }}
          >
            By registering for the FastTrack Your Growth to Success program, you
            agree to the following terms and conditions:
          </p>
        </div>

        {/* Terms body */}
        <div className="flex flex-col gap-8 mt-6">
          {TERMS.map((term) => (
            <div key={term.heading} className="flex flex-col gap-2">
              <h3
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 'clamp(16px, 1.5vw, 24px)',
                  fontWeight: 700,
                  color: '#f2f2f2',
                }}
              >
                {term.heading}
              </h3>
              <p
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 'clamp(14px, 1.5vw, 24px)',
                  fontWeight: 400,
                  lineHeight: '36px',
                  color: '#f2f2f2',
                }}
              >
                {term.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
