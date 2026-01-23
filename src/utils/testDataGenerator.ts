/**
 * 测试数据生成器
 * 用于生成模拟的专注会话数据，方便测试统计功能
 */

import { FocusSession } from '../types';
import { subDays, subHours } from 'date-fns';

/**
 * 生成随机的任务标题
 */
function getRandomTask(): string {
  const tasks = [
    '编程学习',
    '阅读',
    '写作',
    '锻炼',
    '工作项目',
    '学英语',
    '画画',
    '做饭',
    '整理',
    '冥想',
  ];
  return tasks[Math.floor(Math.random() * tasks.length)];
}

/**
 * 生成随机的会话类型
 */
function getRandomType(): 'pomodoro' | 'stopwatch' {
  return Math.random() > 0.5 ? 'pomodoro' : 'stopwatch';
}

/**
 * 生成随机的时长（秒）
 * 番茄钟通常是 25 分钟，正计时可能更长
 */
function getRandomDuration(type: 'pomodoro' | 'stopwatch'): number {
  if (type === 'pomodoro') {
    // 20-30 分钟
    return Math.floor(Math.random() * 600) + 1200;
  } else {
    // 10-120 分钟
    return Math.floor(Math.random() * 6600) + 600;
  }
}

/**
 * 生成随机的时间（在指定日期内）
 */
function getRandomTimeInDay(daysAgo: number): Date {
  const date = subDays(new Date(), daysAgo);
  // 工作时间：8:00 - 22:00
  const hour = Math.floor(Math.random() * 14) + 8;
  const minute = Math.floor(Math.random() * 60);
  
  date.setHours(hour, minute, 0, 0);
  return date;
}

/**
 * 生成测试会话数据
 * @param days 生成多少天的数据
 * @param sessionsPerDay 每天大约多少个会话（会有随机波动）
 */
export function generateTestSessions(
  days: number = 90,
  sessionsPerDay: number = 3
): FocusSession[] {
  const sessions: FocusSession[] = [];
  let idCounter = 1;
  
  for (let i = 0; i < days; i++) {
    // 随机决定这一天是否有会话（模拟不连续的情况）
    const hasSession = Math.random() > 0.2; // 80% 的天数有会话
    
    if (hasSession) {
      // 每天的会话数有波动
      const dailySessions = Math.floor(
        Math.random() * sessionsPerDay + sessionsPerDay / 2
      );
      
      for (let j = 0; j < dailySessions; j++) {
        const type = getRandomType();
        const duration = getRandomDuration(type);
        const createdAt = getRandomTimeInDay(i);
        const taskTitle = getRandomTask();
        
        sessions.push({
          id: `test-${idCounter++}`,
          taskTitle,
          startTime: subHours(createdAt, duration / 3600).toISOString(),
          duration,
          type,
          createdAt: createdAt.toISOString(),
        });
      }
    }
  }
  
  // 按时间排序（最早的在前面）
  sessions.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  return sessions;
}

/**
 * 生成连续专注的测试数据（模拟好习惯）
 */
export function generateStreakTestSessions(days: number = 30): FocusSession[] {
  const sessions: FocusSession[] = [];
  let idCounter = 1;
  
  for (let i = 0; i < days; i++) {
    // 每天 2-4 个会话
    const dailySessions = Math.floor(Math.random() * 3) + 2;
    
    for (let j = 0; j < dailySessions; j++) {
      const type = getRandomType();
      const duration = getRandomDuration(type);
      const createdAt = getRandomTimeInDay(i);
      const taskTitle = getRandomTask();
      
      sessions.push({
        id: `streak-${idCounter++}`,
        taskTitle,
        startTime: subHours(createdAt, duration / 3600).toISOString(),
        duration,
        type,
        createdAt: createdAt.toISOString(),
      });
    }
  }
  
  sessions.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  return sessions;
}

/**
 * 在浏览器控制台使用示例：
 * 
 * // 导入函数
 * import { generateTestSessions } from './utils/testDataGenerator';
 * import useAppStore from './store/useAppStore';
 * 
 * // 生成并添加测试数据
 * const testSessions = generateTestSessions(90, 3);
 * testSessions.forEach(session => {
 *   useAppStore.getState().addFocusSession(session);
 * });
 * 
 * // 或者在开发工具中直接使用
 * window.generateTestData = () => {
 *   const sessions = generateTestSessions(90, 3);
 *   sessions.forEach(s => useAppStore.getState().addFocusSession(s));
 *   console.log(`Generated ${sessions.length} test sessions`);
 * };
 */

// 如果在开发环境，可以将函数暴露到 window 对象
if (import.meta.env.DEV) {
  (window as any).generateTestSessions = generateTestSessions;
  (window as any).generateStreakTestSessions = generateStreakTestSessions;
  console.log('🧪 Test data generators available:');
  console.log('  - window.generateTestSessions(days, sessionsPerDay)');
  console.log('  - window.generateStreakTestSessions(days)');
}
