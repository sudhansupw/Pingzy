import { useState } from "react";
import { useMessageStore } from "../store/useMessageStore";

const CreateGroupModal = ({ onClose }) => {
  const { createGroup, setActiveChat } = useMessageStore();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleCreate = async () => {
    if (!name || !password) return;

    const group = await createGroup({ name, password });
    if (group) {
      setActiveChat({ type: "group", data: group });
      onClose();
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Create Group</h3>

        <input
          className="input input-bordered w-full mt-4"
          placeholder="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          <button className="btn btn-primary" onClick={handleCreate}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
