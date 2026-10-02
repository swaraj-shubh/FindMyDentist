import { GraduationCap, Smile, Stethoscope, type LucideIcon } from "lucide-react";

export type ProductId = "main" | "clinic" | "academic";

export const PRODUCTS: Record<
  ProductId,
  { id: ProductId; name: string; tagline: string; href: string; icon: LucideIcon; color: string }
> = {
  main: {
    id: "main",
    name: "FMD",
    tagline: "Explore dental care",
    href: "/home",
    icon: Smile,
    color: "var(--product-main)",
  },
  clinic: {
    id: "clinic",
    name: "FMD Clinic",
    tagline: "Manage your practice",
    href: "/clinic",
    icon: Stethoscope,
    color: "var(--product-clinic)",
  },
  academic: {
    id: "academic",
    name: "FMD Academic",
    tagline: "Research & presentations",
    href: "/academic",
    icon: GraduationCap,
    color: "var(--product-academic)",
  },
};
