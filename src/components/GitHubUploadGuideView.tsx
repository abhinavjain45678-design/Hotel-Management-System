import React, { useState } from 'react';
import {
  Github,
  Terminal,
  Copy,
  Check,
  Download,
  Key,
  Shield,
  ExternalLink,
  Sparkles,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { downloadProjectZip } from '../utils/zipGenerator';

export const GitHubUploadGuideView: React.FC = () => {
  const [githubUsername, setGithubUsername] = useState<string>('abhinavjain45678');
  const [repoName, setRepoName] = useState<string>('hotel-food-management-system');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const cleanUser = githubUsername.trim() || 'abhinavjain45678';
  const cleanRepo = repoName.trim() || 'hotel-food-management-system';
  const repoUrl = `https://github.com/${cleanUser}/${cleanRepo}.git`;

  const commands = [
    { desc: 'Navigate into your extracted project root folder', cmd: `cd ${cleanRepo}` },
    { desc: 'Initialize local Git repository', cmd: 'git init' },
    { desc: 'Configure Git identity (matches your profile)', cmd: `git config user.name "Abhinav Jain"\ngit config user.email "abhinavjain45678@gmail.com"` },
    { desc: 'Stage all files (Java sources, pom.xml, schema.sql, README)', cmd: 'git add .' },
    { desc: 'Commit with descriptive message', cmd: 'git commit -m "feat: complete Food Hotel Management System in Core Java and MySQL"' },
    { desc: 'Rename primary branch to main', cmd: 'git branch -M main' },
    { desc: 'Link to your GitHub remote repository', cmd: `git remote add origin ${repoUrl}` },
    { desc: 'Push code to GitHub', cmd: 'git push -u origin main' },
  ];

  const fullBashScript = `#!/usr/bin/env bash
# Automated Git Setup Script for Food Hotel Management System
# Generated for Abhinav Jain (abhinavjain45678@gmail.com)

set -e

echo "=== Initializing Git Repository ==="
git init
git config user.name "Abhinav Jain"
git config user.email "abhinavjain45678@gmail.com"

echo "=== Staging All Files ==="
git add .

echo "=== Creating Commit ==="
git commit -m "feat: complete Food Hotel Management System in Core Java and MySQL"

echo "=== Setting Remote to ${repoUrl} ==="
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin "${repoUrl}"

echo "=== Pushing to GitHub ==="
echo "Note: If prompted for password, use your GitHub Personal Access Token (PAT)."
git push -u origin main

echo "=== Successfully pushed to ${repoUrl} ==="
`;

  const fullBatScript = `@echo off
REM Automated Git Setup for Windows
echo === Initializing Git Repository ===
git init
git config user.name "Abhinav Jain"
git config user.email "abhinavjain45678@gmail.com"

echo === Staging All Files ===
git add .

echo === Creating Commit ===
git commit -m "feat: complete Food Hotel Management System in Core Java and MySQL"

echo === Setting Remote ===
git branch -M main
git remote remove origin 2>nul
git remote add origin ${repoUrl}

echo === Pushing to GitHub ===
git push -u origin main
echo Done!
pause
`;

  const copyToClipboard = async (text: string, index?: number) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      if (index !== undefined) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } else {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      }
    }
  };

  const downloadScript = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Github className="w-6 h-6 text-white" />
            <h2 className="text-lg font-bold text-white">GitHub Upload &amp; Repository Publisher</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Custom-tailored Git workflow for <strong>Abhinav Jain</strong> (<span className="text-slate-300 font-mono">abhinavjain45678@gmail.com</span>) to push this complete Core Java &amp; MySQL project directly to GitHub.
          </p>
        </div>

        <button
          onClick={() => downloadProjectZip()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer active:scale-95 shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Download Project ZIP First</span>
        </button>
      </div>

      {/* Configuration Customizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          Customize Your GitHub Repository Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Your GitHub Username</label>
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              placeholder="e.g. abhinavjain45678"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Repository Name</label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              placeholder="hotel-food-management-system"
            />
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-slate-500">Target Remote URL:</span>
            <span className="text-amber-400 font-semibold ml-2 select-all">{repoUrl}</span>
          </div>
          <a
            href="https://github.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-xs"
          >
            <span>Create repo on GitHub.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Terminal Commands Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Step-by-Step Terminal Commands
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute these commands sequentially in your terminal inside the unzipped project directory.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(commands.map((c) => c.cmd).join('\n\n'))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'All Copied!' : 'Copy All Commands'}</span>
            </button>
            <button
              onClick={() => downloadScript(fullBashScript, 'push-to-github.sh')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .sh Script</span>
            </button>
            <button
              onClick={() => downloadScript(fullBatScript, 'push-to-github.bat')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Windows .bat</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {commands.map((step, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  {step.desc}
                </span>
                <button
                  onClick={() => copyToClipboard(step.cmd, idx)}
                  className="text-slate-400 hover:text-amber-400 text-xs flex items-center gap-1 cursor-pointer"
                >
                  {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-amber-300 font-mono text-xs overflow-x-auto select-all bg-slate-900/60 p-2 rounded border border-slate-800/50">
                {step.cmd}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* GitHub Authentication / PAT Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Key className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">GitHub Authentication via Personal Access Token (PAT)</h3>
        </div>

        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            When pushing code to GitHub for the first time, GitHub will ask for your credentials. Since August 2021, GitHub no longer accepts your account password for Git command line authentication.
          </p>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <span className="font-bold text-amber-400 block">How to generate a token in 4 clicks:</span>
            <ol className="list-decimal pl-4 space-y-1 text-slate-300">
              <li>
                Open <strong>GitHub.com</strong> &rarr; Click your profile picture (top right) &rarr; <strong>Settings</strong>.
              </li>
              <li>
                Scroll down to the bottom of the left sidebar &rarr; <strong>Developer Settings</strong> &rarr; <strong>Personal Access Tokens</strong> &rarr; <strong>Tokens (classic)</strong>.
              </li>
              <li>
                Click <strong>Generate new token (classic)</strong>. Note: <em>Hotel Management System</em>.
              </li>
              <li>
                Check the <strong>repo</strong> checkbox (gives permission to push repository).
              </li>
              <li>
                Click <strong>Generate token</strong> at the bottom. Copy the token string (starts with <code>ghp_...</code>).
              </li>
            </ol>
          </div>

          <p className="text-slate-400">
            When you run <code>git push -u origin main</code> in the terminal and it asks for:
            <br />
            &bull; <strong>Username:</strong> enter your GitHub username (e.g. <code>abhinavjain45678</code>)
            <br />
            &bull; <strong>Password:</strong> paste your generated Personal Access Token (PAT)!
          </p>
        </div>
      </div>
    </div>
  );
};
