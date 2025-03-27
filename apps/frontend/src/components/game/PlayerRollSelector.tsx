// components/PlayerRollSelector.tsx
import RollSelector from './RollSelector';
import { PlayerRollSelectorProps } from './types';

// Component to render roll selectors for a single player
const PlayerRollSelector: React.FC<PlayerRollSelectorProps> = ({
  player,
  scores,
  setScores,
  getRoll2Options,
  getRoll3Options,
  currentFrame,
}) => {
  const roll1 = scores[player]?.[0] || '';
  const roll2 = scores[player]?.[1] || '';
  const roll3 = scores[player]?.[2] || '';
  const roll2Options = getRoll2Options(roll1, currentFrame);
  const roll3Options = getRoll3Options(roll1, roll2, currentFrame);
  const roll1Options = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'X'];

  return (
    <div className="mb-4">
      {/* Player name */}
      <h3>{player}</h3>

      {/* Roll 1 Selector */}
      <RollSelector
        player={player}
        rollIndex={0}
        value={roll1}
        options={roll1Options}
        onSelect={value =>
          setScores({
            ...scores,
            [player]: [value, scores[player]?.[1] || '', scores[player]?.[2] || ''],
          })
        }
      />

      {/* Roll 2 Selector: Hidden in frames 1-9 if Roll 1 is a strike */}
      {(currentFrame < 10 ? roll1 !== 'X' && roll1 !== '10' : true) && roll1 && (
        <RollSelector
          player={player}
          rollIndex={1}
          value={roll2}
          options={roll2Options}
          onSelect={value =>
            setScores({
              ...scores,
              [player]: [scores[player]?.[0] || '', value, scores[player]?.[2] || ''],
            })
          }
        />
      )}

      {/* Roll 3 Selector: Only shown in 10th frame for strike or spare */}
      {currentFrame === 10 && roll3Options.length > 0 && (
        <RollSelector
          player={player}
          rollIndex={2}
          value={roll3}
          options={roll3Options}
          onSelect={value =>
            setScores({
              ...scores,
              [player]: [scores[player]?.[0] || '', scores[player]?.[1] || '', value],
            })
          }
        />
      )}
    </div>
  );
};

export default PlayerRollSelector;