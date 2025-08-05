// Test Supabase Connection
// Run this with: node test-supabase-connection.js

const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl ? "Set" : "Missing");
console.log("Supabase Key:", supabaseKey ? "Set" : "Missing");

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log("🔍 Testing Supabase connection...");

    // Test basic connection
    const { data, error } = await supabase
      .from("hospitals")
      .select("id, name, location")
      .limit(1);

    if (error) {
      console.error("❌ Supabase error:", error);
      return;
    }

    console.log("✅ Supabase connection successful!");
    console.log("📊 Hospitals found:", data?.length || 0);

    if (data && data.length > 0) {
      console.log("🏥 Sample hospital:", data[0]);
    }
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
}

testConnection();
