import React, { useState, useRef, useCallback } from 'react';
import { Tool } from '../types';
import { PenIcon } from './icons/PenIcon';
import { RectangleIcon } from './icons/RectangleIcon';
import { SquareIcon } from './icons/SquareIcon';
import { EraserIcon } from './icons/EraserIcon';
import { SelectIcon } from './icons/SelectIcon';
import { ClearIcon } from './icons/ClearIcon';
import { PolygonIcon } from './icons/PolygonIcon';
import { DashesIcon } from './icons/DashesIcon';

interface LeftPanelProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  onClear: () => void;
  onImageLoad: (src: string) => void;
  onInitiateSave: () => void;
  onCancel: () => void;
}

const toolConfig = [
  { id: Tool.SELECT, name: 'Select & Transform', icon: <SelectIcon /> },
  { id: Tool.PEN, name: 'Pen', icon: <PenIcon /> },
  { id: Tool.POLYGON, name: 'Polygon', icon: <PolygonIcon /> },
  { id: Tool.RECTANGLE, name: 'Rectangle', icon: <RectangleIcon /> },
  { id: Tool.SQUARE, name: 'Square', icon: <SquareIcon /> },
  { id: Tool.DASHES, name: 'Dashed Line', icon: <DashesIcon /> },
  { id: Tool.ERASER, name: 'Eraser', icon: <EraserIcon /> },
];

const LeftPanel: React.FC<LeftPanelProps> = ({ activeTool, setActiveTool, onClear, onImageLoad, onInitiateSave, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadClick = () => {
    if (selectedFile) {
      onImageLoad(URL.createObjectURL(selectedFile));
    }
  };
  
  const handleUploadAreaClick = useCallback(() => {
    fileInputRef.current?.click();
  },[]);

  return (
    <aside className="w-72 bg-gray-800 p-4 flex flex-col border-r border-gray-700 shadow-lg h-full">
      
      {/* Top Section: Image Uploader */}
      <div className="flex-shrink-0">
        <h2 className="text-xl font-bold mb-4 text-white">Image</h2>
        <div 
          className="h-40 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer mb-4 bg-gray-900/50"
          onClick={handleUploadAreaClick}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
          ) : (
            <p className="text-center px-2">Click to upload image</p>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={handleLoadClick}
          disabled={!selectedFile}
          className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-green-700 transition-colors duration-200 shadow-md"
        >
          Load Image
        </button>
      </div>

      <div className="border-t border-gray-700 my-4 flex-shrink-0"></div>

      {/* Middle Section: Tools (scrollable) */}
      <div className="flex-grow overflow-y-auto min-h-0 pr-2">
        <h2 className="text-xl font-bold mb-4 text-white sticky top-0 bg-gray-800 py-1 z-10">Tools</h2>
        <div className="grid grid-cols-4 gap-2">
          {toolConfig.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              title={tool.name}
              className={`aspect-square flex items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
                activeTool === tool.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tool.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-700 my-4 flex-shrink-0"></div>

      {/* Bottom Section: Actions */}
      <div className="flex-shrink-0 space-y-3">
         <button
          onClick={onInitiateSave}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center justify-center"
        >
          Save Current Layout
        </button>
        <button
          onClick={onClear}
          title="Clear Canvas"
          className="w-full flex items-center justify-center p-3 rounded-lg transition-colors duration-200 bg-red-600 text-white hover:bg-red-700 shadow-md"
        >
          <ClearIcon />
          <span className="ml-4 font-medium">Clear Canvas</span>
        </button>
        <button
          onClick={onCancel}
          title="Back to Map"
          className="w-full flex items-center justify-center p-3 rounded-lg transition-colors duration-200 bg-gray-600 text-white hover:bg-gray-700 shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
          </svg>
          <span className="ml-4 font-medium">Back to Map</span>
        </button>
      </div>
    </aside>
  );
};

export default LeftPanel;
