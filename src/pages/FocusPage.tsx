import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from '@nextui-org/react';
import { Plus, Trash2, Clock, Edit3 } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import FocusTimer from '../components/FocusTimer';
import ManageSessionModal from '../components/ManageSessionModal';
import useAppStore from '../store/useAppStore';
import { FocusSession } from '../types';

export default function FocusPage() {
  const location = useLocation();
  const { focusTasks, focusSessions, addFocusTask, deleteFocusTask } = useAppStore();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<FocusSession | undefined>(undefined);
  const [prefilledTask, setPrefilledTask] = useState<string | null>(null);

  // 处理从 Todo 传递的任务
  useEffect(() => {
    if (location.state?.taskName) {
      setPrefilledTask(location.state.taskName);
      // 如果任务不存在，自动添加到任务列表
      const taskExists = focusTasks.some(t => t.title === location.state.taskName);
      if (!taskExists) {
        addFocusTask(location.state.taskName);
      }
    }
  }, [location.state, focusTasks, addFocusTask]);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addFocusTask(newTaskTitle);
      setNewTaskTitle('');
      setIsTaskModalOpen(false);
    }
  };

  const handleOpenAddSession = () => {
    setEditingSession(undefined);
    setIsSessionModalOpen(true);
  };

  const handleOpenEditSession = (session: FocusSession) => {
    setEditingSession(session);
    setIsSessionModalOpen(true);
  };

  const handleCloseSessionModal = () => {
    setIsSessionModalOpen(false);
    setEditingSession(undefined);
  };

  // 计算总专注时长
  const totalFocusTime = focusSessions.reduce((acc, session) => acc + session.duration, 0);
  const totalHours = Math.floor(totalFocusTime / 3600);
  const totalMinutes = Math.floor((totalFocusTime % 3600) / 60);

  // 最近的专注记录
  const recentSessions = [...focusSessions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="pb-6">
      <h2 className="text-2xl font-bold mb-6">专注计时</h2>

      {/* 计时器 */}
      <FocusTimer />

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4 mt-8 mb-6">
        <Card className="glass-card">
          <CardBody className="text-center p-4">
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-1">总专注时长</p>
            <p className="text-2xl font-bold text-primary">
              {totalHours}h {totalMinutes}m
            </p>
          </CardBody>
        </Card>
        <Card className="glass-card">
          <CardBody className="text-center p-4">
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-1">专注次数</p>
            <p className="text-2xl font-bold text-success">{focusSessions.length}</p>
          </CardBody>
        </Card>
      </div>

      {/* 任务列表 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">专注任务</h3>
          <Button
            size="sm"
            color="primary"
            startContent={<Plus size={16} />}
            onPress={() => setIsTaskModalOpen(true)}
          >
            添加任务
          </Button>
        </div>

        {focusTasks.length === 0 ? (
          <Card className="glass-card">
            <CardBody className="text-center py-8">
              <p className="text-stone-400 dark:text-stone-500">
                还没有专注任务，点击添加吧
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-2">
            {focusTasks.map((task) => (
              <Card key={task.id} className="glass-card">
                <CardBody className="flex flex-row items-center justify-between p-3">
                  <span className="font-medium">{task.title}</span>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => deleteFocusTask(task.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 最近专注记录 */}
      {recentSessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">最近专注</h3>
            <Button
              size="sm"
              color="primary"
              variant="light"
              startContent={<Plus size={16} />}
              onPress={handleOpenAddSession}
            >
              添加记录
            </Button>
          </div>
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <Card
                key={session.id}
                className="glass-card cursor-pointer hover:bg-default-100 transition-colors"
                isPressable
                onPress={() => handleOpenEditSession(session)}
              >
                <CardBody className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="text-primary" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{session.taskTitle}</p>
                        <p className="text-xs text-stone-400">
                          {formatDistance(new Date(session.createdAt), new Date(), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">
                          {Math.floor(session.duration / 60)}分
                        </p>
                        <p className="text-xs text-stone-400">
                          {session.type === 'pomodoro' ? '🍅' : '⏱️'}
                        </p>
                      </div>
                      <Edit3 size={16} className="text-stone-400" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 空状态 - 添加记录提示 */}
      {recentSessions.length === 0 && (
        <Card className="glass-card">
          <CardBody className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-3 text-stone-300 dark:text-stone-600" />
            <p className="text-stone-400 dark:text-stone-500 mb-3">
              还没有专注记录
            </p>
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Plus size={16} />}
              onPress={handleOpenAddSession}
            >
              添加首个记录
            </Button>
          </CardBody>
        </Card>
      )}

      {/* 添加任务 Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)}>
        <ModalContent>
          <ModalHeader>添加专注任务</ModalHeader>
          <ModalBody>
            <Input
              label="任务名称"
              placeholder="例如：学习 React"
              value={newTaskTitle}
              onValueChange={setNewTaskTitle}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsTaskModalOpen(false)}>
              取消
            </Button>
            <Button color="primary" onPress={handleAddTask}>
              添加
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 管理专注记录 Modal */}
      <ManageSessionModal
        isOpen={isSessionModalOpen}
        onClose={handleCloseSessionModal}
        session={editingSession}
      />
    </div>
  );
}

