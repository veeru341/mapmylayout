import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tool } from '../types';

interface PlaygroundProps {
  imageSrc: string | null;
  activeTool: Tool;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageRef: React.RefObject<HTMLImageElement>;
  clearCounter: number;
}

const Playground: React.FC<PlaygroundProps> = ({ imageSrc, activeTool, canvasRef, imageRef, clearCounter }) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, width: 500, height: 500, rotation: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<any>(null); // For resize/rotate state
  
  // Drawing state refs
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const canvasSnapshot = useRef<ImageData | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Layout state refs
  const clippingPathRef = useRef<Path2D | null>(null);
  const penPointsRef = useRef<{x: number; y: number}[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<{x: number; y: number}[]>([]);


  // Reset all drawing state when image changes or canvas is cleared
  useEffect(() => {
    clippingPathRef.current = null;
    penPointsRef.current = [];
    setPolygonPoints([]);
    isDrawing.current = false;
    canvasSnapshot.current = null;
  }, [imageSrc, clearCounter]);


  useEffect(() => {
    // When tool switches away from polygon, cancel the current drawing
    if (activeTool !== Tool.POLYGON && polygonPoints.length > 0) {
        const ctx = contextRef.current;
        if (ctx && canvasSnapshot.current) {
            ctx.putImageData(canvasSnapshot.current, 0, 0);
        }
        setPolygonPoints([]);
        canvasSnapshot.current = null;
        isDrawing.current = false;
    }
  }, [activeTool, polygonPoints.length]);


  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const playground = containerRef.current?.getBoundingClientRect();
        if (playground) {
          const aspect = img.naturalWidth / img.naturalHeight;
          let newWidth = playground.width * 0.7;
          let newHeight = newWidth / aspect;

          if (newHeight > playground.height * 0.7) {
            newHeight = playground.height * 0.7;
            newWidth = newHeight * aspect;
          }

          setTransform({
            width: newWidth,
            height: newHeight,
            x: (playground.width - newWidth) / 2,
            y: (playground.height - newHeight) / 2,
            rotation: 0,
          });

          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = newWidth;
            canvas.height = newHeight;
            const ctx = canvas.getContext('2d');
            contextRef.current = ctx;
          }
        }
      };
    }
  }, [imageSrc, canvasRef]);
  
  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
  };

  const createPathFromPoints = (points: {x: number; y: number}[], closed: boolean): Path2D => {
    const path = new Path2D();
    if (points.length === 0) return path;
    path.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        path.lineTo(points[i].x, points[i].y);
    }
    if (closed) {
        path.closePath();
    }
    return path;
  };

  const drawAndSetClippingPath = (path: Path2D) => {
    const ctx = contextRef.current;
    if(!ctx) return;
    
    clippingPathRef.current = path;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.fill(clippingPathRef.current);
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke(clippingPathRef.current);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    if (!point || !contextRef.current || activeTool === Tool.SELECT) return;

    const ctx = contextRef.current;
    
    if (activeTool === Tool.POLYGON) {
        const isFirstPoint = polygonPoints.length === 0;
        const isClosing = !isFirstPoint && polygonPoints.length > 1 && Math.hypot(point.x - polygonPoints[0].x, point.y - polygonPoints[0].y) < 10;
        
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;

        if (isClosing) {
            const finalPoints = [...polygonPoints];
            const closedPath = createPathFromPoints(finalPoints, true);
            drawAndSetClippingPath(closedPath);
            setPolygonPoints([]);
            canvasSnapshot.current = null;
            isDrawing.current = false;
        } else {
            if (!isFirstPoint) {
                ctx.beginPath();
                ctx.moveTo(polygonPoints[polygonPoints.length - 1].x, polygonPoints[polygonPoints.length - 1].y);
                ctx.lineTo(point.x, point.y);
                ctx.stroke();
            }
            setPolygonPoints(prev => [...prev, point]);
            canvasSnapshot.current = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
            isDrawing.current = true;
        }
        return;
    }

    isDrawing.current = true;
    lastPoint.current = point;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (activeTool === Tool.ERASER) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20;
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 3;
        if (activeTool === Tool.DASHES) {
            ctx.strokeStyle = '#FFFFFF';
            ctx.setLineDash([10, 10]);
        } else {
            ctx.strokeStyle = '#FFFFFF';
        }
    }
    
    if (activeTool === Tool.RECTANGLE || activeTool === Tool.SQUARE || activeTool === Tool.DASHES) {
        canvasSnapshot.current = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    if (activeTool === Tool.PEN) {
      penPointsRef.current = [point];
    }

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || activeTool === Tool.SELECT) return;
    const point = getCanvasPoint(e);
    const ctx = contextRef.current;
    if (!point || !ctx) return;
    
    if (activeTool === Tool.POLYGON) {
        if (polygonPoints.length === 0 || !canvasSnapshot.current) return;
        ctx.putImageData(canvasSnapshot.current, 0, 0);
        ctx.beginPath();
        ctx.moveTo(polygonPoints[polygonPoints.length - 1].x, polygonPoints[polygonPoints.length - 1].y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        return;
    }

    const startPoint = lastPoint.current;
    if(!startPoint) return;

    if (activeTool === Tool.RECTANGLE || activeTool === Tool.SQUARE || activeTool === Tool.DASHES) {
        if(canvasSnapshot.current) ctx.putImageData(canvasSnapshot.current, 0, 0);

        if(clippingPathRef.current) { ctx.save(); ctx.clip(clippingPathRef.current); }
        
        ctx.beginPath();
        if (activeTool === Tool.DASHES) {
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        } else {
            let width = point.x - startPoint.x;
            let height = point.y - startPoint.y;
            if(activeTool === Tool.SQUARE) {
                 const side = Math.max(Math.abs(width), Math.abs(height));
                 width = side * Math.sign(width);
                 height = side * Math.sign(height);
            }
            ctx.rect(startPoint.x, startPoint.y, width, height);
            ctx.fillStyle = 'rgba(22, 163, 74, 0.5)'; // green-600 with 50% opacity
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        if(clippingPathRef.current) ctx.restore();

    } else { // Pen or Eraser
        if (activeTool === Tool.PEN) {
          penPointsRef.current.push(point);
        }
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === Tool.POLYGON || activeTool === Tool.SELECT || !isDrawing.current) return;
    const point = getCanvasPoint(e);
    const ctx = contextRef.current;
    if (!point || !ctx) return;

    if (activeTool === Tool.PEN) {
      const points = penPointsRef.current;
      if (points.length > 2) {
          const startPoint = points[0];
          const endPoint = points[points.length - 1];
          if (Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y) < 15) {
             const closedPath = createPathFromPoints(points, true);
             drawAndSetClippingPath(closedPath);
          }
      }
      penPointsRef.current = [];
    }

    if (activeTool === Tool.RECTANGLE || activeTool === Tool.SQUARE || activeTool === Tool.DASHES) {
        if(canvasSnapshot.current) ctx.putImageData(canvasSnapshot.current, 0, 0);
        
        if(clippingPathRef.current) { ctx.save(); ctx.clip(clippingPathRef.current); }

        ctx.beginPath();
        const startPoint = lastPoint.current;
        if(startPoint) {
            if (activeTool === Tool.DASHES) {
                ctx.moveTo(startPoint.x, startPoint.y);
                ctx.lineTo(point.x, point.y);
                ctx.stroke();
            } else {
                let width = point.x - startPoint.x;
                let height = point.y - startPoint.y;

                if(activeTool === Tool.SQUARE) {
                    const side = Math.max(Math.abs(width), Math.abs(height));
                    width = side * Math.sign(width);
                    height = side * Math.sign(height);
                }
                ctx.rect(startPoint.x, startPoint.y, width, height);
                ctx.fillStyle = 'rgba(22, 163, 74, 0.5)'; // green-600 with 50% opacity
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }
        
        if(clippingPathRef.current) ctx.restore();
    }
    
    if (activeTool === Tool.DASHES) {
      ctx.setLineDash([]); // Reset for other tools
    }
    
    ctx.closePath();
    isDrawing.current = false;
    lastPoint.current = null;
    canvasSnapshot.current = null;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === Tool.POLYGON) {
        if (isDrawing.current && contextRef.current && canvasSnapshot.current) {
            contextRef.current.putImageData(canvasSnapshot.current, 0, 0);
        }
        return;
    }
    if(isDrawing.current) {
        handleMouseUp(e);
    }
  };

   const handleInteractionStart = (e: React.MouseEvent<HTMLDivElement>, type: 'move' | 'rotate' | {type:'resize', handle: string}) => {
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;

        if(type === 'rotate') {
            const transformRect = e.currentTarget.parentElement!.getBoundingClientRect();
            const centerX = transformRect.left + transformRect.width / 2;
            const centerY = transformRect.top + transformRect.height / 2;
            const startAngle = Math.atan2(startY - centerY, startX - centerX);
            interactionRef.current = {type: 'rotate', startAngle, startRotation: transform.rotation, centerX, centerY};
        } else if (typeof type === 'object' && type.type === 'resize') {
            interactionRef.current = { ...type, startX, startY, startTransform: transform };
        } else { // move
            interactionRef.current = { type: 'move', startX, startY, startTransform: transform };
        }

        window.addEventListener('mousemove', handleInteractionMove);
        window.addEventListener('mouseup', handleInteractionEnd);
    };

    const handleInteractionMove = useCallback((e: MouseEvent) => {
        if (!interactionRef.current) return;
        const { type, startX, startY, startTransform, handle, startAngle, startRotation, centerX, centerY } = interactionRef.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (type === 'move') {
            setTransform(t => ({...t, x: startTransform.x + dx, y: startTransform.y + dy}));
        } else if (type === 'rotate') {
             const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
             const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
             setTransform(t => ({...t, rotation: startRotation + angleDiff}));
        } else if (type === 'resize') {
            let { width, height, x, y } = startTransform;
            if(handle.includes('r')) width += dx;
            if(handle.includes('l')) { width -= dx; x += dx; }
            if(handle.includes('b')) height += dy;
            if(handle.includes('t')) { height -= dy; y += dy; }
            setTransform(t => ({...t, width, height, x, y}));
        }
    }, []);

    const handleInteractionEnd = useCallback(() => {
        interactionRef.current = null;
        window.removeEventListener('mousemove', handleInteractionMove);
        window.removeEventListener('mouseup', handleInteractionEnd);
    }, [handleInteractionMove]);

    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleInteractionMove);
            window.removeEventListener('mouseup', handleInteractionEnd);
        };
    }, [handleInteractionMove, handleInteractionEnd]);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          // When the transform box is resized, we must update the canvas dimensions.
          // This action clears the canvas content. We also reset all drawing state
          // to prevent errors or artifacts. This is a trade-off for stability.
          if (canvas.width !== transform.width || canvas.height !== transform.height) {
            canvas.width = transform.width;
            canvas.height = transform.height;
            
            clippingPathRef.current = null;
            penPointsRef.current = [];
            setPolygonPoints([]);
            isDrawing.current = false;
            canvasSnapshot.current = null;
    
            const ctx = canvas.getContext('2d');
            if (ctx) {
              contextRef.current = ctx;
            }
          }
        }
      }, [transform.width, transform.height]);


  if (!imageSrc) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-700/50 rounded-lg">
        <p className="text-gray-400 text-2xl">Upload an image to start</p>
      </div>
    );
  }

  const resizerHandles = ['tl', 't', 'tr', 'l', 'r', 'bl', 'b', 'br'];
  const handleClasses: {[key: string]: string} = {
    tl: 'top-0 left-0 cursor-nwse-resize',
    t: 'top-0 left-1/2 -translate-x-1/2 cursor-ns-resize',
    tr: 'top-0 right-0 cursor-nesw-resize',
    l: 'top-1/2 -translate-y-1/2 left-0 cursor-ew-resize',
    r: 'top-1/2 -translate-y-1/2 right-0 cursor-ew-resize',
    bl: 'bottom-0 left-0 cursor-nesw-resize',
    b: 'bottom-0 left-1/2 -translate-x-1/2 cursor-ns-resize',
    br: 'bottom-0 right-0 cursor-nwse-resize',
  };
  
  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden flex items-center justify-center">
        <div 
            style={{
                position: 'absolute',
                left: transform.x,
                top: transform.y,
                width: transform.width,
                height: transform.height,
                transform: `rotate(${transform.rotation}deg)`,
                cursor: activeTool === Tool.SELECT ? 'move' : 'default',
            }}
             onMouseDown={(e) => activeTool === Tool.SELECT && handleInteractionStart(e, 'move')}
        >
            <img ref={imageRef} src={imageSrc} className="w-full h-full object-contain pointer-events-none select-none" alt="Playground" />
            <canvas 
              ref={canvasRef}
              className="absolute top-0 left-0"
              style={{ pointerEvents: activeTool === Tool.SELECT ? 'none' : 'auto', cursor: activeTool !== Tool.SELECT ? 'crosshair' : 'default' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            />

            {activeTool === Tool.SELECT && (
                <>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 cursor-grab" onMouseDown={(e) => handleInteractionStart(e, 'rotate')}>
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="w-px h-5 bg-blue-500 mx-auto"></div>
                    </div>
                    {resizerHandles.map(handle => (
                         <div
                            key={handle}
                            className={`absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-sm ${handleClasses[handle]}`}
                            onMouseDown={(e) => handleInteractionStart(e, {type: 'resize', handle})}
                        />
                    ))}
                </>
            )}
        </div>
    </div>
  );
};

export default Playground;