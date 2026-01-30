import { useMemo } from 'react';
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

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#fb7185', '#a78bfa', '#82ca9d'];

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
    return data.map(d => ({
      date: d.date,
      count: d.count,
      level: d.level,
    }));
  }, [focusSessions]);

  const pieData = useMemo(() => {
    return taskStats.slice(0, 6).map((task) => ({
      name: task.taskTitle,
      value: secondsToHours(task.totalDuration),
    }));
  }, [taskStats]);

  const weeklyChartData = useMemo(() => {
    return weeklyStats.days.map((day) => ({
      day: new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short' }),
      时长: secondsToHours(day.totalDuration),
      番茄钟: day.pomodoroCount,
      正计时: day.stopwatchCount,
    }));
  }, [weeklyStats]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary text-white p-3 rounded-2xl shadow-lg">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold">专注统计 · 彩虹面板</h1>
          <p className="text-sm text-stone-500">圆润 / 卡通 / 轻量阴影</p>
        </div>
      </div>

      {focusSessions.length === 0 && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700">
          <div className="p-6 flex flex-col items-center text-center">
            <Clock className="w-14 h-14 text-primary/70" />
            <h3 className="text-xl font-bold mt-2">暂无专注数据</h3>
            <p className="text-sm text-stone-500">开始你的第一个专注会话吧！</p>
          </div>
        </div>
      )}

      {focusSessions.length > 0 && (
        <>
          {/* 顶部彩带统计 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[{
              label: '总专注时长',
              value: formatDuration(overallStats.totalDuration),
              icon: Clock,
              theme: 'from-sky-400 to-blue-500',
            }, {
              label: '总会话数',
              value: overallStats.totalSessions,
              icon: Target,
              theme: 'from-emerald-400 to-green-500',
            }, {
              label: '当前连续',
              value: `${overallStats.currentStreak} 天`,
              icon: Flame,
              theme: 'from-amber-300 to-orange-400',
            }, {
              label: '最长连续',
              value: `${overallStats.longestStreak} 天`,
              icon: Award,
              theme: 'from-purple-400 to-fuchsia-500',
            }].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700">
                  <div className="p-6 flex flex-row items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${item.theme} text-white shadow`}> 
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs uppercase text-stone-500">{item.label}</p>
                      <p className="text-2xl font-extrabold text-stone-800 dark:text-stone-100">{item.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 信息豆腐块 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[{
              label: '平均会话时长', value: formatDuration(overallStats.averageDuration),
            }, {
              label: '最喜欢的任务', value: overallStats.favoriteTask || '—',
            }, {
              label: '最高效时段', value: `${overallStats.mostProductiveHour}:00`,
            }].map((item) => (
              <div key={item.label} className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700">
                <div className="p-6 flex flex-col">
                  <p className="text-sm text-stone-500">{item.label}</p>
                  <p className="text-xl font-bold text-stone-800 dark:text-stone-100">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 趋势 & 周报 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700">
              <div className="p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">近 30 天趋势</p>
                    <p className="text-xs text-stone-500">时长与会话数</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip wrapperClassName="glass" />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="duration" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} name="时长(小时)" />
                    <Line yAxisId="right" type="monotone" dataKey="sessions" stroke="#22c55e" strokeWidth={3} dot={{ r: 3 }} name="会话数" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700">
              <div className="p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">本周统计</p>
                    <p className="text-xs text-stone-500">本周总计：{formatDuration(weeklyStats.totalDuration)}</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip wrapperClassName="glass" />
                    <Legend />
                    <Bar dataKey="时长" fill="#38bdf8" name="时长(小时)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="番茄钟" fill="#34d399" name="番茄钟" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="正计时" fill="#fbbf24" name="正计时" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 任务分布 & 每小时生产力 */ }
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700">
              <div className="p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <PieChartIcon className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">任务时间分布</p>
                    <p className="text-xs text-stone-500">前 6 项占比</p>
                  </div>
                </div>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}h`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip wrapperClassName="glass" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-10 text-stone-500">暂无任务数据</div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700">
              <div className="p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">每小时生产力</p>
                    <p className="text-xs text-stone-500">24h 分布</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip wrapperClassName="glass" formatter={(value) => `${secondsToHours(Number(value || 0)).toFixed(2)}h`} />
                    <Bar dataKey="duration" fill="#a78bfa" name="时长(秒)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 任务详细列表 */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700">
            <div className="p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5" />
                <div>
                  <p className="font-semibold">任务详细统计</p>
                  <p className="text-xs text-stone-500">所有任务时间分配</p>
                </div>
              </div>
              <div className="space-y-3">
                {taskStats.map((task, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{task.taskTitle}</span>
                        <span className="text-sm text-stone-500">
                          {formatDuration(task.totalDuration)} ({task.sessionCount} 次)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-zinc-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-sky-400 via-fuchsia-400 to-amber-300 h-2 rounded-full transition-all"
                          style={{ width: `${task.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-stone-500">{task.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GitHub 风格热力图 */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700">
            <div className="p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="font-semibold">年度活动热力图</p>
                  <p className="text-xs text-stone-500">过去一年的专注习惯</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <ActivityCalendar
                  data={heatmapData}
                  theme={{
                    light: ['#f4f4f5', '#c4f1be', '#7cd67f', '#4cbf5f', '#2b8a3e'],
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
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StatsPage;
