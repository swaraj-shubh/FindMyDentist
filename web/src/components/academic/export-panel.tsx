"use client";

import { Braces, Download, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ExportMenu({ projectId }: { projectId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline"><Download />Export</Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Prototype exports — PPTX/PDF rendering is a separate engine in production</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><a href={`/api/v1/academic/export?projectId=${projectId}`} download><FileText />Markdown with notes & references</a></DropdownMenuItem>
        <DropdownMenuItem asChild><a href={`/api/v1/academic/export?projectId=${projectId}&format=json`} download><Braces />Structured slide JSON</a></DropdownMenuItem>
        <DropdownMenuItem onSelect={() => window.print()}><Printer />Print / save as PDF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
