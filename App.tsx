import React, { useState } from 'react';
import { AppMode } from './types';
import Summarizer from './components/Summarizer';
import Solver from './components/Solver';

// 化学元素背景装饰组件
const ChemicalBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    {/* 原子结构 - 左上 */}
    <div className="absolute top-20 -left-10 text-indigo-100 opacity-60 animate-float-slow">
      <svg width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
        <circle cx="12" cy="12" r="3" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(0 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
      </svg>
    </div>

    {/* 烧瓶 - 右下 */}
    <div className="absolute bottom-10 -right-10 text-blue-100 opacity-60 animate-float-delayed">
      <svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
        <path d="M10 2v7.31l-4.57 6.35C5.07 16.14 5 16.56 5 17c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3 0-.44-.07-.86-.43-1.35L14 9.31V2h-4z" />
        <path d="M10 6h4" />
        <path d="M9 14h6" opacity="0.5"/>
        <circle cx="11" cy="18" r="1" fill="currentColor" opacity="0.5"/>
        <circle cx="13" cy="16" r="1" fill="currentColor" opacity="0.5"/>
      </svg>
    </div>

    {/* 苯环/分子结构 - 中间偏左 */}
    <div className="absolute top-1/2 left-10 text-slate-100 opacity-50">
      <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" />
        <circle cx="12" cy="12" r="6" />
      </svg>
    </div>

     {/* DNA - 右上 */}
     <div className="absolute top-32 right-20 text-teal-50 opacity-40 animate-pulse-slow">
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M2 15c6.667-6 13.333 0 20-6" />
        <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
        <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
        <path d="M17 6l-2.5-2.5" />
        <path d="M14 8l-1-1" />
        <path d="M7 18l2.5 2.5" />
        <path d="M3.5 14.5l-1 1" />
        <path d="M20 9l-1 1" />
        <path d="M14.5 16.5l-1 1" />
      </svg>
    </div>
  </div>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);

  const renderHome = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 relative z-10">
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6 tracking-tight">
          掌握<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">化工原理</span>的核心奥秘
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          您的专属 AI 助教，专注于解决流体力学、传热传质及分离工程的学习难题。无论是复习备考还是题目攻坚，都能游刃有余。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
        {/* Card 1: Summarizer */}
        <div 
          onClick={() => setMode(AppMode.SUMMARIZER)}
          className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-indigo-600">
               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
               <polyline points="14 2 14 8 20 8"></polyline>
               <line x1="16" y1="13" x2="8" y2="13"></line>
               <line x1="16" y1="17" x2="8" y2="17"></line>
               <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">资料整理</h2>
            <p className="text-slate-500 mb-6">
              上传化工单元操作、反应工程等课程资料。AI 将自动梳理知识脉络，总结核心定律（如伯努利方程）和重点概念。
            </p>
            <span className="inline-flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all">
              开始整理 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            </span>
          </div>
        </div>

        {/* Card 2: Solver */}
        <div 
          onClick={() => setMode(AppMode.SOLVER)}
          className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-blue-600">
               <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3M3.343 15.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">题目解答</h2>
            <p className="text-slate-500 mb-6">
              遇到复杂的物料衡算或设备选型难题？上传题目，获取包含详细推导步骤和工程背景的专业解答。
            </p>
            <span className="inline-flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
              开始解答 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            </span>
          </div>
        </div>

        {/* Feature List / Footer Element */}
        <div className="md:col-span-2 mt-12 flex justify-center space-x-8 text-slate-400">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            <span>物料/热量衡算</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            <span>LaTeX 公式渲染</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            <span>工程实例分析</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 text-slate-900 pb-12 font-sans selection:bg-indigo-100 selection:text-indigo-800 relative">
      
      <ChemicalBackground />

      {/* Navbar */}
      <nav className="border-b border-white/50 sticky top-0 z-50 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setMode(AppMode.HOME)}
            >
              <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-indigo-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22 10v6M2 10v6"/><path d="M20 20.405l-2-10.405H6L4 20.405"/><path d="M1 14.07h22"/><path d="M9 10v4.07"/><path d="M15 10v4.07"/></svg>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">化工原理<span className="text-indigo-600"> AI</span></span>
            </div>
            
            <div className="flex items-center space-x-6">
              {mode !== AppMode.HOME && (
                <button 
                  onClick={() => setMode(AppMode.HOME)}
                  className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  返回首页
                </button>
              )}
              <div className="hidden sm:block h-4 w-px bg-slate-300"></div>
              <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">Pro v1.0</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-6 px-4 sm:px-6 lg:px-8 relative z-10">
        {mode === AppMode.HOME && renderHome()}
        
        {mode !== AppMode.HOME && (
          <div className="max-w-7xl mx-auto animate-fade-in">
             <div className="mb-6 flex items-center text-sm text-slate-500">
                <span className="hover:text-indigo-600 cursor-pointer" onClick={() => setMode(AppMode.HOME)}>首页</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-2 text-slate-300"><polyline points="9 18 15 12 9 6"/></svg>
                <span className="text-slate-800 font-medium">{mode === AppMode.SUMMARIZER ? '资料整理' : '题目解答'}</span>
             </div>
             
            {mode === AppMode.SUMMARIZER ? <Summarizer /> : <Solver />}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;