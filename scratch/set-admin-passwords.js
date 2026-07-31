const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: 'c:/Users/princ/KhatuShyamji/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cqmvjlipklsnapvaocxc.supabase.co/";
const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

if (!supabaseSecret) {
  console.error("SUPABASE_SECRET_KEY is missing in env!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecret, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

function generatePassword(name) {
  // Generate a clean, easy-to-read but strong password
  const cleanName = name.replace(/[^a-zA-Z]/g, '').slice(0, 5);
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let rand = "";
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Format: Shyam@Name12345
  return `Shyam@${cleanName}${rand}`;
}

async function run() {
  console.log("Fetching all admins from database...");
  const { data: admins, error } = await supabase.from('admins').select('*');
  if (error) {
    console.error("Error fetching admins:", error);
    return;
  }

  console.log(`Found ${admins.length} admin records.`);

  // List existing auth users to avoid duplicates/find matching emails
  const { data: authData, error: authListError } = await supabase.auth.admin.listUsers();
  if (authListError) {
    console.error("Error listing auth users:", authListError);
    return;
  }
  const authUsers = authData.users || [];

  const results = [];

  for (const admin of admins) {
    const password = generatePassword(admin.name);
    console.log(`\nProcessing ${admin.admin_code}: ${admin.name} (${admin.email})...`);

    let finalAuthUserId = admin.auth_user_id;
    let authUser = authUsers.find(u => u.email === admin.email);

    if (finalAuthUserId) {
      console.log(`Admin has existing auth_user_id: ${finalAuthUserId}. Resetting password...`);
      const { data, error: updateErr } = await supabase.auth.admin.updateUserById(finalAuthUserId, {
        password: password,
        email_confirm: true
      });
      if (updateErr) {
        console.error(`Failed to reset password for ${admin.admin_code}:`, updateErr.message);
      } else {
        console.log(`Password reset successful.`);
      }
    } else if (authUser) {
      console.log(`Found existing auth user with email ${admin.email} (ID: ${authUser.id}). Linking and updating password...`);
      const { data, error: updateErr } = await supabase.auth.admin.updateUserById(authUser.id, {
        password: password,
        email_confirm: true
      });
      if (updateErr) {
        console.error(`Failed to update password for ${admin.admin_code}:`, updateErr.message);
      }

      // Link in admins table
      const { error: linkErr } = await supabase
        .from('admins')
        .update({ auth_user_id: authUser.id })
        .eq('id', admin.id);

      if (linkErr) {
        console.error(`Failed to link auth_user_id in admins table:`, linkErr.message);
      } else {
        console.log(`Linked successfully.`);
        finalAuthUserId = authUser.id;
      }
    } else {
      console.log(`No auth user found for email ${admin.email}. Creating new auth user...`);
      const { data: signUpData, error: createErr } = await supabase.auth.admin.createUser({
        email: admin.email,
        password: password,
        email_confirm: true
      });

      if (createErr) {
        console.error(`Failed to create auth user for ${admin.admin_code}:`, createErr.message);
      } else if (signUpData && signUpData.user) {
        const newUserId = signUpData.user.id;
        console.log(`Created auth user (ID: ${newUserId}). Linking in admins table...`);

        const { error: linkErr } = await supabase
          .from('admins')
          .update({ auth_user_id: newUserId })
          .eq('id', admin.id);

        if (linkErr) {
          console.error(`Failed to link auth_user_id in admins table:`, linkErr.message);
        } else {
          console.log(`Created and linked successfully.`);
          finalAuthUserId = newUserId;
        }
      }
    }

    results.push({
      admin_code: admin.admin_code,
      name: admin.name,
      email: admin.email,
      phone: admin.phone || 'N/A',
      password: password,
      auth_user_id: finalAuthUserId || 'Failed'
    });
  }

  // Write credentials to file
  const credentialsFilePath = 'c:/Users/princ/KhatuShyamji/admin-credentials.md';
  let fileContent = `# Khatu Shyam Ji Dham - Admin Credentials\n\n`;
  fileContent += `Generated on: ${new Date().toLocaleString()}\n\n`;
  fileContent += `| Admin Code | Name | Email | Phone | Password |\n`;
  fileContent += `| --- | --- | --- | --- | --- |\n`;
  for (const res of results) {
    fileContent += `| **${res.admin_code}** | ${res.name} | ${res.email} | ${res.phone} | \`${res.password}\` |\n`;
  }
  fileContent += `\n> **Note:** Keep this file safe and delete it from production environments once credentials are secure.\n`;

  fs.writeFileSync(credentialsFilePath, fileContent);
  console.log(`\nSuccess! Saved admin credentials to: ${credentialsFilePath}`);
}

run();
