const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixExistingUsers() {
  console.log('🔧 Fixing existing users without hospital assignments...\n');

  // Get all profiles without hospital_id
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .is('hospital_id', null);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return;
  }

  console.log(`Found ${profiles.length} users without hospital assignments`);

  for (const profile of profiles) {
    console.log(`\nProcessing user: ${profile.full_name} (${profile.email})`);
    
    // Get user metadata from auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id);
    
    if (authError) {
      console.error(`Error getting auth user for ${profile.email}:`, authError);
      continue;
    }

    const hospitalName = authUser.user?.user_metadata?.hospital;
    
    if (hospitalName) {
      console.log(`Found hospital in metadata: ${hospitalName}`);
      
      // Get hospital ID
      const { data: hospital, error: hospitalError } = await supabase
        .from('hospitals')
        .select('id')
        .eq('name', hospitalName)
        .single();

      if (hospital && !hospitalError) {
        // Update profile with hospital_id
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ hospital_id: hospital.id })
          .eq('id', profile.id);

        if (updateError) {
          console.error(`Error updating profile for ${profile.email}:`, updateError);
        } else {
          console.log(`✅ Successfully assigned hospital ${hospitalName} to ${profile.email}`);
        }
      } else {
        console.error(`Hospital not found: ${hospitalName}`);
      }
    } else {
      console.log(`No hospital found in metadata for ${profile.email}`);
    }
  }

  console.log('\n✅ Finished fixing existing users');
}

fixExistingUsers().catch(console.error); 