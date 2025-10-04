// Test script to add sample data to verify admin panel works
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fyralscanbvwgvhrfucq.supabase.co";
const supabaseKey = "sb_publishable_s5FTlyKBIncxBoWql1Qh1w_aS11wTIJ";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCouponStatus() {
  console.log("Checking coupon status distribution...");

  try {
    // Get coupon status breakdown
    const { data: coupons, error } = await supabase
      .from("coupons")
      .select("status, mealSlotId")
      .limit(10);

    if (error) {
      console.error("Error fetching coupons:", error);
      return;
    }

    console.log("Sample coupons:");
    coupons.forEach((coupon, index) => {
      console.log(
        `  ${index + 1}. Status: ${coupon.status}, MealSlot: ${
          coupon.mealSlotId
        }`
      );
    });

    // Get status counts
    const { data: allCoupons, error: countError } = await supabase
      .from("coupons")
      .select("status");

    if (countError) {
      console.error("Error fetching all coupons:", countError);
      return;
    }

    const trueCount = allCoupons.filter((c) => c.status === true).length;
    const falseCount = allCoupons.filter((c) => c.status === false).length;

    console.log(`\nStatus distribution:`);
    console.log(`  status = true:  ${trueCount} coupons`);
    console.log(`  status = false: ${falseCount} coupons`);
    console.log(`  Total: ${allCoupons.length} coupons`);
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

checkCouponStatus();
