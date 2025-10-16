'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface QRDisplayProps {
  orderId?: string;
  points?: number;
  className?: string;
}

export default function QRDisplay({ orderId, points = 0, className = '' }: QRDisplayProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Generate QR code data
  const qrData = orderId ? 
    `herbspot://order/${orderId}?points=${points}` : 
    `herbspot://loyalty/demo?points=${points}`;

  useEffect(() => {
    // Simple QR code generation using a placeholder service
    // In production, you'd use a proper QR library like qrcode.react
    const generateQR = () => {
      // Mock QR code - replace with real QR generation
      const mockQR = `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <g fill="black">
            <rect x="10" y="10" width="20" height="20"/>
            <rect x="40" y="10" width="20" height="20"/>
            <rect x="70" y="10" width="20" height="20"/>
            <rect x="100" y="10" width="20" height="20"/>
            <rect x="130" y="10" width="20" height="20"/>
            <rect x="160" y="10" width="20" height="20"/>
            
            <rect x="10" y="40" width="20" height="20"/>
            <rect x="70" y="40" width="20" height="20"/>
            <rect x="100" y="40" width="20" height="20"/>
            <rect x="160" y="40" width="20" height="20"/>
            
            <rect x="10" y="70" width="20" height="20"/>
            <rect x="40" y="70" width="20" height="20"/>
            <rect x="130" y="70" width="20" height="20"/>
            <rect x="160" y="70" width="20" height="20"/>
            
            <rect x="10" y="100" width="20" height="20"/>
            <rect x="40" y="100" width="20" height="20"/>
            <rect x="70" y="100" width="20" height="20"/>
            <rect x="130" y="100" width="20" height="20"/>
            
            <rect x="10" y="130" width="20" height="20"/>
            <rect x="70" y="130" width="20" height="20"/>
            <rect x="100" y="130" width="20" height="20"/>
            <rect x="160" y="130" width="20" height="20"/>
            
            <rect x="10" y="160" width="20" height="20"/>
            <rect x="40" y="160" width="20" height="20"/>
            <rect x="70" y="160" width="20" height="20"/>
            <rect x="130" y="160" width="20" height="20"/>
            <rect x="160" y="160" width="20" height="20"/>
          </g>
          <text x="100" y="190" text-anchor="middle" font-family="monospace" font-size="8" fill="black">HERBSPOT</text>
        </svg>
      `)}`;
      setQrCode(mockQR);
    };

    generateQR();
  }, [orderId, points]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-black/90 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm ${className}`}
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">QR Code</h3>
        <p className="text-gray-400 text-sm mb-6">
          Show this QR code to earn loyalty points
        </p>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-xl">
            {qrCode ? (
              <img
                src={qrCode}
                alt="QR Code"
                className="w-48 h-48"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Loading QR...</span>
              </div>
            )}
          </div>
        </div>

        {/* Points Info */}
        <div className="bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-xl p-4 mb-6">
          <div className="text-[#39FF14] font-bold text-lg">
            +{points} Points Available
          </div>
          <div className="text-gray-400 text-sm">
            Scan to claim your rewards
          </div>
        </div>

        {/* Copy Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={copyToClipboard}
          className={`px-6 py-3 rounded-full font-semibold transition-all ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-[#39FF14] text-black hover:bg-[#32E60A]'
          }`}
        >
          {copied ? '✓ Copied!' : 'Copy QR Data'}
        </motion.button>

        {/* Instructions */}
        <div className="mt-6 text-left">
          <h4 className="text-sm font-semibold text-white mb-2">How to use:</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Show QR code at checkout</li>
            <li>• Staff will scan to add points</li>
            <li>• Points appear instantly in your account</li>
            <li>• Redeem points for discounts</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

