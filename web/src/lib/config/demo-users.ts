import type { UserRole } from "@/types/user";

export type Persona = "patient" | "dentist" | "student" | "clinic";

export const DEMO_PERSONAS: Record<
  Persona,
  { userId: string; label: string; description: string; home: string; roles: UserRole[] }
> = {
  patient: {
    userId: "u001",
    label: "Patient",
    description: "Ananya Rao · discover dentists, AI guidance, records",
    home: "/home",
    roles: ["patient"],
  },
  dentist: {
    userId: "u002",
    label: "Dentist",
    description: "Dr. Arjun Mehta · SmileCare Indiranagar",
    home: "/clinic",
    roles: ["dentist"],
  },
  student: {
    userId: "u003",
    label: "Student",
    description: "Priya Sharma · MDS Prosthodontics",
    home: "/academic",
    roles: ["student", "faculty"],
  },
  clinic: {
    userId: "u004",
    label: "Clinic Staff",
    description: "Kavya Nair · front desk, SmileCare",
    home: "/clinic",
    roles: ["clinic"],
  },
};

/** Which roles may enter each workspace. FMD Main is public. */
export const WORKSPACE_ROLES = {
  clinic: ["dentist", "clinic"] as UserRole[],
  academic: ["student", "faculty", "dentist"] as UserRole[],
};
