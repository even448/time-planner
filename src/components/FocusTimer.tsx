import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, ButtonGroup, Select, SelectItem } from '@nextui-org/react';
import { Play, Pause, Square, RotateCcw, Maximize } from 'lucide-react';
import { useFocusTimer } from '../hooks/useFocusTimer';
import useAppStore from '../store/useAppStore';
import ZenModeView from './ZenModeView';

type TimerMode = 'pomodoro' | 'stopwatch';

const POMODORO_PRESETS = [
  { label: '25 分钟', value: 25 * 60 },
  { label: '45 分钟', value: 45 * 60 },
  { label: '60 分钟', value: 60 * 60 },
];

export default function FocusTimer() {
  const location = useLocation();
  const { addFocusSession, focusTasks } = useAppStore();
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [isZenMode, setIsZenMode] = useState(false);

  // 处理从 Todo 传递的任务
  useEffect(() => {
    if (location.state?.taskName) {
      const task = focusTasks.find(t => t.title === location.state.taskName);
      if (task) {
        setSelectedTask(task.id);
      }
    }
  }, [location.state, focusTasks]);

  const timer = useFocusTimer({
    mode,
    initialTime: pomodoroTime,
    onComplete: () => {
      // 计时完成
      if (sessionStartTime) {
        addFocusSession({
          taskId: selectedTask || undefined,
          taskTitle: focusTasks.find((t) => t.id === selectedTask)?.title || '未命名任务',
          startTime: sessionStartTime,
          duration: mode === 'pomodoro' ? pomodoroTime : timer.time,
          type: mode,
        });
      }
      // 通知
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('专注完成！', {
          body: '恭喜完成一个专注时段 🎉',
          icon: 'https://cdn-icons-png.flaticon.com/512/2921/2921226.png',
        });
      }
    },
  });

  // 重置计时器当切换模式时
  useEffect(() => {
    timer.reset();
  }, [mode]);

  const handleStart = () => {
    if (timer.isIdle) {
      setSessionStartTime(new Date().toISOString());
    }
    timer.start();
  };

  const handleStop = () => {
    if (sessionStartTime) {
      addFocusSession({
        taskId: selectedTask || undefined,
        taskTitle: focusTasks.find((t) => t.id === selectedTask)?.title || '未命名任务',
        startTime: sessionStartTime,
        duration: mode === 'pomodoro' ? pomodoroTime - timer.time : timer.time,
        type: mode,
      });
      setSessionStartTime(null);
    }
    timer.stop();
  };

  const handleToggleZenMode = () => {
    setIsZenMode(!isZenMode);
  };

  const handleExitZenMode = useCallback(() => {
    setIsZenMode(false);
  }, []);

  // 进度百分比
  const progress = mode === 'pomodoro' && timer.totalTime > 0
    ? ((timer.totalTime - timer.time) / timer.totalTime) * 100
    : 0;

  // SVG 圆形进度
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      <div className="flex flex-col items-center">
        {/* 模式切换 */}
        <ButtonGroup className="mb-6" color="primary">
          <Button
            onPress={() => setMode('pomodoro')}
            variant={mode === 'pomodoro' ? 'solid' : 'bordered'}
          >
            🍅 番茄钟
          </Button>
          <Button
            onPress={() => setMode('stopwatch')}
            variant={mode === 'stopwatch' ? 'solid' : 'bordered'}
          >
            ⏱️ 秒表
          </Button>
        </ButtonGroup>

        {/* 番茄钟时长选择 */}
        {mode === 'pomodoro' && timer.isIdle && (
          <div className="w-full max-w-xs mb-6">
            <Select
              label="专注时长"
              selectedKeys={[pomodoroTime.toString()]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setPomodoroTime(parseInt(value));
              }}
            >
              {POMODORO_PRESETS.map((preset) => (
                <SelectItem key={preset.value.toString()} value={preset.value.toString()}>
                  {preset.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        )}

        {/* 任务选择 */}
        {focusTasks.length > 0 && timer.isIdle && (
          <div className="w-full max-w-xs mb-6">
            <Select
              label="关联任务"
              placeholder="选择任务（可选）"
              selectedKeys={selectedTask ? [selectedTask] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setSelectedTask(value);
              }}
            >
              {focusTasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.title}
                </SelectItem>
              ))}
            </Select>
          </div>
        )}

        {/* 圆形计时器 */}
        <div className="relative mb-8">
          <svg className="w-80 h-80 transform -rotate-90">
            {/* 背景圆 */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-stone-200 dark:text-stone-700"
            />
            {/* 进度圆 */}
            {mode === 'pomodoro' && (
              <motion.circle
                cx="160"
                cy="160"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                className="text-primary"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset,
                }}
                initial={false}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.5 }}
              />
            )}
          </svg>

          {/* 中心时间显示 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-bold hero-number text-stone-800 dark:text-stone-100">
              {timer.formattedTime}
            </div>
            <div className="text-sm text-stone-500 dark:text-stone-400 mt-2">
              {mode === 'pomodoro' ? '专注时间' : '已用时间'}
            </div>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center space-x-4">
          {timer.isIdle && (
            <Button
              size="lg"
              color="success"
              className="w-24 h-24 rounded-full text-xl shadow-2xl"
              onPress={handleStart}
              startContent={<Play size={32} fill="currentColor" />}
            />
          )}

          {timer.isRunning && (
            <>
              <Button
                size="lg"
                color="warning"
                className="w-20 h-20 rounded-full shadow-xl"
                onPress={timer.pause}
                startContent={<Pause size={24} fill="currentColor" />}
              />
              <Button
                size="lg"
                color="danger"
                className="w-20 h-20 rounded-full shadow-xl"
                onPress={handleStop}
                startContent={<Square size={24} />}
              />
              <Button
                size="lg"
                color="primary"
                variant="flat"
                className="w-16 h-16 rounded-full"
                onPress={handleToggleZenMode}
                startContent={<Maximize size={20} />}
              />
            </>
          )}

          {timer.isPaused && (
            <>
              <Button
                size="lg"
                color="success"
                className="w-20 h-20 rounded-full shadow-xl"
                onPress={timer.start}
                startContent={<Play size={24} fill="currentColor" />}
              />
              <Button
                size="lg"
                color="danger"
                className="w-20 h-20 rounded-full shadow-xl"
                onPress={handleStop}
                startContent={<Square size={24} />}
              />
              <Button
                size="lg"
                variant="bordered"
                className="w-16 h-16 rounded-full"
                onPress={timer.reset}
                startContent={<RotateCcw size={20} />}
              />
            </>
          )}
        </div>

        {/* 状态提示 */}
        {timer.isRunning && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center text-stone-500 dark:text-stone-400"
          >
            {mode === 'pomodoro' ? '保持专注，不要分心...' : '计时进行中...'}
          </motion.p>
        )}
      </div>

      {/* Zen 模式全屏视图 */}
      <ZenModeView
        isActive={isZenMode}
        onExit={handleExitZenMode}
        time={timer.time}
        isRunning={timer.isRunning}
        onToggle={timer.isRunning ? timer.pause : timer.start}
        onStop={handleStop}
        mode={mode}
        taskTitle={focusTasks.find((t) => t.id === selectedTask)?.title}
      />
    </>
  );
}
