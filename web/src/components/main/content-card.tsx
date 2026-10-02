import Link from "next/link";
import { BarChart3, FileText, Heart, ImageIcon, MessageCircle, PlayCircle } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn, formatCompact } from "@/lib/utils";
import type { Post } from "@/types/content";
import { specialtyHue } from "./specialty-chip";

const TYPE_ICON = { article: FileText, image: ImageIcon, video: PlayCircle, poll: BarChart3 };

export function ContentCover({ post, className }: { post: Pick<Post, "title" | "specialty" | "contentType">; className?: string }) {
  const h = specialtyHue(post.specialty);
  const Icon = TYPE_ICON[post.contentType];
  return (
    <div
      className={cn("relative flex items-end overflow-hidden p-4", className)}
      style={{ background: `linear-gradient(160deg, oklch(0.96 0.025 ${h}), oklch(0.88 0.06 ${(h + 25) % 360}))` }}
    >
      <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur dark:bg-black/40">
        <Icon className="size-3" aria-hidden /> {post.contentType === "video" ? "Video" : post.contentType === "poll" ? "Poll" : post.contentType === "image" ? "Carousel" : "Article"}
      </span>
      {post.contentType === "video" && <PlayCircle className="absolute inset-0 m-auto size-12 text-white/90 drop-shadow" aria-hidden />}
      <p className="relative line-clamp-3 text-lg leading-snug font-semibold tracking-tight" style={{ color: `oklch(0.28 0.06 ${h})` }}>
        {post.title}
      </p>
    </div>
  );
}

export function ContentCard({ post, authorName }: { post: Post; authorName: string }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md">
      <ContentCover post={post} className="aspect-[16/9]" />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold leading-snug">
          <Link href={`/community/${post.id}`} className="after:absolute after:inset-0">{post.title}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.caption}</p>
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2"><UserAvatar name={authorName} size="xs" />{authorName}</span>
          <span className="flex gap-3">
            <span className="flex items-center gap-1"><Heart className="size-3.5" aria-hidden />{formatCompact(post.likes)}</span>
            <span className="flex items-center gap-1"><MessageCircle className="size-3.5" aria-hidden />{post.comments}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
