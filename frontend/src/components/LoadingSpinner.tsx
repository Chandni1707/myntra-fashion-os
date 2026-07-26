import { Sparkles } from "lucide-react";

export function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-primary-soft" />
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-float" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="card-elevated overflow-hidden">
      <div className="aspect-[3/4] animate-shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 rounded animate-shimmer" />
        <div className="h-3 w-1/2 rounded animate-shimmer" />
      </div>
    </div>
  );
}
