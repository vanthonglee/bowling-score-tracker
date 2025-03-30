// apps/frontend/src/components/game/RollSelector.tsx
import { Badge } from '@/components/ui/badge';
import { RollSelectorProps } from './types';
import { motion } from 'framer-motion';

const RollSelector: React.FC<RollSelectorProps> = ({ player, rollIndex, value, options, onSelect }) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-muted-foreground">
        Roll {rollIndex + 1}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <motion.div
            key={option}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Badge
              variant={value === option ? 'default' : 'outline'}
              className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all ${
                value === option
                  ? 'bg-bowling-blue text-white'
                  : 'border-border hover:bg-muted'
              }`}
              onClick={() => onSelect(option)}
              aria-label={`Select ${option} for Roll ${rollIndex + 1} of ${player}`}
            >
              {option}
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RollSelector;