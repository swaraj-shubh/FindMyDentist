import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { CommentForm, CommunityPost } from "@/components/main/community-post";
import { getPost } from "@/lib/server/services/community-service";
import { getSession } from "@/lib/server/session";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Post" };

export default async function PostPage({ params }: PageProps<"/community/[postId]">) {
  const { postId } = await params;
  const user = await getSession();
  const data = await getPost(postId, user?.id);
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/community" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" />Community</Link>
      <CommunityPost post={data.post} signedIn={!!user} expanded />
      <section id="comments" aria-labelledby="comments-h" className="space-y-4">
        <h2 id="comments-h" className="font-semibold">Comments ({data.comments.length})</h2>
        <CommentForm postId={postId} signedIn={!!user} />
        <ul className="space-y-4">
          {data.comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <UserAvatar name={c.authorName} size="sm" />
              <div className="flex-1 rounded-2xl bg-card px-4 py-2.5 ring-1 ring-border">
                <p className="text-sm"><span className="font-medium">{c.authorName}</span> <span className="text-xs text-muted-foreground">· {timeAgo(c.createdAt)}</span></p>
                <p className="mt-0.5 text-sm">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
