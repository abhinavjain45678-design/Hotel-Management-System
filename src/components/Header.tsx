import React from 'react';
import {
  Download,
  Terminal,
  Database,
  Code2,
  BookOpen,
  Coffee,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { downloadProjectZip } from '../utils/zipGenerator';

export type ActiveTab = 'simulator' | 'code' | 'theory' | 'database' | 'github';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadProjectZip();
    } finally {
      setDownloading(false);
    }
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'simulator', label: 'POS Desktop Simulator', icon: <Terminal className="w-4 h-4" />, badge: 'Interactive' },
    { id: 'code', label: 'Java Source Explorer', icon: <Code2 className="w-4 h-4" />, badge: '20+ Files' },
    { id: 'theory', label: 'Theory & Viva Docs', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'database', label: 'MySQL Schema & SQL', icon: <Database className="w-4 h-4" /> },
    { id: 'github', label: 'GitHub Upload Guide', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-900/40">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  GrandPalace Hotel POS
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Core Java + MySQL
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                OOP Principles (Encapsulation, Inheritance, Abstraction, Polymorphism) • JDBC Type-4 • Collections • File I/O
              </p>
            </div>
          </div>

          {/* Download Action & Quick Actions */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition shadow-sm hover:shadow-amber-500/20 active:scale-95 disabled:opacity-75 cursor-pointer"
              title="Download entire project with pom.xml, schema.sql, and Java source code"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Preparing ZIP...' : 'Download Java Project (.zip)'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 pt-1 border-t border-slate-800/80 text-sm font-medium scrollbar-thin">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive ? 'bg-amber-500/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
