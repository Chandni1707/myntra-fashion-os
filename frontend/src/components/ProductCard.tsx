import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";

export interface Product {
  id: string | number;
  name: string;
  brand?: string;
  price?: number;
  image?: string;
  match?: number;
  tags?: string[];
}

export function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);
  const bg = product.image
    ? { backgroundImage: `url(${product.image})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: "linear-gradient(135deg, oklch(0.96 0.03 12), oklch(0.94 0.05 20))" };

  return (
    <div className="card-elevated overflow-hidden group animate-fade-up">
      <div className="relative aspect-[3/4] overflow-hidden" style={bg}>
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur hover:scale-110 transition-transform"
          aria-label="Like"
        >
          <Heart className={`h-4 w-4 transition-colors ${liked ? "fill-primary text-primary" : "text-foreground"}`} />
        </button>
        {typeof product.match === "number" && (
          <div className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
            {product.match}% match
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform p-3">
          <button className="w-full btn-primary rounded-full py-2 text-sm font-semibold flex items-center justify-center gap-2">
            <ShoppingBag className="h-4 w-4" /> Add to bag
          </button>
        </div>
      </div>
      <div className="p-4">
        {product.brand && <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{product.brand}</p>}
        <h3 className="mt-1 text-sm font-semibold truncate">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          {product.price != null && <span className="text-sm font-bold">₹{product.price}</span>}
          {product.tags?.[0] && (
            <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">{product.tags[0]}</span>
          )}
        </div>
      </div>
    </div>
  );
}
