import { createClient } from '@/utils/supabase/client';

interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  [key: string]: string | number;
}

export async function getAllPlaces() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('places')
      .select('*')

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching places:', error)
    return { data: null, error }
  }
}

export async function getLikesOfPlace(id: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('place_id', id)

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching likes:', error)
    return { data: null, error }
  }
}

export async function getDislikesOfPlace(id: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('dislikes')
      .select('*')
      .eq('place_id', id)

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching dislikes:', error)
    return { data: null, error }
  }
}

export async function getAllUsersOfPlaceLikes(id: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('place_id', id)

    if (error) {
      throw error
    }

    const userIds = data.map((like) => like.user_id)

    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds)

    if (userError) {
      throw userError
    }

    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding')
      .select('*')
      .in('id', userIds)

    if (onboardingError) {
      throw onboardingError
    }

    userData.forEach((user) => {
      const onboarding = onboardingData.find((o) => o.id === user.id)
      if (onboarding) {
        Object.assign(user, onboarding)
      }
    })

    console.log(userData);

    const result = { data: userData as UserProfile[], error: null }
    return result
  } catch (error) {
    console.error('Error fetching users:', error)
    return { data: null, error }
  }
}

export async function getAllUsersOfPlaceDislikes(id: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('dislikes')
      .select('*')
      .eq('place_id', id)

    if (error) {
      throw error
    }

    const userIds = data.map((dislike) => dislike.user_id)

    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds)

    if (userError) {
      throw userError
    }

    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding')
      .select('*')
      .in('id', userIds)

    if (onboardingError) {
      throw onboardingError
    }

    userData.forEach((user) => {
      const onboarding = onboardingData.find((o) => o.id === user.id)
      if (onboarding) {
        Object.assign(user, onboarding)
      }
    })

    console.log(userData);

    const result = { data: userData as UserProfile[], error: null }
    return result
  } catch (error) {
    console.error('Error fetching users:', error)
    return { data: null, error }
  }
}

export async function calculateOnboardingStats(usersDataLikes: UserProfile[], usersDataDislikes: UserProfile[]) {
  const attributes = {
    "1": "Nightlife Enthusiast",
    "2": "Luxury-Seeking",
    "4": "Solitary",
    "9": "Adventurous",
    "10": "Social"
  };

  const likesStats = usersDataLikes.reduce((acc: { [key: string]: number }, user) => {
    Object.keys(attributes).forEach(key => {
      if (user[key] === 1) {
        acc[key] = (acc[key] || 0) + 1;
      }
    });
    return acc;
  }, {});

  const dislikesStats = usersDataDislikes.reduce((acc: { [key: string]: number }, user) => {
    Object.keys(attributes).forEach(key => {
      if (user[key] === 1) {
        acc[key] = (acc[key] || 0) + 1;
      }
    });
    return acc;
  }, {});

  // console.log(likesStats, dislikesStats);

  return Object.keys(attributes).map(key => ({
    attribute: attributes[key as keyof typeof attributes],
    likesData: likesStats[key] || 0,
    dislikesData: dislikesStats[key] || 0
  }));
}
