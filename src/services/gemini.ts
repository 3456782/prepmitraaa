import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateStudyTask = async (userProfile: any) => {
  const model = "gemini-3-flash-preview";
  const prompt = `You are a study mentor for students preparing for competitive exams in India. 
  User Profile:
  - Exam: ${userProfile.exam}
  - Subjects: ${userProfile.subjects.join(", ")}
  - Daily Target: ${userProfile.dailyTarget} hours
  
  Generate a single, highly motivating daily study task or a small tip for this student. 
  Keep it short (max 2 sentences).`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Focus on your core concepts today. You've got this!";
  } catch (error) {
    console.error("AI Mentor Error:", error);
    return "Stay consistent and keep pushing towards your goal!";
  }
};

export const getExplanation = async (question: string) => {
  const model = "gemini-3-flash-preview";
  const prompt = `Explain this competitive exam related question/topic briefly and clearly: ${question}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "I'm sorry, I couldn't generate an explanation right now.";
  } catch (error) {
    console.error("AI Mentor Error:", error);
    return "Error generating explanation. Please try again.";
  }
};
