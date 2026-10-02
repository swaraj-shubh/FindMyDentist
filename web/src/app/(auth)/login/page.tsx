import type { Metadata } from "next";
import Link from "next/link";
import { PersonaPicker } from "./persona-picker";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome to FMD</h1>
      <p className="mt-1 text-muted-foreground">One account for FMD, FMD Clinic and FMD Academic. Choose a demo persona to continue.</p>
      <div className="mt-6">
        <PersonaPicker next={typeof next === "string" ? next : undefined} />
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here? <Link href="/register" className="font-medium text-primary hover:underline">Create an account</Link>
      </p>
      <p className="mt-6 rounded-xl bg-muted/70 p-3 text-xs text-muted-foreground">Prototype sign-in: no passwords or OTP. All personas and records are fictional.</p>
    </div>
  );
}
