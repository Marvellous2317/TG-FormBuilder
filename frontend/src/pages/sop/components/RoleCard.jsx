import React from 'react';

export default function RoleCard({
  title,
  subtitle,
  icon: Icon,
  bg,
  permissions = [],
  showPermissions = true,
}) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-sop-200">
      <div className={`flex items-center gap-3 px-5 py-4 ${bg}`}>
        {Icon ? <Icon className="text-lg text-sop-800" /> : null}
        <div className="flex flex-col">
          <span className="text-sm font-bold">{title}</span>
          <span className="text-sm text-sop-800">{subtitle}</span>
        </div>
      </div>
      {showPermissions && (
        <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-sop-200 px-5 py-4">
          {permissions.map((permission) => (
            <span key={permission} className="flex items-center gap-2 text-sm">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sop-400" />
              {permission}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
