const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://cqmvjlipklsnapvaocxc.supabase.co/";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbXZqbGlwa2xzbmFwdmFvY3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4ODExODYsImV4cCI6MjA5ODQ1NzE4Nn0.DfyzUnFaeVN5HC7ohBBrwkudSrNv84JKbW3A-2qSD6c";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testOtp() {
  console.log("Requesting OTP for phone +919782877412...");
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: '+919782877412',
  });
  if (error) {
    console.error("OTP Error:", error.message);
  } else {
    console.log("OTP Success! Data:", data);
  }
}

testOtp();
