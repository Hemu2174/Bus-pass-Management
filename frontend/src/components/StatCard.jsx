const StatCard = ({ title, value, subtitle, icon, variant = "default" }) => {
  const glowClass = variant === "primary" ? "glow-primary border-primary/20" : variant === "secondary" ? "glow-secondary border-secondary/20" : "border-border";

  return (
    <div className={`glass-card p-5 ${glowClass}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-display uppercase tracking-widest text-muted-foreground">{title}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <p className="text-3xl font-display font-bold">{value}</p>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
