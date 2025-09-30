interface TrustBadgeProps {
  name: string;
  logo?: string;
}

export const TrustBadge = ({ name, logo }: TrustBadgeProps) => {
  return (
    <div className="flex items-center justify-center p-4 bg-card rounded-lg border border-border hover:shadow-md transition-all grayscale hover:grayscale-0">
      {logo ? (
        <img src={logo} alt={name} className="h-8 object-contain" />
      ) : (
        <span className="text-sm font-semibold text-muted-foreground">{name}</span>
      )}
    </div>
  );
};
