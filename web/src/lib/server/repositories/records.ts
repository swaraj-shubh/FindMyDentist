import { defineTable } from "../csv/table";
import type { DentalRecord } from "@/types/record";

export const recordsRepo = defineTable<DentalRecord>("records");
