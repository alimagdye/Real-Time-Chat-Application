import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

export const supabase = createClient(
  // Create a new Supabase client
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
