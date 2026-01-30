import { Card, CardBody, Button } from '@nextui-org/react';
import useAppStore from '../store/useAppStore';

export default function SettingsPage() {
  const { logoutUser } = useAppStore();

  return (
    <div className="pb-6">
      <h2 className="text-2xl font-bold mb-6">设置</h2>
      
      <Card className="glass-card">
        <CardBody className="flex flex-col items-center gap-4 py-10">
          <p className="text-stone-500 dark:text-stone-400">管理账户和偏好设置</p>
          <Button color="danger" variant="solid" onPress={logoutUser}>
            退出登录
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
