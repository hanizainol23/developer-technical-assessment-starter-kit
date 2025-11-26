import React, { useState } from 'react';

export interface PropertyCarouselProps {
  images: string[];
  alt?: string;
}

export const PropertyCarousel: React.FC<PropertyCarouselProps> = ({ images, alt = 'Property' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayImages = images && images.length > 0 ? images : ['https://via.placeholder.com/600x400?text=No+Images'];

  const prev = () => {
    setCurrentIndex((currentIndex - 1 + displayImages.length) % displayImages.length);
  };

  const next = () => {
    setCurrentIndex((currentIndex + 1) % displayImages.length);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative bg-gray-200 rounded-lg overflow-hidden">
        <img
          src={displayImages[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          className="w-full h-96 object-cover"
          onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found')}
        />
      </div>

      {displayImages.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-2 rounded-r hover:bg-opacity-70"
          >
            ❮
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-2 rounded-l hover:bg-opacity-70"
          >
            ❯
          </button>
        </>
      )}

      <div className="flex justify-center gap-2 mt-4">
        {displayImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition ${
              idx === currentIndex ? 'bg-blue-600' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>

      {displayImages.length > 1 && (
        <p className="text-center text-sm text-gray-600 mt-2">
          {currentIndex + 1} / {displayImages.length}
        </p>
      )}
    </div>
  );
};
