import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Lock, Eye, Database, Share2, UserCheck, Mail, Trash2 } from "lucide-react";

const sections = [
  {
    title: "1. Information We Collect",
    icon: Database,
    content: `We collect information you provide directly to us, including:

**Personal Information:**
• Full name, email address, and phone number
• College/university name, course, and graduation year
• Profile photo and bio
• LinkedIn, GitHub, and portfolio URLs
• Skills and interests

**Account Information:**
• Login credentials (email and encrypted password)
• Authentication tokens and session data

**Usage Data:**
• Pages visited and features used
• Time spent on the platform
• Device information (browser type, OS)
• IP address and approximate location

**Transaction Data:**
• Order history and delivery addresses
• Payment references (we do not store full payment details)
• Points and rewards transactions`,
  },
  {
    title: "2. How We Use Your Information",
    icon: Eye,
    content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Process transactions and send related information
• Send you technical notices, updates, and support messages
• Respond to your comments, questions, and requests
• Monitor and analyze trends, usage, and activities
• Detect, investigate, and prevent fraudulent transactions
• Personalize and improve your experience
• Send promotional communications (with your consent)
• Match you with relevant opportunities (jobs, events, bounties)
• Facilitate mentorship and networking connections`,
  },
  {
    title: "3. Information Sharing",
    icon: Share2,
    content: `We may share your information in the following circumstances:

**With Your Consent:**
• When you choose to make your profile public
• When you apply for jobs or bounties
• When you connect with mentors or other students

**With Service Providers:**
• Cloud hosting and infrastructure providers
• Email service providers
• Analytics providers
• Payment processors

**For Legal Reasons:**
• To comply with applicable laws and regulations
• To respond to lawful requests from public authorities
• To protect our rights, privacy, safety, or property

**We Never:**
• Sell your personal information to third parties
• Share your phone number without explicit consent
• Provide your data to advertisers for targeting`,
  },
  {
    title: "4. Data Security",
    icon: Lock,
    content: `We implement appropriate security measures to protect your data:

**Technical Measures:**
• Encryption in transit (HTTPS/TLS)
• Encrypted database storage
• Row-level security policies
• Regular security audits

**Access Controls:**
• Role-based access control (RBAC)
• Two-factor authentication for admin accounts
• Session timeout policies

**Monitoring:**
• Continuous security monitoring
• Automated threat detection
• Regular vulnerability assessments

While we strive to protect your information, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.`,
  },
  {
    title: "5. Your Rights and Choices",
    icon: UserCheck,
    content: `You have the following rights regarding your personal data:

**Access:** Request a copy of your personal data
**Correction:** Update or correct inaccurate information
**Deletion:** Request deletion of your account and data
**Portability:** Export your data in a portable format
**Opt-out:** Unsubscribe from marketing communications
**Profile Privacy:** Control whether your profile is public or private
**Phone Visibility:** Choose whether to share your phone number publicly

To exercise these rights, visit your Profile Settings or contact us at privacy@aitd.events`,
  },
  {
    title: "6. Data Retention",
    icon: Database,
    content: `We retain your information for as long as:

• Your account is active
• Needed to provide you with our services
• Required by applicable laws and regulations
• Necessary for legitimate business purposes

When you delete your account:
• Profile data is removed within 30 days
• Anonymized analytics data may be retained
• Legal records may be kept as required by law
• Backup data is purged within 90 days`,
  },
  {
    title: "7. Children's Privacy",
    icon: Shield,
    content: `Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.

If we learn that we have collected personal information from a child under 13, we will take steps to delete such information as soon as possible.

If you believe we may have collected information from a child under 13, please contact us immediately at privacy@aitd.events`,
  },
  {
    title: "8. International Data Transfers",
    icon: Share2,
    content: `Your information may be transferred to and processed in countries other than India. These countries may have different data protection laws.

We ensure appropriate safeguards are in place when transferring data internationally, including:
• Standard contractual clauses
• Compliance with applicable data protection regulations
• Working with service providers who maintain adequate security measures`,
  },
  {
    title: "9. Changes to This Policy",
    icon: Eye,
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by:

• Posting the new Privacy Policy on this page
• Updating the "Last Updated" date
• Sending an email notification for significant changes

We encourage you to review this Privacy Policy periodically for any changes.`,
  },
  {
    title: "10. Contact Us",
    icon: Mail,
    content: `If you have any questions about this Privacy Policy or our data practices, please contact us:

**Email:** privacy@aitd.events
**Address:** AITD Events, India
**Response Time:** Within 48 business hours

For data deletion requests, please use the subject line: "Data Deletion Request"`,
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground">
            Your privacy is important to us. This policy explains how we collect, use, and protect your data.
          </p>
          <Badge variant="secondary" className="mt-4">
            Last Updated: January 7, 2026
          </Badge>
        </div>

        <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <Lock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Our Commitment</h3>
              <p className="text-sm text-muted-foreground">
                AITD Events is committed to protecting your privacy and ensuring the security of your personal information. 
                We collect only what we need to provide you with the best experience and never sell your data to third parties.
              </p>
            </div>
          </div>
        </Card>

        <ScrollArea className="h-[60vh] md:h-auto">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <section.icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <Card className="p-6 mt-6 bg-muted/50">
          <div className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-destructive" />
            <div>
              <h3 className="font-semibold">Want to delete your data?</h3>
              <p className="text-sm text-muted-foreground">
                You can delete your account and all associated data from your Profile Settings, or contact us at privacy@aitd.events
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
