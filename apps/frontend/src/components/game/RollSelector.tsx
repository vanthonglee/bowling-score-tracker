import { Badge } from "@/components/ui/badge"
import { RollSelectorProps } from "./types";

// Reusable component to render a scrollable list of badges for roll selection
const RollSelector: React.FC<RollSelectorProps> = ({ player, rollIndex, value, options, onSelect }) => {
  return (
    <div className="mb-2">
      {/* Label indicating which roll is being selected */}
      <label className="block mb-1">Roll {rollIndex + 1}</label>
      {/* Scrollable container for badges */}
      <div className="w-full flex overflow-x-auto space-x-2 pb-2">
        {options.map(option => (
          <Badge
            key={option}
            variant={value === option ? 'default' : 'secondary'} // Highlight selected option
            className="cursor-pointer px-3 py-1 whitespace-nowrap"
            onClick={() => onSelect(option)}
            aria-label={`Select ${option} for Roll ${rollIndex + 1} of ${player}`} // Accessibility: ARIA label
          >
            {option}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default RollSelector;