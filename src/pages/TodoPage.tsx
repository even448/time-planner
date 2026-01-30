import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Tabs, Tab, Switch, ButtonGroup } from '@nextui-org/react';
import { Plus, FolderPlus, List, Grid3x3, Sun, Check, Archive, BarChart3 } from 'lucide-react';
import EnhancedTodoItem from '../components/EnhancedTodoItem';
import EisenhowerMatrix from '../components/EisenhowerMatrix';
import MyDaySuggestions from '../components/MyDaySuggestions';
import EmptyState from '../components/EmptyState';
import TodoAnalyticsModal from '../components/TodoAnalyticsModal';
import AdvancedTodoSearch, { TodoFilterOptions } from '../components/AdvancedTodoSearch';
import CompletedTodosArchive from '../components/CompletedTodosArchive';
import useAppStore from '../store/useAppStore';

type ViewMode = 'list' | 'matrix';
type FilterMode = 'all' | 'myday' | 'completed';

export default function TodoPage() {
  const {
    todos,
    partitions,
    addTodo,
    addPartition,
    deletePartition,
    toggleTodo,
    deleteTodo,
    checkAndResetHabits,
  } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPartitionModalOpen, setIsPartitionModalOpen] = useState(false);
  const [isCompletedArchiveOpen, setIsCompletedArchiveOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [selectedPartition, setSelectedPartition] = useState(partitions[0] || '默认');
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [completingTodos, setCompletingTodos] = useState<Set<string>>(new Set());
  
  // 表单状态
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isHabit, setIsHabit] = useState(false);
  const [newPartitionName, setNewPartitionName] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // 搜索和筛选状态
  const [filters, setFilters] = useState<TodoFilterOptions>({
    searchQuery: '',
    priority: 'all',
    status: 'all',
    dateRange: 'all',
    type: 'all',
  });

  // 在组件挂载时检查并重置习惯
  useEffect(() => {
    checkAndResetHabits();
  }, [checkAndResetHabits]);

  // 过滤当前分区的待办
  let filteredTodos = todos.filter((t) => t.partition === selectedPartition);

  // 应用基础过滤器
  if (filterMode === 'myday') {
    filteredTodos = filteredTodos.filter((t) => t.isMyDay && (!t.completed || completingTodos.has(t.id)));
  } else if (filterMode === 'completed') {
    filteredTodos = filteredTodos.filter((t) => t.completed);
  } else {
    // 'all' 模式下排除已完成的任务，但允许刚完成的任务做淡出动画
    filteredTodos = filteredTodos.filter((t) => !t.completed || completingTodos.has(t.id));
  }

  // 应用高级筛选
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filteredTodos = filteredTodos.filter((t) => 
      t.title.toLowerCase().includes(query) ||
      t.subtasks.some((s) => s.title.toLowerCase().includes(query)) ||
      t.history.some((h) => h.tag?.toLowerCase().includes(query))
    );
  }
  
  if (filters.priority !== 'all') {
    filteredTodos = filteredTodos.filter((t) => t.priority === filters.priority);
  }
  
  if (filters.status !== 'all') {
    filteredTodos = filteredTodos.filter((t) => 
      filters.status === 'active' ? !t.completed : t.completed
    );
  }
  
  if (filters.type !== 'all') {
    filteredTodos = filteredTodos.filter((t) => t.type === filters.type);
  }

  // 已完成任务列表（用于归档）
  const completedTodos = todos.filter((t) => t.partition === selectedPartition && t.completed);

  const handleAddTodo = () => {
    if (!title.trim()) return;

    addTodo({
      title,
      partition: selectedPartition,
      priority,
      targetCount: 1,
      type: isHabit ? 'habit' : 'task',
      isMyDay: filterMode === 'myday',
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    } as any);

    setTitle('');
    setPriority('medium');
    setIsHabit(false);
    setDueDate('');
    setIsModalOpen(false);
  };

  const handleAddPartition = () => {
    if (!newPartitionName.trim()) return;
    addPartition(newPartitionName);
    setNewPartitionName('');
    setIsPartitionModalOpen(false);
  };

  const handleDeletePartition = (name: string) => {
    if (name === '默认') return;

    deletePartition(name);

    // 如果当前选中的分区被删除，回退到“默认”或剩余的第一个分区
    if (selectedPartition === name) {
      const nextPartition = partitions.find((p) => p !== name) || '默认';
      setSelectedPartition(nextPartition);
    }
  };

  // 任务完成时的自动归档处理
  const handleTodoComplete = useCallback((todoId: string) => {
    setCompletingTodos((prev) => new Set(prev).add(todoId));
    
    // 3秒后从列表中移除
    setTimeout(() => {
      setCompletingTodos((prev) => {
        const next = new Set(prev);
        next.delete(todoId);
        return next;
      });
    }, 3000);
  }, []);

  // 快速筛选处理
  const handleQuickFilter = (type: 'today' | 'week' | 'high') => {
    if (type === 'high') {
      setFilters({ ...filters, priority: 'high' });
    }
    // 其他快速筛选可以根据需要实现
  };



  return (
    <div className="pb-6">
      {/* 顶部操作栏 */}
      <div className="mb-6">
        {/* 第一行：标题和添加按钮 */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">待办事项</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="flat"
              startContent={<BarChart3 size={18} />}
              onPress={() => setIsAnalyticsOpen(true)}
            >
              数据分析
            </Button>
            <Button
              color="danger"
              startContent={<Plus size={20} />}
              onPress={() => setIsModalOpen(true)}
            >
              添加
            </Button>
          </div>
        </div>
        {/* 第二行：过滤器、视图切换和分区管理 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* 过滤器按钮组 */}
            <ButtonGroup size="sm" variant="flat">
              <Button
                color={filterMode === 'all' ? 'primary' : 'default'}
                onPress={() => setFilterMode('all')}
              >
                <List size={16} />
                全部
              </Button>
              <Button
                color={filterMode === 'myday' ? 'warning' : 'default'}
                onPress={() => setFilterMode('myday')}
              >
                <Sun size={16} />
                我的一天
              </Button>
            </ButtonGroup>

            {/* 视图切换按钮组 */}
            <ButtonGroup size="sm" variant="flat">
              <Button
                color={viewMode === 'list' ? 'primary' : 'default'}
                onPress={() => setViewMode('list')}
              >
                <List size={16} />
              </Button>
              <Button
                color={viewMode === 'matrix' ? 'primary' : 'default'}
                onPress={() => setViewMode('matrix')}
              >
                <Grid3x3 size={16} />
              </Button>
            </ButtonGroup>

            <Button
              isIconOnly
              variant="light"
              onPress={() => setIsPartitionModalOpen(true)}
              title="管理分区"
            >
              <FolderPlus size={20} />
            </Button>
          </div>

          {/* 已完成归档按钮 */}
          <Button
            variant="flat"
            startContent={<Archive size={18} />}
            onPress={() => setIsCompletedArchiveOpen(true)}
          >
            已完成 ({completedTodos.length})
          </Button>
        </div>
      </div>

      {/* 分区标签 */}
      <Tabs
        selectedKey={selectedPartition}
        onSelectionChange={(key) => setSelectedPartition(key as string)}
        color="primary"
        className="mb-4"
      >
        {partitions.map((partition) => (
          <Tab
            key={partition}
            title={
              <div className="flex items-center space-x-2">
                <span>{partition}</span>
                <span className="text-xs bg-stone-200 dark:bg-stone-700 px-1.5 rounded">
                  {todos.filter((t) => t.partition === partition && !t.completed).length}
                </span>
              </div>
            }
          />
        ))}
      </Tabs>

      {/* 高级搜索和筛选 */}
      {filterMode === 'all' && viewMode === 'list' && (
        <AdvancedTodoSearch
          filters={filters}
          onFiltersChange={setFilters}
          onQuickFilter={handleQuickFilter}
        />
      )}

      {/* 我的一天建议面板 */}
      {filterMode === 'myday' && <MyDaySuggestions />}

      {/* 待办列表或矩阵视图 */}
      {filteredTodos.length === 0 ? (
        <EmptyState 
          type="todo"
          message={
            filterMode === 'myday'
              ? '还没有添加任务到"我的一天"'
              : '享受当下的宁静吧'
          }
          onAction={() => setIsModalOpen(true)}
          actionLabel="添加待办"
        />
      ) : viewMode === 'matrix' && filterMode !== 'myday' ? (
        <EisenhowerMatrix 
          partition={selectedPartition} 
          completingTodos={completingTodos}
          onTodoComplete={handleTodoComplete}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTodos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: completingTodos.has(todo.id) ? 0 : 1,
                  y: completingTodos.has(todo.id) ? -20 : 0,
                  scale: completingTodos.has(todo.id) ? 0.9 : 1,
                }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EnhancedTodoItem 
                  key={todo.id} 
                  todo={todo} 
                  onComplete={() => handleTodoComplete(todo.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 添加待办 Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent>
          <ModalHeader>添加待办</ModalHeader>
          <ModalBody>
            <Input
              label="标题"
              placeholder="例如：完成项目报告"
              value={title}
              onValueChange={setTitle}
            />
            <div>
              <label className="text-sm mb-2 block">优先级</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="low">⚪ 低</option>
                <option value="medium">🔹 中</option>
                <option value="high">⚡ 高</option>
              </select>
            </div>
            <Input
              type="datetime-local"
              label="截止日期"
              placeholder="请选择截止日期"
              value={dueDate}
              onValueChange={setDueDate}
            />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">设为习惯</span>
                <p className="text-xs text-stone-500">每日重复的任务，支持连击记录</p>
              </div>
              <Switch isSelected={isHabit} onValueChange={setIsHabit} />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button color="danger" onPress={handleAddTodo}>
              添加
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 添加分区 Modal */}
      <Modal
        isOpen={isPartitionModalOpen}
        onClose={() => setIsPartitionModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>管理分区</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="新增分区"
                placeholder="例如：工作、学习、生活"
                value={newPartitionName}
                onValueChange={setNewPartitionName}
              />

              <div className="space-y-2">
                <p className="text-sm text-stone-500">已有分区</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {partitions.map((partition) => (
                    <div
                      key={partition}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800/60"
                    >
                      <span>{partition}</span>
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        isDisabled={partition === '默认'}
                        onPress={() => handleDeletePartition(partition)}
                      >
                        删除
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsPartitionModalOpen(false)}>
              取消
            </Button>
            <Button color="primary" onPress={handleAddPartition}>
              添加
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 已完成归档 Modal */}
      <CompletedTodosArchive
        isOpen={isCompletedArchiveOpen}
        onClose={() => setIsCompletedArchiveOpen(false)}
        completedTodos={completedTodos}
        onUncomplete={toggleTodo}
        onDelete={deleteTodo}
      />

      {/* 数据分析 Modal */}
      <TodoAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        todos={todos}
        partition={selectedPartition}
      />
    </div>
  );
}
