"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeCheck, Heart, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/user-avatar";
import { api } from "@/lib/api-client";
import { cn, formatCompact, timeAgo } from "@/lib/utils";
import type { FeedPost } from "@/lib/server/services/community-service";
import { ContentCover } from "./content-card";

function Poll({ post, signedIn }: { post: FeedPost; signedIn: boolean }) {
  const [options, setOptions] = useState(post.pollOptions);
  const [voted, setVoted] = useState(post.voted);
  const total = options.reduce((s, o) => s + o.votes, 0);
  async function vote(i: number) {
    if (!signedIn) return toast("Sign in to vote");
    try {
      setOptions(await api("/api/v1/main/posts", { body: { action: "vote", postId: post.id, option: i } }));
      setVoted(true);
    } catch (e) {
      toast.error((e as Error).message);
      setVoted(true);
    }
  }
  return (
    <div className="space-y-2">
      {options.map((o, i) => {
        const pct = total ? Math.round((o.votes / total) * 100) : 0;
        return (
          <button key={o.label} disabled={voted} onClick={() => vote(i)} className="relative flex w-full items-center justify-between overflow-hidden rounded-xl border px-4 py-2.5 text-left text-sm enabled:hover:border-primary/50">
            {voted && <span className="absolute inset-y-0 left-0 bg-secondary" style={{ width: `${pct}%` }} aria-hidden />}
            <span className="relative font-medium">{o.label}</span>
            {voted && <span className="relative text-muted-foreground tabular-nums">{pct}%</span>}
          </button>
        );
      })}
      <p className="text-xs text-muted-foreground">{formatCompact(total)} votes</p>
    </div>
  );
}

export function CommunityPost({ post, signedIn, expanded }: { post: FeedPost; signedIn: boolean; expanded?: boolean }) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);

  async function like() {
    if (!signedIn) {
      router.push(`/login?next=/community/${post.id}`);
      return;
    }
    setLiked(!liked); // optimistic
    setLikes((n) => n + (liked ? -1 : 1));
    try {
      const r = await api<{ liked: boolean; likes: number }>("/api/v1/main/posts", { body: { action: "like", postId: post.id } });
      setLiked(r.liked);
      setLikes(r.likes);
    } catch (e) {
      setLiked(liked);
      setLikes(post.likes);
      toast.error((e as Error).message);
    }
  }

  async function share() {
    const url = `${location.origin}/community/${post.id}`;
    if (navigator.share) await navigator.share({ title: post.title, url }).catch(() => {});
    else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border bg-card">
      <header className="flex items-center gap-3 p-4">
        <Link href={`/dentists/${post.author.slug}`}><UserAvatar name={post.author.name} size="md" /></Link>
        <div className="min-w-0 flex-1">
          <Link href={`/dentists/${post.author.slug}`} className="flex items-center gap-1 font-medium hover:underline">
            {post.author.name}{post.author.verified && <BadgeCheck className="size-4 text-primary" aria-label="Verified" />}
          </Link>
          <p className="truncate text-xs text-muted-foreground">{post.specialty} · {timeAgo(post.createdAt)}</p>
        </div>
      </header>
      {post.contentType !== "poll" && post.contentType !== "article" && <ContentCover post={post} className="aspect-[4/3] sm:aspect-video" />}
      <div className="space-y-3 p-4">
        <h2 className="text-lg font-semibold leading-snug">
          {expanded ? post.title : <Link href={`/community/${post.id}`} className="hover:underline">{post.title}</Link>}
        </h2>
        <p className={cn("text-[15px] leading-relaxed whitespace-pre-line text-muted-foreground", !expanded && "line-clamp-3")}>{expanded ? post.body : post.caption + (post.contentType === "article" ? `\n\n${post.body}` : "")}</p>
        {post.contentType === "poll" && <Poll post={post} signedIn={signedIn} />}
        <ul className="flex flex-wrap gap-1.5">
          {post.tags.map((t) => <li key={t} className="text-xs text-primary">#{t.replace(/\s+/g, "")}</li>)}
        </ul>
      </div>
      <footer className="flex items-center gap-1 border-t px-2 py-1.5 text-sm">
        <button onClick={like} aria-pressed={liked} className="flex items-center gap-1.5 rounded-lg px-3 py-2 hover:bg-muted">
          <Heart className={cn("size-[18px] transition-transform", liked && "scale-110 fill-destructive text-destructive")} aria-hidden />
          <span className="tabular-nums">{formatCompact(likes)}</span><span className="sr-only">likes</span>
        </button>
        <Link href={`/community/${post.id}#comments`} className="flex items-center gap-1.5 rounded-lg px-3 py-2 hover:bg-muted">
          <MessageCircle className="size-[18px]" aria-hidden />{post.comments}<span className="sr-only">comments</span>
        </Link>
        <button onClick={share} className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 hover:bg-muted"><Share2 className="size-[18px]" aria-hidden />Share</button>
      </footer>
    </article>
  );
}

export function CommentForm({ postId, signedIn }: { postId: string; signedIn: boolean }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  if (!signedIn)
    return <p className="rounded-xl bg-muted p-3 text-sm"><Link href={`/login?next=/community/${postId}`} className="font-medium text-primary hover:underline">Sign in</Link> to join the conversation.</p>;
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await api("/api/v1/main/posts", { body: { action: "comment", postId, body } });
          setBody("");
          router.refresh();
        } catch (err) {
          toast.error((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
      className="flex gap-2"
    >
      <label htmlFor="comment" className="sr-only">Add a comment</label>
      <input id="comment" value={body} onChange={(e) => setBody(e.target.value)} maxLength={500} placeholder="Add a comment…" className="h-10 flex-1 rounded-full border bg-card px-4 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" />
      <button disabled={busy || !body.trim()} className="rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50">Post</button>
    </form>
  );
}
