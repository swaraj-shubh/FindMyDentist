import { cn } from "@/lib/utils";

// Lucide dropped brand icons, so these are minimal line-art marks (not official logos).
const PATHS: Record<string, React.ReactNode> = {
  instagram: (<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" /></>),
  facebook: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5c0-.3.2-.5.5-.5Z" />,
  linkedin: (<><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 11v5M8 8v.01M12 16v-5m0 2a2.5 2.5 0 0 1 5 0v3" /></>),
  x: <path d="M4 4l16 16M20 4 4 20" />,
  youtube: (<><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9.5 5 2.5-5 2.5Z" fill="currentColor" /></>),
};

export function SocialIcon({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("size-5", className)}>
      {PATHS[id]}
    </svg>
  );
}
