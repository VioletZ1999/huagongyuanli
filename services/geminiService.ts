
import { GoogleGenAI } from "@google/genai";
import { FileData } from "../types";

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

/**
 * 初始化 AI 实例
 * 始终尝试使用 process.env.API_KEY
 */
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    throw new Error("API_KEY 环境变量未设置。请确保您的部署环境已正确配置该变量。");
  }

  // 移除了对 sk- 的拦截，直接信任用户提供的密钥
  return new GoogleGenAI({ apiKey });
};

export const createSummarizerChat = () => {
  try {
    const ai = getAIInstance();
    return ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_SUMMARIZER,
        temperature: 0.3,
        thinkingConfig: { thinkingBudget: 8192 }
      }
    });
  } catch (error: any) {
    console.error("Chat Creation Error:", error);
    throw error;
  }
};

export const solveProblem = async (file: FileData | null, questionText: string): Promise<string> => {
  try {
    const ai = getAIInstance();
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
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 16384 }
      }
    });

    if (!response.text) {
      throw new Error("API 返回了空响应，请检查模型可用性。");
    }

    return response.text;
  } catch (error: any) {
    console.error("solveProblem Error:", error);
    // 捕获并返回具体的 API 错误信息
    const errorMsg = error.message || "未知错误";
    if (errorMsg.includes("401")) return "⚠️ 认证失败：API Key 无效或已过期。";
    if (errorMsg.includes("404")) return "⚠️ 模型未找到：请确认密钥拥有 gemini-3-pro-preview 的访问权限。";
    return `❌ 运行出错：${errorMsg}`;
  }
};
