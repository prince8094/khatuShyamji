const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://cqmvjlipklsnapvaocxc.supabase.co/";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbXZqbGlwa2xzbmFwdmFvY3hjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjg4MTE4NiwiZXhwIjoyMDk4NDU3MTg2fQ.tlzVrOq7M1P0XFPJ9v2URHziBHnnKVvBuoTQDxHQhow";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data: admins, error } = await supabase.from('admins').select(`
    *,
    admin_roles_bridge (
      role_key
    )
  `);
  if (error) {
    console.error("Error fetching admins:", error);
  } else {
    console.log("Admins and their roles in database:");
    admins.forEach(a => {
      console.log(`- ${a.admin_code}: ${a.name} (${a.email}) -> Roles: ${a.admin_roles_bridge.map(b => b.role_key).join(', ')}`);
    });
  }
}

check();
