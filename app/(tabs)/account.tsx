import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal,
  Image,
  Switch,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomAlert } from '@/components/CustomAlert';
import { useUser } from '@/contexts/UserContext';
import { ImageUploader } from '@/components/ImageUploader';
import { CountryPicker } from 'react-native-country-picker-modal';
import { teamService } from '@/services/teamService';
import { sessionService } from '@/services/sessionService';
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { Team, TeamMember, TeamRole } from '@/types/team';
import { SessionMetadata } from '@/types/user';
import { 
  User, 
  Settings, 
  Users, 
  Crown, 
  Shield, 
  Car, 
  UserCheck,
  Plus, 
  RefreshCcw, 
  Mail, 
  Phone,
  Globe,
  ChevronRight,
  Trash2,
  Edit3,
  Camera,
  Upload,
  X,
  Check,
  AlertTriangle,
  Zap,
  FileText
} from 'lucide-react-native';

export default function AccountScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, updateUser } = useUser();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamSessions, setTeamSessions] = useState<{ [teamId: string]: SessionMetadata[] }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    countryCode: 'US',
    profileImage: ''
  });
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  
  // Team creation state
  const [createTeamModalVisible, setCreateTeamModalVisible] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    emoji: '',
    imageUrl: ''
  });
  
  // Team member management state
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [memberForm, setMemberForm] = useState({
    email: '',
    role: 'team_member' as TeamRole
  });

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      console.log('👤 [Account] Starting loadData...');
      
      // Load user teams
      const userTeams = await teamService.getUserTeams();
      console.log('👤 [Account] Loaded teams:', userTeams.length);
      setTeams(userTeams);
      
      // Load team sessions for each team
      const sessionsData: { [teamId: string]: SessionMetadata[] } = {};
      for (const team of userTeams) {
        try {
          const sessions = await sessionService.getTeamSessions(team.id);
          sessionsData[team.id] = sessions;
          console.log(`👤 [Account] Loaded ${sessions.length} sessions for team ${team.name}`);
        } catch (error) {
          console.error(`Error loading sessions for team ${team.id}:`, error);
          sessionsData[team.id] = [];
        }
      }
      setTeamSessions(sessionsData);
      
      // Initialize profile form with current user data
      if (user) {
        setProfileForm({
          name: user.name || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          countryCode: user.countryCode || 'US',
          profileImage: user.profileImage || ''
        });
      }
      
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openEditProfile = () => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        countryCode: user.countryCode || 'US',
        profileImage: user.profileImage || ''
      });
    }
    setEditingProfile(true);
  };

  const saveProfile = async () => {
    if (!profileForm.name.trim()) {
      showAlert('Error', 'Name is required.', [{ text: 'OK' }]);
      return;
    }

    try {
      const updatedUser = await updateUser({
        name: profileForm.name.trim(),
        email: profileForm.email.trim() || undefined,
        phoneNumber: profileForm.phoneNumber.trim() || undefined,
        countryCode: profileForm.countryCode,
        profileImage: profileForm.profileImage || undefined
      });

      if (updatedUser) {
        setEditingProfile(false);
        showAlert('Success', 'Profile updated successfully!', [{ text: 'OK' }]);
      } else {
        showAlert('Error', 'Failed to update profile.', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert('Error', 'Failed to update profile. Please try again.', [{ text: 'OK' }]);
    }
  };

  const openCreateTeamModal = () => {
    setTeamForm({
      name: '',
      description: '',
      emoji: '',
      imageUrl: ''
    });
    setCreateTeamModalVisible(true);
  };

  const closeCreateTeamModal = () => {
    setCreateTeamModalVisible(false);
    setTeamForm({
      name: '',
      description: '',
      emoji: '',
      imageUrl: ''
    });
  };

  const createTeam = async () => {
    if (!teamForm.name.trim()) {
      showAlert('Error', 'Team name is required.', [{ text: 'OK' }]);
      return;
    }

    try {
      const newTeam = await teamService.createTeam({
        name: teamForm.name.trim(),
        description: teamForm.description.trim() || undefined,
        emoji: teamForm.emoji.trim() || undefined,
        imageUrl: teamForm.imageUrl.trim() || undefined
      });

      closeCreateTeamModal();
      await loadData();
      showAlert('Success', `Team "${newTeam.name}" created successfully! You are now the Team Admin.`, [{ text: 'OK' }]);
    } catch (error) {
      console.error('Error creating team:', error);
      showAlert('Error', 'Failed to create team. Please try again.', [{ text: 'OK' }]);
    }
  };

  const openMemberModal = (team: Team, member?: TeamMember) => {
    setSelectedTeam(team);
    if (member) {
      setEditingMember(member);
      setMemberForm({
        email: member.email,
        role: member.role
      });
    } else {
      setEditingMember(null);
      setMemberForm({
        email: '',
        role: 'team_member'
      });
    }
    setMemberModalVisible(true);
  };

  const closeMemberModal = () => {
    setMemberModalVisible(false);
    setEditingMember(null);
    setSelectedTeam(null);
    setMemberForm({
      email: '',
      role: 'team_member'
    });
  };

  const saveMember = async () => {
    if (!selectedTeam) return;

    if (editingMember) {
      // Update existing member
      if (!memberForm.role) {
        showAlert('Error', 'Please select a role.', [{ text: 'OK' }]);
        return;
      }

      try {
        await teamService.updateTeamMember(selectedTeam.id, editingMember.id, {
          role: memberForm.role
        });
        closeMemberModal();
        await loadData();
        showAlert('Success', 'Team member updated successfully!', [{ text: 'OK' }]);
      } catch (error) {
        console.error('Error updating team member:', error);
        showAlert('Error', 'Failed to update team member.', [{ text: 'OK' }]);
      }
    } else {
      // Add new member
      if (!memberForm.email.trim()) {
        showAlert('Error', 'Email address is required.', [{ text: 'OK' }]);
        return;
      }

      try {
        await teamService.inviteTeamMember(selectedTeam.id, memberForm.email.trim(), memberForm.role);
        closeMemberModal();
        await loadData();
        showAlert('Success', 'Team invitation sent successfully!', [{ text: 'OK' }]);
      } catch (error) {
        console.error('Error inviting team member:', error);
        if (error.message.includes('SMTP')) {
          showAlert(
            'Email Service Required',
            'Email invitations require SMTP configuration on the backend server. In demo mode, invitations appear to work but emails are not actually sent.',
            [{ text: 'OK' }]
          );
        } else {
          showAlert('Error', 'Failed to send team invitation. Please try again.', [{ text: 'OK' }]);
        }
      }
    }
  };

  const removeMember = async (team: Team, member: TeamMember) => {
    showAlert(
      'Remove Team Member',
      `Are you sure you want to remove ${member.name || member.email} from ${team.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await teamService.removeTeamMember(team.id, member.id);
              await loadData();
              showAlert('Success', 'Team member removed successfully.', [{ text: 'OK' }]);
            } catch (error) {
              console.error('Error removing team member:', error);
              showAlert('Error', 'Failed to remove team member.', [{ text: 'OK' }]);
            }
          }
        }
      ]
    );
  };

  const loadTeamSession = async (teamId: string, sessionId: string) => {
    try {
      const success = await sessionService.loadTeamSession(teamId, sessionId);
      if (success) {
        router.replace('/(tabs)/');
      } else {
        showAlert('Error', 'Failed to load team session.', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error loading team session:', error);
      showAlert('Error', 'Failed to load team session.', [{ text: 'OK' }]);
    }
  };

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case 'team_admin':
        return <Crown size={16} color="#3B82F6" />;
      case 'crew_chief':
        return <Shield size={16} color="#F59E0B" />;
      case 'driver':
        return <Car size={16} color="#EF4444" />;
      default:
        return <UserCheck size={16} color="#64748B" />;
    }
  };

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case 'team_admin':
        return '#3B82F6';
      case 'crew_chief':
        return '#F59E0B';
      case 'driver':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  const getRoleLabel = (role: TeamRole) => {
    switch (role) {
      case 'team_admin':
        return 'Team Admin';
      case 'crew_chief':
        return 'Crew Chief';
      case 'driver':
        return 'Driver';
      default:
        return 'Team Member';
    }
  };

  const canManageMembers = (team: Team) => {
    if (!user) return false;
    const userMember = team.members.find(m => m.email === user.email);
    return userMember?.role === 'team_admin';
  };

  const canEditMembers = (team: Team) => {
    if (!user) return false;
    const userMember = team.members.find(m => m.email === user.email);
    return userMember?.role === 'team_admin' || userMember?.role === 'crew_chief';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPhoneNumber = (phoneNumber: string, countryCode: string) => {
    if (!phoneNumber) return '';
    // This is a simplified format - in production you'd want proper phone number formatting
    return `+${getCountryCallingCode(countryCode)} ${phoneNumber}`;
  };

  const getCountryCallingCode = (countryCode: string) => {
    // Simplified mapping - in production use a proper library
    const codes: { [key: string]: string } = {
      'US': '1', 'CA': '1', 'GB': '44', 'DE': '49', 'FR': '33', 'IT': '39', 
      'ES': '34', 'AU': '61', 'JP': '81', 'CN': '86', 'IN': '91', 'BR': '55'
    };
    return codes[countryCode] || '1';
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading account...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage your profile and teams</Text>
          </View>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={handleRefresh}
          >
            <RefreshCcw size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <User size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile</Text>
            </View>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.primary }]}
              onPress={openEditProfile}
            >
              <Edit3 size={16} color={colors.primaryText} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileContent}>
            <View style={styles.profileImageContainer}>
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary }]}>
                  <User size={32} color={colors.primaryText} />
                </View>
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>{user?.name || 'No name set'}</Text>
              {user?.email && (
                <View style={styles.profileDetail}>
                  <Mail size={14} color={colors.textSecondary} />
                  <Text style={[styles.profileDetailText, { color: colors.textSecondary }]}>{user.email}</Text>
                </View>
              )}
              {user?.phoneNumber && (
                <View style={styles.profileDetail}>
                  <Phone size={14} color={colors.textSecondary} />
                  <Text style={[styles.profileDetailText, { color: colors.textSecondary }]}>
                    {formatPhoneNumber(user.phoneNumber, user.countryCode || 'US')}
                  </Text>
                </View>
              )}
              <View style={styles.profileDetail}>
                <Globe size={14} color={colors.textSecondary} />
                <Text style={[styles.profileDetailText, { color: colors.textSecondary }]}>
                  Member since {formatDate(user?.createdAt || new Date().toISOString())}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Teams & Collaboration Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Users size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Teams & Collaboration</Text>
            </View>
            <TouchableOpacity
              style={[styles.createTeamButton, { backgroundColor: colors.primary }]}
              onPress={openCreateTeamModal}
            >
              <Plus size={16} color={colors.primaryText} />
            </TouchableOpacity>
          </View>

          {teams.length === 0 ? (
            <View style={styles.emptyTeams}>
              <Users size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyTeamsTitle, { color: colors.text }]}>No Teams Yet</Text>
              <Text style={[styles.emptyTeamsText, { color: colors.textSecondary }]}>
                Create or join a team to collaborate with other racers and share data.
              </Text>
              <TouchableOpacity
                style={[styles.createFirstTeamButton, { backgroundColor: colors.primary }]}
                onPress={openCreateTeamModal}
              >
                <Plus size={20} color={colors.primaryText} />
                <Text style={[styles.createFirstTeamButtonText, { color: colors.primaryText }]}>Create Team</Text>
              </TouchableOpacity>
            </View>
          ) : (
            teams.map((team) => {
              const userMember = team.members.find(m => m.email === user?.email);
              const userRole = userMember?.role || 'team_member';
              const sessions = teamSessions[team.id] || [];
              
              return (
                <View key={team.id} style={[styles.teamCard, { backgroundColor: colors.surfaceSecondary }]}>
                  <View style={styles.teamHeader}>
                    <View style={styles.teamInfo}>
                      <View style={styles.teamTitleRow}>
                        {team.emoji && (
                          <Text style={styles.teamEmoji}>{team.emoji}</Text>
                        )}
                        <Text style={[styles.teamName, { color: colors.text }]}>{team.name}</Text>
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(userRole) }]}>
                          {getRoleIcon(userRole)}
                          <Text style={styles.roleBadgeText}>{getRoleLabel(userRole)}</Text>
                        </View>
                      </View>
                      {team.description && (
                        <Text style={[styles.teamDescription, { color: colors.textSecondary }]}>
                          {team.description}
                        </Text>
                      )}
                      <View style={styles.teamMeta}>
                        <Text style={[styles.teamMetaText, { color: colors.textTertiary }]}>
                          {team.members.length} member{team.members.length === 1 ? '' : 's'} • {sessions.length} session{sessions.length === 1 ? '' : 's'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Team Members */}
                  <View style={styles.teamMembers}>
                    <View style={styles.membersHeader}>
                      <Text style={[styles.membersTitle, { color: colors.text }]}>Team Members</Text>
                      {canManageMembers(team) && (
                        <TouchableOpacity
                          style={[styles.addMemberButton, { backgroundColor: colors.primary }]}
                          onPress={() => openMemberModal(team)}
                        >
                          <Plus size={14} color={colors.primaryText} />
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    {team.members.map((member) => (
                      <View key={member.id} style={styles.memberItem}>
                        <View style={styles.memberInfo}>
                          <View style={styles.memberAvatar}>
                            {member.profileImage ? (
                              <Image source={{ uri: member.profileImage }} style={styles.memberAvatarImage} />
                            ) : (
                              <View style={[styles.memberAvatarPlaceholder, { backgroundColor: colors.primary }]}>
                                <User size={16} color={colors.primaryText} />
                              </View>
                            )}
                          </View>
                          <View style={styles.memberDetails}>
                            <Text style={[styles.memberName, { color: colors.text }]}>
                              {member.name || member.email}
                            </Text>
                            <View style={styles.memberMeta}>
                              {getRoleIcon(member.role)}
                              <Text style={[styles.memberRole, { color: colors.textSecondary }]}>
                                {getRoleLabel(member.role)}
                              </Text>
                            </View>
                          </View>
                        </View>
                        
                        {canEditMembers(team) && member.email !== user?.email && (
                          <View style={styles.memberActions}>
                            <TouchableOpacity
                              style={[styles.memberActionButton, { backgroundColor: colors.surface }]}
                              onPress={() => openMemberModal(team, member)}
                            >
                              <Edit3 size={14} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.memberActionButton, { backgroundColor: colors.surface }]}
                              onPress={() => removeMember(team, member)}
                            >
                              <Trash2 size={14} color={colors.error} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>

                  {/* Team Sessions */}
                  <View style={styles.teamSessions}>
                    <Text style={[styles.sessionsTitle, { color: colors.text }]}>Team Sessions</Text>
                    {sessions.length === 0 ? (
                      <Text style={[styles.noSessionsText, { color: colors.textSecondary }]}>
                        No team sessions available
                      </Text>
                    ) : (
                      sessions.slice(0, 3).map((session) => (
                        <TouchableOpacity
                          key={session.id}
                          style={[styles.sessionItem, { backgroundColor: colors.surface }]}
                          onPress={() => loadTeamSession(team.id, session.id)}
                        >
                          <View style={styles.sessionInfo}>
                            {session.emoji && (
                              <Text style={styles.sessionEmoji}>{session.emoji}</Text>
                            )}
                            <View style={styles.sessionDetails}>
                              <Text style={[styles.sessionName, { color: colors.text }]}>{session.name}</Text>
                              <Text style={[styles.sessionDate, { color: colors.textSecondary }]}>
                                Last used {formatDate(session.lastAccessedAt)}
                              </Text>
                            </View>
                          </View>
                          <ChevronRight size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                      ))
                    )}
                    {sessions.length > 3 && (
                      <Text style={[styles.moreSessionsText, { color: colors.textTertiary }]}>
                        +{sessions.length - 3} more session{sessions.length - 3 === 1 ? '' : 's'}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Account Settings Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Settings size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Settings</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/sessions')}
          >
            <View style={styles.settingInfo}>
              <FileText size={20} color={colors.textSecondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Manage Sessions</Text>
            </View>
            <ChevronRight size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => authService.signOut()}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.error }]}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={editingProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditingProfile(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditingProfile(false)}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
            <TouchableOpacity onPress={saveProfile}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Profile Picture</Text>
              <ImageUploader
                currentImage={profileForm.profileImage}
                onImageChange={(imageUri) => setProfileForm({ ...profileForm, profileImage: imageUri })}
                maxSizeKB={5000} // 5MB limit
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Name *</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter your name"
                placeholderTextColor={colors.textTertiary}
                value={profileForm.name}
                onChangeText={(name) => setProfileForm({ ...profileForm, name })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textTertiary}
                value={profileForm.email}
                onChangeText={(email) => setProfileForm({ ...profileForm, email })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Phone Number</Text>
              <View style={styles.phoneInputContainer}>
                <TouchableOpacity
                  style={[styles.countryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={[styles.countryCode, { color: colors.text }]}>
                    +{getCountryCallingCode(profileForm.countryCode)}
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.phoneInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  placeholder="Phone number"
                  placeholderTextColor={colors.textTertiary}
                  value={profileForm.phoneNumber}
                  onChangeText={(phoneNumber) => setProfileForm({ ...profileForm, phoneNumber })}
                  keyboardType="phone-pad"
                />
              </View>
              <Text style={[styles.helpText, { color: colors.textTertiary }]}>
                Optional: Used for team communication and notifications
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Create Team Modal */}
      <Modal
        visible={createTeamModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeCreateTeamModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeCreateTeamModal}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Team</Text>
            <TouchableOpacity onPress={createTeam}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalIntro}>
              <Zap size={32} color={colors.primary} />
              <Text style={[styles.modalIntroTitle, { color: colors.text }]}>Create Racing Team</Text>
              <Text style={[styles.modalIntroText, { color: colors.textSecondary }]}>
                Teams allow you to collaborate with other racers, share data, and work together on race weekends.
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Team Emoji (Optional)</Text>
              <TextInput
                style={[styles.emojiInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="🏁 Choose an emoji..."
                placeholderTextColor={colors.textTertiary}
                value={teamForm.emoji}
                onChangeText={(emoji) => setTeamForm({ ...teamForm, emoji })}
                maxLength={2}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Team Name *</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Thunder Racing Team, Apex Motorsports..."
                placeholderTextColor={colors.textTertiary}
                value={teamForm.name}
                onChangeText={(name) => setTeamForm({ ...teamForm, name })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[styles.textAreaInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Describe your team's goals and racing activities..."
                placeholderTextColor={colors.textTertiary}
                value={teamForm.description}
                onChangeText={(description) => setTeamForm({ ...teamForm, description })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Team Image URL</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="https://example.com/team-logo.jpg"
                placeholderTextColor={colors.textTertiary}
                value={teamForm.imageUrl}
                onChangeText={(imageUrl) => setTeamForm({ ...teamForm, imageUrl })}
              />
              <Text style={[styles.helpText, { color: colors.textTertiary }]}>
                Optional: Add a URL to your team logo or image
              </Text>
            </View>

            <View style={[styles.roleInfoBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <Text style={[styles.roleInfoTitle, { color: colors.text }]}>Your Role</Text>
              <View style={styles.roleInfoItem}>
                <Crown size={16} color="#3B82F6" />
                <Text style={[styles.roleInfoText, { color: colors.textSecondary }]}>
                  <Text style={[styles.roleInfoBold, { color: colors.text }]}>Team Admin:</Text> You'll have full permissions to manage members, create sessions, and share data.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Member Management Modal */}
      <Modal
        visible={memberModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeMemberModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeMemberModal}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingMember ? 'Edit Member' : 'Add Team Member'}
            </Text>
            <TouchableOpacity onPress={saveMember}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>
                {editingMember ? 'Save' : 'Invite'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {!editingMember && (
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Email Address *</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  placeholder="teammate@example.com"
                  placeholderTextColor={colors.textTertiary}
                  value={memberForm.email}
                  onChangeText={(email) => setMemberForm({ ...memberForm, email })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            )}

            {editingMember && (
              <View style={styles.editingMemberInfo}>
                <View style={styles.editingMemberHeader}>
                  <View style={styles.memberAvatar}>
                    {editingMember.profileImage ? (
                      <Image source={{ uri: editingMember.profileImage }} style={styles.memberAvatarImage} />
                    ) : (
                      <View style={[styles.memberAvatarPlaceholder, { backgroundColor: colors.primary }]}>
                        <User size={20} color={colors.primaryText} />
                      </View>
                    )}
                  </View>
                  <View style={styles.editingMemberDetails}>
                    <Text style={[styles.editingMemberName, { color: colors.text }]}>
                      {editingMember.name || editingMember.email}
                    </Text>
                    <Text style={[styles.editingMemberEmail, { color: colors.textSecondary }]}>
                      {editingMember.email}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Role</Text>
              <View style={styles.roleButtons}>
                {(['driver', 'team_member', 'crew_chief'] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                      memberForm.role === role && { backgroundColor: getRoleColor(role), borderColor: getRoleColor(role) }
                    ]}
                    onPress={() => setMemberForm({ ...memberForm, role })}
                  >
                    {getRoleIcon(role)}
                    <Text style={[
                      styles.roleButtonText,
                      { color: colors.text },
                      memberForm.role === role && { color: '#FFFFFF' }
                    ]}>
                      {getRoleLabel(role)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.roleDescriptions, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <Text style={[styles.roleDescriptionsTitle, { color: colors.text }]}>Role Permissions</Text>
              
              <View style={styles.roleDescription}>
                <Car size={16} color="#EF4444" />
                <View style={styles.roleDescriptionText}>
                  <Text style={[styles.roleDescriptionTitle, { color: colors.text }]}>Driver</Text>
                  <Text style={[styles.roleDescriptionDetail, { color: colors.textSecondary }]}>
                    Access team sessions, contribute data, view shared information
                  </Text>
                </View>
              </View>

              <View style={styles.roleDescription}>
                <UserCheck size={16} color="#64748B" />
                <View style={styles.roleDescriptionText}>
                  <Text style={[styles.roleDescriptionTitle, { color: colors.text }]}>Team Member</Text>
                  <Text style={[styles.roleDescriptionDetail, { color: colors.textSecondary }]}>
                    Basic access to view team sessions and shared data
                  </Text>
                </View>
              </View>

              <View style={styles.roleDescription}>
                <Shield size={16} color="#F59E0B" />
                <View style={styles.roleDescriptionText}>
                  <Text style={[styles.roleDescriptionTitle, { color: colors.text }]}>Crew Chief</Text>
                  <Text style={[styles.roleDescriptionDetail, { color: colors.textSecondary }]}>
                    Create and manage team sessions, share data, edit member roles
                  </Text>
                </View>
              </View>
            </View>

            {!editingMember && (
              <View style={[styles.invitationInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <AlertTriangle size={20} color={colors.warning} />
                <View style={styles.invitationInfoText}>
                  <Text style={[styles.invitationInfoTitle, { color: colors.text }]}>Email Invitations</Text>
                  <Text style={[styles.invitationInfoDetail, { color: colors.textSecondary }]}>
                    Email invitations require SMTP configuration on the backend server. In demo mode, invitations appear to work but emails are not actually sent.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Country Picker Modal */}
      <CountryPicker
        visible={showCountryPicker}
        onSelect={(country) => {
          setProfileForm({ ...profileForm, countryCode: country.cca2 });
          setShowCountryPicker(false);
        }}
        onClose={() => setShowCountryPicker(false)}
        withFilter
        withFlag
        withCallingCode
        withEmoji
      />

      <AlertComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 12,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
  },
  createTeamButton: {
    padding: 8,
    borderRadius: 8,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileImageContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  profileDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  emptyTeams: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTeamsTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyTeamsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  createFirstTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createFirstTeamButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  teamCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  teamHeader: {
    marginBottom: 16,
  },
  teamInfo: {
    flex: 1,
  },
  teamTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  teamEmoji: {
    fontSize: 20,
  },
  teamName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    flex: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  teamDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 8,
  },
  teamMeta: {
    marginTop: 4,
  },
  teamMetaText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  teamMembers: {
    marginBottom: 16,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  membersTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  addMemberButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  memberAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  memberAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  memberRole: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  memberActionButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamSessions: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sessionsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 12,
  },
  noSessionsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    fontStyle: 'italic',
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sessionEmoji: {
    fontSize: 16,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionName: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  sessionDate: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    marginTop: 2,
  },
  moreSessionsText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  modalCancel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  modalSave: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalIntro: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalIntroTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  modalIntroText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    minHeight: 80,
  },
  emojiInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    textAlign: 'center',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  countryButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  countryCode: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  helpText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    marginTop: 4,
  },
  roleInfoBox: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  roleInfoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  roleInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  roleInfoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 16,
    flex: 1,
  },
  roleInfoBold: {
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  editingMemberInfo: {
    marginBottom: 24,
  },
  editingMemberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  editingMemberDetails: {
    flex: 1,
  },
  editingMemberName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  editingMemberEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    marginTop: 2,
  },
  roleButtons: {
    gap: 12,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  roleDescriptions: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 16,
  },
  roleDescriptionsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  roleDescription: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  roleDescriptionText: {
    flex: 1,
  },
  roleDescriptionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 2,
  },
  roleDescriptionDetail: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 16,
  },
  invitationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  invitationInfoText: {
    flex: 1,
  },
  invitationInfoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  invitationInfoDetail: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 16,
  },
});