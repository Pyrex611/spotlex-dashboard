"use client"

import { useState } from 'react';
import { createEquipment } from '@/lib/actions';
import { ImageIcon } from 'lucide-react';

export default function NewEquipment() {
  const[type, setType] = useState('MAIN');
  const [name, setName] = useState('');
  const[code, setCode] = useState('');
  const [compCode, setCompCode] = useState('');
  const[equipCode, setEquipCode] = useState('');
  const[picture, setPicture] = useState('');
  const[isSubmitting, setIsSubmitting] = useState(false);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPicture(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await createEquipment({ type, name, code, componentCode: compCode, equipmentCode: equipCode, picture });
  };

  return (
    <div className="max-w-2xl mx-auto animate-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Register Equipment</h1>
        <p className="text-sm text-slate-500 mt-1">Add a new tool, vehicle, or component to the database.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Type Selector */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <label className="block text-sm font-medium text-slate-700 mb-2">Classification</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 bg-slate-50/50 text-sm">
            <option value="MAIN">Main Equipment</option>
            <option value="COMPONENT">Equipment Component</option>
          </select>
        </div>

        {/* Details Grid */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5">
          {type === 'MAIN' ? (
            <>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Equipment Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 bg-slate-50/50 text-sm" placeholder="e.g. Heavy Duty Excavator" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Equipment Code</label>
                <input required value={code} onChange={e => setCode(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono text-slate-800 bg-slate-50/50 text-sm" placeholder="e.g. EX-2049" />
              </div>
            </>
          ) : (
            <>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Component Code</label>
                <input required value={compCode} onChange={e => setCompCode(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono text-slate-800 bg-slate-50/50 text-sm" placeholder="e.g. COMP-90X" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Linked Parent Code</label>
                <input required value={equipCode} onChange={e => setEquipCode(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono text-slate-800 bg-slate-50/50 text-sm" placeholder="e.g. EX-2049" />
                <p className="text-[11px] text-slate-500 mt-2">Links this component to an existing Main Equipment.</p>
              </div>
            </>
          )}
        </div>

        {/* Picture */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <label className="block text-sm font-medium text-slate-700 mb-4">Thumbnail Image</label>
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-20 h-20 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
              {picture ? <img src={picture} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" size={24}/>}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <label className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-50 transition-colors inline-block shadow-sm">
                Browse Files
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
              <p className="text-[11px] text-slate-400 mt-2">JPEG, PNG or WEBP.</p>
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold text-sm hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50 mt-2">
          {isSubmitting ? 'Saving...' : 'Save Record'}
        </button>
      </form>
    </div>
  );
}