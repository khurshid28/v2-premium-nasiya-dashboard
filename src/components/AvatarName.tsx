import React from "react";
import { formatShortName, getInitials } from "lib/formatters";

type Props = {
  image?: string | null;
  name: string;
  subtitle?: string | null;
  size?: "sm" | "md";
  showShortName?: boolean;
};

const AvatarName = ({ image, name, subtitle, size = "md", showShortName = false }: Props) => {
  const initials = React.useMemo(() => {
    return getInitials(name);
  }, [name]);

  const displayName = showShortName ? formatShortName(name) : name;

  const avatarSizeClass = size === "sm" ? "w-8 h-8 text-sm" : "w-10 h-10 text-base";

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center justify-center rounded-full bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 overflow-hidden flex-shrink-0 ${avatarSizeClass}`}>
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover rounded-full" />
        ) : (
          <span className="font-semibold">{initials}</span>
        )}
      </div>
      <div className="flex flex-col">
        <div className="text-sm font-medium text-gray-900 dark:text-white">{displayName}</div>
        {subtitle ? <div className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</div> : null}
      </div>
    </div>
  );
};

export default AvatarName;
