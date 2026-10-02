"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User as UserIcon, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api-client";
import { DEMO_PERSONAS, type Persona } from "@/lib/config/demo-users";
import type { User } from "@/types/user";
import { UserAvatar } from "./user-avatar";

const ROLE_LABEL: Record<User["role"], string> = { patient: "Patient", dentist: "Dentist", student: "Student", faculty: "Faculty", clinic: "Clinic staff" };

export function useSwitchPersona() {
  const router = useRouter();
  return async (persona: Persona, stay = false) => {
    try {
      const { home } = await api<{ home: string }>("/api/v1/session", { body: { persona } });
      toast.success(`Now viewing as ${DEMO_PERSONAS[persona].label.toLowerCase()}`);
      if (!stay) router.push(home);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
}

export function UserMenu({ user, settingsHref = "/settings" }: { user: User | null; settingsHref?: string }) {
  const router = useRouter();
  const switchPersona = useSwitchPersona();

  if (!user)
    return (
      <Button asChild size="sm">
        <Link href="/login">Sign in</Link>
      </Button>
    );

  async function signOut() {
    await api("/api/v1/session", { method: "DELETE" });
    router.push("/home");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 rounded-full px-1 sm:pr-2.5" aria-label="Account menu">
          <UserAvatar name={user.name} size="sm" />
          <span className="hidden max-w-32 truncate text-sm font-medium lg:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-3 py-2">
          <UserAvatar name={user.name} size="md" />
          <span className="min-w-0">
            <span className="block truncate font-medium">{user.name}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">{ROLE_LABEL[user.role]} · {user.email}</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={settingsHref}>
            <Settings /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Users /> Switch demo persona
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-64">
            {(Object.keys(DEMO_PERSONAS) as Persona[]).map((p) => (
              <DropdownMenuItem key={p} onSelect={() => switchPersona(p)} disabled={DEMO_PERSONAS[p].userId === user.id} className="flex-col items-start gap-0">
                <span className="font-medium">{DEMO_PERSONAS[p].label}</span>
                <span className="text-xs text-muted-foreground">{DEMO_PERSONAS[p].description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
