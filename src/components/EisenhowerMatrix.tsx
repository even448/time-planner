import { useMemo, useState } from 'react';
import { Card, CardBody, CardHeader, Chip } from '@nextui-org/react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { AlertCircle, Clock, Trash2, Zap } from 'lucide-react';
import { Todo } from '../types';
import useAppStore from '../store/useAppStore';
import TodoItem from './TodoItem';

// 可拖拽的任务项组件
function DraggableTodoItem({ todo, onComplete, isCompleting }: { todo: Todo; onComplete?: (todoId: string) => void; isCompleting?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: todo.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        pointerEvents: isCompleting ? 'none' : 'auto',
        transition: 'opacity 0.4s ease',
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TodoItem todo={todo} showPartition={false} onComplete={onComplete} isCompleting={isCompleting} />
    </div>
  );
}

// 可放置的象限组件
function DroppableQuadrant({
  quadrant,
  todos,
  children,
}: {
  quadrant: MatrixQuadrant;
  todos: Todo[];
  children?: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: quadrant.id,
  });

  const Icon = quadrant.icon;

  return (
    <Card
      ref={setNodeRef}
      className={`min-h-[300px] ${quadrant.bgClass} ${
        isOver ? 'ring-2 ring-primary' : ''
      } transition-all flex flex-col`}
      shadow="sm"
    >
      <CardHeader className="flex flex-col items-start gap-2 pb-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Icon size={20} />
            <h3 className="text-lg font-semibold">{quadrant.title}</h3>
          </div>
          <Chip size="sm" color={quadrant.color} variant="flat">
            {todos.length}
          </Chip>
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {quadrant.description}
        </p>
      </CardHeader>

      <CardBody className="space-y-2 overflow-y-auto max-h-[460px]">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-stone-400 dark:text-stone-500 text-sm">
            拖放任务到此处
          </div>
        ) : (
          children
        )}
      </CardBody>
    </Card>
  );
}

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
  completingTodos?: Set<string>;
  onTodoComplete?: (todoId: string) => void;
}

export default function EisenhowerMatrix({ partition, completingTodos = new Set(), onTodoComplete }: EisenhowerMatrixProps) {
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
    () => todos.filter((t) => t.partition === partition && (!t.completed || completingTodos.has(t.id))),
    [todos, partition, completingTodos]
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
          const todosInQuadrant = quadrantTodos[quadrant.id] || [];

          return (
            <DroppableQuadrant
              key={quadrant.id}
              quadrant={quadrant}
              todos={todosInQuadrant}
            >
              {todosInQuadrant.map((todo) => (
                <DraggableTodoItem
                  key={todo.id}
                  todo={todo}
                  isCompleting={completingTodos.has(todo.id)}
                  onComplete={() => onTodoComplete?.(todo.id)}
                />
              ))}
            </DroppableQuadrant>
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
