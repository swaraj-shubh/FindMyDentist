import { ProductLogo } from "@/components/shared/brand";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col bg-[radial-gradient(ellipse_at_top,var(--secondary),transparent_55%)]">
      <header className="p-6"><ProductLogo product="main" href="/home" /></header>
      <main className="flex flex-1 items-start justify-center px-4 pt-4 pb-16 sm:items-center sm:pt-0">{children}</main>
    </div>
  );
}
