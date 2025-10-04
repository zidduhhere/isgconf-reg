import { createClient } from "@supabase/supabase-js";
import { Participant } from "../types";


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISH_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);




export const getParticipantDetails = async (id: string): Promise<Participant | null> => {
  console.log("Fetching participant details for ID:", id);
  
  try {
    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Failed to fetch participant details:", error.message);
      return null;
    }

    if (!data) {
      console.log("No participant data found for ID:", id);
      return null;
    }

    // Map database fields to TypeScript interface
    const participant: Participant = {
      id: data.id,
      phoneNumber: data.phoneNumber || data.phonenumber, // Handle case sensitivity
      name: data.name || '',
      familySize: data.familySize || data.familysize || 1, // Handle case sensitivity
      isFam: data.isFam || data.isfam || false // Handle case sensitivity
    };

    console.log("Successfully fetched participant:", participant);
    return participant;
  } catch (error) {
    console.error("Error in getParticipantDetails:", error);
    return null;
  }
}


export const getCouponDetails = async (id: string) => {
  const {data, error} = await supabase.from("coupons").select("*").eq("id", id).single();
  if (error) {
    throw new Error(`Failed to fetch coupon details: ${error.message}`);
  }
  console.log("Fetched coupon details:", data);
  return data;
}