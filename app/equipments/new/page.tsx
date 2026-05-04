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
  const [picture, setPicture] = useState('');
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
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-lg border border-green-100 animate-in">
      <h1 className="text-2xl md:text-3xl font-black text-green-950 mb-6 md:mb-8 border-b-2 border-green-50 pb-4 md:pb-6">Register Equipment</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        <div>
          <label className="block text-sm font-bold text-green-900 mb-3">Equipment Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full border-2 border-green-100 focus:border-green-600 focus:ring-0 rounded-xl md:rounded-2xl p-4 bg-green-50/50 outline-none transition-colors font-bold text-green-950 cursor-pointer text-base md:text-lg">
            <option value="MAIN">Main Equipment</option>
            <option value="COMPONENT">Equipment Component</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-green-50/30 p-5 md:p-6 rounded-2xl md:rounded-[2rem] border border-green-100">
          {type === 'MAIN' ? (
            <>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-green-900 mb-2 md:mb-3">Equipment Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border-2 border-green-100 focus:border-green-600 focus:ring-0 rounded-xl md:rounded-2xl p-4 bg-white outline-none transition-colors text-base md:text-lg font-bold text-green-950" placeholder="e.g. Heavy Duty Excavator" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-green-900 mb-2 md:mb-3">Equipment Code</label>
                <input required value={code} onChange={e => setCode(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border-2 border-green-100 focus:border-green-600 focus:ring-0 rounded-xl md:rounded-2xl p-4 bg-white outline-none transition-colors font-mono font-bold text-green-900 text-base md:text-lg" placeholder="e.g. EX-2049" />
              </div>
            </>
          ) : (
            <>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-green-900 mb-2 md:mb-3">Component Code</label>
                <input required value={compCode} onChange={e => setCompCode(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border-2 border-green-100 focus:border-green-600 focus:ring-0 rounded-xl md:rounded-2xl p-4 bg-white outline-none transition-colors font-mono font-bold text-green-900 text-base md:text-lg" placeholder="e.g. COMP-90X" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-green-900 mb-2 md:mb-3">Linked Equipment Code</label>
                <input required value={equipCode} onChange={e => setEquipCode(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border-2 border-green-100 focus:border-green-600 focus:ring-0 rounded-xl md:rounded-2xl p-4 bg-white outline-none transition-colors font-mono font-bold text-green-900 text-base md:text-lg" placeholder="e.g. EX-2049" />
                <p className="text-xs text-green-700 mt-2 font-bold">This securely links the component to the defined Main Equipment.</p>
              </div>
            </>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-green-900 mb-3 md:mb-4">Thumbnail Picture (Optional)</label>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border-2 border-dashed border-green-200">
            {picture ? (
              <img src={picture} alt="Preview" className="w-24 h-24 rounded-2xl object-cover border-2 border-green-200 shadow-md" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gray-50 shadow-inner flex items-center justify-center border border-gray-200"><ImageIcon className="text-gray-300" size={32}/></div>
            )}
            <div className="flex-1 text-center sm:text-left">
              <label className="bg-green-50 border-2 border-green-200 text-green-800 px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-green-100 transition-colors inline-block shadow-sm active:opacity-80">
                Choose Image
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
              <p className="text-xs text-gray-500 mt-3 font-bold">JPEG, PNG or WEBP.</p>
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-green-800 text-white py-4 md:py-5 rounded-2xl font-black text-lg md:text-xl hover:bg-green-900 shadow-xl transition-all disabled:opacity-50 mt-6 active:opacity-80">
          {isSubmitting ? 'Saving...' : 'Save Record'}
        </button>
      </form>
    </div>
  );
}