'use client';

import { useEffect, useState } from 'react';

export default function TestImagesPage() {
  const [villas, setVillas] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/villa')
      .then(res => res.json())
      .then(data => {
        console.log('✅ Backend response:', data);
        setVillas(data.villas || []);
      })
      .catch(err => console.error('❌ Fetch error:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">🔍 Image Debug Page</h1>
      
      <div className="space-y-8">
        {villas.map((villa, idx) => (
          <div key={idx} className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">{villa.name}</h2>
            
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Images array:</p>
              <pre className="bg-black p-4 rounded text-green-400 text-xs overflow-auto">
                {JSON.stringify(villa.images, null, 2)}
              </pre>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {villa.images?.map((img: string, imgIdx: number) => (
                <div key={imgIdx} className="space-y-2">
                  <p className="text-white text-xs">Image {imgIdx + 1}</p>
                  <p className="text-gray-400 text-xs break-all">{img}</p>
                  
                  {/* Test 1: Regular img with backend URL */}
                  <div className="border border-blue-500 p-2">
                    <p className="text-blue-400 text-xs mb-1">Test 1: Backend URL</p>
                    <img
                      src={`http://localhost:4000${img}`}
                      alt={`Test 1 - ${villa.name}`}
                      className="w-full h-32 object-cover bg-red-500"
                      onLoad={() => console.log(`✅ Image loaded: http://localhost:4000${img}`)}
                      onError={(e) => {
                        console.error(`❌ Image failed: http://localhost:4000${img}`);
                        e.currentTarget.style.border = '3px solid red';
                      }}
                    />
                  </div>

                  {/* Test 2: Direct URL (if it's already full URL) */}
                  <div className="border border-green-500 p-2">
                    <p className="text-green-400 text-xs mb-1">Test 2: Direct URL</p>
                    <img
                      src={img}
                      alt={`Test 2 - ${villa.name}`}
                      className="w-full h-32 object-cover bg-red-500"
                      onLoad={() => console.log(`✅ Image loaded (direct): ${img}`)}
                      onError={(e) => {
                        console.error(`❌ Image failed (direct): ${img}`);
                        e.currentTarget.style.border = '3px solid red';
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Test swipeDeckImage if exists */}
            {villa.swipeDeckImage && (
              <div className="mt-4">
                <p className="text-yellow-400 text-sm mb-2">Swipe Deck Image:</p>
                <p className="text-gray-400 text-xs mb-2">{villa.swipeDeckImage}</p>
                <img
                  src={`http://localhost:4000${villa.swipeDeckImage}`}
                  alt="Swipe deck"
                  className="w-64 h-48 object-cover bg-red-500"
                  onLoad={() => console.log('✅ Swipe deck loaded')}
                  onError={() => console.error('❌ Swipe deck failed')}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {villas.length === 0 && (
        <p className="text-white text-center">Loading villas...</p>
      )}
    </div>
  );
}
