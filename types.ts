import React from 'react';

export type Status = 'new' | 'engaged' | 'hot' | 'nurture' | 'converted' | 'cold' | 'running' | 'paused' | 'draft' | 'completed' | 'unsubscribed';

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  segment: string;
  status: Status;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  audienceSize: number;
  lastUpdated: string;
  templateId?: string;
  funnelConfig?: {
    customNodes?: any[];
  };
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  industry: string;
  tags: string[];
  status: Status;
  score: number;
  history: ActivityEvent[];
  lastActivity: string;
}

export interface ActivityEvent {
  id?: string;
  type: 'email_sent' | 'email_opened' | 'link_clicked' | 'score_change' | 'demo_booked' | 'status_change' | 'note_added' | 'form_submit' | 'reply_received';
  description: string;
  timestamp: string;
  contactName?: string;
  metadata?: Record<string, any>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: 'Outreach' | 'Newsletter' | 'Nurture' | 'Transactional' | 'Event';
  content: string;
  tags: string[];
  isSystem?: boolean;
  lastModified?: string;
}

export interface AppSettings {
  organizationName: string;
  timezone: string;
  dailySendLimit: number;
  autoResponders: boolean;
}

export interface Domain {
  id: string;
  domain: string;
  status: 'active' | 'pending' | 'warming_up' | 'failed';
  spfVerified: boolean;
  dkimVerified: boolean;
  dmarcVerified: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  timestamp: string;
  link?: string;
}

export interface SenderDomain extends Domain {}

export interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ElementType;
}

export type ViewState = 'dashboard' | 'campaigns' | 'leads' | 'templates' | 'analytics' | 'settings' | 'bulk-email' | 'documentation' | 'support' | 'inbox';