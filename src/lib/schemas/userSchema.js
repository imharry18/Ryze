export const userSchema = {
  // 1. Basic Identity
  uid: "",
  name: "",
  email: "",
  username: "",
  dp: "",
  bio: "",

  // 2. College Identity
  college: "",
  year: "",
  branch: "",
  rollNo: "",

  // 3. Social System
  linksCount: 0,
  linkedUsers: [],
  pendingLinkRequests: [],
  sentLinkRequests: [],

  // 4. Community System
  joinedCommunities: [],
  subscribedCommunities: [],

  // 5. Posts & Activity
  posts: 0,
  savedPosts: [],
  likedPosts: [],
  createdAt: null,
  lastActiveAt: null,

  // 6. Security
  twoFactorEnabled: false,
  devices: [],
  isBanned: false,
  banReason: "",

  // 7. Privacy
  showOnlineStatus: true,
  showLastSeen: true,
  allowMessagesFrom: "everyone",
  allowLinkRequestsFrom: "everyone",
  searchVisibility: "public",

  // 8. Messaging
  readReceipts: true,
  typingIndicator: true,
  blockedUsers: [],
  mutedUsers: [],

  // 9. Notifications
  notifications: {
    messages: true,
    links: true,
    posts: true,
    communities: true,
    mentions: true,
  },

  // 10. Preferences
  theme: "system",
  language: "en",
  contentPreferences: [],

  // 11. Profile Completion
  isProfileComplete: false,
  profileCompletedAt: null,
};
