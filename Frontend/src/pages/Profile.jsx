import { useState } from "react";
import { Camera, Mail, User, Users, Crown, Clock, Copy } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageStore } from "../store/useMessageStore";
import { useCountdown } from "../lib/useCountdown";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

const Profile = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "user";

  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const { activeChat, endGroup, extendGroup } = useMessageStore();

  // -------------------------
  // Resolve entity safely
  // -------------------------
  const entity =
    mode === "group"
      ? activeChat?.type === "group"
        ? activeChat.data
        : null
      : authUser;

  // Always call hooks
  const timeLeft = useCountdown(mode === "group" ? entity?.expiresAt : null);

  const [selectedImg, setSelectedImg] = useState(null);

  if (!entity) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Nothing to display
      </div>
    );
  }

  const isGroup = mode === "group";

  const adminId =
    isGroup && typeof entity.admin === "object"
      ? entity.admin._id
      : entity.admin;

  const isAdmin = isGroup && String(adminId) === String(authUser._id);

  // -------------------------
  // Handlers
  // -------------------------
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const copyGroupId = () => {
    navigator.clipboard.writeText(entity._id);
    toast.success("Group ID copied");
  };

  const handleEndGroup = async () => {
    await endGroup(entity._id);
    toast.success("Group ended");
  };

  const handleExtendGroup = async () => {
    await extendGroup(entity._id);
    toast.success("Group extended");
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          {/* HEADER */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold">
              {isGroup ? "Group Info" : "Profile"}
            </h1>
            <p className="mt-2 text-zinc-400">
              {isGroup ? "Temporary group details" : "Your profile information"}
            </p>
          </div>

          {/* AVATAR */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={
                  selectedImg ||
                  (isGroup
                    ? entity.groupPic ||
                      "https://cdn-icons-png.flaticon.com/512/681/681494.png"
                    : entity.profilePic ||
                      "https://t3.ftcdn.net/jpg/05/00/54/28/360_F_500542898_LpYSy4RGAi95aDim3TLtSgCNUxNlOlcM.jpg")
                }
                alt="Avatar"
                className="size-32 rounded-full object-cover border-4"
              />

              {!isGroup && (
                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-0 right-0 bg-base-content p-2 rounded-full cursor-pointer transition
                    ${
                      isUpdatingProfile
                        ? "animate-pulse pointer-events-none"
                        : ""
                    }`}
                >
                  <Camera className="w-5 h-5 text-base-200" />
                  <input
                    id="avatar-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              )}
            </div>

            {!isGroup && (
              <p className="text-sm text-zinc-400">
                {isUpdatingProfile
                  ? "Uploading..."
                  : "Click the camera icon to update your photo"}
              </p>
            )}
          </div>

          {/* INFO SECTION */}
          <div className="space-y-6">
            {/* NAME */}
            <InfoRow
              icon={isGroup ? Users : User}
              label={isGroup ? "Group Name" : "Full Name"}
              value={isGroup ? entity.name : entity.fullName}
            />

            {/* EMAIL (USER ONLY) */}
            {!isGroup && (
              <InfoRow icon={Mail} label="Email Address" value={entity.email} />
            )}

            {/* ADMIN */}
            {isGroup && (
              <InfoRow
                icon={Crown}
                label="Admin"
                value={
                  typeof entity.admin === "object"
                    ? entity.admin.fullName
                    : "Unknown"
                }
              />
            )}

            {/* TIMER */}
            {isGroup && (
              <InfoRow
                icon={Clock}
                label="Time Remaining"
                value={timeLeft}
                highlight
              />
            )}

            {/* GROUP ID */}
            {isGroup && (
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  Group ID
                </div>
                <div className="flex gap-2">
                  <p className="flex-1 px-4 py-2.5 bg-base-200 rounded-lg border truncate">
                    {entity._id}
                  </p>
                  <button
                    onClick={copyGroupId}
                    className="btn btn-sm btn-outline"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">
              {isGroup ? "Group Status" : "Account Information"}
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-zinc-700">
                <span>Created At</span>
                <span>{new Date(entity.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-between py-2">
                <span>Status</span>
                <span
                  className={
                    isGroup && timeLeft === "Expired"
                      ? "text-red-500"
                      : "text-green-500"
                  }
                >
                  {isGroup && timeLeft === "Expired" ? "Expired" : "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* ADMIN ACTIONS */}
          {isGroup && isAdmin && (
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleExtendGroup}
                className="btn btn-warning btn-sm"
              >
                Extend Chat
              </button>
              <button onClick={handleEndGroup} className="btn btn-error btn-sm">
                End Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value, highlight }) => (
  <div className="space-y-1.5">
    <div className="text-sm text-zinc-400 flex items-center gap-2">
      <Icon className="w-4 h-4" />
      {label}
    </div>
    <p
      className={`px-4 py-2.5 bg-base-200 rounded-lg border ${
        highlight ? "text-primary font-medium" : ""
      }`}
    >
      {value}
    </p>
  </div>
);

export default Profile;
