import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '8801712426871'; // without +

const WhatsAppButton = () => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I need help with my order at Glamour's Touch 🛍️")}`;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: 'spring', stiffness: 260, damping: 20 }}
      className="fixed bottom-6 left-4 z-[99] flex items-center gap-2 bg-[#25d366] text-white pl-4 pr-5 py-3 rounded-full shadow-xl shadow-[#25d366]/30 hover:shadow-[#25d366]/50 hover:scale-105 transition-all duration-300 group"
      title="Chat with us on WhatsApp"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25d366] animate-ping opacity-20 group-hover:opacity-0" />
      <MessageCircle size={22} className="flex-shrink-0" />
      <span className="text-sm font-bold tracking-wide hidden sm:inline">Chat with Us</span>
    </motion.a>
  );
};

export default WhatsAppButton;
