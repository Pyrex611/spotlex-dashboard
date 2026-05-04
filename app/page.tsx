import prisma from '@/lib/db';
import Link from 'next/link';
import { Plus, Users, Wrench } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { status: 'ONGOING' },
    include: { _count: { select: { equipment: true, employees: true } } },
    orderBy: { startDate: 'desc' }
  });

  return (
    <div className="animate-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-900">Ongoing Projects</h1>
        <p className="text-green-700 mt-2">Manage current environmental deployments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/projects/new" className="group h-full min-h-[220px]">
          <div className="h-full w-full rounded-3xl border-2 border-dashed border-green-400 bg-green-50/60 flex flex-col items-center justify-center text-green-700 hover:bg-green-100 hover:border-green-600 transition-all cursor-pointer shadow-sm">
            <div className="h-16 w-16 rounded-full bg-green-200 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Plus size={32} className="text-green-800" />
            </div>
            <span className="mt-4 font-bold text-lg tracking-wide">Add New Project</span>
          </div>
        </Link>

        {projects.map((proj) => (
          <Link key={proj.id} href={`/projects/${proj.id}`}>
            <div className="h-full min-h-[220px] rounded-3xl bg-white shadow-md border border-green-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col cursor-pointer relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-green-600 group-hover:bg-green-400 transition-colors" />
              <h2 className="text-2xl font-black text-green-950 mb-1 truncate pr-4">{proj.name}</h2>
              <p className="text-sm font-bold text-green-600 mb-6">Started: {format(proj.startDate, 'MMM dd, yyyy')}</p>
              
              <div className="space-y-3 mt-auto">
                <div className="flex items-center justify-between bg-green-50/80 px-4 py-3 rounded-2xl border border-green-100">
                  <div className="flex items-center gap-2 text-green-800">
                    <Wrench size={18} className="text-green-600" />
                    <span className="text-sm font-bold">Equipments Assigned</span>
                  </div>
                  <span className="font-black text-green-900 bg-green-200 px-3 py-1 rounded-lg text-sm shadow-sm">{proj._count.equipment}</span>
                </div>
                <div className="flex items-center justify-between bg-green-50/80 px-4 py-3 rounded-2xl border border-green-100">
                  <div className="flex items-center gap-2 text-green-800">
                    <Users size={18} className="text-green-600" />
                    <span className="text-sm font-bold">Employees Assigned</span>
                  </div>
                  <span className="font-black text-green-900 bg-green-200 px-3 py-1 rounded-lg text-sm shadow-sm">{proj._count.employees}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}