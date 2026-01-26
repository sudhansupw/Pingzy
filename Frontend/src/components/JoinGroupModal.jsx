import { useState } from "react";
import { useMessageStore } from "../store/useMessageStore";

const JoinGroupModal = ({ onClose }) => {
  const { joinGroup, setActiveChat } = useMessageStore();
  const [groupId, setGroupId] = useState("");
  const [password, setPassword] = useState("");

  const handleJoin = async () => {
    if (!groupId || !password) return;

    const group = await joinGroup({ groupId, password });
    if (group) {
      setActiveChat({ type: "group", data: group });
      onClose();
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Join Group</h3>

        <input
          className="input input-bordered w-full mt-4"
          placeholder="Group ID"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        />

        <input
          className="input input-bordered w-full mt-3"
          type="password"
          placeholder="Group password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleJoin}>
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinGroupModal;
