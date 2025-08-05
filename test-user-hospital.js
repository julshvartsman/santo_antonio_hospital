const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserHospital() {
  console.log('🔍 Testing user hospital assignment...\n');

  // Test with Aaron's email (replace with your email if different)
  const testEmail = 'aaronsongnguyen@gmail.com';
  
  console.log(`Testing for user: ${testEmail}`);

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', testEmail)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return;
  }

  console.log('Profile found:');
  console.log('  ID:', profile.id);
  console.log('  Email:', profile.email);
  console.log('  Name:', profile.full_name);
  console.log('  Role:', profile.role);
  console.log('  Hospital ID:', profile.hospital_id);
  console.log('  Created:', profile.created_at);

  // Get hospital details
  if (profile.hospital_id) {
    const { data: hospital, error: hospitalError } = await supabase
      .from('hospitals')
      .select('*')
      .eq('id', profile.hospital_id)
      .single();

    if (hospitalError) {
      console.error('Error fetching hospital:', hospitalError);
    } else {
      console.log('\nHospital details:');
      console.log('  ID:', hospital.id);
      console.log('  Name:', hospital.name);
      console.log('  Location:', hospital.location);
    }
  } else {
    console.log('\n⚠️  No hospital assigned to this user');
  }

  // Test auth session
  console.log('\n🔐 Testing auth session...');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Session error:', sessionError);
  } else if (session) {
    console.log('Session found for user:', session.user.email);
    console.log('User metadata:', session.user.user_metadata);
  } else {
    console.log('No active session found');
  }
}

testUserHospital().catch(console.error); 