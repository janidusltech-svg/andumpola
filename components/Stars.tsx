// components/Stars.tsx
export default function Stars({
  rating,
  size = "text-base",
}: {
  rating: number;
  size?: string;
}) {
  return (
    <span className={`${size} leading-none`} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= Math.round(rating) ? "text-turmeric" : "text-line"}
        >
          ★
        </span>
      ))}
    </span>
  );
}
