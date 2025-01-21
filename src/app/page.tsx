'use client';
import Image from "next/image";
import { useState } from "react";

interface HistoryItem {
  prompt: string;
  imageUrl: string;
  timestamp: number;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const generateImage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      setCurrentImage(data.imageUrl);
      
      // Add to history
      const newHistoryItem = {
        prompt,
        imageUrl: data.imageUrl,
        timestamp: Date.now(),
      };
      setHistory(prev => [newHistoryItem, ...prev]);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 dark:bg-gray-800 overflow-y-auto h-screen p-4">
        <h2 className="text-lg font-bold mb-4">History</h2>
        <div className="space-y-4">
          {history.map((item) => (
            <div 
              key={item.timestamp}
              className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setPrompt(item.prompt);
                setCurrentImage(item.imageUrl);
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 relative">
                  <Image
                    src={item.imageUrl}
                    alt={item.prompt}
                    fill
                    className="rounded-sm object-cover"
                  />
                </div>
                <p className="text-sm truncate">{item.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Enter your prompt here..."
              rows={4}
            />
            <button
              onClick={generateImage}
              disabled={isLoading || !prompt}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate Image'}
            </button>
          </div>

          {/* Image Display */}
          {currentImage && (
            <div className="border rounded-lg p-4 dark:border-gray-600">
              <div className="relative w-full aspect-square">
                <Image
                  src={currentImage}
                  alt={prompt}
                  fill
                  className="rounded-lg object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
