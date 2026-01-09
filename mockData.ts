import { initSQLite, runQuery, runCommand } from './db/sqliteService';
import { Campaign, Contact, EmailTemplate, AppSettings, Domain, ActivityEvent, AppNotification } from './types';

// In-memory cache to support synchronous reads required by current component architecture
let cache = {
  campaigns: [] as Campaign[],
  contacts: [] as Contact[],
  templates: [] as EmailTemplate[],
  domains: [] as Domain[],
  notifications: [] as AppNotification[],
  settings: {
    organizationName: 'WeGoChem',
    timezone: 'UTC-5 (EST)',
    dailySendLimit: 500,
    autoResponders: true
  } as AppSettings
};

// Seed Data
const SEED_CAMPAIGNS: Campaign[] = [
    { 
        id: 'c-001', 
        name: 'Q1 Product Launch', 
        subject: 'Announcing the new polymer series', 
        segment: 'Pharma Industry Leads', 
        status: 'running', 
        sent: 1240, 
        opened: 856, 
        clicked: 342, 
        converted: 45, 
        audienceSize: 1500, 
        lastUpdated: '2 hours ago', 
        templateId: 't-001', 
        funnelConfig: { 
            customNodes: [
              { id: 'start', type: 'trigger', title: 'Start Campaign', subtitle: 'Segment: Pharma', config: {} },
              { id: 'email-1', type: 'email', title: 'Announcement Email', subtitle: 'Template: Product Launch', config: { subject: 'Announcing new series' } },
              { id: 'delay-1', type: 'delay', title: 'Wait 2 Days', subtitle: 'Wait for engagement', config: { duration: '2', unit: 'days' } },
              { 
                id: 'cond-1', type: 'condition', title: 'Opened Email?', subtitle: 'Check behavior', config: { conditionType: 'Has Opened Email' },
                branches: {
                  true: [
                     { id: 'score-1', type: 'action', title: 'Score +10', subtitle: 'Increase Lead Score', config: {} },
                     { id: 'email-2', type: 'email', title: 'Follow-up: Specs', subtitle: 'Send technical details', config: { subject: 'Here are the specs' } }
                  ],
                  false: [
                     { id: 'email-3', type: 'email', title: 'Re-send: Different Subject', subtitle: 'Try new angle', config: { subject: 'Did you see this?' } }
                  ]
                }
              }
            ] 
        } 
    },
    { id: 'c-002', name: 'Cold Outreach - EU', subject: 'Partnership opportunity in Berlin', segment: 'Cold Leads', status: 'paused', sent: 450, opened: 120, clicked: 15, converted: 2, audienceSize: 2000, lastUpdated: '1 day ago', templateId: 't-002', funnelConfig: { customNodes: [{ id: 'start', type: 'trigger', title: 'Start', config: {} }] } },
    { id: 'c-003', name: 'Webinar Invite', subject: 'Join us: Future of Chemical Logistics', segment: 'All Contacts', status: 'draft', sent: 0, opened: 0, clicked: 0, converted: 0, audienceSize: 3200, lastUpdated: 'Just now', templateId: 't-003', funnelConfig: { customNodes: [{ id: 'start', type: 'trigger', title: 'Start', config: {} }] } },
];

const SEED_CONTACTS: Contact[] = [
    { id: 'u-001', firstName: 'Alice', lastName: 'Chen', email: 'alice.c@pfizer.com', company: 'Pfizer', role: 'Procurement Manager', industry: 'Pharmaceuticals', tags: ['Enterprise', 'Decision Maker'], status: 'hot', score: 92, lastActivity: '2 hours ago', history: [
        { id: 'e1', type: 'score_change', description: 'Score increased by 15 (Email Open)', timestamp: new Date().toISOString() },
        { id: 'e2', type: 'email_sent', description: 'Sent "Q1 Product Launch"', timestamp: new Date(Date.now() - 86400000).toISOString() }
    ] },
    { id: 'u-002', firstName: 'Mark', lastName: 'Johnson', email: 'mark.j@dow.com', company: 'Dow Chemical', role: 'VP of Operations', industry: 'Chemicals', tags: ['VIP'], status: 'engaged', score: 65, lastActivity: '1 day ago', history: [] },
    { id: 'u-003', firstName: 'Sarah', lastName: 'Miller', email: 's.miller@bayer.de', company: 'Bayer', role: 'Supply Chain Lead', industry: 'Pharmaceuticals', tags: ['EU Region'], status: 'converted', score: 100, lastActivity: '3 days ago', history: [{ id: 'e3', type: 'demo_booked', description: 'Demo booked via Calendly', timestamp: new Date().toISOString() }] },
    { id: 'u-004', firstName: 'David', lastName: 'Wu', email: 'david@startuplab.io', company: 'Startup Lab', role: 'Founder', industry: 'Biotech', tags: ['Startup'], status: 'new', score: 20, lastActivity: '1 week ago', history: [] },
];

const SEED_TEMPLATES: EmailTemplate[] = [
    { id: 't-001', name: 'Product Announcement v2', subject: 'Introducing our new line', category: 'Outreach', content: "Hi {{firstName}},\n\nWe are excited to announce...", tags: ['Product', 'Q1'], isSystem: true, lastModified: 'Jan 10' },
    { id: 't-002', name: 'Cold Approach - Value Prop', subject: 'Reduce your logistics costs', category: 'Outreach', content: "Hello {{firstName}},\n\nI noticed you handle supply chain at {{company}}...", tags: ['Sales'], lastModified: 'Feb 12' },
    { id: 't-003', name: 'Webinar Invitation', subject: 'You are invited: Chemical Trends 2025', category: 'Event', content: "# Webinar Invitation\n\nJoin us for an exclusive look...", tags: ['Event'], lastModified: 'Mar 01' },
];

const SEED_DOMAINS: Domain[] = [
    { id: 'd-1', domain: 'wegochem.com', status: 'active', spfVerified: true, dkimVerified: true, dmarcVerified: true },
    { id: 'd-2', domain: 'mail.wegochem.com', status: 'active', spfVerified: true, dkimVerified: true, dmarcVerified: false },
];

const SEED_NOTIFICATIONS: AppNotification[] = [
    { id: 'n-1', title: 'Campaign Completed', message: 'Q1 Product Launch has finished sending.', type: 'success', isRead: false, timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'n-2', title: 'High Lead Activity', message: '5 leads from Bayer engaged in the last hour.', type: 'info', isRead: false, timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 'n-3', title: 'DMARC Warning', message: 'SPF check failed for mail.wegochem.com.', type: 'error', isRead: true, timestamp: new Date(Date.now() - 86400000).toISOString() },
];

// DB Helper to parse/stringify JSON fields
const parseRow = (row: any) => {
    if (!row) return row;
    try {
        if (row.funnelConfig && typeof row.funnelConfig === 'string') row.funnelConfig = JSON.parse(row.funnelConfig);
        if (row.history && typeof row.history === 'string') row.history = JSON.parse(row.history);
        if (row.tags && typeof row.tags === 'string') row.tags = JSON.parse(row.tags);
        if (row.isSystem !== undefined) row.isSystem = Boolean(row.isSystem);
        if (row.spfVerified !== undefined) row.spfVerified = Boolean(row.spfVerified);
        if (row.dkimVerified !== undefined) row.dkimVerified = Boolean(row.dkimVerified);
        if (row.dmarcVerified !== undefined) row.dmarcVerified = Boolean(row.dmarcVerified);
        if (row.isRead !== undefined) row.isRead = Boolean(row.isRead);
        return row;
    } catch (e) {
        console.error("Error parsing DB row", e, row);
        return row;
    }
};

export const initDB = async () => {
    try {
        await initSQLite();
        
        // Check if data exists, if not seed
        const campaigns = runQuery("SELECT * FROM campaigns");
        if (campaigns.length === 0) {
            console.log("Seeding Database...");
            SEED_CAMPAIGNS.forEach(c => {
                runCommand(`INSERT INTO campaigns VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                    [c.id, c.name, c.subject, c.segment, c.status, c.sent, c.opened, c.clicked, c.converted, c.audienceSize, c.lastUpdated, c.templateId, JSON.stringify(c.funnelConfig || {})]);
            });
            SEED_CONTACTS.forEach(c => {
                runCommand(`INSERT INTO contacts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [c.id, c.firstName, c.lastName, c.email, c.company, c.role, c.industry, JSON.stringify(c.tags), c.status, c.score, JSON.stringify(c.history), c.lastActivity]);
            });
            SEED_TEMPLATES.forEach(t => {
                runCommand(`INSERT INTO templates VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [t.id, t.name, t.subject, t.category, t.content, JSON.stringify(t.tags), t.isSystem ? 1 : 0, t.lastModified]);
            });
            SEED_DOMAINS.forEach(d => {
                runCommand(`INSERT INTO domains VALUES (?, ?, ?, ?, ?, ?)`,
                    [d.id, d.domain, d.status, d.spfVerified ? 1 : 0, d.dkimVerified ? 1 : 0, d.dmarcVerified ? 1 : 0]);
            });
            SEED_NOTIFICATIONS.forEach(n => {
                runCommand(`INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [n.id, n.title, n.message, n.type, n.isRead ? 1 : 0, n.timestamp, n.link || '']);
            });
            runCommand(`INSERT OR REPLACE INTO settings (key, value) VALUES ('config', ?)`, [JSON.stringify(cache.settings)]);
        }

        // Load into cache
        await refreshCache();
        console.log("DB Initialized and Cache Loaded");
    } catch (e) {
        console.error("Error initializing DB:", e);
    }
};

const refreshCache = async () => {
    cache.campaigns = runQuery("SELECT * FROM campaigns").map(parseRow);
    cache.contacts = runQuery("SELECT * FROM contacts").map(parseRow);
    cache.templates = runQuery("SELECT * FROM templates").map(parseRow);
    cache.domains = runQuery("SELECT * FROM domains").map(parseRow);
    cache.notifications = runQuery("SELECT * FROM notifications ORDER BY timestamp DESC").map(parseRow);
    
    const settingsRow = runQuery("SELECT value FROM settings WHERE key = 'config'");
    if (settingsRow.length > 0) {
        try {
            cache.settings = JSON.parse(settingsRow[0].value);
        } catch(e) {}
    }
};

export const db = {
    // Search
    globalSearch: (query: string) => {
        if (!query) return { contacts: [], campaigns: [], templates: [] };
        const lowerQ = query.toLowerCase();
        
        const contacts = cache.contacts.filter(c => 
            c.firstName.toLowerCase().includes(lowerQ) || 
            c.lastName.toLowerCase().includes(lowerQ) || 
            c.company.toLowerCase().includes(lowerQ) ||
            c.email.toLowerCase().includes(lowerQ)
        );

        const campaigns = cache.campaigns.filter(c => 
            c.name.toLowerCase().includes(lowerQ) ||
            c.subject.toLowerCase().includes(lowerQ)
        );

        const templates = cache.templates.filter(t => 
            t.name.toLowerCase().includes(lowerQ) ||
            t.subject.toLowerCase().includes(lowerQ)
        );

        return { contacts, campaigns, templates };
    },

    // Notifications
    getNotifications: () => [...cache.notifications],
    markNotificationRead: (id: string) => {
        runCommand("UPDATE notifications SET isRead = 1 WHERE id = ?", [id]);
        refreshCache();
    },
    markAllNotificationsRead: () => {
        runCommand("UPDATE notifications SET isRead = 1");
        refreshCache();
    },
    addNotification: (note: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
        const newNote: AppNotification = {
            id: `n-${Date.now()}`,
            timestamp: new Date().toISOString(),
            isRead: false,
            ...note
        };
        runCommand(`INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [newNote.id, newNote.title, newNote.message, newNote.type, 0, newNote.timestamp, newNote.link || '']);
        refreshCache();
    },

    // Campaigns
    getCampaigns: () => [...cache.campaigns],
    getCampaign: (id: string) => cache.campaigns.find(c => c.id === id),
    addCampaign: (campaign: Campaign) => {
        runCommand(`INSERT OR REPLACE INTO campaigns VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [campaign.id, campaign.name, campaign.subject, campaign.segment, campaign.status, campaign.sent, campaign.opened, campaign.clicked, campaign.converted, campaign.audienceSize, campaign.lastUpdated, campaign.templateId, JSON.stringify(campaign.funnelConfig || {})]);
        refreshCache();
    },
    updateCampaignStatus: (id: string, status: string) => {
        runCommand("UPDATE campaigns SET status = ?, lastUpdated = 'Just now' WHERE id = ?", [status, id]);
        refreshCache();
        return true;
    },
    deleteCampaign: (id: string) => {
        runCommand("DELETE FROM campaigns WHERE id = ?", [id]);
        refreshCache();
    },

    // Contacts
    getContacts: () => [...cache.contacts],
    getContact: (id: string) => cache.contacts.find(c => c.id === id),
    addContact: (contact: Partial<Contact>) => {
        const newContact: Contact = {
            id: contact.id || `u-${Date.now()}`,
            firstName: contact.firstName || '',
            lastName: contact.lastName || '',
            email: contact.email || '',
            company: contact.company || '',
            role: contact.role || '',
            industry: contact.industry || '',
            tags: contact.tags || [],
            status: 'new',
            score: 0,
            history: [],
            lastActivity: 'Just now'
        };
        runCommand(`INSERT OR REPLACE INTO contacts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newContact.id, newContact.firstName, newContact.lastName, newContact.email, newContact.company, newContact.role, newContact.industry, JSON.stringify(newContact.tags), newContact.status, newContact.score, JSON.stringify(newContact.history), newContact.lastActivity]);
        refreshCache();
    },
    updateContact: (id: string, updates: Partial<Contact>) => {
        const current = cache.contacts.find(c => c.id === id);
        if (!current) return;
        const merged = { ...current, ...updates };
        runCommand(`UPDATE contacts SET firstName=?, lastName=?, email=?, company=?, role=?, industry=?, tags=?, status=?, score=?, history=?, lastActivity=? WHERE id=?`,
            [merged.firstName, merged.lastName, merged.email, merged.company, merged.role, merged.industry, JSON.stringify(merged.tags), merged.status, merged.score, JSON.stringify(merged.history), merged.lastActivity, id]);
        refreshCache();
    },
    deleteContact: (id: string) => {
        runCommand("DELETE FROM contacts WHERE id = ?", [id]);
        refreshCache();
    },
    convertLead: (id: string) => {
        const c = cache.contacts.find(x => x.id === id);
        if (c && c.status !== 'converted') {
            db.updateContact(id, { status: 'converted', score: Math.min(c.score + 50, 100) });
            db.addActivity(id, { type: 'status_change', description: 'Lead converted to Deal', timestamp: new Date().toISOString() });
            return true;
        }
        return false;
    },
    addActivity: (contactId: string, activity: Omit<ActivityEvent, 'id'>) => {
        const c = cache.contacts.find(x => x.id === contactId);
        if (c) {
            const newHistory = [{ id: `evt-${Date.now()}`, ...activity }, ...c.history];
            runCommand("UPDATE contacts SET history = ?, lastActivity = 'Just now' WHERE id = ?", [JSON.stringify(newHistory), contactId]);
            refreshCache();
        }
    },
    // Bulk Send Logic (Mock)
    bulkSendEmail: (contactIds: string[], templateId: string, subject: string) => {
        const template = cache.templates.find(t => t.id === templateId);
        if(!template) return 0;
        
        let sentCount = 0;
        contactIds.forEach(cid => {
             db.addActivity(cid, {
                 type: 'email_sent',
                 description: `Bulk Email: ${subject}`,
                 timestamp: new Date().toISOString()
             });
             sentCount++;
        });
        
        db.addNotification({
            title: 'Bulk Email Sent',
            message: `Successfully sent "${subject}" to ${sentCount} contacts.`,
            type: 'success'
        });
        
        return sentCount;
    },

    // Templates
    getTemplates: () => [...cache.templates],
    getTemplate: (id: string) => cache.templates.find(t => t.id === id),
    saveTemplate: (template: Partial<EmailTemplate>) => {
        if (template.id) {
            const current = cache.templates.find(t => t.id === template.id);
            if(current) {
                const merged = {...current, ...template, lastModified: new Date().toLocaleDateString('en-US', {month:'short', day:'numeric'})};
                runCommand(`UPDATE templates SET name=?, subject=?, category=?, content=?, tags=?, isSystem=?, lastModified=? WHERE id=?`,
                    [merged.name, merged.subject, merged.category, merged.content, JSON.stringify(merged.tags), merged.isSystem ? 1 : 0, merged.lastModified, template.id]);
            }
        } else {
            const newTmpl: EmailTemplate = {
                id: `t-${Date.now()}`,
                name: template.name || 'Untitled',
                subject: template.subject || '',
                category: template.category || 'Outreach',
                content: template.content || '',
                tags: template.tags || [],
                isSystem: false,
                lastModified: new Date().toLocaleDateString('en-US', {month:'short', day:'numeric'})
            };
            runCommand(`INSERT INTO templates VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [newTmpl.id, newTmpl.name, newTmpl.subject, newTmpl.category, newTmpl.content, JSON.stringify(newTmpl.tags), 0, newTmpl.lastModified]);
        }
        refreshCache();
    },
    deleteTemplate: (id: string) => {
        runCommand("DELETE FROM templates WHERE id = ?", [id]);
        refreshCache();
    },

    // Domains & Settings
    getDomains: () => [...cache.domains],
    getDeliverability: () => ({ reputation: 94, inboxPlacement: 98.5 }),
    getSettings: () => ({ ...cache.settings }),
    saveSettings: (settings: AppSettings) => {
        runCommand(`INSERT OR REPLACE INTO settings (key, value) VALUES ('config', ?)`, [JSON.stringify(settings)]);
        refreshCache();
    }
};