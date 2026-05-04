import prisma from '@/lib/db';
import ProjectClient from './ProjectClient';
import { Info } from 'lucide-react';

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params per Next.js 15 spec
  const resolvedParams = await params;
  
  const project = await prisma.project.findUnique({
    where: { id: resolvedParams.id },
    include: { employees: true, equipment: { include: { equipment: true } } }
  });

  if (!project) {
    return (
      <div className="p-12 text-center text-red-600 bg-red-50 rounded-3xl border border-red-200 mt-10 max-w-2xl mx-auto">
        <Info size={40} className="mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Project Data Missing</h2>
        <p>We couldn't load the details for this project. It might have been removed.</p>
      </div>
    );
  }

  // Pass the loaded data securely to the client component
  return <ProjectClient project={project} />;
}