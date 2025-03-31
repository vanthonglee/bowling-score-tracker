// apps/frontend/src/components/game/RollSelector.tsx
import { Badge } from '@/components/ui/badge';
import { RollSelectorProps } from './types';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store';

/**
 * A reusable component to render a scrollable list of badges for selecting roll values in a bowling game.
 * @param player - The unique playerId of the player.
 * @param rollIndex - The index of the roll (0 for Roll 1, 1 for Roll 2, 2 for Roll 3).
 * @param value - The currently selected roll value.
 * @param options - The available roll options (e.g., ['0', '1', ..., '10', 'X']).
 * @param onSelect - Callback function to handle roll selection.
 */
const RollSelector: React.FC<RollSelectorProps> = ({ player, rollIndex, value, options, onSelect }) => {
  // Retrieve the player's display name from the store using playerId
  const { players } = useGameStore();
  const playerData = players.find(p => p.playerId === player);
  const displayName = playerData ? playerData.name : player;

  return (
    <div className="space-y-1">
      {/* Label for the roll */}
      <label className="block text-sm font-medium text-muted-foreground">
        Roll {rollIndex + 1}
      </label>
      {/* Scrollable container for roll options */}
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <motion.div
            key={option}
            whileHover={{ scale: 1.05 }} // Scale up on hover for a subtle effect
            whileTap={{ scale: 0.95 }} // Scale down on tap/click for feedback
          >
            <Badge
              variant={value === option ? 'default' : 'outline'}
              className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all ${
                value === option
                  ? 'bg-bowling-blue text-white'
                  : 'border-border hover:bg-muted'
              }`}
              onClick={() => onSelect(option)}
              aria-label={`Select ${option} for Roll ${rollIndex + 1} of ${displayName}`}
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