import { useState, useRef, useEffect, useCallback } from 'react';
import * as anime from 'animejs';
import Hammer from 'hammerjs';
import { Info, Volume2, RotateCw, Shield } from 'lucide-react';

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
  onRefresh?: () => void;
}

export function EnhancedPuzzleMode({ onComplete, onRefresh }: EnhancedPuzzleModeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const CANVAS_SIZE = 300;
  const PIECE_SIZE = 70;
  const SNAP_THRESHOLD = 25;

  // Generate initial puzzle pieces with randomized starting positions
  const generateInitialPieces = useCallback((): PuzzlePiece[] => {
    return [
      {
        id: 0,
        x: 20 + Math.random() * 60,
        y: CANVAS_SIZE - PIECE_SIZE - (20 + Math.random() * 60),
        correctX: 50,
        correctY: CANVAS_SIZE / 2 - PIECE_SIZE / 2,
        rotation: 0,
        placed: false,
      },
      {
        id: 1,
        x: CANVAS_SIZE - PIECE_SIZE - (20 + Math.random() * 60),
        y: CANVAS_SIZE - PIECE_SIZE - (20 + Math.random() * 60),
        correctX: 50 + PIECE_SIZE,
        correctY: CANVAS_SIZE / 2 - PIECE_SIZE / 2,
        rotation: 0,
        placed: false,
      },
    ];
  }, []);

  // Generate psychedelic swirly background exactly like screenshot
  const generateBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Create multiple swirls with vibrant colors matching screenshot
    const colors = [
      { h: 270, s: 70, l: 65 }, // Purple
      { h: 300, s: 80, l: 70 }, // Pink/Magenta
      { h: 50, s: 90, l: 60 },  // Yellow
      { h: 160, s: 75, l: 55 }, // Green
      { h: 200, s: 80, l: 65 }, // Blue
      { h: 280, s: 85, l: 60 }, // Violet
    ];

    // Draw large overlapping swirls
    for (let layer = 0; layer < 20; layer++) {
      const centerX = (Math.random() - 0.5) * CANVAS_SIZE * 0.5 + CANVAS_SIZE / 2;
      const centerY = (Math.random() - 0.5) * CANVAS_SIZE * 0.5 + CANVAS_SIZE / 2;
      const spirals = 2 + Math.random() * 2;
      const maxRadius = 60 + Math.random() * 80;
      const rotation = Math.random() * Math.PI * 2;
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 2 * spirals; angle += 0.05) {
        const r = (maxRadius * angle) / (Math.PI * 2 * spirals);
        const x = centerX + r * Math.cos(angle + rotation);
        const y = centerY + r * Math.sin(angle + rotation);
        
        if (angle === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      // Vary the lightness for depth
      const lightness = color.l + (Math.random() - 0.5) * 20;
      ctx.strokeStyle = `hsla(${color.h}, ${color.s}%, ${lightness}%, ${0.4 + Math.random() * 0.3})`;
      ctx.lineWidth = 8 + Math.random() * 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // Add some additional swirl overlays for richness
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * CANVAS_SIZE;
      const y = Math.random() * CANVAS_SIZE;
      const radius = 20 + Math.random() * 40;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0.3)`);
      gradient.addColorStop(1, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  // Draw jigsaw piece shape with proper tabs/slots on multiple edges
  const drawJigsawPiece = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    pieceId: number,
    placed: boolean,
    selected: boolean
  ) => {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);

    const tabSize = size * 0.22;
    const halfSize = size / 2;
    const tabDepth = tabSize * 0.6;

    ctx.beginPath();
    
    // Start at top-left corner
    ctx.moveTo(-halfSize, -halfSize);
    
    // Top edge with tab/slot
    if (pieceId === 0) {
      // First piece: tab protruding upward
      ctx.lineTo(-tabSize, -halfSize);
      ctx.arc(0, -halfSize - tabDepth, tabDepth, Math.PI, 0, true);
      ctx.lineTo(tabSize, -halfSize);
    } else {
      // Second piece: slot indenting from top
      ctx.lineTo(-tabSize, -halfSize);
      ctx.arc(0, -halfSize + tabDepth, tabDepth, -Math.PI, 0);
      ctx.lineTo(tabSize, -halfSize);
    }
    ctx.lineTo(halfSize, -halfSize);
    
    // Right edge
    if (pieceId === 0) {
      // First piece: tab protruding to the right (connects with second piece)
      ctx.lineTo(halfSize, -tabSize);
      ctx.arc(halfSize + tabDepth, 0, tabDepth, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(halfSize, tabSize);
    } else {
      // Second piece: slot indenting from the left (receives first piece's tab)
      ctx.lineTo(halfSize, -tabSize);
      ctx.arc(halfSize - tabDepth, 0, tabDepth, Math.PI / 2, -Math.PI / 2, true);
      ctx.lineTo(halfSize, tabSize);
    }
    ctx.lineTo(halfSize, halfSize);
    
    // Bottom edge with tab/slot
    if (pieceId === 0) {
      // First piece: slot indenting from bottom
      ctx.lineTo(tabSize, halfSize);
      ctx.arc(0, halfSize - tabDepth, tabDepth, 0, -Math.PI, true);
      ctx.lineTo(-tabSize, halfSize);
    } else {
      // Second piece: tab protruding downward
      ctx.lineTo(tabSize, halfSize);
      ctx.arc(0, halfSize + tabDepth, tabDepth, 0, Math.PI);
      ctx.lineTo(-tabSize, halfSize);
    }
    ctx.lineTo(-halfSize, halfSize);
    
    // Left edge - piece 1 needs slot to receive piece 0's right tab
    if (pieceId === 1) {
      // Second piece: slot on left edge to receive first piece's right tab
      ctx.lineTo(-halfSize, tabSize);
      ctx.arc(-halfSize + tabDepth, 0, tabDepth, Math.PI / 2, -Math.PI / 2, true);
      ctx.lineTo(-halfSize, -tabSize);
    }
    // Piece 0 has straight left edge
    ctx.lineTo(-halfSize, -halfSize);
    ctx.closePath();

    // Shadow for non-placed pieces
    if (!placed) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = selected ? 15 : 8;
      ctx.shadowOffsetX = selected ? 3 : 2;
      ctx.shadowOffsetY = selected ? 3 : 2;
    }

    // Fill with dark color (matching screenshot)
    if (placed) {
      ctx.fillStyle = 'rgba(40, 40, 45, 0.95)';
    } else if (selected) {
      ctx.fillStyle = 'rgba(50, 50, 55, 1)';
    } else {
      ctx.fillStyle = 'rgba(35, 35, 40, 0.98)';
    }
    
    ctx.fill();

    // Border
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = placed ? 'rgba(100, 100, 110, 0.8)' : 'rgba(80, 80, 90, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  };

  // Initialize puzzle pieces with randomized starting positions
  useEffect(() => {
    setPieces(generateInitialPieces());
  }, [generateInitialPieces]);

  // Generate background once
  useEffect(() => {
    const bgCanvas = backgroundCanvasRef.current;
    if (!bgCanvas) return;

    const bgCtx = bgCanvas.getContext('2d');
    if (!bgCtx) return;

    generateBackground(bgCtx);
  }, [generateBackground]);

  // Draw puzzle pieces
  useEffect(() => {
    const canvas = canvasRef.current;
    const bgCanvas = backgroundCanvasRef.current;
    if (!canvas || !bgCanvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear foreground canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw dotted jigsaw outlines for target positions
    pieces.forEach((piece: PuzzlePiece) => {
      if (!piece.placed) {
        ctx.save();
        
        // Draw the jigsaw shape outline (same as the piece but with dashed stroke)
        ctx.translate(piece.correctX + PIECE_SIZE / 2, piece.correctY + PIECE_SIZE / 2);
        
        const tabSize = PIECE_SIZE * 0.22;
        const halfSize = PIECE_SIZE / 2;
        const tabDepth = tabSize * 0.6;
        
        ctx.beginPath();
        ctx.moveTo(-halfSize, -halfSize);
        
        // Top edge
        if (piece.id === 0) {
          ctx.lineTo(-tabSize, -halfSize);
          ctx.arc(0, -halfSize - tabDepth, tabDepth, Math.PI, 0, true);
          ctx.lineTo(tabSize, -halfSize);
        } else {
          ctx.lineTo(-tabSize, -halfSize);
          ctx.arc(0, -halfSize + tabDepth, tabDepth, -Math.PI, 0);
          ctx.lineTo(tabSize, -halfSize);
        }
        ctx.lineTo(halfSize, -halfSize);
        
        // Right edge
        if (piece.id === 0) {
          ctx.lineTo(halfSize, -tabSize);
          ctx.arc(halfSize + tabDepth, 0, tabDepth, -Math.PI / 2, Math.PI / 2);
          ctx.lineTo(halfSize, tabSize);
        } else {
          ctx.lineTo(halfSize, -tabSize);
          ctx.arc(halfSize - tabDepth, 0, tabDepth, Math.PI / 2, -Math.PI / 2, true);
          ctx.lineTo(halfSize, tabSize);
        }
        ctx.lineTo(halfSize, halfSize);
        
        // Bottom edge
        if (piece.id === 0) {
          ctx.lineTo(tabSize, halfSize);
          ctx.arc(0, halfSize - tabDepth, tabDepth, 0, -Math.PI, true);
          ctx.lineTo(-tabSize, halfSize);
        } else {
          ctx.lineTo(tabSize, halfSize);
          ctx.arc(0, halfSize + tabDepth, tabDepth, 0, Math.PI);
          ctx.lineTo(-tabSize, halfSize);
        }
        ctx.lineTo(-halfSize, halfSize);
        
        // Left edge - piece 1 needs slot to match piece 0's right tab
        if (piece.id === 1) {
          ctx.lineTo(-halfSize, tabSize);
          ctx.arc(-halfSize + tabDepth, 0, tabDepth, Math.PI / 2, -Math.PI / 2, true);
          ctx.lineTo(-halfSize, -tabSize);
        }
        // Piece 0 has straight left edge
        ctx.lineTo(-halfSize, -halfSize);
        ctx.closePath();
        
        // Stroke with dashed line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        
        ctx.restore();
      }
    });

    // Draw puzzle pieces
    pieces.forEach((piece: PuzzlePiece) => {
      drawJigsawPiece(
        ctx,
        piece.x,
        piece.y,
        PIECE_SIZE,
        piece.id,
        piece.placed,
        selectedPiece === piece.id
      );
    });

    // Check completion
    const allPlaced = pieces.every((p) => p.placed);
    if (allPlaced && !isComplete) {
      setIsComplete(true);
      
      anime({
        targets: containerRef.current,
        scale: [1, 1.02, 1],
        duration: 400,
        easing: 'easeInOutQuad',
      });

      setTimeout(() => {
        const accuracy = 0.92 + Math.random() * 0.06;
        onComplete(accuracy);
      }, 600);
    }
  }, [pieces, selectedPiece, isComplete, onComplete]);

  // Handle piece interaction with Hammer.js
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

      // Find clicked piece (check in reverse for top piece)
      for (let i = pieces.length - 1; i >= 0; i--) {
        const piece: PuzzlePiece = pieces[i];
        if (!piece.placed) {
          const dx = x - (piece.x + PIECE_SIZE / 2);
          const dy = y - (piece.y + PIECE_SIZE / 2);
          
          if (Math.abs(dx) < PIECE_SIZE / 2 && Math.abs(dy) < PIECE_SIZE / 2) {
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
                  x: Math.max(0, Math.min(CANVAS_SIZE - PIECE_SIZE, startX + ev.deltaX)),
                  y: Math.max(0, Math.min(CANVAS_SIZE - PIECE_SIZE, startY + ev.deltaY)),
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
              // Compare centers instead of top-left corners for accurate jigsaw snap detection
              const currentCenterX = p.x + PIECE_SIZE / 2;
              const currentCenterY = p.y + PIECE_SIZE / 2;
              const targetCenterX = p.correctX + PIECE_SIZE / 2;
              const targetCenterY = p.correctY + PIECE_SIZE / 2;
              
              const dx = currentCenterX - targetCenterX;
              const dy = currentCenterY - targetCenterY;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < SNAP_THRESHOLD) {
                // Snap animation
                anime({
                  targets: { x: p.x, y: p.y },
                  x: p.correctX,
                  y: p.correctY,
                  duration: 250,
                  easing: 'easeOutElastic(1, .6)',
                  update: (anim: any) => {
                    setPieces((current: PuzzlePiece[]) =>
                      current.map((piece: PuzzlePiece) =>
                        piece.id === draggedPiece
                          ? {
                              ...piece,
                              x: anim.animations[0].currentValue,
                              y: anim.animations[1].currentValue,
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

  const handleRefresh = () => {
    setIsComplete(false);
    setSelectedPiece(null);
    
    // Generate new randomized starting positions
    setPieces(generateInitialPieces());
    
    onRefresh?.();
  };

  return (
    <div className="inline-block w-full max-w-[300px]" ref={containerRef}>
      <div className="bg-white dark:bg-card border border-[#e5e7eb] dark:border-border rounded-lg shadow-sm overflow-hidden">
        {/* Header with prompt */}
        <div className="px-4 py-3 text-center border-b border-border">
          <h3 className="text-sm font-medium text-foreground" data-testid="text-puzzle-prompt">
            Push the puzzle into place
          </h3>
        </div>

        {/* Puzzle canvas container */}
        <div className="relative" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, margin: '0 auto' }}>
          {/* Background canvas (swirly pattern) */}
          <canvas
            ref={backgroundCanvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="absolute top-0 left-0 w-full h-full"
            style={{ pointerEvents: 'none' }}
          />
          
          {/* Foreground canvas (puzzle pieces) */}
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="absolute top-0 left-0 w-full h-full cursor-grab active:cursor-grabbing"
            data-testid="canvas-puzzle"
          />
        </div>

        {/* Footer with controls and branding */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Powered by InCaptcha
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title="Information"
              data-testid="button-info"
            >
              <Info className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title="Audio challenge"
              data-testid="button-audio"
            >
              <Volume2 className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title="Refresh puzzle"
              data-testid="button-refresh"
            >
              <RotateCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Info tooltip */}
        {showInfo && (
          <div className="px-4 py-3 bg-muted/50 text-xs text-muted-foreground border-t border-border">
            Drag the puzzle pieces into their correct positions to verify you're human.
          </div>
        )}
      </div>
    </div>
  );
}
