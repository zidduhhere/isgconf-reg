// Script to create Supabase Auth users for exhibitor companies
// Run this with Node.js after setting up your Supabase environment variables

import { createClient } from "@supabase/supabase-js";

// Supabase configuration - make sure these environment variables are set
const supabaseUrl = process.env.VITE_SUPABASE_URL || "your-supabase-url";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const exhibitorUsers = [
  {
    email: "exh001@isgcon",
    password: "participanthere",
    companyId: "EXH001",
    companyName: "Diamond Exhibitor Corp",
  },
  {
    email: "exh002@isgcon",
    password: "participanthere",
    companyId: "EXH002",
    companyName: "Platinum Solutions Ltd",
  },
  {
    email: "exh003@isgcon",
    password: "participanthere",
    companyId: "EXH003",
    companyName: "Gold Industries Inc",
  },
  {
    email: "exh004@isgcon",
    password: "participanthere",
    companyId: "EXH004",
    companyName: "Silver Enterprises Co",
  },
];

async function createExhibitorUsers() {
  console.log("Creating exhibitor users in Supabase Auth...");

  for (const user of exhibitorUsers) {
    try {
      console.log(`Creating user for ${user.companyName} (${user.email})...`);

      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          company_id: user.companyId,
          company_name: user.companyName,
          role: "exhibitor",
        },
      });

      if (error) {
        console.error(`Failed to create user ${user.email}:`, error.message);
      } else {
        console.log(`✅ Successfully created user: ${user.email}`);
      }
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }

  console.log("Exhibitor user creation completed!");
}

// Run the script
createExhibitorUsers().catch(console.error);
