import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dntjfuhzuatrkstcbbzw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRudGpmdWh6dWF0cmtzdGNiYnp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjczNTE4NzMsImV4cCI6MjA0MjkyNzg3M30.uWmAmqVEsT_YRzD9aFJFG-W7dSxBKCvwmEsrYSPZUwY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeletionFunctionality() {
  try {
    console.log("🧪 Testing participant deletion functionality...\n");

    // First, let's see what participants exist
    const { data: participants, error: participantsError } = await supabase
      .from("participants")
      .select("id, name, phone")
      .limit(5);

    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      return;
    }

    if (!participants || participants.length === 0) {
      console.log("No participants found in database");
      return;
    }

    console.log("📋 Available participants:");
    participants.forEach((p, index) => {
      console.log(
        `${index + 1}. ID: ${p.id}, Name: ${p.name}, Phone: ${p.phone}`
      );
    });

    // Let's check the first participant and see their related data
    const testParticipant = participants[0];
    console.log(
      `\n🔍 Checking data for participant: ${testParticipant.name} (${testParticipant.id})`
    );

    // Check auth record
    const { data: authData, error: authError } = await supabase
      .from("auth")
      .select("*")
      .eq("phone", testParticipant.phone);

    if (authError) {
      console.error("Error checking auth:", authError);
    } else {
      console.log(`✅ Auth records found: ${authData?.length || 0}`);
    }

    // Check coupons
    const { data: couponsData, error: couponsError } = await supabase
      .from("coupons")
      .select("*")
      .eq("participant_id", testParticipant.id);

    if (couponsError) {
      console.error("Error checking coupons:", couponsError);
    } else {
      console.log(`🎫 Coupons found: ${couponsData?.length || 0}`);
    }

    console.log("\n📊 Summary of what would be deleted:");
    console.log(
      `- Participant record: ${testParticipant.name} (${testParticipant.id})`
    );
    console.log(`- Auth records: ${authData?.length || 0}`);
    console.log(`- Coupon records: ${couponsData?.length || 0}`);

    console.log("\n⚠️  This is just a test - no actual deletion performed.");
    console.log(
      "The enhanced deleteParticipant function will handle all these deletions."
    );
  } catch (error) {
    console.error("Error in test:", error);
  }
}

testDeletionFunctionality();
