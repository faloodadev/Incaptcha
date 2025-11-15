
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { RefreshCw, Check } from 'lucide-react';

interface JigsawPuzzleProps {
  challengeId: string;
  challengeToken: string;
  onComplete: (accuracy: number) => void;
  onRefresh?: () => void;
  disabled?: boolean;
}

export function JigsawPuzzle({
  challengeId,
  challengeToken,
  onComplete,
  onRefresh,
  disabled
}: JigsawPuzzleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  // Random position for puzzle piece gap
  const [gapPosition] = useState(() => ({
    x: Math.floor(Math.random() * 200) + 50,
    y: Math.floor(Math.random() * 100) + 50,
  }));

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Generate swirl pattern (similar to ARCaptcha)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw colorful swirl pattern
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let angle = 0; angle < Math.PI * 8; angle += 0.1) {
      const radius = angle * 8;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      const hue = (angle * 50) % 360;
      ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      
      if (angle > 0.1) {
        ctx.beginPath();
        const prevRadius = (angle - 0.1) * 8;
        const prevX = centerX + Math.cos(angle - 0.1) * prevRadius;
        const prevY = centerY + Math.sin(angle - 0.1) * prevRadius;
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
    
    // Cut out puzzle piece area
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'black';
    ctx.fillRect(gapPosition.x, gapPosition.y, 60, 60);
    ctx.globalCompositeOperation = 'source-over';
  }, [gapPosition]);

  const handleDragEnd = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    setAttempts(prev => prev + 1);
    
    const finalX = x.get();
    const finalY = y.get();
    
    // Calculate distance from correct position
    const distance = Math.sqrt(
      Math.pow(finalX - gapPosition.x, 2) + Math.pow(finalY - gapPosition.y, 2)
    );
    
    // Snap threshold (within 25px for jigsaw)
    const snapThreshold = 25;
    const isCorrect = distance < snapThreshold;
    
    if (isCorrect) {
      // Snap to correct position
      x.set(gapPosition.x);
      y.set(gapPosition.y);
      setIsComplete(true);
      
      // Calculate accuracy (100 = perfect, decreases with distance and attempts)
      const baseAccuracy = Math.max(0, 100 - distance);
      const attemptPenalty = Math.min(30, (attempts - 1) * 10);
      const finalAccuracy = Math.max(50, baseAccuracy - attemptPenalty);
      
      setTimeout(() => {
        onComplete(Math.round(finalAccuracy));
      }, 500);
    } else {
      // Snap back to start with spring animation
      x.set(0);
      y.set(0);
    }
  }, [x, y, gapPosition, attempts, onComplete]);

  return (
    <div className="w-full max-w-[400px] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Security Challenge</h3>
          <p className="text-xs text-muted-foreground">Drag the piece to complete the puzzle</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={disabled || isComplete}
            className="p-2 hover:bg-muted rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Puzzle Container */}
      <div className="relative w-full aspect-square bg-white dark:bg-card rounded-lg border-2 border-border overflow-hidden shadow-lg">
        {/* Background swirl pattern with gap */}
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Gap outline indicator */}
        <div
          className="absolute border-2 border-dashed border-primary/40 bg-background/60 backdrop-blur-sm rounded-sm flex items-center justify-center"
          style={{
            left: `${gapPosition.x}px`,
            top: `${gapPosition.y}px`,
            width: '60px',
            height: '60px'
          }}
        >
          <div className="text-xs text-muted-foreground font-medium">Drop</div>
        </div>

        {/* Draggable puzzle piece */}
        <motion.div
          drag={!disabled && !isComplete}
          dragMomentum={false}
          dragElastic={0.1}
          dragConstraints={{ left: -50, right: 350, top: -50, bottom: 350 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          style={{ x, y }}
          className={`absolute bottom-4 left-4 cursor-move ${disabled || isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
          whileHover={!disabled && !isComplete ? { scale: 1.05 } : {}}
          whileTap={!disabled && !isComplete ? { scale: 0.95 } : {}}
          initial={{ x: 0, y: 0 }}
        >
          <div className="relative w-[60px] h-[60px] rounded-sm shadow-2xl border-4 border-primary overflow-hidden bg-white dark:bg-card">
            {/* Puzzle piece pattern (extracted from same swirl) */}
            <canvas
              width={60}
              height={60}
              ref={(canvas) => {
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                
                // Draw the same pattern but offset to match gap position
                const offsetX = -gapPosition.x;
                const offsetY = -gapPosition.y;
                
                for (let angle = 0; angle < Math.PI * 8; angle += 0.1) {
                  const radius = angle * 8;
                  const x = 200 + Math.cos(angle) * radius + offsetX;
                  const y = 200 + Math.sin(angle) * radius + offsetY;
                  
                  const hue = (angle * 50) % 360;
                  ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
                  ctx.lineWidth = 12;
                  ctx.lineCap = 'round';
                  
                  if (angle > 0.1 && x >= 0 && x <= 60 && y >= 0 && y <= 60) {
                    ctx.beginPath();
                    const prevRadius = (angle - 0.1) * 8;
                    const prevX = 200 + Math.cos(angle - 0.1) * prevRadius + offsetX;
                    const prevY = 200 + Math.sin(angle - 0.1) * prevRadius + offsetY;
                    ctx.moveTo(prevX, prevY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                  }
                }
              }}
              className="w-full h-full"
            />
            
            {isComplete && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 bg-primary/20 flex items-center justify-center"
              >
                <Check className="w-6 h-6 text-primary" strokeWidth={3} />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Drag overlay */}
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-primary/5 pointer-events-none"
          />
        )}
      </div>

      {/* Attempts indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Attempts: {attempts}</span>
        {isComplete && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-primary font-semibold"
          >
            ✓ Puzzle Complete
          </motion.span>
        )}
      </div>
    </div>
  );
}
