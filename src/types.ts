export interface ERPUserStat {
  label: string;
  value: string;
  color: string; // e.g., 'blue', 'green', 'amber' for custom styling
}

export interface ERPDropdownItem {
  label: string;
  icon: string; // Name of Lucide icon
  badge?: string; // Optional badge text e.g. "New" or numeric e.g. "5"
  badgeColor?: string; // CSS color or predefined utility color
  actionId: string; // Unique identifier for the output click event
  tooltip?: string; // Accessible hover tooltip text
}

export interface ERPDropdownGroup {
  title: string;
  items: ERPDropdownItem[];
}

export interface ERPDropdownConfig {
  idPrefix: string; // Unique ID prefix to avoid generic styles
  theme: 'light' | 'dark';
  direction: 'ltr' | 'rtl';
  zIndex: number;
  animationType: 'fade' | 'slide' | 'scale' | 'bounce' | 'flip';
  animationDuration: number; // in milliseconds
  density: 'compact' | 'standard' | 'spacious';
  showStats: boolean;
  showQuickStatus: boolean;
  userName: string;
  userRole: string;
  userEmail: string;
  avatarUrl: string;
  currentStatus: 'online' | 'away' | 'busy' | 'offline';
  stats: ERPUserStat[];
  menuGroups: ERPDropdownGroup[];
}

export const DEFAULT_CONFIG: ERPDropdownConfig = {
  idPrefix: 'erp-user-dropdown',
  theme: 'light',
  direction: 'ltr',
  zIndex: 1000,
  animationType: 'slide',
  animationDuration: 250,
  density: 'standard',
  showStats: true,
  showQuickStatus: true,
  userName: 'Alexander Vance',
  userRole: 'Enterprise Controller',
  userEmail: 'alexander.vance@acme-erp.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  currentStatus: 'online',
  stats: [
    { label: 'Pending Approvals', value: '14', color: '#eab308' },
    { label: 'System Tasks', value: '8 Active', color: '#3b82f6' },
    { label: 'Open Audits', value: '3 Critical', color: '#ef4444' }
  ],
  menuGroups: [
    {
      title: 'My Profile',
      items: [
        { label: 'Account Settings', icon: 'Settings', tooltip: 'Manage personal and billing configurations', actionId: 'settings' },
        { label: 'Security & Keys', icon: 'ShieldAlert', badge: 'MFA', badgeColor: '#22c55e', tooltip: 'Configure sign-in security and API access tokens', actionId: 'security' },
        { label: 'Personal Workspace', icon: 'Briefcase', tooltip: 'Access assigned ERP modules', actionId: 'workspace' }
      ]
    },
    {
      title: 'ERP Modules',
      items: [
        { label: 'Ledger Approvals', icon: 'FileCheck', badge: '14', badgeColor: '#eab308', tooltip: 'Review pending financial vouchers', actionId: 'approvals' },
        { label: 'Compliance Reports', icon: 'BarChart3', tooltip: 'Generate real-time GAAP and SOC2 reports', actionId: 'reports' },
        { label: 'System Audit Logs', icon: 'Activity', tooltip: 'Browse global access logs', actionId: 'audit-logs' }
      ]
    },
    {
      title: 'Support & Session',
      items: [
        { label: 'Help Desk', icon: 'HelpCircle', tooltip: 'Open internal support ticket', actionId: 'help' },
        { label: 'Switch Company', icon: 'GitMerge', badge: 'ACME Corp', badgeColor: '#6366f1', tooltip: 'Switch context between registered business entities', actionId: 'switch-company' },
        { label: 'Sign Out', icon: 'LogOut', tooltip: 'Safely terminate active enterprise session', actionId: 'logout' }
      ]
    }
  ]
};
