import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sponsors } from "@/data/mockData";
import { Mail, Handshake, Gift } from "lucide-react";

export default function Sponsors() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Sponsors & Partners</h1>
        <p className="text-muted-foreground">
          Connect with companies sponsoring hackathons and student events
        </p>
      </div>

      <div className="mb-12 p-8 bg-primary/10 rounded-lg border border-primary/20">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Handshake className="h-16 w-16 text-primary" />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">Become a Sponsor</h2>
            <p className="text-muted-foreground mb-4">
              Support student innovation and gain visibility in the tech community
            </p>
            <Button>Contact Us</Button>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Current Sponsors</h2>
      <div className="space-y-6">
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className="p-6 bg-card rounded-lg border border-border hover:shadow-[var(--shadow-hover)] transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{sponsor.name}</h3>
                  <Badge variant="secondary">{sponsor.type}</Badge>
                </div>
                <p className="text-muted-foreground mb-4">{sponsor.description}</p>
                
                {sponsor.benefits && (
                  <div className="flex items-start gap-2 text-sm mb-3 p-3 bg-primary/5 rounded-lg">
                    <Gift className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <span className="font-medium text-foreground">Benefits: </span>
                      <span className="text-muted-foreground">{sponsor.benefits}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <a href={`mailto:${sponsor.contact}`} className="hover:text-primary">
                    {sponsor.contact}
                  </a>
                </div>
              </div>
              <Button variant="outline">Connect</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
