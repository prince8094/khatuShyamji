const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://cqmvjlipklsnapvaocxc.supabase.co/";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbXZqbGlwa2xzbmFwdmFvY3hjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjg4MTE4NiwiZXhwIjoyMDk4NDU3MTg2fQ.tlzVrOq7M1P0XFPJ9v2URHziBHnnKVvBuoTQDxHQhow";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const adminUsers = [
  {
    admin_code: "ADM-001",
    name: "Nand Kumar",
    phone: "+91 98290 10001",
    email: "nand@khatushyamji.org",
    initials: "NK",
    roles: ["super-admin", "accommodation", "parking", "traffic", "lost-found", "temple-info", "donation", "emergency", "commerce"],
  },
  {
    admin_code: "ADM-002",
    name: "Deepika Verma",
    phone: "+91 98290 10002",
    email: "deepika@khatushyamji.org",
    initials: "DV",
    roles: ["accommodation"],
  },
  {
    admin_code: "ADM-003",
    name: "Vijay Kumar Gupta",
    phone: "+91 98290 10003",
    email: "vijay@khatushyamji.org",
    initials: "VKG",
    roles: ["parking"],
  },
  {
    admin_code: "ADM-004",
    name: "Prince Gupta",
    phone: "+91 98290 10004",
    email: "prince@khatushyamji.org",
    initials: "PG",
    roles: ["traffic", "emergency"],
  },
  {
    admin_code: "ADM-005",
    name: "Lost Found Coordinator",
    phone: "+91 98290 10005",
    email: "lostfound@khatushyamji.org",
    initials: "LFC",
    roles: ["lost-found"],
  }
];

async function seed() {
  console.log("Seeding admins using service role key...");
  
  // Fetch existing roles to confirm
  const { data: dbRoles, error: rolesErr } = await supabase.from('roles').select('key');
  if (rolesErr) {
    console.error("Error fetching roles:", rolesErr);
    return;
  }
  const roleKeys = dbRoles.map(r => r.key);
  console.log("Roles in database:", roleKeys);

  for (const item of adminUsers) {
    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('admin_code', item.admin_code)
      .maybeSingle();

    let adminId;
    if (existingAdmin) {
      console.log(`Admin ${item.admin_code} already exists.`);
      adminId = existingAdmin.id;
    } else {
      const { data: newAdmin, error: insertErr } = await supabase
        .from('admins')
        .insert({
          admin_code: item.admin_code,
          name: item.name,
          phone: item.phone,
          email: item.email,
          initials: item.initials,
          is_active: true
        })
        .select()
        .single();
      
      if (insertErr) {
        console.error(`Error inserting admin ${item.admin_code}:`, insertErr.message);
        continue;
      }
      console.log(`Inserted admin ${item.admin_code}`);
      adminId = newAdmin.id;
    }

    // Now seed the bridge
    for (const r of item.roles) {
      if (!roleKeys.includes(r)) {
        console.warn(`Warning: Role ${r} does not exist in roles table, skipping bridge entry.`);
        continue;
      }

      const { data: existingBridge } = await supabase
        .from('admin_roles_bridge')
        .select('*')
        .eq('admin_id', adminId)
        .eq('role_key', r)
        .maybeSingle();

      if (!existingBridge) {
        const { error: bridgeErr } = await supabase
          .from('admin_roles_bridge')
          .insert({
            admin_id: adminId,
            role_key: r
          });
        if (bridgeErr) {
          console.error(`Error inserting role bridge for ${item.admin_code} and role ${r}:`, bridgeErr.message);
        } else {
          console.log(`Linked ${item.admin_code} to role ${r}`);
        }
      }
    }
  }
  console.log("Seeding complete.");
}

seed();
