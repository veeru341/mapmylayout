import React, { useState } from 'react';
import { Layout, PlacedLayout } from './types';
import RightPanel from './components/RightPanel';
import MapComponent from './components/MapComponent';
import LayoutEditor from './components/LayoutEditor';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [view, setView] = useState<'map' | 'create'>('map');
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);
  const [placedLayouts, setPlacedLayouts] = useState<PlacedLayout[]>([]);
  const [layoutToPlace, setLayoutToPlace] = useState<Layout | null>(null);

  const handleLogin = async (email: string, password: string): Promise<string | true> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user && userCredential.user.email) {
        setUserEmail(userCredential.user.email);
        setIsAuthenticated(true);
        return true;
      }
      return 'unknown-error'; // Should not happen if login succeeds
    } catch (error: any) {
      console.error("Firebase authentication error:", error);
      // Use duck-typing to check for a Firebase error object
      if (error && error.code && typeof error.code === 'string') {
        return error.code;
      }
      return 'unknown-error';
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setUserEmail('');
      setView('map');
      setLayouts([]);
      setSelectedLayout(null);
      setPlacedLayouts([]);
      setLayoutToPlace(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSelectLayout = (layout: Layout | null) => {
    setSelectedLayout(prev => (prev?.id === layout?.id ? null : layout));
  };
  
  const handleNavigateToCreator = () => {
    setView('create');
    setSelectedLayout(null); 
  };

  const handleCancelCreation = () => {
    setView('map');
  };

  const handleSaveLayout = (newLayoutData: Omit<Layout, 'id'>) => {
    const newLayout: Layout = {
      id: new Date().toISOString(),
      ...newLayoutData
    };
    setLayouts(prev => [...prev, newLayout]);
    setView('map');
  };

  const handlePlaceLayoutOnMap = (layout: Layout) => {
    setLayoutToPlace(layout);
    setSelectedLayout(null);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (view === 'create') {
    return (
      <LayoutEditor 
        onSave={handleSaveLayout} 
        onCancel={handleCancelCreation}
        layouts={layouts}
        selectedLayout={selectedLayout}
        onSelectLayout={handleSelectLayout}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-800 text-gray-100 font-sans">
      <Header email={userEmail} onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex items-center justify-center bg-gray-900/50">
          <MapComponent 
             layouts={layouts}
             placedLayouts={placedLayouts}
             setPlacedLayouts={setPlacedLayouts}
             layoutToPlace={layoutToPlace}
             onPlacementComplete={() => setLayoutToPlace(null)}
          />
        </main>
        <RightPanel 
          layouts={layouts}
          selectedLayout={selectedLayout}
          onSelectLayout={handleSelectLayout}
          onCreateClick={handleNavigateToCreator}
          onPlaceLayout={handlePlaceLayoutOnMap}
        />
      </div>
    </div>
  );
}