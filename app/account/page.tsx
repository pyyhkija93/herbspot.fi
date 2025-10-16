'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import LoyaltyCard from '@/components/LoyaltyCard';
import QRDisplay from '@/components/QRDisplay';

interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'loyalty'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Mock order data
    setOrders([
      {
        id: 'ORD-001',
        date: '2024-10-14',
        total: 119.98,
        status: 'Delivered',
        items: [
          { name: 'Premium 510 Cartridge - Lavender', quantity: 1, price: 29.99 },
          { name: 'Aromatherapy Device Pro', quantity: 1, price: 89.99 }
        ]
      },
      {
        id: 'ORD-002',
        date: '2024-10-10',
        total: 24.99,
        status: 'Delivered',
        items: [
          { name: 'Essential Oil Blend - Relaxation', quantity: 1, price: 24.99 }
        ]
      }
    ]);
  }, []);

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-[#39FF14]">My Account</h1>
          <p className="text-gray-400">Manage your orders and loyalty rewards</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900 rounded-full p-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'orders', label: 'Orders' },
              { id: 'loyalty', label: 'Loyalty' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#39FF14] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Account Stats */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-black/90 border border-gray-800 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6">Account Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#39FF14]">{totalOrders}</div>
                    <div className="text-gray-400">Total Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#39FF14]">€{totalSpent.toFixed(2)}</div>
                    <div className="text-gray-400">Total Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#39FF14]">{Math.floor(totalSpent * 2)}</div>
                    <div className="text-gray-400">Loyalty Points</div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-black/90 border border-gray-800 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg">
                      <div>
                        <div className="font-semibold">Order #{order.id}</div>
                        <div className="text-gray-400 text-sm">{order.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">€{order.total.toFixed(2)}</div>
                        <div className="text-sm text-green-400">{order.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="mt-4 text-[#39FF14] hover:text-[#32E60A] transition-colors"
                >
                  View All Orders →
                </button>
              </div>
            </div>

            {/* Loyalty Card */}
            <div>
              <LoyaltyCard />
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/90 border border-gray-800 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Order History</h2>
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-800 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                      <p className="text-gray-400">Placed on {order.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#39FF14]">€{order.total.toFixed(2)}</div>
                      <div className={`text-sm font-medium ${
                        order.status === 'Delivered' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name} × {item.quantity}</span>
                        <span>€{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between">
                    <button className="text-[#39FF14] hover:text-[#32E60A] transition-colors">
                      Track Order
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors">
                      Download Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loyalty Tab */}
        {activeTab === 'loyalty' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <LoyaltyCard />
            <QRDisplay orderId="DEMO-ORDER-123" points={150} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

