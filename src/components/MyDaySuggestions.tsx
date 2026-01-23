import { useMemo } from 'react';
import { Card, CardBody, CardHeader, Button, Chip } from '@nextui-org/react';
import { Lightbulb, Plus } from 'lucide-react';
import { Todo } from '../types';
import useAppStore from '../store/useAppStore';
import { isToday, isPast, parseISO } from 'date-fns';

export default function MyDaySuggestions() {
  const { todos, toggleMyDay } = useAppStore();

  // 生成建议任务
  const suggestions = useMemo(() => {
    const today = new Date();
    
    return todos
      .filter((todo) => {
        // 排除已完成和已在"我的一天"中的任务
        if (todo.completed || todo.isMyDay) return false;

        // 高优先级任务
        if (todo.priority === 'high') return true;

        // 重要且紧急（艾森豪威尔矩阵 Q1）
        if (todo.isImportant && todo.isUrgent) return true;

        // 习惯（每日重复任务）
        if (todo.type === 'habit') return true;

        // 逾期任务（如果有 dueDate 字段）
        // TODO: 添加 dueDate 字段后启用
        // if (todo.dueDate && isPast(parseISO(todo.dueDate))) return true;

        return false;
      })
      .slice(0, 5); // 最多显示 5 个建议
  }, [todos]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <CardHeader className="flex items-center gap-2">
        <Lightbulb size={20} className="text-amber-600" />
        <h3 className="text-lg font-semibold">智能建议</h3>
        <Chip size="sm" variant="flat" color="warning">
          {suggestions.length}
        </Chip>
      </CardHeader>
      <CardBody className="space-y-2">
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
          以下任务可能需要你今天关注：
        </p>
        {suggestions.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-stone-900 shadow-sm"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{todo.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                  {todo.partition}
                </span>
                {todo.priority === 'high' && (
                  <Chip size="sm" color="danger" variant="flat">
                    高优先级
                  </Chip>
                )}
                {todo.type === 'habit' && (
                  <Chip size="sm" color="warning" variant="flat">
                    习惯
                  </Chip>
                )}
                {todo.isImportant && todo.isUrgent && (
                  <Chip size="sm" color="danger" variant="flat">
                    重要且紧急
                  </Chip>
                )}
              </div>
            </div>
            <Button
              size="sm"
              color="warning"
              variant="flat"
              startContent={<Plus size={16} />}
              onPress={() => toggleMyDay(todo.id)}
            >
              添加到今天
            </Button>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
