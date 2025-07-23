"use client";

import { Heart, Github, Instagram, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="text-center text-sm text-gray-600 py-6 px-5 space-y-2">
      <motion.div
        className="inline-block"
        whileHover={{ scale: 1.05, color: "#000" }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        Made with{" "}
        <motion.span
          className="inline-block text-red-500"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart className="inline w-4 h-4" fill="currentColor" />
        </motion.span>{" "}
        by Angelica in 2025. I don't tolerate any plagiarism.
      </motion.div>

      <div className="flex justify-center gap-4 mt-2">
        <motion.a
          href="https://github.com/hwasyui"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Github className="w-5 h-5 text-gray-600 hover:text-black transition-colors" />
        </motion.a>
        <motion.a
          href="https://www.linkedin.com/in/angelicawhiharto/"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Linkedin className="w-5 h-5 text-gray-600 hover:text-blue-600 transition-colors" />
        </motion.a>
        <motion.a
          href="https://www.instagram.com/angelstwhr"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Instagram className="w-5 h-5 text-gray-600 hover:text-pink-500 transition-colors" />
        </motion.a>
      </div>
    </footer>
  );
}
