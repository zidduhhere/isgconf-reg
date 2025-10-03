// Setup script for Exhibitor Authentication System
// This script creates auth users and populates the exhibitor data

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables:");
  console.error("   VITE_SUPABASE_URL");
  console.error("   SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const exhibitorCompanies = [
  {
    companyId: "EXH001",
    email: "exh001@isgcon.com",
    companyName: "Diamond Tech Solutions",
    plan: "Diamond",
    lunchAllocation: 5,
    dinnerAllocation: 4,
    phone: "+1234567890",
  },
  {
    companyId: "EXH002",
    email: "exh002@isgcon.com",
    companyName: "Platinum Industries Ltd",
    plan: "Platinum",
    lunchAllocation: 3,
    dinnerAllocation: 2,
    phone: "+1234567891",
  },
  {
    companyId: "EXH003",
    email: "exh003@isgcon.com",
    companyName: "Gold Innovations Inc",
    plan: "Gold",
    lunchAllocation: 2,
    dinnerAllocation: 0,
    phone: "+1234567892",
  },
  {
    companyId: "EXH004",
    email: "exh004@isgcon.com",
    companyName: "Silver Enterprises Co",
    plan: "Silver",
    lunchAllocation: 1,
    dinnerAllocation: 0,
    phone: "+1234567893",
  },
];

async function setupExhibitorSystem() {
  console.log("🚀 Setting up Exhibitor Authentication System...\n");

  for (const company of exhibitorCompanies) {
    console.log(`Setting up ${company.companyName} (${company.companyId})...`);

    try {
      // Step 1: Create auth user
      console.log(`  📧 Creating auth user: ${company.email}`);

      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: company.email,
          password: "participanthere",
          email_confirm: true,
          user_metadata: {
            company_id: company.companyId,
            company_name: company.companyName,
            role: "exhibitor",
          },
        });

      if (authError) {
        if (authError.message.includes("already registered")) {
          console.log(`  ⚠️  User already exists: ${company.email}`);

          // Get existing user
          const { data: users, error: getUserError } =
            await supabase.auth.admin.listUsers();
          if (getUserError) {
            console.error(`  ❌ Failed to get user: ${getUserError.message}`);
            continue;
          }

          const existingUser = users.users.find(
            (user) => user.email === company.email
          );
          if (!existingUser) {
            console.error(`  ❌ Could not find existing user`);
            continue;
          }

          authData.user = existingUser;
        } else {
          console.error(`  ❌ Failed to create user: ${authError.message}`);
          continue;
        }
      } else {
        console.log(`  ✅ Auth user created successfully`);
      }

      // Step 2: Insert company data using auth.uid
      console.log(`  🏢 Creating company record...`);

      const { error: companyError } = await supabase
        .from("exhibitor_companies")
        .upsert({
          id: authData.user.id,
          company_id: company.companyId,
          company_name: company.companyName,
          phone_number: company.phone,
          plan: company.plan,
          lunch_allocation: company.lunchAllocation,
          dinner_allocation: company.dinnerAllocation,
          lunch_used: 0,
          dinner_used: 0,
        });

      if (companyError) {
        console.error(
          `  ❌ Failed to create company record: ${companyError.message}`
        );
        continue;
      }

      console.log(`  ✅ Company record created successfully`);

      // Step 3: Create sample employees
      console.log(`  👥 Creating sample employees...`);

      const employeeCount = company.lunchAllocation;
      const employees = [];

      for (let i = 1; i <= employeeCount; i++) {
        employees.push({
          company_id: authData.user.id,
          employee_name: `Employee ${i} - ${company.companyId}`,
          employee_phone: `+123456789${String(i).padStart(2, "0")}`,
          is_active: true,
        });
      }

      const { error: employeeError } = await supabase
        .from("exhibitor_employees")
        .upsert(employees);

      if (employeeError) {
        console.error(
          `  ❌ Failed to create employees: ${employeeError.message}`
        );
      } else {
        console.log(`  ✅ Created ${employeeCount} sample employees`);
      }

      console.log(`  🎉 ${company.companyName} setup completed!\n`);
    } catch (error) {
      console.error(
        `  ❌ Error setting up ${company.companyName}:`,
        error.message
      );
      console.log("");
    }
  }

  console.log("🎊 Exhibitor system setup completed!");
  console.log("\n📋 Login Credentials:");
  exhibitorCompanies.forEach((company) => {
    console.log(`   ${company.companyId}: ${company.email} / participanthere`);
  });
}

// Run the setup
setupExhibitorSystem().catch(console.error);
