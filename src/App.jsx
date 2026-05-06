import { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Restaurants from './pages/Restaurants';
import Votes from './pages/Votes';
import VoteDetail from './pages/VoteDetail';
import CreateVote from './pages/CreateVote';
import Users from './pages/Users';
import Departments from './pages/Departments';
import Archives from './pages/Archives';
import Manual from './pages/Manual';

const Router = () => {
  const { currentUser } = useApp();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!currentUser) {
    return <Login />;
  }

  const renderPage = () => {
    if (path === '/') return <Home />;
    if (path === '/home') return <Home />;
    if (path === '/restaurants') return <Restaurants />;
    if (path === '/votes') return <Votes />;
    if (path.startsWith('/votes/create')) return <CreateVote />;
    if (path.startsWith('/votes/')) return <VoteDetail />;
    if (path === '/users') return <Users />;
    if (path === '/departments') return <Departments />;
    if (path === '/archives') return <Archives />;
    if (path === '/manual') return <Manual />;
    return <Home />;
  };

  return renderPage();
};

function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}

export default App;
