import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { Plus } from 'lucide-react';

// 咖啡插画 SVG
const CoffeeIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto text-stone-300 dark:text-stone-600">
    <motion.g
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* 杯身 */}
      <path d="M30 40H90C90 40 90 75 60 75C30 75 30 40 30 40Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M90 45H100C105.523 45 110 49.4772 110 55V60C110 65.5228 105.523 70 100 70H90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      {/* 碟子 */}
      <path d="M20 75H100" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      
      {/* 热气动画 */}
      <motion.path 
        d="M45 15Q50 25 45 35" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
        animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path 
        d="M60 10Q65 20 60 30" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
        animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
      <motion.path 
        d="M75 15Q80 25 75 35" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
        animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />
    </motion.g>
  </svg>
);

// 起跑线/旗帜插画 SVG
const StartLineIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto text-stone-300 dark:text-stone-600">
    <motion.g
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* 地面/起跑线 */}
      <path d="M20 90H100" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="M20 90L40 70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
      <path d="M100 90L80 70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
      
      {/* 旗帜杆 */}
      <path d="M40 90V20" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      
      {/* 旗帜 */}
      <motion.path 
        d="M40 20H90L80 35L90 50H40" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        animate={{ scaleX: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* 装饰元素 */}
      <circle cx="95" cy="85" r="2" fill="currentColor" className="opacity-50"/>
      <circle cx="105" cy="80" r="1" fill="currentColor" className="opacity-30"/>
    </motion.g>
  </svg>
);

interface EmptyStateProps {
  type: 'todo' | 'focus';
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ type, message, actionLabel, onAction }: EmptyStateProps) {
  const config = {
    todo: {
      illustration: <CoffeeIllustration />,
      defaultMessage: '享受当下的宁静吧',
      defaultActionLabel: '开始第一个任务',
    },
    focus: {
      illustration: <StartLineIllustration />,
      defaultMessage: '千里之行，始于足下',
      defaultActionLabel: '开始专注',
    },
  };

  const currentConfig = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-6 transform hover:scale-105 transition-transform duration-500">
        {currentConfig.illustration}
      </div>
      
      <motion.p 
        className="text-stone-500 dark:text-stone-400 text-lg font-medium mb-8 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {message || currentConfig.defaultMessage}
      </motion.p>

      {onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            size="lg"
            color="primary"
            variant="shadow"
            startContent={<Plus />}
            onPress={onAction}
            className="font-semibold animate-pulse-slow"
            style={{
              boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.39)',
            }}
          >
            {actionLabel || currentConfig.defaultActionLabel}
          </Button>
        </motion.div>
      )}

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
      `}</style>
    </div>
  );
}
