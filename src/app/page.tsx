'use client';
import Image from "next/image";
import { useState, useEffect } from "react";

interface HistoryItem {
  prompt: string;
  image_url: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const appendHistory = async () => {
    try {
      const response = await fetch(`https://sundai-backend-706780332553.us-east4.run.app/history?skip=0&limit=1`);
      const data = await response.json();
      
      // Append new history items to the existing history
      setHistory(prevHistory => [...data, ... prevHistory]);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };
  const fetchHistory = async (skip: number = 0, limit: number = 20) => {
    try {
      const response = await fetch(`https://sundai-backend-706780332553.us-east4.run.app/history?skip=${skip}&limit=${limit}`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

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
      
      // Save to backend
      await saveHistory({ prompt: prompt, image_url: data.imageUrl });

    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHistory = async (item: { prompt: string; image_url: string }) => {
    try {
      console.log( JSON.stringify(item));
      await fetch('https://sundai-backend-706780332553.us-east4.run.app/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'content-type': 'image/webp'
        },
        body: JSON.stringify(item),
      });
      // Fetch history to append the new image
      await appendHistory(); // Fetch the latest history
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const ImageDisplay = ({ url, alt, className, width = 0, height = 0 }: { 
    url: string, 
    alt: string, 
    className?: string,
    width?: number,
    height?: number 
  }) => {
    const [blobUrl, setBlobUrl] = useState<string>('');

    useEffect(() => {
      const convertToImage = async () => {
        try {
          const response = await fetch(url, {
            method: 'GET',
            cache: 'force-cache', // Use cached response if available
          });
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(
            new Blob([blob], { type: 'image/webp' })
          );
          setBlobUrl(objectUrl);
        } catch (error) {
          console.error('Error converting image:', error);
        }
      };
      
      convertToImage();
      return () => {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      };
    }, [url]);

    if (!url) return null;
    return width && height ? (
      <Image
        src={url}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    ) : (
      <Image
        src={url}
        alt={alt}
        fill
        className={className}
      />
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 dark:bg-gray-800 overflow-y-auto h-screen p-4">
        <h2 className="text-lg font-bold mb-4">History</h2>
        <div className="space-y-4">
          {history.map((item, index) => (
            <div 
              key={index}
              className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setPrompt(item.prompt);
                setCurrentImage(item.image_url);
              }}
            >
              <div className="flex items-center gap-2 mb-2 h-12">
                <div className="w-10 h-10 relative">
                  <ImageDisplay
                    url={item.image_url}
                    alt={item.prompt}
                    width={40}
                    height={40}
                    className="rounded-sm object-cover"
                  />
                </div>
                <p className="text-xs w-32 max-h-12 overflow-hidden text-ellipsis whitespace-normal">{item.prompt}</p>
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
                <ImageDisplay
                  url={currentImage}
                  alt={prompt}
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
