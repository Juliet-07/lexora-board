// Dummy data for the Messages page (mirrors the prototype's pg-messages).

export interface InboxMessage {
  id: string;
  initials: string;
  avatarClass: string;
  from: string;
  roleTag: string;
  preview: string;
  time: string;
  body: string;
}

export const inboxMessages: InboxMessage[] = [
  {
    id: "m1",
    initials: "RS",
    avatarClass: "bg-primary text-primary-foreground",
    from: "Rudo Barbra Sibanda",
    roleTag: "CoSec",
    preview: "Reminder: Please submit your COI declaration...",
    time: "Yesterday",
    body: "Dear Grace,\n\nThis is a gentle reminder that your Annual COI declaration for 2026 remains outstanding. Please submit through the portal at your earliest convenience.\n\nKind regards,\nRudo Barbra Sibanda",
  },
  {
    id: "m2",
    initials: "CM",
    avatarClass: "bg-success/20 text-success",
    from: "Claude Mugabo",
    roleTag: "Chair",
    preview: "Query on risk appetite thresholds before Q4 meeting.",
    time: "3 days ago",
    body: "Hi Grace,\n\nBefore we finalise the Q4 agenda, could you take a look at the proposed risk appetite thresholds in the Audit & Risk pack? Keen to get your read as Committee Chair before we present to the full Board.\n\nThanks,\nClaude",
  },
];

export const messageRecipients = ["Company Secretary", "Board Chairperson", "All directors"];
