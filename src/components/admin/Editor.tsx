"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { MantineProvider } from "@mantine/core";

export default function Editor() {
  const editor = useCreateBlockNote();

  return (
    // MantineProvider ensures the menus and buttons look correct
    <MantineProvider defaultColorScheme="dark">
      <div className="min-h-[400px] w-full bg-slate-950 p-4 rounded-lg border border-slate-800">
        <BlockNoteView editor={editor} theme="dark" />
      </div>
    </MantineProvider>
  );
}