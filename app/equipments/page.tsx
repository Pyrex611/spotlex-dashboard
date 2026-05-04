"use client"

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Plus, Upload, Image as ImageIcon, Wrench, Settings, SearchX, X, UploadCloud, FileText } from 'lucide-react';
import { bulkUploadCSV } from '@/lib/actions';

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | ArrayBuffer | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // --- Modal & Upload Logic ---

  const handleFileSelect = (file: File) => {
    if (!file || !(file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      alert('Invalid file type. Please upload a CSV or XLSX file.');
      return;
    }
    
    // THE FIX: Use the FileReader API. It operates within the trusted event context,
    // which preserves the browser's permission to read the file.
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result;
      if (content) {
        setFileContent(content);
        setSelectedFile(file);
      } else {
        alert("An unexpected error occurred while reading the file.");
        resetUploadState();
      }
    };

    reader.onerror = () => {
      console.error("FileReader Error:", reader.error);
      alert("Could not read the file. It may be corrupted or your browser is preventing access.");
      resetUploadState();
    };

    // Trigger the appropriate read method based on file type
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };
  
  const handleDragEvents = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const resetUploadState = () => {
    setUploadModalOpen(false);
    setSelectedFile(null);
    setFileContent(null);
    setIsUploading(false);
    setIsDragging(false);
  };

  const handleProcessUpload = async () => {
    if (!selectedFile || !fileContent) return;

    setIsUploading(true);
    try {
      if (selectedFile.name.endsWith('.csv')) {
        const Papa = await import('papaparse');
        Papa.default.parse(fileContent as string, {
          header: true,
          complete: async (results) => {
            await bulkUploadCSV(results.data);
            window.location.reload();
          }
        });
      } else {
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(fileContent as ArrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        await bulkUploadCSV(json);
        window.location.reload();
      }
    } catch(err) {
      console.error("Upload error", err);
      alert("Failed to parse file content. Please ensure the file is correctly formatted.");
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Equipment Registry</h1>
        <p className="text-sm text-slate-500 mt-1">Manage tools, machinery, and subcomponents.</p>
      </div>

      <ul className="space-y-4">
        <li className="flex flex-col sm:flex-row gap-3 h-auto sm:h-24">
          <Link href="/equipments/new" className="flex-1 flex items-center bg-white border border-dashed border-slate-300 rounded-2xl hover:bg-emerald-50 hover:border-emerald-300 transition-all p-3 cursor-pointer group shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-slate-50 flex-shrink-0 flex items-center justify-center mr-4 group-hover:bg-white border border-slate-100 transition-colors">
              <Plus size={24} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <span className="text-sm font-semibold text-slate-600 group-hover:text-emerald-700 transition-colors">Register New Item</span>
          </Link>
          
          <button type="button" onClick={() => setUploadModalOpen(true)} className="w-full sm:w-40 h-16 sm:h-full bg-slate-800 hover:bg-slate-700 text-white rounded-2xl flex flex-row sm:flex-col items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors">
            <Upload size={20} className="sm:mb-1 text-slate-300" />
            <span className="text-[10px] font-bold tracking-wider uppercase">Upload CSV/XLSX</span>
          </button>
        </li>

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

      {uploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl animate-in">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-semibold text-slate-800">Bulk Upload Equipment</h3>
              <button type="button" onClick={resetUploadState} className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"><X size={18} className="text-slate-500" /></button>
            </div>
            
            {!selectedFile ? (
              <div 
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                onDragOver={handleDragEvents}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-10 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                />
                <UploadCloud size={32} className={`mx-auto transition-colors ${isDragging ? 'text-emerald-600' : 'text-slate-400'}`} />
                <p className={`mt-3 font-semibold text-sm transition-colors ${isDragging ? 'text-emerald-700' : 'text-slate-700'}`}>
                  Drag & drop your file here
                </p>
                <p className={`mt-1 text-xs transition-colors ${isDragging ? 'text-emerald-500' : 'text-slate-500'}`}>
                  or click to browse. Supports CSV, XLSX, XLS.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText size={20} className="text-emerald-600 shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <p className="font-semibold text-sm text-slate-800 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setSelectedFile(null); setFileContent(null); }} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md transition-colors shrink-0">
                    <X size={16} />
                  </button>
                </div>
                <button 
                  type="button" 
                  onClick={handleProcessUpload} 
                  disabled={isUploading} 
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-sm"
                >
                  {isUploading ? 'Processing File...' : 'Upload & Import'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}