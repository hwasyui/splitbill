'use client';

import { Receipt, Upload, Camera } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import StepBar from "@/components/ui/StepBar";
import Loader from "@/components/ui/loader";
import Toast from "@/components/ui/Toast";
import Footer from "@/components/ui/footer";

export default function HomePage() {
  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);
  const loadingRef     = useRef(false);
  const [loading,     setLoading]     = useState(false);
  const [pasteActive, setPasteActive] = useState(false);
  const [toastMsg,    setToastMsg]    = useState(null);
  const router = useRouter();

  const processFile = useCallback(async (file) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const fd = new FormData();
    fd.append('receipt', file);

    try {
      const aiRes  = await fetch('/api/process-receipt', { method: 'POST', body: fd });
      const aiData = await aiRes.json();

      const saveRes  = await fetch('/api/save-result', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ currency: 'IDR', ...aiData }),
      });
      const saved = await saveRes.json();

      if (saved.success) {
        router.push(`/review/${saved.id}`);
      } else {
        setLoading(false);
        loadingRef.current = false;
        setToastMsg('Failed to save receipt. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      loadingRef.current = false;
    }
  }, [router]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) processFile(file);
  };

  useEffect(() => {
    const handlePaste = (e) => {
      for (const item of e.clipboardData?.items || []) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            setPasteActive(true);
            setTimeout(() => setPasteActive(false), 600);
            processFile(file);
          }
          return;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFile]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDE7] text-[#2D1B69]">
      {toastMsg && <Toast message={toastMsg} type="error" onClose={() => setToastMsg(null)} />}
      {loading && <Loader message="Scanning receipt data..." />}

      {/* Header */}
      <header className="bg-[#2D1B69] text-[#FFFDE7] border-b border-[#1E1245] sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-4 h-4 text-[#F5C24C]" />
            <span className="text-sm uppercase tracking-[0.25em] font-bold">Angelica's Split Bill</span>
          </div>
          <span className="text-[10px] text-[#8B72BE] tracking-[0.2em] uppercase hidden sm:block">by Angelica</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <StepBar current={1} />

        {/* Section header */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.45em] text-[#7C3AED] mb-1.5">Step 01 of 04</p>
          <h1 className="text-3xl font-bold uppercase tracking-tight leading-none text-[#2D1B69]">Upload Receipt</h1>
          <p className="text-sm text-[#5B3F8C] mt-2 leading-relaxed">
            Upload, photograph, or paste a receipt image to begin.
          </p>
        </div>

        {/* Upload zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`relative border-2 border-dashed bg-[#FEFCE8] cursor-pointer transition-all p-12 text-center group
            ${pasteActive
              ? 'border-[#F5C24C] bg-[#FFFBEB]'
              : 'border-[#DDD0FF] hover:border-[#F5C24C] hover:bg-[#FFFBEB]'}`}
        >
          <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#7C3AED] opacity-50 group-hover:opacity-100 transition-opacity" />
          <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#7C3AED] opacity-50 group-hover:opacity-100 transition-opacity" />
          <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#7C3AED] opacity-50 group-hover:opacity-100 transition-opacity" />
          <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#7C3AED] opacity-50 group-hover:opacity-100 transition-opacity" />

          <div className="flex flex-col items-center gap-3 py-2">
            <Upload className={`w-10 h-10 transition-colors ${pasteActive ? 'text-[#F5C24C]' : 'text-[#DDD0FF] group-hover:text-[#F5C24C]'}`} />
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#5B3F8C]">
                {pasteActive ? 'Image Pasted!' : 'Upload Receipt'}
              </p>
              <p className="text-xs text-[#8B72BE] mt-1 tracking-wide">Drag & drop, click to browse, or Ctrl+V to paste</p>
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>

        {/* Camera button */}
        <div className="mt-4">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#DDD0FF] text-xs uppercase tracking-widest
              text-[#5B3F8C] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
          >
            <Camera className="w-3.5 h-3.5" /> Use Camera
          </button>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
        </div>

        {/* How it works */}
        <div className="mt-10">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#8B72BE] mb-4">How It Works</p>
          <div className="grid grid-cols-4 gap-px bg-[#DDD0FF] border border-[#DDD0FF]">
            {[
              { n: '01', title: 'Upload',  desc: 'Drop or paste your receipt' },
              { n: '02', title: 'Review',  desc: 'Verify and edit extracted data' },
              { n: '03', title: 'Assign',  desc: 'Split each item your way' },
              { n: '04', title: 'Summary', desc: 'Share totals with the party' },
            ].map((s) => (
              <div key={s.n} className="bg-[#FEFCE8] p-4">
                <p className="text-[#F5C24C] font-bold text-xl leading-none mb-2 tabular-nums">{s.n}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#2D1B69] mb-1">{s.title}</p>
                <p className="text-[10px] text-[#8B72BE] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
