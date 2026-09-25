export type AccessRule = 'public' | 'members' | 'paid';

export type Film = {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  genre: string;
  poster_path: string;
  backdrop_path: string;
  access_rule: AccessRule;
  launch_at: string;
  published: boolean;
  playback_package_key: string;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  role: 'viewer' | 'admin';
  display_name: string;
};
