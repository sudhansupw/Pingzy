import { Clock, Copy } from "lucide-react";
import { useCountdown } from "../lib/useCountdown";
import { toast } from "react-hot-toast";

const GroupRow = ({ group, isActive, onSelect }) => {
  const timeLeft = useCountdown(group.expiresAt);

  const copyGroupCode = () => {
    navigator.clipboard.writeText(group._id);
    toast.success("Group code copied");
  };

  return (
    <button
      onClick={() => onSelect(group)}
      className={`w-full p-3 flex items-center gap-3 hover:bg-base-300
        ${isActive ? "bg-base-300 ring-1 ring-base-300" : ""}
        ${timeLeft === "Expired" ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      {/* Avatar */}
      <div className="mx-auto lg:mx-0">
        <img
          src={
            group.groupPic ||
            "https://cdn-icons-png.flaticon.com/512/681/681494.png"
          }
          className="size-12 rounded-full object-cover"
          alt={group.name}
        />
      </div>

      {/* Info */}
      <div className="hidden lg:flex flex-col text-left min-w-0 flex-1">
        <div className="font-medium truncate">{group.name}</div>

        <div className="flex items-center gap-1 text-xs text-zinc-400">
          <Clock size={12} />
          <span>{timeLeft}</span>
        </div>
      </div>

      {/* Copy group code */}
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          copyGroupCode();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") copyGroupCode();
        }}
        className="btn btn-xs btn-ghost hidden lg:flex cursor-pointer"
        title="Copy Group Code"
      >
        <Copy size={14} />
      </div>
    </button>
  );
};

export default GroupRow;
