'use client';

import { Button } from "@/components/ui/button";
import { ArrowDown, Camera, Trash } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/loader";
import Footer from "@/components/ui/footer";

export default function HomePage() {
  const uploadRef = useRef(null);
  const aiReceiptRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const router = useRouter();

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);

      const formData = new FormData();
      formData.append("receipt", file);

      try {
        setLoading(true);
        const res = await fetch("/api/process-receipt", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        setLoading(false);

        setAiResult(data);
        localStorage.setItem("receiptData", JSON.stringify(data));

        setTimeout(() => {
          aiReceiptRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } catch (error) {
        console.error("Error uploading to API:", error);
        setLoading(false);
      }
    }
  };

  const goToAssignPage = () => {
    router.push("/assign");
  };

  return (
    <main className="bg-[#FFF8F0] text-[#3A2C5A]">
      {loading && <Loader message="AI reading and preparing your receipts data. Please wait patiently." />}
      <div className="snap-y snap-mandatory">
        <section className="snap-start min-h-screen flex flex-col justify-center items-center text-center px-6 bg-gradient-to-b from-[#FDF1E6] to-[#F7E1FF]">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            Split the Bill, Effortlessly
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl text-[#5A4B81] mb-8"
          >
            Upload or scan your receipt. Let AI reads your receipts. Split the bills. Share instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Button onClick={scrollToUpload} size="lg" className="bg-[#F5C24C] hover:bg-[#ecc043] text-[#3A2C5A] text-lg px-6 py-4 rounded-full shadow-lg">
              Get Started
            </Button>
          </motion.div>

          <ArrowDown onClick={scrollToUpload} className="mt-12 animate-bounce text-[#BCA1E2] w-8 h-8" />
        </section>
        <section ref={uploadRef} className="snap-start min-h-screen flex flex-col justify-center items-center px-6 py-24 bg-white text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#3A2C5A] mb-6">Upload or Scan Your Receipt</h2>
          <p className="text-md md:text-lg text-[#5A4B81] mb-8 max-w-xl">
            Drag and drop your receipt here, or use your camera.
          </p>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-md bg-[#F9F5FF] border-2 border-dashed border-[#BCA1E2] rounded-2xl p-8 cursor-pointer hover:bg-[#F5EDFF] transition-all"
          >
            <p className="text-[#5A4B81]">Click to upload from device</p>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-4 rounded-xl max-h-60 object-contain mx-auto" />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="mt-6">
            <Button onClick={() => cameraInputRef.current?.click()} variant="outline" className="text-[#3A2C5A] border-[#BCA1E2] hover:bg-[#F5EDFF]">
              <Camera className="mr-2 h-5 w-5" /> Use Camera
            </Button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </section>
      </div>

      {aiResult && (
        <section
          ref={aiReceiptRef}
          className="w-full max-w-4xl mx-auto px-4 py-10"
        >
          <h1 className="text-3xl font-bold mb-6 text-center">Receipt Info</h1>

          <div className="bg-[#F9F5FF] rounded-xl border border-[#E2D6F3] p-6">
            <h3 className="text-xl font-semibold mb-4 text-center">General Information</h3>

            <div className="flex flex-col mb-4 border rounded-lg p-4 bg-white">
              <label className="text-sm text-[#5A4B81]">Restaurant</label>
              <input
                className="border rounded px-3 py-2 text-sm"
                value={aiResult.restaurant || ""}
                onChange={(e) =>
                  setAiResult({ ...aiResult, restaurant: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col mb-4 border rounded-lg p-4 bg-white">
              <label className="text-sm text-[#5A4B81]">Date</label>
              <input
                className="border rounded px-3 py-2 text-sm"
                value={aiResult.date || ""}
                onChange={(e) =>
                  setAiResult({ ...aiResult, date: e.target.value })
                }
              />
            </div>

            <h3 className="text-xl font-semibold mb-4 text-center">Items</h3>

            <div className="space-y-4">
              {aiResult.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 border rounded-lg p-4 bg-white shadow-sm relative"
                >
                  <div className="absolute top-3 right-3 text-red-500 cursor-pointer">
                    <Trash
                      onClick={() => {
                        const updatedItems = aiResult.items.filter((_, i) => i !== index);
                        setAiResult({ ...aiResult, items: updatedItems });
                      }}
                      size={18}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm text-[#5A4B81]">Name</label>
                    <input
                      className="border rounded px-3 py-2 text-sm"
                      value={item.name || ""}
                      onChange={(e) => {
                        const updatedItems = [...aiResult.items];
                        updatedItems[index].name = e.target.value;
                        setAiResult({ ...aiResult, items: updatedItems });
                      }}
                    />
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex flex-col">
                      <label className="text-sm text-[#5A4B81]">Qty</label>
                      <input
                        type="number"
                        className="border rounded px-3 py-2 text-sm"
                        value={item.qty}
                        onChange={(e) => {
                          const updatedItems = [...aiResult.items];
                          updatedItems[index].qty = parseInt(e.target.value) || 0;
                          setAiResult({ ...aiResult, items: updatedItems });
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="text-sm text-[#5A4B81]">Price</label>
                      <input
                        type="text"
                        className="border rounded px-3 py-2 text-sm"
                        value={item.price?.toLocaleString('en-US') || ""}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/,/g, "");
                          const updatedItems = [...aiResult.items];
                          updatedItems[index].price = parseInt(rawValue) || 0;
                          setAiResult({ ...aiResult, items: updatedItems });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-xl font-semibold mb-4 text-center mt-6">Tax</h3>
            <div className="flex flex-col border rounded-lg p-4 bg-white">
              <label className="text-sm text-[#5A4B81]">Tax Amount</label>
              <input
                type="text"
                className="border rounded px-3 py-2 text-sm"
                value={aiResult.tax?.toLocaleString('en-US') || ""}
                onChange={(e) =>
                  setAiResult({ ...aiResult, tax: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={goToAssignPage}
              className="mt-6 px-25 py-5 bg-[#F5C24C] text-[#3A2C5A] hover:bg-[#ecc043]"
            >
              Assign Split Bill →
            </Button>
          </div>
        </section>
      )}
<Footer />
    </main>
  );
}
