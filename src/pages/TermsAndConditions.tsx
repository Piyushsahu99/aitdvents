import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TermsAndConditions() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing and using AITD Events ("Platform"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.`
    },
    {
      title: "2. Eligibility",
      content: `You must be at least 18 years old or have parental consent to use this Platform. By registering, you confirm that all information provided is accurate and up-to-date. Students must provide valid educational institution details when required.`
    },
    {
      title: "3. Bounty Program Terms",
      content: `
        3.1 Participation: Students can participate in bounties by submitting their work according to the specified requirements.
        
        3.2 Submissions: All submissions must be original work. Plagiarism or copyright infringement will result in immediate disqualification and account suspension.
        
        3.3 Payments: Winners will be paid according to the prize distribution announced for each bounty. Payments are processed within 30 days of winner announcement.
        
        3.4 Tax Compliance: Winners are responsible for reporting and paying applicable taxes on their earnings. AITD Events does not withhold taxes.
        
        3.5 KYC Requirements: To receive payments above ₹10,000, users must complete KYC verification including PAN card details (for Indian residents) or equivalent documentation.
      `
    },
    {
      title: "4. User Accounts",
      content: `
        4.1 You are responsible for maintaining the confidentiality of your account credentials.
        
        4.2 One person may maintain only one account.
        
        4.3 You must immediately notify us of any unauthorized use of your account.
        
        4.4 We reserve the right to suspend or terminate accounts that violate these terms.
      `
    },
    {
      title: "5. Intellectual Property",
      content: `
        5.1 Platform Content: All content, features, and functionality on the Platform are owned by AITD Events and are protected by copyright laws.
        
        5.2 User Content: By submitting content (bounty submissions, blog posts, etc.), you grant AITD Events a non-exclusive license to use, display, and promote your work.
        
        5.3 Bounty Submissions: Unless otherwise stated, you retain ownership of your submissions while granting the bounty sponsor rights as specified in individual bounty terms.
      `
    },
    {
      title: "6. Payment and Refund Policy",
      content: `
        6.1 All bounty prizes are final and non-transferable.
        
        6.2 Payment methods include bank transfer (NEFT/IMPS), UPI, or other methods as specified.
        
        6.3 Minimum withdrawal amount is ₹500.
        
        6.4 Payment processing fees, if any, will be borne by the recipient.
        
        6.5 In case of disputes, AITD Events' decision is final.
      `
    },
    {
      title: "7. Legal Compliance",
      content: `
        7.1 GST: For payments above ₹2,00,000 annually, GST-registered users must provide their GSTIN.
        
        7.2 Income Tax: All earnings must be reported as per Indian Income Tax Act, 1961.
        
        7.3 Foreign Exchange: For international payments, users must comply with FEMA regulations.
        
        7.4 Anti-Money Laundering: We reserve the right to verify the source of large submissions or suspicious activities.
      `
    },
    {
      title: "8. Prohibited Activities",
      content: `
        Users must not:
        - Submit plagiarized or copyrighted content without permission
        - Create multiple accounts to game the system
        - Use bots or automated systems to gain unfair advantages
        - Engage in fraudulent activities
        - Harass or abuse other users
        - Violate any applicable laws or regulations
      `
    },
    {
      title: "9. Data Privacy",
      content: `
        9.1 We collect and process personal data as described in our Privacy Policy.
        
        9.2 Your payment information is stored securely and encrypted.
        
        9.3 We do not sell your personal information to third parties.
        
        9.4 You have the right to request deletion of your data (subject to legal retention requirements).
      `
    },
    {
      title: "10. Limitation of Liability",
      content: `
        10.1 AITD Events is not liable for any indirect, incidental, or consequential damages.
        
        10.2 Our total liability for any claim shall not exceed the amount paid to you in the past 12 months.
        
        10.3 We are not responsible for third-party content, links, or services.
        
        10.4 Technical issues or platform downtime do not constitute grounds for compensation.
      `
    },
    {
      title: "11. Dispute Resolution",
      content: `
        11.1 Governing Law: These terms are governed by Indian law.
        
        11.2 Jurisdiction: Courts in [Your City], India have exclusive jurisdiction.
        
        11.3 Arbitration: Disputes may be referred to arbitration as per the Arbitration and Conciliation Act, 1996.
        
        11.4 Cooling Period: Users must attempt to resolve disputes through our support team before initiating legal proceedings.
      `
    },
    {
      title: "12. Modifications",
      content: `
        We reserve the right to modify these terms at any time. Continued use of the Platform after modifications constitutes acceptance of the updated terms. We will notify users of significant changes via email or platform notifications.
      `
    },
    {
      title: "13. Contact Information",
      content: `
        For questions about these terms, contact us at:
        
        Email: legal@aitdevents.com
        Address: [Your Registered Address]
        
        Last Updated: January 2025
      `
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Terms & Conditions</h1>
            <p className="text-muted-foreground">
              Last updated: January 1, 2025
            </p>
            <Badge variant="outline" className="mt-4">
              Please read these terms carefully before using our platform
            </Badge>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {sections.map((section, index) => (
                <div key={index} className="space-y-2">
                  <h2 className="text-xl font-bold text-primary">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-8 p-4 bg-primary/5 rounded-lg">
            <p className="text-sm text-center">
              By using AITD Events, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
