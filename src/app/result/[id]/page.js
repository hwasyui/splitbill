'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Utensils, Download } from 'lucide-react';
import Toast from '@/components/ui/Toast';

export default function ResultPage() {
  const { id } = useParams();
  const [resultData, setResultData] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/result/${id}`);
        const data = await res.json();
        setResultData(data);
      } catch (err) {
        console.error('Failed to load result data:', err);
      }
    };
    fetchResult();
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
  };


  if (!resultData) return <p className="p-10 text-center">Loading...</p>;

  const totalItemCost = resultData.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const grandTotal = totalItemCost + resultData.tax;

  return (
    <main className="min-h-screen bg-[#FFF8F0] text-[#3A2C5A] p-4 sm:p-6 font-mono relative">
      {showToast && (
        <Toast message="Link copied to clipboard!" onClose={() => setShowToast(false)} />
      )}

      <div id="pdf-content" className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 border border-[#E2D6F3]">
        <h1 className="text-2xl font-bold text-center mb-2">Receipt</h1>
        <p className="text-center text-xs text-[#5A4B81] mb-2">
          {resultData.restaurant} | {resultData.date}
        </p>
        <p className="text-center text-xs mb-6 text-[#8B7BA2] italic">
          Split Type: {resultData.splitType === 'unit' ? 'Per Unit' : 'Flexible'}
        </p>

        {/* Order Summary */}
        <div className="text-sm mb-4">
          <h2 className="font-semibold mb-2">Order Summary</h2>
          {resultData.items?.map((item, index) => (
            <div key={index} className="flex justify-between items-start mb-2">
              <div className="flex gap-2 flex-col">
                <div className="flex items-center gap-1">
                  <Utensils className="w-4 h-4 text-[#3A2C5A]" />
                  <span>{item.name} × {item.qty}</span>
                </div>
                <span className="text-xs text-gray-500 ml-5">
                  Rp {item.price.toLocaleString()} / item
                </span>
              </div>
              <span className="font-medium text-right">
                Rp {(item.price * item.qty).toLocaleString()}
              </span>
            </div>
          ))}

          {/* Tax and Total */}
          <div className="flex justify-between items-center mt-4 border-t border-dashed border-[#E2D6F3] pt-2">
            <span className="font-semibold">Tax</span>
            <span>Rp {resultData.tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mt-2 border-t border-dashed border-[#C3B6E0] pt-2 text-base font-semibold">
            <span>Grand Total</span>
            <span>Rp {grandTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className="my-4 border-t border-dashed border-[#C3B6E0]" />

        {/* Per Person Split */}
        {resultData.split.map((person, index) => (
          <motion.div
            key={index}
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <h2 className="text-lg font-semibold border-b border-[#E2D6F3] pb-1 mb-2">
              {person.name}
            </h2>
            <div className="text-sm space-y-1">
              {/* Show items if per unit */}
              {resultData.splitType === 'unit' && person.items && (
                <div className="text-xs text-[#5A4B81] mb-2">
                  {person.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{i.name} × {i.qty}</span>
                      <span>Rp {i.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rp {person.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Share</span>
                <span>Rp {person.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-dashed border-[#E2D6F3] mt-2">
                <span>Total</span>
                <span>Rp {person.total.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Button
          onClick={copyLink}
          className="bg-[#F5C24C] text-[#3A2C5A] hover:bg-[#ecc043]"
        >
          Share Link
        </Button>
      </div>
    </main>
  );
}
