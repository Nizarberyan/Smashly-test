type Props = {
  size?: number;
  letter?: string;
  ball?: string;
  edge?: string;
  seam?: string;
  rotateDeg?: number;
  fontWeight?: number;
};

export default function PadelBallPro({
  size = 34,
  letter = "P",
  ball = "#F6D35E",
  edge = "#E3BE40",
  seam = "#FFFFFF",
  rotateDeg = -18,
  fontWeight = 800,
}: Props) {
  const id = Math.random().toString(36).slice(2, 8);
  const clipId = `clip-${id}`;

  return (
    <svg
  width={size}
  height={size}
  viewBox="0 0 100 100"
  aria-label="Padel ball"
  style={{ display: "block" }}
>
  {/* Balle principale */}
  <circle
    cx="50"
    cy="50"
    r="47"
    fill={ball}
    stroke="#000000"         // ✅ contour de la balle noir
    strokeWidth="3.5"
  />

  <clipPath id={clipId}>
    <circle cx="50" cy="50" r="47" />
  </clipPath>

  <g clipPath={`url(#${clipId})`} transform={`rotate(${rotateDeg} 50 50)`}>
  {/* Coutures de la balle avec contour noir */}
  <path
    d="M 8,28 C 22,18 78,18 92,28"
    fill="none"
    stroke="#FFFFFF"           // ligne blanche
    strokeWidth="8"
    strokeLinecap="round"
  />
  <path
    d="M 8,28 C 22,18 78,18 92,28"
    fill="none"
    stroke="#000000"           // léger contour noir
    strokeWidth="9.5"
    strokeLinecap="round"
    opacity="0.5"
  />
  
  <path
    d="M 8,72 C 22,82 78,82 92,72"
    fill="none"
    stroke="#FFFFFF"
    strokeWidth="8"
    strokeLinecap="round"
  />
  <path
    d="M 8,72 C 22,82 78,82 92,72"
    fill="none"
    stroke="#000000"
    strokeWidth="9.5"
    strokeLinecap="round"
    opacity="0.5"
  />
</g>

  {/* Lettre blanche avec contour noir bien marqué */}
  <text
    x="50"
    y="63"
    textAnchor="middle"
    fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
    fontSize="41"
    fontWeight={fontWeight}
    fill="#FFFFFF"           // ✅ lettre blanche
    stroke="#000000"         // ✅ contour noir
    strokeWidth="2.5"
    strokeLinejoin="round"
    style={{ paintOrder: "stroke" }}
  >
    {letter.slice(0, 1).toUpperCase()}
  </text>
</svg>
  );
}






