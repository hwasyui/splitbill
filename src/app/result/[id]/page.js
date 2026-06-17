'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Receipt, Download, Share2, Check, Utensils, User, Trophy } from 'lucide-react';
import Toast from '@/components/ui/Toast';
import StepBar from '@/components/ui/StepBar';
import Loader from '@/components/ui/loader';
import Footer from '@/components/ui/footer';
import { formatAmount, getCurrency } from '@/lib/currency';

export default function ResultPage() {
  const router                      = useRouter();
  const { id }                      = useParams();
  const [resultData, setResultData] = useState(null);
  const [showToast,  setShowToast]  = useState(false);

  useEffect(() => {
    fetch(`/api/result/${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data?.split || data?.error) { router.push('/bill-expired'); return; }
        setResultData(data);
      })
      .catch(() => router.push('/bill-expired'));
  }, [id, router]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
  };

  const generatePDF = async (data) => {
    const html2pdf  = (await import('html2pdf.js')).default;
    const currency  = data.currency || 'IDR';
    const cur       = getCurrency(currency);
    const fmtPDF    = (n) => {
      const num = cur.decimals === 0 ? Math.round(n) : n;
      return `${cur.symbol}${num.toLocaleString(cur.locale, {
        minimumFractionDigits: cur.decimals,
        maximumFractionDigits: cur.decimals,
      })}`;
    };

    const html = `
      <div style="max-width:580px;margin:0 auto;background:#FEFCE8;padding:32px;
        font-family:'Courier New',monospace;color:#2D1B69;border:1px solid #DDD0FF;">

        <div style="background:#2D1B69;color:#FFFDE7;padding:12px 16px;margin-bottom:24px;
          display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#F5C24C;">
            Angelica's Split Bill
          </span>
          <span style="font-size:10px;color:#8B72BE;letter-spacing:0.2em;text-transform:uppercase;">
            Transaction Receipt
          </span>
        </div>

        <div style="margin-bottom:16px;">
          <div style="font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:#8B72BE;margin-bottom:4px;">Merchant</div>
          <div style="font-size:16px;font-weight:bold;text-transform:uppercase;letter-spacing:0.05em;color:#2D1B69;">${data.restaurant}</div>
          <div style="font-size:11px;color:#5B3F8C;margin-top:2px;">${data.date}</div>
          <div style="font-size:10px;color:#8B72BE;text-transform:uppercase;letter-spacing:0.2em;margin-top:2px;">Currency: ${cur.code} ${cur.symbol}</div>
        </div>

        <div style="border-top:1px dashed #DDD0FF;margin:16px 0;"></div>

        <div style="font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:#8B72BE;margin-bottom:8px;">Order Summary</div>
        ${data.items.map(item => `
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px;color:#2D1B69;">
            <div>${item.name} &times; ${item.qty}</div>
            <div>${fmtPDF(item.price * item.qty)}</div>
          </div>
        `).join('')}
        <div style="border-top:1px dashed #DDD0FF;margin:12px 0;padding-top:8px;
          display:flex;justify-content:space-between;font-size:12px;color:#5B3F8C;">
          <span>Tax</span><span>${fmtPDF(data.tax)}</span>
        </div>
        <div style="border-top:2px solid #2D1B69;padding-top:8px;
          display:flex;justify-content:space-between;font-size:14px;font-weight:bold;color:#2D1B69;">
          <span>GRAND TOTAL</span>
          <span>${fmtPDF(data.items.reduce((s, i) => s + i.price * i.qty, 0) + data.tax)}</span>
        </div>

        <div style="border-top:1px dashed #DDD0FF;margin:20px 0;"></div>

        <div style="font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:#8B72BE;margin-bottom:12px;">Per Person</div>
        ${data.split.map(person => `
          <div style="margin-bottom:16px;padding:12px;background:#EDE9FE;border-left:3px solid #F5C24C;">
            <div style="font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:6px;color:#2D1B69;">
              ${person.name}
            </div>
            ${person.items?.length ? `
              <div style="font-size:10px;color:#5B3F8C;margin-bottom:4px;">
                ${person.items.map(it => `
                  <div style="display:flex;justify-content:space-between;">
                    <span>${it.name} &times; ${it.qty}</span><span>${fmtPDF(it.total)}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            <div style="display:flex;justify-content:space-between;font-size:11px;color:#5B3F8C;">
              <span>Subtotal</span><span>${fmtPDF(person.subtotal)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;color:#5B3F8C;">
              <span>Tax share</span><span>${fmtPDF(person.tax)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:bold;
              border-top:1px dashed #DDD0FF;margin-top:6px;padding-top:6px;color:#2D1B69;">
              <span>TOTAL</span><span>${fmtPDF(person.total)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    html2pdf().from(container).set({
      margin:      0.5,
      filename:    'split-bill-receipt.pdf',
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF:       { unit: 'in', format: 'letter', orientation: 'portrait' },
    }).save().then(() => document.body.removeChild(container));
  };

  if (!resultData) return <Loader message="Loading your receipt..." />;

  const currency   = resultData.currency || 'IDR';
  const fmt        = (n) => formatAmount(n, currency);
  const itemTotal  = resultData.items.reduce((s, i) => s + i.price * i.qty, 0);
  const grandTotal = itemTotal + resultData.tax;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDE7] text-[#2D1B69]">
      {showToast && <Toast message="Link copied to clipboard." onClose={() => setShowToast(false)} />}

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
        <StepBar current={4} />

        {/* Complete banner */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-[#2D1B69] text-[#FFFDE7] p-5 flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-[#F5C24C] mb-1">Step 04 of 04</p>
            <h1 className="text-2xl font-bold uppercase tracking-tight">Transaction Complete</h1>
            <p className="text-xs text-[#8B72BE] mt-1 tracking-wide">{resultData.restaurant} &middot; {resultData.date}</p>
          </div>
          <Trophy className="w-10 h-10 text-[#F5C24C] shrink-0" />
        </motion.div>

        {/* Receipt card */}
        <div className="border border-[#DDD0FF] bg-[#FEFCE8] mb-6">

          {/* Order summary header */}
          <div className="px-4 py-2 bg-[#FFFDE7] border-b border-[#DDD0FF] flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#8B72BE]">Order Summary</span>
            <span className="text-[10px] uppercase tracking-widest text-[#8B72BE]">
              {getCurrency(currency).symbol} {currency}
            </span>
          </div>

          {/* Items */}
          <div className="px-4 py-3 border-b border-dashed border-[#DDD0FF] space-y-2">
            {resultData.items?.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Utensils className="w-3.5 h-3.5 text-[#DDD0FF] shrink-0" />
                  <div>
                    <span className="font-medium text-[#2D1B69]">{item.name}</span>
                    <span className="text-[#8B72BE]"> &times; {item.qty}</span>
                    <p className="text-[10px] text-[#8B72BE] tabular-nums mt-0.5">
                      {fmt(item.price)} / unit
                    </p>
                  </div>
                </div>
                <span className="tabular-nums font-medium shrink-0 text-[#2D1B69]">
                  {fmt(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>

          {/* Tax + grand total */}
          <div className="px-4 py-3 border-b border-[#DDD0FF] space-y-1.5 text-sm">
            <div className="flex justify-between tabular-nums text-[#5B3F8C]">
              <span>Tax</span>
              <span>{fmt(resultData.tax)}</span>
            </div>
            <div className="flex justify-between tabular-nums font-bold pt-1.5 border-t border-dashed border-[#DDD0FF] text-[#2D1B69]">
              <span className="uppercase tracking-wide">Grand Total</span>
              <span>{fmt(grandTotal)}</span>
            </div>
          </div>

          {/* Per-person header */}
          <div className="px-4 py-2 bg-[#FFFDE7] border-b border-[#DDD0FF]">
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#8B72BE]">Per Person</span>
          </div>

          {resultData.split.map((person, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="border-b border-dashed border-[#DDD0FF] last:border-b-0"
            >
              <div className="px-4 py-2.5 flex items-center justify-between bg-[#FEFCE8] border-l-4 border-l-[#F5C24C]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#8B72BE] tabular-nums w-5">
                    #{String(i + 1).padStart(2, '0')}
                  </span>
                  <User className="w-3.5 h-3.5 text-[#DDD0FF]" />
                  <span className="text-sm font-bold uppercase tracking-wide text-[#2D1B69]">{person.name}</span>
                </div>
                <span className="text-sm font-bold tabular-nums text-[#7C3AED]">
                  {fmt(person.total)}
                </span>
              </div>

              <div className="px-4 pb-3 pt-2 bg-[#EDE9FE] space-y-1 text-xs text-[#5B3F8C]">
                {person.items?.map((it, j) => (
                  <div key={j} className="flex justify-between tabular-nums">
                    <span>{it.name} &times; {it.qty}</span>
                    <span>{fmt(it.total)}</span>
                  </div>
                ))}
                <div className="flex justify-between tabular-nums">
                  <span>Subtotal</span>
                  <span>{fmt(person.subtotal)}</span>
                </div>
                <div className="flex justify-between tabular-nums">
                  <span>Tax share</span>
                  <span>{fmt(person.tax)}</span>
                </div>
                <div className="flex justify-between tabular-nums font-bold text-[#2D1B69] pt-1.5 border-t border-dashed border-[#DDD0FF] mt-1">
                  <span className="uppercase tracking-wide text-xs">Total</span>
                  <span>{fmt(person.total)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={copyLink}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-[#7C3AED]
              text-[#7C3AED] text-xs uppercase tracking-[0.25em] font-bold
              hover:bg-[#7C3AED] hover:text-[#FFFDE7] transition-all"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Link
          </button>
          <button
            onClick={() => generatePDF(resultData)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#2D1B69]
              text-[#FFFDE7] text-xs uppercase tracking-[0.25em] font-bold
              hover:bg-[#1E1245] transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
