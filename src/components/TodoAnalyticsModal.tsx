import { motion } from 'framer-motion';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';
import { BarChart3 } from 'lucide-react';
import TodoAnalytics from './TodoAnalytics';
import { Todo } from '../types';

interface TodoAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  todos: Todo[];
  partition: string;
}

export default function TodoAnalyticsModal({
  isOpen,
  onClose,
  todos,
  partition,
}: TodoAnalyticsModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <BarChart3 size={20} />
          数据分析
        </ModalHeader>
        <ModalBody className="py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <TodoAnalytics todos={todos} partition={partition} />
          </motion.div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
