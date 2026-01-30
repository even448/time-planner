import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Checkbox, Button, Progress, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from '@nextui-org/react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Trash2, Plus, Calendar, Tag, Timer, Sun, Flame, GripVertical, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Todo } from '../types';
import useAppStore from '../store/useAppStore';
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import confetti from '../utils/confetti';

interface TodoItemProps {
  todo: Todo;
  showPartition?: boolean;
  onComplete?: () => void;
  isCompleting?: boolean;
}

export default function TodoItem({ todo, showPartition = true, onComplete, isCompleting }: TodoItemProps) {
  const navigate = useNavigate();
  const { 
    toggleTodo, 
    deleteTodo, 
    addSubtask, 
    toggleSubtask, 
    deleteSubtask, 
    reorderSubtasks,
    addTodoHistory,
    toggleMyDay
  } = useAppStore();
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [historyTag, setHistoryTag] = useState('');
  const [isManaging, setIsManaging] = useState(false);
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = todo.subtasks.findIndex((s) => s.id === active.id);
      const newIndex = todo.subtasks.findIndex((s) => s.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(todo.subtasks, oldIndex, newIndex);
        reorderSubtasks(todo.id, newOrder);
      }
    }
  };

  // 计算完成进度
  const completedSubtasks = todo.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = todo.subtasks.length;
  const progress = todo.completed ? 100 : (totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0);

  // 计算历史完成率
  const completedHistory = todo.history.filter((h) => h.completed).length;
  const totalHistory = todo.history.length;
  const historyProgress = totalHistory > 0 ? (completedHistory / totalHistory) * 100 : 0;

  // 优先级颜色
  const priorityColor = {
    low: 'text-stone-400',
    medium: 'text-blue-500',
    high: 'text-red-500',
  }[todo.priority];

  const formattedDueDate = todo.dueDate
    ? format(new Date(todo.dueDate), 'yyyy-MM-dd HH:mm', { locale: zhCN })
    : null;

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      addSubtask(todo.id, newSubtask);
      setNewSubtask('');
    }
  };

  const handleToggle = () => {
    if (!todo.completed) {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        confetti({
          particleCount: 50,
          spread: 70,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight,
          },
        });
      }
      toggleTodo(todo.id);
      onComplete?.();
    } else {
      toggleTodo(todo.id);
    }
  };

  const handleAddHistory = () => {
    addTodoHistory(todo.id, historyTag || undefined);
    setHistoryTag('');
  };

  const handleStartFocus = () => {
    navigate('/focus', { state: { taskId: todo.id, taskName: todo.title } });
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

// SortableItem 组件，支持拖拽排序
interface SortableItemProps {
  id: string;
  todoId: string;
  subtask: any;
  isManaging: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

function SortableItem({ id, todoId, subtask, isManaging, onToggle, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-stone-700 transition-all duration-200 ${
        subtask.completed
          ? 'bg-stone-50 dark:bg-stone-800/50'
          : 'bg-white dark:bg-stone-800 hover:border-stone-300 dark:hover:border-stone-600'
      }`}
    >
      <div className="flex items-center flex-1 min-w-0">
        {isManaging && (
          <button
            {...listeners}
            className="mr-3 text-stone-400 cursor-grab active:cursor-grabbing hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
          >
            <GripVertical size={18} />
          </button>
        )}
        <div className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
          subtask.completed
            ? 'bg-green-500 border-green-500'
            : 'border-stone-300 dark:border-stone-600 group-hover:border-green-400'
        }`}>
          {subtask.completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <button
          onClick={onToggle}
          className="flex-1 min-w-0 text-left ml-3"
        >
          <span
            className={`text-sm truncate block ${
              subtask.completed
                ? 'line-through text-stone-400'
                : 'text-stone-700 dark:text-stone-200'
            }`}
          >
            {subtask.title}
          </span>
        </button>
      </div>
      {isManaging && (
        <Button
          isIconOnly
          size="sm"
          variant="light"
          color="danger"
          className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
          onPress={onDelete}
        >
          <Trash2 size={16} />
        </Button>
      )}
    </div>
  );
}

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isCompleting ? 0 : 1, y: isCompleting ? -8 : 0, scale: isCompleting ? 0.96 : 1 }}
        exit={{ opacity: 0, x: -50 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.6, delay: isCompleting ? 2.4 : 0 }}
      >
        <Card
          ref={cardRef}
          className={`modern-card mb-3 ${todo.isMyDay ? 'ring-2 ring-amber-400 dark:ring-amber-500' : ''} ${isCompleting ? 'pointer-events-none' : ''}`}
        >
          <CardBody className="p-4">
            <div className="flex items-start space-x-3">
              {/* 左侧进度环 */}
              <div className="w-12 h-12 flex-shrink-0">
                <CircularProgressbar
                  value={progress}
                  text={totalSubtasks > 0 ? `${completedSubtasks}` : ''}
                  styles={buildStyles({
                    textSize: '32px',
                    pathColor: todo.completed ? '#10b981' : '#f97316',
                    textColor: todo.completed ? '#10b981' : '#f97316',
                    trailColor: '#e7e5e4',
                  })}
                />
              </div>

              {/* 中间内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    <Checkbox
                      isSelected={todo.completed}
                      onValueChange={handleToggle}
                      color="success"
                      size="lg"
                    />
                    <div className="flex-1">
                      <h3
                        className={`font-semibold text-base ${
                          todo.completed
                            ? 'line-through text-stone-400'
                            : 'text-stone-800 dark:text-stone-100'
                        }`}
                      >
                        {todo.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1 flex-wrap">
                        {showPartition && (
                          <span className="text-xs text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                            {todo.partition}
                          </span>
                        )}
                        <span className={`text-xs ${priorityColor}`}>
                          {todo.priority === 'high' && '⚡'}
                          {todo.priority === 'medium' && '🔹'}
                          {todo.priority === 'low' && '⚪'}
                        </span>
                        {/* Habit Streak */}
                        {todo.type === 'habit' && todo.streak > 0 && (
                          <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-2 py-0.5 rounded flex items-center">
                            <Flame size={12} className="mr-1" />
                            {todo.streak} 天
                          </span>
                        )}
                        {/* My Day Badge */}
                        {todo.isMyDay && (
                          <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 px-2 py-0.5 rounded flex items-center">
                            <Sun size={12} className="mr-1" />
                            我的一天
                          </span>
                        )}
                        {formattedDueDate && (
                          <span className="text-xs text-stone-400 flex items-center">
                            <Calendar size={12} className="mr-1" />
                            截止 {formattedDueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 右侧操作按钮 */}
                  <div className="flex items-center space-x-1">
                    {/* My Day Toggle */}
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color={todo.isMyDay ? 'warning' : 'default'}
                      onPress={() => toggleMyDay(todo.id)}
                    >
                      <Sun size={16} />
                    </Button>
                    {/* Focus Timer Button */}
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="primary"
                      onPress={handleStartFocus}
                    >
                      <Timer size={16} />
                    </Button>
                    {/* Details Button */}
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => setIsDetailOpen(true)}
                    >
                      <Calendar size={16} />
                    </Button>
                    {/* Delete Button */}
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => deleteTodo(todo.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                {/* 子任务预览 */}
                {todo.subtasks.length > 0 && (
                  <div className="mt-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${completedSubtasks === totalSubtasks ? 'bg-green-500' : 'bg-orange-400'}`} />
                          <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                            子任务
                          </span>
                        </div>
                        <span className="text-xs text-stone-400 bg-stone-200 dark:bg-stone-700 px-1.5 py-0.5 rounded">
                          {completedSubtasks}/{totalSubtasks}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              completedSubtasks === totalSubtasks ? 'bg-green-500' : 'bg-orange-400'
                            }`}
                            style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                          />
                        </div>
                        {todo.subtasks.length > 2 && (
                          <button
                            onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
                            className="text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors flex items-center"
                          >
                            <span className={`transition-transform duration-200 ${
                              isSubtasksExpanded ? 'rotate-180' : ''
                            }`}>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {(isSubtasksExpanded ? todo.subtasks : todo.subtasks.slice(0, 2)).map((subtask) => (
                        <div
                          key={subtask.id}
                          className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700/50 p-1 rounded-lg transition-colors"
                          onClick={() => toggleSubtask(todo.id, subtask.id)}
                        >
                          <span
                            className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              subtask.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-stone-300 dark:border-stone-600 hover:border-green-400'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubtask(todo.id, subtask.id);
                            }}
                          >
                            {subtask.completed && (
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <span
                            className={`truncate flex-1 ${
                              subtask.completed
                                ? 'line-through text-stone-400'
                                : 'text-stone-700 dark:text-stone-200'
                            }`}
                          >
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                      {!isSubtasksExpanded && todo.subtasks.length > 2 && (
                        <p 
                          className="text-xs text-stone-400 pl-6 cursor-pointer hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                          onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
                        >
                          +{todo.subtasks.length - 2} 项未完成
                        </p>
                      )}
                      {isSubtasksExpanded && (
                        <p 
                          className="text-xs text-stone-400 pl-6 cursor-pointer hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                          onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
                        >
                          收起子任务
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 历史进度条 */}
                {todo.history.length > 0 && (
                  <div className="mt-3">
                    <Progress
                      value={historyProgress}
                      size="sm"
                      color="success"
                      className="max-w-md"
                    />
                    <p className="text-xs text-stone-400 mt-1">
                      完成 {completedHistory}/{totalHistory} 次
                      {todo.targetCount && ` / 目标 ${todo.targetCount} 次`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* 详情 Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div>
              <h3 className="text-xl font-bold">{todo.title}</h3>
              <p className="text-sm text-stone-500 font-normal mt-1">
                创建于 {format(new Date(todo.createdAt), 'yyyy-MM-dd', { locale: zhCN })}
              </p>
            </div>
          </ModalHeader>
          <ModalBody>
            {/* 子任务 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center">
                  <span>子任务</span>
                  <span className="ml-2 text-xs text-stone-400">
                    ({completedSubtasks}/{totalSubtasks})
                  </span>
                </h4>
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => setIsManaging(!isManaging)}
                  startContent={isManaging ? <Edit3 size={16} /> : <Edit3 size={16} />}
                >
                  {isManaging ? '完成管理' : '管理'}
                </Button>
              </div>
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext items={todo.subtasks.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {todo.subtasks.map((subtask) => (
                      <SortableItem
                        key={subtask.id}
                        id={subtask.id}
                        todoId={todo.id}
                        subtask={subtask}
                        isManaging={isManaging}
                        onToggle={() => toggleSubtask(todo.id, subtask.id)}
                        onDelete={() => deleteSubtask(todo.id, subtask.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <div className="flex items-center space-x-2 mt-3">
                <Input
                  placeholder="添加子任务..."
                  value={newSubtask}
                  onValueChange={setNewSubtask}
                  size="sm"
                />
                <Button
                  color="primary"
                  size="sm"
                  onPress={handleAddSubtask}
                  startContent={<Plus size={16} />}
                >
                  添加
                </Button>
              </div>
            </div>

            {/* 历史记录 */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <Calendar size={18} className="mr-2" />
                完成历史（Git 风格）
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {todo.history.length === 0 ? (
                  <p className="text-sm text-stone-400">暂无历史记录</p>
                ) : (
                  todo.history.map((history, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 rounded-lg bg-stone-50 dark:bg-stone-900"
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${
                          history.completed ? 'bg-green-500' : 'bg-stone-300'
                        }`}
                      />
                      <span className="text-sm font-mono text-stone-600 dark:text-stone-300">
                        {history.date}
                      </span>
                      {history.tag && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded flex items-center">
                          <Tag size={12} className="mr-1" />
                          {history.tag}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <Input
                  placeholder="添加标签（可选）"
                  value={historyTag}
                  onValueChange={setHistoryTag}
                  size="sm"
                  startContent={<Tag size={16} />}
                />
                <Button
                  color="success"
                  size="sm"
                  onPress={handleAddHistory}
                >
                  记录今日
                </Button>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleCloseDetail}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
