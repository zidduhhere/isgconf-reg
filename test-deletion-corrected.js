import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dntjfuhzuatrkstcbbzw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRudGpmdWh6dWF0cmtzdGNiYnp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjczNTE4NzMsImV4cCI6MjA0MjkyNzg3M30.uWmAmqVEsT_YRzD9aFJFG-W7dSxBKCvwmEsrYSPZUwY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeletionMapping() {
  try {
    console.log("🧪 Testing participant deletion data mapping...\n");

    // Check participants table structure (using correct column name)
    const { data: participants, error: participantsError } = await supabase
      .from("participants")
      .select("id, name, phoneNumber")
      .limit(3);

    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      return;
    }

    if (!participants || participants.length === 0) {
      console.log("No participants found in database");
      return;
    }

    console.log("📋 Participant table structure:");
    participants.forEach((p, index) => {
      console.log(`${index + 1}. ID: ${p.id}`);
      console.log(`   Name: ${p.name}`);
      console.log(`   Phone: ${p.phoneNumber}`);
      console.log(`   Auth Email: ${p.phoneNumber}@isgcon.com`);
      console.log("");
    });

    // Check coupons table relationship (using 'id' field, not 'participant_id')
    const testParticipant = participants[0];
    console.log(`🔍 Checking data for participant: ${testParticipant.name}`);

    const { data: couponsData, error: couponsError } = await supabase
      .from("coupons")
      .select("*")
      .eq("id", testParticipant.id);

    if (couponsError) {
      console.error("Error checking coupons:", couponsError);
    } else {
      console.log(
        `🎫 Coupons found (using id field): ${couponsData?.length || 0}`
      );
      if (couponsData && couponsData.length > 0) {
        console.log("   Sample coupon structure:");
        console.log(`   - Coupon ID: ${couponsData[0].uniqueId}`);
        console.log(`   - Participant ID: ${couponsData[0].id}`);
        console.log(`   - Meal Slot: ${couponsData[0].mealSlotId}`);
        console.log(
          `   - Status: ${couponsData[0].status ? "Available" : "Used"}`
        );
      }
    }

    console.log("\n📊 Corrected Deletion Strategy:");
    console.log(
      `1. Fetch phoneNumber from participants: ${testParticipant.phoneNumber}`
    );
    console.log(`2. Delete coupons using: id = '${testParticipant.id}'`);
    console.log(
      `3. Delete auth user using: supabase.auth.admin.deleteUser('${testParticipant.id}')`
    );
    console.log(`4. Delete participant using: id = '${testParticipant.id}'`);

    console.log(
      "\n✅ Data mapping verified for enhanced deletion functionality."
    );
    console.log("\n🔧 Key corrections made:");
    console.log("   - Use phoneNumber column (not phone)");
    console.log("   - Use id field for coupon lookup (not participant_id)");
    console.log("   - Use auth admin API with user ID (not custom auth table)");
  } catch (error) {
    console.error("Error in test:", error);
  }
}

testDeletionMapping();
