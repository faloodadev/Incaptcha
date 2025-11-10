import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className="relative overflow-hidden"
      data-testid="button-theme-toggle"
      aria-label={`Switch to ${theme === 'macos' ? 'Discord' : 'macOS'} theme`}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: theme === 'discord' ? 180 : 0,
          scale: theme === 'discord' ? 1 : 0.8
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {theme === 'macos' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </motion.div>
    </Button>
  );
}
