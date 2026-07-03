const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://cqmvjlipklsnapvaocxc.supabase.co/";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbXZqbGlwa2xzbmFwdmFvY3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4ODExODYsImV4cCI6MjA5ODQ1NzE4Nn0.DfyzUnFaeVN5HC7ohBBrwkudSrNv84JKbW3A-2qSD6c";

// 1. Create a client with anon key (simulating the client)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSelfHealing() {
  console.log("Simulating admin self-healing update...");
  
  // We need to fetch the admin record first to see what's in there
  // Since we are anonymous, can we select from admins?
  // Let's check
  const { data: adminRecord, error: selectErr } = await supabase
    .from("admins")
    .select("*")
    .eq("admin_code", "ADM-001")
    .maybeSingle();

  if (selectErr) {
    console.error("Select error:", selectErr.message);
  } else {
    console.log("Select result (adminRecord):", adminRecord);
  }
}

testSelfHealing();
