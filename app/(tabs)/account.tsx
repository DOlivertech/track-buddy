import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal,
  Switch
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useCustomAlert } from '@/components/CustomAlert';
import { ImageUploader } from '@/components/ImageUploader';
import { teamService } from '@/services/teamService';
import { apiService } from '@/services/apiService';
import { Team, TeamMember } from '@/types/team';
import { 
  User, 
  Settings, 
  Users, 
  Plus, 
  RefreshCcw, 
  Crown, 
  Shield, 
  Car, 
  UserCheck,
  Mail,
  Phone,
  Trash2,
  CreditCard as Edit3,
  ChevronRight,
  AlertTriangle
} from 'lucide-react-native';

export default function AccountScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, updateUser } = useUser();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    profileImage: ''
  });
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    emoji: '',
    imageUrl: ''
  });
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as TeamMember['role']
  });

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const userTeams = await teamService.getUserTeams();
      setTeams(userTeams);
      
      if (user) {
        setProfileForm({
          name: user.name || '',
          email: user.email || '',
          phone: '', // Will be added to user type later
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
    await loadData();
  };

  const openProfileModal = () => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: '', // Will be added to user type later
        profileImage: user.profileImage || ''
      });
    }
    setProfileModalVisible(true);
  };

  const closeProfileModal = () => {
    setProfileModalVisible(false);
    setProfileForm({
      name: '',
      email: '',
      phone: '',
      profileImage: ''
    });
  };

  const saveProfile = async () => {
    if (!profileForm.name.trim()) {
      showAlert('Error', 'Please enter your name.', [{ text: 'OK' }]);
      return;
    }

    try {
      await updateUser({
        name: profileForm.name.trim(),
        email: profileForm.email.trim() || undefined,
        profileImage: profileForm.profileImage || undefined
      });
      
      closeProfileModal();
      showAlert('Success', 'Profile updated successfully!', [{ text: 'OK' }]);
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert('Error', 'Failed to update profile. Please try again.', [{ text: 'OK' }]);
    }
  };

  const openTeamModal = () => {
    setTeamForm({
      name: '',
      description: '',
      emoji: '',
      imageUrl: ''
    });
    setTeamModalVisible(true);
  };

  const closeTeamModal = () => {
    setTeamModalVisible(false);
    setTeamForm({
      name: '',
      description: '',
      emoji: '',
      imageUrl: ''
    });
  };

  const saveTeam = async () => {
    if (!teamForm.name.trim()) {
      showAlert('Error', 'Please enter a team name.', [{ text: 'OK' }]);
      return;
    }

    try {
      await teamService.createTeam({
        name: teamForm.name.trim(),
        description: teamForm.description.trim() || undefined,
        emoji: teamForm.emoji.trim() || undefined,
        imageUrl: teamForm.imageUrl.trim() || undefined
      });
      
      closeTeamModal();
      await loadData();
      showAlert('Success', 'Team created successfully!', [{ text: 'OK' }]);
    } catch (error) {
      console.error('Error creating team:', error);
      showAlert('Error', 'Failed to create team. Please try again.', [{ text: 'OK' }]);
    }
  };

  const openInviteModal = (team: Team) => {
    setSelectedTeam(team);
    setInviteForm({
      email: '',
      role: 'member'
    });
    setInviteModalVisible(true);
  };

  const closeInviteModal = () => {
    setInviteModalVisible(false);
    setSelectedTeam(null);
    setInviteForm({
      email: '',
      role: 'member'
    });
  };

  const sendInvite = async () => {
    if (!inviteForm.email.trim() || !selectedTeam) {
      showAlert('Error', 'Please enter an email address.', [{ text: 'OK' }]);
      return;
    }

    try {
      const success = await teamService.addTeamMember(
        selectedTeam.id,
        inviteForm.email.trim(),
        inviteForm.role
      );
      
      if (success) {
        closeInviteModal();
        await loadData();
        showAlert('Success', 'Team invitation sent successfully!', [{ text: 'OK' }]);
      } else {
        showAlert('Error', 'Failed to send invitation. Please try again.', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      showAlert('Error', 'Failed to send invitation. Please try again.', [{ text: 'OK' }]);
    }
  };

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'admin':
        return <Crown size={16} color={colors.warning} />;
      case 'crew_chief':
        return <Shield size={16} color={colors.primary} />;
      case 'driver':
        return <Car size={16} color={colors.success} />;
      default:
        return <UserCheck size={16} color={colors.textSecondary} />;
    }
  };

  const getRoleLabel = (role: TeamMember['role']) => {
    switch (role) {
      case 'admin':
        return 'Team Admin';
      case 'crew_chief':
        return 'Crew Chief';
      case 'driver':
        return 'Driver';
      default:
        return 'Team Member';
    }
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
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile</Text>
          <TouchableOpacity
            style={[styles.profileCard, { backgroundColor: colors.surface }]}
            onPress={openProfileModal}
            activeOpacity={0.7}
          >
            <View style={styles.profileInfo}>
              <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
                {user?.profileImage ? (
                  <Text style={styles.avatarText}>👤</Text>
                ) : (
                  <User size={24} color={colors.primaryText} />
                )}
              </View>
              <View style={styles.profileDetails}>
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {user?.name || 'Racing Driver'}
                </Text>
                <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                  {user?.email || 'No email set'}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Teams Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Racing Teams</Text>
            <TouchableOpacity
              style={[styles.addTeamButton, { backgroundColor: colors.primary }]}
              onPress={openTeamModal}
            >
              <Plus size={16} color={colors.primaryText} />
            </TouchableOpacity>
          </View>
          
          {teams.length === 0 ? (
            <View style={[styles.emptyTeams, { backgroundColor: colors.surface }]}>
              <Users size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyTeamsTitle, { color: colors.text }]}>No Teams Yet</Text>
              <Text style={[styles.emptyTeamsSubtext, { color: colors.textSecondary }]}>
                Create or join racing teams to collaborate on setups and share data.
              </Text>
            </View>
          ) : (
            teams.map((team) => (
              <View key={team.id} style={[styles.teamCard, { backgroundColor: colors.surface }]}>
                <View style={styles.teamHeader}>
                  <View style={styles.teamInfo}>
                    <View style={styles.teamTitleRow}>
                      {team.emoji ? (
                        <Text style={styles.teamEmoji}>{team.emoji}</Text>
                      ) : (
                        <Users size={20} color={colors.primary} />
                      )}
                      <Text style={[styles.teamName, { color: colors.text }]}>{team.name}</Text>
                      {team.isDemo && (
                        <View style={[styles.demoBadge, { backgroundColor: colors.warning }]}>
                          <Text style={styles.demoBadgeText}>DEMO</Text>
                        </View>
                      )}
                    </View>
                    {team.description && (
                      <Text style={[styles.teamDescription, { color: colors.textSecondary }]}>
                        {team.description}
                      </Text>
                    )}
                    <View style={styles.teamMeta}>
                      <Text style={[styles.teamMemberCount, { color: colors.textTertiary }]}>
                        {team.members.length} member{team.members.length === 1 ? '' : 's'}
                      </Text>
                      <Text style={[styles.teamSessionCount, { color: colors.textTertiary }]}>
                        {team.sessions.length} session{team.sessions.length === 1 ? '' : 's'}
                      </Text>
                    </View>
                  </View>
                  
                  {teamService.canManageMembers(team) && !team.isDemo && (
                    <TouchableOpacity
                      style={[styles.inviteButton, { backgroundColor: colors.primary }]}
                      onPress={() => openInviteModal(team)}
                    >
                      <Plus size={16} color={colors.primaryText} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.teamMembers}>
                  {team.members.slice(0, 3).map((member) => (
                    <View key={member.id} style={styles.memberItem}>
                      <View style={styles.memberInfo}>
                        <View style={[styles.memberAvatar, { backgroundColor: colors.surfaceSecondary }]}>
                          <Text style={styles.memberInitial}>
                            {member.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.memberDetails}>
                          <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                          <View style={styles.memberRole}>
                            {getRoleIcon(member.role)}
                            <Text style={[styles.memberRoleText, { color: colors.textSecondary }]}>
                              {getRoleLabel(member.role)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                  
                  {team.members.length > 3 && (
                    <Text style={[styles.moreMembers, { color: colors.textTertiary }]}>
                      +{team.members.length - 3} more
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Coming Soon Notice */}
        <View style={[styles.comingSoonSection, { backgroundColor: colors.surface }]}>
          <View style={styles.comingSoonHeader}>
            <AlertTriangle size={20} color={colors.warning} />
            <Text style={[styles.comingSoonTitle, { color: colors.text }]}>Team Features Coming Soon</Text>
          </View>
          <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
            Full team collaboration features including real-time data sharing, member management, 
            and team sessions are currently in development and will be available in a future update.
          </Text>
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeProfileModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeProfileModal}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
            <TouchableOpacity onPress={saveProfile}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.imageSection}>
              <ImageUploader
                value={profileForm.profileImage}
                onImageChange={(imageUri) => setProfileForm({ ...profileForm, profileImage: imageUri || '' })}
                placeholder="Add profile picture"
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
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., +1 555-123-4567 or +44 20 7946 0958"
                placeholderTextColor={colors.textTertiary}
                value={profileForm.phone}
                onChangeText={(phone) => setProfileForm({ ...profileForm, phone })}
                keyboardType="phone-pad"
              />
              <Text style={[styles.helpText, { color: colors.textTertiary }]}>
                Include country code (e.g., +1 for US, +44 for UK)
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Team Creation Modal */}
      <Modal
        visible={teamModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeTeamModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeTeamModal}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Team</Text>
            <TouchableOpacity onPress={saveTeam}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Team Emoji</Text>
              <TextInput
                style={[styles.emojiInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="🏎️ Choose an emoji..."
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
                placeholder="e.g., Lightning Racing Team"
                placeholderTextColor={colors.textTertiary}
                value={teamForm.name}
                onChangeText={(name) => setTeamForm({ ...teamForm, name })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[styles.textAreaInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Describe your racing team..."
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
          </ScrollView>
        </View>
      </Modal>

      {/* Team Invite Modal */}
      <Modal
        visible={inviteModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeInviteModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeInviteModal}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Invite Member</Text>
            <TouchableOpacity onPress={sendInvite}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>Send</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Email Address *</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="teammate@example.com"
                placeholderTextColor={colors.textTertiary}
                value={inviteForm.email}
                onChangeText={(email) => setInviteForm({ ...inviteForm, email })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Role</Text>
              <View style={styles.roleButtons}>
                {(['member', 'driver', 'crew_chief'] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                      inviteForm.role === role && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setInviteForm({ ...inviteForm, role })}
                  >
                    {getRoleIcon(role)}
                    <Text style={[
                      styles.roleButtonText,
                      { color: colors.text },
                      inviteForm.role === role && { color: colors.primaryText }
                    ]}>
                      {getRoleLabel(role)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

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
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  addTeamButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  emptyTeams: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyTeamsTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyTeamsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  teamCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  teamInfo: {
    flex: 1,
    marginRight: 12,
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
  demoBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  demoBadgeText: {
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
    marginBottom: 12,
  },
  teamMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  teamMemberCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  teamSessionCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  inviteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamMembers: {
    gap: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 2,
  },
  memberRole: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberRoleText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  moreMembers: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  comingSoonSection: {
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
  comingSoonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  comingSoonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
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
  imageSection: {
    alignItems: 'center',
    marginBottom: 32,
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
  helpText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    marginTop: 4,
  },
  roleButtons: {
    gap: 12,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  roleButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
});