import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Countdown, Todo, FocusSession, FocusTask, User } from '../types';

// 生成唯一ID的函数
const generateId = (): string => {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substr(2, 9) +
    Math.random().toString(36).substr(2, 9)
  );
};

const defaultSettings = {
  theme: 'light' as const,
  notifications: false,
  cloudSync: false,
  birthDate: undefined as string | undefined,
};

const createUserData = () => ({
  countdowns: [] as Countdown[],
  todos: [] as Todo[],
  partitions: ['默认'] as string[],
  focusTasks: [] as FocusTask[],
  focusSessions: [] as FocusSession[],
  settings: { ...defaultSettings },
});

const persistWithUser = (state: any, overrides: any = {}) => {
  const next = { ...state, ...overrides };
  const userId = next.currentUserId;
  if (!userId) return next;

  const snapshot = {
    countdowns: next.countdowns,
    todos: next.todos,
    partitions: next.partitions,
    focusTasks: next.focusTasks,
    focusSessions: next.focusSessions,
    settings: next.settings,
  };

  return {
    ...next,
    userData: {
      ...next.userData,
      [userId]: {
        ...(next.userData?.[userId] || createUserData()),
        ...snapshot,
      },
    },
  };
};

const loadUserIntoState = (state: any, userId: string) => {
  const data = state.userData?.[userId] || createUserData();
  return {
    ...state,
    currentUserId: userId,
    countdowns: data.countdowns,
    todos: data.todos,
    partitions: data.partitions,
    focusTasks: data.focusTasks,
    focusSessions: data.focusSessions,
    settings: data.settings,
    userData: {
      ...state.userData,
      [userId]: data,
    },
  };
};

const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 初始状态（会在登录/注册时加载用户数据）
      countdowns: [],
      todos: [],
      partitions: ['默认'],
      focusTasks: [],
      focusSessions: [],
      settings: { ...defaultSettings },
      users: [] as User[],
      currentUserId: null,
      userData: {},

      // ==================== Countdown Actions ====================
      addCountdown: (countdown) => set((state) => {
        const countdowns = [
          ...state.countdowns,
          {
            ...countdown,
            id: generateId(),
            createdAt: new Date().toISOString(),
            archived: false,
          },
        ];
        return persistWithUser(state, { countdowns });
      }),

      deleteCountdown: (id) => set((state) => {
        const countdowns = state.countdowns.filter((c) => c.id !== id);
        return persistWithUser(state, { countdowns });
      }),

      archiveCountdown: (id) => set((state) => {
        const countdowns = state.countdowns.map((c) =>
          c.id === id ? { ...c, archived: true } : c
        );
        return persistWithUser(state, { countdowns });
      }),

      unarchiveCountdown: (id) => set((state) => {
        const countdowns = state.countdowns.map((c) =>
          c.id === id ? { ...c, archived: false } : c
        );
        return persistWithUser(state, { countdowns });
      }),

      // ==================== Todo Actions ====================
      addTodo: (todo) => set((state) => {
        const todos = [
          ...state.todos,
          {
            ...todo,
            id: generateId(),
            createdAt: new Date().toISOString(),
            completed: false,
            subtasks: [],
            history: [],
            isImportant: false,
            isUrgent: false,
            type: todo.type || 'task',
            streak: 0,
            lastCompletedDate: null,
            isMyDay: (todo as any).isMyDay ?? false,
            addedToMyDayDate: (todo as any).isMyDay ? new Date().toISOString().split('T')[0] : null,
            dueDate: (todo as any).dueDate ?? null,
          },
        ];
        return persistWithUser(state, { todos });
      }),

      toggleTodo: (id) => set((state) => {
        const todos = state.todos.map((t) => {
          if (t.id === id) {
            const newCompleted = !t.completed;
            const today = new Date().toISOString().split('T')[0];
            const history = [...t.history];

            const todayIndex = history.findIndex((h) => h.date === today);
            if (todayIndex >= 0) {
              history[todayIndex] = { ...history[todayIndex], completed: newCompleted };
            } else {
              history.push({ date: today, completed: newCompleted });
            }

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
        });
        return persistWithUser(state, { todos });
      }),

      deleteTodo: (id) => set((state) => {
        const todos = state.todos.filter((t) => t.id !== id);
        return persistWithUser(state, { todos });
      }),

      updateTodoMatrix: (id, isImportant, isUrgent) => set((state) => {
        const todos = state.todos.map((t) =>
          t.id === id ? { ...t, isImportant, isUrgent } : t
        );
        return persistWithUser(state, { todos });
      }),

      toggleMyDay: (id) => set((state) => {
        const todos = state.todos.map((t) => {
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
        });
        return persistWithUser(state, { todos });
      }),

      checkAndResetHabits: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];

        const todos = state.todos.map((t) => {
          if (t.type === 'habit' && t.completed && t.lastCompletedDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            const newStreak = t.lastCompletedDate === yesterdayStr ? t.streak : 0;
            return { ...t, completed: false, streak: newStreak };
          }
          return t;
        });

        return persistWithUser(state, { todos });
      }),

      addSubtask: (todoId, title) => set((state) => {
        const todos = state.todos.map((t) =>
          t.id === todoId
            ? {
                ...t,
                subtasks: [...t.subtasks, { id: generateId(), title, completed: false }],
              }
            : t
        );
        return persistWithUser(state, { todos });
      }),

      toggleSubtask: (todoId, subtaskId) => set((state) => {
        const todos = state.todos.map((t) =>
          t.id === todoId
            ? {
                ...t,
                subtasks: t.subtasks.map((s) =>
                  s.id === subtaskId ? { ...s, completed: !s.completed } : s
                ),
              }
            : t
        );
        return persistWithUser(state, { todos });
      }),

      deleteSubtask: (todoId, subtaskId) => set((state) => {
        const todos = state.todos.map((t) =>
          t.id === todoId
            ? {
                ...t,
                subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
              }
            : t
        );
        return persistWithUser(state, { todos });
      }),

      reorderSubtasks: (todoId, newOrder) => set((state) => {
        const todos = state.todos.map((t) =>
          t.id === todoId
            ? {
                ...t,
                subtasks: newOrder,
              }
            : t
        );
        return persistWithUser(state, { todos });
      }),

      addTodoHistory: (todoId, tag) => set((state) => {
        const todos = state.todos.map((t) => {
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
        });
        return persistWithUser(state, { todos });
      }),

      // ==================== Partition Actions ====================
      addPartition: (name) => set((state) => {
        const partitions = [...state.partitions, name];
        return persistWithUser(state, { partitions });
      }),

      deletePartition: (name) => set((state) => {
        const partitions = state.partitions.filter((p) => p !== name);
        const todos = state.todos.map((t) =>
          t.partition === name ? { ...t, partition: '默认' } : t
        );
        return persistWithUser(state, { partitions, todos });
      }),

      // ==================== Focus Actions ====================
      addFocusTask: (title) => set((state) => {
        const focusTasks = [...state.focusTasks, { id: generateId(), title }];
        return persistWithUser(state, { focusTasks });
      }),

      deleteFocusTask: (id) => set((state) => {
        const focusTasks = state.focusTasks.filter((t) => t.id !== id);
        return persistWithUser(state, { focusTasks });
      }),

      addFocusSession: (session) => set((state) => {
        const focusSessions = [
          ...state.focusSessions,
          {
            ...session,
            id: generateId(),
            createdAt: new Date().toISOString(),
          },
        ];
        return persistWithUser(state, { focusSessions });
      }),

      deleteFocusSession: (id) => set((state) => {
        const focusSessions = state.focusSessions.filter((s) => s.id !== id);
        return persistWithUser(state, { focusSessions });
      }),

      updateFocusSession: (id, updates) => set((state) => {
        const focusSessions = state.focusSessions.map((s) => {
          if (s.id === id) {
            const updated = { ...s, ...updates };
            if (updates.startTime && updates.duration !== undefined) {
              return updated;
            }
            return updated;
          }
          return s;
        });
        return persistWithUser(state, { focusSessions });
      }),

      // ==================== Settings Actions ====================
      toggleTheme: () => set((state) => {
        const newTheme = state.settings.theme === 'light' ? 'dark' : 'light';

        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        const settings = { ...state.settings, theme: newTheme };
        return persistWithUser(state, { settings });
      }),

      updateSettings: (settings) => set((state) => {
        const mergedSettings = { ...state.settings, ...settings };
        return persistWithUser(state, { settings: mergedSettings });
      }),

      // ==================== Auth Actions ====================
      registerUser: (username, password) => {
        let response = { success: false, message: '' as string | undefined };

        set((state) => {
          if (state.users.some((u) => u.username === username)) {
            response = { success: false, message: '用户名已存在' };
            return state;
          }

          const userId = generateId();
          const newUser: User = {
            id: userId,
            username,
            password,
            createdAt: new Date().toISOString(),
          };

          const data = createUserData();
          response = { success: true };

          return persistWithUser(
            {
              ...state,
              users: [...state.users, newUser],
              currentUserId: userId,
              ...data,
              userData: {
                ...state.userData,
                [userId]: data,
              },
            },
            {}
          );
        });

        return response as { success: boolean; message?: string };
      },

      loginUser: (username, password) => {
        let response = { success: false, message: '' as string | undefined };

        set((state) => {
          const user = state.users.find((u) => u.username === username && u.password === password);
          if (!user) {
            response = { success: false, message: '账号或密码错误' };
            return state;
          }

          response = { success: true };
          return loadUserIntoState(state, user.id);
        });

        return response as { success: boolean; message?: string };
      },

      logoutUser: () => set((state) => ({
        currentUserId: null,
        countdowns: [],
        todos: [],
        partitions: ['默认'],
        focusTasks: [],
        focusSessions: [],
        settings: { ...defaultSettings },
      })),
    }),
    {
      name: 'time-tracker-storage',
      version: 2,
      migrate: (persistedState: any) => {
        // v1 -> v2: introduce users and per-user data isolation
        if (!persistedState.users) {
          const defaultUserId = generateId();
          const migratedTodos = (persistedState.todos || []).map((todo: any) => ({
            ...todo,
            isImportant: todo.isImportant ?? false,
            isUrgent: todo.isUrgent ?? false,
            type: todo.type ?? 'task',
            streak: todo.streak ?? 0,
            lastCompletedDate: todo.lastCompletedDate ?? null,
            isMyDay: todo.isMyDay ?? false,
            addedToMyDayDate: todo.addedToMyDayDate ?? null,
            dueDate: todo.dueDate ?? null,
          }));

          const data = {
            countdowns: persistedState.countdowns || [],
            todos: migratedTodos,
            partitions: persistedState.partitions || ['默认'],
            focusTasks: persistedState.focusTasks || [],
            focusSessions: persistedState.focusSessions || [],
            settings: persistedState.settings || { ...defaultSettings },
          };

          return {
            ...persistedState,
            ...data,
            users: [{ id: defaultUserId, username: '本地用户', password: '', createdAt: new Date().toISOString() }],
            currentUserId: defaultUserId,
            userData: { [defaultUserId]: data },
          };
        }

        return persistedState;
      },
    }
  )
);

export default useAppStore;
