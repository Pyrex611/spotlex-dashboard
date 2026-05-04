import prisma from '@/lib/db';
import Link from 'next/link';
import { format, isAfter } from 'date-fns';
import { User, Wrench, Calendar, Info, ArrowLeft, CheckCircle2, XCircle, UserMinus, Plus } from 'lucide-react';

export default async function HistoryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { 
      employees: { orderBy: { joinDate: 'asc' } }, 
      equipment: { include: { equipment: true }, orderBy: { assignDate: 'asc' } } 
    },
  });

  if (!project) return null;

  return (
    <div className="animate-in max-w-4xl mx-auto">
      <Link href="/history" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700 mb-6"><ArrowLeft size={16} /> Back to Archive</Link>
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="border-b pb-6 mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 text-xs">
            <div><p className="text-slate-400 uppercase font-bold">Commenced</p><p className="font-semibold text-slate-700">{format(project.startDate, 'MMM dd, yyyy')}</p></div>
            <div><p className="text-slate-400 uppercase font-bold">Closed</p><p className="font-semibold text-slate-700">{format(project.endDate!, 'MMM dd, yyyy')}</p></div>
            <div><p className="text-slate-400 uppercase font-bold">Supervisor</p><p className="font-semibold text-slate-700">{project.endedBy}</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><User size={16} className="text-emerald-600"/> Personnel Timeline</h3>
            <ul className="space-y-3">
              {project.employees.map(emp => {
                 const isLate = isAfter(new Date(emp.joinDate), new Date(project.startDate));
                 return (
                   <li key={emp.id} className="p-3 border rounded-xl bg-slate-50 flex flex-col gap-1">
                     <div className="flex justify-between items-center">
                       <span className="font-bold text-slate-700 text-sm">{emp.name}</span>
                       {emp.status === 'RECALLED' ? <span className="bg-yellow-100 text-yellow-700 text-[9px] px-1.5 py-0.5 rounded font-black">RECALLED</span> : isLate ? <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded font-black">JOINED LATE</span> : <span className="text-[9px] text-slate-400 font-bold">ORIGINAL</span>}
                     </div>
                     <p className="text-[10px] text-slate-400 italic">Joined: {format(emp.joinDate, 'MMM dd, HH:mm')}{emp.recallDate && ` | Recalled: ${format(emp.recallDate, 'MMM dd')}`}</p>
                   </li>
                 );
              })}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Wrench size={16} className="text-emerald-600"/> Equipment Manifest</h3>
            <ul className="space-y-3">
              {project.equipment.map(assign => (
                <li key={assign.id} className="p-3 border rounded-xl bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <div><p className="font-bold text-slate-700 text-sm">{assign.equipment.name}</p><p className="text-[10px] font-mono text-slate-400">{assign.equipment.code}</p></div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${assign.status === 'RETURNED' ? 'bg-emerald-100 text-emerald-700' : assign.status === 'RECALLED' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{assign.status}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 border-t pt-2 mt-1">
                    {assign.status === 'RECALLED' ? `Recalled by ${assign.recalledBy} on ${format(assign.recallDate!, 'MMM dd')}` : `Assigned on ${format(assign.assignDate, 'MMM dd')}`}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}