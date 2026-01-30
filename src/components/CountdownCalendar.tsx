import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, Chip, Button, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isSameMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Countdown } from '../types';

interface CountdownCalendarProps {
  countdowns: Countdown[];
  onDateClick?: (date: Date, countdowns: Countdown[]) => void;
}

// 主题图标映射
const THEME_ICONS: Record<string, string> = {
  birthday: '🎂',
  exam: '📚',
  anniversary: '💕',
  travel: '✈️',
  custom: '⏰',
};

export default function CountdownCalendar({ countdowns, onDateClick }: CountdownCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 获取当前月份的日历网格
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { locale: zhCN });
    const calendarEnd = endOfWeek(monthEnd, { locale: zhCN });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // 按日期分组倒计时
  const countdownsByDate = useMemo(() => {
    const map = new Map<string, Countdown[]>();
    
    countdowns.forEach((countdown) => {
      const dateKey = format(new Date(countdown.targetDate), 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(countdown);
    });

    return map;
  }, [countdowns]);

  // 获取某一天的倒计时
  const getCountdownsForDay = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return countdownsByDate.get(dateKey) || [];
  };

  // 导航到上个月
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  // 导航到下个月
  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  // 回到今天
  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <Card className="w-full">
      <CardBody className="p-6">
        {/* 月份导航 */}
        <div className="flex items-center justify-between mb-6">
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={handlePrevMonth}
          >
            <ChevronLeft size={20} />
          </Button>

          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
              {format(currentMonth, 'yyyy年MM月', { locale: zhCN })}
            </h2>
            <Button
              size="sm"
              variant="flat"
              onPress={handleToday}
              startContent={<CalendarIcon size={16} />}
            >
              今天
            </Button>
          </div>

          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={handleNextMonth}
          >
            <ChevronRight size={20} />
          </Button>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map((day, idx) => (
            <div
              key={idx}
              className="text-center text-sm font-semibold text-stone-500 dark:text-stone-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日历网格 */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            const dayCountdowns = getCountdownsForDay(day);
            const hasCountdowns = dayCountdowns.length > 0;
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.01 }}
                whileHover={hasCountdowns ? { scale: 1.05 } : undefined}
                className={`
                  relative aspect-square p-2 rounded-lg transition-all
                  ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'}
                  ${isTodayDate ? 'ring-2 ring-primary bg-primary/5' : 'bg-stone-50 dark:bg-stone-800'}
                  ${hasCountdowns ? 'cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700' : ''}
                `}
              >
                {/* 日期数字 */}
                <div className={`
                  text-sm font-semibold text-center mb-1
                  ${isTodayDate ? 'text-primary' : 'text-stone-700 dark:text-stone-200'}
                `}>
                  {format(day, 'd')}
                </div>

                {/* 倒计时指示器 - 使用Popover显示详情 */}
                {hasCountdowns && (
                  <Popover placement="bottom" showArrow>
                    <PopoverTrigger>
                      <div className="absolute inset-x-0 bottom-1 flex flex-wrap justify-center gap-1 px-1 cursor-pointer">
                        {dayCountdowns.slice(0, 3).map((countdown, cdIdx) => {
                          const theme = countdown.theme || 'custom';
                          const icon = THEME_ICONS[theme];
                          
                          return (
                            <motion.span
                              key={countdown.id}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3 + cdIdx * 0.1 }}
                              className="text-xs"
                            >
                              {icon}
                            </motion.span>
                          );
                        })}
                        {dayCountdowns.length > 3 && (
                          <span className="text-[10px] text-stone-500 dark:text-stone-400">
                            +{dayCountdowns.length - 3}
                          </span>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <div className="px-4 py-3 max-w-xs">
                        <div className="text-sm font-semibold text-stone-700 dark:text-stone-200 mb-2">
                          {format(day, 'yyyy年MM月dd日', { locale: zhCN })}
                        </div>
                        <div className="space-y-2">
                          {dayCountdowns.map((countdown) => {
                            const theme = countdown.theme || 'custom';
                            const icon = THEME_ICONS[theme];
                            
                            return (
                              <div 
                                key={countdown.id}
                                className="flex items-start gap-2 p-2 rounded-lg bg-stone-50 dark:bg-stone-800"
                              >
                                <span className="text-lg flex-shrink-0">{icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">
                                    {countdown.title}
                                  </div>
                                  <div className="text-xs text-stone-500 dark:text-stone-400">
                                    {format(new Date(countdown.targetDate), 'HH:mm', { locale: zhCN })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {/* 今天标记 */}
                {isTodayDate && (
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* 图例 */}
        <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-600 dark:text-stone-300 mb-3">
            倒计时类型
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(THEME_ICONS).map(([theme, icon]) => (
              <Chip
                key={theme}
                size="sm"
                variant="flat"
                startContent={<span className="text-base">{icon}</span>}
              >
                {theme === 'birthday' ? '生日' :
                 theme === 'exam' ? '考试' :
                 theme === 'anniversary' ? '纪念日' :
                 theme === 'travel' ? '旅行' : '自定义'}
              </Chip>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
