import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sponsors } from "@/data/mockData";
import { Mail, Handshake, Gift } from "lucide-react";

export default function Sponsors() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 pb-24 lg:pb-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Sponsors & Partners</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Connect with companies sponsoring hackathons and student events
        </p>
      </div>

      <div className="mb-8 sm:mb-12 p-5 sm:p-8 bg-primary/10 rounded-xl sm:rounded-2xl border border-primary/20">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <Handshake className="h-12 w-12 sm:h-16 sm:w-16 text-primary flex-shrink-0" />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Become a Sponsor</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
              Support student innovation and gain visibility in the tech community
            </p>
            <Button className="h-10 text-sm sm:text-base">Contact Us</Button>
          </div>
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Current Sponsors</h2>
      <div className="space-y-4 sm:space-y-6">
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className="p-4 sm:p-6 bg-card rounded-xl sm:rounded-2xl border border-border hover:shadow-lg transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-lg sm:text-xl font-semibold">{sponsor.name}</h3>
                  <Badge variant="secondary" className="text-xs">{sponsor.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3 sm:mb-4">{sponsor.description}</p>
                
                {sponsor.benefits && (
                  <div className="flex items-start gap-2 text-xs sm:text-sm mb-3 p-3 bg-primary/5 rounded-lg">
                    <Gift className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">Benefits: </span>
                      <span className="text-muted-foreground">{sponsor.benefits}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                  <a href={`mailto:${sponsor.contact}`} className="hover:text-primary truncate">
                    {sponsor.contact}
                  </a>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-9 text-sm w-full sm:w-auto">Connect</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
