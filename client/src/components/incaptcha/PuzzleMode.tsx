import { useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface PuzzleModeProps {
  backgroundImage: string;
  puzzlePiece: string;
  correctX: number;
  correctY: number;
  onSubmit: (isCorrect: boolean, accuracy: number) => void;
  disabled?: boolean;
}

export function PuzzleMode({
  backgroundImage,
  puzzlePiece,
  correctX,
  correctY,
  onSubmit,
  disabled
}: PuzzleModeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaced, setIsPlaced] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    
    const finalX = x.get();
    const finalY = y.get();
    
    // Calculate distance from correct position
    const distance = Math.sqrt(
      Math.pow(finalX - correctX, 2) + Math.pow(finalY - correctY, 2)
    );
    
    // Snap threshold (within 20px)
    const snapThreshold = 20;
    const isCorrect = distance < snapThreshold;
    
    if (isCorrect) {
      // Snap to correct position with spring animation
      x.set(correctX);
      y.set(correctY);
      setIsPlaced(true);
      
      // Calculate accuracy score (0-100)
      const accuracy = Math.max(0, 100 - distance);
      
      setTimeout(() => {
        onSubmit(true, accuracy);
      }, 300);
    } else {
      // Reset to start position
      x.set(0);
      y.set(0);
    }
  }, [x, y, correctX, correctY, onSubmit]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-base font-semibold text-foreground" data-testid="text-prompt">
          Drag the piece to complete the image
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Place the puzzle piece in the correct position
        </p>
      </div>

      <Card className="relative w-full aspect-square overflow-hidden bg-muted">
        {/* Background image with missing piece */}
        <img
          src={backgroundImage}
          alt="Puzzle background"
          className="w-full h-full object-cover"
        />
        
        {/* Outline showing where piece should go */}
        <div
          className="absolute border-2 border-dashed border-primary/40 rounded-md bg-background/40 backdrop-blur-sm"
          style={{
            left: `${correctX}px`,
            top: `${correctY}px`,
            width: '80px',
            height: '80px'
          }}
        >
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            Drop here
          </div>
        </div>

        {/* Draggable puzzle piece */}
        <motion.div
          drag={!disabled && !isPlaced}
          dragMomentum={false}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          style={{ x, y }}
          className={`absolute bottom-4 left-4 cursor-move ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          whileHover={!disabled && !isPlaced ? { scale: 1.05 } : {}}
          whileTap={!disabled && !isPlaced ? { scale: 0.95 } : {}}
          data-testid="draggable-puzzle-piece"
        >
          <div className="w-20 h-20 rounded-md shadow-lg border-2 border-primary overflow-hidden hover-elevate">
            <img
              src={puzzlePiece}
              alt="Puzzle piece"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        </motion.div>

        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-primary/5 pointer-events-none"
          />
        )}
      </Card>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: isPlaced ? '100%' : '0%' }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-sm text-muted-foreground" data-testid="text-progress">
          {isPlaced ? 'Complete!' : 'Drag to solve'}
        </span>
      </div>
    </div>
  );
}
