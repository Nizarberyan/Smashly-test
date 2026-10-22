import React, { useState } from 'react';
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
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  User,
  Bell,
  Shield,
  Star,
  CreditCard,
  Pencil,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Save,
  Moon,
  Sun,
} from 'lucide-react-native';

export type SettingsTab = 'general' | 'notifications' | 'privacy' | 'subscription' | 'payment';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
  isDarkMode?: boolean;
  onToggleDarkMode?: (value: boolean) => void;
  onProfileUpdated?: (updated: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: 'Male' | 'Female';
  }) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  initialTab = 'general',
  isDarkMode = true,
  onToggleDarkMode,
  onProfileUpdated,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // Form states - General
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [email, setEmail] = useState('email@gmail.com');
  const [phone, setPhone] = useState('8475136528');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');

  // Form states - Notifications
  const [contactNotifications, setContactNotifications] = useState(true);
  const [lessonNotifications, setLessonNotifications] = useState(true);
  const [promotionsPush, setPromotionsPush] = useState(false);
  const [promotionsEmail, setPromotionsEmail] = useState(false);

  const handleSave = () => {
    if (onProfileUpdated) {
      onProfileUpdated({
        firstName,
        lastName,
        email,
        phone,
        gender,
      });
    }
    Alert.alert('Paramètres', 'Vos préférences ont été enregistrées avec succès !', [
      { text: 'OK', onPress: onClose },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, isDarkMode && styles.containerDark, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isDarkMode && styles.textWhite]}>Settings</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.closeBtn, isDarkMode && styles.closeBtnDark]}
            onPress={onClose}
          >
            <X size={22} color={isDarkMode ? '#94a3b8' : '#1e293b'} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* Horizontal Navigation Tabs */}
        <View style={[styles.tabBarContainer, isDarkMode && styles.tabBarContainerDark]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScroll}
          >
            {/* General Tab */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.tabPill,
                isDarkMode && styles.tabPillDark,
                activeTab === 'general' && styles.tabPillActive,
              ]}
              onPress={() => setActiveTab('general')}
            >
              <User
                size={16}
                color={activeTab === 'general' ? '#ffffff' : isDarkMode ? '#94a3b8' : '#334155'}
                strokeWidth={2.2}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabPillText,
                  isDarkMode && styles.textSlate300,
                  activeTab === 'general' && styles.tabPillTextActive,
                ]}
              >
                General
              </Text>
            </TouchableOpacity>

            {/* Notifications Tab */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.tabPill,
                isDarkMode && styles.tabPillDark,
                activeTab === 'notifications' && styles.tabPillActive,
              ]}
              onPress={() => setActiveTab('notifications')}
            >
              <Bell
                size={16}
                color={activeTab === 'notifications' ? '#ffffff' : isDarkMode ? '#94a3b8' : '#334155'}
                strokeWidth={2.2}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabPillText,
                  isDarkMode && styles.textSlate300,
                  activeTab === 'notifications' && styles.tabPillTextActive,
                ]}
              >
                Notifications
              </Text>
            </TouchableOpacity>

            {/* Privacy Tab */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.tabPill,
                isDarkMode && styles.tabPillDark,
                activeTab === 'privacy' && styles.tabPillActive,
              ]}
              onPress={() => setActiveTab('privacy')}
            >
              <Shield
                size={16}
                color={activeTab === 'privacy' ? '#ffffff' : isDarkMode ? '#94a3b8' : '#334155'}
                strokeWidth={2.2}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabPillText,
                  isDarkMode && styles.textSlate300,
                  activeTab === 'privacy' && styles.tabPillTextActive,
                ]}
              >
                Privacy
              </Text>
            </TouchableOpacity>

            {/* Subscription Tab */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.tabPill,
                isDarkMode && styles.tabPillDark,
                activeTab === 'subscription' && styles.tabPillActive,
              ]}
              onPress={() => setActiveTab('subscription')}
            >
              <Star
                size={16}
                color={activeTab === 'subscription' ? '#ffffff' : isDarkMode ? '#94a3b8' : '#334155'}
                strokeWidth={2.2}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabPillText,
                  isDarkMode && styles.textSlate300,
                  activeTab === 'subscription' && styles.tabPillTextActive,
                ]}
              >
                Subscription
              </Text>
            </TouchableOpacity>

            {/* Payment Tab */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.tabPill,
                isDarkMode && styles.tabPillDark,
                activeTab === 'payment' && styles.tabPillActive,
              ]}
              onPress={() => setActiveTab('payment')}
            >
              <CreditCard
                size={16}
                color={activeTab === 'payment' ? '#ffffff' : isDarkMode ? '#94a3b8' : '#334155'}
                strokeWidth={2.2}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabPillText,
                  isDarkMode && styles.textSlate300,
                  activeTab === 'payment' && styles.tabPillTextActive,
                ]}
              >
                Payment
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Content Area */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: Math.max(insets.bottom, 24) + 20,
          }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={Platform.OS === 'android'}
        >
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <View>
              {/* DARK MODE TOGGLE CARD */}
              <View style={[styles.themeCard, isDarkMode && styles.themeCardDark]}>
                <View style={styles.themeInfoCol}>
                  <View style={styles.themeTitleRow}>
                    {isDarkMode ? (
                      <Moon size={19} color="#38bdf8" strokeWidth={2.4} style={{ marginRight: 8 }} />
                    ) : (
                      <Sun size={19} color="#eab308" strokeWidth={2.4} style={{ marginRight: 8 }} />
                    )}
                    <Text style={[styles.themeTitle, isDarkMode && styles.textWhite]}>
                      Dark Mode (Thème Sombre)
                    </Text>
                  </View>
                  <Text style={[styles.themeSubtitle, isDarkMode && styles.textSlate400]}>
                    Harmoniser toute l'application avec le style sombre Smashly
                  </Text>
                </View>

                <Switch
                  value={isDarkMode}
                  onValueChange={(val) => onToggleDarkMode?.(val)}
                  trackColor={{ false: '#334155', true: '#2563eb' }}
                  thumbColor="#ffffff"
                />
              </View>

              <Text style={[styles.sectionTitle, isDarkMode && styles.textWhite]}>Personal Information</Text>
              <Text style={[styles.sectionSubtitle, isDarkMode && styles.textSlate400]}>Manage your profile information</Text>

              <View style={[styles.formCard, isDarkMode && styles.formCardDark]}>
                {/* First Name */}
                <Text style={[styles.inputLabel, isDarkMode && styles.textSlate200]}>First Name</Text>
                <TextInput
                  style={[styles.textInput, isDarkMode && styles.textInputDark]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First Name"
                  placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
                />

                {/* Last Name */}
                <Text style={[styles.inputLabel, isDarkMode && styles.textSlate200, { marginTop: 14 }]}>Last Name</Text>
                <TextInput
                  style={[styles.textInput, isDarkMode && styles.textInputDark]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last Name"
                  placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
                />

                {/* Email */}
                <Text style={[styles.inputLabel, isDarkMode && styles.textSlate200, { marginTop: 14 }]}>Email</Text>
                <TextInput
                  style={[styles.textInput, isDarkMode && styles.textInputDark]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Email"
                  placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.editEmailBtn, isDarkMode && styles.editEmailBtnDark]}
                  onPress={() => Alert.alert('Email', 'Un lien de confirmation vous sera envoyé.')}
                >
                  <Pencil size={15} color={isDarkMode ? '#94a3b8' : '#334155'} strokeWidth={2} style={{ marginRight: 6 }} />
                  <Text style={[styles.editEmailText, isDarkMode && styles.textSlate200]}>Edit</Text>
                </TouchableOpacity>
                <Text style={[styles.helperText, isDarkMode && styles.textSlate400]}>
                  ⓘ The change will require email verification
                </Text>

                {/* Phone Number */}
                <Text style={[styles.inputLabel, isDarkMode && styles.textSlate200, { marginTop: 14 }]}>Phone Number</Text>
                <View style={styles.phoneRow}>
                  <TouchableOpacity activeOpacity={0.7} style={[styles.countryPicker, isDarkMode && styles.countryPickerDark]}>
                    <Text style={styles.flagText}>🇬🇧</Text>
                    <Text style={[styles.countryCode, isDarkMode && styles.textWhite]}>+44</Text>
                    <ChevronDown size={14} color={isDarkMode ? '#94a3b8' : '#64748b'} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.phoneInput, isDarkMode && styles.textInputDark]}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="Phone Number"
                    placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
                  />
                </View>
                <View style={styles.verifiedRow}>
                  <CheckCircle2 size={16} color="#16a34a" strokeWidth={2.4} />
                  <Text style={[styles.verifiedText, isDarkMode && styles.textSlate300]}>+44{phone}</Text>
                </View>

                {/* Gender */}
                <Text style={[styles.inputLabel, isDarkMode && styles.textSlate200, { marginTop: 16 }]}>Gender</Text>
                <View style={[styles.genderContainer, isDarkMode && styles.genderContainerDark]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.genderPill,
                      gender === 'Male' && (isDarkMode ? styles.genderPillActiveDark : styles.genderPillActive),
                    ]}
                    onPress={() => setGender('Male')}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        isDarkMode && styles.textSlate400,
                        gender === 'Male' && (isDarkMode ? styles.textWhite : styles.genderTextActive),
                      ]}
                    >
                      Male
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.genderPill,
                      gender === 'Female' && (isDarkMode ? styles.genderPillActiveDark : styles.genderPillActive),
                    ]}
                    onPress={() => setGender('Female')}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        isDarkMode && styles.textSlate400,
                        gender === 'Female' && (isDarkMode ? styles.textWhite : styles.genderTextActive),
                      ]}
                    >
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.saveBtn}
                onPress={handleSave}
              >
                <Save size={18} color="#ffffff" strokeWidth={2.2} style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <View>
              <Text style={[styles.sectionTitle, isDarkMode && styles.textWhite]}>Notifications</Text>
              <Text style={[styles.sectionSubtitle, isDarkMode && styles.textSlate400]}>
                Manage your notification preferences
              </Text>

              {/* Card 1: Contact notifications */}
              <View style={[styles.notifCard, isDarkMode && styles.notifCardDark]}>
                <View style={styles.notifTextCol}>
                  <Text style={[styles.notifTitle, isDarkMode && styles.textWhite]}>
                    Contact notifications
                  </Text>
                  <Text style={[styles.notifSub, isDarkMode && styles.textSlate400]}>
                    Receive notifications when someone contacts you
                  </Text>
                </View>
                <Switch
                  value={contactNotifications}
                  onValueChange={setContactNotifications}
                  trackColor={{ false: isDarkMode ? '#334155' : '#cbd5e1', true: '#2563eb' }}
                  thumbColor="#ffffff"
                />
              </View>

              {/* Card 2: Lesson confirmation/cancellation */}
              <View style={[styles.notifCard, isDarkMode && styles.notifCardDark]}>
                <View style={styles.notifTextCol}>
                  <Text style={[styles.notifTitle, isDarkMode && styles.textWhite]}>
                    Lesson confirmation/cancellation
                  </Text>
                  <Text style={[styles.notifSub, isDarkMode && styles.textSlate400]}>
                    Receive alerts for your booked lessons
                  </Text>
                </View>
                <Switch
                  value={lessonNotifications}
                  onValueChange={setLessonNotifications}
                  trackColor={{ false: isDarkMode ? '#334155' : '#cbd5e1', true: '#2563eb' }}
                  thumbColor="#ffffff"
                />
              </View>

              {/* Card 3: Commercial communications */}
              <View style={[styles.notifCardMulti, isDarkMode && styles.notifCardDark]}>
                <Text style={[styles.notifTitle, isDarkMode && styles.textWhite]}>
                  Commercial communications
                </Text>
                <View style={styles.subSwitchRow}>
                  <Text style={[styles.subSwitchLabel, isDarkMode && styles.textSlate200]}>
                    Promotions via Push
                  </Text>
                  <Switch
                    value={promotionsPush}
                    onValueChange={setPromotionsPush}
                    trackColor={{ false: isDarkMode ? '#334155' : '#cbd5e1', true: '#2563eb' }}
                    thumbColor="#ffffff"
                  />
                </View>
                <View style={[styles.subDivider, isDarkMode && styles.subDividerDark]} />
                <View style={styles.subSwitchRow}>
                  <Text style={[styles.subSwitchLabel, isDarkMode && styles.textSlate200]}>
                    Promotions via Email
                  </Text>
                  <Switch
                    value={promotionsEmail}
                    onValueChange={setPromotionsEmail}
                    trackColor={{ false: isDarkMode ? '#334155' : '#cbd5e1', true: '#2563eb' }}
                    thumbColor="#ffffff"
                  />
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.saveBtn}
                onPress={handleSave}
              >
                <Save size={18} color="#ffffff" strokeWidth={2.2} style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* TAB 3: PRIVACY */}
          {activeTab === 'privacy' && (
            <View>
              <Text style={[styles.sectionTitle, isDarkMode && styles.textWhite]}>Privacy</Text>
              <Text style={[styles.sectionSubtitle, isDarkMode && styles.textSlate400]}>
                Your data and your privacy
              </Text>

              {/* Card 1: Your data is protected */}
              <View style={[styles.protectedCard, isDarkMode && styles.protectedCardDark]}>
                <View style={styles.protectedHeader}>
                  <Shield size={20} color="#2563eb" strokeWidth={2.4} style={{ marginRight: 8 }} />
                  <Text style={[styles.protectedTitle, isDarkMode && styles.textWhite]}>
                    Your data is protected
                  </Text>
                </View>

                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={[styles.bulletText, isDarkMode && styles.textSlate300]}>
                      Only accepted contacts can see your private information (phone, name, profile photo)
                    </Text>
                  </View>

                  <View style={styles.bulletItem}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={[styles.bulletText, isDarkMode && styles.textSlate300]}>
                      Only players of a similar level (±1 level) can contact you
                    </Text>
                  </View>

                  <View style={styles.bulletItem}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={[styles.bulletText, isDarkMode && styles.textSlate300]}>
                      You control who enters your network by accepting or declining requests
                    </Text>
                  </View>
                </View>
              </View>

              {/* Card 2: Download my data */}
              <TouchableOpacity
                activeOpacity={0.75}
                style={[styles.actionCard, isDarkMode && styles.actionCardDark]}
                onPress={() =>
                  Alert.alert('GDPR Export', 'Votre export de données vous sera envoyé par email.')
                }
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionCardTitle, isDarkMode && styles.textWhite]}>
                    Download my data
                  </Text>
                  <Text style={[styles.actionCardSub, isDarkMode && styles.textSlate400]}>
                    Export of your personal data (GDPR)
                  </Text>
                </View>
                <Download size={20} color={isDarkMode ? '#94a3b8' : '#64748b'} strokeWidth={2} />
              </TouchableOpacity>

              {/* Card 3: Privacy Policy */}
              <TouchableOpacity
                activeOpacity={0.75}
                style={[styles.actionCard, isDarkMode && styles.actionCardDark]}
                onPress={() =>
                  Alert.alert('Politique de confidentialité', 'Ouverture de la politique de confidentialité Smashly.')
                }
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionCardTitle, isDarkMode && styles.textWhite]}>
                    Privacy Policy
                  </Text>
                  <Text style={[styles.actionCardSub, isDarkMode && styles.textSlate400]}>
                    How we protect your data (GDPR)
                  </Text>
                </View>
                <ChevronRight size={20} color={isDarkMode ? '#94a3b8' : '#64748b'} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          )}

          {/* TAB 4: SUBSCRIPTION */}
          {activeTab === 'subscription' && (
            <View>
              <Text style={[styles.sectionTitle, isDarkMode && styles.textWhite]}>Subscription</Text>
              <Text style={[styles.sectionSubtitle, isDarkMode && styles.textSlate400]}>
                Manage your Smashly pass and membership
              </Text>

              <View style={[styles.formCard, isDarkMode && styles.formCardDark]}>
                <View style={styles.subscriptionBadgeRow}>
                  <View style={[styles.bronzeBadge, isDarkMode && styles.bronzeBadgeDark]}>
                    <Text style={[styles.bronzeBadgeText, isDarkMode && styles.bronzeBadgeTextDark]}>
                      Level 1 Member
                    </Text>
                  </View>
                  <Text style={[styles.planCost, isDarkMode && styles.textWhite]}>Free</Text>
                </View>
                <Text style={[styles.subscriptionTitle, isDarkMode && styles.textWhite]}>
                  Smashly Community Pass
                </Text>
                <Text style={[styles.subscriptionDesc, isDarkMode && styles.textSlate400]}>
                  Accès à la recherche de partenaires, aux parties ouvertes et à l'assistant padel IA.
                </Text>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.upgradeBtn}
                  onPress={() => Alert.alert('Smashly Pro', 'Bientôt disponible !')}
                >
                  <Star size={16} color="#ffffff" strokeWidth={2.4} style={{ marginRight: 6 }} />
                  <Text style={styles.upgradeBtnText}>Passer à Smashly Pro</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* TAB 5: PAYMENT */}
          {activeTab === 'payment' && (
            <View>
              <Text style={[styles.sectionTitle, isDarkMode && styles.textWhite]}>Payment</Text>
              <Text style={[styles.sectionSubtitle, isDarkMode && styles.textSlate400]}>
                Payment methods and billing details
              </Text>

              <View style={[styles.formCard, isDarkMode && styles.formCardDark]}>
                <Text style={[styles.inputLabel, isDarkMode && styles.textSlate200]}>
                  Saved Payment Methods
                </Text>
                <View style={[styles.actionCard, isDarkMode && styles.actionCardDark]}>
                  <CreditCard size={20} color="#2563eb" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.actionCardTitle, isDarkMode && styles.textWhite]}>
                      •••• •••• •••• 4242
                    </Text>
                    <Text style={[styles.actionCardSub, isDarkMode && styles.textSlate400]}>
                      Expires 12/28
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.editEmailBtn, isDarkMode && styles.editEmailBtnDark, { marginTop: 14 }]}
                  onPress={() => Alert.alert('Ajouter une carte', 'Module de paiement sécurisé.')}
                >
                  <Text style={[styles.editEmailText, isDarkMode && styles.textSlate200]}>
                    + Add payment method
                  </Text>
                </TouchableOpacity>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 6,
  },
  tabBarContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 12,
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabPillActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  tabPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  tabPillTextActive: {
    color: '#ffffff',
  },
  contentScroll: {
    flex: 1,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 13.5,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 16,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: 15,
    color: '#0f172a',
  },
  editEmailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 9,
    marginTop: 8,
  },
  editEmailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    marginRight: 10,
  },
  flagText: {
    fontSize: 16,
    marginRight: 4,
  },
  countryCode: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: 15,
    color: '#0f172a',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginLeft: 6,
  },
  genderContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 3,
  },
  genderPill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  genderPillActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  genderTextActive: {
    fontWeight: '700',
    color: '#0f172a',
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  notifCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notifTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  notifSub: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 17,
  },
  notifCardMulti: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
  },
  subSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  subSwitchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  subDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 10,
  },
  protectedCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  protectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  protectedTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#1e293b',
  },
  bulletList: {
    gap: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontSize: 14,
    color: '#2563eb',
    marginRight: 6,
    lineHeight: 18,
  },
  bulletText: {
    flex: 1,
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  actionCardSub: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 2,
  },
  subscriptionBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bronzeBadge: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  bronzeBadgeText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600',
  },
  planCost: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  subscriptionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  subscriptionDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 14,
  },
  upgradeBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700',
  },

  // DARK MODE & THEME CARD STYLES
  containerDark: {
    backgroundColor: '#0a0f1d',
  },
  textWhite: {
    color: '#ffffff',
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
  closeBtnDark: {
    backgroundColor: '#1e293b',
    borderRadius: 999,
  },
  tabBarContainerDark: {
    borderBottomColor: '#1e293b',
  },
  tabPillDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  formCardDark: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    shadowOpacity: 0.2,
  },
  textInputDark: {
    backgroundColor: '#0a0f1d',
    borderColor: '#334155',
    color: '#ffffff',
  },
  editEmailBtnDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  countryPickerDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  genderContainerDark: {
    backgroundColor: '#0a0f1d',
    borderWidth: 1,
    borderColor: '#334155',
  },
  genderPillActiveDark: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  themeCardDark: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
  },
  themeInfoCol: {
    flex: 1,
    paddingRight: 12,
  },
  themeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  themeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  themeSubtitle: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  notifCardDark: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    shadowOpacity: 0.2,
  },
  subDividerDark: {
    backgroundColor: '#1e293b',
  },
  protectedCardDark: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
  },
  actionCardDark: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
  },
  bronzeBadgeDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  bronzeBadgeTextDark: {
    color: '#38bdf8',
  },
});

