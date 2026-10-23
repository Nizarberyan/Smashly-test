import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  User,
  Bell,
  Shield,
  Lock,
  Edit2,
  Info,
  Check,
  ChevronDown,
  Save,
  KeyRound,
  MapPin,
} from 'lucide-react-native';

import { useMatches } from '../context/MatchesContext';
import { colors } from '../theme/colors';

export type SettingsTab = 'general' | 'notifications' | 'privacy';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
  isDarkMode?: boolean;
  onToggleDarkMode?: (value: boolean) => void;
  onProfileUpdated?: (updated: any) => void;
}

const COUNTRY_CODES = [
  { code: '+44', flag: '🇬🇧', label: 'UK (+44)' },
  { code: '+33', flag: '🇫🇷', label: 'France (+33)' },
  { code: '+34', flag: '🇪🇸', label: 'Spain (+34)' },
  { code: '+39', flag: '🇮🇹', label: 'Italy (+39)' },
  { code: '+32', flag: '🇧🇪', label: 'Belgium (+32)' },
  { code: '+41', flag: '🇨🇭', label: 'Switzerland (+41)' },
  { code: '+1', flag: '🇺🇸', label: 'USA (+1)' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  initialTab = 'general',
  isDarkMode = true,
  onProfileUpdated,
}) => {
  const insets = useSafeAreaInsets();
  const {
    currentUser,
    updateCurrentUser,
  } = useMatches();

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [saving, setSaving] = useState(false);

  // Form Fields matching screenshot & smashlyai.com
  const [firstName, setFirstName] = useState(currentUser.first_name || '');
  const [lastName, setLastName] = useState(currentUser.last_name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [countryCode, setCountryCode] = useState('+44');
  const [phone, setPhone] = useState(currentUser.phone ? currentUser.phone.replace(/^\+44|^\+33|^\+34|^\+39/, '') : '8475136528');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Notifications
  const [contactNotifications, setContactNotifications] = useState(true);
  const [lessonNotifications, setLessonNotifications] = useState(true);
  const [matchNotifications, setMatchNotifications] = useState(true);

  // Privacy
  const [profileVisible, setProfileVisible] = useState(true);
  const [sharePhoneWithPartners, setSharePhoneWithPartners] = useState(true);
  const [allowDirectMessages, setAllowDirectMessages] = useState(true);

  // Sync state when currentUser changes or modal reopens
  useEffect(() => {
    if (visible) {
      setFirstName(currentUser.first_name || '');
      setLastName(currentUser.last_name || '');
      setEmail(currentUser.email || 'nizarbreyan@gmail.com');
      
      const rawPhone = currentUser.phone || '8475136528';
      let foundCode = '+44';
      let cleanPhone = rawPhone;
      for (const item of COUNTRY_CODES) {
        if (rawPhone.startsWith(item.code)) {
          foundCode = item.code;
          cleanPhone = rawPhone.replace(item.code, '');
          break;
        }
      }
      setCountryCode(foundCode);
      setPhone(cleanPhone);
      setGender((currentUser.gender as any) || 'male');
    }
  }, [visible, currentUser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fullPhone = `${countryCode}${phone.replace(/\D/g, '')}`;
      const updatedData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: fullPhone,
        gender,
      };

      await updateCurrentUser(updatedData);

      onProfileUpdated?.({
        firstName: updatedData.first_name,
        lastName: updatedData.last_name,
        email: updatedData.email,
        phone: updatedData.phone,
        gender,
      });

      Alert.alert('Profile Updated', 'Your profile information has been saved successfully!', [
        { text: 'OK' },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditEmail = () => {
    Alert.prompt
      ? Alert.prompt(
          'Edit Email',
          'Enter your new email address. A verification link will be sent.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Send Verification',
              onPress: (newEmail) => {
                if (newEmail && newEmail.includes('@')) {
                  setEmail(newEmail);
                  Alert.alert('Verification Sent', `Verification email sent to ${newEmail}`);
                }
              },
            },
          ],
          'plain-text',
          email
        )
      : Alert.alert('Edit Email', 'The change will require email verification. Please check your inbox.');
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'A password reset link will be sent to your verified email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reset Link',
          onPress: () => {
            Alert.alert('Email Sent', `Password reset instructions sent to ${email}`);
          },
        },
      ]
    );
  };

  const currentFlag = COUNTRY_CODES.find((c) => c.code === countryCode)?.flag || '🇬🇧';
  const cleanDigits = phone.replace(/\D/g, '');
  const hasValidPhone = cleanDigits.length >= 8;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          isDarkMode ? styles.containerDark : styles.containerLight,
          { paddingTop: Math.max(insets.top, 16) },
        ]}
      >
        {/* Top Header: Settings & Close Button */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isDarkMode ? styles.textWhite : styles.textDark]}>
            Settings
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.closeBtn, isDarkMode ? styles.closeBtnDark : styles.closeBtnLight]}
            onPress={onClose}
          >
            <X size={20} color={isDarkMode ? '#ffffff' : '#0f172a'} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* Tab Pills */}
        <View style={[styles.tabBarContainer, isDarkMode ? styles.tabBarContainerDark : styles.tabBarContainerLight]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.tabPill,
                activeTab === 'general' ? styles.tabPillActive : (isDarkMode ? styles.tabPillDark : styles.tabPillLight),
              ]}
              onPress={() => setActiveTab('general')}
            >
              <User
                size={16}
                color={activeTab === 'general' ? '#ffffff' : isDarkMode ? '#94a3b8' : '#334155'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabPillText,
                  activeTab === 'general'
                    ? styles.tabPillTextActive
                    : isDarkMode
                    ? styles.textSlate300
                    : styles.textSlate700,
                ]}
              >
                General
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.tabPill,
                activeTab === 'notifications' ? styles.tabPillActive : (isDarkMode ? styles.tabPillDark : styles.tabPillLight),
              ]}
              onPress={() => setActiveTab('notifications')}
            >
              <Bell
                size={16}
                color={activeTab === 'notifications' ? '#ffffff' : isDarkMode ? '#94a3b8' : '#334155'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabPillText,
                  activeTab === 'notifications'
                    ? styles.tabPillTextActive
                    : isDarkMode
                    ? styles.textSlate300
                    : styles.textSlate700,
                ]}
              >
                Notifications
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.tabPill,
                activeTab === 'privacy' ? styles.tabPillActive : (isDarkMode ? styles.tabPillDark : styles.tabPillLight),
              ]}
              onPress={() => setActiveTab('privacy')}
            >
              <Shield
                size={16}
                color={activeTab === 'privacy' ? '#ffffff' : isDarkMode ? '#94a3b8' : '#334155'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabPillText,
                  activeTab === 'privacy'
                    ? styles.tabPillTextActive
                    : isDarkMode
                    ? styles.textSlate300
                    : styles.textSlate700,
                ]}
              >
                Privacy
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Content Area */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: Math.max(insets.bottom, 24) + 40,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* TAB 1: GENERAL (Matches exact uploaded screenshot) */}
          {activeTab === 'general' && (
            <View style={styles.tabContent}>
              {/* Personal Information Header */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isDarkMode ? styles.textWhite : styles.textDark]}>
                  Personal Information
                </Text>
                <Text style={[styles.sectionSubtitle, isDarkMode ? styles.textSlate400 : styles.textSlate500]}>
                  Manage your profile information
                </Text>
              </View>

              {/* Card 1: Personal Information Form */}
              <View style={[styles.cardBox, isDarkMode ? styles.cardBoxDark : styles.cardBoxLight]}>
                {/* 2-Col First Name & Last Name */}
                <View style={styles.nameRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, isDarkMode ? styles.textSlate300 : styles.textSlate700]}>
                      First Name
                    </Text>
                    <TextInput
                      value={firstName}
                      onChangeText={(t) => setFirstName(t ? t.charAt(0).toUpperCase() + t.slice(1) : '')}
                      placeholder="First name"
                      placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
                      style={[styles.inputField, isDarkMode ? styles.inputFieldDark : styles.inputFieldLight]}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, isDarkMode ? styles.textSlate300 : styles.textSlate700]}>
                      Last Name
                    </Text>
                    <TextInput
                      value={lastName}
                      onChangeText={(t) => setLastName(t ? t.charAt(0).toUpperCase() + t.slice(1) : '')}
                      placeholder="Last name"
                      placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
                      style={[styles.inputField, isDarkMode ? styles.inputFieldDark : styles.inputFieldLight]}
                    />
                  </View>
                </View>

                {/* Email Section */}
                <View style={styles.formGroup}>
                  <Text style={[styles.fieldLabel, isDarkMode ? styles.textSlate300 : styles.textSlate700]}>
                    Email
                  </Text>
                  <TextInput
                    value={email}
                    editable={false}
                    style={[styles.inputField, styles.disabledInput, isDarkMode ? styles.disabledDark : styles.disabledLight]}
                  />
                  <View style={styles.emailEditContainer}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={[styles.outlineBtn, isDarkMode ? styles.outlineBtnDark : styles.outlineBtnLight]}
                      onPress={handleEditEmail}
                    >
                      <Edit2 size={13} color={isDarkMode ? '#cbd5e1' : '#334155'} style={{ marginRight: 6 }} />
                      <Text style={[styles.outlineBtnText, isDarkMode ? styles.textSlate300 : styles.textSlate700]}>
                        Edit
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.infoCaptionRow}>
                    <Info size={13} color={isDarkMode ? '#94a3b8' : '#64748b'} style={{ marginRight: 4 }} />
                    <Text style={[styles.infoCaptionText, isDarkMode ? styles.textSlate400 : styles.textSlate500]}>
                      The change will require email verification
                    </Text>
                  </View>
                </View>

                {/* Phone Number */}
                <View style={styles.formGroup}>
                  <Text style={[styles.fieldLabel, isDarkMode ? styles.textSlate300 : styles.textSlate700]}>
                    Phone Number
                  </Text>
                  <View style={styles.phoneInputRow}>
                    {/* Country Code Selector */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.countryCodeBtn, isDarkMode ? styles.countryCodeBtnDark : styles.countryCodeBtnLight]}
                      onPress={() => setShowCountryPicker((prev) => !prev)}
                    >
                      <Text style={styles.countryFlagText}>{currentFlag}</Text>
                      <Text style={[styles.countryCodeText, isDarkMode ? styles.textWhite : styles.textDark]}>
                        {countryCode}
                      </Text>
                      <ChevronDown size={14} color={isDarkMode ? '#94a3b8' : '#64748b'} />
                    </TouchableOpacity>

                    {/* Phone Input */}
                    <TextInput
                      value={phone}
                      onChangeText={(t) => setPhone(t.replace(/\D/g, ''))}
                      keyboardType="phone-pad"
                      placeholder="8475136528"
                      placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
                      style={[styles.inputField, { flex: 1 }, isDarkMode ? styles.inputFieldDark : styles.inputFieldLight]}
                    />
                  </View>

                  {/* Country Dropdown options if expanded */}
                  {showCountryPicker && (
                    <View style={[styles.dropdownMenu, isDarkMode ? styles.dropdownMenuDark : styles.dropdownMenuLight]}>
                      {COUNTRY_CODES.map((c) => (
                        <TouchableOpacity
                          key={c.code}
                          style={styles.dropdownMenuItem}
                          onPress={() => {
                            setCountryCode(c.code);
                            setShowCountryPicker(false);
                          }}
                        >
                          <Text style={{ marginRight: 8, fontSize: 16 }}>{c.flag}</Text>
                          <Text style={[styles.dropdownMenuText, isDarkMode ? styles.textWhite : styles.textDark]}>
                            {c.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Verified Phone Status Badge */}
                  {hasValidPhone && (
                    <View style={styles.verifiedPhoneBadge}>
                      <View style={styles.greenCheckCircle}>
                        <Check size={11} color="#ffffff" strokeWidth={3} />
                      </View>
                      <Text style={[styles.verifiedPhoneText, isDarkMode ? styles.textWhite : styles.textDark]}>
                        {countryCode}{cleanDigits}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Gender Segmented Control */}
                <View style={styles.formGroup}>
                  <Text style={[styles.fieldLabel, isDarkMode ? styles.textSlate300 : styles.textSlate700]}>
                    Gender
                  </Text>
                  <View style={[styles.segmentedContainer, isDarkMode ? styles.segmentedContainerDark : styles.segmentedContainerLight]}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        styles.segmentBtn,
                        gender === 'male' && (isDarkMode ? styles.segmentBtnActiveDark : styles.segmentBtnActiveLight),
                      ]}
                      onPress={() => setGender('male')}
                    >
                      <Text
                        style={[
                          styles.segmentBtnText,
                          gender === 'male'
                            ? (isDarkMode ? styles.segmentBtnTextActiveDark : styles.segmentBtnTextActiveLight)
                            : (isDarkMode ? styles.textSlate400 : styles.textSlate600),
                        ]}
                      >
                        Male
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        styles.segmentBtn,
                        gender === 'female' && (isDarkMode ? styles.segmentBtnActiveDark : styles.segmentBtnActiveLight),
                      ]}
                      onPress={() => setGender('female')}
                    >
                      <Text
                        style={[
                          styles.segmentBtnText,
                          gender === 'female'
                            ? (isDarkMode ? styles.segmentBtnTextActiveDark : styles.segmentBtnTextActiveLight)
                            : (isDarkMode ? styles.textSlate400 : styles.textSlate600),
                        ]}
                      >
                        Female
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Primary Blue Save Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={styles.saveBtnInner}>
                    <Save size={16} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.saveBtnText}>Save</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Card 2: Password */}
              <View style={[styles.cardBox, isDarkMode ? styles.cardBoxDark : styles.cardBoxLight]}>
                <View style={styles.cardHeaderRow}>
                  <Lock size={18} color={isDarkMode ? '#ffffff' : '#0f172a'} style={{ marginRight: 8 }} />
                  <Text style={[styles.cardTitle, isDarkMode ? styles.textWhite : styles.textDark]}>
                    Password
                  </Text>
                </View>

                <View style={styles.centerButtonWrapper}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.outlineBtnWide, isDarkMode ? styles.outlineBtnDark : styles.outlineBtnLight]}
                    onPress={handleChangePassword}
                  >
                    <Lock size={14} color={isDarkMode ? '#cbd5e1' : '#334155'} style={{ marginRight: 8 }} />
                    <Text style={[styles.outlineBtnWideText, isDarkMode ? styles.textSlate200 : styles.textSlate800]}>
                      Change Password
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Card 3: Search Area */}
              <View style={[styles.cardBox, isDarkMode ? styles.cardBoxDark : styles.cardBoxLight]}>
                <View style={styles.cardHeaderRow}>
                  <MapPin size={18} color={isDarkMode ? '#ffffff' : '#0f172a'} style={{ marginRight: 8 }} />
                  <Text style={[styles.cardTitle, isDarkMode ? styles.textWhite : styles.textDark]}>
                    Search Area
                  </Text>
                </View>

                <View style={[styles.lockedFeatureBox, isDarkMode ? styles.lockedFeatureDark : styles.lockedFeatureLight]}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={[styles.lockedFeatureTitle, isDarkMode ? styles.textWhite : styles.textSlate800]}>
                      Customise your search distance
                    </Text>
                    <Text style={[styles.lockedFeatureSubtitle, isDarkMode ? styles.textSlate400 : styles.textSlate500]}>
                      Available with a higher subscription
                    </Text>
                  </View>
                  <Lock size={18} color={isDarkMode ? '#94a3b8' : '#64748b'} />
                </View>
              </View>
            </View>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isDarkMode ? styles.textWhite : styles.textDark]}>
                  Notifications
                </Text>
                <Text style={[styles.sectionSubtitle, isDarkMode ? styles.textSlate400 : styles.textSlate500]}>
                  Manage your notification preferences
                </Text>
              </View>

              <View style={[styles.cardBox, isDarkMode ? styles.cardBoxDark : styles.cardBoxLight]}>
                <View style={styles.settingToggleItem}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={[styles.toggleTitle, isDarkMode ? styles.textWhite : styles.textDark]}>
                      Contact notifications
                    </Text>
                    <Text style={[styles.toggleDesc, isDarkMode ? styles.textSlate400 : styles.textSlate500]}>
                      Receive notifications when someone contacts you
                    </Text>
                  </View>
                  <Switch
                    value={contactNotifications}
                    onValueChange={setContactNotifications}
                    trackColor={{ false: '#334155', true: '#2563eb' }}
                  />
                </View>

                <View style={styles.settingToggleItem}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={[styles.toggleTitle, isDarkMode ? styles.textWhite : styles.textDark]}>
                      Lesson confirmation/cancellation
                    </Text>
                    <Text style={[styles.toggleDesc, isDarkMode ? styles.textSlate400 : styles.textSlate500]}>
                      Receive alerts for your lesson bookings
                    </Text>
                  </View>
                  <Switch
                    value={lessonNotifications}
                    onValueChange={setLessonNotifications}
                    trackColor={{ false: '#334155', true: '#2563eb' }}
                  />
                </View>

                <View style={[styles.settingToggleItem, { borderBottomWidth: 0 }]}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={[styles.toggleTitle, isDarkMode ? styles.textWhite : styles.textDark]}>
                      Match notifications
                    </Text>
                    <Text style={[styles.toggleDesc, isDarkMode ? styles.textSlate400 : styles.textSlate500]}>
                      Receive alerts when an open match near you needs players
                    </Text>
                  </View>
                  <Switch
                    value={matchNotifications}
                    onValueChange={setMatchNotifications}
                    trackColor={{ false: '#334155', true: '#2563eb' }}
                  />
                </View>
              </View>
            </View>
          )}

          {/* TAB 3: PRIVACY */}
          {activeTab === 'privacy' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isDarkMode ? styles.textWhite : styles.textDark]}>
                  Privacy
                </Text>
                <Text style={[styles.sectionSubtitle, isDarkMode ? styles.textSlate400 : styles.textSlate500]}>
                  Manage your privacy and visibility settings
                </Text>
              </View>

              <View style={[styles.cardBox, isDarkMode ? styles.cardBoxDark : styles.cardBoxLight]}>
                <View style={styles.settingToggleItem}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={[styles.toggleTitle, isDarkMode ? styles.textWhite : styles.textDark]}>
                      Profile Visibility
                    </Text>
                    <Text style={[styles.toggleDesc, isDarkMode ? styles.textSlate400 : styles.textSlate500]}>
                      Allow padel players in your area to view your profile and level
                    </Text>
                  </View>
                  <Switch
                    value={profileVisible}
                    onValueChange={setProfileVisible}
                    trackColor={{ false: '#334155', true: '#2563eb' }}
                  />
                </View>

                <View style={styles.settingToggleItem}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={[styles.toggleTitle, isDarkMode ? styles.textWhite : styles.textDark]}>
                      Share Phone with Confirmed Partners
                    </Text>
                    <Text style={[styles.toggleDesc, isDarkMode ? styles.textSlate400 : styles.textSlate500]}>
                      Only players in the same confirmed match can view your phone number
                    </Text>
                  </View>
                  <Switch
                    value={sharePhoneWithPartners}
                    onValueChange={setSharePhoneWithPartners}
                    trackColor={{ false: '#334155', true: '#2563eb' }}
                  />
                </View>

                <View style={[styles.settingToggleItem, { borderBottomWidth: 0 }]}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={[styles.toggleTitle, isDarkMode ? styles.textWhite : styles.textDark]}>
                      Allow Direct Messages
                    </Text>
                    <Text style={[styles.toggleDesc, isDarkMode ? styles.textSlate400 : styles.textSlate500]}>
                      Receive game invitations and chat messages from community members
                    </Text>
                  </View>
                  <Switch
                    value={allowDirectMessages}
                    onValueChange={setAllowDirectMessages}
                    trackColor={{ false: '#334155', true: '#2563eb' }}
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#0a0f1d',
  },
  containerLight: {
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  textWhite: {
    color: '#ffffff',
  },
  textDark: {
    color: '#0f172a',
  },
  textSlate200: {
    color: '#e2e8f0',
  },
  textSlate300: {
    color: '#cbd5e1',
  },
  textSlate400: {
    color: '#94a3b8',
  },
  textSlate500: {
    color: '#64748b',
  },
  textSlate600: {
    color: '#475569',
  },
  textSlate700: {
    color: '#334155',
  },
  textSlate800: {
    color: '#1e293b',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeBtnLight: {
    backgroundColor: '#e2e8f0',
  },
  tabBarContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  tabBarContainerDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0a0f1d',
  },
  tabBarContainerLight: {
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabPillActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  tabPillDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  tabPillLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  contentScroll: {
    flex: 1,
    paddingTop: 12,
  },
  tabContent: {
    gap: 14,
  },
  sectionHeader: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  cardBox: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  cardBoxDark: {
    backgroundColor: '#131b2e',
    borderColor: '#232f48',
  },
  cardBoxLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputField: {
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  inputFieldDark: {
    backgroundColor: '#0a0f1d',
    borderColor: '#2a3853',
    color: '#ffffff',
  },
  inputFieldLight: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    color: '#0f172a',
  },
  disabledInput: {
    opacity: 0.85,
  },
  disabledDark: {
    backgroundColor: '#0d1527',
    borderColor: '#1e2a40',
    color: '#94a3b8',
  },
  disabledLight: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
    color: '#64748b',
  },
  emailEditContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  outlineBtnDark: {
    borderColor: '#334155',
    backgroundColor: '#1e293b',
  },
  outlineBtnLight: {
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  outlineBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCaptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  infoCaptionText: {
    fontSize: 11,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  countryCodeBtnDark: {
    backgroundColor: '#0a0f1d',
    borderColor: '#2a3853',
  },
  countryCodeBtnLight: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
  },
  countryFlagText: {
    fontSize: 16,
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dropdownMenu: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
    paddingVertical: 4,
  },
  dropdownMenuDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  dropdownMenuLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownMenuText: {
    fontSize: 13,
    fontWeight: '600',
  },
  verifiedPhoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  greenCheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedPhoneText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  segmentedContainerDark: {
    backgroundColor: '#0a0f1d',
  },
  segmentedContainerLight: {
    backgroundColor: '#f1f5f9',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActiveDark: {
    backgroundColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentBtnActiveLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  segmentBtnTextActiveDark: {
    color: '#ffffff',
    fontWeight: '700',
  },
  segmentBtnTextActiveLight: {
    color: '#0f172a',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  centerButtonWrapper: {
    alignItems: 'center',
  },
  outlineBtnWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    width: '100%',
  },
  outlineBtnWideText: {
    fontSize: 13,
    fontWeight: '600',
  },
  lockedFeatureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  lockedFeatureDark: {
    backgroundColor: '#0a0f1d',
    borderColor: '#1e2a40',
  },
  lockedFeatureLight: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  lockedFeatureTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  lockedFeatureSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  settingToggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  toggleTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  toggleDesc: {
    fontSize: 11.5,
    marginTop: 2,
  },
});
