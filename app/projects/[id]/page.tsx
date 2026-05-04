import prisma from '@/lib/db';
import ProjectClient from './ProjectClient';
import { Info } from 'lucide-react';

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { 
      employees: true, 
      equipment: { include: { equipment: true } } 
    }
  });

  if (!project) {
    return (
      <div className="p-12 text-center text-red-600 bg-white rounded-2xl border border-slate-200 mt-10 max-w-lg mx-auto">
        <Info size={32} className="mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-bold">Project Missing</h2>
        <p className="text-slate-500 text-sm mt-1">This project could not be found.</p>
      </div>
    );
  }

  return <ProjectClient project={project} />;
}