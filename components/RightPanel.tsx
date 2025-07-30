import React from 'react';
import { Layout } from '../types';

interface RightPanelProps {
  layouts: Layout[];
  selectedLayout: Layout | null;
  onSelectLayout: (layout: Layout | null) => void;
  onCreateClick?: () => void;
  onPlaceLayout?: (layout: Layout) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ layouts, selectedLayout, onSelectLayout, onCreateClick, onPlaceLayout }) => {
  return (
    <aside className="w-80 bg-gray-800 p-6 flex flex-col border-l border-gray-700 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white flex-shrink-0">All Layouts</h2>
      
      {onCreateClick && (
        <div className="mb-4">
          <button
              onClick={onCreateClick}
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md flex items-center justify-center"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Layout
          </button>
        </div>
      )}

      <div className="flex-grow overflow-y-auto border-t border-gray-700 min-h-0">
        {layouts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-gray-500 px-4">
            <p>No layouts found. Click 'Create New Layout' to begin.</p>
          </div>
        ) : (
          <div className="py-2 space-y-2">
            {layouts.map((layout) => {
              const isSelected = selectedLayout?.id === layout.id;
              return (
                <div key={layout.id} className="bg-gray-700/50 rounded-lg overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => onSelectLayout(layout)}
                    className={`w-full text-left p-3 font-medium transition-colors duration-200 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    {layout.name}
                  </button>

                  <div className={`transition-all duration-300 ease-in-out grid ${isSelected ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                       <div className="p-2 bg-gray-900/50 relative border-t border-blue-500/50">
                        <button 
                          onClick={() => onSelectLayout(null)} 
                          className="absolute top-3 right-3 bg-black/50 text-white rounded-full h-6 w-6 flex items-center justify-center hover:bg-red-500 transition-colors z-10 text-lg font-bold leading-none"
                          aria-label="Close preview"
                        >
                          &times;
                        </button>
                        <img 
                          src={layout.dataUrl} 
                          alt={`Preview of ${layout.name}`} 
                          className="w-full h-auto object-contain rounded" 
                        />
                        {onPlaceLayout && (
                          <div className="pt-3">
                             <button
                                onClick={() => onPlaceLayout(layout)}
                                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center justify-center"
                              >
                                Place on Map
                              </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default RightPanel;