import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, Input, Select, SelectItem, Button, Chip } from '@nextui-org/react';
import { Search, X, Calendar, Flag, Tag as TagIcon, CheckCircle, Clock } from 'lucide-react';

export interface TodoFilterOptions {
  searchQuery: string;
  priority: 'all' | 'low' | 'medium' | 'high';
  status: 'all' | 'active' | 'completed';
  dateRange: 'all' | 'today' | 'week' | 'overdue';
  type: 'all' | 'task' | 'habit';
}

interface AdvancedTodoSearchProps {
  filters: TodoFilterOptions;
  onFiltersChange: (filters: TodoFilterOptions) => void;
  onQuickFilter: (type: 'today' | 'week' | 'high') => void;
}

export default function AdvancedTodoSearch({ 
  filters, 
  onFiltersChange,
  onQuickFilter,
}: AdvancedTodoSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchQuery: value });
  };

  const handleFilterChange = (key: keyof TodoFilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = 
    filters.priority !== 'all' || 
    filters.status !== 'all' || 
    filters.dateRange !== 'all' ||
    filters.type !== 'all' ||
    filters.searchQuery !== '';

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      priority: 'all',
      status: 'all',
      dateRange: 'all',
      type: 'all',
    });
  };

  return (
    <div className="mb-4 space-y-3">
      {/* 搜索栏 */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="搜索任务、子任务、历史记录..."
          value={filters.searchQuery}
          onValueChange={handleSearchChange}
          startContent={<Search size={18} />}
          endContent={
            filters.searchQuery && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => handleSearchChange('')}
              >
                <X size={16} />
              </Button>
            )
          }
          classNames={{
            input: 'text-sm',
          }}
        />
        <Button
          variant={isExpanded ? 'solid' : 'flat'}
          color={hasActiveFilters ? 'primary' : 'default'}
          onPress={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0"
        >
          {isExpanded ? '收起筛选' : '高级筛选'}
          {hasActiveFilters && !isExpanded && (
            <Chip size="sm" color="primary" className="ml-2">
              {Object.values(filters).filter((v) => v !== 'all' && v !== '').length}
            </Chip>
          )}
        </Button>
      </div>

      {/* 快速筛选按钮 */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="flat"
          startContent={<Calendar size={14} />}
          onPress={() => onQuickFilter('today')}
        >
          今日到期
        </Button>
        <Button
          size="sm"
          variant="flat"
          startContent={<Clock size={14} />}
          onPress={() => onQuickFilter('week')}
        >
          本周到期
        </Button>
        <Button
          size="sm"
          variant="flat"
          color="danger"
          startContent={<Flag size={14} />}
          onPress={() => onQuickFilter('high')}
        >
          高优先级
        </Button>
        {hasActiveFilters && (
          <Button
            size="sm"
            variant="light"
            startContent={<X size={14} />}
            onPress={clearFilters}
          >
            清除筛选
          </Button>
        )}
      </div>

      {/* 高级筛选面板 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card>
              <CardBody>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 优先级筛选 */}
                  <Select
                    label="优先级"
                    selectedKeys={[filters.priority]}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    startContent={<Flag size={16} />}
                    size="sm"
                  >
                    <SelectItem key="all" value="all">全部</SelectItem>
                    <SelectItem key="low" value="low">低优先级</SelectItem>
                    <SelectItem key="medium" value="medium">中优先级</SelectItem>
                    <SelectItem key="high" value="high">高优先级</SelectItem>
                  </Select>

                  {/* 状态筛选 */}
                  <Select
                    label="状态"
                    selectedKeys={[filters.status]}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    startContent={<CheckCircle size={16} />}
                    size="sm"
                  >
                    <SelectItem key="all" value="all">全部</SelectItem>
                    <SelectItem key="active" value="active">进行中</SelectItem>
                    <SelectItem key="completed" value="completed">已完成</SelectItem>
                  </Select>

                  {/* 日期范围筛选 */}
                  <Select
                    label="日期"
                    selectedKeys={[filters.dateRange]}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    startContent={<Calendar size={16} />}
                    size="sm"
                  >
                    <SelectItem key="all" value="all">全部</SelectItem>
                    <SelectItem key="today" value="today">今天</SelectItem>
                    <SelectItem key="week" value="week">本周</SelectItem>
                    <SelectItem key="overdue" value="overdue">已逾期</SelectItem>
                  </Select>

                  {/* 类型筛选 */}
                  <Select
                    label="类型"
                    selectedKeys={[filters.type]}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    startContent={<TagIcon size={16} />}
                    size="sm"
                  >
                    <SelectItem key="all" value="all">全部</SelectItem>
                    <SelectItem key="task" value="task">任务</SelectItem>
                    <SelectItem key="habit" value="habit">习惯</SelectItem>
                  </Select>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
