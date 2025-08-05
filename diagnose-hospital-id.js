const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseHospitalId() {
  console.log('🔍 Diagnosing hospital_id issue...\n');

  // 1. Check hospitals table
  console.log('🏥 Hospitals in database:');
  const { data: hospitals, error: hospitalsError } = await supabase
    .from('hospitals')
    .select('*');
  
  if (hospitalsError) {
    console.error('Error fetching hospitals:', hospitalsError);
  } else {
    hospitals.forEach(hospital => {
      console.log(`  - ${hospital.name} (ID: ${hospital.id})`);
    });
  }

  // 2. Check all profiles
  console.log('\n👥 All profiles:');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');
  
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
  } else {
    profiles.forEach(profile => {
      console.log(`  - ${profile.full_name} (${profile.email})`);
      console.log(`    Role: ${profile.role}`);
      console.log(`    Hospital ID: ${profile.hospital_id || 'NULL'}`);
      console.log(`    Created: ${profile.created_at}`);
      console.log('');
    });
  }

  // 3. Check auth.users metadata
  console.log('\n🔐 Auth users metadata:');
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching auth users:', authError);
  } else {
    authUsers.users.forEach(user => {
      console.log(`  - ${user.email}`);
      console.log(`    Metadata:`, user.user_metadata);
      console.log('');
    });
  }

  // 4. Check entries table
  console.log('\n📊 Recent entries:');
  const { data: entries, error: entriesError } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (entriesError) {
    console.error('Error fetching entries:', entriesError);
  } else {
    entries.forEach(entry => {
      console.log(`  - Entry ID: ${entry.id}`);
      console.log(`    Hospital ID: ${entry.hospital_id || 'NULL'}`);
      console.log(`    User ID: ${entry.user_id}`);
      console.log(`    Month: ${entry.month_year}`);
      console.log('');
    });
  }

  // 5. Summary
  console.log('\n📋 Summary:');
  const usersWithoutHospital = profiles.filter(p => !p.hospital_id);
  console.log(`Total profiles: ${profiles.length}`);
  console.log(`Profiles with hospital_id: ${profiles.length - usersWithoutHospital.length}`);
  console.log(`Profiles without hospital_id: ${usersWithoutHospital.length}`);
  
  if (usersWithoutHospital.length > 0) {
    console.log('\n⚠️  Users without hospital_id:');
    usersWithoutHospital.forEach(user => {
      console.log(`  - ${user.full_name} (${user.email})`);
    });
  }
}

diagnoseHospitalId().catch(console.error); 