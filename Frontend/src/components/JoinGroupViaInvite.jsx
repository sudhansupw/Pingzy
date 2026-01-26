import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

const JoinGroupViaInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const joinGroup = async () => {
    await axiosInstance.post(`/groups/join/invite/${token}`);
    toast.success("Joined group");
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl font-semibold">Join Group</h2>

      <button onClick={joinGroup} className="btn btn-primary mt-4">
        Join Group
      </button>
    </div>
  );
};

export default JoinGroupViaInvite;
