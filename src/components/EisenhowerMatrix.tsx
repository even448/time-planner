import { useMemo } from 'react';
import { Card, CardBody, CardHeader, Chip } from '@nextui-org/react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
} from '@dnd-kit/core';
import { AlertCircle, Clock, Trash2, Zap } from 'lucide-react';
import { Todo } from '../types';
import useAppStore from '../store/useAppStore';
import { useState } from 'react';
import TodoItem from './TodoItem';

interface MatrixQuadrant {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: 'danger' | 'primary' | 'warning' | 'default';
  bgClass: string;
  isImportant: boolean;
  isUrgent: boolean;
}

const quadrants: MatrixQuadrant[] = [
  {
    id: 'q1',
    title: '立即执行',
    description: '重要且紧急',
    icon: AlertCircle,
    color: 'danger',
    bgClass: 'bg-red-50 dark:bg-red-950/20',
    isImportant: true,
    isUrgent: true,
  },
  {
    id: 'q2',
    title: '计划安排',
    description: '重要但不紧急',
    icon: Clock,
    color: 'primary',
    bgClass: 'bg-blue-50 dark:bg-blue-950/20',
    isImportant: true,
    isUrgent: false,
  },
  {
    id: 'q3',
    title: '委托他人',
    description: '紧急但不重要',
    icon: Zap,
    color: 'warning',
    bgClass: 'bg-orange-50 dark:bg-orange-950/20',
    isImportant: false,
    isUrgent: true,
  },
  {
    id: 'q4',
    title: '稍后处理',
    description: '不重要不紧急',
    icon: Trash2,
    color: 'default',
    bgClass: 'bg-stone-50 dark:bg-stone-950/20',
    isImportant: false,
    isUrgent: false,
  },
];

interface EisenhowerMatrixProps {
  partition: string;
}

export default function EisenhowerMatrix({ partition }: EisenhowerMatrixProps) {
  const { todos, updateTodoMatrix } = useAppStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filter todos by partition
  const partitionTodos = useMemo(
    () => todos.filter((t) => t.partition === partition),
    [todos, partition]
  );

  // Group todos by quadrant
  const quadrantTodos = useMemo(() => {
    const groups: Record<string, Todo[]> = {
      q1: [],
      q2: [],
      q3: [],
      q4: [],
    };

    partitionTodos.forEach((todo) => {
      if (todo.isImportant && todo.isUrgent) {
        groups.q1.push(todo);
      } else if (todo.isImportant && !todo.isUrgent) {
        groups.q2.push(todo);
      } else if (!todo.isImportant && todo.isUrgent) {
        groups.q3.push(todo);
      } else {
        groups.q4.push(todo);
      }
    });

    return groups;
  }, [partitionTodos]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const todoId = active.id as string;
    const targetQuadrantId = over.id as string;

    const targetQuadrant = quadrants.find((q) => q.id === targetQuadrantId);
    if (!targetQuadrant) return;

    // Update todo's importance and urgency based on target quadrant
    updateTodoMatrix(todoId, targetQuadrant.isImportant, targetQuadrant.isUrgent);
  };

  const activeTodo = useMemo(
    () => todos.find((t) => t.id === activeId),
    [todos, activeId]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((quadrant) => {
          const Icon = quadrant.icon;
          const todosInQuadrant = quadrantTodos[quadrant.id] || [];

          return (
            <Card
              key={quadrant.id}
              className={`min-h-[300px] ${quadrant.bgClass}`}
              shadow="sm"
            >
              <CardHeader className="flex flex-col items-start gap-2 pb-2">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Icon size={20} />
                    <h3 className="text-lg font-semibold">{quadrant.title}</h3>
                  </div>
                  <Chip size="sm" color={quadrant.color} variant="flat">
                    {todosInQuadrant.length}
                  </Chip>
                </div>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {quadrant.description}
                </p>
              </CardHeader>

              <CardBody
                className="space-y-2 overflow-y-auto"
                data-droppable-id={quadrant.id}
                id={quadrant.id}
              >
                {todosInQuadrant.length === 0 ? (
                  <div className="text-center py-8 text-stone-400 dark:text-stone-500 text-sm">
                    拖放任务到此处
                  </div>
                ) : (
                  todosInQuadrant.map((todo) => (
                    <div
                      key={todo.id}
                      id={todo.id}
                      className="cursor-move"
                      draggable
                    >
                      <TodoItem todo={todo} showPartition={false} />
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      <DragOverlay>
        {activeTodo && (
          <div className="opacity-80">
            <TodoItem todo={activeTodo} showPartition={false} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
