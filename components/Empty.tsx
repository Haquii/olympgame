export default function Empty({
  icon = "🏟️",
  title,
  children,
}: {
  icon?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="text-center px-6 py-16 text-ink-soft">
      <div className="text-[54px] mb-3 opacity-70">{icon}</div>
      <h3 className="font-display text-[26px] text-ink mb-1.5">{title}</h3>
      {children}
    </div>
  );
}
