const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://cqmvjlipklsnapvaocxc.supabase.co/";
const supabaseAnonKey = "sb_publishable_4FcmzO419ZXj8f_qSuY4rw_2KMm3zrG";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('volunteer_applications').select('*').limit(1);
  if (error) {
    console.error("Error fetching volunteer_applications:", error.message);
  } else {
    console.log("Success! volunteer_applications fetched:", data);
  }
}

test();
