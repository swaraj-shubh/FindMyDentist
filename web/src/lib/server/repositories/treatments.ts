import { defineTable } from "../csv/table";
import type { Treatment } from "@/types/patient";

export const treatmentsRepo = defineTable<Treatment>("treatments", {
  numbers: ["cost", "warrantyMonths"],
});
