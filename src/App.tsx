import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import CountdownPage from './pages/CountdownPage';
import TodoPage from './pages/TodoPage';
import FocusPage from './pages/FocusPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import useAppStore from './store/useAppStore';

function App() {
  const { settings } = useAppStore();

  // 初始化主题
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CountdownPage />} />
        <Route path="/todo" element={<TodoPage />} />
        <Route path="/focus" element={<FocusPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
