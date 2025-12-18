
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
 * 灵活初始化 AI 实例
 * 适配第三方代理平台：支持通过 process.env.BASE_URL 修改 API 终点
 */
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  // @ts-ignore - 允许通过环境变量注入 Base URL 以适配第三方中转站
  const baseUrl = process.env.BASE_URL;

  if (!apiKey || apiKey.trim() === "") {
    throw new Error("API_KEY 未配置。请在环境设置中填入您的密钥。");
  }

  // 初始化时传入配置，兼容第三方代理
  return new GoogleGenAI({ 
    apiKey,
    // 如果存在自定义基地址，则使用它（某些 SDK 版本支持此项配置）
    ...(baseUrl ? { baseUrl } : {})
  });
};

export const createSummarizerChat = () => {
  try {
    const ai = getAIInstance();
    return ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_SUMMARIZER,
        temperature: 0.3,
        // 预设思考配置
        thinkingConfig: { thinkingBudget: 8192 }
      }
    });
  } catch (error: any) {
    console.error("Chat Creation Error:", error);
    throw error;
  }
};

export const solveProblem = async (file: FileData | null, questionText: string): Promise<string> => {
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

  // 尝试带思考配置的调用
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: { 
        systemInstruction: SYSTEM_INSTRUCTION_SOLVER,
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 16384 }
      }
    });
    return response.text || "API 返回了空响应。";
  } catch (error: any) {
    console.warn("带思考配置调用失败，尝试普通调用...", error.message);
    
    // 降级方案：如果第三方平台不支持 thinkingConfig，则进行普通调用
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts },
        config: { 
          systemInstruction: SYSTEM_INSTRUCTION_SOLVER,
          temperature: 0.2
        }
      });
      return fallbackResponse.text || "API 返回了空响应。";
    } catch (finalError: any) {
      console.error("所有尝试均失败:", finalError);
      return `❌ API 调用失败\n\n**错误详情**: ${finalError.message}\n\n**建议**: 如果您使用的是第三方中转 API，请确认该平台是否支持 'gemini-3-pro-preview' 模型名，并检查网络代理设置。`;
    }
  }
};
