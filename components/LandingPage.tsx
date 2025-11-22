import React, { useRef } from 'react';
import { ArrowRight, BarChart3, Landmark, Lightbulb } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import GlassCard from './GlassCard';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // 3D Parallax for Hero
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) - 0.5);
    mouseY.set((clientY / innerHeight) - 0.5);
  };

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { stiffness: 150, damping: 20 });

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#0a1628] via-[#050c1a] to-[#020408] text-white selection:bg-emerald-500/30"
    >
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px] opacity-40 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] opacity-30" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[80vh] [perspective:1000px]">
          
          {/* 3D Compass Element */}
          <motion.div 
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative w-64 h-64 md:w-96 md:h-96 mb-16"
          >
            {/* Outer Ring */}
            <div className="absolute inset-0 border border-white/10 rounded-full flex items-center justify-center animate-[spin_60s_linear_infinite]">
               <div className="w-[95%] h-[95%] border border-dashed border-emerald-500/20 rounded-full" />
            </div>
            
            {/* Middle Ring */}
            <div className="absolute inset-[15%] border border-white/5 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.1)] animate-[spin_40s_linear_infinite_reverse]">
               <div className="absolute top-0 left-1/2 w-1 h-3 bg-emerald-500/50 -translate-x-1/2" />
               <div className="absolute bottom-0 left-1/2 w-1 h-3 bg-emerald-500/50 -translate-x-1/2" />
               <div className="absolute left-0 top-1/2 w-3 h-1 bg-emerald-500/50 -translate-y-1/2" />
               <div className="absolute right-0 top-1/2 w-3 h-1 bg-emerald-500/50 -translate-y-1/2" />
            </div>

            {/* Inner Glowing Core */}
            <div className="absolute inset-[35%] bg-gradient-to-br from-emerald-900/40 to-black rounded-full backdrop-blur-md border border-white/10 shadow-inner flex items-center justify-center transform translate-z-20">
              <div className="text-4xl md:text-6xl font-serif text-emerald-400">N</div>
            </div>

            {/* Floating Stats Cards around the compass */}
            <motion.div 
              className="absolute -right-12 top-10 bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl transform translate-z-30"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                <span className="text-xs font-mono text-gray-300">GDP 實時監控</span>
              </div>
            </motion.div>

            <motion.div 
              className="absolute -left-16 bottom-20 bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl transform translate-z-30"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-indigo-400"/>
                <span className="text-xs font-mono text-gray-300">商標註冊 +12%</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-8 relative z-20"
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md mb-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
              <span className="text-xs font-medium text-emerald-200 tracking-wider uppercase">澳門特別行政區 • 2024 Q4 數據</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500 tracking-tighter leading-[1.1]">
              澳門商業指南針
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
              融合政府開放數據與 AI 智能分析，為創業者提供最精準的市場洞察。
              <br className="hidden md:block"/> 讓數據導航您的商業未來。
            </p>

            <div className="pt-8">
              <motion.button 
                onClick={onEnter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white overflow-hidden rounded-full bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                <span className="relative z-10 flex items-center">
                  進入控制台
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid - Scroll Animation */}
        <motion.div 
          style={{ y }}
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
        >
          <GlassCard className="p-8 h-full hover:border-emerald-500/30" enableTilt>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-100 mb-3">商業實地雷達</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              不再依賴模擬數據。利用 Google Maps 即時顯示該區真實競爭對手、評分與飽和度分析，幫你精準選址避開紅海。
            </p>
          </GlassCard>

          <GlassCard className="p-8 h-full hover:border-indigo-500/30" enableTilt>
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Landmark className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-100 mb-3">一鍵商業計劃書</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              無需逐欄填表。選擇地區、業態、預算，AI 即時生成專業計劃書（含 SWOT、財務預測、合規清單），可直接下載提交銀行或合夥人。
            </p>
          </GlassCard>

          <GlassCard className="p-8 h-full hover:border-amber-500/30" enableTilt>
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Lightbulb className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-100 mb-3">董事會會議室</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              升級版 AI 顧問。未來支援全雙工語音對話與視覺輸入，像與資深合夥人對談一樣，實時解答租金、動線、牌照等問題。
            </p>
          </GlassCard>
        </motion.div>

        <div className="mt-32 text-center border-t border-white/5 pt-8">
          <p className="text-xs text-gray-600 uppercase tracking-[0.2em] font-mono">
             數據來源：統計暨普查局 (DSEC) • 經濟及科技發展局 (DSEDT)
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;