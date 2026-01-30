import { useState } from 'react';
import { Card, CardBody, CardHeader, Input, Button, Tabs, Tab } from '@nextui-org/react';
import { motion } from 'framer-motion';
import useAppStore from '../store/useAppStore';

export default function AuthPage() {
  const { registerUser, loginUser } = useAppStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!username.trim() || !password.trim()) {
      setMessage('请输入账号和密码');
      return;
    }

    if (mode === 'register') {
      const res = registerUser(username.trim(), password.trim());
      if (!res.success) {
        setMessage(res.message || '注册失败');
      } else {
        setMessage('注册成功，已自动登录');
      }
    } else {
      const res = loginUser(username.trim(), password.trim());
      if (!res.success) {
        setMessage(res.message || '登录失败');
      } else {
        setMessage(null);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card shadow="lg">
          <CardHeader className="flex flex-col items-start gap-2">
            <h2 className="text-2xl font-bold">欢迎使用</h2>
            <p className="text-sm text-stone-500">请先登录或注册以使用您的数据</p>
          </CardHeader>
          <CardBody className="space-y-4">
            <Tabs
              selectedKey={mode}
              onSelectionChange={(key) => setMode(key as 'login' | 'register')}
              color="primary"
              variant="underlined"
            >
              <Tab key="login" title="登录" />
              <Tab key="register" title="注册" />
            </Tabs>

            <Input
              label="账号"
              placeholder="请输入账号"
              value={username}
              onValueChange={setUsername}
            />
            <Input
              label="密码"
              placeholder="请输入密码"
              type="password"
              value={password}
              onValueChange={setPassword}
            />

            {message && <p className="text-sm text-red-500">{message}</p>}

            <Button color="primary" onPress={handleSubmit} className="w-full">
              {mode === 'register' ? '注册并登录' : '登录'}
            </Button>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
