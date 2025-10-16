'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Finland'
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setStep('success');
      setLoading(false);
    }, 2000);
  };

  const mockCart = [
    { id: '1', name: 'Premium 510 Cartridge - Lavender', price: 29.99, quantity: 1 },
    { id: '2', name: 'Aromatherapy Device Pro', price: 89.99, quantity: 1 }
  ];

  const subtotal = mockCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-[#39FF14]">Checkout</h1>
          <p className="text-gray-400">Complete your order securely</p>
        </div>

        {step === 'details' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            {/* Order Form */}
            <div className="bg-black/90 border border-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Order Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-[#39FF14] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-[#39FF14] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-[#39FF14] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-[#39FF14] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-[#39FF14] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-[#39FF14] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-[#39FF14] focus:outline-none"
                  >
                    <option value="Finland">Finland</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Norway">Norway</option>
                    <option value="Denmark">Denmark</option>
                  </select>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full bg-[#39FF14] text-black py-4 rounded-lg font-bold text-lg hover:bg-[#32E60A] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </motion.button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-black/90 border border-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {mockCart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold">€{item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `€${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-[#39FF14]">
                  <span>Total</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>

              {subtotal < 50 && (
                <div className="mt-4 p-3 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-lg">
                  <p className="text-sm text-[#39FF14]">
                    Add €{(50 - subtotal).toFixed(2)} more for free shipping!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="bg-black/90 border border-gray-800 rounded-2xl p-12">
              <div className="w-20 h-20 bg-[#39FF14] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✓</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-4 text-[#39FF14]">
                Payment Successful!
              </h2>
              
              <p className="text-gray-400 mb-8">
                Your order has been processed and you'll receive a confirmation email shortly.
              </p>

              <div className="bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-xl p-6 mb-8">
                <h3 className="font-bold mb-2">Loyalty Points Earned!</h3>
                <p className="text-[#39FF14] text-xl font-bold">
                  +{Math.floor(total * 2)} Points
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Points will be added to your account within 24 hours
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/account')}
                  className="bg-[#39FF14] text-black px-8 py-4 rounded-full font-bold hover:bg-[#32E60A] transition-colors"
                >
                  View Account
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="border border-[#39FF14] text-[#39FF14] px-8 py-4 rounded-full font-bold hover:bg-[#39FF14] hover:text-black transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

