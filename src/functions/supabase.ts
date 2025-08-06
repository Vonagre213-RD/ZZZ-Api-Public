import { createClient } from "@supabase/supabase-js";
import { configDotenv } from "dotenv";

configDotenv();

export const supaBase = createClient(process.env.DATABASEURL!, process.env.SUPABASEKEY!);