"use client";

import { Github, Instagram, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-[#2D1B69] text-[#8B72BE] border-t border-[#1E1245]">
      <div className="max-w-2xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-center sm:text-left text-[#8B72BE]">
          Angelica's Split Bill &middot; 2025
        </p>

        <div className="flex items-center gap-4">
          {[
            { href: "https://github.com/hwasyui",                    icon: Github    },
            { href: "https://www.linkedin.com/in/angelicawhiharto/", icon: Linkedin  },
            { href: "https://www.instagram.com/angelstwhr",           icon: Instagram },
          ].map(({ href, icon: Icon }) => (
            <motion.a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="text-[#5B3F8C] hover:text-[#F5C24C] transition-colors"
            >
              <Icon className="w-4 h-4" />
            </motion.a>
          ))}
        </div>
      </div>
    </footer>
  );
}
