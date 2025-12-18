import React, { useState, useEffect } from 'react';
import { AppMode } from './types';
import Summarizer from './components/Summarizer';
import Solver from './components/Solver';

const ChemicalBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute top-20 -left-10 text-indigo-100 opacity-60 animate-float">
      <svg width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
        <circle cx="12" cy="12" r="3" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(0 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
      </svg>
    </div>
    <div className="absolute bottom-10 -right-10 text-blue-100 opacity-60">
      <svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
        <path d="M10 2v7.31l-4.57 6.35C5.07 16.14 5 16.56 5 17c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3 0-.44-.07-.86-.43-1.35L14 9.31V2h-4z" />
      </svg>
    </div>
  </div>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [isApiKeyReady, setIsApiKeyReady] = useState(!!process.env.API_KEY);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && !process.env.API_KEY) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsApiKeyReady(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleOpenSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setIsApiKeyReady(true); // 假设选择成功并继续
    }
  };

  const renderHome = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 relative z-10">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6 tracking-tight">
          掌握<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">化工原理</span>的核心奥秘
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          您的专属 AI 助教，专注于解决流体力学、传热传质及分离工程的学习难题。
        </p>
        
        {!isApiKeyReady && (
          <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl max-w-md mx-auto">
            <p className="text-amber-800 text-sm mb-4 font-medium">检测到 API 密钥未配置，请先授权以开启 AI 功能：</p>
            <button 
              onClick={handleOpenSelectKey}
              className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold shadow-md hover:bg-amber-700 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              配置 API 密钥
            </button>
            <p className="mt-4 text-[10px] text-amber-600">注意：请使用 Google Gemini 密钥 (AIza...)。详细指南请参考 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">计费文档</a>。</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
        <div 
          onClick={() => isApiKeyReady && setMode(AppMode.SUMMARIZER)}
          className={`group relative bg-white rounded-3xl p-8 shadow-xl border border-slate-100 transition-all duration-300 ${isApiKeyReady ? 'cursor-pointer hover:-translate-y-2' : 'opacity-60 grayscale cursor-not-allowed'}`}
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-3">资料整理</h2>
          <p className="text-slate-500 mb-6">上传课程资料，AI 自动梳理知识脉络。</p>
          <span className="text-indigo-600 font-semibold">开始整理 →</span>
        </div>

        <div 
          onClick={() => isApiKeyReady && setMode(AppMode.SOLVER)}
          className={`group relative bg-white rounded-3xl p-8 shadow-xl border border-slate-100 transition-all duration-300 ${isApiKeyReady ? 'cursor-pointer hover:-translate-y-2' : 'opacity-60 grayscale cursor-not-allowed'}`}
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-3">题目解答</h2>
          <p className="text-slate-500 mb-6">上传复杂题目，获取详细的工程推导步骤。</p>
          <span className="text-blue-600 font-semibold">开始解答 →</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 relative overflow-x-hidden">
      <ChemicalBackground />
      <nav className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setMode(AppMode.HOME)}>
            <span className="font-bold text-xl">化工原理<span className="text-indigo-600"> AI</span></span>
          </div>
          <div className="flex items-center gap-4">
            {mode !== AppMode.HOME && (
              <button onClick={() => setMode(AppMode.HOME)} className="text-sm text-slate-500 hover:text-indigo-600">返回首页</button>
            )}
            <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">Pro v1.0</span>
          </div>
        </div>
      </nav>

      <main className="pt-6 px-4 relative z-10">
        {mode === AppMode.HOME ? renderHome() : (
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 text-xs text-slate-400">
              <span className="cursor-pointer" onClick={() => setMode(AppMode.HOME)}>首页</span> / {mode === AppMode.SUMMARIZER ? '资料整理' : '题目解答'}
            </div>
            {mode === AppMode.SUMMARIZER ? <Summarizer /> : <Solver />}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;