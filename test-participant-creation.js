// Test script to verify participant creation with automatic coupon generation
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fyralscanbvwgvhrfucq.supabase.co";
const supabaseKey = "sb_publishable_s5FTlyKBIncxBoWql1Qh1w_aS11wTIJ";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testParticipantCreation() {
  console.log("Testing participant creation with coupon generation...");

  try {
    // Test data
    const testParticipant = {
      phoneNumber: "9876543210",
      name: "Test Participant Admin",
      familySize: 2, // Participant + 1 family member = 6 coupons total
      isFam: true,
      hospitalName: "Test Hospital",
      isFaculty: false,
    };

    console.log("Creating test participant:", testParticipant);

    // 1. Create auth user
    const email = `${testParticipant.phoneNumber}@isgcon.com`;
    const password = "123456789";

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return;
    }

    if (!authData.user?.id) {
      console.error("No user ID returned");
      return;
    }

    console.log("Created auth user with ID:", authData.user.id);

    // 2. Create participant record
    const { error: participantError } = await supabase
      .from("participants")
      .insert({
        id: authData.user.id,
        phoneNumber: testParticipant.phoneNumber,
        name: testParticipant.name,
        familySize: testParticipant.familySize,
        isFam: testParticipant.isFam,
        hospitalName: testParticipant.hospitalName,
        isFaculty: testParticipant.isFaculty,
      });

    if (participantError) {
      console.error("Error creating participant:", participantError);
      return;
    }

    console.log("Created participant successfully");

    // 3. Create coupons
    const mealSlots = ["lunch_1", "lunch_2", "gala_1"];
    const couponsToCreate = [];

    for (
      let familyMemberIndex = 0;
      familyMemberIndex < testParticipant.familySize;
      familyMemberIndex++
    ) {
      for (const mealSlotId of mealSlots) {
        couponsToCreate.push({
          id: authData.user.id,
          mealSlotId: mealSlotId,
          familymemberindex: familyMemberIndex,
          status: true, // true = available
          couponedAt: null,
          expiresAt: null,
        });
      }
    }

    console.log(`Creating ${couponsToCreate.length} coupons...`);

    const { error: couponsError } = await supabase
      .from("coupons")
      .insert(couponsToCreate);

    if (couponsError) {
      console.error("Error creating coupons:", couponsError);
      return;
    }

    console.log("Created coupons successfully");

    // 4. Verify creation by counting
    const { count: participantCount, error: countError } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true })
      .eq("phoneNumber", testParticipant.phoneNumber);

    if (countError) {
      console.error("Error counting participants:", countError);
    } else {
      console.log("Participants with this phone number:", participantCount);
    }

    const { count: couponCount, error: couponCountError } = await supabase
      .from("coupons")
      .select("*", { count: "exact", head: true })
      .eq("id", authData.user.id);

    if (couponCountError) {
      console.error("Error counting coupons:", couponCountError);
    } else {
      console.log("Coupons created for this participant:", couponCount);
    }

    console.log("✅ Test completed successfully!");
    console.log(`✅ Created participant with ${couponCount} coupons`);
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the test
testParticipantCreation();
