'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Receipt, Trash2, Plus, ChevronRight, RefreshCw, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import StepBar from '@/components/ui/StepBar';
import Loader from '@/components/ui/loader';
import Footer from '@/components/ui/footer';
import { CURRENCIES, getCurrency, inputDisplayValue, parseAmount } from '@/lib/currency';

export default function ReviewPage() {
  const router = useRouter();
  const { id } = useParams();
  const [receiptData, setReceiptData] = useState(null);
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    fetch(`/api/result/${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data?.items || data?.error) { router.push('/bill-expired'); return; }
        setReceiptData({ currency: 'IDR', ...data });
      })
      .catch(() => router.push('/bill-expired'));
  }, [id, router]);

  const updateField = (key, value) =>
    setReceiptData(prev => ({ ...prev, [key]: value }));

  const updateItem = (index, field, value) => {
    const items = [...receiptData.items];
    items[index] = { ...items[index], [field]: value };
    setReceiptData(prev => ({ ...prev, items }));
  };

  const removeItem = (index) => {
    setReceiptData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const addItem = () => {
    setReceiptData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', qty: 1, price: 0 }],
    }));
  };

  const proceed = async () => {
    setSaving(true);
    try {
      await fetch('/api/save-result', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, ...receiptData }),
      });
      router.push(`/assign/${id}`);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  if (!receiptData) return <Loader message="Loading receipt data..." />;
  if (saving)       return <Loader message="Saving receipt data..." />;

  const currency = receiptData.currency || 'IDR';
  const cur      = getCurrency(currency);

  const itemsTotal = receiptData.items?.reduce((s, i) => s + (i.qty * i.price), 0) || 0;
  const grandTotal = itemsTotal + (receiptData.tax || 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDE7] text-[#2D1B69]">

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
        <StepBar current={2} />

        {/* Section header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-[#7C3AED] mb-1.5">Step 02 of 04</p>
            <h1 className="text-3xl font-bold uppercase tracking-tight leading-none">Review Receipt</h1>
            <p className="text-sm text-[#5B3F8C] mt-2">Verify the extracted data. Correct any errors before proceeding.</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-3 py-2 border border-dashed border-[#DDD0FF] text-[10px] uppercase
              tracking-widest text-[#8B72BE] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors shrink-0 mt-1"
          >
            <RefreshCw className="w-3 h-3" /> New Receipt
          </button>
        </div>

        {/* Receipt editor card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-[#DDD0FF]"
        >
          {/* Card header with currency selector */}
          <div className="px-4 py-3 bg-[#2D1B69] text-[#FFFDE7] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#F5C24C]">Receipt Data</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#8B72BE] tracking-widest uppercase">Currency:</span>
              <div className="relative flex items-center">
                <select
                  value={currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                  className="appearance-none bg-transparent text-[#F5C24C] text-[10px] uppercase tracking-widest
                    border-0 outline-none cursor-pointer pr-4"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code} className="bg-[#2D1B69] text-[#FFFDE7] normal-case">
                      {c.code} — {c.symbol} {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 w-3 h-3 text-[#F5C24C] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Merchant / Date */}
          <div className="px-4 py-4 border-b border-dashed border-[#DDD0FF] space-y-3 bg-[#FEFCE8]">
            {[
              { label: 'Merchant', key: 'restaurant' },
              { label: 'Date',     key: 'date'       },
            ].map(({ label, key }) => (
              <div key={key} className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#8B72BE] w-20 shrink-0">{label}</span>
                <input
                  className="flex-1 bg-transparent border-b border-[#DDD0FF] text-sm pb-1
                    focus:outline-none focus:border-[#7C3AED] transition-colors text-[#2D1B69]"
                  value={receiptData[key] || ''}
                  onChange={(e) => updateField(key, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Column headers */}
          <div className="px-4 py-2 bg-[#FFFDE7] border-b border-[#DDD0FF]">
            <div className="grid grid-cols-[1fr_3rem_8rem_1.5rem] gap-2">
              {['Item', 'Qty', `Price (${cur.symbol})`, ''].map((h, i) => (
                <span key={i} className={`text-[10px] uppercase tracking-widest text-[#8B72BE]
                  ${i === 1 ? 'text-center' : i === 2 ? 'text-right' : ''}`}>
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Line items */}
          {receiptData.items?.map((item, index) => (
            <div key={index} className="px-4 py-3 border-b border-dashed border-[#DDD0FF] hover:bg-[#F3E5FF] transition-colors bg-[#FEFCE8]">
              <div className="grid grid-cols-[1fr_3rem_8rem_1.5rem] gap-2 items-center">
                <input
                  className="bg-transparent text-sm focus:outline-none min-w-0 border-b border-transparent
                    focus:border-[#DDD0FF] text-[#2D1B69]"
                  value={item.name || ''}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  placeholder="Item name"
                />
                <input
                  type="number"
                  min="1"
                  className="bg-transparent text-sm text-center focus:outline-none w-full border-b border-transparent
                    focus:border-[#DDD0FF] text-[#2D1B69]"
                  value={item.qty}
                  onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 1)}
                />
                <input
                  type="text"
                  className="bg-transparent text-sm text-right focus:outline-none w-full border-b border-transparent
                    focus:border-[#DDD0FF] text-[#2D1B69] tabular-nums"
                  value={inputDisplayValue(item.price, currency)}
                  onChange={(e) => updateItem(index, 'price', parseAmount(e.target.value, currency))}
                />
                <button
                  onClick={() => removeItem(index)}
                  className="text-[#DDD0FF] hover:text-[#DC2626] transition-colors flex items-center justify-center"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {/* Add line item */}
          <div className="px-4 py-3 border-b border-dashed border-[#DDD0FF] bg-[#FEFCE8]">
            <button
              onClick={addItem}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em]
                text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Line Item
            </button>
          </div>

          {/* Tax */}
          <div className="px-4 py-3 border-b border-[#DDD0FF] bg-[#FEFCE8]">
            <div className="grid grid-cols-[1fr_8rem_1.5rem] gap-2 items-center">
              <span className="text-[10px] uppercase tracking-widest text-[#8B72BE]">Tax / Service</span>
              <input
                type="text"
                className="bg-transparent text-sm text-right focus:outline-none w-full border-b border-transparent
                  focus:border-[#DDD0FF] text-[#2D1B69] tabular-nums"
                value={inputDisplayValue(receiptData.tax || 0, currency)}
                onChange={(e) => updateField('tax', parseAmount(e.target.value, currency))}
              />
              <span />
            </div>
          </div>

          {/* Grand total row (read-only) */}
          <div className="px-4 py-3 border-b border-[#DDD0FF] bg-[#EDE9FE]">
            <div className="grid grid-cols-[1fr_8rem_1.5rem] gap-2 items-center">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#5B3F8C]">Grand Total</span>
              <span className="text-sm text-right font-bold tabular-nums text-[#2D1B69]">
                {cur.symbol}{grandTotal.toLocaleString(cur.locale, {
                  minimumFractionDigits: cur.decimals,
                  maximumFractionDigits: cur.decimals,
                })}
              </span>
              <span />
            </div>
          </div>

          {/* CTA */}
          <div className="p-4 bg-[#FEFCE8]">
            <button
              onClick={proceed}
              className="w-full bg-[#F5C24C] text-[#2D1B69] py-3.5 text-sm uppercase tracking-[0.25em] font-bold
                hover:bg-[#EAB308] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              Proceed to Assign
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
