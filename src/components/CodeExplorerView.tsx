import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  FolderTree,
  Search,
  Code2,
  Database,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { JAVA_PROJECT_FILES, type JavaProjectFile } from '../data/javaProjectFiles';
import { downloadProjectZip } from '../utils/zipGenerator';

export const CodeExplorerView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<JavaProjectFile>(JAVA_PROJECT_FILES[3]); // Default to MenuItem.java
  const [copied, setCopied] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [fileSearch, setFileSearch] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  const categories = ['All', 'Model', 'DAO', 'Service', 'Exception', 'Util', 'UI', 'Database', 'Configuration', 'Docs'];

  const filteredFiles = JAVA_PROJECT_FILES.filter((file) => {
    const matchesCategory = categoryFilter === 'All' || file.category === categoryFilter;
    const matchesSearch =
      file.name.toLowerCase().includes(fileSearch.toLowerCase()) ||
      file.path.toLowerCase().includes(fileSearch.toLowerCase()) ||
      file.description.toLowerCase().includes(fileSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyCode = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(selectedFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      await downloadProjectZip();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-amber-400" />
              Core Java Source Code Repository
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono border border-slate-700">
              {JAVA_PROJECT_FILES.length} Files Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete, compilable Java 17 + Maven + MySQL JDBC project with OOP architecture, ready to import into IntelliJ, Eclipse, or VS Code.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md active:scale-95 disabled:opacity-75 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Bundling ZIP...' : 'Download Complete Java Project (.zip)'}</span>
        </button>
      </div>

      {/* Main Grid: Left File Tree, Right Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: File Tree & Categories (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={fileSearch}
              onChange={(e) => setFileSearch(e.target.value)}
              placeholder="Search files (e.g., MenuItem, DBConnection)..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1 text-[11px]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Files List */}
          <div className="max-h-[580px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 rounded-lg transition border flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800/60 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode
                      className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold font-mono truncate">{file.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{file.path}</div>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold flex-shrink-0 ${
                      file.category === 'Model'
                        ? 'bg-blue-950 text-blue-400'
                        : file.category === 'DAO'
                        ? 'bg-purple-950 text-purple-400'
                        : file.category === 'Service'
                        ? 'bg-emerald-950 text-emerald-400'
                        : file.category === 'Util'
                        ? 'bg-orange-950 text-orange-400'
                        : file.category === 'Exception'
                        ? 'bg-rose-950 text-rose-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-0">
          {/* Code Viewer Header */}
          <div className="bg-slate-950 border-b border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-200 font-mono">{selectedFile.path}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {selectedFile.code.split('\n').length} lines
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedFile.description}</p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy File'}</span>
              </button>
            </div>
          </div>

          {/* Code Editor Frame */}
          <div className="relative">
            <div className="max-h-[640px] overflow-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-300 selection:bg-amber-500 selection:text-slate-950">
              <pre className="overflow-x-auto">
                {selectedFile.code.split('\n').map((line, idx) => (
                  <div key={idx} className="table-row hover:bg-slate-900/50">
                    <span className="table-cell select-none text-right pr-4 text-slate-600 font-mono text-[11px] w-8">
                      {idx + 1}
                    </span>
                    <span className="table-cell whitespace-pre font-mono">{line}</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
