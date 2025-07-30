import React, { useEffect, useRef } from 'react';
import { PlacedLayout, Layout } from '../types';

declare var L: any;

interface MapComponentProps {
    layouts: Layout[];
    placedLayouts: PlacedLayout[];
    setPlacedLayouts: React.Dispatch<React.SetStateAction<PlacedLayout[]>>;
    layoutToPlace: Layout | null;
    onPlacementComplete: () => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ layouts, placedLayouts, setPlacedLayouts, layoutToPlace, onPlacementComplete }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const interactionRef = useRef<any>(null);
  const placedLayoutsRef = useRef(placedLayouts);

  useEffect(() => {
    placedLayoutsRef.current = placedLayouts;
  }, [placedLayouts]);

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [51.505, -0.09],
        zoom: 13,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);

      // Fix for map not loading fully on initial render or after navigation.
      // This ensures the map correctly calculates its container size.
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Place new layout on map
  useEffect(() => {
    if (layoutToPlace && mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      const center = map.getCenter();
      
      const img = new Image();
      img.src = layoutToPlace.dataUrl;
      img.onload = () => {
        const aspect = img.width / img.height;
        const newWidth = 200;
        const newHeight = newWidth / aspect;

        const newPlacedLayout: PlacedLayout = {
          id: new Date().toISOString(),
          layoutId: layoutToPlace.id,
          dataUrl: layoutToPlace.dataUrl,
          position: center,
          size: { width: newWidth, height: newHeight },
          rotation: 0,
          isFixed: false,
        };
        setPlacedLayouts(prev => [...prev, newPlacedLayout]);
        onPlacementComplete();
      }
    }
  }, [layoutToPlace, setPlacedLayouts, onPlacementComplete]);

  // Sync placedLayouts with map layers
  useEffect(() => {
    const layerGroup = layerGroupRef.current;
    if (!layerGroup) return;

    const existingLayers: {[key: string]: any} = {};
    layerGroup.eachLayer((layer: any) => {
        if(layer.options.layoutId) {
            existingLayers[layer.options.layoutId] = layer;
        }
    });

    placedLayouts.forEach(layout => {
        const rad = layout.rotation * (Math.PI / 180);
        const absCos = Math.abs(Math.cos(rad));
        const absSin = Math.abs(Math.sin(rad));
        const iconW = layout.size.width * absCos + layout.size.height * absSin;
        const iconH = layout.size.width * absSin + layout.size.height * absCos;

        const iconHtml = createOverlayHtml(layout);
        const icon = L.divIcon({
            html: iconHtml,
            className: 'leaflet-div-icon',
            iconSize: [iconW, iconH],
            iconAnchor: [iconW / 2, iconH / 2]
        });

        if (existingLayers[layout.id]) { // Update existing layer
            const marker = existingLayers[layout.id];
            marker.setLatLng(layout.position);
            marker.setIcon(icon);
            
            if (layout.isFixed && !marker.isFixed) {
                marker.off();
                marker.dragging.disable();
                marker.isFixed = true; 
            } else if (!layout.isFixed) {
                // DOM is replaced, so re-attach handlers
                setTimeout(() => addInteractionHandlers(marker, layout), 0);
            }
            delete existingLayers[layout.id];
        } else { // Create new layer
            const marker = L.marker(layout.position, { 
                icon, 
                draggable: !layout.isFixed,
                layoutId: layout.id 
            }).addTo(layerGroup);
            
            marker.isFixed = layout.isFixed;

            if(!layout.isFixed) {
                addInteractionHandlers(marker, layout);
                marker.on('dragend', (e: any) => {
                    const newPosition = e.target.getLatLng();
                    updateLayout(layout.id, { position: newPosition });
                });
            } else {
                 marker.dragging.disable();
            }
        }
    });

    // Remove old layers
    Object.values(existingLayers).forEach(layer => layer.remove());

  }, [placedLayouts, layouts]);

  // Handle scaling fixed layouts on zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleZoom = () => {
        const currentZoom = map.getZoom();
        const layoutsToUpdate = placedLayoutsRef.current.filter(p => p.isFixed && p.initialZoom !== undefined);

        if (layoutsToUpdate.length > 0) {
            const updatedLayouts = placedLayoutsRef.current.map(l => {
                if (l.isFixed && l.initialZoom !== undefined && l.initialSize !== undefined) {
                    const scale = Math.pow(2, currentZoom - l.initialZoom);
                    const newSize = {
                        width: l.initialSize.width * scale,
                        height: l.initialSize.height * scale,
                    };
                    return { ...l, size: newSize };
                }
                return l;
            });
            setPlacedLayouts(updatedLayouts);
        }
    };
    map.on('zoomend', handleZoom);
    return () => { map.off('zoomend', handleZoom) };
  }, [setPlacedLayouts]);

  const updateLayout = (id: string, updates: Partial<PlacedLayout>) => {
    setPlacedLayouts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };
  
  const createOverlayHtml = (layout: PlacedLayout): string => {
    let contentHtml = '';

    if (layout.isFixed) {
        const originalLayout = layouts.find(l => l.id === layout.layoutId);
        const name = originalLayout ? originalLayout.name : '';
        if (name) {
            contentHtml = `<div class="fixed-layout-name">${name}</div>`;
        }
    } else {
        contentHtml = `
            ${['tl','t','tr','l','r','bl','b','br'].map(h => `<div class="overlay-handle handle-${h}" data-handle="${h}"></div>`).join('')}
            <div class="overlay-handle handle-rotator" data-handle="rotate"></div>
            <button class="fix-button" data-id="${layout.id}">Fix Layout</button>
        `;
    }

    return `
      <div 
        id="overlay-${layout.id}" 
        class="leaflet-layout-overlay-container ${layout.isFixed ? 'fixed' : ''}" 
        style="width: ${layout.size.width}px; height: ${layout.size.height}px; transform: rotate(${layout.rotation}deg);"
      >
        <img src="${layout.dataUrl}" alt="Layout" />
        ${contentHtml}
      </div>
    `;
  };

  const addInteractionHandlers = (marker: any, layout: PlacedLayout) => {
      const el = marker.getElement();
      if (!el || layout.isFixed) return;

      const fixButton = el.querySelector('.fix-button');
      if (fixButton) {
          fixButton.onclick = (e: MouseEvent) => {
              e.stopPropagation();
              e.preventDefault();
              const map = mapInstanceRef.current;
              const currentLayout = placedLayoutsRef.current.find(p => p.id === layout.id)!;
              updateLayout(layout.id, { 
                isFixed: true,
                initialZoom: map.getZoom(),
                initialSize: currentLayout.size,
               });
          };
      }

      el.querySelectorAll('.overlay-handle').forEach((handle: HTMLElement) => {
          handle.onmousedown = (e: MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              const handleType = handle.dataset.handle;
              const startLayout = placedLayoutsRef.current.find(p => p.id === layout.id)!;
              const map = mapInstanceRef.current;
              
              const centerPoint = map.latLngToContainerPoint(startLayout.position);
              const mapContainerRect = map.getContainer().getBoundingClientRect();
              const mouseX = e.clientX - mapContainerRect.left;
              const mouseY = e.clientY - mapContainerRect.top;

              interactionRef.current = {
                  type: handleType,
                  startEvent: e,
                  startLayout,
                  map,
                  centerPoint, // The stable center of the layout in map container coordinates
                  startAngle: Math.atan2(mouseY - centerPoint.y, mouseX - centerPoint.x),
              };

              map.dragging.disable();
              window.addEventListener('mousemove', onInteractionMove);
              window.addEventListener('mouseup', onInteractionEnd);
          };
      });
  };

  const onInteractionMove = (e: MouseEvent) => {
      if (!interactionRef.current) return;
      const { type, startEvent, startLayout, map, centerPoint, startAngle } = interactionRef.current;
      
      let newUpdates: Partial<PlacedLayout> = {};

      if (type === 'rotate') {
          const mapContainerRect = map.getContainer().getBoundingClientRect();
          const mouseX = e.clientX - mapContainerRect.left;
          const mouseY = e.clientY - mapContainerRect.top;
          
          const currentAngle = Math.atan2(mouseY - centerPoint.y, mouseX - centerPoint.x);
          const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
          newUpdates.rotation = startLayout.rotation + angleDiff;

      } else { // resize
          const dx = e.clientX - startEvent.clientX;
          const dy = e.clientY - startEvent.clientY;
          const rad = startLayout.rotation * (Math.PI / 180);
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);

          const localDx = dx * cos + dy * sin;
          const localDy = -dx * sin + dy * cos;

          let { width, height } = startLayout.size;
          let centerShiftX = 0;
          let centerShiftY = 0;

          if (type.includes('r')) { width += localDx; centerShiftX += localDx / 2; }
          if (type.includes('l')) { width -= localDx; centerShiftX -= localDx / 2; }
          if (type.includes('b')) { height += localDy; centerShiftY += localDy / 2; }
          if (type.includes('t')) { height -= localDy; centerShiftY -= localDy / 2; }

          if (width < 20) width = 20;
          if (height < 20) height = 20;

          const screenShiftX = centerShiftX * cos - centerShiftY * sin;
          const screenShiftY = centerShiftX * sin + centerShiftY * cos;
          
          const newCenterPoint = L.point(centerPoint.x + screenShiftX, centerPoint.y + screenShiftY);
          const newPosition = map.containerPointToLatLng(newCenterPoint);
          
          newUpdates.size = { width, height };
          newUpdates.position = newPosition;
      }
      
      if (Object.keys(newUpdates).length > 0) {
          updateLayout(startLayout.id, newUpdates);
      }
  };
  
  const onInteractionEnd = () => {
      if(interactionRef.current?.map) {
          interactionRef.current.map.dragging.enable();
      }
      interactionRef.current = null;
      window.removeEventListener('mousemove', onInteractionMove);
      window.removeEventListener('mouseup', onInteractionEnd);
  };


  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default MapComponent;