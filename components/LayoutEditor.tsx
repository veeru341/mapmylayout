import React, { useState, useRef } from 'react';
import LeftPanel from './LeftPanel';
import Playground from './Playground';
import SaveLayoutModal from './SaveLayoutModal';
import { Tool, Layout } from '../types';
import RightPanel from './RightPanel';

interface LayoutEditorProps {
  onSave: (layoutData: Omit<Layout, 'id'>) => void;
  onCancel: () => void;
  layouts: Layout[];
  selectedLayout: Layout | null;
  onSelectLayout: (layout: Layout | null) => void;
}

const LayoutEditor: React.FC<LayoutEditorProps> = ({ onSave, onCancel, layouts, selectedLayout, onSelectLayout }) => {
  const [activeTool, setActiveTool] = useState<Tool>(Tool.SELECT);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [clearCounter, setClearCounter] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = (src: string) => {
    setImageSrc(src);
    setClearCounter(c => c + 1);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setClearCounter(c => c + 1);
  };

  const handleInitiateSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.toDataURL() === document.createElement('canvas').toDataURL()) {
        alert("Canvas is empty. Please draw a layout before saving.");
        return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmSave = (name: string, owner: string) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave({ name, owner, dataUrl });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-800 text-gray-100 font-sans">
      <LeftPanel
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onClear={handleClear}
        onImageLoad={handleImageLoad}
        onInitiateSave={handleInitiateSave}
        onCancel={onCancel}
      />
      <main className="flex-1 flex items-center justify-center bg-gray-700">
        <Playground
          imageSrc={imageSrc}
          activeTool={activeTool}
          canvasRef={canvasRef}
          imageRef={imageRef}
          clearCounter={clearCounter}
        />
      </main>
      <RightPanel
        layouts={layouts}
        selectedLayout={selectedLayout}
        onSelectLayout={onSelectLayout}
      />
      <SaveLayoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleConfirmSave}
      />
    </div>
  );
};

export default LayoutEditor;