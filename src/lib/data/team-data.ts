// lib/data/team-data.ts
// Finance Clarity PPM - Team Directory

export interface TeamMember {
  code: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
  avatar?: string;
  active: boolean;
  notificationPreferences?: {
    emailAlerts: boolean;
    mentions: boolean;
    taskAssignments: boolean;
    dueReminders: boolean;
  };
}

export const teamMembers: TeamMember[] = [
  {
    code: 'CKVC',
    name: 'Khalil Veracruz',
    email: 'khalil.veracruz@omc.com',
    role: 'Finance Manager',
    department: 'Finance',
    active: true,
    notificationPreferences: {
      emailAlerts: true,
      mentions: true,
      taskAssignments: true,
      dueReminders: true,
    },
  },
  {
    code: 'RIM',
    name: 'Rey Meran',
    email: 'rey.meran@omc.com',
    role: 'Senior Accountant',
    department: 'Finance',
    active: true,
    notificationPreferences: {
      emailAlerts: true,
      mentions: true,
      taskAssignments: true,
      dueReminders: true,
    },
  },
  {
    code: 'LAS',
    name: 'Amor Lasaga',
    email: 'amor.lasaga@omc.com',
    role: 'Accountant',
    department: 'Finance',
    active: true,
    notificationPreferences: {
      emailAlerts: true,
      mentions: true,
      taskAssignments: true,
      dueReminders: true,
    },
  },
  {
    code: 'BOM',
    name: 'Beng Manalo',
    email: 'beng.manalo@omc.com',
    role: 'Accountant',
    department: 'Finance',
    active: true,
    notificationPreferences: {
      emailAlerts: true,
      mentions: true,
      taskAssignments: true,
      dueReminders: true,
    },
  },
  {
    code: 'JAP',
    name: 'Jinky Paladin',
    email: 'jinky.paladin@omc.com',
    role: 'Tax Specialist',
    department: 'Finance',
    active: true,
    notificationPreferences: {
      emailAlerts: true,
      mentions: true,
      taskAssignments: true,
      dueReminders: true,
    },
  },
  {
    code: 'JPAL',
    name: 'Jerald Loterte',
    email: 'jerald.loterte@omc.com',
    role: 'Payroll Specialist',
    department: 'Finance',
    active: true,
    notificationPreferences: {
      emailAlerts: true,
      mentions: true,
      taskAssignments: true,
      dueReminders: true,
    },
  },
  {
    code: 'JLI',
    name: 'Jasmin Ignacio',
    email: 'jasmin.ignacio@omc.com',
    role: 'Accounts Payable',
    department: 'Finance',
    active: true,
    notificationPreferences: {
      emailAlerts: true,
      mentions: true,
      taskAssignments: true,
      dueReminders: true,
    },
  },
  {
    code: 'JRMO',
    name: 'Jhoee Oliva',
    email: 'jhoee.oliva@omc.com',
    role: 'Accounts Receivable',
    department: 'Finance',
    active: true,
    notificationPreferences: {
      emailAlerts: true,
      mentions: true,
      taskAssignments: true,
      dueReminders: true,
    },
  },
  {
    code: 'JMSM',
    name: 'Joana Maravillas',
    email: 'joana.maravillas@omc.com',
    role: 'Finance Analyst',
    department: 'Finance',
    active: true,
    notificationPreferences: {
      emailAlerts: true,
      mentions: true,
      taskAssignments: true,
      dueReminders: true,
    },
  },
  {
    code: 'RMQB',
    name: 'Sally Brillantes',
    email: 'sally.brillantes@omc.com',
    role: 'Finance Coordinator',
    department: 'Finance',
    active: true,
    notificationPreferences: {
      emailAlerts: true,
      mentions: true,
      taskAssignments: true,
      dueReminders: true,
    },
  },
];

export function getTeamMemberByCode(code: string): TeamMember | undefined {
  return teamMembers.find(member => member.code === code);
}

export function getTeamMemberByEmail(email: string): TeamMember | undefined {
  return teamMembers.find(member => member.email === email);
}

export function getTeamMembersByRole(role: string): TeamMember[] {
  return teamMembers.filter(member => member.role === role);
}

export function getActiveTeamMembers(): TeamMember[] {
  return teamMembers.filter(member => member.active);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

export function getAvatarColor(code: string): string {
  const colors = [
    '#D97706', '#10B981', '#0EA5E9', '#8B5CF6', '#EF4444',
    '#F59E0B', '#14B8A6', '#3B82F6', '#A855F7', '#EC4899',
  ];
  const index = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

// Email alert types
export type AlertType = 
  | 'task_assigned'
  | 'task_due_soon'
  | 'task_overdue'
  | 'mentioned'
  | 'comment_added'
  | 'status_changed'
  | 'checklist_completed'
  | 'approval_required';

export interface EmailAlert {
  id: string;
  type: AlertType;
  recipient: string; // team member code
  subject: string;
  message: string;
  taskId?: string;
  taskName?: string;
  sentBy: string; // team member code
  sentAt: string;
  read: boolean;
}

export function createEmailAlert(
  type: AlertType,
  recipient: string,
  subject: string,
  message: string,
  taskId?: string,
  taskName?: string,
  sentBy?: string
): EmailAlert {
  return {
    id: `ALERT-${Date.now()}`,
    type,
    recipient,
    subject,
    message,
    taskId,
    taskName,
    sentBy: sentBy || 'SYSTEM',
    sentAt: new Date().toISOString(),
    read: false,
  };
}

export function formatMention(memberCode: string): string {
  const member = getTeamMemberByCode(memberCode);
  return member ? `@${member.name}` : `@${memberCode}`;
}

export function parseMentions(text: string): string[] {
  const mentionRegex = /@([A-Z]{2,4})\b/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
}
