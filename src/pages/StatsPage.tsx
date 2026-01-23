import { useMemo } from 'react';
import { Card, CardBody, CardHeader, Divider } from '@nextui-org/react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import ActivityCalendar from 'react-activity-calendar';
import {
  TrendingUp,
  Clock,
  Target,
  Flame,
  Calendar,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import {
  calculateOverallStats,
  calculateTaskStats,
  getTrendData,
  calculateHourlyProductivity,
  generateHeatmapData,
  formatDuration,
  secondsToHours,
  calculateWeeklyStats,
} from '../utils/statistics';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function StatsPage() {
  const { focusSessions, settings } = useAppStore();
  const isDark = settings.theme === 'dark';

  // 计算各类统计数据
  const overallStats = useMemo(() => calculateOverallStats(focusSessions), [focusSessions]);
  const taskStats = useMemo(() => calculateTaskStats(focusSessions), [focusSessions]);
  const trendData = useMemo(() => getTrendData(focusSessions, 30), [focusSessions]);
  const hourlyData = useMemo(() => calculateHourlyProductivity(focusSessions), [focusSessions]);
  const weeklyStats = useMemo(() => calculateWeeklyStats(focusSessions), [focusSessions]);
  const heatmapData = useMemo(() => {
    const data = generateHeatmapData(focusSessions, 365);
    // 转换为 react-activity-calendar 所需格式
    return data.map(d => ({
      date: d.date,
      count: d.count,
      level: d.level,
    }));
  }, [focusSessions]);

  // 准备饼图数据（取前 6 个任务）
  const pieData = useMemo(() => {
    return taskStats.slice(0, 6).map((task) => ({
      name: task.taskTitle,
      value: secondsToHours(task.totalDuration),
    }));
  }, [taskStats]);

  // 准备周统计数据
  const weeklyChartData = useMemo(() => {
    return weeklyStats.days.map((day) => ({
      day: new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short' }),
      时长: secondsToHours(day.totalDuration),
      番茄钟: day.pomodoroCount,
      正计时: day.stopwatchCount,
    }));
  }, [weeklyStats]);

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">专注统计与分析</h1>
      </div>

      {/* 数据为空提示 */}
      {focusSessions.length === 0 && (
        <Card>
          <CardBody>
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">暂无专注数据</p>
              <p className="text-sm mt-2">开始你的第一个专注会话吧！</p>
            </div>
          </CardBody>
        </Card>
      )}

      {focusSessions.length > 0 && (
        <>
          {/* 总体统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 总时长 */}
            <Card>
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总专注时长</p>
                  <p className="text-2xl font-bold">{formatDuration(overallStats.totalDuration)}</p>
                </div>
              </CardBody>
            </Card>

            {/* 总会话数 */}
            <Card>
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总会话数</p>
                  <p className="text-2xl font-bold">{overallStats.totalSessions}</p>
                </div>
              </CardBody>
            </Card>

            {/* 当前连续天数 */}
            <Card>
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <Flame className="w-6 h-6 text-orange-600 dark:text-orange-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">当前连续</p>
                  <p className="text-2xl font-bold">{overallStats.currentStreak} 天</p>
                </div>
              </CardBody>
            </Card>

            {/* 最长连续天数 */}
            <Card>
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Award className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">最长连续</p>
                  <p className="text-2xl font-bold">{overallStats.longestStreak} 天</p>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 更多统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400">平均会话时长</p>
                <p className="text-xl font-bold mt-1">{formatDuration(overallStats.averageDuration)}</p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400">最喜欢的任务</p>
                <p className="text-xl font-bold mt-1">{overallStats.favoriteTask}</p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400">最高效时段</p>
                <p className="text-xl font-bold mt-1">{overallStats.mostProductiveHour}:00</p>
              </CardBody>
            </Card>
          </div>

          {/* 30天趋势图 */}
          <Card>
            <CardHeader className="flex gap-3">
              <TrendingUp className="w-5 h-5" />
              <div className="flex flex-col">
                <p className="text-md font-semibold">近 30 天趋势</p>
                <p className="text-small text-default-500">专注时长与会话数变化</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#fff',
                      border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="duration"
                    stroke="#0088FE"
                    strokeWidth={2}
                    name="时长(小时)"
                    dot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="sessions"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="会话数"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* 本周统计 */}
          <Card>
            <CardHeader className="flex gap-3">
              <Calendar className="w-5 h-5" />
              <div className="flex flex-col">
                <p className="text-md font-semibold">本周统计</p>
                <p className="text-small text-default-500">
                  本周总计：{formatDuration(weeklyStats.totalDuration)}
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#fff',
                      border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="时长" fill="#0088FE" name="时长(小时)" />
                  <Bar dataKey="番茄钟" fill="#00C49F" name="番茄钟" />
                  <Bar dataKey="正计时" fill="#FFBB28" name="正计时" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* 任务分布和每小时生产力 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 任务分布饼图 */}
            <Card>
              <CardHeader className="flex gap-3">
                <PieChartIcon className="w-5 h-5" />
                <div className="flex flex-col">
                  <p className="text-md font-semibold">任务时间分布</p>
                  <p className="text-small text-default-500">各任务占比（前6项）</p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}h`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#1f2937' : '#fff',
                          border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-gray-500">暂无任务数据</div>
                )}
              </CardBody>
            </Card>

            {/* 每小时生产力 */}
            <Card>
              <CardHeader className="flex gap-3">
                <Clock className="w-5 h-5" />
                <div className="flex flex-col">
                  <p className="text-md font-semibold">每小时生产力</p>
                  <p className="text-small text-default-500">24小时专注分布</p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1f2937' : '#fff',
                        border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                      }}
                      formatter={(value) => `${secondsToHours(Number(value || 0)).toFixed(2)}h`}
                    />
                    <Bar dataKey="duration" fill="#8884d8" name="时长(秒)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          {/* 任务详细列表 */}
          <Card>
            <CardHeader className="flex gap-3">
              <Target className="w-5 h-5" />
              <div className="flex flex-col">
                <p className="text-md font-semibold">任务详细统计</p>
                <p className="text-small text-default-500">所有任务的时间分配</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="space-y-3">
                {taskStats.map((task, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{task.taskTitle}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDuration(task.totalDuration)} ({task.sessionCount} 次)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${task.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {task.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* GitHub 风格热力图 */}
          <Card>
            <CardHeader className="flex gap-3">
              <Calendar className="w-5 h-5" />
              <div className="flex flex-col">
                <p className="text-md font-semibold">年度活动热力图</p>
                <p className="text-small text-default-500">过去一年的专注习惯</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="overflow-x-auto">
                <ActivityCalendar
                  data={heatmapData}
                  theme={{
                    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                  }}
                  colorScheme={isDark ? 'dark' : 'light'}
                  blockSize={12}
                  blockMargin={4}
                  fontSize={14}
                  labels={{
                    totalCount: '{{count}} 次会话在过去一年',
                  }}
                />
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}

export default StatsPage;
