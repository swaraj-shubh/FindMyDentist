import type { Metadata } from "next";
import { requireUser } from "@/lib/server/session";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Set up your profile" };

export default async function OnboardingPage() {
  const user = await requireUser("/onboarding");
  return <OnboardingForm name={user.name} role={user.role} />;
}
