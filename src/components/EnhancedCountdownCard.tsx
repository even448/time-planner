import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, Button, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Progress } from '@nextui-org/react';
import { Trash2, Archive, MoreVertical, Calendar, Clock, Sparkles } from 'lucide-react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInWeeks, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Countdown } from '../types';

interface EnhancedCountdownCardProps {
  countdown: Countdown;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

// 主题配置
const THEMES = {
  birthday: {
    gradient: 'from-pink-500 via-purple-500 to-indigo-500',
    icon: '🎂',
    emoji: '🎉',
  },
  exam: {
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    icon: '📚',
    emoji: '💪',
  },
  anniversary: {
    gradient: 'from-red-500 via-pink-500 to-rose-500',
    icon: '💕',
    emoji: '❤️',
  },
  travel: {
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    icon: '✈️',
    emoji: '🌍',
  },
  custom: {
    gradient: 'from-stone-500 via-stone-600 to-stone-700',
    icon: '⏰',
    emoji: '⭐',
  },
};

export default function EnhancedCountdownCard({ 
  countdown, 
  onDelete, 
  onArchive,
}: EnhancedCountdownCardProps) {
  const [timeUnit, setTimeUnit] = useState<'auto' | 'weeks' | 'days' | 'hours' | 'minutes'>(
    countdown.timeUnit || 'auto'
  );

  const now = new Date();
  let target = new Date(countdown.targetDate);

  // 处理重复逻辑
  if (!countdown.countUpMode && countdown.repeat !== 'none') {
    const originalTarget = new Date(countdown.targetDate);
    const next = new Date(originalTarget);
    
    if (countdown.repeat === 'yearly') {
      next.setFullYear(now.getFullYear());
      if (next < now) next.setFullYear(now.getFullYear() + 1);
      target = next;
    } else if (countdown.repeat === 'monthly') {
      next.setMonth(now.getMonth());
      if (next < now) next.setMonth(now.getMonth() + 1);
      target = next;
    } else if (countdown.repeat === 'weekly') {
      while (next < now) {
        next.setDate(next.getDate() + 7);
      }
      target = next;
    }
  }

  const diffMs = target.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  // 计算各种时间单位
  const weeks = Math.abs(differenceInWeeks(target, now));
  const days = Math.abs(differenceInDays(target, now));
  const hours = Math.abs(differenceInHours(target, now));
  const minutes = Math.abs(differenceInMinutes(target, now));
  
  const hoursRemainder = hours % 24;
  const minutesRemainder = minutes % 60;

  // 关键节点检测
  const isKeyMilestone = [1, 7, 30, 100].includes(days) && !isPast;
  const isUrgent = days <= 3 && !isPast;
  const isCritical = days === 0 && !isPast;

  // 获取主题配置
  const theme = THEMES[countdown.theme || 'custom'];

  // 根据时间单位显示
  let mainNumber = 0;
  let mainUnit = '天';
  
  if (timeUnit === 'auto') {
    if (days >= 7) {
      mainNumber = days;
      mainUnit = '天';
    } else if (days >= 1) {
      mainNumber = days;
      mainUnit = '天';
    } else if (hours >= 1) {
      mainNumber = hoursRemainder;
      mainUnit = '小时';
    } else {
      mainNumber = minutesRemainder;
      mainUnit = '分钟';
    }
  } else if (timeUnit === 'weeks') {
    mainNumber = weeks;
    mainUnit = '周';
  } else if (timeUnit === 'days') {
    mainNumber = days;
    mainUnit = '天';
  } else if (timeUnit === 'hours') {
    mainNumber = hours;
    mainUnit = '小时';
  } else if (timeUnit === 'minutes') {
    mainNumber = minutes;
    mainUnit = '分钟';
  }

  // 详细时间显示
  const detailText = `${days}天 ${hoursRemainder}小时 ${minutesRemainder}分钟`;

  // 进度计算
  const startTime = countdown.createdAt 
    ? new Date(countdown.createdAt).getTime()
    : target.getTime() - 30 * 24 * 60 * 60 * 1000;
  
  const totalDuration = target.getTime() - startTime;
  const elapsed = now.getTime() - startTime;
  let progressPct = 0;
  
  if (totalDuration > 0) {
    progressPct = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }
  if (isPast && !countdown.countUpMode) progressPct = 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card 
        className={`
          relative overflow-hidden shadow-xl
          ${isKeyMilestone ? 'ring-4 ring-amber-400 animate-pulse' : ''}
          ${isUrgent && !isKeyMilestone ? 'ring-2 ring-red-400' : ''}
          ${isCritical ? 'animate-pulse-fast' : ''}
        `}
      >
        {/* 渐变背景 */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-10`} />
        
        {/* 背景图片 */}
        {countdown.bgImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${countdown.bgImage})` }}
          />
        )}

        <CardBody className="relative z-10 p-6">
          {/* 头部：标题和操作 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <motion.div
                className="text-4xl"
                animate={{ 
                  rotate: isKeyMilestone ? [0, -10, 10, -10, 10, 0] : 0,
                  scale: isKeyMilestone ? [1, 1.2, 1] : 1,
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: isKeyMilestone ? Infinity : 0,
                  repeatDelay: 3,
                }}
              >
                {theme.icon}
              </motion.div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-1">
                  {countdown.title}
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {format(target, 'yyyy年MM月dd日', { locale: zhCN })}
                </p>
              </div>
            </div>

            {/* 操作菜单 */}
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly variant="light" size="sm">
                  <MoreVertical size={18} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  key="archive"
                  startContent={<Archive size={16} />}
                  onPress={() => onArchive(countdown.id)}
                >
                  归档
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  startContent={<Trash2 size={16} />}
                  onPress={() => onDelete(countdown.id)}
                >
                  删除
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* 关键节点提醒 */}
          {isKeyMilestone && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Chip 
                color="warning" 
                variant="flat" 
                startContent={<Sparkles size={14} />}
                className="animate-pulse"
              >
                {days === 1 ? '明天就到啦！' : 
                 days === 7 ? '还有一周！' : 
                 days === 30 ? '还有一个月！' : 
                 days === 100 ? '百日倒计时！' : '重要节点'}
              </Chip>
            </motion.div>
          )}

          {/* 数字翻转动画 */}
          <div className="flex items-center justify-center my-6">
            <div className="text-center">
              {/* 状态文字 */}
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">
                {isPast ? (countdown.countUpMode ? '已经起始' : '已经过去') : '还有'}
              </p>
              
              {/* 主数字 */}
              <div className="flex items-baseline justify-center gap-2">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={mainNumber}
                    initial={{ y: 20, opacity: 0, rotateX: 90 }}
                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                    exit={{ y: -20, opacity: 0, rotateX: -90 }}
                    transition={{ duration: 0.3 }}
                    className="text-6xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent hero-number"
                  >
                    {mainNumber}
                  </motion.span>
                </AnimatePresence>
                <span className="text-2xl font-semibold text-stone-600 dark:text-stone-300">
                  {mainUnit}
                </span>
              </div>

              {/* 详细时间 */}
              <p className="text-xs text-stone-400 mt-2">{detailText}</p>
            </div>
          </div>

          {/* 时间单位切换 */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {(['auto', 'weeks', 'days', 'hours', 'minutes'] as const).map((unit) => (
              <Button
                key={unit}
                size="sm"
                variant={timeUnit === unit ? 'solid' : 'flat'}
                color={timeUnit === unit ? 'primary' : 'default'}
                onPress={() => setTimeUnit(unit)}
                className="min-w-0 px-2"
              >
                {unit === 'auto' ? '自动' : 
                 unit === 'weeks' ? '周' : 
                 unit === 'days' ? '天' : 
                 unit === 'hours' ? '时' : '分'}
              </Button>
            ))}
          </div>

          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>进度</span>
              <span>{progressPct.toFixed(0)}%</span>
            </div>
            <Progress
              value={progressPct}
              color={isPast ? 'default' : isUrgent ? 'danger' : isCritical ? 'warning' : 'primary'}
              className="h-2"
              classNames={{
                indicator: 'bg-gradient-to-r',
              }}
            />
          </div>

          {/* 底部标签 */}
          <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {countdown.repeat !== 'none' && (
                <Chip size="sm" variant="flat" color="secondary" startContent={<Calendar size={12} />}>
                  {countdown.repeat === 'yearly' ? '每年' : 
                   countdown.repeat === 'monthly' ? '每月' : '每周'}
                </Chip>
              )}
              {countdown.countUpMode && (
                <Chip size="sm" variant="flat" color="success">
                  纪念日
                </Chip>
              )}
            </div>
            <Chip size="sm" variant="flat" startContent={<Clock size={12} />}>
              {isPast ? '已结束' : isUrgent ? '紧急' : isCritical ? '今天！' : '进行中'}
            </Chip>
          </div>
        </CardBody>
      </Card>

      {/* CSS动画 */}
      <style>{`
        @keyframes pulse-fast {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }
        .animate-pulse-fast {
          animation: pulse-fast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </motion.div>
  );
}
