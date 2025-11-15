
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, useMotionValue, PanInfo } from 'framer-motion';
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
  
  // Random positions for 2 puzzle pieces
  const [pieces] = useState(() => [
    {
      id: 1,
      gapX: Math.floor(Math.random() * 150) + 50,
      gapY: Math.floor(Math.random() * 80) + 30,
      x: useMotionValue(0),
      y: useMotionValue(0),
      placed: false
    },
    {
      id: 2,
      gapX: Math.floor(Math.random() * 150) + 220,
      gapY: Math.floor(Math.random() * 80) + 30,
      x: useMotionValue(0),
      y: useMotionValue(0),
      placed: false
    }
  ]);

  const [piecesState, setPiecesState] = useState(pieces.map(p => ({ id: p.id, placed: false })));
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
    
    // Create multiple swirls
    for (let s = 0; s < 3; s++) {
      const offsetX = (s - 1) * 100;
      const offsetY = Math.sin(s) * 50;
      
      for (let angle = 0; angle < Math.PI * 6; angle += 0.08) {
        const radius = angle * 6;
        const x = centerX + offsetX + Math.cos(angle) * radius;
        const y = centerY + offsetY + Math.sin(angle) * radius;
        
        const hue = (angle * 40 + s * 120) % 360;
        ctx.strokeStyle = `hsl(${hue}, 75%, 65%)`;
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        
        if (angle > 0.08) {
          ctx.beginPath();
          const prevRadius = (angle - 0.08) * 6;
          const prevX = centerX + offsetX + Math.cos(angle - 0.08) * prevRadius;
          const prevY = centerY + offsetY + Math.sin(angle - 0.08) * prevRadius;
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }
    }
    
    // Cut out puzzle piece areas
    ctx.globalCompositeOperation = 'destination-out';
    pieces.forEach(piece => {
      // Draw puzzle piece shape with knobs
      ctx.save();
      ctx.translate(piece.gapX + 30, piece.gapY + 30);
      
      ctx.beginPath();
      // Main square
      ctx.rect(-30, -30, 60, 60);
      
      // Top knob
      ctx.arc(0, -30, 8, 0, Math.PI * 2);
      // Right knob
      ctx.arc(30, 0, 8, 0, Math.PI * 2);
      
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.restore();
    });
    
    ctx.globalCompositeOperation = 'source-over';
  }, [pieces]);

  const handleDragEnd = useCallback((pieceIndex: number) => {
    return (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      setAttempts(prev => prev + 1);
      
      const piece = pieces[pieceIndex];
      const finalX = piece.x.get();
      const finalY = piece.y.get();
      
      // Calculate distance from correct position
      const distance = Math.sqrt(
        Math.pow(finalX - piece.gapX, 2) + Math.pow(finalY - piece.gapY, 2)
      );
      
      const snapThreshold = 30;
      const isCorrect = distance < snapThreshold;
      
      if (isCorrect) {
        piece.x.set(piece.gapX);
        piece.y.set(piece.gapY);
        
        setPiecesState(prev => {
          const newState = [...prev];
          newState[pieceIndex] = { id: piece.id, placed: true };
          
          // Check if all pieces are placed
          const allPlaced = newState.every(p => p.placed);
          if (allPlaced && !isComplete) {
            setIsComplete(true);
            const baseAccuracy = Math.max(0, 100 - distance);
            const attemptPenalty = Math.min(30, (attempts - 1) * 10);
            const finalAccuracy = Math.max(50, baseAccuracy - attemptPenalty);
            
            setTimeout(() => {
              onComplete(Math.round(finalAccuracy));
            }, 500);
          }
          
          return newState;
        });
      } else {
        piece.x.set(0);
        piece.y.set(0);
      }
    };
  }, [pieces, attempts, isComplete, onComplete]);

  return (
    <div className="inline-block">
      <div className="w-full max-w-[400px] bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg shadow-sm overflow-hidden">
        {/* Puzzle Container */}
        <div className="relative w-full aspect-[1.6/1] bg-white dark:bg-card">
          {/* Background swirl pattern with gaps */}
          <canvas
            ref={canvasRef}
            width={400}
            height={250}
            className="absolute inset-0 w-full h-full"
          />
          
          {/* Gap outlines */}
          {pieces.map((piece, index) => (
            <div
              key={`gap-${piece.id}`}
              className="absolute border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-sm"
              style={{
                left: `${piece.gapX}px`,
                top: `${piece.gapY}px`,
                width: '60px',
                height: '60px'
              }}
            />
          ))}

          {/* Draggable puzzle pieces */}
          {pieces.map((piece, index) => (
            <motion.div
              key={`piece-${piece.id}`}
              drag={!disabled && !piecesState[index].placed}
              dragMomentum={false}
              dragElastic={0.1}
              dragConstraints={{ left: -50, right: 350, top: -50, bottom: 200 }}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd(index)}
              style={{ x: piece.x, y: piece.y }}
              className={`absolute ${disabled || piecesState[index].placed ? 'opacity-80 cursor-not-allowed' : 'cursor-move'}`}
              style={{
                left: `${20 + index * 80}px`,
                bottom: '10px',
                x: piece.x,
                y: piece.y
              }}
              whileHover={!disabled && !piecesState[index].placed ? { scale: 1.05 } : {}}
              whileTap={!disabled && !piecesState[index].placed ? { scale: 0.95 } : {}}
            >
              <div className="relative w-[60px] h-[60px] rounded-sm shadow-xl border-3 border-gray-700 dark:border-gray-400 overflow-hidden bg-white dark:bg-card">
                {/* Puzzle piece pattern (extracted from same swirl) */}
                <canvas
                  width={60}
                  height={60}
                  ref={(canvas) => {
                    if (!canvas) return;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    
                    const offsetX = -piece.gapX;
                    const offsetY = -piece.gapY;
                    
                    // Draw the same pattern but offset to match gap position
                    for (let s = 0; s < 3; s++) {
                      const swirlOffsetX = (s - 1) * 100;
                      const swirlOffsetY = Math.sin(s) * 50;
                      
                      for (let angle = 0; angle < Math.PI * 6; angle += 0.08) {
                        const radius = angle * 6;
                        const x = 200 + swirlOffsetX + Math.cos(angle) * radius + offsetX;
                        const y = 125 + swirlOffsetY + Math.sin(angle) * radius + offsetY;
                        
                        const hue = (angle * 40 + s * 120) % 360;
                        ctx.strokeStyle = `hsl(${hue}, 75%, 65%)`;
                        ctx.lineWidth = 14;
                        ctx.lineCap = 'round';
                        
                        if (angle > 0.08 && x >= -10 && x <= 70 && y >= -10 && y <= 70) {
                          ctx.beginPath();
                          const prevRadius = (angle - 0.08) * 6;
                          const prevX = 200 + swirlOffsetX + Math.cos(angle - 0.08) * prevRadius + offsetX;
                          const prevY = 125 + swirlOffsetY + Math.sin(angle - 0.08) * prevRadius + offsetY;
                          ctx.moveTo(prevX, prevY);
                          ctx.lineTo(x, y);
                          ctx.stroke();
                        }
                      }
                    }
                  }}
                  className="w-full h-full"
                />
                
                {piecesState[index].placed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
                  >
                    <Check className="w-6 h-6 text-green-600" strokeWidth={3} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}

          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-blue-500/5 pointer-events-none"
            />
          )}
        </div>

        {/* Footer with action button */}
        <div className="border-t border-gray-200 dark:border-border px-4 py-3 bg-gray-50 dark:bg-card/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={disabled || isComplete}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Push the puzzle into place
            </span>
          </div>
          <div className="flex items-center gap-2">
            <img 
              src="/incaptcha.png" 
              alt="Powered by ARCaptcha" 
              className="h-4 w-auto opacity-60"
            />
            <span className="text-[10px] text-gray-500 dark:text-gray-500">
              Powered by ARCaptcha
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
