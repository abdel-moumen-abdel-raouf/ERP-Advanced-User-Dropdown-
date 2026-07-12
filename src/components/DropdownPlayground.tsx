import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { ERPDropdownConfig, DEFAULT_CONFIG, ERPDropdownItem, ERPUserStat, ERPDropdownGroup } from '../types';
import { ERPDropdown } from './ERPDropdown';

export const DropdownPlayground: React.FC = () => {
  const [config, setConfig] = useState<ERPDropdownConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [codeTab, setCodeTab] = useState<'ts' | 'html' | 'scss'>('ts');
  const [eventLog, setEventLog] = useState<Array<{ id: string; time: string; msg: string }>>([
    { id: '1', time: new Date().toLocaleTimeString(), msg: 'ERP Dropdown Sandbox Initialized.' },
  ]);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Quick State editing tools
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemIcon, setNewItemIcon] = useState('Settings');
  const [newItemTooltip, setNewItemTooltip] = useState('');
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

  const handleConfigChange = (updater: (prev: ERPDropdownConfig) => ERPDropdownConfig) => {
    setConfig(updater);
  };

  const handleActionTriggered = (actionId: string, label: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog((prev) => [
      { id: Date.now().toString(), time: timestamp, msg: `Action Triggered: [${actionId}] ("${label}")` },
      ...prev.slice(0, 19), // keep last 20 logs
    ]);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(type);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const clearLogs = () => {
    setEventLog([{ id: Date.now().toString(), time: new Date().toLocaleTimeString(), msg: 'Logs cleared.' }]);
  };

  // Add Item to Group dynamically
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemLabel) return;

    const actionId = newItemLabel.toLowerCase().replace(/\s+/g, '-');
    const newItem: ERPDropdownItem = {
      label: newItemLabel,
      icon: newItemIcon,
      tooltip: newItemTooltip || undefined,
      actionId,
    };

    setConfig((prev) => {
      const updatedGroups = [...prev.menuGroups];
      updatedGroups[selectedGroupIndex] = {
        ...updatedGroups[selectedGroupIndex],
        items: [...updatedGroups[selectedGroupIndex].items, newItem],
      };
      return { ...prev, menuGroups: updatedGroups };
    });

    setNewItemLabel('');
    setNewItemTooltip('');
    handleActionTriggered('system-add-item', `Added dynamic menu item: "${newItemLabel}"`);
  };

  const handleRemoveItem = (groupIndex: number, itemIndex: number) => {
    setConfig((prev) => {
      const updatedGroups = [...prev.menuGroups];
      const updatedItems = [...updatedGroups[groupIndex].items];
      const removed = updatedItems.splice(itemIndex, 1)[0];
      updatedGroups[groupIndex] = {
        ...updatedGroups[groupIndex],
        items: updatedItems,
      };
      handleActionTriggered('system-remove-item', `Removed menu item: "${removed.label}"`);
      return { ...prev, menuGroups: updatedGroups };
    });
  };

  const resetToDefault = () => {
    setConfig(DEFAULT_CONFIG);
    handleActionTriggered('system-reset', 'Configuration reset to enterprise default values.');
  };

  // Generate dynamic Angular 20+ ts component file
  const generateAngularTs = () => {
    return `import { Component, Input, Output, EventEmitter, HostListener, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ERP Advanced User Dropdown Component
 * Designed for High-Performance enterprise environments
 * Generates dynamic IDs to prevent stylesheet collision
 * Supports theme variants, RTL orientation, and adaptive densities
 */

export interface ERPUserStat {
  label: string;
  value: string;
  color: string;
}

export interface ERPDropdownItem {
  label: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  actionId: string;
  tooltip?: string;
}

export interface ERPDropdownGroup {
  title: string;
  items: ERPDropdownItem[];
}

@Component({
  selector: 'erp-user-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.scss']
})
export class ERPUserDropdownComponent {
  /** Unique ID prefix to avoid stylesheet conflicts */
  @Input() idPrefix: string = '${config.idPrefix}';
  @Input() theme: 'light' | 'dark' = '${config.theme}';
  @Input() direction: 'ltr' | 'rtl' = '${config.direction}';
  @Input() zIndex: number = ${config.zIndex};
  @Input() animationType: 'fade' | 'slide' | 'scale' | 'bounce' | 'flip' = '${config.animationType}';
  @Input() animationDuration: number = ${config.animationDuration}; // ms
  @Input() density: 'compact' | 'standard' | 'spacious' = '${config.density}';
  @Input() showStats: boolean = ${config.showStats};
  @Input() showQuickStatus: boolean = ${config.showQuickStatus};
  
  @Input() userName: string = '${config.userName}';
  @Input() userRole: string = '${config.userRole}';
  @Input() userEmail: string = '${config.userEmail}';
  @Input() avatarUrl: string = '${config.avatarUrl}';
  @Input() currentStatus: 'online' | 'away' | 'busy' | 'offline' = '${config.currentStatus}';

  @Input() stats: ERPUserStat[] = ${JSON.stringify(config.stats, null, 2)};

  @Input() menuGroups: ERPDropdownGroup[] = ${JSON.stringify(config.menuGroups, null, 2)};

  /** Emit selected actions to parent ERP frame */
  @Output() onAction = new EventEmitter<{ actionId: string, label: string }>();

  /** State variables using Angular 20 Signals for change detection optimization */
  public isOpen = signal<boolean>(false);
  public activeTooltip = signal<string | null>(null);
  public focusedGroupIndex = signal<number | null>(null);
  public focusedItemIndex = signal<number | null>(null);

  /** Helper to map statuses */
  public statusDetails = {
    online: { label: 'Online', color: '#22c55e', text: 'Active on system' },
    away: { label: 'Away', color: '#eab308', text: 'Idle / Temporary stepped out' },
    busy: { label: 'Do Not Disturb', color: '#ef4444', text: 'In meeting / Focused session' },
    offline: { label: 'Offline', color: '#64748b', text: 'Invisible status' }
  };

  /** Toggle active state */
  public toggleDropdown(): void {
    this.isOpen.update(val => !val);
  }

  /** Close active state */
  public closeDropdown(): void {
    this.isOpen.set(false);
    this.activeTooltip.set(null);
  }

  /** Change status with dynamic output */
  public changeStatus(status: 'online' | 'away' | 'busy' | 'offline'): void {
    this.currentStatus = status;
    this.onAction.emit({ actionId: 'status-' + status, label: 'Status: ' + status });
  }

  /** Handle item selection and close panel */
  public selectItem(item: ERPDropdownItem): void {
    this.onAction.emit({ actionId: item.actionId, label: item.label });
    this.closeDropdown();
  }

  /** Handle Tooltip trigger */
  public showTooltip(itemId: string): void {
    this.activeTooltip.set(itemId);
  }

  public hideTooltip(): void {
    this.activeTooltip.set(null);
  }

  /** Listen for outer clicks to close dropdown */
  @HostListener('document:click', ['$event'])
  public onClickOutside(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    // Check if click originates inside the host component
    const clickedInside = targetElement.closest('#' + this.idPrefix + '-container');
    if (!clickedInside) {
      this.closeDropdown();
    }
  }

  /** Keyboard Accessibility (WAI-ARIA) support */
  @HostListener('keydown', ['$event'])
  public handleKeyboardEvents(event: KeyboardEvent): void {
    if (!this.isOpen()) return;

    if (event.key === 'Escape') {
      this.closeDropdown();
      return;
    }

    // Flatten items list for sequential navigation
    const flatItems: Array<{ gIdx: number, iIdx: number, item: ERPDropdownItem }> = [];
    this.menuGroups.forEach((group, gIdx) => {
      group.items.forEach((item, iIdx) => {
        flatItems.push({ gIdx, iIdx, item });
      });
    });

    if (flatItems.length === 0) return;

    let currentIdx = flatItems.findIndex(
      f => this.focusedGroupIndex() === f.gIdx && this.focusedItemIndex() === f.iIdx
    );

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIdx = (currentIdx + 1) % flatItems.length;
      this.focusedGroupIndex.set(flatItems[nextIdx].gIdx);
      this.focusedItemIndex.set(flatItems[nextIdx].iIdx);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIdx = (currentIdx - 1 + flatItems.length) % flatItems.length;
      this.focusedGroupIndex.set(flatItems[prevIdx].gIdx);
      this.focusedItemIndex.set(flatItems[prevIdx].iIdx);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (currentIdx !== -1) {
        this.selectItem(flatItems[currentIdx].item);
      } else {
        // focus first
        this.focusedGroupIndex.set(0);
        this.focusedItemIndex.set(0);
      }
    }
  }
}
`;
  };

  // Generate dynamic HTML Template with modern Angular 20+ control flow
  const generateAngularHtml = () => {
    return `<!-- ERP Advanced Dropdown Template -->
<div [id]="idPrefix + '-container'" [attr.dir]="direction" [style.--idPrefix-z-index]="zIndex" style="position: relative; display: inline-block;">

  <!-- Dynamic User Menu Trigger -->
  <button 
    [id]="idPrefix + '-trigger-btn'"
    (click)="toggleDropdown()"
    [attr.aria-expanded]="isOpen()"
    aria-haspopup="true"
    [attr.aria-controls]="idPrefix + '-menu-panel'"
    title="Open user profile menu"
  >
    <div [id]="idPrefix + '-avatar-wrapper'">
      <img 
        [id]="idPrefix + '-avatar-img'" 
        [src]="avatarUrl" 
        [alt]="userName"
      />
      <div 
        [id]="idPrefix + '-status-dot'"
        [style.background-color]="statusDetails[currentStatus].color"
      ></div>
    </div>
    
    <div [id]="idPrefix + '-trigger-info'" class="desktop-only-info">
      <span [id]="idPrefix + '-trigger-name'">{{ userName }}</span>
      <span [id]="idPrefix + '-trigger-role'">{{ userRole }}</span>
    </div>

    <!-- Arrow Icon -->
    <svg [id]="idPrefix + '-trigger-chevron'" [class.open]="isOpen()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </button>

  <!-- Animated Menu Panel (Rendered dynamically using Angular 20 Control Flow) -->
  @if (isOpen()) {
    <div 
      [id]="idPrefix + '-menu-panel'"
      [className]="'anim-' + animationType"
      [style.animation-duration.ms]="animationDuration"
      role="menu"
      [attr.aria-label]="userName + ' Profile Options'"
    >
      
      <!-- Section 1: User Profile Details Header -->
      <div [id]="idPrefix + '-identity-header'">
        <img 
          [id]="idPrefix + '-identity-avatar'"
          [src]="avatarUrl"
          [alt]="userName"
        />
        <div [id]="idPrefix + '-identity-details'">
          <div [id]="idPrefix + '-identity-name'">{{ userName }}</div>
          <div [id]="idPrefix + '-identity-email'">{{ userEmail }}</div>
          <div [id]="idPrefix + '-identity-role'">{{ userRole }}</div>
        </div>
      </div>

      <!-- Section 2: ERP Status Quick Selector -->
      @if (showQuickStatus) {
        <div [id]="idPrefix + '-status-bar'">
          <div [id]="idPrefix + '-status-title'">Set Attendance Status</div>
          <div [id]="idPrefix + '-status-options'">
            <button 
              [id]="idPrefix + '-status-btn'" 
              [class.active]="currentStatus === 'online'"
              (click)="changeStatus('online')"
              title="Set status to Active Online"
            >
              <span [id]="idPrefix + '-status-dot-indicator'" style="background-color: #22c55e"></span>
              <span [id]="idPrefix + '-status-text'">Online</span>
            </button>
            <button 
              [id]="idPrefix + '-status-btn'" 
              [class.active]="currentStatus === 'away'"
              (click)="changeStatus('away')"
              title="Set status to Away"
            >
              <span [id]="idPrefix + '-status-dot-indicator'" style="background-color: #eab308"></span>
              <span [id]="idPrefix + '-status-text'">Away</span>
            </button>
            <button 
              [id]="idPrefix + '-status-btn'" 
              [class.active]="currentStatus === 'busy'"
              (click)="changeStatus('busy')"
              title="Set status to Do Not Disturb"
            >
              <span [id]="idPrefix + '-status-dot-indicator'" style="background-color: #ef4444"></span>
              <span [id]="idPrefix + '-status-text'">DND</span>
            </button>
            <button 
              [id]="idPrefix + '-status-btn'" 
              [class.active]="currentStatus === 'offline'"
              (click)="changeStatus('offline')"
              title="Set status to Offline"
            >
              <span [id]="idPrefix + '-status-dot-indicator'" style="background-color: #64748b"></span>
              <span [id]="idPrefix + '-status-text'">Offline</span>
            </button>
          </div>
        </div>
      }

      <!-- Section 3: ERP KPIs Quick Stats -->
      @if (showStats) {
        <div [id]="idPrefix + '-stats-block'">
          <div [id]="idPrefix + '-stats-grid'">
            @for (stat of stats; track stat.label) {
              <div [id]="idPrefix + '-stat-card'">
                <div [id]="idPrefix + '-stat-value'" [style.color]="stat.color">{{ stat.value }}</div>
                <div [id]="idPrefix + '-stat-label'">{{ stat.label }}</div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Section 4: Navigational Groups list -->
      <div [id]="idPrefix + '-menu-scroller'">
        @for (group of menuGroups; track group.title; let gIdx = $index) {
          <div [id]="idPrefix + '-menu-group'">
            <div [id]="idPrefix + '-group-title'">{{ group.title }}</div>
            
            @for (item of group.items; track item.actionId; let iIdx = $index) {
              <div 
                [id]="idPrefix + '-menu-item'"
                [class.focused]="focusedGroupIndex() === gIdx && focusedItemIndex() === iIdx"
                role="menuitem"
                tabIndex="0"
                (click)="selectItem(item)"
                (mouseenter)="focusedGroupIndex.set(gIdx); focusedItemIndex.set(iIdx); showTooltip(item.actionId)"
                (mouseleave)="hideTooltip()"
                (keydown.enter)="selectItem(item)"
              >
                <!-- Custom Dynamic Icon Holder -->
                <span [id]="idPrefix + '-menu-item-icon'">
                  <!-- Inside production ERP, load icon components by name -->
                  <i [className]="'lucide-icon icon-' + item.icon"></i>
                </span>

                <span [id]="idPrefix + '-menu-item-label'">{{ item.label }}</span>

                @if (item.badge) {
                  <span 
                    [id]="idPrefix + '-menu-item-badge'"
                    [style.background-color]="item.badgeColor || '#3b82f6'"
                  >
                    {{ item.badge }}
                  </span>
                }

                <!-- Dynamic Component Hover Tooltip -->
                @if (activeTooltip() === item.actionId && item.tooltip) {
                  <div [id]="idPrefix + '-tooltip'">
                    {{ item.tooltip }}
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- Section 5: Inline Sleek Quick Toggles (Theme & Direction) -->
      <div [id]="idPrefix + '-preferences-dock'">
        <button 
          [id]="idPrefix + '-pref-btn'"
          (click)="theme = theme === 'light' ? 'dark' : 'light'"
          [title]="'Switch to ' + (theme === 'light' ? 'Dark' : 'Light') + ' theme'"
        >
          <span>{{ theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode' }}</span>
        </button>

        <button 
          [id]="idPrefix + '-pref-btn'"
          (click)="direction = direction === 'ltr' ? 'rtl' : 'ltr'"
          title="Switch direction layout"
        >
          <span>🌐 {{ direction === 'ltr' ? 'RTL' : 'LTR' }}</span>
        </button>
      </div>

    </div>
  }
</div>
`;
  };

  // Generate dynamic, production ready nested SCSS
  const generateAngularScss = () => {
    return `/**
 * ERP Advanced User Dropdown SCSS Styling
 * Theme: "Sleek Interface" - Corporate Premium Style
 * Pure custom styles - 0% Tailwind, Bootstrap or generic library dependence.
 * Targets unique IDs strictly based on idPrefix variables to guarantee zero collision.
 */

/* Layout Constants & Structural Mixins */
$font-stack: 'Inter', system-ui, -apple-system, sans-serif;

/* Component Main ID Container Scoping */
##{$idPrefix}-container {
  font-family: $font-stack;
  box-sizing: border-box;
  display: inline-block;
  position: relative;

  * {
    box-sizing: border-box;
  }

  /* Right-To-Left Support Rules natively compiled */
  &[dir="rtl"] {
    text-align: right;
    
    ##{$idPrefix}-menu-panel {
      left: 0;
      right: auto;
      transform-origin: top left;
    }

    ##{$idPrefix}-trigger-chevron {
      margin-right: auto;
      margin-left: 0;
    }

    ##{$idPrefix}-trigger-info {
      text-align: right;
      align-items: flex-end;
    }

    ##{$idPrefix}-identity-details {
      text-align: right;
    }

    ##{$idPrefix}-group-title {
      text-align: right;
    }

    ##{$idPrefix}-menu-item {
      text-align: right;

      ##{$idPrefix}-tooltip {
        right: calc(100% + 12px);
        left: auto;
        
        &::before {
          left: 100%;
          right: auto;
          border-left-color: var(--tooltip-bg);
          border-right-color: transparent;
        }
      }
    }
  }

  &[dir="ltr"] {
    text-align: left;

    ##{$idPrefix}-menu-panel {
      right: 0;
      left: auto;
      transform-origin: top right;
    }

    ##{$idPrefix}-trigger-chevron {
      margin-left: auto;
      margin-right: 0;
    }

    ##{$idPrefix}-trigger-info {
      text-align: left;
      align-items: flex-start;
    }

    ##{$idPrefix}-identity-details {
      text-align: left;
    }

    ##{$idPrefix}-group-title {
      text-align: left;
    }

    ##{$idPrefix}-menu-item {
      text-align: left;

      ##{$idPrefix}-tooltip {
        left: calc(100% + 12px);
        right: auto;

        &::before {
          right: 100%;
          left: auto;
          border-right-color: var(--tooltip-bg);
          border-left-color: transparent;
        }
      }
    }
  }

  /* Define variables based on config choice in Angular environment */
  /* Theme tokens compiled natively */
  --bg-primary: #{ $config.theme === 'light' ? '#ffffff' : '#0f172a' };
  --bg-secondary: #{ $config.theme === 'light' ? '#f8fafc' : '#1e293b' };
  --bg-hover: #{ $config.theme === 'light' ? '#f1f5f9' : '#334155' };
  --border-color: #{ $config.theme === 'light' ? '#e2e8f0' : '#334155' };
  
  --text-primary: #{ $config.theme === 'light' ? '#0f172a' : '#f8fafc' };
  --text-secondary: #{ $config.theme === 'light' ? '#475569' : '#cbd5e1' };
  --text-muted: #{ $config.theme === 'light' ? '#64748b' : '#94a3b8' };
  --accent-primary: #{ $config.theme === 'light' ? '#2563eb' : '#3b82f6' };
  --accent-hover: #{ $config.theme === 'light' ? '#1d4ed8' : '#60a5fa' };
  --focus-ring-color: #{ $config.theme === 'light' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(59, 130, 246, 0.4)' };
  
  --tooltip-bg: #{ $config.theme === 'light' ? '#0f172a' : '#f8fafc' };
  --tooltip-text: #{ $config.theme === 'light' ? '#f8fafc' : '#0f172a' };
  
  --shadow-elevation: #{ $config.theme === 'light' 
    ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(15, 23, 42, 0.05)' 
    : '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)' };

  /* Density specific dimensions variables */
  --item-padding: #{ $config.density === 'compact' ? '6px 12px' : ($config.density === 'spacious' ? '14px 20px' : '10px 16px') };
  --section-gap: #{ $config.density === 'compact' ? '4px' : ($config.density === 'spacious' ? '10px' : '8px') };
  --font-base: #{ $config.density === 'compact' ? '13px' : ($config.density === 'spacious' ? '15px' : '14px') };
  --avatar-size: #{ $config.density === 'compact' ? '32px' : ($config.density === 'spacious' ? '44px' : '38px') };
  --trigger-padding: #{ $config.density === 'compact' ? '4px 8px' : ($config.density === 'spacious' ? '8px 16px' : '6px 12px') };
  --stats-padding: #{ $config.density === 'compact' ? '8px 12px' : ($config.density === 'spacious' ? '16px 20px' : '12px 16px') };
  --stats-grid-gap: #{ $config.density === 'compact' ? '6px' : ($config.density === 'spacious' ? '12px' : '8px') };

  /* Custom trigger button styling */
  ##{$idPrefix}-trigger-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: var(--trigger-padding);
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    color: var(--text-primary);
    outline: none;

    &:hover {
      background: var(--bg-secondary);
      border-color: var(--accent-primary);
    }

    &:focus {
      box-shadow: 0 0 0 3px var(--focus-ring-color);
    }
  }

  /* Responsive Display utilities */
  .desktop-only-info {
    display: flex;
    flex-direction: column;
    @media (max-width: 640px) {
      display: none; // Hide on small mobile viewport
    }
  }

  /* Avatar with embedded status dot indicators */
  ##{$idPrefix}-avatar-wrapper {
    position: relative;
    width: var(--avatar-size);
    height: var(--avatar-size);

    ##{$idPrefix}-avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--border-color);
    }

    ##{$idPrefix}-status-dot {
      position: absolute;
      bottom: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--bg-primary);
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.15);
    }
  }

  ##{$idPrefix}-trigger-name {
    font-weight: 600;
    font-size: var(--font-base);
    line-height: 1.2;
  }

  ##{$idPrefix}-trigger-role {
    font-size: calc(var(--font-base) - 2px);
    color: var(--text-muted);
  }

  ##{$idPrefix}-trigger-chevron {
    color: var(--text-muted);
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    
    &.open {
      transform: rotate(180deg);
    }
  }

  /* Core Dropdown Panel block */
  ##{$idPrefix}-menu-panel {
    position: absolute;
    top: 100%;
    margin-top: 6px;
    width: 320px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    box-shadow: var(--shadow-elevation);
    z-index: var(--idPrefix-z-index);
    overflow: hidden;
    animation-fill-mode: both;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);

    /* Animation variants */
    &.anim-fade { animation-name: erp-anim-fade; }
    &.anim-slide { animation-name: erp-anim-slide; }
    &.anim-scale { animation-name: erp-anim-scale; }
    &.anim-bounce { animation-name: erp-anim-bounce; }
    &.anim-flip { animation-name: erp-anim-flip; }
  }

  /* Identity Details Header */
  ##{$idPrefix}-identity-header {
    padding: var(--stats-padding);
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 12px;

    ##{$idPrefix}-identity-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--accent-primary);
    }

    ##{$idPrefix}-identity-details {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      min-width: 0;
    }

    ##{$idPrefix}-identity-name {
      font-weight: 700;
      color: var(--text-primary);
      font-size: var(--font-base);
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    ##{$idPrefix}-identity-email {
      color: var(--text-muted);
      font-size: calc(var(--font-base) - 2px);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    ##{$idPrefix}-identity-role {
      font-size: calc(var(--font-base) - 3px);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent-primary);
      font-weight: 600;
      margin-top: 2px;
    }
  }

  /* Quick Status Bar */
  ##{$idPrefix}-status-bar {
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-primary);
    display: flex;
    flex-direction: column;
    gap: 6px;

    ##{$idPrefix}-status-title {
      font-size: calc(var(--font-base) - 3px);
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.04em;
    }

    ##{$idPrefix}-status-options {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
    }

    ##{$idPrefix}-status-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 6px 2px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      cursor: pointer;
      transition: all 0.15s ease;
      outline: none;

      &:hover {
        background: var(--bg-hover);
        border-color: var(--text-muted);
      }

      &.active {
        background: var(--bg-primary);
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
      }

      ##{$idPrefix}-status-dot-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-bottom: 4px;
      }

      ##{$idPrefix}-status-text {
        font-size: calc(var(--font-base) - 4px);
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }

  /* Stats Block */
  ##{$idPrefix}-stats-block {
    padding: var(--stats-padding);
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);

    ##{$idPrefix}-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--stats-grid-gap);
    }

    ##{$idPrefix}-stat-card {
      padding: 8px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      text-align: center;
      transition: border-color 0.15s;

      &:hover {
        border-color: var(--accent-primary);
      }

      ##{$idPrefix}-stat-value {
        font-size: var(--font-base);
        font-weight: 700;
        line-height: 1.1;
      }

      ##{$idPrefix}-stat-label {
        font-size: calc(var(--font-base) - 4px);
        color: var(--text-muted);
        margin-top: 2px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  /* Scrollable list content */
  ##{$idPrefix}-menu-scroller {
    max-height: 280px;
    overflow-y: auto;
    padding: 6px;
  }

  ##{$idPrefix}-menu-group {
    margin-bottom: var(--section-gap);
    &:last-child { margin-bottom: 0; }

    ##{$idPrefix}-group-title {
      font-size: calc(var(--font-base) - 3px);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      padding: 6px 12px;
    }
  }

  /* List navigation items */
  ##{$idPrefix}-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: var(--item-padding);
    border-radius: 6px;
    color: var(--text-secondary);
    font-size: var(--font-base);
    font-weight: 500;
    cursor: pointer;
    position: relative;
    transition: all 0.15s ease;
    border: 1px solid transparent;
    outline: none;

    &:hover, &.focused {
      background: var(--bg-hover);
      color: var(--text-primary);
      border-color: var(--border-color);
    }

    ##{$idPrefix}-menu-item-icon {
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &:hover ##{$idPrefix}-menu-item-icon, &.focused ##{$idPrefix}-menu-item-icon {
      color: var(--accent-primary);
    }

    ##{$idPrefix}-menu-item-label {
      flex-grow: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    ##{$idPrefix}-menu-item-badge {
      font-size: calc(var(--font-base) - 4px);
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 10px;
      color: #ffffff;
      line-height: 1;
    }

    /* Embedded Dynamic Tooltip */
    ##{$idPrefix}-tooltip {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: var(--tooltip-bg);
      color: var(--tooltip-text);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.18);
      pointer-events: none;
      z-index: 99;
      opacity: 0;
      animation: erp-anim-fade 0.15s forwards;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        border: 5px solid transparent;
      }
    }
  }

  /* Preference Switchers Dock */
  ##{$idPrefix}-preferences-dock {
    padding: 8px 12px;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    ##{$idPrefix}-pref-btn {
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

      &:hover {
        background: var(--bg-hover);
        color: var(--text-primary);
        border-color: var(--text-muted);
      }
    }
  }
}

/* Animations declarations */
@keyframes erp-anim-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes erp-anim-slide {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes erp-anim-scale {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes erp-anim-bounce {
  0% { opacity: 0; transform: scale(0.85); }
  70% { transform: scale(1.04); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes erp-anim-flip {
  from { opacity: 0; transform: perspective(400px) rotateX(-12deg); }
  to { opacity: 1; transform: perspective(400px) rotateX(0deg); }
}
`;
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      
      {/* Decorative ambient background blur orbs for Frosted Glass theme */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Dynamic Header with premium Frosted Glass styling */}
      <header className="border-b border-white/10 bg-slate-950/45 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 backdrop-blur-xl relative">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/80 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 text-white backdrop-blur-sm border border-white/10">
            <Icons.Layers size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              ERP Enterprise user Dropdown Panel
              <span className="text-xs bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20 backdrop-blur-md">
                Angular 20+ Ready
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Sleek Interface Variant • Interactive Sandbox Playground
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 transition-all border border-white/10 backdrop-blur-md"
          >
            <Icons.RefreshCw size={12} />
            <span>Reset Default Sandbox</span>
          </button>
          
          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'preview'
                  ? 'bg-blue-600/80 text-white shadow-md border border-white/10'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Icons.Eye size={13} />
              <span>Interactive UI</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'code'
                  ? 'bg-blue-600/80 text-white shadow-md border border-white/10'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Icons.Code size={13} />
              <span>Source Exporter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden relative z-10">
        
        {/* LEFT COLUMN: Deep Settings Customizer (4 cols) with Frosted Glass styling */}
        <aside className="lg:col-span-4 bg-slate-950/25 backdrop-blur-md border-r border-white/10 p-6 overflow-y-auto max-h-[calc(100vh-73px)] space-y-6 relative">
          
          {/* Section: Core Directives & IDs */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Icons.Sliders size={12} className="text-blue-400" />
              <span>Identity & Scope Prefix</span>
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>Unique Component ID Prefix</span>
                  <span className="text-[10px] text-amber-500 font-mono">Avoids Collision</span>
                </label>
                <input
                  type="text"
                  value={config.idPrefix}
                  onChange={(e) =>
                    handleConfigChange((prev) => ({
                      ...prev,
                      idPrefix: e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''),
                    }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. erp-nav-panel"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Theme Setting</label>
                  <div className="grid grid-cols-2 bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                    <button
                      onClick={() => handleConfigChange((prev) => ({ ...prev, theme: 'light' }))}
                      className={`py-1 text-center rounded text-xs font-semibold transition-all ${
                        config.theme === 'light' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => handleConfigChange((prev) => ({ ...prev, theme: 'dark' }))}
                      className={`py-1 text-center rounded text-xs font-semibold transition-all ${
                        config.theme === 'dark' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Layout Direction</label>
                  <div className="grid grid-cols-2 bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                    <button
                      onClick={() => handleConfigChange((prev) => ({ ...prev, direction: 'ltr' }))}
                      className={`py-1 text-center rounded text-xs font-semibold transition-all ${
                        config.direction === 'ltr' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      LTR
                    </button>
                    <button
                      onClick={() => handleConfigChange((prev) => ({ ...prev, direction: 'rtl' }))}
                      className={`py-1 text-center rounded text-xs font-semibold transition-all ${
                        config.direction === 'rtl' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      RTL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Visual Styling parameters */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Icons.Layers size={12} className="text-purple-500" />
              <span>Animations & Positioning</span>
            </h2>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Dropdown Z-Index</label>
                  <input
                    type="number"
                    value={config.zIndex}
                    onChange={(e) =>
                      handleConfigChange((prev) => ({ ...prev, zIndex: Number(e.target.value) || 1000 }))
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="1"
                    max="99999"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Density Scale</label>
                  <select
                    value={config.density}
                    onChange={(e) =>
                      handleConfigChange((prev) => ({
                        ...prev,
                        density: e.target.value as 'compact' | 'standard' | 'spacious',
                      }))
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="compact">Compact (ERP High Density)</option>
                    <option value="standard">Standard Default</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Active Transition Animation</label>
                <select
                  value={config.animationType}
                  onChange={(e) =>
                    handleConfigChange((prev) => ({
                      ...prev,
                      animationType: e.target.value as any,
                    }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="fade">Fade In</option>
                  <option value="slide">Slide Down & Fade</option>
                  <option value="scale">Sleek Scale Popup</option>
                  <option value="bounce">Bounce Back Effect</option>
                  <option value="flip">3D Orthogonal Flip</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex justify-between">
                  <span>Animation Speed Duration</span>
                  <span className="font-mono text-blue-400 text-xs">{config.animationDuration}ms</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="1200"
                  step="25"
                  value={config.animationDuration}
                  onChange={(e) =>
                    handleConfigChange((prev) => ({ ...prev, animationDuration: Number(e.target.value) }))
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.showStats}
                    onChange={(e) =>
                      handleConfigChange((prev) => ({ ...prev, showStats: e.target.checked }))
                    }
                    className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-300">Show KPI Stats Grid</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.showQuickStatus}
                    onChange={(e) =>
                      handleConfigChange((prev) => ({ ...prev, showQuickStatus: e.target.checked }))
                    }
                    className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-300">Show Quick Status Box</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section: User Profile Attributes */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Icons.User size={12} className="text-emerald-500" />
              <span>Enterprise User Identity</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Full User Name</label>
                <input
                  type="text"
                  value={config.userName}
                  onChange={(e) =>
                    handleConfigChange((prev) => ({ ...prev, userName: e.target.value }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Active Corporate Role</label>
                <input
                  type="text"
                  value={config.userRole}
                  onChange={(e) =>
                    handleConfigChange((prev) => ({ ...prev, userRole: e.target.value }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Enterprise Email Address</label>
                <input
                  type="email"
                  value={config.userEmail}
                  onChange={(e) =>
                    handleConfigChange((prev) => ({ ...prev, userEmail: e.target.value }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Profile Photo (Unsplash URL)</label>
                <input
                  type="text"
                  value={config.avatarUrl}
                  onChange={(e) =>
                    handleConfigChange((prev) => ({ ...prev, avatarUrl: e.target.value }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-300 focus:outline-none"
                />
                <div className="flex gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => handleConfigChange((prev) => ({ ...prev, avatarUrl: '' }))}
                    className="flex-1 text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-1.5 py-1 rounded border border-rose-500/20 transition text-center font-semibold"
                  >
                    Clear URL
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfigChange((prev) => ({ ...prev, userName: 'محمد أحمد', avatarUrl: '' }))}
                    className="flex-1 text-[10px] bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 px-1.5 py-1 rounded border border-teal-500/20 transition text-center font-semibold"
                  >
                    Try Arabic
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfigChange((prev) => ({ ...prev, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250' }))}
                    className="flex-1 text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 px-1.5 py-1 rounded border border-blue-500/20 transition text-center font-semibold"
                  >
                    Reset Photo
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  If the photo is empty or fails to load, a Google-style initials avatar (supports Arabic & English) with a stable colored background is generated.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Dynamic Actions Group Creator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Icons.Plus size={12} className="text-amber-500" />
                <span>Add Dynamic Action Item</span>
              </h2>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Select Group Section</label>
                <select
                  value={selectedGroupIndex}
                  onChange={(e) => setSelectedGroupIndex(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none"
                >
                  {config.menuGroups.map((group, idx) => (
                    <option key={idx} value={idx}>
                      {group.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Action Name Label</label>
                <input
                  type="text"
                  placeholder="e.g. Audit Ledger"
                  value={newItemLabel}
                  onChange={(e) => setNewItemLabel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Lucide Icon</label>
                  <select
                    value={newItemIcon}
                    onChange={(e) => setNewItemIcon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
                  >
                    <option value="Settings">Settings</option>
                    <option value="ShieldAlert">Shield Alert</option>
                    <option value="Briefcase">Briefcase</option>
                    <option value="FileCheck">File Check</option>
                    <option value="BarChart3">Bar Chart</option>
                    <option value="Activity">Activity Log</option>
                    <option value="HelpCircle">Help Circle</option>
                    <option value="GitMerge">Git Merge</option>
                    <option value="LogOut">Sign Out</option>
                    <option value="Sparkles">Sparkles AI</option>
                    <option value="TrendingUp">Trending Up</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Accessibility Tooltip</label>
                  <input
                    type="text"
                    placeholder="Short description"
                    value={newItemTooltip}
                    onChange={(e) => setNewItemTooltip(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 font-semibold text-white rounded-lg py-2 transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <Icons.Plus size={14} />
                <span>Insert Menu Item</span>
              </button>
            </form>
          </div>

        </aside>

        {/* RIGHT COLUMN: Interactive Frame OR Code Export (8 cols) with exquisite frosted styling */}
        <main className="lg:col-span-8 bg-transparent p-6 flex flex-col max-h-[calc(100vh-73px)] overflow-y-auto relative">
          
          {activeTab === 'preview' ? (
            <div className="flex-grow flex flex-col space-y-6">
              
              {/* ERP Simulation Dashboard Frame with our Dropdown Component inside (FROSTED GLASS EFFECT) */}
              <div 
                className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl flex flex-col min-h-[540px] relative"
                dir={config.direction}
              >
                
                {/* Simulated ERP Window bar Header */}
                <div className="bg-slate-950/50 backdrop-blur-lg border-b border-white/10 px-5 py-3.5 flex items-center justify-between relative z-20 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500 block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 block"></span>
                    <span className={`text-xs text-slate-500 font-mono ${config.direction === 'rtl' ? 'mr-2' : 'ml-2'}`}>ACME ERP GLOBAL INTERFACE</span>
                  </div>

                  {/* NAV BAR PREVIEW CONTAINER */}
                  <div className="flex items-center gap-4">
                    {/* Fake elements in ERP header */}
                    <div className={`hidden md:flex items-center gap-2.5 text-slate-400 text-xs font-semibold ${
                      config.direction === 'rtl' 
                        ? 'ml-2 border-l border-white/10 pl-4' 
                        : 'mr-2 border-r border-white/10 pr-4'
                    }`}>
                      <span className="hover:text-white cursor-pointer transition-colors">Vouchers</span>
                      <span className="hover:text-white cursor-pointer transition-colors">GL Ledgers</span>
                      <span className="hover:text-white cursor-pointer transition-colors">Audits</span>
                    </div>

                    <button className="text-slate-400 hover:text-white relative p-1.5" title="Enterprise notifications">
                      <Icons.Sparkles size={16} />
                      <span className={`absolute top-0 ${config.direction === 'rtl' ? 'left-0' : 'right-0'} w-2 h-2 bg-blue-500 rounded-full animate-ping`}></span>
                    </button>

                    {/* ERP Dropdown Target */}
                    <ERPDropdown
                      config={config}
                      onConfigChange={handleConfigChange}
                      onActionTriggered={handleActionTriggered}
                    />
                  </div>
                </div>

                {/* Simulated Dashboard content for Sleek Interface theme */}
                <div className="flex-grow p-6 bg-transparent relative flex flex-col justify-between">
                  
                  {/* Explanatory notes banner inside frame */}
                  <div className="space-y-4 max-w-xl">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 text-xs font-semibold text-blue-400 backdrop-blur-md">
                      <Icons.Sparkles size={12} className="animate-spin" />
                      <span>Sleek ERP Environment</span>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight text-white">
                      ERP Corporate User Navigation
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      This sandbox replicates how the dropdown mounts inside a global ERP navbar layout. 
                      Change layout rules, directions, themes, and dynamic statistics in the left control panel to watch the component adapt in real-time.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-white/5 border border-white/10 p-3 rounded-lg text-xs space-y-1 backdrop-blur-md">
                        <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Active Scope ID</span>
                        <code className="text-blue-400 font-semibold font-mono">#{config.idPrefix}-container</code>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-3 rounded-lg text-xs space-y-1 backdrop-blur-md">
                        <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Theme/Dir Mode</span>
                        <code className="text-emerald-400 font-semibold font-mono">
                          {config.theme.toUpperCase()} / {config.direction.toUpperCase()}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Tips bottom helper */}
                  <div className="mt-8 border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                      <Icons.Check size={14} />
                      <span>Accessibility compliant (WAI-ARIA, Tooltips, Custom Keyboard navigation)</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">Z-Index: {config.zIndex}</span>
                  </div>

                </div>
              </div>

              {/* ERP Real-Time Integration Console / Click Logs */}
              <div className="bg-slate-900/30 backdrop-blur-md rounded-xl border border-white/10 flex flex-col h-48 overflow-hidden">
                <div className="bg-slate-950/40 px-4 py-2 flex items-center justify-between border-b border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Icons.Terminal size={14} className="text-emerald-400" />
                    <span>ERP Component Callback Log</span>
                  </div>
                  <button
                    onClick={clearLogs}
                    className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-2 py-1 rounded border border-white/10 transition backdrop-blur-sm"
                  >
                    Clear Logs
                  </button>
                </div>
                
                <div className="flex-grow p-3 font-mono text-[11px] overflow-y-auto bg-slate-950/30 space-y-1">
                  {eventLog.map((log) => (
                    <div key={log.id} className="flex gap-4">
                      <span className="text-slate-500">[{log.time}]</span>
                      <span className={log.msg.includes('Action') ? 'text-blue-400 font-semibold' : 'text-slate-300'}>
                        {log.msg}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            
            /* CODE EXPORTER PANEL WITH COPYABLE TABS */
            <div className="flex-grow flex flex-col space-y-4 min-h-[500px]">
              
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col flex-grow">
                
                {/* Code Tabs Selector */}
                <div className="bg-slate-950 px-4 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
                  <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-850">
                    <button
                      onClick={() => setCodeTab('ts')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                        codeTab === 'ts' ? 'bg-slate-800 text-blue-400 border border-slate-700 shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      user-dropdown.component.ts
                    </button>
                    <button
                      onClick={() => setCodeTab('html')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                        codeTab === 'html' ? 'bg-slate-800 text-blue-400 border border-slate-700 shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      user-dropdown.component.html
                    </button>
                    <button
                      onClick={() => setCodeTab('scss')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                        codeTab === 'scss' ? 'bg-slate-800 text-blue-400 border border-slate-700 shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      user-dropdown.component.scss
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const textMap = {
                        ts: generateAngularTs(),
                        html: generateAngularHtml(),
                        scss: generateAngularScss(),
                      };
                      copyToClipboard(textMap[codeTab], codeTab);
                    }}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow shadow-blue-500/10"
                  >
                    {copyStatus === codeTab ? (
                      <>
                        <Icons.Check size={13} />
                        <span>Copied Code!</span>
                      </>
                    ) : (
                      <>
                        <Icons.Copy size={13} />
                        <span>Copy Code Block</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Preformatted Code block displaying fully dynamic configurations */}
                <div className="flex-grow p-4 overflow-auto bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed max-h-[600px]">
                  <pre className="whitespace-pre">
                    {codeTab === 'ts' && generateAngularTs()}
                    {codeTab === 'html' && generateAngularHtml()}
                    {codeTab === 'scss' && generateAngularScss()}
                  </pre>
                </div>
              </div>

              {/* Informational Guidelines on mounting the generated components */}
              <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Icons.Sparkles size={12} className="text-blue-400" />
                  <span>Developer Integration Manual</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  To mount this component in Angular 20, create the files listed above in your custom component folder. 
                  All styles are strictly isolated using the unique ID selector prefix <code className="text-blue-300">#{config.idPrefix}</code>, meaning they can be globally loaded without cascading conflicts.
                  Icons correspond to classic vector layouts or can be integrated easily with your favorite package (such as Lucide or FontAwesome) by referencing the dynamic class <code className="text-blue-300">icon-{"[IconName]"}</code>.
                </p>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
};
