import { useMemo } from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Todo } from '../types';

interface TodoAnalyticsProps {
  todos: Todo[];
  partition: string;
}

export default function TodoAnalytics({ todos, partition }: TodoAnalyticsProps) {
  // 过滤当前分区的任务
  const partitionTodos = todos.filter((t) => t.partition === partition);

  // 计算近7天完成率
  const last7DaysData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
      
      // 统计当天完成的任务
      let completed = 0;
      let total = 0;

      partitionTodos.forEach((todo) => {
        const historyEntry = todo.history.find((h) => h.date === dateStr);
        if (historyEntry) {
          total++;
          if (historyEntry.completed) {
            completed++;
          }
        }
      });

      data.push({
        date: format(date, 'MM/dd', { locale: zhCN }),
        rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        completed,
        total,
      });
    }
    return data;
  }, [partitionTodos]);

  // 计算时段热力图（按小时统计）
  const heatmapData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i}:00`,
      count: 0,
    }));

    // 注意：这里简化处理，实际需要记录任务完成的具体时间
    // 目前根据 lastCompletedDate 的小时来统计
    partitionTodos.forEach((todo) => {
      if (todo.lastCompletedDate) {
        const hour = new Date(todo.lastCompletedDate).getHours();
        if (hours[hour]) {
          hours[hour].count++;
        }
      }
    });

    return hours;
  }, [partitionTodos]);

  const maxCount = Math.max(...heatmapData.map((h) => h.count), 1);

  // 计算统计数据
  const stats = useMemo(() => {
    const total = partitionTodos.length;
    const completed = partitionTodos.filter((t) => t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 最活跃时段
    const mostActiveHour = heatmapData.reduce((max, h) => (h.count > max.count ? h : max), heatmapData[0]);

    return {
      total,
      completed,
      completionRate,
      mostActiveHour: mostActiveHour.label,
    };
  }, [partitionTodos, heatmapData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      {/* 完成趋势 */}
      <Card>
        <CardBody>
          <h4 className="text-sm font-semibold text-stone-600 dark:text-stone-300 mb-3">
            近7天完成率
          </h4>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={last7DaysData}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#94a3b8"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#94a3b8"
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1c1917',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: any, name: string | undefined) => {
                  if (name === 'rate') return [`${value}%`, '完成率'];
                  return [value, name || ''];
                }}
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-2 text-xs text-stone-500">
            <span>总完成率: {stats.completionRate}%</span>
            <span>{stats.completed}/{stats.total} 已完成</span>
          </div>
        </CardBody>
      </Card>

      {/* 时段热力图 */}
      <Card>
        <CardBody>
          <h4 className="text-sm font-semibold text-stone-600 dark:text-stone-300 mb-3">
            任务完成热力图
          </h4>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={heatmapData}>
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
                interval={3}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1c1917',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: any) => [`${value} 个任务`, '完成数']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {heatmapData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={`rgba(59, 130, 246, ${0.2 + (entry.count / maxCount) * 0.8})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-2 text-xs text-stone-500">
            <span>最活跃时段: {stats.mostActiveHour}</span>
            <span>共 {heatmapData.reduce((sum, h) => sum + h.count, 0)} 次完成</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
