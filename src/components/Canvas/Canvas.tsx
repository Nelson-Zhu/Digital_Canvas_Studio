import React, { useRef, useEffect, useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface Point {
  x: number;
  y: number;
  pressure?: number;
}

interface DrawingOptions {
  color: string;
  brushSize: number;
  toolType: 'brush' | 'eraser' | 'fillBucket' | 'straightLine';
  tremorCompensation: number; // 0-10 scale, 0 is no compensation
}

const Canvas: React.FC = () => {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // State
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingOptions, setDrawingOptions] = useState<DrawingOptions>({
    color: '#4285F4', // Primary blue
    brushSize: 5,
    toolType: 'brush',
    tremorCompensation: 5,
  });
  const [points, setPoints] = useState<Point[]>([]);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Get accessibility settings
  const { touchSensitivity, responseTime } = useAccessibility();
  
  // Initialize canvas when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Configure canvas for high-resolution displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Scale context for high DPI display
    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = drawingOptions.color;
    context.lineWidth = drawingOptions.brushSize;
    
    contextRef.current = context;
    
    // Initialize canvas with white background
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save initial state to history
    const initialState = context.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialState]);
    setHistoryIndex(0);
  }, []);
  
  // Save canvas state to history
  const saveToHistory = () => {
    if (!canvasRef.current || !contextRef.current) return;
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    const currentState = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Remove any future states if we've gone back in history
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Add current state to history
    setHistory([...newHistory, currentState]);
    setHistoryIndex(newHistory.length);
  };
  
  // Undo/Redo functions
  const undo = () => {
    if (historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    
    if (!canvasRef.current || !contextRef.current) return;
    contextRef.current.putImageData(history[newIndex], 0, 0);
  };
  
  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    
    if (!canvasRef.current || !contextRef.current) return;
    contextRef.current.putImageData(history[newIndex], 0, 0);
  };
  
  // Tremor compensation algorithm
  const applyTremorCompensation = (points: Point[]): Point[] => {
    if (points.length < 3 || drawingOptions.tremorCompensation === 0) {
      return points;
    }
    
    // Calculate the smoothing factor based on tremor compensation setting
    const smoothingFactor = drawingOptions.tremorCompensation / 10;
    const smoothedPoints: Point[] = [points[0]]; // Start with the first point
    
    // Apply weighted moving average to smooth out tremors
    for (let i = 1; i < points.length - 1; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      const nextPoint = points[i + 1];
      
      // Weighted average of previous, current, and next points
      const smoothedX = (
        prevPoint.x * smoothingFactor +
        currentPoint.x * (1 - 2 * smoothingFactor) +
        nextPoint.x * smoothingFactor
      );
      
      const smoothedY = (
        prevPoint.y * smoothingFactor +
        currentPoint.y * (1 - 2 * smoothingFactor) +
        nextPoint.y * smoothingFactor
      );
      
      // Keep the pressure information if available
      smoothedPoints.push({
        x: smoothedX,
        y: smoothedY,
        pressure: currentPoint.pressure,
      });
    }
    
    // Add the last point
    smoothedPoints.push(points[points.length - 1]);
    
    return smoothedPoints;
  };
  
  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!contextRef.current) return;
    
    setIsDrawing(true);
    
    // Get the starting point
    let clientX: number, clientY: number, pressure = 0.5;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      // Some devices support pressure
      if ('force' in e.touches[0]) {
        pressure = (e.touches[0] as any).force;
      }
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Start a new path
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    
    // Set the first point
    setPoints([{ x, y, pressure }]);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return;
    
    // Get the current point
    let clientX: number, clientY: number, pressure = 0.5;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      // Some devices support pressure
      if ('force' in e.touches[0]) {
        pressure = (e.touches[0] as any).force;
      }
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Add the point to our array
    setPoints(prevPoints => [...prevPoints, { x, y, pressure }]);
    
    // Apply tremor compensation to the points
    const compensatedPoints = applyTremorCompensation([...points, { x, y, pressure }]);
    
    // Clear the canvas area where we're drawing
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw the background from history
    if (historyIndex >= 0) {
      contextRef.current.putImageData(history[historyIndex], 0, 0);
    }
    
    // Set drawing styles
    contextRef.current.strokeStyle = drawingOptions.color;
    contextRef.current.lineWidth = drawingOptions.brushSize * (pressure + 0.5); // Adjust size based on pressure
    
    // Draw the path with the compensated points
    contextRef.current.beginPath();
    contextRef.current.moveTo(compensatedPoints[0].x, compensatedPoints[0].y);
    
    for (let i = 1; i < compensatedPoints.length; i++) {
      contextRef.current.lineTo(compensatedPoints[i].x, compensatedPoints[i].y);
    }
    
    contextRef.current.stroke();
  };
  
  const stopDrawing = () => {
    if (!isDrawing || !contextRef.current) return;
    
    // Finalize the drawing
    contextRef.current.closePath();
    setIsDrawing(false);
    
    // Apply final tremor compensation
    const compensatedPoints = applyTremorCompensation(points);
    
    // Draw the final path
    if (compensatedPoints.length > 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Clear the canvas area where we're drawing
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      
      // Redraw the background from history
      if (historyIndex >= 0) {
        contextRef.current.putImageData(history[historyIndex], 0, 0);
      }
      
      // Set drawing styles
      contextRef.current.strokeStyle = drawingOptions.color;
      
      // Draw the path with the compensated points
      contextRef.current.beginPath();
      contextRef.current.moveTo(compensatedPoints[0].x, compensatedPoints[0].y);
      
      for (let i = 1; i < compensatedPoints.length; i++) {
        const point = compensatedPoints[i];
        const pressure = point.pressure || 0.5;
        
        contextRef.current.lineWidth = drawingOptions.brushSize * (pressure + 0.5);
        contextRef.current.lineTo(point.x, point.y);
      }
      
      contextRef.current.stroke();
      
      // Save this state to history
      saveToHistory();
    }
    
    // Reset points array
    setPoints([]);
  };
  
  // Color selection handler
  const handleColorChange = (color: string) => {
    setDrawingOptions(prev => ({ ...prev, color }));
  };
  
  // Brush size handler
  const handleBrushSizeChange = (size: number) => {
    setDrawingOptions(prev => ({ ...prev, brushSize: size }));
  };
  
  // Tool selection handler
  const handleToolChange = (toolType: DrawingOptions['toolType']) => {
    setDrawingOptions(prev => ({ ...prev, toolType }));
  };
  
  // Tremor compensation level handler
  const handleTremorCompensationChange = (level: number) => {
    setDrawingOptions(prev => ({ ...prev, tremorCompensation: level }));
  };
  
  // Clear canvas
  const clearCanvas = () => {
    if (!canvasRef.current || !contextRef.current) return;
    
    const canvas = canvasRef.current;
    contextRef.current.fillStyle = 'white';
    contextRef.current.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save this state to history
    saveToHistory();
  };
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 p-2 bg-neutral-light rounded-large">
        {/* Color selection */}
        <div className="flex space-x-2">
          <button
            className="w-8 h-8 rounded-full border-2 border-neutral-medium"
            style={{ backgroundColor: '#4285F4' }}
            onClick={() => handleColorChange('#4285F4')}
          />
          <button
            className="w-8 h-8 rounded-full border-2 border-neutral-medium"
            style={{ backgroundColor: '#EA4335' }}
            onClick={() => handleColorChange('#EA4335')}
          />
          <button
            className="w-8 h-8 rounded-full border-2 border-neutral-medium"
            style={{ backgroundColor: '#FBBC05' }}
            onClick={() => handleColorChange('#FBBC05')}
          />
          <button
            className="w-8 h-8 rounded-full border-2 border-neutral-medium"
            style={{ backgroundColor: '#34A853' }}
            onClick={() => handleColorChange('#34A853')}
          />
          <button
            className="w-8 h-8 rounded-full border-2 border-neutral-medium"
            style={{ backgroundColor: '#5F6368' }}
            onClick={() => handleColorChange('#5F6368')}
          />
        </div>
        
        {/* Brush size */}
        <div className="flex items-center space-x-2">
          <button
            className="btn-outline px-2 py-1"
            onClick={() => handleBrushSizeChange(Math.max(1, drawingOptions.brushSize - 1))}
          >
            -
          </button>
          <span>{drawingOptions.brushSize}</span>
          <button
            className="btn-outline px-2 py-1"
            onClick={() => handleBrushSizeChange(drawingOptions.brushSize + 1)}
          >
            +
          </button>
        </div>
        
        {/* Tools */}
        <div className="flex space-x-2">
          <button
            className={`btn-outline px-2 py-1 ${drawingOptions.toolType === 'brush' ? 'bg-primary text-white' : ''}`}
            onClick={() => handleToolChange('brush')}
          >
            Brush
          </button>
          <button
            className={`btn-outline px-2 py-1 ${drawingOptions.toolType === 'eraser' ? 'bg-primary text-white' : ''}`}
            onClick={() => handleToolChange('eraser')}
          >
            Eraser
          </button>
        </div>
        
        {/* Undo/Redo buttons */}
        <div className="flex space-x-2">
          <button
            className="btn-outline px-2 py-1"
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            Undo
          </button>
          <button
            className="btn-outline px-2 py-1"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            Redo
          </button>
          <button
            className="btn-outline px-2 py-1"
            onClick={clearCanvas}
          >
            Clear
          </button>
        </div>
      </div>
      
      {/* Tremor compensation slider */}
      <div className="flex items-center space-x-2 mb-4 p-2 bg-neutral-light rounded-large">
        <span>Tremor Compensation:</span>
        <input
          type="range"
          min="0"
          max="10"
          value={drawingOptions.tremorCompensation}
          onChange={(e) => handleTremorCompensationChange(parseInt(e.target.value))}
          className="w-48"
        />
        <span>{drawingOptions.tremorCompensation}</span>
      </div>
      
      {/* Canvas */}
      <div className="flex-grow border-2 border-neutral-medium rounded-large overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            touchAction: 'none', // Prevent scrolling while drawing
            transition: `all ${responseTime}ms ease-out`,
          }}
        />
      </div>
    </div>
  );
};

export default Canvas; 