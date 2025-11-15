import { useState, useRef, useEffect, useCallback } from 'react';
import anime from 'animejs/lib/anime.es.js';
import Hammer from 'hammerjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, RotateCw } from 'lucide-react';

interface PuzzlePiece {
  id: number;
  x: number;
  y: number;
  correctX: number;
  correctY: number;
  rotation: number;
  placed: boolean;
}

interface EnhancedPuzzleModeProps {
  onComplete: (accuracy: number) => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export function EnhancedPuzzleMode({ onComplete, difficulty = 'medium' }: EnhancedPuzzleModeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const CANVAS_SIZE = 400;
  const PIECE_COUNT = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
  const SNAP_THRESHOLD = 30;

  // Generate swirly psychedelic background
  const generateBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    gradient.addColorStop(0, '#8B5CF6');    // Purple
    gradient.addColorStop(0.2, '#EC4899');  // Pink
    gradient.addColorStop(0.4, '#F59E0B');  // Orange
    gradient.addColorStop(0.6, '#10B981');  // Green
    gradient.addColorStop(0.8, '#3B82F6');  // Blue
    gradient.addColorStop(1, '#8B5CF6');    // Purple

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw swirly patterns
    for (let i = 0; i < 15; i++) {
      const centerX = Math.random() * CANVAS_SIZE;
      const centerY = Math.random() * CANVAS_SIZE;
      const radius = 40 + Math.random() * 60;
      const spirals = 3 + Math.random() * 2;

      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 2 * spirals; angle += 0.1) {
        const r = (radius * angle) / (Math.PI * 2 * spirals);
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        
        if (angle === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      const hue = Math.random() * 360;
      ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.3)`;
      ctx.lineWidth = 4 + Math.random() * 8;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }, []);

  // Initialize puzzle pieces
  useEffect(() => {
    const newPieces: PuzzlePiece[] = [];
    const usedPositions = new Set<string>();

    for (let i = 0; i < PIECE_COUNT; i++) {
      let startX, startY;
      do {
        startX = Math.random() * (CANVAS_SIZE - 80);
        startY = Math.random() * (CANVAS_SIZE - 80);
        const posKey = `${Math.floor(startX / 80)}-${Math.floor(startY / 80)}`;
        
        if (!usedPositions.has(posKey)) {
          usedPositions.add(posKey);
          break;
        }
      } while (true);

      const correctX = 100 + i * 60;
      const correctY = CANVAS_SIZE / 2 - 30;

      newPieces.push({
        id: i,
        x: startX,
        y: startY,
        correctX,
        correctY,
        rotation: difficulty === 'hard' ? Math.random() * 360 : 0,
        placed: false,
      });
    }

    setPieces(newPieces);
  }, [difficulty, PIECE_COUNT]);

  // Draw puzzle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw background
    generateBackground(ctx);

    // Draw target zones (dotted outlines)
    pieces.forEach((piece: PuzzlePiece) => {
      if (!piece.placed) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(piece.correctX, piece.correctY, 60, 60);
        ctx.restore();
      }
    });

    // Draw puzzle pieces
    pieces.forEach((piece: PuzzlePiece) => {
      ctx.save();
      ctx.translate(piece.x + 30, piece.y + 30);
      ctx.rotate((piece.rotation * Math.PI) / 180);

      // Piece shadow
      if (!piece.placed) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }

      // Draw jigsaw piece shape
      ctx.beginPath();
      ctx.moveTo(-25, -25);
      
      // Top edge with tab
      ctx.lineTo(-5, -25);
      ctx.arc(-5, -30, 5, Math.PI / 2, -Math.PI / 2, true);
      ctx.lineTo(5, -25);
      ctx.lineTo(25, -25);
      
      // Right edge
      ctx.lineTo(25, 25);
      
      // Bottom edge
      ctx.lineTo(-25, 25);
      
      // Left edge
      ctx.closePath();

      // Fill with gradient
      const pieceGradient = ctx.createLinearGradient(-25, -25, 25, 25);
      const hue = (piece.id * 60) % 360;
      
      if (piece.placed) {
        pieceGradient.addColorStop(0, `hsl(${hue}, 60%, 50%)`);
        pieceGradient.addColorStop(1, `hsl(${hue}, 60%, 40%)`);
        ctx.globalAlpha = 0.9;
      } else if (selectedPiece === piece.id) {
        pieceGradient.addColorStop(0, `hsl(${hue}, 80%, 70%)`);
        pieceGradient.addColorStop(1, `hsl(${hue}, 80%, 60%)`);
      } else {
        pieceGradient.addColorStop(0, `hsl(${hue}, 70%, 60%)`);
        pieceGradient.addColorStop(1, `hsl(${hue}, 70%, 50%)`);
      }

      ctx.fillStyle = pieceGradient;
      ctx.fill();

      // Border
      ctx.strokeStyle = piece.placed ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    });

    // Update completion progress
    const placedCount = pieces.filter((p) => p.placed).length;
    setCompletionProgress((placedCount / PIECE_COUNT) * 100);

    if (placedCount === PIECE_COUNT && !isComplete) {
      setIsComplete(true);
      
      // Success animation
      anime({
        targets: '.puzzle-container',
        scale: [1, 1.02, 1],
        duration: 500,
        easing: 'easeInOutQuad',
      });

      setTimeout(() => {
        const accuracy = Math.round(90 + Math.random() * 10);
        onComplete(accuracy);
      }, 800);
    }
  }, [pieces, selectedPiece, generateBackground, onComplete, isComplete, PIECE_COUNT]);

  // Handle piece interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const hammer = new Hammer(canvas);
    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

    let draggedPiece: number | null = null;
    let startX = 0;
    let startY = 0;

    hammer.on('panstart', (ev) => {
      const rect = canvas.getBoundingClientRect();
      const x = ev.center.x - rect.left;
      const y = ev.center.y - rect.top;

      // Find clicked piece
      for (let i = pieces.length - 1; i >= 0; i--) {
        const piece: PuzzlePiece = pieces[i];
        if (!piece.placed) {
          const dx = x - (piece.x + 30);
          const dy = y - (piece.y + 30);
          
          if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
            draggedPiece = piece.id;
            setSelectedPiece(piece.id);
            startX = piece.x;
            startY = piece.y;
            break;
          }
        }
      }
    });

    hammer.on('panmove', (ev) => {
      if (draggedPiece !== null) {
        setPieces((prev: PuzzlePiece[]) =>
          prev.map((p: PuzzlePiece) =>
            p.id === draggedPiece
              ? {
                  ...p,
                  x: Math.max(0, Math.min(CANVAS_SIZE - 60, startX + ev.deltaX)),
                  y: Math.max(0, Math.min(CANVAS_SIZE - 60, startY + ev.deltaY)),
                }
              : p
          )
        );
      }
    });

    hammer.on('panend', () => {
      if (draggedPiece !== null) {
        setPieces((prev: PuzzlePiece[]) =>
          prev.map((p: PuzzlePiece) => {
            if (p.id === draggedPiece) {
              const dx = p.x - p.correctX;
              const dy = p.y - p.correctY;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < SNAP_THRESHOLD) {
                // Snap to correct position
                anime({
                  targets: { x: p.x, y: p.y, rotation: p.rotation },
                  x: p.correctX,
                  y: p.correctY,
                  rotation: 0,
                  duration: 300,
                  easing: 'easeOutElastic(1, .5)',
                  update: (anim: any) => {
                    const values = anim.animations[0].currentValue;
                    setPieces((current: PuzzlePiece[]) =>
                      current.map((piece: PuzzlePiece) =>
                        piece.id === draggedPiece
                          ? {
                              ...piece,
                              x: typeof values === 'number' ? values : piece.x,
                              y: piece.y,
                            }
                          : piece
                      )
                    );
                  },
                });

                return {
                  ...p,
                  x: p.correctX,
                  y: p.correctY,
                  rotation: 0,
                  placed: true,
                };
              }
            }
            return p;
          })
        );

        setSelectedPiece(null);
        draggedPiece = null;
      }
    });

    return () => {
      hammer.destroy();
    };
  }, [pieces, SNAP_THRESHOLD]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-base font-semibold text-foreground mb-1" data-testid="text-puzzle-prompt">
          Push the puzzle into place
        </h3>
        <p className="text-sm text-muted-foreground">
          Drag the pieces to their correct positions
        </p>
      </div>

      <Card className="puzzle-container relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-full h-auto cursor-grab active:cursor-grabbing"
          data-testid="canvas-puzzle"
        />
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/50">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
            style={{ width: `${completionProgress}%` }}
            data-testid="progress-bar"
          />
        </div>
      </Card>

      {/* Powered by branding */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <div className="w-4 h-4 bg-muted rounded-sm flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-primary to-secondary" />
        </div>
        <span>Powered by InCaptcha</span>
      </div>
    </div>
  );
}
