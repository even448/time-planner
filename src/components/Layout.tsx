import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { Clock, List, Timer, BarChart3, Sun, Moon, Settings } from 'lucide-react';
import { Button } from '@nextui-org/react';
import useAppStore from '../store/useAppStore';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  // 导航项配置
  const navItems = [
    { path: '/', icon: Clock, label: '倒数日', color: 'from-orange-500 to-amber-500' },
    { path: '/todo', icon: List, label: '待办', color: 'from-red-500 to-rose-500' },
    { path: '/focus', icon: Timer, label: '专注', color: 'from-emerald-500 to-green-500' },
    { path: '/stats', icon: BarChart3, label: '统计', color: 'from-blue-500 to-purple-500' },
    { path: '/settings', icon: Settings, label: '设置', color: 'from-gray-500 to-gray-700' },
  ];

  return (
    <div className="h-screen overflow-hidden flex flex-col relative">
      {/* 主内容区域 */}
      <main className="flex-1 overflow-auto relative">
        <div className="w-full max-w-[1200px] mx-auto px-4 py-4 pb-28">
          {children}
        </div>
      </main>

      {/* Bottom Dock - Glassmorphism */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <nav className="glass rounded-full shadow-2xl border border-stone-200/50 dark:border-stone-800/50 px-4 py-2">
          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    className="relative flex flex-col items-center"
                    animate={{
                      y: isActive ? -15 : 0,
                      scale: isActive ? 1.1 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {/* Icon Container */}
                    <motion.div
                      className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center
                        ${isActive 
                          ? `bg-gradient-to-br ${item.color} shadow-lg` 
                          : 'bg-transparent'
                        }
                      `}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Icon
                        size={24}
                        className={
                          isActive 
                            ? 'text-white' 
                            : 'text-stone-400 dark:text-stone-500'
                        }
                        strokeWidth={2.5}
                      />
                    </motion.div>
                    
                    {/* Label - Hidden when active */}
                    <motion.span
                      className="text-xs mt-1 text-stone-500 dark:text-stone-400 font-medium"
                      animate={{
                        opacity: isActive ? 0 : 1,
                        height: isActive ? 0 : 'auto',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {!isActive && item.label}
                    </motion.span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
