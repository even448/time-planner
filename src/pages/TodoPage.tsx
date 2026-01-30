import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Tabs, Tab, Switch, ButtonGroup } from '@nextui-org/react';
import { Plus, FolderPlus, List, Grid3x3, Sun, Check } from 'lucide-react';
import TodoItem from '../components/TodoItem';
import EisenhowerMatrix from '../components/EisenhowerMatrix';
import MyDaySuggestions from '../components/MyDaySuggestions';
import useAppStore from '../store/useAppStore';

type ViewMode = 'list' | 'matrix';
type FilterMode = 'all' | 'myday' | 'completed';

export default function TodoPage() {
  const {
    todos,
    partitions,
    addTodo,
    addPartition,
    checkAndResetHabits,
  } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPartitionModalOpen, setIsPartitionModalOpen] = useState(false);
  const [selectedPartition, setSelectedPartition] = useState(partitions[0] || '默认');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  
  // 表单状态
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isHabit, setIsHabit] = useState(false);
  const [newPartitionName, setNewPartitionName] = useState('');

  // 在组件挂载时检查并重置习惯
  useEffect(() => {
    checkAndResetHabits();
  }, [checkAndResetHabits]);

  // 过滤当前分区的待办
  let filteredTodos = todos.filter((t) => t.partition === selectedPartition);

  // 应用过滤器
  if (filterMode === 'myday') {
    filteredTodos = filteredTodos.filter((t) => t.isMyDay);
  } else if (filterMode === 'completed') {
    filteredTodos = filteredTodos.filter((t) => t.completed);
    // 已完成任务排序：后完成的排在上面（按最后完成日期降序）
    filteredTodos.sort((a, b) => {
      // 优先按lastCompletedDate排序
      if (a.lastCompletedDate && b.lastCompletedDate) {
        return new Date(b.lastCompletedDate).getTime() - new Date(a.lastCompletedDate).getTime();
      }
      // 如果有一个没有lastCompletedDate，有日期的排前面
      if (a.lastCompletedDate) return -1;
      if (b.lastCompletedDate) return 1;
      // 如果都没有lastCompletedDate，按创建日期排序
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  const handleAddTodo = () => {
    if (!title.trim()) return;

    addTodo({
      title,
      partition: selectedPartition,
      priority,
      targetCount: 1,
      type: isHabit ? 'habit' : 'task',
      isMyDay: filterMode === 'myday',
    } as any);

    setTitle('');
    setPriority('medium');
    setIsHabit(false);
    setIsModalOpen(false);
  };

  const handleAddPartition = () => {
    if (!newPartitionName.trim()) return;
    addPartition(newPartitionName);
    setNewPartitionName('');
    setIsPartitionModalOpen(false);
  };



  return (
    <div className="pb-6">
      {/* 顶部操作栏 */}
      <div className="mb-6">
        {/* 第一行：标题和添加按钮 */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">待办事项</h2>
          <Button
            color="danger"
            startContent={<Plus size={20} />}
            onPress={() => setIsModalOpen(true)}
          >
            添加
          </Button>
        </div>
        {/* 第二行：过滤器、视图切换和分区管理 */}
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
            <Button
              color={filterMode === 'completed' ? 'success' : 'default'}
              onPress={() => setFilterMode('completed')}
            >
              <Check size={16} />
              已完成
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
          >
            <FolderPlus size={20} />
          </Button>
        </div>
      </div>

      {/* 分区标签 */}
      <Tabs
        selectedKey={selectedPartition}
        onSelectionChange={(key) => setSelectedPartition(key as string)}
        color="primary"
        className="mb-6"
      >
        {partitions.map((partition) => (
          <Tab
            key={partition}
            title={
              <div className="flex items-center space-x-2">
                <span>{partition}</span>
                <span className="text-xs bg-stone-200 dark:bg-stone-700 px-1.5 rounded">
                  {todos.filter((t) => t.partition === partition).length}
                </span>
              </div>
            }
          />
        ))}
      </Tabs>

      {/* 我的一天建议面板 */}
      {filterMode === 'myday' && <MyDaySuggestions />}

      {/* 待办列表或矩阵视图 */}
      {filteredTodos.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-stone-400 dark:text-stone-500">
            {filterMode === 'myday'
              ? '还没有添加任务到"我的一天"'
              : filterMode === 'completed'
              ? '这个分区还没有已完成的待办事项'
              : '这个分区还没有待办事项'}
          </p>
        </div>
      ) : viewMode === 'matrix' && filterMode !== 'completed' ? (
        <EisenhowerMatrix partition={selectedPartition} />
      ) : (
        <AnimatePresence>
          {filteredTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </AnimatePresence>
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
          <ModalHeader>添加分区</ModalHeader>
          <ModalBody>
            <Input
              label="分区名称"
              placeholder="例如：工作、学习、生活"
              value={newPartitionName}
              onValueChange={setNewPartitionName}
            />
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
    </div>
  );
}

