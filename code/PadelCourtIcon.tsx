// Icône terrain de padel : verticale, monochrome, même trait que lucide
const PadelCourtIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="5" y1="12" x2="19" y2="12" />
    <line x1="5" y1="6" x2="19" y2="6" />
    <line x1="5" y1="18" x2="19" y2="18" />
    <line x1="12" y1="6" x2="12" y2="18" />
  </svg>
);

export default PadelCourtIcon;
