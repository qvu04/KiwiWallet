import { motion } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext.jsx';

// Nut chuyen dark/light voi animation truot qua lai
export default function DarkModeSwitch() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={dark ? 'Chuyển sáng' : 'Chuyển tối'}
      className={`relative flex h-8 w-16 items-center rounded-full px-1 transition-colors ${
        dark ? 'bg-slate-700 justify-end' : 'bg-amber-300 justify-start'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm shadow"
      >
        {dark ? <FaMoon className="text-slate-700" /> : <FaSun className="text-amber-500" />}
      </motion.span>
    </button>
  );
}
