import { ServiceError } from "../http";
import { newId } from "../csv/table";
import { dentistsRepo } from "../repositories/dentists";
import { commentsRepo, postsRepo, reelsRepo, storiesRepo } from "../repositories/posts";
import { notify } from "./notification-service";
import type { Post } from "@/types/content";
import type { Dentist } from "@/types/dentist";
import type { User } from "@/types/user";

export async function getFeed(filter: { tab?: string; specialty?: string; userId?: string }) {
  const [posts, dentists] = await Promise.all([postsRepo.all(), dentistsRepo.all()]);
  let rows = posts.filter((p) => !filter.specialty || p.specialty === filter.specialty);
  if (filter.tab === "trending") rows = rows.sort((a, b) => b.likes + b.comments * 3 - (a.likes + a.comments * 3));
  else rows = rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (filter.tab === "following") rows = rows.filter((p) => ["d001", "d002", "d003", "d004"].includes(p.authorId)); // ponytail: demo follow list
  return rows.map((p) => present(p, dentists.find((d) => d.id === p.authorId)!, filter.userId));
}

/** Never ship who-liked-what to the client — only this viewer's own state. */
function present(p: Post, author: Dentist, userId?: string) {
  const { likedBy, ...rest } = p;
  return { ...rest, author, liked: !!userId && likedBy.includes(userId), voted: !!userId && likedBy.includes(`vote:${userId}`) };
}

export type FeedPost = Awaited<ReturnType<typeof getFeed>>[number];

export async function getPost(id: string, userId?: string) {
  const post = await postsRepo.get(id);
  if (!post) return null;
  const [author, comments] = await Promise.all([dentistsRepo.get(post.authorId), commentsRepo.where((c) => c.postId === id)]);
  return { post: present(post, author!, userId), comments: comments.sort((a, b) => a.createdAt.localeCompare(b.createdAt)) };
}

export async function toggleLike(user: User, postId: string) {
  const post = await postsRepo.get(postId);
  if (!post) throw new ServiceError("Post not found.", 404);
  const liked = post.likedBy.includes(user.id);
  const updated = await postsRepo.update(postId, {
    likedBy: liked ? post.likedBy.filter((id) => id !== user.id) : [...post.likedBy, user.id],
    likes: post.likes + (liked ? -1 : 1),
  });
  return { liked: !liked, likes: updated!.likes };
}

export async function addComment(user: User, postId: string, body: string) {
  const post = await postsRepo.get(postId);
  if (!post) throw new ServiceError("Post not found.", 404);
  const comment = await commentsRepo.insert({ id: newId("cm"), postId, authorId: user.id, authorName: user.name, body, createdAt: new Date().toISOString() });
  await postsRepo.update(postId, { comments: post.comments + 1 });
  const author = await dentistsRepo.get(post.authorId);
  if (author && author.userId !== user.id) await notify(author.userId, { type: "community", title: `${user.name} commented`, message: body.slice(0, 100), href: `/community/${postId}` });
  return comment;
}

export async function votePoll(user: User, postId: string, option: number) {
  const post = await postsRepo.get(postId);
  if (!post || post.contentType !== "poll" || !post.pollOptions[option]) throw new ServiceError("Poll option not found.", 404);
  if (post.likedBy.includes(`vote:${user.id}`)) throw new ServiceError("You've already voted.", 409);
  const pollOptions = post.pollOptions.map((o, i) => (i === option ? { ...o, votes: o.votes + 1 } : o));
  // ponytail: votes tracked in likedBy with a prefix to avoid another CSV; split out if polls grow.
  await postsRepo.update(postId, { pollOptions, likedBy: [...post.likedBy, `vote:${user.id}`] });
  return pollOptions;
}

export async function getExplore() {
  const [reels, stories, dentists] = await Promise.all([reelsRepo.all(), storiesRepo.all(), dentistsRepo.all()]);
  const now = new Date().toISOString();
  return {
    reels: reels.map((r) => ({ ...r, author: dentists.find((d) => d.id === r.authorId)! })),
    stories: stories.filter((s) => s.expiresAt > now).map((s) => ({ ...s, author: dentists.find((d) => d.id === s.authorId)! })),
  };
}
