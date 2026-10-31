import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Search,
  Code2,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  Bookmark,
} from 'lucide-react';
import { THEORY_SECTIONS, type TheorySection } from '../data/theoryDocumentation';

export const TheoryDocumentationView: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>('oop-concepts');
  const [searchDoc, setSearchDoc] = useState<string>('');
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  const activeSection = THEORY_SECTIONS.find((s) => s.id === activeSectionId) || THEORY_SECTIONS[0];

  const filteredSections = THEORY_SECTIONS.filter((s) => {
    return (
      s.title.toLowerCase().includes(searchDoc.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchDoc.toLowerCase()) ||
      s.content.toLowerCase().includes(searchDoc.toLowerCase())
    );
  });

  const handleCopySection = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${activeSection.title}\n\n${activeSection.content}`);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Project Theory, Architecture &amp; Viva Documentation</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            In-depth academic and interview-grade explanations of OOP principles, JDBC Type-4 architecture, Java Collections, custom Exception handling, and File I/O streams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
            College Viva &amp; Job Interview Ready
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Topic Selector (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchDoc}
              onChange={(e) => setSearchDoc(e.target.value)}
              placeholder="Search concepts (e.g. Encapsulation, JDBC, ACID)..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredSections.map((section) => {
              const isActive = section.id === activeSection.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={`w-full text-left p-3 rounded-lg transition border flex flex-col gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {section.badge}
                    </span>
                    {isActive && <ChevronRight className="w-4 h-4 text-amber-400" />}
                  </div>
                  <h4 className="text-xs font-bold leading-snug">{section.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{section.summary}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Area: Detailed Documentation (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
          {/* Active Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {activeSection.badge}
              </span>
              <h3 className="text-xl font-bold text-white mt-2">{activeSection.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{activeSection.summary}</p>
            </div>

            <button
              onClick={handleCopySection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer self-start sm:self-auto"
            >
              {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet ? 'Copied' : 'Copy Section'}</span>
            </button>
          </div>

          {/* Key Takeaways Chips */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Bookmark className="w-3.5 h-3.5" /> Key Architectural Takeaways
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {activeSection.keyTakeaways.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Markdown-style Content Renderer */}
          <div className="space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
            {(() => {
              // Parse content into blocks: code blocks vs text blocks
              const raw = activeSection.content;
              const blocks: { type: 'code' | 'text'; lang?: string; content: string }[] = [];
              const parts = raw.split(/(```[\s\S]*?```)/g);

              for (const part of parts) {
                if (part.startsWith('```')) {
                  const match = part.match(/^```(\w+)?\n([\s\S]*?)```$/);
                  blocks.push({
                    type: 'code',
                    lang: match ? match[1] || 'text' : 'text',
                    content: match ? match[2].trim() : part.slice(3, -3).trim(),
                  });
                } else if (part.trim().length > 0) {
                  blocks.push({ type: 'text', content: part });
                }
              }

              return blocks.map((block, bIdx) => {
                if (block.type === 'code') {
                  return (
                    <div key={bIdx} className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
                      <div className="bg-slate-900/80 px-3 py-1.5 border-b border-slate-800/80 text-[10px] font-mono text-amber-400 uppercase tracking-wider flex items-center justify-between">
                        <span>{block.lang} snippet</span>
                        <span className="text-slate-500">Core Java Architecture</span>
                      </div>
                      <pre className="p-4 font-mono text-xs text-amber-300/95 overflow-x-auto leading-relaxed select-all">
                        {block.content}
                      </pre>
                    </div>
                  );
                }

                // Text block: split into paragraphs / headings / lists
                const lines = block.content.split('\n');
                const elements: React.ReactNode[] = [];
                let currentParagraph: string[] = [];

                const flushParagraph = (key: string) => {
                  if (currentParagraph.length > 0) {
                    const text = currentParagraph.join(' ').trim();
                    if (text) {
                      elements.push(
                        <p key={key} className="text-slate-300 leading-relaxed">
                          {text}
                        </p>
                      );
                    }
                    currentParagraph = [];
                  }
                };

                lines.forEach((line, lIdx) => {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('### ')) {
                    flushParagraph(`flush-${lIdx}`);
                    elements.push(
                      <h4 key={`h3-${lIdx}`} className="text-base font-bold text-white pt-3 border-b border-slate-800/80 pb-1">
                        {trimmed.replace('### ', '')}
                      </h4>
                    );
                  } else if (trimmed.startsWith('#### ')) {
                    flushParagraph(`flush-${lIdx}`);
                    elements.push(
                      <h5 key={`h4-${lIdx}`} className="text-sm font-bold text-amber-400 pt-2">
                        {trimmed.replace('#### ', '')}
                      </h5>
                    );
                  } else if (trimmed.startsWith('---')) {
                    flushParagraph(`flush-${lIdx}`);
                    elements.push(<hr key={`hr-${lIdx}`} className="border-slate-800/80 my-3" />);
                  } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    flushParagraph(`flush-${lIdx}`);
                    elements.push(
                      <div key={`li-${lIdx}`} className="flex items-start gap-2 pl-3 py-0.5 text-slate-300">
                        <span className="text-amber-500 mt-1">•</span>
                        <span>{trimmed.replace(/^[-*]\s+/, '')}</span>
                      </div>
                    );
                  } else if (/^\d+\.\s+/.test(trimmed)) {
                    flushParagraph(`flush-${lIdx}`);
                    elements.push(
                      <div key={`num-${lIdx}`} className="flex items-start gap-2 pl-3 py-0.5 text-slate-300 font-medium">
                        <span className="text-amber-400 font-mono text-xs">{trimmed.match(/^\d+\./)?.[0]}</span>
                        <span>{trimmed.replace(/^\d+\.\s+/, '')}</span>
                      </div>
                    );
                  } else if (trimmed === '') {
                    flushParagraph(`flush-${lIdx}`);
                  } else {
                    currentParagraph.push(trimmed);
                  }
                });

                flushParagraph(`final-${bIdx}`);

                return <div key={bIdx} className="space-y-2">{elements}</div>;
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
