import { useState, useMemo } from 'react';
import { Card, CardBody, Progress, Button, ButtonGroup, Chip } from '@nextui-org/react';
import { Calendar, Heart, TrendingUp } from 'lucide-react';
import { differenceInYears, startOfYear, endOfYear, differenceInDays } from 'date-fns';
import useAppStore from '../store/useAppStore';

type ProgressMode = 'year' | 'life';

const MOTIVATIONAL_QUOTES = [
  "时间不等人。",
  "把每一天都当作最后一天来活。",
  "时光飞逝，珍惜当下。",
  "不要浪费你的时间。",
  "每一秒都是独一无二的。",
  "时间是最宝贵的资源。",
  "活在当下，创造未来。",
  "时间是公平的，但不会重来。",
];

export default function TimeProgressWidget() {
  const { settings, updateSettings } = useAppStore();
  const [mode, setMode] = useState<ProgressMode>('year');
  const [quote] = useState(() => 
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  );

  // 计算年度进度
  const yearProgress = useMemo(() => {
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    const totalDays = differenceInDays(yearEnd, yearStart) + 1;
    const passedDays = differenceInDays(now, yearStart) + 1;
    const percentage = Math.round((passedDays / totalDays) * 100);
    
    return {
      percentage,
      year: now.getFullYear(),
      passedDays,
      totalDays,
    };
  }, []);

  // 计算生命进度
  const lifeProgress = useMemo(() => {
    if (!settings.birthDate) {
      return null;
    }

    const now = new Date();
    const birth = new Date(settings.birthDate);
    const age = differenceInYears(now, birth);
    const assumedLifespan = 80;
    const percentage = Math.min(Math.round((age / assumedLifespan) * 100), 100);
    
    return {
      percentage,
      age,
      assumedLifespan,
    };
  }, [settings.birthDate]);

  // 根据百分比选择颜色
  const getProgressColor = (percentage: number): "success" | "warning" | "danger" | "secondary" => {
    if (percentage < 30) return 'success';
    if (percentage < 70) return 'warning';
    if (percentage < 90) return 'danger';
    return 'secondary';
  };

  const currentProgress = mode === 'year' ? yearProgress.percentage : (lifeProgress?.percentage || 0);
  const progressColor = getProgressColor(currentProgress);

  return (
    <Card className="glass-card mb-6">
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">时间进度</h3>
          </div>
          
          <ButtonGroup size="sm" variant="flat">
            <Button
              onPress={() => setMode('year')}
              color={mode === 'year' ? 'primary' : 'default'}
              startContent={<Calendar size={16} />}
            >
              年度
            </Button>
            <Button
              onPress={() => setMode('life')}
              color={mode === 'life' ? 'primary' : 'default'}
              startContent={<Heart size={16} />}
              isDisabled={!settings.birthDate}
            >
              生命
            </Button>
          </ButtonGroup>
        </div>

        {/* 进度条 */}
        <div className="mb-4">
          {mode === 'year' ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {yearProgress.year} 年已过
                </span>
                <Chip size="sm" color={progressColor} variant="flat">
                  {yearProgress.percentage}%
                </Chip>
              </div>
              <Progress
                value={yearProgress.percentage}
                color={progressColor}
                size="lg"
                className="mb-2"
                classNames={{
                  indicator: "bg-gradient-to-r from-primary to-secondary",
                }}
              />
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {yearProgress.passedDays} / {yearProgress.totalDays} 天
              </p>
            </>
          ) : lifeProgress ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  生命进度（假设 {lifeProgress.assumedLifespan} 岁）
                </span>
                <Chip size="sm" color={progressColor} variant="flat">
                  {lifeProgress.percentage}%
                </Chip>
              </div>
              <Progress
                value={lifeProgress.percentage}
                color={progressColor}
                size="lg"
                className="mb-2"
                classNames={{
                  indicator: progressColor === 'secondary' 
                    ? "bg-gradient-to-r from-purple-500 to-gray-900"
                    : undefined,
                }}
              />
              <p className="text-xs text-gray-500 dark:text-gray-500">
                当前年龄：{lifeProgress.age} 岁
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-2">
                设置您的生日以查看生命进度
              </p>
              <Button
                size="sm"
                color="primary"
                variant="flat"
                onPress={() => {
                  const birthDate = prompt('请输入您的生日（格式：YYYY-MM-DD）：');
                  if (birthDate) {
                    updateSettings({ birthDate });
                  }
                }}
              >
                设置生日
              </Button>
            </div>
          )}
        </div>

        {/* 励志语录 */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm italic text-center text-gray-600 dark:text-gray-400">
            "{quote}"
          </p>
        </div>

        {/* 操作提示 */}
        {mode === 'life' && lifeProgress && (
          <div className="mt-3 text-center">
            <Button
              size="sm"
              variant="light"
              onPress={() => {
                const birthDate = prompt('更新生日（格式：YYYY-MM-DD）：', settings.birthDate);
                if (birthDate) {
                  updateSettings({ birthDate });
                }
              }}
            >
              更新生日
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
