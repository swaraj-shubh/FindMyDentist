"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/lib/api-client";

export function DeleteProjectButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="ghost" size="icon-sm" className="absolute right-3 bottom-3 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100" aria-label={`Delete ${title}`}><Trash2 /></Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Delete “{title}”?</DialogTitle><DialogDescription>The outline, slides and viva questions will be permanently removed.</DialogDescription></DialogHeader>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Keep</Button></DialogClose>
          <Button variant="destructive" onClick={async () => { try { await api("/api/v1/academic/projects", { method: "DELETE", body: { id } }); toast.success("Project deleted"); setOpen(false); router.refresh(); } catch (e) { toast.error((e as Error).message); } }}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
