import { Star } from "lucide-react";
import { useState } from "react";

export function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="rounded-md p-1 transition-transform hover:scale-110"
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              n <= display ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
