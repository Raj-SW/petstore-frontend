import {
  FiFileText, FiShield, FiHeart, FiUsers, FiClipboard, FiFolder,
  FiSmile, FiDownload, FiGlobe, FiLifeBuoy, FiBox, FiSend,
} from "react-icons/fi";
import { FaStethoscope, FaVial, FaAward } from "react-icons/fa";

/**
 * Single source for the page's line-icon set. Keeps every icon at a
 * consistent stroke weight/size and lets content reference icons by string
 * key. Decorative by default (aria-hidden) — pass a `title` for meaningful use.
 */
const ICONS = {
  guidance: FiFileText,
  compliance: FiShield,
  heart: FiHeart,
  plane: FiSend,
  consultation: FiUsers,
  clipboard: FiClipboard,
  stethoscope: FaStethoscope,
  lab: FaVial,
  certificate: FaAward,
  folder: FiFolder,
  smile: FiSmile,
  crate: FiBox,
  shield: FiShield,
  comfort: FiHeart,
  support: FiLifeBuoy,
  download: FiDownload,
  globe: FiGlobe,
};

const PtIcon = ({ name, size = 24, className, title }) => {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return (
    <Cmp
      size={size}
      className={className}
      strokeWidth={2}
      aria-hidden={title ? undefined : "true"}
      title={title}
      role={title ? "img" : undefined}
    />
  );
};

export default PtIcon;
