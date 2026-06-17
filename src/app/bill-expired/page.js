'use client';

import { useRouter } from 'next/navigation';
import { Receipt, Clock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/ui/footer';

export default function BillExpiredPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDE7] text-[#2D1B69]">

      <header className="bg-[#2D1B69] text-[#FFFDE7] border-b border-[#1E1245] sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-4 h-4 text-[#F5C24C]" />
            <span className="text-sm uppercase tracking-[0.25em] font-bold">Angelica's Split Bill</span>
          </div>
          <span className="text-[10px] text-[#8B72BE] tracking-[0.2em] uppercase hidden sm:block">by Angelica</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-16 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="border border-[#DDD0FF] bg-[#FEFCE8]">
            <div className="bg-[#2D1B69] px-5 py-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.35em] text-[#F5C24C]">Error</span>
              <Clock className="w-4 h-4 text-[#8B72BE]" />
            </div>

            <div className="px-6 py-10 text-center">
              <p className="text-[10px] uppercase tracking-[0.45em] text-[#DC2626] mb-3">404 — Bill Not Found</p>
              <h1 className="text-3xl font-bold uppercase tracking-tight leading-none mb-4">
                This bill has expired
              </h1>
              <p className="text-sm text-[#5B3F8C] leading-relaxed max-w-sm mx-auto">
                Bills are stored for 24 hours. This one has either expired or the link is invalid.
              </p>

              <div className="border-t border-dashed border-[#DDD0FF] mt-8 pt-8">
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex items-center gap-2 bg-[#F5C24C] text-[#2D1B69] px-8 py-3.5
                    text-xs uppercase tracking-[0.25em] font-bold hover:bg-[#EAB308] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Start a New Bill
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
