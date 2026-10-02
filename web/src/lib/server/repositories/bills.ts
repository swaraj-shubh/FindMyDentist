import { defineTable } from "../csv/table";
import type { Bill } from "@/types/billing";

export const billsRepo = defineTable<Bill>("bills", {
  numbers: ["subtotal", "discount", "tax", "total"],
});
