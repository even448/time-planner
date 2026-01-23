import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Card, CardBody, Progress, Button } from '@nextui-org/react';
import { Trash2, Archive, Timer, RotateCw } from 'lucide-react';
import { differenceInDays, differenceInHours, differenceInMinutes, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Countdown } from '../types';

interface CountdownCardProps {
  countdown: Countdown;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onStartFocus?: (title: string) => void;
}

export default function CountdownCard({ 
  countdown, 
  onDelete, 
  onArchive,
  onStartFocus 
}: CountdownCardProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0], [0, 1]);
  const deleteOpacity = useTransform(x, [-150, 0], [1, 0]);

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

  // 计算时间差
  const days = Math.abs(differenceInDays(target, now));
  const hours = Math.abs(differenceInHours(target, now) % 24);
  const minutes = Math.abs(differenceInMinutes(target, now) % 60);
  const totalHours = absDiff / (1000 * 60 * 60);

  // 紧急程度颜色
  let headerBgClass = '';
  if (isPast) {
    headerBgClass = countdown.countUpMode ? 'bg-orange-500' : 'bg-stone-500';
  } else {
    if (totalHours < 24) headerBgClass = 'bg-[#FF5252]'; // Red (<24h)
    else if (totalHours < 72) headerBgClass = 'bg-blue-500'; // Blue (1-3d)
    else headerBgClass = 'bg-emerald-500'; // Green (>3d)
  }

  // 主数字显示
  let labelText = isPast ? (countdown.countUpMode ? '已经起始' : '已经过去') : '还有';
  let mainNumber = days;
  let mainUnit = '天';
  const isUrgentTime = !isPast && totalHours < 1;

  if (!isPast) {
    if (days >= 1) {
      mainNumber = days;
      mainUnit = '天';
    } else if (hours >= 1) {
      mainNumber = hours;
      mainUnit = '小时';
    } else {
      mainNumber = minutes;
      mainUnit = '分';
    }
  }

  const subText = `${days}天 ${hours}小时 ${minutes}分钟`;

  // 进度条计算
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

  // 滑动删除
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete(countdown.id);
    } else {
      x.set(0);
    }
  };

  return (
    <div className="relative mt-4">
      {/* 删除背景 */}
      <motion.div
        className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-end px-6 z-0"
        style={{ opacity: deleteOpacity }}
      >
        <Trash2 className="text-white" size={24} />
        <span className="ml-2 text-white font-bold">删除</span>
      </motion.div>

      {/* 卡片主体 */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x, opacity }}
        className="relative z-10"
      >
        <Card className="modern-card overflow-visible">
          {/* Header with Background */}
          <div
            className={`relative h-24 ${headerBgClass} ${
              countdown.bgImage ? 'bg-cover bg-center' : ''
            }`}
            style={
              countdown.bgImage
                ? { backgroundImage: `url(${countdown.bgImage})` }
                : undefined
            }
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* 归档按钮 */}
            {isPast && !countdown.countUpMode && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => onArchive(countdown.id)}
                className="absolute top-2 right-2 text-white/90 hover:text-white z-30"
              >
                <Archive size={18} />
              </Button>
            )}

            {/* 标题 */}
            <div className="absolute bottom-2 left-4 right-4 z-10 flex items-center justify-between">
              <h3 className="font-bold text-white text-lg truncate flex items-center drop-shadow-md">
                {countdown.title}
                {countdown.repeat !== 'none' && (
                  <RotateCw size={14} className="ml-1 opacity-80" />
                )}
              </h3>
              {countdown.countUpMode && (
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                  正数
                </span>
              )}
            </div>
          </div>

          {/* 专注按钮 */}
          {!isPast && onStartFocus && (
            <Button
              size="sm"
              color="primary"
              variant="shadow"
              startContent={<Timer size={16} />}
              onPress={() => onStartFocus(countdown.title)}
              className="absolute -bottom-4 right-4 z-20 text-xs"
            >
              专注
            </Button>
          )}

          {/* Body */}
          <CardBody className="p-5 pt-6">
            <div className="flex items-center justify-between">
              {/* 左侧信息 */}
              <div className="flex-1 mr-4">
                <div className="flex items-baseline space-x-1 mb-1">
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wide">
                    {labelText}
                  </p>
                  <p className="text-xs text-stone-300 dark:text-stone-600">|</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 font-mono">
                    {format(target, 'yyyy-MM-dd', { locale: zhCN })}
                  </p>
                </div>
                <p className="text-xs text-stone-400 dark:text-stone-500 font-normal leading-relaxed">
                  {subText}
                </p>
              </div>

              {/* 右侧主数字 */}
              <div className="text-right flex flex-col items-end">
                <div className="flex items-baseline">
                  <span
                    className={`text-4xl font-bold text-stone-800 dark:text-stone-100 hero-number ${
                      isUrgentTime ? 'urgent-pulse' : ''
                    }`}
                  >
                    {mainNumber}
                  </span>
                  <span className="text-sm text-stone-500 dark:text-stone-400 font-medium ml-1">
                    {mainUnit}
                  </span>
                </div>
              </div>
            </div>

            {/* 进度条 */}
            <Progress
              value={progressPct}
              className="mt-4"
              classNames={{
                indicator: headerBgClass,
              }}
              size="sm"
            />
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
