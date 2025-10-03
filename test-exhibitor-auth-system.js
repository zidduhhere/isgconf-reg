// Test the exhibitor authentication system
import pkg from "@eslint/js";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = pkg.meta.env.VITE_SUPABASE_URL;
const supabaseKey = pkg.meta.env.VITE_SUPABASE_PUBLISH_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing environment variables:");
  console.error("   VITE_SUPABASE_URL");
  console.error("   VITE_SUPABASE_PUBLISH_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testCredentials = [
  { companyId: "EXH001", email: "exh001@isgcon.com" },
  { companyId: "EXH002", email: "exh002@isgcon.com" },
  { companyId: "EXH003", email: "exh003@isgcon.com" },
  { companyId: "EXH004", email: "exh004@isgcon.com" },
];

async function testExhibitorAuth() {
  console.log("🔐 Testing Exhibitor Authentication System...\n");

  for (const cred of testCredentials) {
    console.log(`Testing ${cred.companyId} (${cred.email})...`);

    try {
      // Test login
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: cred.email,
          password: "participanthere",
        });

      if (authError) {
        console.log(`  ❌ Authentication failed: ${authError.message}`);
        continue;
      }

      console.log(`  ✅ Authentication successful`);
      console.log(`  🆔 User ID: ${authData.user.id}`);

      // Test company data fetch using auth.uid
      const { data: company, error: companyError } = await supabase
        .from("exhibitor_companies")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (companyError) {
        console.log(`  ❌ Company fetch failed: ${companyError.message}`);
      } else {
        console.log(`  ✅ Company data retrieved`);
        console.log(`  🏢 Company: ${company.company_name}`);
        console.log(
          `  📊 Plan: ${company.plan} (Lunch: ${company.lunch_allocation}, Dinner: ${company.dinner_allocation})`
        );
      }

      // Test employees fetch
      const { data: employees, error: employeeError } = await supabase
        .from("exhibitor_employees")
        .select("*")
        .eq("company_id", authData.user.id)
        .eq("is_active", true);

      if (employeeError) {
        console.log(`  ❌ Employee fetch failed: ${employeeError.message}`);
      } else {
        console.log(
          `  ✅ Employees retrieved: ${employees.length} active employees`
        );
      }

      // Test RLS by trying to access another company's data
      const { data: otherData, error: rlsError } = await supabase
        .from("exhibitor_companies")
        .select("*")
        .neq("id", authData.user.id);

      if (rlsError || !otherData || otherData.length === 0) {
        console.log(`  ✅ RLS working: Cannot access other companies' data`);
      } else {
        console.log(
          `  ⚠️  RLS issue: Can access ${otherData.length} other companies`
        );
      }

      // Sign out
      await supabase.auth.signOut();
      console.log(`  ✅ Signed out successfully`);
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }

    console.log("");
  }

  console.log("🎉 Authentication testing completed!");
}

// Run the test
testExhibitorAuth().catch(console.error);
