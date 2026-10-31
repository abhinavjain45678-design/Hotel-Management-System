import React, { useState } from 'react';
import { Header, type ActiveTab } from './components/Header';
import { SimulatorView } from './components/SimulatorView';
import { CodeExplorerView } from './components/CodeExplorerView';
import { TheoryDocumentationView } from './components/TheoryDocumentationView';
import { DatabaseInspectorView } from './components/DatabaseInspectorView';
import { GitHubUploadGuideView } from './components/GitHubUploadGuideView';
import { Coffee, Github, Heart, Shield, CheckCircle2 } from 'lucide-react';
import { downloadProjectZip } from './utils/zipGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header & Tab Navigation */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Container */}
      <main className="flex-1 pb-16">
        {activeTab === 'simulator' && <SimulatorView />}
        {activeTab === 'code' && <CodeExplorerView />}
        {activeTab === 'theory' && <TheoryDocumentationView />}
        {activeTab === 'database' && <DatabaseInspectorView />}
        {activeTab === 'github' && <GitHubUploadGuideView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 text-slate-400 py-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">GrandPalace Food Hotel Management System</p>
              <p className="text-[11px] text-slate-500">
                Core Java 17 • Object-Oriented Architecture • MySQL JDBC Type-4 • Collections • File I/O
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <button
              onClick={() => setActiveTab('github')}
              className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Setup Guide</span>
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className="hover:text-amber-400 transition cursor-pointer"
            >
              <span>Viva Masterclass (25 Q&amp;A)</span>
            </button>
            <button
              onClick={() => downloadProjectZip()}
              className="text-amber-400 hover:text-amber-300 font-semibold transition cursor-pointer"
            >
              <span>Download (.zip)</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
