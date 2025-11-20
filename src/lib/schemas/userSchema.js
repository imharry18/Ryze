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

  // 3. Social System (renamed from Links to Friends)
  friendsCount: 0,
  friends: [], // Array of UIDs
  pendingFriendRequests: [], // Requests I received
  sentFriendRequests: [], // Requests I sent

  // 4. Follow System (Twitter style - distinct from Friends)
  following: [],
  followers: [],
  followingCount: 0,
  followersCount: 0,

  // 5. Community System
  joinedCommunities: [],
  subscribedCommunities: [],

  // 6. Posts & Activity
  posts: 0,
  savedPosts: [],
  likedPosts: [],
  createdAt: null,
  lastActiveAt: null,

  // 7. Security
  twoFactorEnabled: false,
  devices: [],
  isBanned: false,
  banReason: "",

  // 8. Privacy
  showOnlineStatus: true,
  showLastSeen: true,
  allowMessagesFrom: "everyone",
  allowFriendRequestsFrom: "everyone", // Renamed
  searchVisibility: "public",

  // 9. Messaging
  readReceipts: true,
  typingIndicator: true,
  blockedUsers: [],
  mutedUsers: [],

  // 10. Notifications
  notifications: {
    messages: true,
    friends: true, // Renamed
    posts: true,
    communities: true,
    mentions: true,
  },

  // 11. Preferences
  theme: "system",
  language: "en",
  contentPreferences: [],

  // 12. Profile Completion
  isProfileComplete: false,
  profileCompletedAt: null,
};