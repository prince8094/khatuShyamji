const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: 'c:/Users/princ/KhatuShyamji/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl, supabaseSecret);

async function check() {
  const { data, error } = await supabase
    .from('found_items')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error reading found_items:", error);
  } else {
    console.log("found_items row exists, keys:", data && data.length > 0 ? Object.keys(data[0]) : "Empty table");
  }
}

check();
