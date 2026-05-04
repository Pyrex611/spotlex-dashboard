"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Upload, Image as ImageIcon, Wrench, Settings } from 'lucide-react';
import { bulkUploadCSV } from '@/lib/actions';

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetch('/api/equipments').then(r => r.json()).then(data => {
      setEquipments(data);
      setLoading(false);
    });
  },[]);

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        if (file.name.endsWith('.csv')) {
          const Papa = await import('papaparse');
          Papa.default.parse(file, {
            header: true,
            complete: async (results) => {
              await bulkUploadCSV(results.data);
              window.location.reload();
            }
          });
        } else {
          const XLSX = await import('xlsx');
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data);
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          await bulkUploadCSV(json);
          window.location.reload();
        }
      } catch(err) {
        console.error("Upload error", err);
        alert("Failed to parse file. Please ensure it's a valid CSV or XLSX.");
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in">
      <div className="mb-6 md:mb-8 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-green-900">Equipment Registry</h1>
        <p className="text-sm md:text-base text-green-700 mt-2">Manage tools, machinery, and components.</p>
      </div>

      <ul className="space-y-4 md:space-y-5">
        <li className="flex flex-col sm:flex-row items-stretch gap-3 md:gap-4 h-auto md:h-32">
          <Link href="/equipments/new" className="flex-1 flex flex-row items-center bg-white border-2 border-dashed border-green-400 rounded-2xl md:rounded-3xl hover:bg-green-50 hover:border-green-500 transition-all p-4 cursor-pointer shadow-sm group active:scale-[0.98]">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-green-100 flex-shrink-0 flex items-center justify-center mr-4 md:mr-6 group-hover:bg-green-200 transition-colors shadow-inner">
              <Plus size={32} className="text-green-700 md:hidden" />
              <Plus size={40} className="text-green-700 hidden md:block" />
            </div>
            <span className="text-lg md:text-2xl font-bold text-green-800 tracking-wide">Add a new equipment</span>
          </Link>
          
          <label className={`w-full sm:w-36 h-20 sm:h-full ${isUploading ? 'bg-green-900' : 'bg-green-800 hover:bg-green-700 hover:-translate-y-1 hover:shadow-xl'} text-white rounded-2xl md:rounded-3xl flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-0 cursor-pointer shadow-lg transition-all active:scale-[0.98]`}>
            {isUploading ? (
              <span className="font-bold text-sm animate-pulse">Parsing...</span>
            ) : (
              <>
                <Upload size={28} className="sm:mb-2 text-green-100 hidden sm:block" />
                <Upload size={24} className="text-green-100 sm:hidden" />
                <span className="text-xs font-black tracking-widest uppercase text-center sm:px-2">Bulk Upload<br className="hidden sm:block"/> <span className="sm:hidden">-</span> (CSV/XLSX)</span>
                <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="hidden" onChange={handleBulkUpload} />
              </>
            )}
          </label>
        </li>

        {loading && (
          <li className="h-32 flex items-center justify-center bg-white/50 rounded-3xl border-2 border-green-100 border-dashed text-green-600 font-bold text-lg animate-pulse">
            Loading Registry Manifest...
          </li>
        )}

        {!loading && equipments.map(eq => (
          <li key={eq.id}>
            <Link href={`/equipments/${eq.id}`} className="flex items-center min-h-[7rem] md:h-32 bg-white border border-green-100 shadow-sm hover:shadow-lg rounded-2xl md:rounded-3xl p-3 md:p-4 transition-all hover:-translate-y-1 group active:scale-[0.99]">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-green-50 border border-green-100 flex-shrink-0 mr-4 md:mr-6 overflow-hidden flex items-center justify-center relative shadow-inner">
                {eq.picture ? (
                   <img src={eq.picture} alt={eq.name || eq.componentCode} className="w-full h-full object-cover" />
                ) : (
                   <ImageIcon size={32} className="text-green-300 md:hidden" />
                )}
                {!eq.picture && <ImageIcon size={36} className="text-green-300 hidden md:block" />}
                <div className="absolute top-1 right-1 bg-white/80 p-1 rounded-lg backdrop-blur-sm shadow-sm">
                  {eq.type === 'COMPONENT' ? <Settings size={12} className="text-gray-500" /> : <Wrench size={12} className="text-green-600" />}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center overflow-hidden">
                <h3 className="text-lg md:text-2xl font-black text-green-950 group-hover:text-green-700 transition-colors truncate">
                  {eq.name || `Component`}
                </h3>
                <div className="mt-2 md:mt-3 flex flex-wrap items-center gap-2 md:gap-3">
                  <span className="text-xs md:text-sm font-mono bg-green-100 text-green-900 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg border border-green-200 shadow-sm font-bold">
                    {eq.code || eq.componentCode}
                  </span>
                  <span className={`text-[9px] md:text-[10px] uppercase tracking-widest font-black px-2 md:px-2.5 py-1 rounded-md ${eq.type === 'COMPONENT' ? 'bg-gray-100 text-gray-600' : 'bg-green-600 text-white'}`}>
                    {eq.type || (eq.componentCode ? 'COMPONENT' : 'MAIN')}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}