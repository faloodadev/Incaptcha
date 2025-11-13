import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ImageSelectModeProps {
  images: string[];
  prompt: string;
  onSubmit: (selectedIndices: number[]) => void;
  disabled?: boolean;
}

export function ImageSelectMode({ images, prompt, onSubmit, disabled }: ImageSelectModeProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
    <div className="space-y-5">
      {/* Prompt with Gradient Accent */}
      <motion.div 
        className="text-center relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 blur-xl rounded-lg" />
        <h3 className="relative text-base font-semibold text-foreground mb-1 flex items-center justify-center gap-2" data-testid="text-prompt">
          <Sparkles className="w-4 h-4 text-primary" />
          {prompt}
        </h3>
        <p className="text-sm text-muted-foreground">
          Select all matching images
        </p>
      </motion.div>

      {/* Image Grid with Holographic Effects */}
      <div
        className="grid grid-cols-3 gap-3"
        role="grid"
        aria-label="Image selection grid"
      >
        {images.map((imageUrl, index) => {
          const isSelected = selectedIndices.has(index);
          const isHovered = hoveredIndex === index;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                type: 'spring',
                stiffness: 300,
                damping: 25
              }}
              whileHover={disabled ? {} : { 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={disabled ? {} : { 
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
            >
              <div
                role="gridcell"
                tabIndex={disabled ? -1 : 0}
                className={`relative aspect-square overflow-hidden rounded-lg cursor-pointer transition-all duration-300 ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => toggleSelection(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-selected={isSelected}
                aria-label={`Image ${index + 1}`}
                data-testid={`image-tile-${index}`}
              >
                {/* Holographic Border Effect */}
                <div className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${
                  isSelected ? 'opacity-100' : isHovered ? 'opacity-50' : 'opacity-0'
                }`}>
                  <div className="absolute inset-[-2px] rounded-lg bg-gradient-to-br from-primary via-secondary to-primary opacity-70 blur-sm" />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary via-secondary to-primary" />
                </div>

                {/* Image Container */}
                <Card className={`relative h-full border-0 bg-card/50 backdrop-blur-sm overflow-hidden transition-transform duration-300 ${
                  isSelected ? 'scale-[0.97]' : 'scale-100'
                }`}>
                  <img
                    src={imageUrl}
                    alt={`Challenge image ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Hover Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered && !isSelected ? 0.1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-gradient-to-br from-primary to-secondary"
                  />

                  {/* Selection Overlay with Glassmorphism */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 400, 
                        damping: 20 
                      }}
                      className="absolute inset-0 glass-strong flex items-center justify-center"
                    >
                      {/* Holographic Glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 animate-pulse" />
                      
                      {/* Check Icon */}
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          type: 'spring', 
                          stiffness: 500, 
                          damping: 15,
                          delay: 0.05
                        }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-md opacity-60" />
                        <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl">
                          <Check className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </Card>

                {/* Corner Accent (Subtle) */}
                {!isSelected && (
                  <motion.div
                    animate={{ 
                      opacity: isHovered ? 1 : 0,
                      scale: isHovered ? 1 : 0.8
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg"
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action Bar with Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="flex justify-between items-center glass rounded-lg p-3"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: selectedIndices.size > 0 ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.4 }}
            className={`w-2 h-2 rounded-full ${
              selectedIndices.size > 0 
                ? 'bg-gradient-to-r from-primary to-secondary' 
                : 'bg-muted-foreground/30'
            }`}
          />
          <span className="text-sm font-medium text-foreground" data-testid="text-selection-count">
            {selectedIndices.size} selected
          </span>
        </div>
        
        <motion.button
          onClick={handleSubmit}
          disabled={selectedIndices.size === 0 || disabled}
          whileHover={selectedIndices.size > 0 && !disabled ? { 
            scale: 1.02,
            transition: { duration: 0.2 }
          } : {}}
          whileTap={selectedIndices.size > 0 && !disabled ? { 
            scale: 0.98,
            transition: { duration: 0.1 }
          } : {}}
          className={`relative px-5 py-2 rounded-lg font-medium overflow-hidden transition-all duration-300 ${
            selectedIndices.size === 0 || disabled
              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg group'
          }`}
          data-testid="button-verify"
        >
          {selectedIndices.size > 0 && !disabled && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.div
                animate={{ 
                  x: ['-100%', '100%'],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            </>
          )}
          <span className="relative flex items-center gap-1.5">
            Verify
            {selectedIndices.size > 0 && <Sparkles className="w-3.5 h-3.5" />}
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}
