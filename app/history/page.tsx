import prisma from '@/lib/db';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, User, Wrench, Calendar, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const pastProjects = await prisma.project.findMany({
    where: { status: 'ENDED' },
    include: { employees: true, equipment: { include: { equipment: true } } },
    orderBy: { endDate: 'desc' }
  });

  return (
    <div className="animate-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-900">Project History</h1>
        <p className="text-green-700 mt-2">Archive of completed environmental deployments.</p>
      </div>

      <div className="space-y-8">
        {pastProjects.map(proj => (
          <div key={proj.id} className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-md border border-green-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gray-300" />
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8 border-b-2 border-green-50 pb-8">
              <div>
                <h2 className="text-3xl font-black text-green-950 mb-3">{proj.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-green-700">
                  <span className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100"><Calendar size={16}/> {format(proj.startDate, 'MMM dd, yyyy')}</span>
                  <span className="text-green-300">➜</span>
                  <span className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100"><Calendar size={16}/> {proj.endDate ? format(proj.endDate, 'MMM dd, yyyy') : 'N/A'}</span>
                </div>
              </div>
              <div className="bg-gray-50 border-2 border-gray-100 px-6 py-4 rounded-2xl text-right md:min-w-[200px]">
                <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-1">Ended By</p>
                <p className="text-gray-800 font-extrabold text-lg flex items-center justify-end gap-2"><User size={18} className="text-gray-400"/> {proj.endedBy || 'Unknown'}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <User size={18} className="text-green-600" />
                  <h3 className="text-sm uppercase tracking-widest text-green-600 font-black">Assigned Staff</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {proj.employees.map(emp => (
                    <span key={emp.id} className="bg-white text-green-900 px-4 py-2 rounded-xl text-sm font-bold border-2 border-green-100 shadow-sm">{emp.name}</span>
                  ))}
                  {proj.employees.length === 0 && <span className="text-sm text-gray-500 font-medium italic">No staff assigned</span>}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Wrench size={18} className="text-green-600" />
                  <h3 className="text-sm uppercase tracking-widest text-green-600 font-black">Equipment Manifest</h3>
                </div>
                <ul className="space-y-3">
                  {proj.equipment.map(eq => (
                    <li key={eq.id} className="flex items-center justify-between bg-gray-50/50 border border-gray-100 p-3.5 rounded-2xl">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-gray-900 text-sm mb-1">{eq.equipment.name}</span>
                        <span className="text-xs font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-100 inline-block w-fit">{eq.equipment.code}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                        {eq.returned ? (
                          <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-100">
                            <CheckCircle2 size={16} className="text-green-600" />
                            <span className="text-xs text-green-700 font-bold uppercase tracking-wider">Returned</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100">
                            <XCircle size={16} className="text-red-500" />
                            <span className="text-xs text-red-600 font-bold uppercase tracking-wider">Missing</span>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                  {proj.equipment.length === 0 && <span className="text-sm text-gray-500 font-medium italic">No equipment assigned</span>}
                </ul>
              </div>
            </div>
          </div>
        ))}
        {pastProjects.length === 0 && (
          <div className="text-center py-24 bg-white/50 rounded-[3rem] border-2 border-green-200 border-dashed">
            <Info size={48} className="text-green-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-green-900 mb-2">No Past Projects</h3>
            <p className="text-green-600 font-medium">Archived and completed projects will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}