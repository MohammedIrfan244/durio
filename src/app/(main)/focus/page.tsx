import { getUserId } from "@/lib/server/get-user";
import { redirect } from "next/navigation";
import FocusBoard from "@/components/pages/focus/focus-board";
import { prisma } from "@/lib/prisma";

export default async function FocusPage() {
  const userId = await getUserId();
  
  if (!userId) {
    redirect("/auth/sign-in");
  }

  // Fetch all routine blocks for the user
  const blocks = await prisma.routineBlock.findMany({
    where: { userId },
    orderBy: { startTime: 'asc' }
  });

  // Fetch note folders and notes for linkage
  const noteFolders = await prisma.noteFolder.findMany({
    where: { userId, status: 'ACTIVE' },
    include: { notes: { where: { status: 'ACTIVE' } } }
  });
  
  const rootNotes = await prisma.note.findMany({
    where: { userId, status: 'ACTIVE', folderId: null }
  });

  const notesList = [
    ...rootNotes.map(n => ({ id: n.id, title: n.heading, isFolder: false })),
    ...noteFolders.map(f => ({
      id: f.id, 
      title: f.name, 
      isFolder: true, 
      children: f.notes.map(n => ({ id: n.id, title: n.heading, isFolder: false }))
    }))
  ];

  return (
    <div className="h-full flex flex-col relative w-full overflow-hidden bg-background">
      <FocusBoard initialBlocks={blocks} availableNotes={notesList} />
    </div>
  );
}