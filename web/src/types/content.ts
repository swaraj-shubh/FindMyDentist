export type ContentType = "article" | "image" | "video" | "poll";

export interface Post {
  id: string;
  authorId: string;
  authorType: "dentist" | "clinic" | "fmd";
  title: string;
  caption: string;
  body: string;
  contentType: ContentType;
  mediaUrl: string;
  specialty: string;
  tags: string[];
  likes: number;
  likedBy: string[];
  comments: number;
  pollOptions: { label: string; votes: number }[];
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface Reel {
  id: string;
  authorId: string;
  title: string;
  specialty: string;
  duration: number;
  views: number;
  likes: number;
  createdAt: string;
}

export interface Story {
  id: string;
  authorId: string;
  title: string;
  createdAt: string;
  expiresAt: string;
}

export interface Job {
  id: string;
  title: string;
  organization: string;
  location: string;
  type: "full_time" | "part_time" | "locum" | "internship" | "faculty";
  experience: string;
  specialty: string;
  salary: string;
  description: string;
  postedAt: string;
}
