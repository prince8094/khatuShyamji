const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: 'c:/Users/princ/KhatuShyamji/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl, supabaseSecret);

async function find() {
  const { data, error } = await supabase.from('profiles').select('id, name').limit(1);
  if (error) {
    console.error("Error reading profiles:", error);
  } else {
    console.log("Valid profile:", data);
  }
}

find();
