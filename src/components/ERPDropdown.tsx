import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { ERPDropdownConfig, ERPDropdownItem, DEFAULT_CONFIG } from '../types';

// Map icon name to Lucide Component safely
const DynamicIcon = ({ name, size = 16, className = '' }: { name: string; size?: number; className?: string }) => {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) {
    return <Icons.HelpCircle size={size} className={className} />;
  }
  return <IconComponent size={size} className={className} />;
};

interface ERPDropdownProps {
  config: ERPDropdownConfig;
  onConfigChange: (updater: (prev: ERPDropdownConfig) => ERPDropdownConfig) => void;
  onActionTriggered: (actionId: string, label: string) => void;
}

export const ERPDropdown: React.FC<ERPDropdownProps> = ({
  config,
  onConfigChange,
  onActionTriggered,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<{ group: number; item: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [avatarFailed, setAvatarFailed] = useState(false);
  const [headerAvatarFailed, setHeaderAvatarFailed] = useState(false);

  // Reset failure states if avatarUrl changes
  useEffect(() => {
    setAvatarFailed(false);
    setHeaderAvatarFailed(false);
  }, [config.avatarUrl]);

  // Helper to extract clean initials from name supporting English and Arabic
  const getAvatarInitials = (name: string): string => {
    if (!name) return 'U';
    const cleanName = name.trim();
    const words = cleanName.split(/\s+/).filter(Boolean);
    if (words.length === 0) return 'U';
    
    // Check if there are Arabic characters in the name
    const isArabic = /[\u0600-\u06FF]/.test(cleanName);
    
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    const firstInit = words[0].charAt(0);
    const secondInit = words[1].charAt(0);
    
    if (isArabic) {
      // For Arabic names, standard is to show both initials separated by a space
      return `${firstInit} ${secondInit}`;
    }
    
    return `${firstInit.toUpperCase()}${secondInit.toUpperCase()}`;
  };

  // Helper to get a stable color based on name
  const getStableColor = (str: string): string => {
    const stringToHash = str || 'user';
    let hash = 0;
    for (let i = 0; i < stringToHash.length; i++) {
      hash = stringToHash.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#1a73e8', // Google Blue
      '#00897b', // Teal
      '#8e24aa', // Purple
      '#0f9d58', // Green
      '#db4437', // Red
      '#e06055', // Terracotta
      '#3f51b5', // Indigo
      '#e91e63', // Pink
      '#673ab7', // Deep Purple
      '#00acc1', // Cyan
    ];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const {
    idPrefix,
    theme,
    direction,
    zIndex,
    animationType,
    animationDuration,
    density,
    showStats,
    showQuickStatus,
    userName,
    userRole,
    userEmail,
    avatarUrl,
    currentStatus,
    stats,
    menuGroups,
  } = config;

  const initials = getAvatarInitials(userName);
  const avatarBgColor = getStableColor(userName + (userEmail || ''));

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for dropdown accessibility (WCAG)
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(null);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      // Collect all focusable items linearly
      const focusableItems: Array<{ groupIndex: number; itemIndex: number; actionId: string }> = [];
      menuGroups.forEach((group, gIdx) => {
        group.items.forEach((item, iIdx) => {
          focusableItems.push({ groupIndex: gIdx, itemIndex: iIdx, actionId: item.actionId });
        });
      });

      if (focusableItems.length === 0) return;

      let currentLinearIdx = focusableItems.findIndex(
        (f) => focusedIndex && f.groupIndex === focusedIndex.group && f.itemIndex === focusedIndex.item
      );

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = (currentLinearIdx + 1) % focusableItems.length;
        setFocusedIndex({ group: focusableItems[nextIdx].groupIndex, item: focusableItems[nextIdx].itemIndex });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx = (currentLinearIdx - 1 + focusableItems.length) % focusableItems.length;
        setFocusedIndex({ group: focusableItems[prevIdx].groupIndex, item: focusableItems[prevIdx].itemIndex });
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (focusedIndex) {
          const activeItem = menuGroups[focusedIndex.group].items[focusedIndex.item];
          handleItemClick(activeItem);
        } else {
          setFocusedIndex({ group: 0, item: 0 });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, menuGroups]);

  // Status mapping colors and labels
  const statusDetails = {
    online: { label: 'Online', color: '#22c55e', text: 'Active on system' },
    away: { label: 'Away', color: '#eab308', text: 'Idle / Temporary stepped out' },
    busy: { label: 'Do Not Disturb', color: '#ef4444', text: 'In meeting / Focused session' },
    offline: { label: 'Offline', color: '#64748b', text: 'Invisible status' },
  };

  const handleStatusChange = (status: 'online' | 'away' | 'busy' | 'offline') => {
    onConfigChange((prev) => ({ ...prev, currentStatus: status }));
    onActionTriggered(`status-${status}`, `Status updated to ${statusDetails[status].label}`);
  };

  const handleItemClick = (item: ERPDropdownItem) => {
    onActionTriggered(item.actionId, item.label);
    setIsOpen(false);
  };

  // Compile Dynamic CSS corresponding directly to settings
  const compiledCss = `
    /* DYNAMIC INJECTED CSS FOR ERP COMPONENT: #${idPrefix} */
    
    /* Layout Constants & CSS Variables */
    :root {
      --${idPrefix}-font: 'Inter', system-ui, sans-serif;
      --${idPrefix}-z-index: ${zIndex};
      --${idPrefix}-anim-dur: ${animationDuration}ms;
    }

    /* Theme Tokens */
    ${theme === 'light' ? `
      /* Light Mode Frosted Glass Theme */
      #${idPrefix}-container {
        --bg-primary: rgba(255, 255, 255, 0.72);
        --bg-secondary: rgba(241, 245, 249, 0.45);
        --bg-hover: rgba(59, 130, 246, 0.08);
        --border-color: rgba(255, 255, 255, 0.45);
        --text-primary: #1e293b;
        --text-secondary: #475569;
        --text-muted: #64748b;
        --accent-primary: #3b82f6;
        --accent-hover: #2563eb;
        --shadow-elevation: 0 8px 32px 0 rgba(31, 38, 135, 0.08);
        --focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.25);
        --tooltip-bg: rgba(15, 23, 42, 0.85);
        --tooltip-text: #f8fafc;
      }
    ` : `
      /* Dark Mode Frosted Glass Theme */
      #${idPrefix}-container {
        --bg-primary: rgba(15, 23, 42, 0.72);
        --bg-secondary: rgba(30, 41, 59, 0.45);
        --bg-hover: rgba(59, 130, 246, 0.15);
        --border-color: rgba(255, 255, 255, 0.12);
        --text-primary: #f8fafc;
        --text-secondary: #cbd5e1;
        --text-muted: #94a3b8;
        --accent-primary: #3b82f6;
        --accent-hover: #60a5fa;
        --shadow-elevation: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
        --focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.4);
        --tooltip-bg: rgba(248, 250, 252, 0.85);
        --tooltip-text: #0f172a;
      }
    `}

    /* Density Configurations */
    ${density === 'compact' ? `
      #${idPrefix}-container {
        --item-padding: 6px 12px;
        --section-gap: 4px;
        --font-base: 13px;
        --avatar-size: 32px;
        --trigger-padding: 4px 8px;
        --stats-padding: 8px 12px;
        --stats-grid-gap: 6px;
      }
    ` : density === 'spacious' ? `
      #${idPrefix}-container {
        --item-padding: 14px 20px;
        --section-gap: 10px;
        --font-base: 15px;
        --avatar-size: 44px;
        --trigger-padding: 8px 16px;
        --stats-padding: 16px 20px;
        --stats-grid-gap: 12px;
      }
    ` : `
      /* Standard Density */
      #${idPrefix}-container {
        --item-padding: 10px 16px;
        --section-gap: 8px;
        --font-base: 14px;
        --avatar-size: 38px;
        --trigger-padding: 6px 12px;
        --stats-padding: 12px 16px;
        --stats-grid-gap: 8px;
      }
    `}

    /* Structural Scopes */
    #${idPrefix}-container {
      font-family: var(--${idPrefix}-font);
      direction: ${direction};
      display: inline-block;
      position: relative;
    }

    /* Trigger Button Styling */
    #${idPrefix}-trigger-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: var(--trigger-padding);
      background: var(--bg-primary);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--text-primary);
      outline: none;
    }

    #${idPrefix}-trigger-btn:hover {
      background: var(--bg-secondary);
      border-color: var(--accent-primary);
    }

    #${idPrefix}-trigger-btn:focus {
      box-shadow: var(--focus-ring);
    }

    /* Avatar Core Wrapper */
    #${idPrefix}-avatar-wrapper {
      position: relative;
      width: var(--avatar-size);
      height: var(--avatar-size);
    }

    #${idPrefix}-avatar-img,
    #${idPrefix}-avatar-placeholder {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--border-color);
    }

    #${idPrefix}-avatar-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #ffffff;
      font-size: calc(var(--avatar-size) * 0.40);
      user-select: none;
      text-shadow: 0 1px 2px rgba(0,0,0,0.25);
    }

    /* Status Dot with smooth micro-pulsing */
    #${idPrefix}-status-dot {
      position: absolute;
      bottom: 0;
      ${direction === 'rtl' ? 'left: 0;' : 'right: 0;'}
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--bg-primary);
      box-shadow: 0 0 6px rgba(0,0,0,0.15);
      animation: ${idPrefix}-status-pulse-anim 2.5s infinite ease-in-out;
    }

    @keyframes ${idPrefix}-status-pulse-anim {
      0% { transform: scale(1); }
      50% { transform: scale(1.18); }
      100% { transform: scale(1); }
    }

    /* User details in trigger */
    #${idPrefix}-trigger-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: ${direction === 'rtl' ? 'right' : 'left'};
    }

    #${idPrefix}-trigger-name {
      font-weight: 600;
      font-size: var(--font-base);
      line-height: 1.2;
    }

    #${idPrefix}-trigger-role {
      font-size: calc(var(--font-base) - 2px);
      color: var(--text-muted);
    }

    #${idPrefix}-trigger-chevron {
      color: var(--text-muted);
      transition: transform 0.2s ease;
      ${direction === 'rtl' ? 'margin-right: auto;' : 'margin-left: auto;'}
    }

    #${idPrefix}-trigger-chevron.open {
      transform: rotate(180deg);
    }

    /* Dropdown Core Wrapper with frosted blur and soft borders */
    #${idPrefix}-menu-panel {
      position: absolute;
      top: 100%;
      ${direction === 'rtl' ? 'left: 0;' : 'right: 0;'}
      margin-top: 6px;
      width: 320px;
      background: var(--bg-primary);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      box-shadow: var(--shadow-elevation);
      z-index: var(--${idPrefix}-z-index);
      overflow: hidden;
      animation-duration: var(--${idPrefix}-anim-dur);
      animation-fill-mode: both;
      animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: top ${direction === 'rtl' ? 'left' : 'right'};
    }

    /* Keyframe Animations */
    @keyframes ${idPrefix}-anim-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes ${idPrefix}-anim-slide {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes ${idPrefix}-anim-scale {
      from { opacity: 0; transform: scale(0.92); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes ${idPrefix}-anim-bounce {
      0% { opacity: 0; transform: scale(0.85); }
      70% { transform: scale(1.04); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes ${idPrefix}-anim-flip {
      from { opacity: 0; transform: perspective(400px) rotateX(-12deg); }
      to { opacity: 1; transform: perspective(400px) rotateX(0deg); }
    }

    /* Animation Assignment */
    #${idPrefix}-menu-panel.anim-fade { animation-name: ${idPrefix}-anim-fade; }
    #${idPrefix}-menu-panel.anim-slide { animation-name: ${idPrefix}-anim-slide; }
    #${idPrefix}-menu-panel.anim-scale { animation-name: ${idPrefix}-anim-scale; }
    #${idPrefix}-menu-panel.anim-bounce { animation-name: ${idPrefix}-anim-bounce; }
    #${idPrefix}-menu-panel.anim-flip { animation-name: ${idPrefix}-anim-flip; }

    /* Identity Header block */
    #${idPrefix}-identity-header {
      padding: var(--stats-padding);
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    #${idPrefix}-identity-avatar,
    #${idPrefix}-identity-avatar-placeholder {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--accent-primary);
    }

    #${idPrefix}-identity-avatar-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #ffffff;
      font-size: 20px;
      user-select: none;
      text-shadow: 0 1px 2px rgba(0,0,0,0.25);
    }

    #${idPrefix}-identity-details {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      text-align: ${direction === 'rtl' ? 'right' : 'left'};
      min-width: 0;
    }

    #${idPrefix}-identity-name {
      font-weight: 700;
      color: var(--text-primary);
      font-size: var(--font-base);
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #${idPrefix}-identity-email {
      color: var(--text-muted);
      font-size: calc(var(--font-base) - 2px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #${idPrefix}-identity-role {
      font-size: calc(var(--font-base) - 3px);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent-primary);
      font-weight: 600;
      margin-top: 2px;
    }

    /* Quick Status bar */
    #${idPrefix}-status-bar {
      padding: 8px 12px;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-primary);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    #${idPrefix}-status-title {
      font-size: calc(var(--font-base) - 3px);
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-align: ${direction === 'rtl' ? 'right' : 'left'};
    }

    #${idPrefix}-status-options {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
    }

    #${idPrefix}-status-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 6px 2px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
    }

    #${idPrefix}-status-btn:hover {
      background: var(--bg-hover);
      border-color: var(--text-muted);
    }

    #${idPrefix}-status-btn.active {
      background: var(--bg-primary);
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
    }

    #${idPrefix}-status-dot-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-bottom: 4px;
    }

    #${idPrefix}-status-text {
      font-size: calc(var(--font-base) - 4px);
      font-weight: 600;
      color: var(--text-primary);
    }

    /* ERP Stats block */
    #${idPrefix}-stats-block {
      padding: var(--stats-padding);
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
    }

    #${idPrefix}-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--stats-grid-gap);
    }

    #${idPrefix}-stat-card {
      padding: 8px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      text-align: center;
      transition: border-color 0.2s;
    }

    #${idPrefix}-stat-card:hover {
      border-color: var(--accent-primary);
    }

    #${idPrefix}-stat-value {
      font-size: var(--font-base);
      font-weight: 700;
      line-height: 1.1;
    }

    #${idPrefix}-stat-label {
      font-size: calc(var(--font-base) - 4px);
      color: var(--text-muted);
      margin-top: 2px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Menu Area Scroll */
    #${idPrefix}-menu-scroller {
      max-height: 280px;
      overflow-y: auto;
      padding: 6px;
    }

    /* Group Container */
    #${idPrefix}-menu-group {
      margin-bottom: var(--section-gap);
    }

    #${idPrefix}-menu-group:last-child {
      margin-bottom: 0;
    }

    #${idPrefix}-group-title {
      font-size: calc(var(--font-base) - 3px);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      padding: 6px 12px;
      text-align: ${direction === 'rtl' ? 'right' : 'left'};
    }

    /* Dropdown Items */
    #${idPrefix}-menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: var(--item-padding);
      border-radius: 6px;
      color: var(--text-secondary);
      font-size: var(--font-base);
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      position: relative;
      transition: all 0.15s ease;
      text-align: ${direction === 'rtl' ? 'right' : 'left'};
      border: 1px solid transparent;
      outline: none;
    }

    #${idPrefix}-menu-item:hover, #${idPrefix}-menu-item.focused {
      background: var(--bg-hover);
      color: var(--text-primary);
      border-color: var(--border-color);
    }

    #${idPrefix}-menu-item-icon {
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s;
    }

    #${idPrefix}-menu-item:hover #${idPrefix}-menu-item-icon, #${idPrefix}-menu-item.focused #${idPrefix}-menu-item-icon {
      color: var(--accent-primary);
    }

    #${idPrefix}-menu-item-label {
      flex-grow: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    #${idPrefix}-menu-item-badge {
      font-size: calc(var(--font-base) - 4px);
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 10px;
      color: #ffffff;
      line-height: 1;
    }

    /* Embedded Quick Preference Controls (Sleek Inline Toggle) */
    #${idPrefix}-preferences-dock {
      padding: 8px 12px;
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    #${idPrefix}-pref-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      flex-grow: 1;
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      cursor: pointer;
      font-size: calc(var(--font-base) - 2px);
      font-weight: 600;
      color: var(--text-secondary);
      transition: all 0.2s ease;
      outline: none;
    }

    #${idPrefix}-pref-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
      border-color: var(--text-muted);
    }

    /* Dynamic Custom Tooltip Scope */
    #${idPrefix}-tooltip {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      ${direction === 'rtl' ? 'right: calc(100% + 12px);' : 'left: calc(100% + 12px);'}
      background: var(--tooltip-bg);
      color: var(--tooltip-text);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      pointer-events: none;
      z-index: calc(var(--${idPrefix}-z-index) + 50);
      opacity: 0;
      animation: ${idPrefix}-anim-fade 0.18s forwards;
    }

    #${idPrefix}-tooltip::before {
      content: '';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      border: 5px solid transparent;
      ${direction === 'rtl' ? `
        left: 100%;
        border-left-color: var(--tooltip-bg);
      ` : `
        right: 100%;
        border-right-color: var(--tooltip-bg);
      `}
    }

    /* Accessibility Focus Ring outline rules */
    #${idPrefix}-container *:focus-visible {
      outline: 2px solid var(--accent-primary);
      outline-offset: 2px;
    }
  `;

  return (
    <div id={`${idPrefix}-container`} ref={dropdownRef} className="relative inline-block select-none">
      {/* Inject Compile Custom CSS Rules */}
      <style dangerouslySetInnerHTML={{ __html: compiledCss }} />

      {/* Target trigger button */}
      <button
        id={`${idPrefix}-trigger-btn`}
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={`${idPrefix}-menu-panel`}
        title="Open user profile settings"
      >
        <div id={`${idPrefix}-avatar-wrapper`}>
          {!avatarUrl || avatarFailed ? (
            <div
              id={`${idPrefix}-avatar-placeholder`}
              style={{ backgroundColor: avatarBgColor }}
              title={userName}
            >
              {initials}
            </div>
          ) : (
            <img
              id={`${idPrefix}-avatar-img`}
              src={avatarUrl}
              alt={userName}
              referrerPolicy="no-referrer"
              onError={() => setAvatarFailed(true)}
            />
          )}
          <div
            id={`${idPrefix}-status-dot`}
            style={{ backgroundColor: statusDetails[currentStatus].color }}
          />
        </div>
        
        <div id={`${idPrefix}-trigger-info`} className="hidden sm:flex">
          <span id={`${idPrefix}-trigger-name`}>{userName}</span>
          <span id={`${idPrefix}-trigger-role`}>{userRole}</span>
        </div>

        <Icons.ChevronDown
          id={`${idPrefix}-trigger-chevron`}
          size={16}
          className={isOpen ? 'open' : ''}
        />
      </button>

      {/* Floating Panel drop down with customized Animation classes and dynamic Z-Index */}
      {isOpen && (
        <div
          id={`${idPrefix}-menu-panel`}
          className={`anim-${animationType}`}
          role="menu"
          aria-label="User Profile Options Menu"
        >
          {/* 1. Identity Header */}
          <div id={`${idPrefix}-identity-header`}>
            {!avatarUrl || headerAvatarFailed ? (
              <div
                id={`${idPrefix}-identity-avatar-placeholder`}
                style={{ backgroundColor: avatarBgColor }}
              >
                {initials}
              </div>
            ) : (
              <img
                id={`${idPrefix}-identity-avatar`}
                src={avatarUrl}
                alt={`${userName} Profile`}
                referrerPolicy="no-referrer"
                onError={() => setHeaderAvatarFailed(true)}
              />
            )}
            <div id={`${idPrefix}-identity-details`}>
              <div id={`${idPrefix}-identity-name`}>{userName}</div>
              <div id={`${idPrefix}-identity-email`}>{userEmail}</div>
              <div id={`${idPrefix}-identity-role`}>{userRole}</div>
            </div>
          </div>

          {/* 2. Quick Status Changer */}
          {showQuickStatus && (
            <div id={`${idPrefix}-status-bar`}>
              <div id={`${idPrefix}-status-title`}>Set Attendance Status</div>
              <div id={`${idPrefix}-status-options`}>
                {(['online', 'away', 'busy', 'offline'] as const).map((st) => (
                  <button
                    key={st}
                    id={`${idPrefix}-status-btn`}
                    className={currentStatus === st ? 'active' : ''}
                    onClick={() => handleStatusChange(st)}
                    title={statusDetails[st].text}
                  >
                    <span
                      id={`${idPrefix}-status-dot-indicator`}
                      style={{ backgroundColor: statusDetails[st].color }}
                    />
                    <span id={`${idPrefix}-status-text`}>{statusDetails[st].label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. ERP KPI Stats Block */}
          {showStats && (
            <div id={`${idPrefix}-stats-block`}>
              <div id={`${idPrefix}-stats-grid`}>
                {stats.map((stat, idx) => (
                  <div key={idx} id={`${idPrefix}-stat-card`}>
                    <div id={`${idPrefix}-stat-value`} style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                    <div id={`${idPrefix}-stat-label`} title={stat.label}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Action Groups with Tooltips */}
          <div id={`${idPrefix}-menu-scroller`}>
            {menuGroups.map((group, groupIdx) => (
              <div key={groupIdx} id={`${idPrefix}-menu-group`}>
                <div id={`${idPrefix}-group-title`}>{group.title}</div>
                {group.items.map((item, itemIdx) => {
                  const isFocused =
                    focusedIndex &&
                    focusedIndex.group === groupIdx &&
                    focusedIndex.item === itemIdx;

                  return (
                    <div
                      key={item.actionId}
                      id={`${idPrefix}-menu-item`}
                      className={isFocused ? 'focused' : ''}
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => handleItemClick(item)}
                      onMouseEnter={() => {
                        setFocusedIndex({ group: groupIdx, item: itemIdx });
                        if (item.tooltip) {
                          setActiveTooltip(item.actionId);
                        }
                      }}
                      onMouseLeave={() => {
                        setActiveTooltip(null);
                      }}
                    >
                      <span id={`${idPrefix}-menu-item-icon`}>
                        <DynamicIcon name={item.icon} size={16} />
                      </span>
                      
                      <span id={`${idPrefix}-menu-item-label`}>
                        {item.label}
                      </span>

                      {item.badge && (
                        <span
                          id={`${idPrefix}-menu-item-badge`}
                          style={{ backgroundColor: item.badgeColor || '#3b82f6' }}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Tooltip implementation */}
                      {activeTooltip === item.actionId && item.tooltip && (
                        <div id={`${idPrefix}-tooltip`}>
                          {item.tooltip}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* 5. Sleek Embedded Preferences Quick Switches */}
          <div id={`${idPrefix}-preferences-dock`}>
            {/* Theme Toggle Button */}
            <button
              id={`${idPrefix}-pref-btn`}
              onClick={() =>
                onConfigChange((prev) => ({
                  ...prev,
                  theme: prev.theme === 'light' ? 'dark' : 'light',
                }))
              }
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
            >
              {theme === 'light' ? (
                <>
                  <Icons.Moon size={14} />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Icons.Sun size={14} />
                  <span>Light Mode</span>
                </>
              )}
            </button>

            {/* Direction Toggle Button */}
            <button
              id={`${idPrefix}-pref-btn`}
              onClick={() =>
                onConfigChange((prev) => ({
                  ...prev,
                  direction: prev.direction === 'ltr' ? 'rtl' : 'ltr',
                }))
              }
              title={`Switch direction to ${direction === 'ltr' ? 'RTL' : 'LTR'}`}
            >
              <Icons.Languages size={14} />
              <span>{direction === 'ltr' ? 'RTL (العربية)' : 'LTR (English)'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
