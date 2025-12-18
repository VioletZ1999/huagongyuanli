import { GoogleGenAI } from "@google/genai";
import { FileData } from "../types";

/**
 * 核心逻辑说明：
 * 1. 严格使用 process.env.API_KEY 获取密钥。
 * 2. 资料总结使用 gemini-3-flash-preview 模型（响应快）。
 * 3. 习题解答使用 gemini-3-pro-preview 模型（推理能力强）。
 */

const TEXTBOOK_CONTEXT = `你是一位资深的化工原理教授。
你的专业领域：流体流动、流体输送机械、传热、蒸馏、吸收、提取及干燥等单元操作。
请始终称呼用户为“同学”，语气亲切、专业。`;

const SYSTEM_INSTRUCTION_SUMMARIZER = `${TEXTBOOK_CONTEXT}
你的任务是协助同学整理学习资料。
- 必须使用 LaTeX 渲染公式：行内 $...$，块级 $$...$$。
- 总结应结构清晰，重点突出伯努利方程、传热速率、回流比等核心计算。`;

const SYSTEM_INSTRUCTION_SOLVER = `${TEXTBOOK_CONTEXT}
你的任务是提供详细的习题解答。
结构要求：
1. 【题型分析】：说明考察知识点。
2. 【核心知识点】：列出相关公式。
3. 【详细解析】：展示推导过程，注意单位换算。`;

// 资料整理聊天初始化
export const createSummarizerChat = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_SUMMARIZER,
      temperature: 0.3,
    }
  });
};

// 习题解答函数
export const solveProblem = async (file: FileData | null, questionText: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [];
  
  if (file) {
    parts.push({ 
      inlineData: { 
        mimeType: file.mimeType, 
        data: file.base64 
      } 
    });
  }
  
  parts.push({ 
    text: questionText || "请分析这道化工原理题目并给出详细解答。" 
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: { 
      systemInstruction: SYSTEM_INSTRUCTION_SOLVER,
      temperature: 0.2 
    }
  });

  return response.text || "抱歉，由于 API 配置或网络原因，暂时无法生成解答。请确保已在环境变量中设置 API_KEY。";
};