const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://cqmvjlipklsnapvaocxc.supabase.co/";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbXZqbGlwa2xzbmFwdmFvY3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4ODExODYsImV4cCI6MjA5ODQ1NzE4Nn0.DfyzUnFaeVN5HC7ohBBrwkudSrNv84JKbW3A-2qSD6c";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const { data, error } = await supabase.from('profiles').insert({
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Test',
    phone: '+919999999999',
    provider: 'google'
  });
  console.log("Insert result:", data, "Error:", error);
}

testInsert();
