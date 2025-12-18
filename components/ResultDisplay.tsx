import React from 'react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface ResultDisplayProps {
  content: string;
  isLoading: boolean;
  title: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ content, isLoading, title }) => {
  if (isLoading) {
    return (
      <div className="w-full p-8 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-600 font-medium animate-pulse">AI 正在思考...</p>
        <p className="text-slate-400 text-sm mt-2">正在分析您的请求</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="w-full p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <p className="text-slate-500 font-medium">结果展示区</p>
        <p className="text-slate-400 text-sm mt-1 max-w-xs">
          上传文件并提交，即可在此查看 AI 生成的{title}。
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          {title}
        </h3>
        <button 
          onClick={() => navigator.clipboard.writeText(content)}
          className="text-xs font-medium px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          复制
        </button>
      </div>
      <div className="p-6 overflow-y-auto custom-scrollbar">
        <div className="prose prose-slate prose-indigo max-w-none leading-relaxed prose-headings:text-slate-800 prose-p:text-slate-600 prose-strong:text-slate-700">
          <Markdown 
            remarkPlugins={[remarkMath]} 
            rehypePlugins={[rehypeKatex]}
          >
            {content}
          </Markdown>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;