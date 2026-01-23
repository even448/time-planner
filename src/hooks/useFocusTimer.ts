import { useState, useEffect, useRef } from 'react';

type TimerMode = 'pomodoro' | 'stopwatch';
type TimerStatus = 'idle' | 'running' | 'paused';

interface UseFocusTimerOptions {
  mode: TimerMode;
  initialTime?: number; // seconds, for pomodoro
  onComplete?: () => void;
}

export function useFocusTimer({ mode, initialTime = 25 * 60, onComplete }: UseFocusTimerOptions) {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(initialTime); // for pomodoro
  const [elapsed, setElapsed] = useState(0); // for stopwatch
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const time = mode === 'pomodoro' ? timeLeft : elapsed;
  const totalTime = mode === 'pomodoro' ? initialTime : 0;

  useEffect(() => {
    if (status === 'running') {
      startTimeRef.current = Date.now();
      
      intervalRef.current = window.setInterval(() => {
        if (mode === 'pomodoro') {
          setTimeLeft((prev) => {
            const newTime = Math.max(0, prev - 1);
            if (newTime === 0) {
              stop();
              onComplete?.();
            }
            return newTime;
          });
        } else {
          setElapsed((prev) => prev + 1);
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, mode, onComplete]);

  const start = () => {
    setStatus('running');
  };

  const pause = () => {
    setStatus('paused');
  };

  const stop = () => {
    setStatus('idle');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const reset = () => {
    stop();
    if (mode === 'pomodoro') {
      setTimeLeft(initialTime);
    } else {
      setElapsed(0);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return {
    status,
    time,
    totalTime,
    formattedTime: formatTime(time),
    start,
    pause,
    stop,
    reset,
    isRunning: status === 'running',
    isPaused: status === 'paused',
    isIdle: status === 'idle',
  };
}
