// ==================== 类型定义 ====================

export interface Countdown {
  id: string;
  title: string;
  targetDate: string; // ISO string
  createdAt: string; // ISO string
  bgImage?: string;
  countUpMode: boolean; // true = 正数计时（纪念日）
  repeat: 'none' | 'yearly' | 'monthly' | 'weekly';
  archived: boolean;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoHistory {
  date: string; // ISO string (date only)
  completed: boolean;
  tag?: string; // Git-style commit tag
}

export interface Todo {
  id: string;
  title: string;
  partition: string; // 分区/分类
  completed: boolean;
  createdAt: string; // ISO string
  subtasks: SubTask[];
  history: TodoHistory[]; // Git-style 历史记录
  targetCount?: number; // 目标次数
  priority: 'low' | 'medium' | 'high';
  // Eisenhower Matrix
  isImportant: boolean;
  isUrgent: boolean;
  // Habit Tracker
  type: 'task' | 'habit';
  streak: number;
  lastCompletedDate: string | null; // ISO Date
  // My Day
  isMyDay: boolean;
  addedToMyDayDate: string | null; // ISO Date
}

export interface FocusTask {
  id: string;
  title: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  startTime: string; // ISO string
  duration: number; // seconds
  type: 'pomodoro' | 'stopwatch';
  createdAt: string; // ISO string
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  cloudSync: boolean;
  firebaseConfig?: Record<string, unknown>;
  birthDate?: string; // ISO string for life progress calculation
}

export interface AppState {
  countdowns: Countdown[];
  todos: Todo[];
  partitions: string[];
  focusTasks: FocusTask[];
  focusSessions: FocusSession[];
  settings: AppSettings;
  
  // Countdown Actions
  addCountdown: (countdown: Omit<Countdown, 'id' | 'createdAt' | 'archived'>) => void;
  deleteCountdown: (id: string) => void;
  archiveCountdown: (id: string) => void;
  
  // Todo Actions
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'completed' | 'subtasks' | 'history' | 'isImportant' | 'isUrgent' | 'streak' | 'lastCompletedDate' | 'isMyDay' | 'addedToMyDayDate'>) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodoMatrix: (id: string, isImportant: boolean, isUrgent: boolean) => void;
  toggleMyDay: (id: string) => void;
  addSubtask: (todoId: string, title: string) => void;
  toggleSubtask: (todoId: string, subtaskId: string) => void;
  deleteSubtask: (todoId: string, subtaskId: string) => void;
  reorderSubtasks: (todoId: string, newOrder: any[]) => void;
  addTodoHistory: (todoId: string, tag?: string) => void;
  checkAndResetHabits: () => void;
  
  // Partition Actions
  addPartition: (name: string) => void;
  deletePartition: (name: string) => void;
  
  // Focus Actions
  addFocusTask: (title: string) => void;
  deleteFocusTask: (id: string) => void;
  addFocusSession: (session: Omit<FocusSession, 'id' | 'createdAt'>) => void;
  deleteFocusSession: (id: string) => void;
  updateFocusSession: (id: string, updates: Partial<FocusSession>) => void;
  
  // Settings Actions
  toggleTheme: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}
