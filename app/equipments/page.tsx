"use client"

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Plus, Upload, Image as ImageIcon, Wrench, Settings, SearchX, X, UploadCloud, FileText, Download, Search, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { bulkUploadCSV } from '@/lib/actions';

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Modal States
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  // --- Search & Accordion Logic ---
  const mains = equipments.filter((e: any) => e.type === 'MAIN');
  const comps = equipments.filter((e: any) => e.type === 'COMPONENT');

  const groups = mains.map((main: any) => ({
    ...main,
    children: comps.filter((c: any) => c.equipmentCode === main.code)
  }));
  
  const orphans = comps.filter((c: any) => !mains.some((m: any) => m.code === c.equipmentCode));

  const q = searchQuery.toLowerCase();
  
  // Smart Filtering
  const filteredGroups = groups.filter((g: any) => 
    g.name?.toLowerCase().includes(q) || 
    g.code?.toLowerCase().includes(q) || 
    g.children.some((c: any) => c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q))
  );
  const filteredOrphans = orphans.filter((c: any) => c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q));

  // Auto-expand accordions if searching
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const allExpanded: Record<string, boolean> = {};
      filteredGroups.forEach((g: any) => allExpanded[g.code] = true);
      setExpanded(allExpanded);
    } else {
      setExpanded({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const toggleExpand = (code: string) => {
    setExpanded(prev => ({ ...prev, [code]: !prev[code] }));
  };

  // --- Upload Logic ---
  const resetUploadState = () => {
    setUploadModalOpen(false);
    setIsUploading(false);
    setIsDragging(false);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const processFile = (file: File) => {
    if (!file) return;
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Invalid file type. Please upload a CSV file as per the template.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (!content) { alert("File appears to be empty."); return; }
      setIsUploading(true);
      try {
        const Papa = await import('papaparse');
        Papa.default.parse(content, {
          header: true, skipEmptyLines: true,
          complete: async (results) => {
            if (results.errors.length > 0) {
              alert("Could not parse CSV. Please check formatting.");
              setIsUploading(false);
              return;
            }
            const response = await bulkUploadCSV(results.data);
            if(response.success){ window.location.reload(); } 
            else { alert(`Import failed: ${response.message}`); setIsUploading(false); }
          }
        });
      } catch (err) { alert("A critical error occurred."); setIsUploading(false); }
    };
    reader.onerror = () => { alert("Could not read the file."); resetUploadState(); };
    reader.readAsText(file);
  };
  
  const handleDragEvents = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent) => { handleDragEvents(e); setIsDragging(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); };
  
  return (
    <div className="max-w-4xl mx-auto animate-in">
      <div className="mb-6 md:mb-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Equipment Registry</h1>
          <p className="text-sm text-slate-500 mt-1">Manage tools, machinery, and subcomponents.</p>
        </div>
      </div>

      {/* Action Bar & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or code..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
          />
        </div>
        <div className="flex gap-3 h-12">
          <Link href="/equipments/new" className="flex items-center gap-2 bg-slate-900 text-white px-5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 transition-colors active:opacity-80">
            <Plus size={16}/> New Item
          </Link>
          <button type="button" onClick={() => setUploadModalOpen(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors active:opacity-80">
            <Upload size={16}/> Import CSV
          </button>
        </div>
      </div>

      {/* List Rendering */}
      <ul className="space-y-4">
        {loading && <li className="py-12 flex justify-center"><SearchX size={32} className="text-slate-200 animate-pulse"/></li>}
        {!loading && filteredGroups.length === 0 && filteredOrphans.length === 0 && (
          <li className="py-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <SearchX size={32} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No items found</h3>
            <p className="text-slate-500 text-sm">Adjust your search or register new equipment.</p>
          </li>
        )}

        {/* Grouped Main Equipment */}
        {/* THE FIX: Explicitly typing group as 'any' */}
        {!loading && filteredGroups.map((group: any) => (
          <li key={group.id} className="flex flex-col gap-2 animate-in">
            <div className="flex items-center bg-white border border-slate-200 shadow-sm hover:shadow-md rounded-2xl transition-all group pr-2 md:pr-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              
              <Link href={`/equipments/${group.id}`} className="flex-1 flex items-center p-3 md:p-4">
                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 mr-4 overflow-hidden flex items-center justify-center">
                  {group.picture ? <img src={group.picture} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-slate-300" />}
                </div>
                <div className="flex-1 flex flex-col justify-center overflow-hidden">
                  <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">{group.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{group.code}</span>
                    <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">MAIN</span>
                  </div>
                </div>
              </Link>

              {group.children.length > 0 && (
                <button type="button" onClick={() => toggleExpand(group.code)} className="z-10 p-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-100 shrink-0">
                  <span className="text-[10px] font-bold hidden md:inline-block">{group.children.length} Parts</span>
                  <span className="text-[10px] font-bold md:hidden">{group.children.length}</span>
                  {expanded[group.code] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              )}
            </div>

            {/* THE FIX: Explicitly typing child as 'any' */}
            {expanded[group.code] && group.children.length > 0 && (
              <div className="pl-6 ml-6 border-l-2 border-emerald-100 space-y-2 mt-1 py-1">
                {group.children.map((child: any) => (
                  <Link href={`/equipments/${child.id}`} key={child.id} className="flex items-center bg-white border border-slate-100 p-2.5 rounded-xl hover:border-emerald-200 shadow-sm transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0 mr-3 overflow-hidden flex items-center justify-center">
                      {child.picture ? <img src={child.picture} alt="" className="w-full h-full object-cover" /> : <Settings size={14} className="text-slate-300" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-center overflow-hidden">
                      <h3 className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors truncate">{child.name || 'Component'}</h3>
                      <span className="text-[10px] font-mono bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100 w-max mt-1">{child.code}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </li>
        ))}

        {/* Standalone/Orphan Components */}
        {/* THE FIX: Explicitly typing child as 'any' */}
        {!loading && filteredOrphans.map((child: any) => (
          <li key={child.id} className="animate-in">
            <Link href={`/equipments/${child.id}`} className="flex items-center bg-white border border-slate-200 shadow-sm hover:shadow-md rounded-2xl p-3 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 mr-4 overflow-hidden flex items-center justify-center">
                {child.picture ? <img src={child.picture} alt="" className="w-full h-full object-cover" /> : <Settings size={20} className="text-slate-300" />}
              </div>
              <div className="flex-1 flex flex-col justify-center overflow-hidden">
                <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">{child.name || 'Standalone Component'}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{child.code}</span>
                  <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">COMPONENT</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Bulk Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl animate-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Bulk Upload from CSV</h3>
              <button type="button" onClick={resetUploadState} className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"><X size={18} className="text-slate-500" /></button>
            </div>
            
            <div className="border-t border-slate-100 pt-5">
              {isUploading ? (
                <div className="text-center py-10">
                  <Loader2 size={32} className="mx-auto text-emerald-600 animate-spin mb-4" />
                  <p className="text-sm font-semibold text-slate-700">Processing file...</p>
                </div>
              ) : (
                <>
                  <div 
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                    onDragOver={handleDragEvents}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-10 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && processFile(e.target.files[0])} accept=".csv"/>
                    <UploadCloud size={32} className={`mx-auto transition-colors ${isDragging ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <p className={`mt-3 font-semibold text-sm transition-colors ${isDragging ? 'text-emerald-700' : 'text-slate-700'}`}>
                      Drag & drop your CSV file here
                    </p>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <a href="/template.csv" download="spotlex_template.csv" className="flex items-center gap-2 text-xs font-medium text-emerald-600 hover:text-emerald-800 transition-colors">
                      <Download size={14} /> Download CSV Template
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}