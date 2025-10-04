// Test script to set all coupon status to true (available)
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fyralscanbvwgvhrfucq.supabase.co";
const supabaseKey = "sb_publishable_s5FTlyKBIncxBoWql1Qh1w_aS11wTIJ";

const supabase = createClient(supabaseUrl, supabaseKey);

async function setCouponsToAvailable() {
  console.log("Setting all coupons to available status (true)...");

  try {
    // Update all coupons to status = true (available)
    const { data, error } = await supabase
      .from("coupons")
      .update({
        status: true, // true = available
        couponedAt: null,
        expiresAt: null,
      })
      .select();

    if (error) {
      console.error("Error updating coupons:", error);
      return;
    }

    console.log(
      `Successfully updated ${data.length} coupons to available status`
    );

    // Verify the update by checking status distribution
    const { data: statusCheck, error: statusError } = await supabase
      .from("coupons")
      .select("status")
      .order("status");

    if (statusError) {
      console.error("Error checking status:", statusError);
    } else {
      const trueCount = statusCheck.filter((c) => c.status === true).length;
      const falseCount = statusCheck.filter((c) => c.status === false).length;
      console.log(`Status distribution after update:`);
      console.log(`- Available (true): ${trueCount}`);
      console.log(`- Claimed (false): ${falseCount}`);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

async function setCouponsToClaimedForTesting() {
  console.log("Setting some coupons to claimed status (false) for testing...");

  try {
    // Update first 10 coupons to status = false (claimed)
    const { data: coupons, error: fetchError } = await supabase
      .from("coupons")
      .select("uniqueId")
      .limit(10);

    if (fetchError) {
      console.error("Error fetching coupons:", fetchError);
      return;
    }

    const couponIds = coupons.map((c) => c.uniqueId);

    const { data, error } = await supabase
      .from("coupons")
      .update({
        status: false, // false = claimed
        couponedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
      })
      .in("uniqueId", couponIds)
      .select();

    if (error) {
      console.error("Error updating test coupons:", error);
      return;
    }

    console.log(
      `Successfully set ${data.length} coupons to claimed status for testing`
    );
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

async function main() {
  console.log("Coupon Status Test Script");
  console.log("=========================");

  // Get initial status
  const { data: initial, error: initialError } = await supabase
    .from("coupons")
    .select("status")
    .order("status");

  if (initialError) {
    console.error("Error getting initial status:", initialError);
    return;
  }

  const initialTrue = initial.filter((c) => c.status === true).length;
  const initialFalse = initial.filter((c) => c.status === false).length;
  console.log(`Initial status distribution:`);
  console.log(`- Available (true): ${initialTrue}`);
  console.log(`- Claimed (false): ${initialFalse}`);
  console.log("");

  // First, set all coupons to available
  await setCouponsToAvailable();
  console.log("");

  // Then set some to claimed for testing
  await setCouponsToClaimedForTesting();
  console.log("");

  // Final status check
  const { data: final, error: finalError } = await supabase
    .from("coupons")
    .select("status")
    .order("status");

  if (finalError) {
    console.error("Error getting final status:", finalError);
    return;
  }

  const finalTrue = final.filter((c) => c.status === true).length;
  const finalFalse = final.filter((c) => c.status === false).length;
  console.log(`Final status distribution:`);
  console.log(`- Available (true): ${finalTrue}`);
  console.log(`- Claimed (false): ${finalFalse}`);
}

main();
