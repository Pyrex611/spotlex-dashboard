"use client"

import { useState } from 'react';
import { createProject, searchEquipment } from '@/lib/actions';
import { Plus, X, Search, Users, Wrench } from 'lucide-react';

export default function NewProject() {
  const [name, setName] = useState('');
  const [empName, setEmpName] = useState('');
  const [employees, setEmployees] = useState<string[]>([]);
  const [equipments, setEquipments] = useState<{ id: string, name: string, code: string }[]>([]);
  
  const[modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const[searchResults, setSearchResults] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmployeeAdd = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (empName.trim() && !employees.includes(empName.trim())) {
      setEmployees([...employees, empName.trim()]);
      setEmpName('');
    }
  };

  const handleSearch = async (val: string) => {
    setSearch(val);
    if (val.length > 1) {
      const res = await searchEquipment(val);
      setSearchResults(res);
    } else {
      setSearchResults([]);
    }
  };

  const addEquipment = (eq: any) => {
    if (!equipments.find(e => e.id === eq.id)) {
      setEquipments([...equipments, eq]);
    }
    setModalOpen(false);
    setSearch('');
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await createProject({ name, employees, equipmentIds: equipments.map(e => e.id) });
  };

  return (
    <div className="max-w-2xl mx-auto animate-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Initialize Project</h1>
        <p className="text-slate-500 mt-1 text-sm">Create a new environmental deployment.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label>
          <input required value={name} onChange={e => setName(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 bg-slate-50/50" placeholder="e.g. Lagos Lagoon Phase 1" />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-emerald-600" />
            <h2 className="text-sm font-semibold text-slate-800">Assign Personnel</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input 
              value={empName} 
              onChange={e => setEmpName(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleEmployeeAdd(e);
                }
              }} 
              className="flex-1 w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 bg-slate-50/50 text-sm" 
              placeholder="Employee full name..." 
            />
            <button 
              type="button" 
              onClick={handleEmployeeAdd} 
              className="bg-slate-800 text-white px-5 py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 text-sm sm:w-auto w-full active:opacity-80"
            >
              <Plus size={16}/> Add Staff
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {employees.map((emp, i) => (
              <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-200">
                {emp} 
                <button type="button" onClick={() => setEmployees(employees.filter((_, idx) => idx !== i))} className="hover:bg-slate-200 p-0.5 rounded-md transition-colors"><X size={12} className="text-slate-500" /></button>
              </span>
            ))}
            {employees.length === 0 && <p className="text-xs text-slate-400 italic">No personnel added yet.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Wrench size={16} className="text-emerald-600" />
            <h2 className="text-sm font-semibold text-slate-800">Assign Equipment</h2>
          </div>
          
          <button type="button" onClick={() => setModalOpen(true)} className="w-full py-4 border border-dashed border-slate-300 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-600 transition-all flex justify-center items-center gap-2 text-sm bg-slate-50/50 active:opacity-80">
            <Plus size={16}/> Browse Registry
          </button>
          
          <div className="mt-4 space-y-2">
            {equipments.map((eq, i) => (
              <div key={i} className="flex justify-between items-center bg-white border border-slate-100 p-3 rounded-xl shadow-sm text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-800">{eq.name || 'Component'}</span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{eq.code}</span>
                </div>
                <button type="button" onClick={() => setEquipments(equipments.filter((_, idx) => idx !== i))} className="p-1.5 hover:bg-red-50 rounded-md transition-colors group">
                  <X size={14} className="text-slate-400 group-hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={isSubmitting || !name} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:opacity-80">
          {isSubmitting ? 'Initializing...' : 'Launch Project'}
        </button>
      </form>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl animate-in">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-semibold text-slate-800">Select Equipment</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"><X size={18} className="text-slate-500" /></button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input value={search} onChange={e => handleSearch(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} autoFocus className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm" placeholder="Search by name or code..." />
            </div>
            <div className="max-h-[40vh] overflow-y-auto space-y-1.5 pr-1">
              {searchResults.map(res => (
                /* Native Button Enforced for Search Results */
                <button type="button" key={res.id} onClick={() => addEquipment(res)} className="w-full p-3 bg-white border border-slate-100 rounded-xl cursor-pointer hover:border-emerald-200 hover:bg-emerald-50 transition-all flex items-center justify-between group active:opacity-80 text-left">
                  <span className="font-medium text-slate-700 group-hover:text-emerald-800 text-sm">{res.name}</span>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors shrink-0 ml-2">{res.code}</span>
                </button>
              ))}
              {search.length > 1 && searchResults.length === 0 && (
                <div className="text-center py-6">
                  <Wrench size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No equipment found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}