// Script to sync user_profiles with users collection
// Run this with: npx tsx scripts/sync-user-profiles.ts

import { getUsersCollection, getUserProfilesCollection } from "../lib/mongodb";
import { createUserProfile, UserProfile } from "../lib/user-profiles";

async function main() {
  const usersCol = await getUsersCollection();
  const profilesCol = await getUserProfilesCollection();

  const users = await usersCol.find({}).toArray();
  let created = 0;

  for (const user of users) {
    const profile = await profilesCol.findOne({ userId: user._id.toString() });
    if (!profile) {
      const newProfile: UserProfile = {
        userId: user._id.toString(),
        name: user.name || "Sailor",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
        profileImage: user.profileImage || "",
        coverImage: user.coverImage || "",
        role: user.role || "user",
        joinedAt: new Date(),
        updatedAt: new Date(),
        socialLinks: user.socialLinks || {},
        following: [],
        followers: [],
        interests: user.interests || [],
        expertise: user.expertise || [],
      };
      await createUserProfile(newProfile);
      created++;
      console.log(`Created profile for userId: ${user._id}`);
    }
  }
  console.log(`Sync complete. Profiles created: ${created}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
