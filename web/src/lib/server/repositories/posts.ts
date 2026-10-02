import { defineTable } from "../csv/table";
import type { Comment, Post, Reel, Story } from "@/types/content";

export const postsRepo = defineTable<Post>("posts", { numbers: ["likes", "comments"] });
export const commentsRepo = defineTable<Comment>("comments");
export const reelsRepo = defineTable<Reel>("reels", { numbers: ["duration", "views", "likes"] });
export const storiesRepo = defineTable<Story>("stories");
