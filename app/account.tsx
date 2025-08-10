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
import { TrackSearchPicker } from '@/components/TrackSearchPicker';
import { teamService } from '@/services/teamService';
import { apiService } from '@/services/apiService';
import { Team, TeamMember, TeamSession } from '@/types/team';
import { User, Settings, Users, Plus, RefreshCcw, Crown, Shield, Car, UserCheck, Mail, Phone, Trash2, CreditCard as Edit3, ChevronRight, ChevronDown, Play } from 'lucide-react-native';

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
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingSession, setEditingSession] = useState<TeamSession | null>(null);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
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
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'member' as TeamMember['role']
  });
  const [sessionForm, setSessionForm] = useState({
    name: '',
    description: '',
    trackId: ''
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
    setEditingTeam(null);
    setTeamForm({
      name: '',
      description: '',
      emoji: '',
      imageUrl: ''
    });
    setTeamModalVisible(true);
  };

  const openEditTeamModal = (team: Team) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      description: team.description || '',
      emoji: team.emoji || '',
      imageUrl: team.imageUrl || ''
    });
    setTeamModalVisible(true);
  };

  const closeTeamModal = () => {
    setTeamModalVisible(false);
    setEditingTeam(null);
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
      if (editingTeam) {
        const success = await teamService.updateTeam(editingTeam.id, {
          name: teamForm.name.trim(),
          description: teamForm.description.trim() || undefined,
          emoji: teamForm.emoji.trim() || undefined,
          imageUrl: teamForm.imageUrl.trim() || undefined
        });
        
        if (success) {
          closeTeamModal();
          await loadData();
          showAlert('Success', 'Team updated successfully!', [{ text: 'OK' }]);
        } else {
          showAlert('Error', 'Failed to update team.', [{ text: 'OK' }]);
        }
      } else {
        await teamService.createTeam({
          name: teamForm.name.trim(),
          description: teamForm.description.trim() || undefined,
          emoji: teamForm.emoji.trim() || undefined,
          imageUrl: teamForm.imageUrl.trim() || undefined
        });
        
        closeTeamModal();
        await loadData();
        showAlert('Success', 'Team created successfully!', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error saving team:', error);
      showAlert('Error', 'Failed to save team. Please try again.', [{ text: 'OK' }]);
    }
  };

  const deleteTeam = async (team: Team) => {
    if (teamService.isDemoTeam(team.id)) {
      showAlert('Cannot Delete', 'The demo team cannot be deleted.', [{ text: 'OK' }]);
      return;
    }

    showAlert(
      'Delete Team',
      `Are you sure you want to delete "${team.name}"? This will permanently delete all team sessions and member data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await teamService.deleteTeam(team.id);
              if (success) {
                closeTeamModal();
                await loadData();
                showAlert('Success', 'Team deleted successfully!', [{ text: 'OK' }]);
              } else {
                showAlert('Error', 'Failed to delete team.', [{ text: 'OK' }]);
              }
            } catch (error) {
              console.error('Error deleting team:', error);
              showAlert('Error', 'Failed to delete team.', [{ text: 'OK' }]);
            }
          }
        }
      ]
    );
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

  const openMemberModal = (team: Team, member: TeamMember) => {
    setSelectedTeam(team);
    setEditingMember(member);
    setMemberForm({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role
    });
    setMemberModalVisible(true);
  };

  const closeMemberModal = () => {
    setMemberModalVisible(false);
    setSelectedTeam(null);
    setEditingMember(null);
    setMemberForm({
      name: '',
      email: '',
      phone: '',
      role: 'member'
    });
  };

  const saveMember = async () => {
    if (!memberForm.name.trim() || !memberForm.email.trim() || !selectedTeam || !editingMember) {
      showAlert('Error', 'Please fill in all required fields.', [{ text: 'OK' }]);
      return;
    }

    try {
      const success = await teamService.updateTeamMember(selectedTeam.id, editingMember.id, {
        name: memberForm.name.trim(),
        email: memberForm.email.trim(),
        phone: memberForm.phone.trim() || undefined,
        role: memberForm.role
      });
      
      if (success) {
        closeMemberModal();
        await loadData();
        showAlert('Success', 'Team member updated successfully!', [{ text: 'OK' }]);
      } else {
        showAlert('Error', 'Failed to update team member.', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error updating team member:', error);
      showAlert('Error', 'Failed to update team member.', [{ text: 'OK' }]);
    }
  };

  const removeMember = async (team: Team, member: TeamMember) => {
    if (member.id === 'current-user' || member.id === 'demo-member-001') {
      showAlert('Cannot Remove', 'You cannot remove yourself from the team.', [{ text: 'OK' }]);
      return;
    }

    showAlert(
      'Remove Member',
      `Are you sure you want to remove ${member.name} from the team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await teamService.removeTeamMember(team.id, member.id);
              if (success) {
                await loadData();
                showAlert('Success', 'Team member removed successfully!', [{ text: 'OK' }]);
              } else {
                showAlert('Error', 'Failed to remove team member.', [{ text: 'OK' }]);
              }
            } catch (error) {
              console.error('Error removing team member:', error);
              showAlert('Error', 'Failed to remove team member.', [{ text: 'OK' }]);
            }
          }
        }
      ]
    );
  };

  const openSessionModal = (team: Team, session?: TeamSession) => {
    setSelectedTeam(team);
    if (session) {
      setEditingSession(session);
      setSessionForm({
        name: session.name,
        description: session.description || '',
        trackId: session.trackId || ''
      });
    } else {
      setEditingSession(null);
      setSessionForm({
        name: '',
        description: '',
        trackId: ''
      });
    }
    setSessionModalVisible(true);
  };

  const closeSessionModal = () => {
    setSessionModalVisible(false);
    setSelectedTeam(null);
    setEditingSession(null);
    setSessionForm({
      name: '',
      description: '',
      trackId: ''
    });
  };

  const saveSession = async () => {
    if (!sessionForm.name.trim() || !selectedTeam) {
      showAlert('Error', 'Please enter a session name.', [{ text: 'OK' }]);
      return;
    }

    try {
      if (editingSession) {
        const success = await teamService.updateTeamSession(selectedTeam.id, editingSession.id, {
          name: sessionForm.name.trim(),
          description: sessionForm.description.trim() || undefined,
          trackId: sessionForm.trackId || undefined
        });
        
        if (success) {
          closeSessionModal();
          await loadData();
          showAlert('Success', 'Session updated successfully!', [{ text: 'OK' }]);
        } else {
          showAlert('Error', 'Failed to update session.', [{ text: 'OK' }]);
        }
      } else {
        const newSession = await teamService.createTeamSession(selectedTeam.id, {
          name: sessionForm.name.trim(),
          description: sessionForm.description.trim() || undefined,
          trackId: sessionForm.trackId || undefined
        });
        
        if (newSession) {
          closeSessionModal();
          await loadData();
          showAlert('Success', 'Session created successfully!', [{ text: 'OK' }]);
        } else {
          showAlert('Error', 'Failed to create session.', [{ text: 'OK' }]);
        }
      }
    } catch (error) {
      console.error('Error saving session:', error);
      showAlert('Error', 'Failed to save session.', [{ text: 'OK' }]);
    }
  };

  const deleteSession = async (team: Team, session: TeamSession) => {
    showAlert(
      'Delete Session',
      `Are you sure you want to delete "${session.name}"? This will permanently delete all session data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await teamService.deleteTeamSession(team.id, session.id);
              if (success) {
                await loadData();
                showAlert('Success', 'Session deleted successfully!', [{ text: 'OK' }]);
              } else {
                showAlert('Error', 'Failed to delete session.', [{ text: 'OK' }]);
              }
            } catch (error) {
              console.error('Error deleting session:', error);
              showAlert('Error', 'Failed to delete session.', [{ text: 'OK' }]);
            }
          }
        }
      ]
    );
  };

  const loadTeamSession = async (team: Team, session: TeamSession) => {
    try {
      const success = await teamService.switchToTeamSession(team.id, session.id);
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

  const toggleTeamExpansion = (teamId: string) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Teams</Text>
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
                <TouchableOpacity
                  style={styles.teamHeader}
                  onPress={() => toggleTeamExpansion(team.id)}
                >
                  <View style={styles.teamHeaderLeft}>
                    {expandedTeams.has(team.id) ? (
                      <ChevronDown size={20} color={colors.textSecondary} />
                    ) : (
                      <ChevronRight size={20} color={colors.textSecondary} />
                    )}
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
                  </View>
                  
                  <View style={styles.teamActions}>
                    <TouchableOpacity
                      style={[styles.teamActionButton, { backgroundColor: colors.surfaceSecondary }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        openEditTeamModal(team);
                      }}
                    >
                      <Edit3 size={16} color={colors.text} />
                    </TouchableOpacity>
                    
                    {teamService.canManageMembers(team) && (
                      <TouchableOpacity
                        style={[styles.teamActionButton, { backgroundColor: colors.primary }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          openInviteModal(team);
                        }}
                      >
                        <Plus size={16} color={colors.primaryText} />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>

                {expandedTeams.has(team.id) && (
                  <View style={styles.teamContent}>
                    {/* Team Sessions */}
                    <View style={styles.teamSection}>
                      <View style={styles.teamSectionHeader}>
                        <Text style={[styles.teamSectionTitle, { color: colors.text }]}>Team Sessions</Text>
                        <TouchableOpacity
                          style={[styles.addSessionButton, { backgroundColor: colors.primary }]}
                          onPress={() => openSessionModal(team)}
                        >
                          <Plus size={14} color={colors.primaryText} />
                        </TouchableOpacity>
                      </View>
                      
                      {team.sessions.length === 0 ? (
                        <Text style={[styles.emptySessionsText, { color: colors.textTertiary }]}>
                          No sessions yet
                        </Text>
                      ) : (
                        team.sessions.map((session) => (
                          <View key={session.id} style={[styles.sessionItem, { backgroundColor: colors.surfaceSecondary }]}>
                            <View style={styles.sessionInfo}>
                              <Text style={[styles.sessionName, { color: colors.text }]}>{session.name}</Text>
                              {session.description && (
                                <Text style={[styles.sessionDescription, { color: colors.textSecondary }]} numberOfLines={1}>
                                  {session.description}
                                </Text>
                              )}
                              <Text style={[styles.sessionMeta, { color: colors.textTertiary }]}>
                                Modified {new Date(session.lastModified).toLocaleDateString()}
                              </Text>
                            </View>
                            <View style={styles.sessionActions}>
                              <TouchableOpacity
                                style={[styles.sessionActionButton, { backgroundColor: colors.surface }]}
                                onPress={() => openSessionModal(team, session)}
                              >
                                <Edit3 size={14} color={colors.text} />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.sessionActionButton, { backgroundColor: colors.surface }]}
                                onPress={() => deleteSession(team, session)}
                              >
                                <Trash2 size={14} color={colors.error} />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.sessionActionButton, { backgroundColor: colors.success }]}
                                onPress={() => loadTeamSession(team, session)}
                              >
                                <Play size={14} color="#FFFFFF" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))
                      )}
                    </View>

                    {/* Team Members */}
                    <View style={styles.teamSection}>
                      <Text style={[styles.teamSectionTitle, { color: colors.text }]}>Team Members</Text>
                      <View style={styles.teamMembers}>
                        {team.members.map((member) => (
                          <TouchableOpacity
                            key={member.id}
                            style={styles.memberItem}
                            onPress={() => teamService.canEditMemberRoles(team) ? openMemberModal(team, member) : null}
                            disabled={!teamService.canEditMemberRoles(team)}
                          >
                            <View style={styles.memberInfo}>
                              <View style={[styles.memberAvatar, { backgroundColor: colors.surfaceSecondary }]}>
                                <Text style={styles.memberInitial}>
                                  {member.name.charAt(0).toUpperCase()}
                                </Text>
                              </View>
                              <View style={styles.memberDetails}>
                                <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                                <Text style={[styles.memberEmail, { color: colors.textSecondary }]}>{member.email}</Text>
                                <View style={styles.memberRole}>
                                  {getRoleIcon(member.role)}
                                  <Text style={[styles.memberRoleText, { color: colors.textSecondary }]}>
                                    {getRoleLabel(member.role)}
                                  </Text>
                                </View>
                              </View>
                            </View>
                            {teamService.canEditMemberRoles(team) && (
                              <View style={styles.memberActions}>
                                {teamService.canManageMembers(team) && member.id !== 'current-user' && member.id !== 'demo-member-001' && (
                                  <TouchableOpacity
                                    style={[styles.memberActionButton, { backgroundColor: colors.surface }]}
                                    onPress={(e) => {
                                      e.stopPropagation();
                                      removeMember(team, member);
                                    }}
                                  >
                                    <Trash2 size={14} color={colors.error} />
                                  </TouchableOpacity>
                                )}
                                <ChevronRight size={16} color={colors.textTertiary} />
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
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

      {/* Team Creation/Edit Modal */}
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingTeam ? 'Edit Team' : 'Create Team'}
            </Text>
            <TouchableOpacity onPress={saveTeam}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>
                {editingTeam ? 'Save' : 'Create'}
              </Text>
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

            {editingTeam && !teamService.isDemoTeam(editingTeam.id) && (
              <View style={styles.formGroup}>
                <TouchableOpacity
                  style={[styles.deleteTeamButton, { backgroundColor: colors.error }]}
                  onPress={() => deleteTeam(editingTeam)}
                >
                  <Trash2 size={20} color="#FFFFFF" />
                  <Text style={styles.deleteTeamButtonText}>Delete Team</Text>
                </TouchableOpacity>
              </View>
            )}
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

      {/* Team Member Edit Modal */}
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Member</Text>
            <TouchableOpacity onPress={saveMember}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Name *</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter member name"
                placeholderTextColor={colors.textTertiary}
                value={memberForm.name}
                onChangeText={(name) => setMemberForm({ ...memberForm, name })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Email *</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter email address"
                placeholderTextColor={colors.textTertiary}
                value={memberForm.email}
                onChangeText={(email) => setMemberForm({ ...memberForm, email })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Phone Number</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., +1 555-123-4567"
                placeholderTextColor={colors.textTertiary}
                value={memberForm.phone}
                onChangeText={(phone) => setMemberForm({ ...memberForm, phone })}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Role</Text>
              <View style={styles.roleButtons}>
                {(['member', 'driver', 'crew_chief', 'admin'] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                      memberForm.role === role && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setMemberForm({ ...memberForm, role })}
                  >
                    {getRoleIcon(role)}
                    <Text style={[
                      styles.roleButtonText,
                      { color: colors.text },
                      memberForm.role === role && { color: colors.primaryText }
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

      {/* Team Session Modal */}
      <Modal
        visible={sessionModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeSessionModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeSessionModal}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingSession ? 'Edit Session' : 'New Session'}
            </Text>
            <TouchableOpacity onPress={saveSession}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>
                {editingSession ? 'Save' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Session Name *</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Silverstone Practice Data"
                placeholderTextColor={colors.textTertiary}
                value={sessionForm.name}
                onChangeText={(name) => setSessionForm({ ...sessionForm, name })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[styles.textAreaInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Describe this team session..."
                placeholderTextColor={colors.textTertiary}
                value={sessionForm.description}
                onChangeText={(description) => setSessionForm({ ...sessionForm, description })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <TrackSearchPicker
                label="Racing Track"
                value={sessionForm.trackId}
                onTrackChange={(trackId) => setSessionForm({ ...sessionForm, trackId: trackId || '' })}
                placeholder="Select a racing track (optional)"
                allowNone={true}
              />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamHeader: {
    padding: 20,
  },
  teamHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
  teamActions: {
    flexDirection: 'row',
    gap: 8,
  },
  teamActionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
  teamSection: {
    gap: 12,
  },
  teamSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  addSessionButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  sessionInfo: {
    flex: 1,
    marginRight: 12,
  },
  sessionName: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 2,
  },
  sessionDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    marginBottom: 2,
  },
  sessionMeta: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 6,
  },
  sessionActionButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySessionsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  teamMembers: {
    gap: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 8,
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
  memberEmail: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
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
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberActionButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
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
  deleteTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  deleteTeamButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
});