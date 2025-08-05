const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client (you'll need to add your credentials)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking database state...\n');

  // Check hospitals table
  console.log('🏥 Hospitals:');
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

  console.log('\n👥 Profiles:');
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
      console.log('');
    });
  }

  // Check if there are any users without hospital_id
  const usersWithoutHospital = profiles.filter(p => !p.hospital_id);
  if (usersWithoutHospital.length > 0) {
    console.log('⚠️  Users without hospital_id:');
    usersWithoutHospital.forEach(user => {
      console.log(`  - ${user.full_name} (${user.email})`);
    });
  }
}

checkDatabase().catch(console.error); 