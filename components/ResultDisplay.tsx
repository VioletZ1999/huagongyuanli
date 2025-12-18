
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
      <div className="w-full p-8 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-600 font-bold text-lg animate-pulse">AI 导师正在深度推导</p>
        <p className="text-slate-400 text-sm mt-2 max-w-xs text-center leading-relaxed">
          正在为您进行化工物料/热量衡算，请稍候...
        </p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="w-full p-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6 text-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
        </div>
        <p className="text-slate-500 font-bold text-lg">解析结果展示区</p>
        <p className="text-slate-400 text-sm mt-2 max-w-xs leading-relaxed">
          在左侧上传习题图片或输入文字描述，点击“开始解析”即可在此获取详细推导过程。
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
      <div className="px-6 py-4 border-b border-slate-100 bg-white flex justify-between items-center sticky top-0 z-10 backdrop-blur-md bg-white/90">
        <h3 className="font-bold text-slate-800 flex items-center gap-2.5">
          <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
          {title}
        </h3>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(content);
            // 可以在此处添加一个轻量的成功提示
          }}
          className="text-xs font-bold px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          复制全文
        </button>
      </div>
      <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
        <div className="prose prose-slate prose-indigo max-w-none leading-relaxed prose-headings:text-slate-900 prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-8 prose-p:text-slate-700 prose-strong:text-indigo-900 first:prose-headings:mt-0">
          <Markdown 
            remarkPlugins={[remarkMath]} 
            rehypePlugins={[rehypeKatex]}
          >
            {content}
          </Markdown>
        </div>
      </div>
      <div className="px-6 py-3 bg-white border-t border-slate-100 text-[10px] text-slate-400 text-center italic">
        计算结果由 AI 生成，请根据实际工程经验进行复核
      </div>
    </div>
  );
};

export default ResultDisplay;
