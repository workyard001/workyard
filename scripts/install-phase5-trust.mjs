import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const chatPath = path.join(root, "src/app/messages/chat/page.tsx");
const publicProfilePath = path.join(root, "src/app/profile/view/page.tsx");

function readRequired(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Could not find ${path.relative(root, filePath)}. Run this script from your WORKYARD project root.`);
  }
  return fs.readFileSync(filePath, "utf8");
}

let chat = readRequired(chatPath);
let publicProfile = readRequired(publicProfilePath);

// Validate both insertion points before changing either file.
if (!chat.includes("WorkOrderTrustPanel")) {
  const scrollMarker = '              minHeight: "300px"';
  const scrollIndex = chat.indexOf(scrollMarker);
  if (scrollIndex < 0) {
    throw new Error('Could not locate the chat message list. No files were changed. Please share src/app/messages/chat/page.tsx so I can patch its current layout safely.');
  }
}

if (!publicProfile.includes("ProfileReviews")) {
  if (!publicProfile.includes("          {profile.about && (")) {
    throw new Error('Could not locate the About section in the public profile page. No files were changed. Please share src/app/profile/view/page.tsx so I can patch its current layout safely.');
  }
}

if (!chat.includes("WorkOrderTrustPanel")) {
  const importLine = 'import { supabase } from "@/lib/supabase";';
  if (!chat.includes(importLine)) {
    throw new Error("Could not locate the Supabase import in the chat page. No files were changed.");
  }
  chat = chat.replace(
    importLine,
    `${importLine}\nimport WorkOrderTrustPanel from "@/components/WorkOrderTrustPanel";`
  );

  const scrollMarker = '              minHeight: "300px"';
  const scrollIndex = chat.indexOf(scrollMarker);
  const insertAt = chat.lastIndexOf("            <div style={{", scrollIndex);
  if (insertAt < 0) {
    throw new Error("Could not locate the message list container. No files were changed.");
  }
  chat =
    chat.slice(0, insertAt) +
    '            <WorkOrderTrustPanel conversationId={conversationId!} userId={userId} />\n\n' +
    chat.slice(insertAt);
}

if (!publicProfile.includes("ProfileReviews")) {
  const importLine = 'import { supabase } from "@/lib/supabase";';
  if (!publicProfile.includes(importLine)) {
    throw new Error("Could not locate the Supabase import in the public profile page.");
  }
  publicProfile = publicProfile.replace(
    importLine,
    `${importLine}\nimport ProfileReviews from "@/components/ProfileReviews";`
  );
  publicProfile = publicProfile.replace(
    "          {profile.about && (",
    "          <ProfileReviews profileId={profile.user_id} />\n\n          {profile.about && ("
  );
}

fs.writeFileSync(chatPath, chat, "utf8");
fs.writeFileSync(publicProfilePath, publicProfile, "utf8");
console.log("SUCCESS: Added work completion/reviews to the chat screen and ratings/reviews to public profiles.");
console.log("Existing messaging, calls, and work agreement code was preserved.");
