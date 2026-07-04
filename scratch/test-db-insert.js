const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: 'c:/Users/princ/KhatuShyamji/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl, supabaseSecret);

async function test() {
  console.log("Testing found_items insert...");
  const { data: item, error: itemErr } = await supabase
    .from('found_items')
    .insert({
      item_name: 'Golden Watch',
      description: 'Gold-plated watch found near main steps',
      location_found: 'Sanctum Steps',
      date_found: new Date().toISOString().split('T')[0],
      time_found: '10:30 AM',
      storage_location: 'Safe Cabinet A',
      found_by: 'Volunteer Ramesh',
      status: 'Found',
      remarks: 'Minor scratches',
      category: 'Electronics',
      item_color: 'Gold'
    })
    .select()
    .single();

  if (itemErr) {
    console.error("found_items insert failed:", itemErr);
    return;
  }
  console.log("found_items insert succeeded:", item);

  console.log("Testing claim_requests insert...");
  const { data: claim, error: claimErr } = await supabase
    .from('claim_requests')
    .insert({
      found_item_id: item.id,
      profile_id: 'a994f509-3f39-4643-a62e-a61c4e944427',
      claimant_name: 'Devotee Amit',
      identity_proof_type: 'Aadhaar',
      identity_proof_number: '1234-5678-9012',
      claim_description: 'It has a brown strap and engraving on the back.',
      status: 'pending'
    })
    .select()
    .single();

  if (claimErr) {
    console.error("claim_requests insert failed:", claimErr);
  } else {
    console.log("claim_requests insert succeeded:", claim);
    // Cleanup
    await supabase.from('claim_requests').delete().eq('id', claim.id);
  }

  // Cleanup
  await supabase.from('found_items').delete().eq('id', item.id);
}

test();
