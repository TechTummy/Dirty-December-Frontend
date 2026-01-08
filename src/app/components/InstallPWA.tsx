import { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from './ui/drawer'; // Adjust path if needed
import { GradientButton } from './GradientButton'; // Adjust path if needed
import { Button } from './ui/button'; // Assuming standard button exists or I'll use a ghostly button

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      console.log('we are being triggered :D');
      setSupportsPWA(true);
      setPromptInstall(e);
      // Open the drawer automatically when the prompt is available
      // You might want to delay this or check if the user has dismissed it recently
      setIsOpen(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setPromptInstall(null);
        setIsOpen(false);
      });
  };

  if (!supportsPWA) {
    return null;
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <div className="flex justify-center mb-4">
               <img src="/pwa-192x192.png" alt="App Icon" className="w-16 h-16 rounded-2xl shadow-lg" />
            </div>
            <DrawerTitle className="text-center text-xl font-bold">Install Dirty December</DrawerTitle>
            <DrawerDescription className="text-center text-gray-500 mt-2">
              Add the app to your home screen for a better experience, offline access, and faster load times.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pb-8">
            <GradientButton onClick={handleInstallClick}>Install App</GradientButton>
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full h-12 rounded-xl text-gray-500">Maybe Later</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
