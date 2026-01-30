import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Switch, Tabs, Tab } from '@nextui-org/react';
import { Plus, Search, Grid, Calendar, Archive } from 'lucide-react';
import EnhancedCountdownCard from '../components/EnhancedCountdownCard';
import CountdownCalendar from '../components/CountdownCalendar';
import ArchivedCountdownsModal from '../components/ArchivedCountdownsModal';
import TimeProgressWidget from '../components/TimeProgressWidget';
import HistoryTodayCard from '../components/HistoryTodayCard';
import useAppStore from '../store/useAppStore';

export default function CountdownPage() {
  const { countdowns, addCountdown, deleteCountdown, archiveCountdown, unarchiveCountdown } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  
  // 表单状态
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [targetHour, setTargetHour] = useState('');
  const [targetMinute, setTargetMinute] = useState('');
  const [bgImage, setBgImage] = useState('');
  const [countUpMode, setCountUpMode] = useState(false);
  const [repeat, setRepeat] = useState<'none' | 'yearly' | 'monthly' | 'weekly'>('none');
  const [theme, setTheme] = useState<'birthday' | 'exam' | 'anniversary' | 'travel' | 'custom'>('custom');

  // 过滤掉已归档的倒数日
  const activeCountdowns = countdowns.filter((c) => !c.archived);
  const archivedCountdowns = countdowns.filter((c) => c.archived);
  
  // 搜索过滤
  const filteredCountdowns = searchQuery
    ? activeCountdowns.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeCountdowns;

  // 按日期排序
  const sortedCountdowns = [...filteredCountdowns].sort(
    (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );

  const handleAddCountdown = () => {
    if (!title || !targetDate) return;

    // 组合日期和时间
    const hour = targetHour ? parseInt(targetHour, 10) : 0;
    const minute = targetMinute ? parseInt(targetMinute, 10) : 0;
    const dateTime = new Date(targetDate);
    dateTime.setHours(hour, minute, 0, 0);

    addCountdown({
      title,
      targetDate: dateTime.toISOString(),
      bgImage: bgImage || undefined,
      countUpMode,
      repeat,
      theme,
    });

    // 重置表单
    setTitle('');
    setTargetDate('');
    setTargetHour('');
    setTargetMinute('');
    setBgImage('');
    setCountUpMode(false);
    setRepeat('none');
    setTheme('custom');
    setIsModalOpen(false);
  };

  return (
    <div className="pb-6">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">倒数日</h2>
        <div className="flex items-center space-x-2">
          <Tabs 
            size="sm" 
            selectedKey={viewMode} 
            onSelectionChange={(key) => setViewMode(key as 'grid' | 'calendar')}
            variant="bordered"
          >
            <Tab key="grid" title={
              <div className="flex items-center gap-1">
                <Grid size={16} />
                <span>卡片</span>
              </div>
            } />
            <Tab key="calendar" title={
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>日历</span>
              </div>
            } />
          </Tabs>
          <Button
            isIconOnly
            variant="light"
            onPress={() => setShowSearch(!showSearch)}
          >
            <Search size={20} />
          </Button>
          <Button
            variant="flat"
            startContent={<Archive size={18} />}
            onPress={() => setIsArchivedModalOpen(true)}
          >
            已归档 ({archivedCountdowns.length})
          </Button>
          <Button
            color="primary"
            startContent={<Plus size={20} />}
            onPress={() => setIsModalOpen(true)}
          >
            添加
          </Button>
        </div>
      </div>

      {/* 搜索栏 */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <Input
              placeholder="搜索倒数日..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Search size={18} />}
              classNames={{
                input: 'text-sm',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 倒数日列表 */}
      {sortedCountdowns.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">⏰</div>
          <p className="text-stone-400 dark:text-stone-500">
            {searchQuery ? '没有找到相关倒数日' : '还没有倒数日，点击右上角添加吧'}
          </p>
        </div>
      ) : (
        <>
          {/* 小部件区域 - 仅在网格视图显示 */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <TimeProgressWidget />
              <HistoryTodayCard />
            </div>
          )}

          {/* 切换视图 */}
          {viewMode === 'calendar' ? (
            <CountdownCalendar 
              countdowns={sortedCountdowns}
              onDateClick={(date, countdowns) => {
                console.log('Selected date:', date, 'countdowns:', countdowns);
              }}
            />
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
              layout
            >
              <AnimatePresence mode="popLayout">
                {sortedCountdowns.map((countdown) => (
                  <motion.div
                    key={countdown.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      layout: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                      scale: { duration: 0.2 }
                    }}
                  >
                    <EnhancedCountdownCard
                      countdown={countdown}
                      onDelete={deleteCountdown}
                      onArchive={archiveCountdown}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}

      {/* 添加倒数日 Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>添加倒数日</ModalHeader>
          <ModalBody>
            <Input
              label="标题"
              placeholder="例如：高考倒计时"
              value={title}
              onValueChange={setTitle}
            />
            <Input
              label="目标日期"
              type="date"
              value={targetDate}
              onValueChange={setTargetDate}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="小时（可选）"
                type="number"
                placeholder="0-23"
                min="0"
                max="23"
                value={targetHour}
                onValueChange={setTargetHour}
              />
              <Input
                label="分钟（可选）"
                type="number"
                placeholder="0-59"
                min="0"
                max="59"
                value={targetMinute}
                onValueChange={setTargetMinute}
              />
            </div>
            <div>
              <label className="text-sm mb-2 block">主题模板</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
              >
                <option value="custom">自定义 ⏰</option>
                <option value="birthday">生日 🎂</option>
                <option value="exam">考试 📚</option>
                <option value="anniversary">纪念日 💕</option>
                <option value="travel">旅行 ✈️</option>
              </select>
            </div>
            <Input
              label="背景图片 URL（可选）"
              placeholder="https://..."
              value={bgImage}
              onValueChange={setBgImage}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm">正数模式（纪念日）</span>
              <Switch
                isSelected={countUpMode}
                onValueChange={setCountUpMode}
              />
            </div>
            <div>
              <label className="text-sm mb-2 block">重复</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as any)}
              >
                <option value="none">不重复</option>
                <option value="yearly">每年</option>
                <option value="monthly">每月</option>
                <option value="weekly">每周</option>
              </select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button color="primary" onPress={handleAddCountdown}>
              添加
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 已归档倒计时 Modal */}
      <ArchivedCountdownsModal
        isOpen={isArchivedModalOpen}
        onClose={() => setIsArchivedModalOpen(false)}
        archivedCountdowns={archivedCountdowns}
        onUnarchive={unarchiveCountdown}
        onDelete={deleteCountdown}
      />
    </div>
  );
}
