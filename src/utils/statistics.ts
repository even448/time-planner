import { FocusSession } from '../types';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  parseISO,
  isWithinInterval,
  subDays,
  differenceInDays,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

// ==================== 类型定义 ====================

export interface DailyStats {
  date: string; // YYYY-MM-DD
  totalDuration: number; // seconds
  sessionCount: number;
  pomodoroCount: number;
  stopwatchCount: number;
}

export interface TaskStats {
  taskTitle: string;
  totalDuration: number; // seconds
  sessionCount: number;
  percentage: number;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  days: DailyStats[];
  totalDuration: number;
}

export interface OverallStats {
  totalSessions: number;
  totalDuration: number; // seconds
  averageDuration: number; // seconds per session
  totalDays: number; // days with at least one session
  longestStreak: number; // consecutive days
  currentStreak: number; // consecutive days until today
  favoriteTask: string;
  mostProductiveHour: number; // 0-23
}

export interface HeatmapData {
  date: string; // YYYY-MM-DD
  count: number; // session count
  level: 0 | 1 | 2 | 3 | 4; // intensity level for coloring
}

// ==================== 工具函数 ====================

/**
 * 将秒数转换为可读格式
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
}

/**
 * 将秒数转换为小时（保留两位小数）
 */
export function secondsToHours(seconds: number): number {
  return Math.round((seconds / 3600) * 100) / 100;
}

/**
 * 获取会话的日期字符串（YYYY-MM-DD）
 */
function getSessionDate(session: FocusSession): string {
  return format(parseISO(session.createdAt), 'yyyy-MM-dd');
}

/**
 * 获取会话的小时（0-23）
 */
function getSessionHour(session: FocusSession): number {
  return parseISO(session.createdAt).getHours();
}

// ==================== 统计计算函数 ====================

/**
 * 计算每日统计数据
 */
export function calculateDailyStats(
  sessions: FocusSession[],
  days: number = 30
): DailyStats[] {
  const today = new Date();
  
  const dailyMap = new Map<string, DailyStats>();
  
  // 初始化所有日期
  for (let i = 0; i < days; i++) {
    const date = format(subDays(today, days - 1 - i), 'yyyy-MM-dd');
    dailyMap.set(date, {
      date,
      totalDuration: 0,
      sessionCount: 0,
      pomodoroCount: 0,
      stopwatchCount: 0,
    });
  }
  
  // 聚合会话数据
  sessions.forEach((session) => {
    const date = getSessionDate(session);
    const stats = dailyMap.get(date);
    
    if (stats) {
      stats.totalDuration += session.duration;
      stats.sessionCount += 1;
      if (session.type === 'pomodoro') {
        stats.pomodoroCount += 1;
      } else {
        stats.stopwatchCount += 1;
      }
    }
  });
  
  return Array.from(dailyMap.values());
}

/**
 * 计算本周统计数据
 */
export function calculateWeeklyStats(sessions: FocusSession[]): WeeklyStats {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 周一开始
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const dailyMap = new Map<string, DailyStats>();
  
  // 初始化本周每一天
  days.forEach((day) => {
    const date = format(day, 'yyyy-MM-dd');
    dailyMap.set(date, {
      date,
      totalDuration: 0,
      sessionCount: 0,
      pomodoroCount: 0,
      stopwatchCount: 0,
    });
  });
  
  // 聚合本周会话数据
  sessions.forEach((session) => {
    const sessionDate = parseISO(session.createdAt);
    if (isWithinInterval(sessionDate, { start: weekStart, end: weekEnd })) {
      const date = format(sessionDate, 'yyyy-MM-dd');
      const stats = dailyMap.get(date);
      
      if (stats) {
        stats.totalDuration += session.duration;
        stats.sessionCount += 1;
        if (session.type === 'pomodoro') {
          stats.pomodoroCount += 1;
        } else {
          stats.stopwatchCount += 1;
        }
      }
    }
  });
  
  const dayStats = Array.from(dailyMap.values());
  const totalDuration = dayStats.reduce((sum, day) => sum + day.totalDuration, 0);
  
  return {
    weekStart: format(weekStart, 'yyyy-MM-dd'),
    weekEnd: format(weekEnd, 'yyyy-MM-dd'),
    days: dayStats,
    totalDuration,
  };
}

/**
 * 计算任务统计数据
 */
export function calculateTaskStats(sessions: FocusSession[]): TaskStats[] {
  const taskMap = new Map<string, { duration: number; count: number }>();
  let totalDuration = 0;
  
  sessions.forEach((session) => {
    const title = session.taskTitle || '未分类';
    const existing = taskMap.get(title) || { duration: 0, count: 0 };
    taskMap.set(title, {
      duration: existing.duration + session.duration,
      count: existing.count + 1,
    });
    totalDuration += session.duration;
  });
  
  return Array.from(taskMap.entries())
    .map(([taskTitle, { duration, count }]) => ({
      taskTitle,
      totalDuration: duration,
      sessionCount: count,
      percentage: totalDuration > 0 ? (duration / totalDuration) * 100 : 0,
    }))
    .sort((a, b) => b.totalDuration - a.totalDuration);
}

/**
 * 计算连续天数（Streak）
 */
function calculateStreak(sessions: FocusSession[]): {
  longest: number;
  current: number;
} {
  if (sessions.length === 0) {
    return { longest: 0, current: 0 };
  }
  
  // 获取所有有会话的日期（去重）
  const datesSet = new Set(sessions.map(getSessionDate));
  const dates = Array.from(datesSet).sort();
  
  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 1;
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  
  // 计算最长连续天数
  for (let i = 1; i < dates.length; i++) {
    const prevDate = parseISO(dates[i - 1]);
    const currDate = parseISO(dates[i]);
    const diff = differenceInDays(currDate, prevDate);
    
    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);
  
  // 计算当前连续天数（必须包含今天或昨天）
  if (dates.includes(today)) {
    currentStreak = 1;
    for (let i = 1; i <= dates.length; i++) {
      const checkDate = format(subDays(new Date(), i), 'yyyy-MM-dd');
      if (dates.includes(checkDate)) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else if (dates.includes(yesterday)) {
    currentStreak = 1;
    for (let i = 2; i <= dates.length; i++) {
      const checkDate = format(subDays(new Date(), i), 'yyyy-MM-dd');
      if (dates.includes(checkDate)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  return { longest: longestStreak, current: currentStreak };
}

/**
 * 计算总体统计数据
 */
export function calculateOverallStats(sessions: FocusSession[]): OverallStats {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalDuration: 0,
      averageDuration: 0,
      totalDays: 0,
      longestStreak: 0,
      currentStreak: 0,
      favoriteTask: '暂无数据',
      mostProductiveHour: 0,
    };
  }
  
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
  const averageDuration = totalDuration / sessions.length;
  
  // 计算总天数
  const uniqueDates = new Set(sessions.map(getSessionDate));
  const totalDays = uniqueDates.size;
  
  // 计算连续天数
  const { longest, current } = calculateStreak(sessions);
  
  // 计算最喜欢的任务
  const taskStats = calculateTaskStats(sessions);
  const favoriteTask = taskStats.length > 0 ? taskStats[0].taskTitle : '暂无数据';
  
  // 计算最高效的小时
  const hourMap = new Map<number, number>();
  sessions.forEach((session) => {
    const hour = getSessionHour(session);
    hourMap.set(hour, (hourMap.get(hour) || 0) + session.duration);
  });
  
  let mostProductiveHour = 0;
  let maxDuration = 0;
  hourMap.forEach((duration, hour) => {
    if (duration > maxDuration) {
      maxDuration = duration;
      mostProductiveHour = hour;
    }
  });
  
  return {
    totalSessions: sessions.length,
    totalDuration,
    averageDuration,
    totalDays,
    longestStreak: longest,
    currentStreak: current,
    favoriteTask,
    mostProductiveHour,
  };
}

/**
 * 生成热力图数据（GitHub 风格）
 */
export function generateHeatmapData(
  sessions: FocusSession[],
  days: number = 365
): HeatmapData[] {
  const today = new Date();
  
  const dailyMap = new Map<string, number>();
  
  // 统计每天的会话数
  sessions.forEach((session) => {
    const date = getSessionDate(session);
    dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
  });
  
  // 获取最大会话数用于计算等级
  const maxCount = Math.max(...Array.from(dailyMap.values()), 1);
  
  // 生成所有日期的数据
  const heatmapData: HeatmapData[] = [];
  for (let i = 0; i < days; i++) {
    const date = format(subDays(today, days - 1 - i), 'yyyy-MM-dd');
    const count = dailyMap.get(date) || 0;
    
    // 计算等级（0-4）
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > 0) {
      const ratio = count / maxCount;
      if (ratio >= 0.75) level = 4;
      else if (ratio >= 0.5) level = 3;
      else if (ratio >= 0.25) level = 2;
      else level = 1;
    }
    
    heatmapData.push({ date, count, level });
  }
  
  return heatmapData;
}

/**
 * 计算每小时的生产力数据（用于柱状图）
 */
export function calculateHourlyProductivity(sessions: FocusSession[]): {
  hour: number;
  duration: number;
  sessionCount: number;
}[] {
  const hourMap = new Map<number, { duration: number; count: number }>();
  
  // 初始化 0-23 小时
  for (let i = 0; i < 24; i++) {
    hourMap.set(i, { duration: 0, count: 0 });
  }
  
  // 聚合数据
  sessions.forEach((session) => {
    const hour = getSessionHour(session);
    const stats = hourMap.get(hour)!;
    stats.duration += session.duration;
    stats.count += 1;
  });
  
  return Array.from(hourMap.entries()).map(([hour, { duration, count }]) => ({
    hour,
    duration,
    sessionCount: count,
  }));
}

/**
 * 获取近期趋势数据（用于折线图）
 */
export function getTrendData(
  sessions: FocusSession[],
  days: number = 30
): {
  date: string;
  duration: number; // 转换为小时
  sessions: number;
}[] {
  const dailyStats = calculateDailyStats(sessions, days);
  
  return dailyStats.map((stat) => ({
    date: format(parseISO(stat.date), 'MM/dd', { locale: zhCN }),
    duration: secondsToHours(stat.totalDuration),
    sessions: stat.sessionCount,
  }));
}
