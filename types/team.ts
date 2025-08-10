export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'crew_chief' | 'driver' | 'member';
  joinedAt: string;
  profileImage?: string;
  phone?: string;
  countryCode?: string;
}

export interface TeamSession {
  id: string;
  name: string;
  description?: string;
  trackId?: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  imageUrl?: string;
  members: TeamMember[];
  sessions: TeamSession[];
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: TeamMember['role'];
  invitedBy: string;
  invitedAt: string;
  status: 'pending' | 'accepted' | 'declined';
}