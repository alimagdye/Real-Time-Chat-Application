import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config(); // Load .env file

const supabase = createClient( // Create a new Supabase client
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default supabase;
