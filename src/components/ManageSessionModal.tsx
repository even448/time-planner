import { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input,
  Divider,
} from '@nextui-org/react';
import { Calendar, Clock, Trash2, AlertCircle } from 'lucide-react';
import { format, parseISO, differenceInSeconds } from 'date-fns';
import { FocusSession } from '../types';
import useAppStore from '../store/useAppStore';

interface ManageSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session?: FocusSession; // 如果提供了 session，则是编辑模式
}

export default function ManageSessionModal({
  isOpen,
  onClose,
  session,
}: ManageSessionModalProps) {
  const { focusTasks, addFocusSession, updateFocusSession, deleteFocusSession } = useAppStore();
  
  // 表单状态
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [customTaskTitle, setCustomTaskTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [sessionType, setSessionType] = useState<'pomodoro' | 'stopwatch'>('stopwatch');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 编辑模式初始化
  useEffect(() => {
    if (session && isOpen) {
      // 编辑现有会话
      const startDateTime = parseISO(session.startTime);
      const endDateTime = new Date(startDateTime.getTime() + session.duration * 1000);
      
      setSelectedTaskId(session.taskId || '');
      setCustomTaskTitle(session.taskTitle || '');
      setStartDate(format(startDateTime, 'yyyy-MM-dd'));
      setStartTime(format(startDateTime, 'HH:mm'));
      setEndDate(format(endDateTime, 'yyyy-MM-dd'));
      setEndTime(format(endDateTime, 'HH:mm'));
      setSessionType(session.type);
    } else if (isOpen) {
      // 新建会话 - 默认值
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      setSelectedTaskId('');
      setCustomTaskTitle('');
      setStartDate(format(oneHourAgo, 'yyyy-MM-dd'));
      setStartTime(format(oneHourAgo, 'HH:mm'));
      setEndDate(format(now, 'yyyy-MM-dd'));
      setEndTime(format(now, 'HH:mm'));
      setSessionType('stopwatch');
    }
  }, [session, isOpen]);

  // 计算时长
  const calculatedDuration = useMemo(() => {
    if (!startDate || !startTime || !endDate || !endTime) return null;
    
    try {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      const seconds = differenceInSeconds(end, start);
      
      if (seconds <= 0) return null;
      
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      
      return {
        seconds,
        display: hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`,
        isValid: seconds > 0,
      };
    } catch {
      return null;
    }
  }, [startDate, startTime, endDate, endTime]);

  // 表单验证
  const isValid = useMemo(() => {
    if (!startDate || !startTime || !endDate || !endTime) return false;
    if (!selectedTaskId && !customTaskTitle.trim()) return false;
    if (!calculatedDuration || !calculatedDuration.isValid) return false;
    return true;
  }, [startDate, startTime, endDate, endTime, selectedTaskId, customTaskTitle, calculatedDuration]);

  const handleSave = () => {
    if (!isValid || !calculatedDuration) return;

    const start = new Date(`${startDate}T${startTime}`);
    const taskTitle = selectedTaskId
      ? focusTasks.find((t) => t.id === selectedTaskId)?.title || customTaskTitle
      : customTaskTitle;

    const sessionData = {
      taskId: selectedTaskId || undefined,
      taskTitle,
      startTime: start.toISOString(),
      duration: calculatedDuration.seconds,
      type: sessionType,
    };

    if (session) {
      // 更新现有会话
      updateFocusSession(session.id, sessionData);
    } else {
      // 创建新会话
      addFocusSession(sessionData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (session) {
      deleteFocusSession(session.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">
            {session ? '编辑专注记录' : '添加专注记录'}
          </h3>
          <p className="text-sm text-gray-500 font-normal">
            {session ? '修改过往的专注会话信息' : '手动记录线下或历史的专注时段'}
          </p>
        </ModalHeader>
        
        <ModalBody>
          {/* 任务选择 */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">选择任务</label>
              <Select
                placeholder="从现有任务中选择"
                selectedKeys={selectedTaskId ? [selectedTaskId] : []}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                startContent={<Clock size={16} />}
              >
                {focusTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* 自定义任务名 */}
            {!selectedTaskId && (
              <Input
                label="或输入任务名称"
                placeholder="例如：阅读、运动、编程..."
                value={customTaskTitle}
                onValueChange={setCustomTaskTitle}
                required
              />
            )}

            <Divider className="my-2" />

            {/* 开始时间 */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Calendar size={16} />
                开始时间
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 结束时间 */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Clock size={16} />
                结束时间
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 会话类型 */}
            <Select
              label="会话类型"
              selectedKeys={[sessionType]}
              onChange={(e) => setSessionType(e.target.value as 'pomodoro' | 'stopwatch')}
            >
              <SelectItem key="pomodoro" value="pomodoro">
                🍅 番茄钟
              </SelectItem>
              <SelectItem key="stopwatch" value="stopwatch">
                ⏱️ 正计时
              </SelectItem>
            </Select>

            {/* 时长显示 */}
            {calculatedDuration ? (
              calculatedDuration.isValid ? (
                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">专注时长</span>
                    <span className="text-lg font-bold text-success">
                      {calculatedDuration.display}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-danger/10 rounded-lg border border-danger/20">
                  <div className="flex items-center gap-2 text-danger">
                    <AlertCircle size={16} />
                    <span className="text-sm">结束时间必须晚于开始时间</span>
                  </div>
                </div>
              )
            ) : null}
          </div>
        </ModalBody>
        
        <ModalFooter className="flex justify-between">
          {/* 删除按钮（仅编辑模式） */}
          {session && (
            <div>
              {!showDeleteConfirm ? (
                <Button
                  color="danger"
                  variant="light"
                  startContent={<Trash2 size={16} />}
                  onPress={() => setShowDeleteConfirm(true)}
                >
                  删除
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="danger"
                    onPress={handleDelete}
                  >
                    确认删除
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => setShowDeleteConfirm(false)}
                  >
                    取消
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* 主操作按钮 */}
          <div className="flex gap-2 ml-auto">
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button
              color="primary"
              onPress={handleSave}
              isDisabled={!isValid}
            >
              {session ? '保存更改' : '添加记录'}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
