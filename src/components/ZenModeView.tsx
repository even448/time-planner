import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pause, Play, Square } from 'lucide-react';

interface ZenModeViewProps {
  isActive: boolean;
  onExit: () => void;
  time: number; // 当前时间（秒）
  isRunning: boolean;
  onToggle: () => void;
  onStop: () => void;
  mode: 'pomodoro' | 'stopwatch';
  taskTitle?: string;
}

export default function ZenModeView({
  isActive,
  onExit,
  time,
  isRunning,
  onToggle,
  onStop,
  mode,
  taskTitle,
}: ZenModeViewProps) {
  const [showControls, setShowControls] = useState(true);
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null);

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return {
        main: `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
        sub: secs.toString().padStart(2, '0'),
      };
    }
    return {
      main: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
      sub: '',
    };
  };

  const { main, sub } = formatTime(time);

  // 处理全屏 API
  useEffect(() => {
    if (isActive) {
      // 进入全屏
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen().catch((err) => {
          console.error('无法进入全屏模式:', err);
        });
      }

      // 监听全屏退出
      const handleFullscreenChange = () => {
        // 只有当真正退出全屏时才调用 onExit
        if (!document.fullscreenElement) {
          onExit();
        }
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);

      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        // 只有当组件真正卸载时才退出全屏，而不是当依赖项变化时
        // 这样可以避免因为依赖项变化导致的意外退出
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {
            // 忽略错误
          });
        }
      };
    }
  }, [isActive]);

  // 处理 ESC 键退出
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        onExit();
      }
    };

    if (isActive) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isActive, onExit]);

  // 鼠标移动显示控制栏，3 秒后隐藏
  const handleMouseMove = () => {
    setShowControls(true);

    if (idleTimer) {
      clearTimeout(idleTimer);
    }

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    setIdleTimer(timer);
  };

  // 双击退出
  const handleDoubleClick = () => {
    onExit();
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center cursor-default"
      onMouseMove={handleMouseMove}
      onDoubleClick={handleDoubleClick}
      style={{ backgroundColor: '#000000' }}
    >
      {/* 任务标题 */}
      <AnimatePresence>
        {showControls && taskTitle && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-12 text-center"
          >
            <p className="text-gray-500 text-sm mb-2">当前任务</p>
            <p className="text-gray-300 text-xl font-medium">{taskTitle}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 计时器显示 - 超大字体 */}
      <div className="flex flex-col items-center">
        <motion.div
          className="font-mono font-thin tracking-wider"
          animate={{
            scale: isRunning ? [1, 1.02, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: isRunning ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          <span
            className="text-[clamp(6rem,20vw,16rem)] leading-none"
            style={{
              color: isRunning ? '#f97316' : '#6b7280', // orange-500 : gray-500
              textShadow: isRunning ? '0 0 60px rgba(249, 115, 22, 0.3)' : 'none',
            }}
          >
            {main}
          </span>
          {sub && (
            <span
              className="text-[clamp(3rem,10vw,8rem)] ml-4 leading-none"
              style={{ color: '#6b7280' }}
            >
              {sub}
            </span>
          )}
        </motion.div>

        {/* 模式标识 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="text-gray-600 text-sm mt-8 font-medium"
        >
          {mode === 'pomodoro' ? '🍅 番茄钟' : '⏱️ 正计时'}
        </motion.p>
      </div>

      {/* 控制栏 - 底部浮现 */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-12 flex items-center gap-6"
          >
            {/* 播放/暂停 */}
            <button
              onClick={onToggle}
              className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm
                       hover:bg-white/20 transition-all flex items-center justify-center
                       border border-white/20"
            >
              {isRunning ? (
                <Pause size={28} className="text-white" />
              ) : (
                <Play size={28} className="text-white ml-1" />
              )}
            </button>

            {/* 停止 */}
            <button
              onClick={onStop}
              className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm
                       hover:bg-white/20 transition-all flex items-center justify-center
                       border border-white/20"
            >
              <Square size={28} className="text-white" />
            </button>

            {/* 退出按钮 */}
            <button
              onClick={onExit}
              className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm
                       hover:bg-white/20 transition-all flex items-center justify-center
                       border border-white/20"
            >
              <X size={28} className="text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 提示文字 - 顶部淡入淡出 */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 text-center"
          >
            <p className="text-gray-600 text-xs">
              按 ESC 或双击屏幕退出全屏
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OLED 防止烧屏 - 轻微呼吸动画 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [0.05, 0.02, 0.05],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
        }}
      />
    </motion.div>
  );
}
