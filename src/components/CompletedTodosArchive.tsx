import { motion, AnimatePresence } from 'framer-motion';
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Chip, Card, CardBody } from '@nextui-org/react';
import { Archive, RotateCcw, Trash2, Calendar, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Todo } from '../types';

interface CompletedTodosArchiveProps {
  isOpen: boolean;
  onClose: () => void;
  completedTodos: Todo[];
  onUncomplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CompletedTodosArchive({
  isOpen,
  onClose,
  completedTodos,
  onUncomplete,
  onDelete,
}: CompletedTodosArchiveProps) {
  // 按完成日期排序（最近完成的在前）
  const sortedTodos = [...completedTodos].sort((a, b) => {
    if (a.lastCompletedDate && b.lastCompletedDate) {
      return new Date(b.lastCompletedDate).getTime() - new Date(a.lastCompletedDate).getTime();
    }
    if (a.lastCompletedDate) return -1;
    if (b.lastCompletedDate) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const priorityConfig = {
    low: { color: 'default', label: '低' },
    medium: { color: 'primary', label: '中' },
    high: { color: 'danger', label: '高' },
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Archive size={20} />
          已完成的任务
          <Chip size="sm" variant="flat" color="success">{completedTodos.length}</Chip>
        </ModalHeader>
        <ModalBody className="py-6">
          {completedTodos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-stone-400 dark:text-stone-500">
                还没有完成的任务
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {sortedTodos.map((todo) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Card className="bg-stone-50 dark:bg-stone-800">
                      <CardBody className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-stone-800 dark:text-stone-100 mb-2 line-through">
                              {todo.title}
                            </h4>
                            
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Chip size="sm" variant="flat" color="secondary">
                                {todo.partition}
                              </Chip>
                              <Chip 
                                size="sm" 
                                variant="flat" 
                                color={priorityConfig[todo.priority].color as any}
                                startContent={<Flag size={12} />}
                              >
                                {priorityConfig[todo.priority].label}优先级
                              </Chip>
                              {todo.type === 'habit' && (
                                <Chip size="sm" variant="flat" color="warning">
                                  习惯
                                </Chip>
                              )}
                            </div>

                            {/* 子任务统计 */}
                            {todo.subtasks.length > 0 && (
                              <div className="text-xs text-stone-500 dark:text-stone-400 mb-1">
                                包含 {todo.subtasks.length} 个子任务，
                                已完成 {todo.subtasks.filter((s) => s.completed).length} 个
                              </div>
                            )}

                            {/* 完成时间 */}
                            {todo.lastCompletedDate && (
                              <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                                <Calendar size={12} />
                                完成于 {format(new Date(todo.lastCompletedDate), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                              </div>
                            )}
                          </div>

                          {/* 操作按钮 */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              color="success"
                              onPress={() => onUncomplete(todo.id)}
                              title="恢复任务"
                            >
                              <RotateCcw size={16} />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              color="danger"
                              onPress={() => onDelete(todo.id)}
                              title="删除"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
