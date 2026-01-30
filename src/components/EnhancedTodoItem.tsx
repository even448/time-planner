import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Checkbox, Button, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Input } from '@nextui-org/react';
import { Trash2, Calendar, Timer, Sun, Flame, Edit3, MoreVertical, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Todo } from '../types';
import useAppStore from '../store/useAppStore';
import confetti from '../utils/confetti';

interface EnhancedTodoItemProps {
  todo: Todo;
  showPartition?: boolean;
  onComplete?: () => void;
}

export default function EnhancedTodoItem({ todo, showPartition = true, onComplete }: EnhancedTodoItemProps) {
  const navigate = useNavigate();
  const { 
    toggleTodo, 
    deleteTodo, 
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    toggleMyDay
  } = useAppStore();
  
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  
  const x = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // 滑动背景颜色
  const leftBg = useTransform(x, [-100, 0], ['#22c55e', '#ffffff']);
  const rightBg = useTransform(x, [0, 100], ['#ffffff', '#ef4444']);

  // 计算完成进度
  const completedSubtasks = todo.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = todo.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // 优先级配置
  const priorityConfig = {
    low: { color: 'default', label: '低' },
    medium: { color: 'primary', label: '中' },
    high: { color: 'danger', label: '高' },
  };

  const formattedDueDate = todo.dueDate
    ? format(new Date(todo.dueDate), 'yyyy-MM-dd HH:mm', { locale: zhCN })
    : null;

  // 检测是否为移动设备
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleToggle = () => {
    if (!todo.completed) {
      // 触发五彩纸屑
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
    }
    toggleTodo(todo.id);
    
    // 如果任务完成，触发自动归档
    if (!todo.completed && onComplete) {
      onComplete();
    }
  };

  // 移动端滑动处理
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (!isMobile) return;

    const threshold = 100;
    if (info.offset.x > threshold) {
      // 向右滑：删除
      setIsRemoving(true);
      setTimeout(() => deleteTodo(todo.id), 300);
    } else if (info.offset.x < -threshold) {
      // 向左滑：完成
      handleToggle();
      x.set(0);
    } else {
      x.set(0);
    }
  };

  // 移动端长按处理
  const handlePressStart = () => {
    if (!isMobile) return;
    
    longPressTimer.current = setTimeout(() => {
      setShowMenu(true);
      // 触觉反馈
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleStartFocus = () => {
    setShowMenu(false);
    navigate('/focus', { state: { taskId: todo.id, taskName: todo.title } });
  };

  const handleDelete = () => {
    setShowMenu(false);
    setIsRemoving(true);
    setTimeout(() => deleteTodo(todo.id), 300);
  };

  const handleAddToMyDay = () => {
    setShowMenu(false);
    toggleMyDay(todo.id);
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      addSubtask(todo.id, newSubtask);
      setNewSubtask('');
      setIsAddingSubtask(false);
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    deleteSubtask(todo.id, subtaskId);
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        style={{ x: isMobile ? x : 0 }}
        drag={isMobile ? 'x' : false}
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        animate={{
          opacity: isRemoving ? 0 : 1,
          scale: isRemoving ? 0.8 : 1,
        }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {/* 滑动背景提示 */}
        {isMobile && (
          <>
            <motion.div
              style={{ backgroundColor: rightBg }}
              className="absolute inset-0 flex items-center justify-end px-6 rounded-lg"
            >
              <Trash2 size={24} className="text-danger" />
            </motion.div>
            <motion.div
              style={{ backgroundColor: leftBg }}
              className="absolute inset-0 flex items-center justify-start px-6 rounded-lg"
            >
              <Checkbox size="lg" isSelected color="success" />
            </motion.div>
          </>
        )}

        <Card
          className={`relative ${todo.completed ? 'opacity-60' : ''} ${isRemoving ? 'pointer-events-none' : ''}`}
        >
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              {/* 复选框 */}
              <Checkbox
                isSelected={todo.completed}
                onValueChange={handleToggle}
                color="success"
                size="lg"
                classNames={{
                  wrapper: 'after:bg-success',
                }}
              />

              {/* 内容区域 */}
              <div className="flex-1 min-w-0">
                {/* 标题和标签 */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className={`font-semibold text-stone-800 dark:text-stone-100 ${todo.completed ? 'line-through' : ''}`}>
                    {todo.title}
                  </h4>

                  {/* PC端操作菜单 */}
                  {!isMobile && (
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly variant="light" size="sm">
                          <MoreVertical size={18} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="myday"
                          startContent={<Sun size={16} />}
                          onPress={handleAddToMyDay}
                        >
                          {todo.isMyDay ? '从我的一天移除' : '添加到我的一天'}
                        </DropdownItem>
                        <DropdownItem
                          key="focus"
                          startContent={<Timer size={16} />}
                          onPress={handleStartFocus}
                        >
                          开始专注
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          color="danger"
                          startContent={<Trash2 size={16} />}
                          onPress={handleDelete}
                        >
                          删除
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  )}
                </div>

                {/* 标签和状态 */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {showPartition && (
                    <Chip size="sm" variant="flat" color="secondary">
                      {todo.partition}
                    </Chip>
                  )}
                  <Chip size="sm" variant="flat" color={priorityConfig[todo.priority].color as any}>
                    {priorityConfig[todo.priority].label}优先级
                  </Chip>
                  {todo.type === 'habit' && (
                    <Chip size="sm" variant="flat" color="warning" startContent={<Flame size={12} />}>
                      连续 {todo.streak} 天
                    </Chip>
                  )}
                  {todo.isMyDay && (
                    <Chip size="sm" variant="flat" color="primary" startContent={<Sun size={12} />}>
                      我的一天
                    </Chip>
                  )}
                </div>

                {formattedDueDate && (
                  <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mb-2">
                    <Calendar size={12} />
                    <span>截止 {formattedDueDate}</span>
                  </div>
                )}

                {/* 子任务 */}
                <div className="mt-2">
                  {todo.subtasks.length > 0 && (
                    <>
                      <Button
                        size="sm"
                        variant="light"
                        startContent={isSubtasksExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        onPress={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
                        className="mb-2"
                      >
                        子任务 ({completedSubtasks}/{totalSubtasks})
                      </Button>

                      <AnimatePresence>
                        {isSubtasksExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-2 pl-4 border-l-2 border-stone-200 dark:border-stone-700"
                        >
                          {todo.subtasks.map((subtask) => (
                            <div key={subtask.id} className="flex items-center gap-2 group">
                              <Checkbox
                                size="sm"
                                isSelected={subtask.completed}
                                onValueChange={() => toggleSubtask(todo.id, subtask.id)}
                              />
                              <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-stone-400' : 'text-stone-600 dark:text-stone-300'}`}>
                                {subtask.title}
                              </span>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onPress={() => handleDeleteSubtask(subtask.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {/* 添加子任务按钮 - 始终显示在外层 */}
                {isAddingSubtask ? (
                  <div className="flex items-center gap-2 mt-2">
                              <Input
                                size="sm"
                                placeholder="输入子任务..."
                                value={newSubtask}
                                onValueChange={setNewSubtask}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') handleAddSubtask();
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                color="primary"
                                onPress={handleAddSubtask}
                              >
                                添加
                              </Button>
                              <Button
                                size="sm"
                                variant="light"
                                onPress={() => {
                                  setIsAddingSubtask(false);
                                  setNewSubtask('');
                                }}
                              >
                                取消
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="light"
                    startContent={<Plus size={14} />}
                    onPress={() => setIsAddingSubtask(true)}
                    className="mt-2"
                  >
                    添加子任务
                  </Button>
                )}

                {/* 进度条 */}
                {totalSubtasks > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                      <span>进度</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-success"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* 移动端长按菜单 */}
      {isMobile && showMenu && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowMenu(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-stone-800 rounded-xl p-2 m-4 min-w-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              fullWidth
              variant="light"
              startContent={<Sun size={18} />}
              onPress={handleAddToMyDay}
              className="justify-start"
            >
              {todo.isMyDay ? '从我的一天移除' : '添加到我的一天'}
            </Button>
            <Button
              fullWidth
              variant="light"
              startContent={<Timer size={18} />}
              onPress={handleStartFocus}
              className="justify-start"
            >
              开始专注
            </Button>
            <Button
              fullWidth
              variant="light"
              color="danger"
              startContent={<Trash2 size={18} />}
              onPress={handleDelete}
              className="justify-start"
            >
              删除
            </Button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
