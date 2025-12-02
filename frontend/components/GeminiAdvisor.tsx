import React, { useState } from 'react';
import { Sparkles, Send, Bot, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface GeminiAdvisorProps {
  apiKey?: string;
}

export const GeminiAdvisor: React.FC<GeminiAdvisorProps> = ({ apiKey }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse(null);

    try {
      if (!process.env.API_KEY) {
         setResponse("Simülasyon Modu: API Anahtarı eksik. Gerçek bir senaryoda Gemini şu soruyu yanıtlayacaktı: " + prompt);
         setLoading(false);
         return;
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Sen 'SmartMachine Asistanı' adında uzman bir iş makinesi bakım ve filo yönetimi danışmanısın.
        Aşağıdaki soruyu inşaat makineleri bakımı veya lojistiği hakkında net, profesyonel ve Türkçe olarak yanıtla. 
        Mühendis veya kıdemli teknisyen gibi konuş. Soru: ${prompt}`,
      });
      
      setResponse(result.text || "Yanıt oluşturulamadı.");
    } catch (error) {
      console.error(error);
      setResponse("Bakım veritabanına bağlanırken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-smart-yellow w-80 md:w-96 overflow-hidden flex flex-col max-h-[600px]">
        {/* Header */}
        <div className="bg-smart-navy p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-smart-yellow rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="text-smart-navy w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">SmartMachine AI</h3>
            <p className="text-smart-yellow/80 text-xs">Arıza kodu & Bakım asistanı</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 bg-slate-50 h-64 overflow-y-auto">
          {!response && !loading && (
            <div className="text-center text-gray-400 mt-10">
              <Bot className="w-12 h-12 mx-auto mb-2 opacity-50 text-smart-navy" />
              <p className="text-sm">Bana arıza kodları, bakım periyotları veya parça değişimi hakkında sorabilirsin.</p>
            </div>
          )}
          
          {loading && (
             <div className="flex items-center justify-center h-full">
               <Loader2 className="animate-spin text-smart-navy w-8 h-8" />
             </div>
          )}

          {response && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-sm text-gray-700 leading-relaxed">
              {response}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-gray-200 bg-white flex gap-2">
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Örn: CAT 320 yağ değişimi ne zaman?"
            className="flex-1 text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-smart-navy focus:ring-1 focus:ring-smart-navy bg-gray-50"
          />
          <button 
            onClick={handleAsk}
            disabled={loading}
            className="bg-smart-navy text-white p-2 rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};