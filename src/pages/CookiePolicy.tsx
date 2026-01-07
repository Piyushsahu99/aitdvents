import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cookie, Shield, Settings, BarChart3, Target, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const cookieTypes = [
  {
    name: "Essential Cookies",
    icon: Shield,
    required: true,
    description: "These cookies are necessary for the website to function and cannot be disabled.",
    examples: [
      "Authentication tokens (sb-token)",
      "Session management",
      "Security tokens (CSRF protection)",
      "Cookie consent preferences",
    ],
    retention: "Session to 1 year",
  },
  {
    name: "Functional Cookies",
    icon: Settings,
    required: false,
    description: "These cookies enable enhanced functionality and personalization.",
    examples: [
      "Language preferences",
      "Theme settings (dark/light mode)",
      "Recently viewed items",
      "Form autofill data",
    ],
    retention: "1 year",
  },
  {
    name: "Analytics Cookies",
    icon: BarChart3,
    required: false,
    description: "These cookies help us understand how visitors interact with our website.",
    examples: [
      "Page view tracking",
      "User journey analysis",
      "Feature usage statistics",
      "Error tracking and debugging",
    ],
    retention: "2 years",
  },
  {
    name: "Performance Cookies",
    icon: Clock,
    required: false,
    description: "These cookies help us improve website performance and user experience.",
    examples: [
      "Load time monitoring",
      "Cache preferences",
      "CDN optimization",
      "Resource loading priorities",
    ],
    retention: "1 year",
  },
];

const sections = [
  {
    title: "What Are Cookies?",
    content: `Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.

Cookies can be "persistent" (remain on your device until deleted or expired) or "session" (deleted when you close your browser).`,
  },
  {
    title: "How We Use Cookies",
    content: `We use cookies to:

• **Authenticate users** - Keep you logged in across sessions
• **Remember preferences** - Store your settings and preferences
• **Improve performance** - Optimize website loading and caching
• **Analyze usage** - Understand how visitors use our platform
• **Enhance security** - Protect against unauthorized access
• **Personalize content** - Show relevant recommendations`,
  },
  {
    title: "Third-Party Cookies",
    content: `Some cookies are placed by third-party services that appear on our pages:

**Authentication Providers:**
• Google OAuth (for Google sign-in)

**Analytics:**
• Basic usage analytics for platform improvement

We carefully select our partners and ensure they comply with applicable privacy regulations. We do not allow advertising cookies or tracking for ad targeting purposes.`,
  },
  {
    title: "Managing Cookies",
    content: `You can control and manage cookies in several ways:

**Browser Settings:**
Most browsers allow you to refuse or accept cookies, delete existing cookies, and set preferences for certain websites. Refer to your browser's help documentation for instructions.

**Cookie Consent:**
When you first visit our website, you'll be presented with a cookie consent banner where you can choose which types of cookies to accept.

**Platform Settings:**
Some preferences can be managed directly in your AITD Events account settings.

**Note:** Blocking essential cookies may affect the functionality of our website and prevent you from using certain features.`,
  },
  {
    title: "Cookie Retention",
    content: `Different cookies have different retention periods:

• **Session Cookies:** Deleted when you close your browser
• **Persistent Cookies:** Remain for a set period (typically 30 days to 2 years)
• **Authentication Cookies:** Valid for the duration of your session or until you log out
• **Preference Cookies:** Typically retained for 1 year

You can clear cookies at any time through your browser settings.`,
  },
  {
    title: "Updates to This Policy",
    content: `We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.

We will notify you of any material changes by:
• Updating the "Last Updated" date at the top of this policy
• Displaying a notice on our website
• Requesting renewed consent if required`,
  },
  {
    title: "Contact Us",
    content: `If you have questions about our use of cookies, please contact us:

**Email:** privacy@aitd.events
**Subject:** Cookie Policy Inquiry

We aim to respond to all inquiries within 48 business hours.`,
  },
];

const CookiePolicy = () => {
  const [preferences, setPreferences] = useState({
    essential: true,
    functional: true,
    analytics: true,
    performance: true,
  });

  const handleSavePreferences = () => {
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    toast.success("Cookie preferences saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Cookie className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Cookie Policy</h1>
          </div>
          <p className="text-muted-foreground">
            Learn how we use cookies to improve your experience on AITD Events.
          </p>
          <Badge variant="secondary" className="mt-4">
            Last Updated: January 7, 2026
          </Badge>
        </div>

        {/* Cookie Preferences Card */}
        <Card className="p-6 mb-8 border-primary/20 bg-primary/5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Manage Your Cookie Preferences
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {cookieTypes.map((cookie) => (
              <div
                key={cookie.name}
                className="flex items-start gap-3 p-4 bg-background rounded-lg border"
              >
                <cookie.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-sm">{cookie.name}</h3>
                    {cookie.required ? (
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    ) : (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[cookie.name.toLowerCase().split(" ")[0] as keyof typeof preferences]}
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              [cookie.name.toLowerCase().split(" ")[0]]: e.target.checked,
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{cookie.description}</p>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={handleSavePreferences} className="mt-4 w-full md:w-auto">
            Save Preferences
          </Button>
        </Card>

        {/* Cookie Types Detail */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6">Cookies We Use</h2>
          <div className="space-y-6">
            {cookieTypes.map((cookie, index) => (
              <div key={index} className="border-b border-border pb-6 last:border-0 last:pb-0">
                <div className="flex items-start gap-3 mb-3">
                  <cookie.icon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {cookie.name}
                      {cookie.required && (
                        <Badge variant="outline" className="text-xs">Always Active</Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{cookie.description}</p>
                  </div>
                </div>
                <div className="ml-8 grid gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Examples:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {cookie.examples.map((example, i) => (
                        <li key={i}>• {example}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Retention:</p>
                    <p className="text-xs text-muted-foreground">{cookie.retention}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* General Information */}
        <ScrollArea className="h-[50vh] md:h-auto">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <Card key={index} className="p-6">
                <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {section.content}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Notice Card */}
        <Card className="p-6 mt-6 bg-muted/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-semibold">Browser Cookie Settings</h3>
              <p className="text-sm text-muted-foreground">
                You can configure your browser to block or delete cookies. However, some features of our website may not work properly without essential cookies enabled.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CookiePolicy;
