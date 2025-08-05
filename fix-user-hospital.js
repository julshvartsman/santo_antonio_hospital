const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserHospital() {
  console.log('🔧 Fixing user hospital assignment...\n');

  // Configuration
  const userEmail = 'aaronsongnguyen@gmail.com'; // Replace with your email
  const hospitalName = 'Regional Hospital A'; // Replace with desired hospital

  console.log(`Fixing hospital assignment for: ${userEmail}`);
  console.log(`Target hospital: ${hospitalName}`);

  // Get hospital ID
  const { data: hospital, error: hospitalError } = await supabase
    .from('hospitals')
    .select('id, name')
    .eq('name', hospitalName)
    .single();

  if (hospitalError || !hospital) {
    console.error('Error finding hospital:', hospitalError);
    return;
  }

  console.log(`Found hospital: ${hospital.name} (ID: ${hospital.id})`);

  // Update user profile
  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update({ hospital_id: hospital.id })
    .eq('email', userEmail)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating profile:', updateError);
    return;
  }

  console.log('✅ Successfully updated user profile:');
  console.log('  Email:', updatedProfile.email);
  console.log('  Name:', updatedProfile.full_name);
  console.log('  Role:', updatedProfile.role);
  console.log('  Hospital ID:', updatedProfile.hospital_id);
  console.log('  Hospital Name:', hospital.name);

  // Verify the update
  const { data: verifyProfile, error: verifyError } = await supabase
    .from('profiles')
    .select('*, hospitals(name)')
    .eq('email', userEmail)
    .single();

  if (verifyError) {
    console.error('Error verifying update:', verifyError);
  } else {
    console.log('\n🔍 Verification:');
    console.log('  User:', verifyProfile.full_name);
    console.log('  Hospital:', verifyProfile.hospitals?.name);
    console.log('  Hospital ID:', verifyProfile.hospital_id);
  }
}

fixUserHospital().catch(console.error); 