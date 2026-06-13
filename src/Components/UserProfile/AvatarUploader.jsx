import { useRef, useState } from "react";
import { FiCamera } from "react-icons/fi";
import usersApi from "../../Services/api/usersApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "./AvatarUploader.css";

const initials = (name) =>
  (name || "U").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const AvatarUploader = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const url = user?.profileImage?.url || user?.profileImage || null;

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast("Please choose an image file", "error");
      return;
    }
    try {
      setUploading(true);
      const res = await usersApi.uploadAvatar(file);
      const newUrl = res?.data?.profileImage;
      if (newUrl) updateUser({ profileImage: { url: newUrl } });
      addToast("Profile photo updated", "success");
    } catch (err) {
      addToast(err?.message || "Failed to upload photo", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="avatar-uploader">
      <div className="avatar-uploader-img">
        {url ? <img src={url} alt="Profile" /> : <span>{initials(user?.name)}</span>}
        <button
          type="button"
          className="avatar-uploader-btn"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Change profile photo"
          title="Change profile photo"
        >
          <FiCamera size={15} />
        </button>
      </div>
      {uploading && <p className="avatar-uploader-status">Uploading…</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onPick}
      />
    </div>
  );
};

export default AvatarUploader;
