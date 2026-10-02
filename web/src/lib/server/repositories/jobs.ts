import { defineTable } from "../csv/table";
import type { Job } from "@/types/content";

export const jobsRepo = defineTable<Job>("jobs");
