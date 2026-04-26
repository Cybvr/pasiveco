"use client"

import { useState, useEffect } from "react"
import { RiShoppingBag3Fill, RiTeamFill, RiWallet3Fill, RiArrowRightUpLine } from 'react-icons/ri'
import { motion, AnimatePresence } from "framer-motion"

export default function VibrantSpaceWidget() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="relative w-full max-w-lg mx-auto lg:ml-auto group">

      {/* Main Dashboard Widget */}
      <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[640px]">

        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-500">
              <RiWallet3Fill className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-chunko text-xl tracking-wide uppercase text-zinc-100">Creator Hub</h3>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Verified Account</p>
            </div>
          </div>
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800" />
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-500">
              +12
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 p-6 pt-8">
          <div className="bg-zinc-800/50 border border-zinc-700/50 p-5 rounded-2xl text-zinc-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Earnings Balance</p>
            <h4 className="text-2xl font-bold font-sans">₦342,000</h4>
            <div className="mt-4 flex items-center gap-1.5 text-emerald-500">
              <span className="text-[9px] font-bold tracking-widest uppercase">+24% This Week</span>
            </div>
          </div>
          
          <div className="bg-zinc-800/50 border border-zinc-700/50 p-5 rounded-2xl text-zinc-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Products Sold</p>
            <h4 className="text-2xl font-bold font-sans">142</h4>
            <div className="mt-4 flex items-center gap-1.5 text-emerald-400">
              <RiArrowRightUpLine className="w-4 h-4" />
              <span className="text-[9px] font-bold tracking-widest uppercase">Growth Live</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-6 flex-1 flex flex-col min-h-0">
          <div className="flex gap-4 mb-4">
             {["Activity", "Sales", "Space"].map((tab) => (
               <button 
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  activeTab === tab.toLowerCase() ? "text-emerald-500" : "text-zinc-500 hover:text-zinc-300"
                }`}
               >
                 {tab}
               </button>
             ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            <AnimatePresence mode="wait">
              {activeTab === "activity" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                  <ActivityItem user="Sarah J." action="purchased" item="Digital Marketing v2" time="2m ago" amount="₦2,500" />
                  <ActivityItem user="Olawale A." action="joined" item="Creators Elite Space" time="15m ago" />
                  <ActivityItem user="James K." action="purchased" item="Ebook Bundle" time="1h ago" amount="₦1,800" />
                  <ActivityItem user="Maria C." action="joined" item="Creators Elite Space" time="2h ago" />
                </motion.div>
              )}

              {activeTab === "sales" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                  <ProductItem name="Digital Marketing v2" sales={45} price="₦2,500" type="COURSE" color="bg-blue-500" />
                  <ProductItem name="Ebook Bundle" sales={92} price="₦1,800" type="EBOOK" color="bg-amber-500" />
                  <ProductItem name="Service: Consultation" sales={12} price="₦15,000" type="SERVICE" color="bg-purple-500" />
                </motion.div>
              )}

              {activeTab === "space" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-6 border border-zinc-800 rounded-2xl h-full flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-500 shadow-xl">
                      <RiTeamFill className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-zinc-100 uppercase font-chunko tracking-wide">Elite Space</h4>
                      <p className="text-sm text-zinc-500 font-bold">1,240 Members</p>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed italic mb-8 border-l border-zinc-800 pl-4">
                    "This space is incredible! The direct access to the team and the vault resources have tripled my sales this month."
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-zinc-800">
                    <span className="text-xs text-zinc-600 font-mono tracking-widest uppercase">Founder Spotlight</span>
                    <div className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                      Active Now
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Live Network Activity</span>
          </div>
          <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">Pasive Platform v2.0</span>
        </div>
      </div>

    </div>
  )
}

function ActivityItem({ user, action, item, time, amount }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-800/50 transition-all hover:bg-zinc-800/30 group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden relative">
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-200">
            {user} <span className="font-normal text-zinc-500">{action}</span> <span className="text-emerald-500 group-hover:underline cursor-pointer">{item}</span>
          </p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{time}</p>
        </div>
      </div>
      {amount && <span className="text-sm font-bold text-emerald-400 font-sans">{amount}</span>}
    </div>
  )
}

function ProductItem({ name, sales, price, type, color }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-800/50 transition-all hover:bg-zinc-800/30 group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center ${color.replace('bg-', 'text-')}`}>
          <RiShoppingBag3Fill className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">{name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-500 font-bold tracking-widest uppercase">{type}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{sales} sales</span>
          </div>
        </div>
      </div>
      <span className="text-sm font-bold text-zinc-200 font-sans">{price}</span>
    </div>
  )
}
