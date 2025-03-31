// apps/frontend/src/components/game/PlayerRollSelector.tsx
import { useEffect } from 'react';
import RollSelector from './RollSelector';
import { PlayerRollSelectorProps } from './types';
import { useGameStore } from '../../store';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Component to render roll selectors for a single player in a bowling game.
 * @param player - The unique playerId of the player.
 * @param scores - The current scores for all players, keyed by playerId.
 * @param setScores - Function to update the scores.
 * @param getRoll2Options - Function to get options for the second roll.
 * @param getRoll3Options - Function to get options for the third roll.
 * @param currentFrame - The current frame number.
 */
const PlayerRollSelector: React.FC<PlayerRollSelectorProps> = ({
  player,
  scores,
  setScores,
  getRoll2Options,
  getRoll3Options,
  currentFrame,
}) => {
  const { players } = useGameStore();
  
  // Find the player by playerId to get the display name
  const playerData = players.find(p => p.playerId === player);
  const displayName = playerData ? playerData.name : player;

  const roll1 = scores[player]?.[0] || '';
  const roll2 = scores[player]?.[1] || '';
  const roll3 = scores[player]?.[2] || '';
  const roll1Options = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'X'];

  const roll2Options = getRoll2Options(roll1, currentFrame);
  const roll3Options = getRoll3Options(roll1, roll2, currentFrame);

  // Determine if Roll 3 should be shown in the 10th frame
  const shouldShowRoll3 = currentFrame === 10 && roll3Options.length > 0;

  // Determine if Roll 2 is required after a strike in the 10th frame
  const isRoll2Required = currentFrame === 10 && (roll1 === 'X' || roll1 === '10') && !roll2;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">{displayName}</h3>
      {/* Roll 1 Selector */}
      <RollSelector
        player={player}
        rollIndex={0}
        value={roll1}
        options={roll1Options}
        onSelect={value =>
          setScores({
            ...scores,
            [player]: [value, '', ''], // Reset Roll 2 and Roll 3 when Roll 1 changes
          })
        }
      />
      {/* Roll 2 Selector: Shown if Roll 1 is not a strike in frames 1-9, or always in frame 10 */}
      {(currentFrame < 10 ? roll1 !== 'X' && roll1 !== '10' : true) && roll1 && (
        <>
          <RollSelector
            player={player}
            rollIndex={1}
            value={roll2}
            options={roll2Options}
            onSelect={value =>
              setScores({
                ...scores,
                [player]: [roll1, value, ''], // Reset Roll 3 when Roll 2 changes
              })
            }
          />
          {isRoll2Required && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground flex items-center"
            >
              <AlertCircle className="w-4 h-4 mr-1" />
              Please select Roll 2 after a strike.
            </motion.p>
          )}
        </>
      )}
      {/* Roll 3 Selector: Shown only in frame 10 if a third roll is allowed (strike or spare) */}
      {shouldShowRoll3 && (
        <RollSelector
          player={player}
          rollIndex={2}
          value={roll3}
          options={roll3Options}
          onSelect={value =>
            setScores({
              ...scores,
              [player]: [roll1, roll2, value],
            })
          }
        />
      )}
    </div>
  );
};

export default PlayerRollSelector;