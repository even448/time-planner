import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Countdown, Todo, FocusSession, FocusTask } from '../types';

// 生成唯一ID的函数
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
};

const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 初始状态
      countdowns: [],
      todos: [],
      partitions: ['默认'],
      focusTasks: [],
      focusSessions: [],
      settings: {
        theme: 'light',
        notifications: false,
        cloudSync: false,
        birthDate: undefined,
      },

      // ==================== Countdown Actions ====================
      addCountdown: (countdown) => set((state) => ({
        countdowns: [
          ...state.countdowns,
          {
            ...countdown,
            id: generateId(),
            createdAt: new Date().toISOString(),
            archived: false,
          },
        ],
      })),

      deleteCountdown: (id) => set((state) => ({
        countdowns: state.countdowns.filter((c) => c.id !== id),
      })),

      archiveCountdown: (id) => set((state) => ({
        countdowns: state.countdowns.map((c) =>
          c.id === id ? { ...c, archived: true } : c
        ),
      })),

      // ==================== Todo Actions ====================
      addTodo: (todo) => set((state) => ({
        todos: [
          ...state.todos,
          {
            ...todo,
            id: generateId(),
            createdAt: new Date().toISOString(),
            completed: false,
            subtasks: [],
            history: [],
            // Default values for new fields
            isImportant: false,
            isUrgent: false,
            type: todo.type || 'task',
            streak: 0,
            lastCompletedDate: null,
            isMyDay: (todo as any).isMyDay ?? false,
            addedToMyDayDate: (todo as any).isMyDay ? new Date().toISOString().split('T')[0] : null,
          },
        ],
      })),

      toggleTodo: (id) => set((state) => ({
        todos: state.todos.map((t) => {
          if (t.id === id) {
            const newCompleted = !t.completed;
            const today = new Date().toISOString().split('T')[0];
            const history = [...t.history];
            
            // Update today's history
            const todayIndex = history.findIndex((h) => h.date === today);
            if (todayIndex >= 0) {
              history[todayIndex] = { ...history[todayIndex], completed: newCompleted };
            } else {
              history.push({ date: today, completed: newCompleted });
            }
            
            // Handle habit completion
            let streak = t.streak || 0;
            let lastCompletedDate = t.lastCompletedDate;
            
            if (t.type === 'habit' && newCompleted) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];
              
              if (lastCompletedDate === yesterdayStr || lastCompletedDate === null) {
                streak += 1;
              } else {
                streak = 1;
              }
              lastCompletedDate = today;
            }
            
            return { ...t, completed: newCompleted, history, streak, lastCompletedDate };
          }
          return t;
        }),
      })),

      deleteTodo: (id) => set((state) => ({
        todos: state.todos.filter((t) => t.id !== id),
      })),

      updateTodoMatrix: (id, isImportant, isUrgent) => set((state) => ({
        todos: state.todos.map((t) =>
          t.id === id ? { ...t, isImportant, isUrgent } : t
        ),
      })),

      toggleMyDay: (id) => set((state) => ({
        todos: state.todos.map((t) => {
          if (t.id === id) {
            const newIsMyDay = !t.isMyDay;
            const today = new Date().toISOString().split('T')[0];
            return {
              ...t,
              isMyDay: newIsMyDay,
              addedToMyDayDate: newIsMyDay ? today : null,
            };
          }
          return t;
        }),
      })),

      checkAndResetHabits: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        
        return {
          todos: state.todos.map((t) => {
            if (t.type === 'habit' && t.completed && t.lastCompletedDate !== today) {
              // Reset habit for today
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];
              
              // Reset streak if last completion wasn't yesterday
              const newStreak = t.lastCompletedDate === yesterdayStr ? t.streak : 0;
              
              return { ...t, completed: false, streak: newStreak };
            }
            return t;
          }),
        };
      }),

      addSubtask: (todoId, title) => set((state) => ({
        todos: state.todos.map((t) =>
          t.id === todoId
            ? {
                ...t,
                subtasks: [
                  ...t.subtasks,
                  { id: generateId(), title, completed: false },
                ],
              }
            : t
        ),
      })),

      toggleSubtask: (todoId, subtaskId) => set((state) => ({
        todos: state.todos.map((t) =>
          t.id === todoId
            ? {
                ...t,
                subtasks: t.subtasks.map((s) =>
                  s.id === subtaskId ? { ...s, completed: !s.completed } : s
                ),
              }
            : t
        ),
      })),

      deleteSubtask: (todoId, subtaskId) => set((state) => ({
        todos: state.todos.map((t) =>
          t.id === todoId
            ? {
                ...t,
                subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
              }
            : t
        ),
      })),

      reorderSubtasks: (todoId, newOrder) => set((state) => ({
        todos: state.todos.map((t) =>
          t.id === todoId
            ? {
                ...t,
                subtasks: newOrder,
              }
            : t
        ),
      })),

      addTodoHistory: (todoId, tag) => set((state) => ({
        todos: state.todos.map((t) => {
          if (t.id === todoId) {
            const today = new Date().toISOString().split('T')[0];
            const history = [...t.history];
            const todayIndex = history.findIndex((h) => h.date === today);
            
            if (todayIndex >= 0) {
              history[todayIndex] = { ...history[todayIndex], tag };
            } else {
              history.push({ date: today, completed: t.completed, tag });
            }
            
            return { ...t, history };
          }
          return t;
        }),
      })),

      // ==================== Partition Actions ====================
      addPartition: (name) => set((state) => ({
        partitions: [...state.partitions, name],
      })),

      deletePartition: (name) => set((state) => ({
        partitions: state.partitions.filter((p) => p !== name),
        todos: state.todos.map((t) =>
          t.partition === name ? { ...t, partition: '默认' } : t
        ),
      })),

      // ==================== Focus Actions ====================
      addFocusTask: (title) => set((state) => ({
        focusTasks: [
          ...state.focusTasks,
          { id: generateId(), title },
        ],
      })),

      deleteFocusTask: (id) => set((state) => ({
        focusTasks: state.focusTasks.filter((t) => t.id !== id),
      })),

      addFocusSession: (session) => set((state) => ({
        focusSessions: [
          ...state.focusSessions,
          {
            ...session,
            id: generateId(),
            createdAt: new Date().toISOString(),
          },
        ],
      })),

      deleteFocusSession: (id) => set((state) => ({
        focusSessions: state.focusSessions.filter((s) => s.id !== id),
      })),

      updateFocusSession: (id, updates) => set((state) => ({
        focusSessions: state.focusSessions.map((s) => {
          if (s.id === id) {
            const updated = { ...s, ...updates };
            // 如果 startTime 或 duration 改变，重新计算相关字段
            if (updates.startTime && updates.duration !== undefined) {
              // startTime 和 duration 都提供了，保持一致
              return updated;
            }
            return updated;
          }
          return s;
        }),
      })),

      // ==================== Settings Actions ====================
      toggleTheme: () => set((state) => {
        const newTheme = state.settings.theme === 'light' ? 'dark' : 'light';
        
        // Update DOM
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        return {
          settings: { ...state.settings, theme: newTheme },
        };
      }),

      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings },
      })),
    }),
    {
      name: 'time-tracker-storage',
      version: 1,
      migrate: (persistedState: any) => {
        // Migrate todos to add new fields
        if (persistedState.todos) {
          persistedState.todos = persistedState.todos.map((todo: any) => ({
            ...todo,
            isImportant: todo.isImportant ?? false,
            isUrgent: todo.isUrgent ?? false,
            type: todo.type ?? 'task',
            streak: todo.streak ?? 0,
            lastCompletedDate: todo.lastCompletedDate ?? null,
            isMyDay: todo.isMyDay ?? false,
            addedToMyDayDate: todo.addedToMyDayDate ?? null,
          }));
        }
        return persistedState;
      },
    }
  )
);

export default useAppStore;
