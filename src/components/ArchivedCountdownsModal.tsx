import { motion, AnimatePresence } from 'framer-motion';
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Chip } from '@nextui-org/react';
import { Trash2, RotateCcw, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Countdown } from '../types';

interface ArchivedCountdownsModalProps {
  isOpen: boolean;
  onClose: () => void;
  archivedCountdowns: Countdown[];
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const THEME_ICONS: Record<string, string> = {
  birthday: '🎂',
  exam: '📚',
  anniversary: '💕',
  travel: '✈️',
  custom: '⏰',
};

export default function ArchivedCountdownsModal({
  isOpen,
  onClose,
  archivedCountdowns,
  onUnarchive,
  onDelete,
}: ArchivedCountdownsModalProps) {
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
          已归档的倒计时
          <Chip size="sm" variant="flat">{archivedCountdowns.length}</Chip>
        </ModalHeader>
        <ModalBody className="py-6">
          {archivedCountdowns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-stone-400 dark:text-stone-500">
                还没有归档的倒计时
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {archivedCountdowns.map((countdown) => {
                  const theme = countdown.theme || 'custom';
                  const icon = THEME_ICONS[theme];
                  
                  return (
                    <motion.div
                      key={countdown.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-4 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-3xl">{icon}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-stone-800 dark:text-stone-100 mb-1">
                              {countdown.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                              <span>
                                目标日期: {format(new Date(countdown.targetDate), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                              </span>
                              {countdown.repeat !== 'none' && (
                                <Chip size="sm" variant="flat" color="secondary">
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
                            {countdown.createdAt && (
                              <p className="text-xs text-stone-400 mt-1">
                                创建于 {format(new Date(countdown.createdAt), 'yyyy年MM月dd日', { locale: zhCN })}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            color="success"
                            onPress={() => onUnarchive(countdown.id)}
                            title="取消归档"
                          >
                            <RotateCcw size={16} />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            color="danger"
                            onPress={() => onDelete(countdown.id)}
                            title="删除"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
