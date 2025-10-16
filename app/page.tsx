'use client'

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import LoyaltyCard from '@/components/LoyaltyCard';
import { shopify, GET_PRODUCTS_QUERY, mockProducts } from '@/lib/shopify';

export default function HomePage() {
  const [products, setProducts] = React.useState<any[]>(mockProducts);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchProductsData() {
      try {
        const { data } = await shopify.query({
          query: GET_PRODUCTS_QUERY,
          variables: { first: 6 }
        });
        const fetchedProducts = data?.products?.edges?.map((edge: any) => edge.node) || [];
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Unable to load products - showing demo products');
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    }

    fetchProductsData();
  }, []);

  return (
    <main className="bg-black min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative text-center py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-transparent opacity-80"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white to-[#39FF14] bg-clip-text text-transparent"
          >
            HERBSPOT 🪴
          </motion.h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Premium 510 Cartridges & Aromatherapy Devices
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#39FF14] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-[#32E60A] transition-colors shadow-lg">
              Shop Now
            </button>
            <button className="border border-[#39FF14] text-[#39FF14] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#39FF14] hover:text-black transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-gray-400 text-lg">
              Discover our premium selection of aromatherapy products
            </p>
          </div>

          {error && (
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4 mb-8 text-center">
              <p className="text-yellow-400">
                {error} - Showing demo products instead
              </p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-800 rounded-2xl aspect-square mb-4"></div>
                  <div className="bg-gray-800 h-6 rounded mb-2"></div>
                  <div className="bg-gray-800 h-4 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button className="bg-transparent border border-[#39FF14] text-[#39FF14] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#39FF14] hover:text-black transition-colors">
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* Loyalty Program Preview */}
      <section className="py-16 px-6 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Loyalty Program</h2>
            <p className="text-gray-400 text-lg">
              Earn points with every purchase and unlock exclusive benefits
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <LoyaltyCard />
          </div>

          <div className="text-center mt-12">
            <button className="bg-[#39FF14] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-[#32E60A] transition-colors">
              Join Loyalty Program
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#39FF14] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
              <p className="text-gray-400">Free delivery on orders over 50€</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#39FF14] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Payment</h3>
              <p className="text-gray-400">100% secure checkout with Stripe</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#39FF14] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Loyalty Rewards</h3>
              <p className="text-gray-400">Earn points with every purchase</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


