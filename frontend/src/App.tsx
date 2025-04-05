import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import './App.css';
import HomePage from './pages/HomePage'; // Direct import of your HomePage component

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <h1>Memory in a Jar</h1>
          <p>A place to store your precious memories</p>
        </header>
        
        <main>
          <Suspense fallback={<p>Loading...</p>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </Suspense>
        </main>
        
        <footer>
          <p>© 2025 Memory in a Jar</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
