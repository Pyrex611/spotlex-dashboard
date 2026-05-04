"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Upload, Image as ImageIcon, Wrench, Settings, SearchX } from 'lucide-react';
import { bulkUploadCSV } from '@/lib/actions';

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState<any[]>([]);
  const[loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetch('/api/equipments')
      .then(r => r.json())
      .then(data => {
        setEquipments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load registry", err);
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
    <div className="max-w-4xl mx-auto animate-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Equipment Registry</h1>
        <p className="text-sm text-slate-500 mt-1">Manage tools, machinery, and subcomponents.</p>
      </div>

      <ul className="space-y-4">
        {/* Action Row */}
        <li className="flex flex-col sm:flex-row gap-3 h-auto sm:h-24">
          <Link href="/equipments/new" className="flex-1 flex items-center bg-white border border-dashed border-slate-300 rounded-2xl hover:bg-emerald-50 hover:border-emerald-300 transition-all p-3 cursor-pointer group shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-slate-50 flex-shrink-0 flex items-center justify-center mr-4 group-hover:bg-white border border-slate-100 transition-colors">
              <Plus size={24} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <span className="text-sm font-semibold text-slate-600 group-hover:text-emerald-700 transition-colors">Register New Item</span>
          </Link>
          
          <label className={`w-full sm:w-40 h-16 sm:h-full ${isUploading ? 'bg-slate-800' : 'bg-slate-800 hover:bg-slate-700'} text-white rounded-2xl flex flex-row sm:flex-col items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors`}>
            {isUploading ? (
              <span className="font-medium text-xs animate-pulse">Parsing...</span>
            ) : (
              <>
                <Upload size={20} className="sm:mb-1 text-slate-300" />
                <span className="text-[10px] font-bold tracking-wider uppercase">Upload CSV/XLSX</span>
                <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="hidden" onChange={handleBulkUpload} />
              </>
            )}
          </label>
        </li>

        {/* States */}
        {loading && (
          <li className="h-24 flex items-center justify-center bg-white rounded-2xl border border-slate-200 text-slate-400 font-medium text-sm animate-pulse shadow-sm">
            Loading Manifest...
          </li>
        )}

        {!loading && equipments.length === 0 && (
          <li className="py-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <SearchX size={32} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">Registry is Empty</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">Register a new item or bulk upload your existing manifest.</p>
          </li>
        )}

        {/* List */}
        {!loading && equipments.map(eq => (
          <li key={eq.id}>
            <Link href={`/equipments/${eq.id}`} className="flex items-center min-h-[5.5rem] bg-white border border-slate-200 shadow-sm hover:shadow-md rounded-2xl p-3 transition-all group">
              <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 mr-4 overflow-hidden flex items-center justify-center relative">
                {eq.picture ? (
                   <img src={eq.picture} alt={eq.name || eq.componentCode} className="w-full h-full object-cover" />
                ) : (
                   <ImageIcon size={24} className="text-slate-300" />
                )}
                <div className="absolute top-1 right-1 bg-white/90 p-0.5 rounded backdrop-blur-sm border border-slate-100">
                  {eq.type === 'COMPONENT' ? <Settings size={10} className="text-slate-400" /> : <Wrench size={10} className="text-emerald-500" />}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center overflow-hidden">
                <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                  {eq.name || `Component`}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                    {eq.code || eq.componentCode}
                  </span>
                  <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${eq.type === 'COMPONENT' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'}`}>
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