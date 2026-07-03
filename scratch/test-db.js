const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://cqmvjlipklsnapvaocxc.supabase.co/";
const supabaseAnonKey = "sb_publishable_4FcmzO419ZXj8f_qSuY4rw_2KMm3zrG";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tables = [
  'profiles',
  'admins',
  'roles',
  'admin_roles_bridge',
  'darshan_bookings',
  'darshan_booking_members',
  'hotels',
  'hotel_bookings',
  'parking_blocks',
  'parking_history',
  'traffic_routes',
  'traffic_alerts',
  'seva_masters',
  'seva_bookings',
  'donations',
  'prashad_items',
  'prashad_orders',
  'prashad_order_items',
  'transport_vehicles',
  'transport_bookings',
  'bus_routes',
  'bus_bookings',
  'restaurants',
  'restaurant_reservations',
  'offering_items',
  'offering_orders',
  'offering_order_items',
  'lost_items',
  'found_items',
  'claim_history',
  'emergency_requests',
  'emergency_contacts',
  'temple_information',
  'announcements',
  'announcement_translations',
  'feedback',
  'approval_queue',
  'device_tokens',
  'notifications',
  'notification_recipients',
  'notification_logs',
  'qr_scans',
  'audit_logs'
];

async function checkTables() {
  console.log("Checking tables in database...");
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ Table "${table}": Error ->`, error.message);
    } else {
      console.log(`✅ Table "${table}": OK`);
    }
  }
}

checkTables();
