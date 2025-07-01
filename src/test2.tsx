import React, { useState } from "react";

interface QuoteResponse {
  q: string;
}

function Test2() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const fetchQuote = async (): Promise<string> => {
    try {
      const response = await fetch("http://localhost:3001/api/quote");
      const data = await response.json() as QuoteResponse[];
      if (!data || !data[0] || !data[0].q) {
        return "No quotes available at the moment.";
      }
      return data[0].q;
    } catch (error) {
      console.error("Error fetching quote:", error);
      return "Failed to fetch quote. Please try again.";
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResponse("");
    setIsTyping(true);

    const newQuote = await fetchQuote();
    
    // Simulate streaming response
    for (let i = 0; i < newQuote.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50)); // Delay between letters
      setResponse(prev => prev + newQuote[i]);
    }

    setIsTyping(false);
    setLoading(false);
  };

  const handleClear = () => {
    setResponse("");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#00ff87] to-[#60efff] bg-clip-text text-transparent">
            Quote Generator
          </h1>
          <p className="text-gray-400 text-lg">Click the button to generate a new quote</p>
        </header>

        <main className="flex flex-col h-[calc(100vh-12rem)]">
          <div className="flex gap-4 justify-center sticky bottom-0 bg-[#0a0a0a] py-4">
            <button
              disabled={loading}
              onClick={handleGenerate}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#00ff87] to-[#60efff] text-black font-semibold hover:translate-y-[-2px] active:translate-y-0 transition-transform"
            >
              Generate Quote
            </button>
            <button
              disabled={loading}
              onClick={handleClear}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#00ff87] to-[#60efff] text-black font-semibold hover:translate-y-[-2px] active:translate-y-0 transition-transform"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto mb-4">
            {response && (
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
                <p className="text-gray-200 leading-relaxed text-xl italic">
                  "{response}"
                  {isTyping && <span className="animate-pulse">▋</span>}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Test2; 