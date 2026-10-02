import {
  BarChart3,
  Bot,
  BookOpen,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Compass,
  FileText,
  FlaskConical,
  FolderHeart,
  Home,
  LayoutDashboard,
  Library,
  MessageSquare,
  Mic,
  Newspaper,
  Presentation,
  Receipt,
  Search,
  Settings,
  Stethoscope,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const mainNavigation: NavItem[] = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "AI Assistant", href: "/assistant", icon: Bot },
  { label: "Dentists", href: "/dentists", icon: Stethoscope },
  { label: "Appointments", href: "/appointments", icon: CalendarDays },
  { label: "Records", href: "/records", icon: FolderHeart },
  { label: "Community", href: "/community", icon: Users },
];

export const mainMobileNavigation: NavItem[] = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "AI", href: "/assistant", icon: Bot },
  { label: "Appointments", href: "/appointments", icon: CalendarDays },
  { label: "Profile", href: "/profile", icon: User },
];

export const mainSecondaryNavigation: NavItem[] = [
  { label: "Clinics", href: "/clinics", icon: Stethoscope },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
];

export const clinicNavigation: NavItem[] = [
  { label: "Dashboard", href: "/clinic", icon: LayoutDashboard },
  { label: "Appointments", href: "/clinic/appointments", icon: CalendarDays },
  { label: "Patients", href: "/clinic/patients", icon: Users },
  { label: "Treatments", href: "/clinic/treatments", icon: ClipboardList },
  { label: "Billing", href: "/clinic/billing", icon: Receipt },
  { label: "Messages", href: "/clinic/messages", icon: MessageSquare },
  { label: "Analytics", href: "/clinic/analytics", icon: BarChart3 },
];

export const academicNavigation: NavItem[] = [
  { label: "Home", href: "/academic", icon: Home },
  { label: "Studio", href: "/academic/studio", icon: Presentation },
  { label: "Research", href: "/academic/research", icon: Search },
  { label: "Journal Club", href: "/academic/journal-club", icon: Newspaper },
  { label: "Cases", href: "/academic/cases", icon: FileText },
  { label: "Posters", href: "/academic/posters", icon: FlaskConical },
  { label: "Viva", href: "/academic/viva", icon: Mic },
  { label: "Library", href: "/academic/library", icon: Library },
];

export const settingsItem = (base: string): NavItem => ({
  label: "Settings",
  href: `${base}/settings`,
  icon: Settings,
});

export const docsIcon = BookOpen;

/** Longest-prefix match so /clinic/patients/x highlights Patients, not Dashboard. */
export function isActive(pathname: string, href: string, root: string) {
  if (href === root) return pathname === root;
  return pathname === href || pathname.startsWith(`${href}/`);
}
