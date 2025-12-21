'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

export function ImageGalleryModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <span className="text-white text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 relative flex items-center justify-center px-16">
        {/* Previous Button */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        {/* Main Image */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative w-full max-w-4xl aspect-[4/3] rounded-lg overflow-hidden">
            {/* Placeholder - replace with actual image when available */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <ImageIcon className="w-24 h-24 text-gray-600" />
            </div>
            {/* Uncomment when actual images are available */}
            {/* <Image
              src={images[currentIndex]}
              alt={`Room image ${currentIndex + 1}`}
              fill
              className="object-contain"
            /> */}
          </div>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="bg-black/80 px-4 py-4">
        <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleThumbnailClick(index)}
              className={`relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                index === currentIndex
                  ? 'ring-2 ring-[hsl(var(--snug-orange))] opacity-100'
                  : 'opacity-50 hover:opacity-75'
              }`}
            >
              {/* Placeholder thumbnail */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-gray-500" />
              </div>
              {/* Uncomment when actual images are available */}
              {/* <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              /> */}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
