"use client"

import { useState } from 'react';
import { endProject, addStaffToProject, addEquipmentToProject, searchEquipment } from '@/lib/actions';
import { CheckSquare, Square, AlertTriangle, User, Wrench, Calendar, Plus, X, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectClient({ project }: { project: any }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [endedBy, setEndedBy] = useState('');
  const [checkedEq, setCheckedEq] = useState<Record<string, boolean>>({});
  const [isEnding, setIsEnding] = useState(false);

  const[addStaffOpen, setAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const[addEqOpen, setAddEqOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const[searchResults, setSearchResults] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const handleEndInitiate = () => {
    const initialChecks: Record<string, boolean> = {};
    if (project?.equipment && Array.isArray(project.equipment)) {
      project.equipment.forEach((e: any) => {
        if (e?.equipment?.id) {
          initialChecks[e.equipment.id] = false;
        }
      });
    }
    setCheckedEq(initialChecks);
    setModalOpen(true);
  };

  const handleEndSubmit = async () => {
    const total = project.equipment?.length || 0;
    const checkedCount = Object.values(checkedEq).filter(Boolean).length;

    if (checkedCount < total && !warningOpen) {
      setWarningOpen(true);
      return;
    }
    
    setIsEnding(true);
    const returnedIds = Object.keys(checkedEq).filter(k => checkedEq[k]);
    await endProject(project.id, endedBy, returnedIds);
  };

  const handleAddStaffSubmit = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (newStaffName.trim()) {
      setIsAdding(true);
      await addStaffToProject(project.id, newStaffName.trim());
      setNewStaffName('');
      setIsAdding(false);
      setAddStaffOpen(false);
    }
  };

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length > 1) {
      setSearchResults(await searchEquipment(val));
    } else {
      setSearchResults([]);
    }
  };

  const handleAddEquipmentSubmit = async (eqId: string) => {
    setIsAdding(true);
    await addEquipmentToProject(project.id, eqId);
    setIsAdding(false);
    setAddEqOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in space-y-6 relative z-10">
      
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{project.name}</h1>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Calendar size={14} />
              Started {format(new Date(project.startDate), 'MMMM dd, yyyy')}
            </div>
          </div>
          <span className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${project.status === 'ONGOING' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-800">
                <User size={16} className="text-emerald-600" />
                <h3 className="text-sm font-semibold">Assigned Staff</h3>
              </div>
              {project.status === 'ONGOING' && (
                <button type="button" onClick={() => setAddStaffOpen(true)} className="p-1.5 bg-slate-50 text-slate-600 rounded-md border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors active:opacity-80">
                  <Plus size={16} />
                </button>
              )}
            </div>
            <ul className="space-y-2">
              {project.employees?.map((emp: any) => (
                <li key={emp.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm font-medium text-slate-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {emp.name}
                </li>
              ))}
              {(!project.employees || project.employees.length === 0) && <p className="text-slate-400 text-sm italic">No staff assigned.</p>}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-800">
                <Wrench size={16} className="text-emerald-600" />
                <h3 className="text-sm font-semibold">Assigned Equipment</h3>
              </div>
              {project.status === 'ONGOING' && (
                <button type="button" onClick={() => setAddEqOpen(true)} className="p-1.5 bg-slate-50 text-slate-600 rounded-md border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors active:opacity-80">
                  <Plus size={16} />
                </button>
              )}
            </div>
            <ul className="space-y-2">
              {project.equipment?.map((eq: any) => (
                <li key={eq.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm font-medium text-slate-700 flex justify-between items-center gap-3">
                  <span className="truncate">{eq.equipment.name}</span>
                  <span className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">{eq.equipment.code}</span>
                </li>
              ))}
              {(!project.equipment || project.equipment.length === 0) && <p className="text-slate-400 text-sm italic">No equipment assigned.</p>}
            </ul>
          </div>
        </div>

        {project.status === 'ONGOING' && (
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-end">
            <button type="button" onClick={handleEndInitiate} className="w-full md:w-auto bg-white border border-red-200 text-red-600 hover:bg-red-50 px-8 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm relative z-10 active:opacity-80">
              End Project
            </button>
          </div>
        )}
      </div>

      {addStaffOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl animate-in">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-semibold text-slate-800">Add Team Member</h3>
              <button type="button" onClick={() => setAddStaffOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"><X size={18} className="text-slate-500" /></button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Staff Name</label>
              <input 
                autoFocus 
                value={newStaffName} 
                onChange={e => setNewStaffName(e.target.value)} 
                onKeyDown={(e) => { 
                  if (e.key === 'Enter') { 
                    e.preventDefault(); 
                    handleAddStaffSubmit(e); 
                  } 
                }} 
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 bg-slate-50/50 text-sm" 
                placeholder="Enter full name..." 
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={() => setAddStaffOpen(false)} className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm">Cancel</button>
              <button type="button" onClick={handleAddStaffSubmit} disabled={!newStaffName || isAdding} className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 text-sm active:opacity-80">
                {isAdding ? 'Adding...' : 'Add to Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {addEqOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl animate-in">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-semibold text-slate-800">Deploy New Equipment</h3>
              <button type="button" onClick={() => setAddEqOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"><X size={18} className="text-slate-500" /></button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input value={searchQuery} onChange={e => handleSearch(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} autoFocus className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm" placeholder="Search by name or code..." />
            </div>
            <div className="max-h-[40vh] overflow-y-auto space-y-1.5 pr-1">
              {searchResults.map(res => (
                /* Native Button Enforced for Search Results */
                <button type="button" key={res.id} onClick={() => handleAddEquipmentSubmit(res.id)} className="w-full p-3 bg-white border border-slate-100 rounded-xl cursor-pointer hover:border-emerald-200 hover:bg-emerald-50 transition-all flex items-center justify-between group active:opacity-80 text-left">
                  <span className="font-medium text-slate-700 group-hover:text-emerald-800 text-sm">{res.name}</span>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors shrink-0 ml-2">{res.code}</span>
                </button>
              ))}
              {searchQuery.length > 1 && searchResults.length === 0 && (
                <div className="text-center py-6">
                  <Wrench size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No equipment found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-lg shadow-xl animate-in">
            {!warningOpen ? (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-2">End Checklist</h2>
                <p className="text-slate-500 text-sm mb-5">Confirm return of equipment before closing.</p>
                
                <div className="space-y-2 max-h-[40vh] overflow-y-auto mb-6 pr-1">
                  {project.equipment?.map((eq: any) => (
                    /* Native Button Enforced for Checklist Array */
                    <button type="button" key={eq.equipment.id} onClick={() => setCheckedEq({ ...checkedEq,[eq.equipment.id]: !checkedEq[eq.equipment.id] })} className={`w-full flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border text-left active:opacity-80 ${checkedEq[eq.equipment.id] ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}>
                      <div className="flex flex-col">
                        <span className={`font-medium text-sm ${checkedEq[eq.equipment.id] ? 'text-emerald-900' : 'text-slate-700'}`}>{eq.equipment.name}</span>
                        <span className={`text-[10px] font-mono mt-0.5 ${checkedEq[eq.equipment.id] ? 'text-emerald-600' : 'text-slate-400'}`}>{eq.equipment.code}</span>
                      </div>
                      {checkedEq[eq.equipment.id] ? <CheckSquare className="text-emerald-600 shrink-0" size={20} /> : <Square className="text-slate-300 shrink-0" size={20} />}
                    </button>
                  ))}
                  {(!project.equipment || project.equipment.length === 0) && <p className="text-center text-slate-400 text-sm py-4">No equipment to return.</p>}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Closed By</label>
                  <input required value={endedBy} onChange={e => setEndedBy(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 bg-slate-50/50 text-sm" placeholder="Your full name..." />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm">Cancel</button>
                  <button type="button" onClick={handleEndSubmit} disabled={!endedBy || isEnding} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm text-sm active:opacity-80">
                    {isEnding ? 'Processing...' : 'End Project'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Incomplete Return</h3>
                <p className="text-slate-500 text-sm mb-8">Some equipment was not ticked as returned. Close project anyway?</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={() => setWarningOpen(false)} className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm">Go Back</button>
                  <button type="button" onClick={handleEndSubmit} disabled={isEnding} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm text-sm active:opacity-80">
                    {isEnding ? 'Processing...' : 'Force Close'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}