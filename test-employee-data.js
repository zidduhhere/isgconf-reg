// Quick test to verify exhibitor employee data in Supabase
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISH_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmployeeData() {
  console.log("🔍 Testing exhibitor employee data...\n");

  try {
    // Check companies first
    const { data: companies, error: companyError } = await supabase
      .from("exhibitor_companies")
      .select("*");

    if (companyError) {
      console.error("❌ Error fetching companies:", companyError.message);
      return;
    }

    console.log("📊 Companies found:", companies?.length || 0);
    if (companies && companies.length > 0) {
      console.log("First company:", companies[0]);
    }

    // Check employees for each company
    for (const company of companies || []) {
      console.log(
        `\n👥 Employees for ${company.company_name} (${company.company_id}):`
      );

      const { data: employees, error: empError } = await supabase
        .from("exhibitor_employees")
        .select("*")
        .eq("company_id", company.id);

      if (empError) {
        console.error("❌ Error fetching employees:", empError.message);
        continue;
      }

      console.log(`   Found ${employees?.length || 0} employees`);
      if (employees && employees.length > 0) {
        employees.forEach((emp, index) => {
          console.log(
            `   ${index + 1}. ${emp.employee_name} (${
              emp.employee_phone || "No phone"
            })`
          );
        });
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testEmployeeData().catch(console.error);
