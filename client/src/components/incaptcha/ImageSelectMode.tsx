import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ImageSelectModeProps {
  images: string[];
  prompt: string;
  onSubmit: (selectedIndices: number[]) => void;
  disabled?: boolean;
}

export function ImageSelectMode({ images, prompt, onSubmit, disabled }: ImageSelectModeProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const toggleSelection = useCallback((index: number) => {
    if (disabled) return;
    
    setSelectedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, [disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleSelection(index);
    }
  }, [toggleSelection]);

  const handleSubmit = useCallback(() => {
    if (selectedIndices.size > 0 && !disabled) {
      onSubmit(Array.from(selectedIndices));
    }
  }, [selectedIndices, onSubmit, disabled]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-base font-semibold text-foreground" data-testid="text-prompt">
          {prompt}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Click all matching images
        </p>
      </div>

      <div
        className="grid grid-cols-3 gap-3"
        role="grid"
        aria-label="Image selection grid"
      >
        {images.map((imageUrl, index) => {
          const isSelected = selectedIndices.has(index);
          
          return (
            <motion.div
              key={index}
              whileHover={{ scale: disabled ? 1 : 1.03 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Card
                role="gridcell"
                tabIndex={disabled ? -1 : 0}
                className={`relative aspect-square overflow-hidden cursor-pointer border-2 transition-all hover-elevate ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'border-border'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => toggleSelection(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-selected={isSelected}
                aria-label={`Image ${index + 1}`}
                data-testid={`image-tile-${index}`}
              >
                <img
                  src={imageUrl}
                  alt={`Challenge image ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <Check className="w-6 h-6 text-primary-foreground" strokeWidth={3} />
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span data-testid="text-selection-count">
          {selectedIndices.size} selected
        </span>
        <button
          onClick={handleSubmit}
          disabled={selectedIndices.size === 0 || disabled}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover-elevate active-elevate-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          data-testid="button-submit"
        >
          Verify
        </button>
      </div>
    </div>
  );
}
