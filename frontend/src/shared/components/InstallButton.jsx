import { usePWAInstall } from '../hooks/usePWAInstall';
import Button from './Button';

export function InstallButton() {
  const { isInstallable, install } = usePWAInstall();

  console.log(isInstallable);

  if (!isInstallable) return null;

  return <Button onClick={install}>Install App</Button>;
}
