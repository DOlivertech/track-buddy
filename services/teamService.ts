import AsyncStorage from '@react-native-async-storage/async-storage';
import { Team, TeamMember, TeamSession } from '@/types/team';
import { AppData } from '@/types/user';
import { apiService } from './apiService';

class TeamService {
  private readonly TEAMS_KEY = 'racing_weather_teams';
  private readonly TEAM_SESSIONS_PREFIX = 'racing_weather_team_session_';

  // Get all teams for current user
  async getUserTeams(): Promise<Team[]> {
    try {
      const teams = await AsyncStorage.getItem(this.TEAMS_KEY);
      const teamList: Team[] = teams ? JSON.parse(teams) : [];
      
      // Ensure demo team is always present
      const demoTeamExists = teamList.some(t => t.id === 'demo-team-001');
      if (!demoTeamExists) {
        const demoTeam = this.createDemoTeam();
        teamList.unshift(demoTeam);
        await this.saveTeams(teamList);
        
        // Initialize demo team sessions
        await this.initializeDemoTeamSessions();
      }
      
      return teamList;
    } catch (error) {
      console.error('Error loading teams:', error);
      return [];
    }
  }

  // Save teams list
  private async saveTeams(teams: Team[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.TEAMS_KEY, JSON.stringify(teams));
    } catch (error) {
      console.error('Error saving teams:', error);
    }
  }

  // Create a new team
  async createTeam(teamData: {
    name: string;
    description?: string;
    emoji?: string;
    imageUrl?: string;
  }): Promise<Team> {
    try {
      const teamId = Date.now().toString();
      const newTeam: Team = {
        id: teamId,
        name: teamData.name.trim(),
        description: teamData.description?.trim(),
        emoji: teamData.emoji?.trim(),
        imageUrl: teamData.imageUrl?.trim(),
        members: [
          {
            id: 'current-user',
            name: 'You',
            email: 'user@example.com',
            role: 'admin',
            joinedAt: new Date().toISOString()
          }
        ],
        sessions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const teams = await this.getUserTeams();
      teams.push(newTeam);
      await this.saveTeams(teams);

      console.log('✅ Created new team:', newTeam);
      return newTeam;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  // Get team sessions
  async getTeamSessions(teamId: string): Promise<TeamSession[]> {
    try {
      const sessions = await AsyncStorage.getItem(`${this.TEAM_SESSIONS_PREFIX}${teamId}`);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Error loading team sessions:', error);
      return [];
    }
  }

  // Save team sessions
  async saveTeamSessions(teamId: string, sessions: TeamSession[]): Promise<void> {
    try {
      await AsyncStorage.setItem(`${this.TEAM_SESSIONS_PREFIX}${teamId}`, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving team sessions:', error);
    }
  }

  // Add team member (Team Admin only)
  async addTeamMember(teamId: string, email: string, role: TeamMember['role']): Promise<boolean> {
    try {
      // In a real app, this would send an API request to invite the user
      const result = await apiService.inviteTeamMember(teamId, email, role);
      
      if (result.success) {
        // Update local team data
        const teams = await this.getUserTeams();
        const teamIndex = teams.findIndex(t => t.id === teamId);
        
        if (teamIndex !== -1) {
          const newMember: TeamMember = {
            id: Date.now().toString(),
            name: result.user?.name || email.split('@')[0],
            email: email,
            role: role,
            joinedAt: new Date().toISOString(),
            profileImage: result.user?.profileImage
          };
          
          teams[teamIndex].members.push(newMember);
          teams[teamIndex].updatedAt = new Date().toISOString();
          await this.saveTeams(teams);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error adding team member:', error);
      return false;
    }
  }

  // Update team member (Team Admin and Crew Chief)
  async updateTeamMember(teamId: string, memberId: string, updates: Partial<TeamMember>): Promise<boolean> {
    try {
      const teams = await this.getUserTeams();
      const teamIndex = teams.findIndex(t => t.id === teamId);
      
      if (teamIndex === -1) return false;
      
      const memberIndex = teams[teamIndex].members.findIndex(m => m.id === memberId);
      if (memberIndex === -1) return false;
      
      teams[teamIndex].members[memberIndex] = {
        ...teams[teamIndex].members[memberIndex],
        ...updates
      };
      teams[teamIndex].updatedAt = new Date().toISOString();
      
      await this.saveTeams(teams);
      return true;
    } catch (error) {
      console.error('Error updating team member:', error);
      return false;
    }
  }

  // Remove team member (Team Admin only)
  async removeTeamMember(teamId: string, memberId: string): Promise<boolean> {
    try {
      const teams = await this.getUserTeams();
      const teamIndex = teams.findIndex(t => t.id === teamId);
      
      if (teamIndex === -1) return false;
      
      teams[teamIndex].members = teams[teamIndex].members.filter(m => m.id !== memberId);
      teams[teamIndex].updatedAt = new Date().toISOString();
      
      await this.saveTeams(teams);
      return true;
    } catch (error) {
      console.error('Error removing team member:', error);
      return false;
    }
  }

  // Create demo team
  private createDemoTeam(): Team {
    return {
      id: 'demo-team-001',
      name: 'Demo Racing Team',
      description: 'Sample team to explore collaboration features',
      emoji: '🏎️',
      imageUrl: 'https://images.pexels.com/photos/358220/pexels-photo-358220.jpeg?auto=compress&cs=tinysrgb&w=400',
      members: [
        {
          id: 'demo-member-001',
          name: 'You',
          email: 'you@example.com',
          role: 'admin',
          joinedAt: '2024-01-01T00:00:00.000Z',
          profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200'
        },
        {
          id: 'demo-member-002',
          name: 'Alex Rodriguez',
          email: 'alex@racingteam.com',
          role: 'crew_chief',
          joinedAt: '2024-01-02T00:00:00.000Z',
          profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200'
        },
        {
          id: 'demo-member-003',
          name: 'Sarah Chen',
          email: 'sarah@racingteam.com',
          role: 'driver',
          joinedAt: '2024-01-03T00:00:00.000Z',
          profileImage: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=200'
        },
        {
          id: 'demo-member-004',
          name: 'Mike Johnson',
          email: 'mike@racingteam.com',
          role: 'member',
          joinedAt: '2024-01-04T00:00:00.000Z',
          profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200'
        }
      ],
      sessions: [
        {
          id: 'demo-team-session-001',
          name: 'Silverstone Practice Data',
          description: 'Shared practice session data from Silverstone',
          trackId: 'silverstone',
          createdBy: 'demo-member-002',
          createdAt: '2024-01-15T00:00:00.000Z',
          lastModified: '2024-01-15T14:30:00.000Z'
        },
        {
          id: 'demo-team-session-002',
          name: 'Monaco Qualifying Setup',
          description: 'Team qualifying setup and strategy notes',
          trackId: 'monaco',
          createdBy: 'demo-member-001',
          createdAt: '2024-02-20T00:00:00.000Z',
          lastModified: '2024-02-20T15:45:00.000Z'
        }
      ],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      isDemo: true
    };
  }

  // Initialize demo team sessions with data
  private async initializeDemoTeamSessions(): Promise<void> {
    try {
      const demoSessionData: AppData = {
        user: {
          id: 'demo-team-user',
          name: 'Team Member',
          email: 'team@example.com',
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        notes: [
          {
            id: 'demo-team-note-001',
            trackId: 'silverstone',
            title: 'Team Practice Session Notes',
            content: 'Shared observations from the team practice session. Car balance was good in high-speed corners.',
            type: 'condition',
            session: {
              type: 'practice',
              number: 1,
              date: '2024-01-15'
            },
            createdAt: '2024-01-15T14:30:00.000Z',
            updatedAt: '2024-01-15T14:30:00.000Z'
          }
        ],
        setups: [
          {
            id: 'demo-team-setup-001',
            trackId: 'silverstone',
            name: 'Team Qualifying Setup',
            date: '2024-01-15',
            notes: 'Shared team setup for qualifying session',
            setupData: {
              tirePressures: {
                frontLeft: '32.0',
                frontRight: '32.0',
                rearLeft: '30.5',
                rearRight: '30.5'
              },
              springRates: {
                frontLeft: '65',
                frontRight: '65',
                rearLeft: '85',
                rearRight: '85'
              },
              swayBars: {
                front: '3',
                rear: '5'
              },
              wings: {
                front: '7',
                rear: '5'
              },
              fuelLevel: '110L'
            },
            createdAt: '2024-01-15T14:00:00.000Z',
            updatedAt: '2024-01-15T14:00:00.000Z'
          }
        ],
        raceWeekends: [],
        settings: {
          temperatureUnit: 'celsius',
          windSpeedUnit: 'kmh',
          precipitationUnit: 'mm',
          selectedTrack: 'silverstone'
        },
        favorites: ['silverstone', 'monaco'],
        sessionId: 'demo-team-session-001',
        exportedAt: '2024-01-01T00:00:00.000Z',
        version: '1.0.0'
      };

      // Save demo team session data
      await AsyncStorage.setItem(
        `${this.TEAM_SESSIONS_PREFIX}demo-team-001_demo-team-session-001`,
        JSON.stringify(demoSessionData)
      );

      console.log('✅ Demo team sessions initialized');
    } catch (error) {
      console.error('Error initializing demo team sessions:', error);
    }
  }

  // Load team session data
  async loadTeamSession(teamId: string, sessionId: string): Promise<AppData | null> {
    try {
      const sessionKey = `${this.TEAM_SESSIONS_PREFIX}${teamId}_${sessionId}`;
      const data = await AsyncStorage.getItem(sessionKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading team session data:', error);
      return null;
    }
  }

  // Load team session and switch app context
  async switchToTeamSession(teamId: string, sessionId: string): Promise<boolean> {
    try {
      console.log('🔄 Switching to team session:', teamId, sessionId);
      
      // First, save current session data if there's an active session
      const { sessionService } = await import('./sessionService');
      const currentActiveId = await sessionService.getActiveSessionId();
      if (currentActiveId) {
        console.log('💾 Saving current session before switching...');
        await sessionService.saveCurrentDataToSession(currentActiveId);
      }

      // Load the team session data
      const teamSessionData = await this.loadTeamSession(teamId, sessionId);
      if (!teamSessionData) {
        console.error('❌ Team session data not found');
        return false;
      }

      // Clear current data and load team session data
      const { userService } = await import('./userService');
      await userService.resetCurrentSessionData();
      await userService.loadDataFromSession(teamSessionData);

      // Set this as the active session (using team session ID format)
      const teamSessionKey = `${teamId}_${sessionId}`;
      await sessionService.setActiveSessionId(teamSessionKey);
      
      console.log('✅ Successfully switched to team session');
      return true;
    } catch (error) {
      console.error('Error switching to team session:', error);
      return false;
    }
  }

  // Save team session data
  async saveTeamSessionData(teamId: string, sessionId: string, data: AppData): Promise<void> {
    try {
      const sessionKey = `${this.TEAM_SESSIONS_PREFIX}${teamId}_${sessionId}`;
      await AsyncStorage.setItem(sessionKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving team session data:', error);
    }
  }

  // Get user's role in a team
  getUserRole(team: Team, userId: string = 'current-user'): TeamMember['role'] | null {
    const member = team.members.find(m => m.id === userId || m.id === 'demo-member-001');
    return member?.role || null;
  }

  // Check if user can manage team members
  canManageMembers(team: Team, userId: string = 'current-user'): boolean {
    const role = this.getUserRole(team, userId);
    return role === 'admin';
  }

  // Check if user can edit member roles
  canEditMemberRoles(team: Team, userId: string = 'current-user'): boolean {
    const role = this.getUserRole(team, userId);
    return role === 'admin' || role === 'crew_chief';
  }

  // Check if team is demo team
  isDemoTeam(teamId: string): boolean {
    return teamId === 'demo-team-001';
  }
}

export const teamService = new TeamService();