"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="text-center text-sm text-gray-600 py-6 px-5">
      Made with{" "}
      <motion.span
        className="inline-block text-red-500"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart className="inline w-4 h-4" fill="currentColor" />
      </motion.span>{" "}
      by Angelica in 2025. I don't tolerate any plagiarism.
    </footer>
  );
}
