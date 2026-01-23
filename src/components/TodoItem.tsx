import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Checkbox, Button, Progress, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from '@nextui-org/react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Trash2, Plus, Calendar, Tag, Timer, Sun, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Todo } from '../types';
import useAppStore from '../store/useAppStore';

interface TodoItemProps {
  todo: Todo;
  showPartition?: boolean;
}

export default function TodoItem({ todo, showPartition = true }: TodoItemProps) {
  const navigate = useNavigate();
  const { 
    toggleTodo, 
    deleteTodo, 
    addSubtask, 
    toggleSubtask, 
    deleteSubtask, 
    addTodoHistory,
    toggleMyDay 
  } = useAppStore();
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [historyTag, setHistoryTag] = useState('');

  // 计算完成进度
  const completedSubtasks = todo.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = todo.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

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

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      addSubtask(todo.id, newSubtask);
      setNewSubtask('');
    }
  };

  const handleAddHistory = () => {
    addTodoHistory(todo.id, historyTag || undefined);
    setHistoryTag('');
  };

  const handleStartFocus = () => {
    navigate('/focus', { state: { taskId: todo.id, taskName: todo.title } });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -50 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className={`modern-card mb-3 ${todo.isMyDay ? 'ring-2 ring-amber-400 dark:ring-amber-500' : ''}`}>
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
                      onValueChange={() => toggleTodo(todo.id)}
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
                  <div className="mt-2 space-y-1">
                    {todo.subtasks.slice(0, 2).map((subtask) => (
                      <div
                        key={subtask.id}
                        className="text-xs text-stone-500 dark:text-stone-400 flex items-center"
                      >
                        <span
                          className={`mr-1 ${
                            subtask.completed ? 'text-green-500' : 'text-stone-300'
                          }`}
                        >
                          {subtask.completed ? '✓' : '○'}
                        </span>
                        <span className={subtask.completed ? 'line-through' : ''}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                    {todo.subtasks.length > 2 && (
                      <p className="text-xs text-stone-400">
                        +{todo.subtasks.length - 2} 更多...
                      </p>
                    )}
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
              <h4 className="font-semibold mb-3 flex items-center">
                <span>子任务</span>
                <span className="ml-2 text-xs text-stone-400">
                  ({completedSubtasks}/{totalSubtasks})
                </span>
              </h4>
              <div className="space-y-2">
                {todo.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-stone-50 dark:bg-stone-900"
                  >
                    <Checkbox
                      isSelected={subtask.completed}
                      onValueChange={() => toggleSubtask(todo.id, subtask.id)}
                      color="success"
                    >
                      <span
                        className={subtask.completed ? 'line-through text-stone-400' : ''}
                      >
                        {subtask.title}
                      </span>
                    </Checkbox>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => deleteSubtask(todo.id, subtask.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
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
            <Button variant="light" onPress={() => setIsDetailOpen(false)}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
