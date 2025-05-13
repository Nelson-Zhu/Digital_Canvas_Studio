import { useState } from 'react';

// Future imports of components will go here
// import Canvas from './components/Canvas/Canvas';
// import Dashboard from './components/Dashboard/Dashboard';

function App() {
  const [highContrast, setHighContrast] = useState(false);
  
  // Example of theme toggle functionality
  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  return (
    <div className={`min-h-screen ${highContrast ? 'high-contrast' : ''}`}>
      <header className="bg-primary p-4 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl">Digital Canvas Studio</h1>
          <button 
            onClick={toggleHighContrast}
            className="btn bg-white text-primary hover:bg-neutral-light"
          >
            {highContrast ? 'Standard View' : 'High Contrast'}
          </button>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        <Home />
      </main>
      
      <footer className="bg-neutral-light p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>Digital Canvas Studio: Art Therapy Platform for Dementia Patients</p>
        </div>
      </footer>
    </div>
  );
}

// Temporary Home component
function Home() {
  return (
    <div className="text-center">
      <h2>Welcome to Digital Canvas Studio</h2>
      <p className="text-xl mb-8">An art therapy platform designed specifically for dementia patients</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3>Create Art</h3>
          <p className="mb-4">Express yourself through our specially designed digital canvas</p>
          <button className="btn-primary">Start Creating</button>
        </div>
        
        <div className="card">
          <h3>View Gallery</h3>
          <p className="mb-4">See your creative journey through time</p>
          <button className="btn-primary">Open Gallery</button>
        </div>
        
        <div className="card">
          <h3>Guided Creation</h3>
          <p className="mb-4">Follow step-by-step guidance to create beautiful art</p>
          <button className="btn-primary">Try Guided Mode</button>
        </div>
      </div>
    </div>
  );
}

export default App; 