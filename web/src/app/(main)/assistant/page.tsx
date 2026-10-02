import type { Metadata } from "next";
import { AiChat } from "@/components/main/ai-chat";

export const metadata: Metadata = { title: "AI Dental Assistant" };

export default async function AssistantPage({ searchParams }: PageProps<"/assistant">) {
  const { q } = await searchParams;
  return <AiChat initialQuestion={typeof q === "string" ? q : undefined} />;
}
