import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Spinner } from '@nextui-org/react';
import { BookOpen, RefreshCw, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface HistoricalEvent {
  year: number;
  text: string;
  pages?: Array<{
    title: string;
    extract: string;
    content_urls?: {
      desktop?: {
        page: string;
      };
    };
  }>;
}

// 本地备用数据（API 失败时使用）
const FALLBACK_EVENTS: Record<string, HistoricalEvent[]> = {
  '01-23': [
    {
      year: 1909,
      text: 'RMS Republic号客轮在马萨诸塞州南塔基特岛外海与另一艘船相撞沉没，成为首个使用摩尔斯电码SOS求救信号的事件。',
    },
    {
      year: 1997,
      text: '麦德琳·奥尔布赖特成为美国历史上首位女性国务卿。',
    },
  ],
};

export default function HistoryTodayCard() {
  const [event, setEvent] = useState<HistoricalEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchHistoryEvent = async () => {
    setLoading(true);
    setError(false);

    try {
      const now = new Date();
      const month = format(now, 'MM');
      const day = format(now, 'dd');

      // 调用 Wikimedia API（英文版）
      const response = await fetch(
        `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/selected/${month}/${day}`,
        {
          headers: {
            'Api-User-Agent': 'TimePlannerApp/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      if (data.selected && data.selected.length > 0) {
        // 随机选择一个事件
        const randomEvent = data.selected[Math.floor(Math.random() * data.selected.length)];
        setEvent(randomEvent);
      } else {
        throw new Error('No events found');
      }
    } catch (err) {
      console.error('Failed to fetch history event:', err);
      setError(true);
      
      // 使用本地备用数据
      const now = new Date();
      const key = format(now, 'MM-dd');
      const fallbackEvents = FALLBACK_EVENTS[key] || FALLBACK_EVENTS['01-23'];
      const randomEvent = fallbackEvents[Math.floor(Math.random() * fallbackEvents.length)];
      setEvent(randomEvent);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryEvent();
  }, []);

  if (loading) {
    return (
      <Card className="glass-card mb-6">
        <CardBody className="p-6 flex items-center justify-center min-h-[180px]">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-sm text-gray-500">加载历史事件...</p>
        </CardBody>
      </Card>
    );
  }

  if (!event) {
    return null;
  }

  const eventPage = event.pages?.[0];
  const eventLink = eventPage?.content_urls?.desktop?.page;

  return (
    <Card className="glass-card mb-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
      <CardBody className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-amber-600 dark:text-amber-400" size={24} />
            <h3 className="text-lg font-semibold">历史上的今天</h3>
          </div>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={fetchHistoryEvent}
            title="换一个事件"
          >
            <RefreshCw size={16} />
          </Button>
        </div>

        {/* 年份标签 */}
        <div className="mb-3">
          <span className="inline-block px-3 py-1 text-xs font-bold bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 rounded-full">
            {event.year} 年
          </span>
        </div>

        {/* 事件描述 */}
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          {event.text || eventPage?.extract}
        </p>

        {/* 详情链接 */}
        {eventLink && (
          <div className="flex items-center justify-between pt-3 border-t border-amber-200 dark:border-amber-800">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              来源：维基百科
            </span>
            <Button
              size="sm"
              variant="light"
              color="warning"
              endContent={<ExternalLink size={14} />}
              as="a"
              href={eventLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              了解更多
            </Button>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            * 使用本地数据（网络请求失败）
          </p>
        )}
      </CardBody>
    </Card>
  );
}
