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
        <h1 className="text-2xl font-bold text-slate-900">Active Deployments</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage your ongoing environmental projects.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/projects/new" className="group h-full min-h-[200px]">
          <div className="h-full w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all cursor-pointer">
            <div className="h-12 w-12 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm group-hover:border-emerald-200">
              <Plus size={20} className="text-current" />
            </div>
            <span className="mt-3 font-medium text-sm">Initialize New Project</span>
          </div>
        </Link>

        {projects.map((proj) => (
          <Link key={proj.id} href={`/projects/${proj.id}`}>
            <div className="h-full min-h-[200px] rounded-2xl bg-white border border-slate-200 p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-300 transition-all flex flex-col cursor-pointer relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <h2 className="text-lg font-semibold text-slate-800 mb-1 truncate pr-2">{proj.name}</h2>
              <p className="text-xs font-medium text-slate-500 mb-6">Started {format(proj.startDate, 'MMM dd, yyyy')}</p>
              
              <div className="space-y-2 mt-auto">
                <div className="flex items-center justify-between bg-slate-50 px-3 py-2.5 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Wrench size={14} className="text-slate-400" />
                    <span className="text-xs font-medium">Equipments</span>
                  </div>
                  <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded text-xs border border-slate-200">{proj._count.equipment}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 px-3 py-2.5 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users size={14} className="text-slate-400" />
                    <span className="text-xs font-medium">Employees</span>
                  </div>
                  <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded text-xs border border-slate-200">{proj._count.employees}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}