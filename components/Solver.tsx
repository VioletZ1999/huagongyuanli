import React, { useState } from 'react';
import { solveProblem } from '../services/geminiService';
import FileUpload from './FileUpload';
import ResultDisplay from './ResultDisplay';
import { FileData } from '../types';

const Solver: React.FC = () => {
  const [file, setFile] = useState<FileData | null>(null);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSolve = async () => {
    if (!question.trim() && !file) return;

    setIsLoading(true);
    setError(null);
    setResult('');

    try {
      const solution = await solveProblem(file, question);
      setResult(solution);
    } catch (err) {
      setError(err instanceof Error ? err.message : "发生了意外错误");
    } finally {
      setIsLoading(false);
    }
  };

  const QuickPrompt = ({ text, actionPrompt }: { text: string, actionPrompt: string }) => (
    <button
      onClick={() => {
        // Only append text, do NOT call handleSolve
        setQuestion(prev => {
          const prefix = prev.trim() ? prev + "\n" : "";
          return `${prefix}【用户指令】：${actionPrompt}`;
        });
      }}
      disabled={isLoading}
      className="px-3 py-1.5 bg-white border border-indigo-100 text-indigo-600 text-xs rounded-full hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-sm"
    >
      {text}
    </button>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-7xl mx-auto">
      {/* Input Section */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-1">化工习题解答</h2>
          <p className="text-sm text-slate-500 mb-6">支持物料衡算、热量衡算、单元操作设备设计等题型。</p>
          
          <div className="space-y-4">
            <FileUpload 
              label="上传习题图片（推荐）"
              selectedFile={file}
              onFileSelect={setFile}
              onClear={() => setFile(null)}
            />

            <div>
              <label htmlFor="question" className="block text-xs font-semibold text-slate-600 uppercase mb-2 ml-1">
                题目描述 / 补充信息
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="在此输入题目文本，或对上传图片的补充描述..."
                className="w-full h-32 p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-400"
              />
              
              {/* Quick Prompts */}
              <div className="mt-3 flex flex-wrap gap-2">
                <QuickPrompt text="💡 提供解题思路" actionPrompt="请只提供这道题的解题思路和关键公式，不需要完整计算过程。" />
                <QuickPrompt text="📝 详细解答" actionPrompt="请提供这道题的完整、详细的计算解答步骤。" />
                <QuickPrompt text="🔄 举一反三" actionPrompt="解答完这道题后，请根据《化工原理》教材，出一道考察相同知识点的类似题目并给出简略答案。" />
              </div>
            </div>

            <button
              onClick={handleSolve}
              disabled={(!file && !question.trim()) || isLoading}
              className={`w-full py-3 px-4 rounded-xl font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-2
                ${(!file && !question.trim()) || isLoading 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
                }`}
            >
              {isLoading ? (
                <>正在推导...</>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3M3.343 15.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                  开始解析
                </>
              )}
            </button>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                 {error}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-800">
           <p className="font-semibold mb-1">📢 结构化解答</p>
           <p>AI 将按照 <b>题型分析</b> → <b>核心知识点</b> → <b>详细解析</b> 的顺序为您呈现答案，助您彻底掌握考点。</p>
        </div>
      </div>

      {/* Output Section */}
      <div className="lg:col-span-8">
        <ResultDisplay 
          content={result} 
          isLoading={isLoading} 
          title="解析过程" 
        />
      </div>
    </div>
  );
};

export default Solver;