import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import PreviewScene from './components/PreviewScene';
import { Menu, X, Globe, Terminal, Shield, Zap, Home } from 'lucide-react';
import { useState, useEffect } from 'react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Automation', path: '/automation', icon: Zap },
    { name: 'Pentesting AI', path: '/pentesting', icon: Shield },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-8 h-8 border border-white flex items-center justify-center p-1 transition-transform group-hover:scale-110">
            <div className="w-full h-full bg-white" />
          </div>
          <h1 className="text-xl font-display font-bold uppercase tracking-widest text-white">Axon Core</h1>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-2xl font-display font-bold uppercase tracking-widest text-white hover:text-theme-accent transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen w-screen bg-black flex flex-col items-center justify-center p-4 pt-24">
      <div className="w-full max-w-6xl aspect-video lg:aspect-[21/9]">
        <PreviewScene 
          layoutId="elegant-dark" 
          onNavigate={(page) => navigate(`/${page}`)} 
        />
      </div>
    </div>
  );
}

function PageTemplate({ title, description }: { title: string; description: string }) {
  return (
    <div className="min-h-screen w-screen bg-[#050505] text-white flex flex-col p-6 pt-32 overflow-hidden">
      <main className="flex-1 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full"
        >
          <div className="glass-card p-8 md:p-16 rounded-xl border-white/5 relative overflow-hidden tech-border">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-theme-accent/50 to-transparent" />
            
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-6 uppercase tracking-[0.2em]">{title}</h1>
            <p className="text-slate-400 font-mono text-sm uppercase tracking-widest mb-12 leading-relaxed text-balance">
              {description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 p-6 border border-white/5 rounded-lg flex flex-col gap-4">
                  <div className="w-8 h-8 bg-theme-accent/20 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-theme-accent" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-1 bg-white/20 w-3/4" />
                    <div className="h-1 bg-white/10 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="mt-auto py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] font-mono text-slate-600 uppercase tracking-widest">
        <span>Sub-System Status: Nominal</span>
        <span>Secure Protocol: Enabled</span>
        <span>Axon Core Neural Link</span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/automation" 
          element={
            <PageTemplate 
              title="Automation Engine" 
              description="Autonomous workflows and heuristic process synchronization for decentralized networks." 
            />
          } 
        />
        <Route 
          path="/pentesting" 
          element={
            <PageTemplate 
              title="Pentesting AI" 
              description="Deep neural auditing and vulnerability vector analysis for high-security perimeters." 
            />
          } 
        />
      </Routes>
    </>
  );
}
