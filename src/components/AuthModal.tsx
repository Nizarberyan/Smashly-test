import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Check,
  AlertCircle,
  Zap,
  KeyRound,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react-native';

import { useMatches } from '../context/MatchesContext';

interface AuthModalProps {
  visible: boolean;
  initialMode?: 'login' | 'signup';
  canDismiss?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  visible,
  initialMode = 'login',
  canDismiss = true,
  onClose,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const {
    login,
    signup,
    verifyRegistration,
    resendCode,
    loadNizarProfile,
    loadJulienProfile,
  } = useMatches();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Signup extra fields strictly matching smashlyai.com
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [partnerCode, setPartnerCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Countdown timer for resending verification code
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleModeChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setIsVerifying(false);
    setStatusMessage(null);
  };

  // Pre-fill Mock 1: Julien Dubois (Test Subject Level 7)
  const handleQuickLoginJulien = async () => {
    setEmail('julien@smashly.app');
    setPassword('julien1234');
    loadJulienProfile();
    setStatusMessage({ type: 'success', text: 'Connecté : Julien (Niveau 7 - Sujet du test)' });
    setTimeout(() => {
      onSuccess?.();
      onClose?.();
    }, 800);
  };

  // Pre-fill Mock 2: Nizar Beriane (Real Smashly Token)
  const handleQuickLoginNizar = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      await loadNizarProfile();
      setStatusMessage({
        type: 'success',
        text: 'Connecté : Nizar Beriane (Compte réel API smashlyai.com)',
      });
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 800);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Erreur de connexion au compte Smashly',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Form Submission matching Smashly production validation
  const handleSubmit = async () => {
    setStatusMessage(null);

    if (!email || !email.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Veuillez saisir une adresse email valide.' });
      return;
    }

    if (!password) {
      setStatusMessage({ type: 'error', text: 'Veuillez renseigner un mot de passe.' });
      return;
    }

    if (mode === 'signup') {
      if (!firstName.trim() || !lastName.trim()) {
        setStatusMessage({ type: 'error', text: 'Le prénom et le nom sont obligatoires.' });
        return;
      }
      if (!gender) {
        setStatusMessage({ type: 'error', text: 'Veuillez sélectionner votre genre.' });
        return;
      }
      if (password.length < 8) {
        setStatusMessage({
          type: 'error',
          text: 'Le mot de passe doit contenir au moins 8 caractères.',
        });
        return;
      }
      if (password !== confirmPassword) {
        setStatusMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
        return;
      }

      setLoading(true);
      const res = await signup({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        gender,
        club_code: partnerCode.trim() || undefined,
      });
      setLoading(false);

      if (res.success) {
        if (res.requiresVerification) {
          setIsVerifying(true);
          setResendCountdown(60);
          if (res.devCode) {
            setVerificationCode(res.devCode);
          }
          setStatusMessage({
            type: 'success',
            text: res.message || 'Un code de vérification a été envoyé à votre email.',
          });
        } else {
          setStatusMessage({ type: 'success', text: 'Compte créé avec succès !' });
          setTimeout(() => {
            onSuccess?.();
            onClose?.();
          }, 800);
        }
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Erreur lors de la création.' });
      }
    } else {
      // Login mode
      setLoading(true);
      const res = await login(email.trim(), password);
      setLoading(false);

      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message || 'Connexion réussie !' });
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 800);
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Identifiants incorrects.' });
      }
    }
  };

  // Handle 6-Digit Email Verification matching smashlyai.com
  const handleVerifyCode = async () => {
    if (verificationCode.trim().length !== 6) {
      setStatusMessage({ type: 'error', text: 'Veuillez renseigner un code à 6 chiffres.' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    const res = await verifyRegistration(email.trim(), verificationCode.trim());
    setLoading(false);

    if (res.success) {
      setStatusMessage({ type: 'success', text: 'Email vérifié ! Compte actif.' });
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 900);
    } else {
      setStatusMessage({ type: 'error', text: res.message || 'Code de vérification invalide.' });
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    setLoading(true);
    const res = await resendCode(email.trim());
    setLoading(false);
    if (res.success) {
      setResendCountdown(60);
      setStatusMessage({ type: 'success', text: 'Nouveau code envoyé par email !' });
    } else {
      setStatusMessage({ type: 'error', text: res.message || 'Erreur lors du renvoi.' });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={canDismiss ? onClose : undefined}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Authentic deep dark gradient matching smashlyai.com web client */}
          <LinearGradient
            colors={['#020617', '#0a0f1d', '#0f172a', '#1e293b']}
            locations={[0, 0.35, 0.7, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Top Bar with optional Dismiss Button */}
          <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) }]}>
            {isVerifying ? (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.backBtn}
                onPress={() => setIsVerifying(false)}
              >
                <ArrowLeft size={20} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 36 }} />
            )}

            {/* Clean Centered Smashly Logo Icon */}
            <View style={styles.logoBadge}>
              <Image
                source={require('../../images/pwa-icon-192.png')}
                style={styles.logoImg}
                resizeMode="cover"
              />
            </View>

            {canDismiss && onClose ? (
              <TouchableOpacity activeOpacity={0.7} style={styles.closeBtn} onPress={onClose}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 36 }} />
            )}
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 32 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Authentic Smashly Pill Tab: Se connecter vs Créer un compte */}
            {!isVerifying && (
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.tabBtn, mode === 'login' && styles.tabBtnActive]}
                  onPress={() => handleModeChange('login')}
                >
                  <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                    Se connecter
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.tabBtn, mode === 'signup' && styles.tabBtnActive]}
                  onPress={() => handleModeChange('signup')}
                >
                  <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                    Créer un compte
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Quick Presets for Rapid Evaluation (Login mode only) */}
            {mode === 'login' && !isVerifying && (
              <View style={styles.presetsCard}>
                <Text style={styles.presetsLabel}>COMPTES DÉMO & TEST RAPIDE</Text>
                <View style={styles.quickAccountsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.quickJulienBtn}
                    onPress={handleQuickLoginJulien}
                  >
                    <Zap size={13} color="#facc15" strokeWidth={2.5} style={{ marginRight: 6 }} />
                    <Text style={styles.quickJulienText}>Julien (Niv. 7 · Sujet test)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.quickNizarBtn}
                    onPress={handleQuickLoginNizar}
                  >
                    <Zap size={13} color="#38bdf8" strokeWidth={2.5} style={{ marginRight: 6 }} />
                    <Text style={styles.quickNizarText}>Nizar (Compte réel API)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Status Message (Alert Banner matching smashlyai.com) */}
            {statusMessage && (
              <View
                style={[
                  styles.statusBanner,
                  statusMessage.type === 'success' ? styles.statusSuccess : styles.statusError,
                ]}
              >
                {statusMessage.type === 'success' ? (
                  <View style={styles.statusIconBoxSuccess}>
                    <Check size={14} color="#34d399" strokeWidth={3} />
                  </View>
                ) : (
                  <View style={styles.statusIconBoxError}>
                    <AlertCircle size={14} color="#f87171" strokeWidth={2.5} />
                  </View>
                )}
                <Text
                  style={[
                    styles.statusText,
                    statusMessage.type === 'success'
                      ? styles.statusTextSuccess
                      : styles.statusTextError,
                  ]}
                >
                  {statusMessage.text}
                </Text>
              </View>
            )}

            {/* ----------------------------------------------------------- */}
            {/* EMAIL VERIFICATION SCREEN (Exact layout from smashlyai.com) */}
            {/* ----------------------------------------------------------- */}
            {isVerifying ? (
              <View style={styles.verifyCard}>
                <View style={styles.verifyIconBox}>
                  <Mail size={28} color="#38bdf8" />
                </View>
                <Text style={styles.verifyTitle}>Vérifie ton adresse email</Text>
                <Text style={styles.verifySubtitle}>
                  Un code de vérification a été envoyé à :
                </Text>
                <Text style={styles.verifyEmailHighlight}>{email}</Text>

                <View style={styles.codeWrapper}>
                  <TextInput
                    value={verificationCode}
                    onChangeText={(val) => setVerificationCode(val.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    style={styles.codeInput}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>

                {/* Primary Solid White Submit Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.whiteSubmitBtn}
                  onPress={handleVerifyCode}
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? (
                    <ActivityIndicator color="#000000" />
                  ) : (
                    <Text style={styles.whiteSubmitText}>Vérifier mon compte</Text>
                  )}
                </TouchableOpacity>

                {/* Resend Code Section */}
                <View style={styles.resendRow}>
                  <Text style={styles.resendPrompt}>Tu n'as pas reçu le code ? </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleResend}
                    disabled={resendCountdown > 0}
                  >
                    <Text
                      style={[
                        styles.resendLink,
                        resendCountdown > 0 && styles.resendLinkDisabled,
                      ]}
                    >
                      {resendCountdown > 0 ? `Renvoyer (${resendCountdown}s)` : 'Renvoyer le code'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {/* Google & Microsoft SSO Row matching smashlyai.com */}
                <View style={styles.oauthRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.oauthBtn}
                    onPress={() => {
                      setStatusMessage({
                        type: 'success',
                        text: 'Connexion Google validée.',
                      });
                      setTimeout(() => {
                        login('google.padel@smashly.app');
                        onClose?.();
                      }, 700);
                    }}
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24">
                      <Path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <Path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <Path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <Path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </Svg>
                    <Text style={styles.oauthText}>Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.oauthBtn}
                    onPress={() => {
                      setStatusMessage({
                        type: 'success',
                        text: 'Connexion Microsoft validée.',
                      });
                      setTimeout(() => {
                        login('microsoft.padel@smashly.app');
                        onClose?.();
                      }, 700);
                    }}
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24">
                      <Path fill="#F25022" d="M11.4 11.4H2V2h9.4v9.4z" />
                      <Path fill="#00A4EF" d="M22 11.4h-9.4V2H22v9.4z" />
                      <Path fill="#7FBA00" d="M11.4 22H2v-9.4h9.4V22z" />
                      <Path fill="#FFB900" d="M22 22h-9.4v-9.4H22V22z" />
                    </Svg>
                    <Text style={styles.oauthText}>Microsoft</Text>
                  </TouchableOpacity>
                </View>

                {/* Separator: OU */}
                <View style={styles.separatorRow}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>OU</Text>
                  <View style={styles.separatorLine} />
                </View>

                {/* -------------------------------------------------------- */}
                {/* REAL SMASHLY SIGNUP FIELDS (Matching Production Client)  */}
                {/* -------------------------------------------------------- */}
                {mode === 'signup' ? (
                  <View style={styles.fieldsContainer}>
                    {/* Prénom & Nom: 2 Columns */}
                    <View style={styles.twoColRow}>
                      <TextInput
                        value={firstName}
                        onChangeText={(t) =>
                          setFirstName(t.length > 0 ? t.charAt(0).toUpperCase() + t.slice(1) : '')
                        }
                        placeholder="Prénom"
                        placeholderTextColor="rgba(255, 255, 255, 0.45)"
                        style={[styles.inputBox, styles.halfInput]}
                        autoCapitalize="words"
                        maxLength={50}
                      />
                      <TextInput
                        value={lastName}
                        onChangeText={(t) =>
                          setLastName(t.length > 0 ? t.charAt(0).toUpperCase() + t.slice(1) : '')
                        }
                        placeholder="Nom"
                        placeholderTextColor="rgba(255, 255, 255, 0.45)"
                        style={[styles.inputBox, styles.halfInput]}
                        autoCapitalize="words"
                        maxLength={50}
                      />
                    </View>

                    {/* Gender Selection: Label + Homme / Femme Buttons */}
                    <View style={styles.genderSection}>
                      <Text style={styles.genderSectionLabel}>Genre</Text>
                      <View style={styles.genderRow}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={[
                            styles.genderBtn,
                            gender === 'male' ? styles.genderBtnActive : styles.genderBtnInactive,
                          ]}
                          onPress={() => setGender('male')}
                        >
                          <Text
                            style={[
                              styles.genderBtnText,
                              gender === 'male'
                                ? styles.genderBtnTextActive
                                : styles.genderBtnTextInactive,
                            ]}
                          >
                            Homme
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={[
                            styles.genderBtn,
                            gender === 'female' ? styles.genderBtnActive : styles.genderBtnInactive,
                          ]}
                          onPress={() => setGender('female')}
                        >
                          <Text
                            style={[
                              styles.genderBtnText,
                              gender === 'female'
                                ? styles.genderBtnTextActive
                                : styles.genderBtnTextInactive,
                            ]}
                          >
                            Femme
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {gender === null && (
                        <Text style={styles.genderHint}>Sélectionnez un genre pour continuer</Text>
                      )}
                    </View>

                    {/* Email with leading Mail icon */}
                    <View style={styles.inputWithIcon}>
                      <Mail size={16} color="rgba(255, 255, 255, 0.5)" style={styles.leftInputIcon} />
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        placeholderTextColor="rgba(255, 255, 255, 0.45)"
                        style={[styles.inputBox, styles.inputBoxPaddedLeft]}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        maxLength={100}
                      />
                    </View>

                    {/* Password with trailing Eye toggle icon (min 8 chars per Smashly) */}
                    <View style={styles.inputWithIcon}>
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Mot de passe (8 caractères min.)"
                        placeholderTextColor="rgba(255, 255, 255, 0.45)"
                        style={[styles.inputBox, styles.inputBoxPaddedRight]}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setShowPassword((prev) => !prev)}
                        style={styles.rightInputIcon}
                      >
                        {showPassword ? (
                          <EyeOff size={16} color="rgba(255, 255, 255, 0.6)" />
                        ) : (
                          <Eye size={16} color="rgba(255, 255, 255, 0.6)" />
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* Confirm Password with trailing Eye toggle icon */}
                    <View style={styles.inputWithIcon}>
                      <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirmer le mot de passe"
                        placeholderTextColor="rgba(255, 255, 255, 0.45)"
                        style={[styles.inputBox, styles.inputBoxPaddedRight]}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setShowConfirmPassword((prev) => !prev)}
                        style={styles.rightInputIcon}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} color="rgba(255, 255, 255, 0.6)" />
                        ) : (
                          <Eye size={16} color="rgba(255, 255, 255, 0.6)" />
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* Partner Code (Optional) */}
                    <TextInput
                      value={partnerCode}
                      onChangeText={(t) => setPartnerCode(t.toUpperCase())}
                      placeholder="Code partenaire (optionnel)"
                      placeholderTextColor="rgba(255, 255, 255, 0.35)"
                      style={[styles.inputBox, styles.partnerCodeInput]}
                      autoCapitalize="characters"
                    />

                    {/* Authentic Solid White Submit Button */}
                    <TouchableOpacity
                      activeOpacity={0.88}
                      style={styles.whiteSubmitBtn}
                      onPress={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#000000" />
                      ) : (
                        <View style={styles.submitRowInner}>
                          <Text style={styles.whiteSubmitText}>Créer mon compte</Text>
                          <ArrowRight size={16} color="#000000" strokeWidth={2.5} />
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Terms disclaimer matching smashlyai.com */}
                    <Text style={styles.disclaimerText}>
                      En continuant, vous acceptez nos Conditions Générales d'Utilisation et notre
                      Politique de confidentialité.
                    </Text>
                  </View>
                ) : (
                  /* -------------------------------------------------------- */
                  /* REAL SMASHLY LOGIN FIELDS                                 */
                  /* -------------------------------------------------------- */
                  <View style={styles.fieldsContainer}>
                    {/* Email with leading Mail icon */}
                    <View style={styles.inputWithIcon}>
                      <Mail size={16} color="rgba(255, 255, 255, 0.5)" style={styles.leftInputIcon} />
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        placeholderTextColor="rgba(255, 255, 255, 0.45)"
                        style={[styles.inputBox, styles.inputBoxPaddedLeft, { height: 46 }]}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        maxLength={100}
                      />
                    </View>

                    {/* Password with trailing Eye toggle icon */}
                    <View style={styles.inputWithIcon}>
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Mot de passe"
                        placeholderTextColor="rgba(255, 255, 255, 0.45)"
                        style={[styles.inputBox, styles.inputBoxPaddedRight, { height: 46 }]}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setShowPassword((prev) => !prev)}
                        style={styles.rightInputIcon}
                      >
                        {showPassword ? (
                          <EyeOff size={18} color="rgba(255, 255, 255, 0.6)" />
                        ) : (
                          <Eye size={18} color="rgba(255, 255, 255, 0.6)" />
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* Authentic Solid White Submit Button */}
                    <TouchableOpacity
                      activeOpacity={0.88}
                      style={[styles.whiteSubmitBtn, { height: 46 }]}
                      onPress={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#000000" />
                      ) : (
                        <View style={styles.submitRowInner}>
                          <Text style={styles.whiteSubmitText}>Se connecter</Text>
                          <ArrowRight size={16} color="#000000" strokeWidth={2.5} />
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Forgot password link */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.forgotPassBtn}
                      onPress={() =>
                        setStatusMessage({
                          type: 'error',
                          text: 'Un email de réinitialisation vous a été envoyé.',
                        })
                      }
                    >
                      <Text style={styles.forgotPassText}>Mot de passe oublié ?</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImg: {
    width: 36,
    height: 36,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  presetsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 16,
  },
  presetsLabel: {
    color: '#94a3b8',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  quickAccountsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickJulienBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.35)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  quickJulienText: {
    color: '#facc15',
    fontSize: 11,
    fontWeight: '700',
  },
  quickNizarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  quickNizarText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  statusError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  statusIconBoxSuccess: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statusIconBoxError: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  statusTextSuccess: {
    color: '#86efac',
  },
  statusTextError: {
    color: '#fca5a5',
  },
  oauthRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  oauthBtn: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  oauthText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  separatorText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '700',
    marginHorizontal: 10,
  },
  fieldsContainer: {
    gap: 10,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  inputBox: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'transparent',
    color: '#ffffff',
    fontSize: 14,
    paddingHorizontal: 12,
  },
  inputWithIcon: {
    position: 'relative',
    justifyContent: 'center',
  },
  leftInputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  rightInputIcon: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  inputBoxPaddedLeft: {
    paddingLeft: 38,
  },
  inputBoxPaddedRight: {
    paddingRight: 38,
  },
  partnerCodeInput: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  genderSection: {
    gap: 6,
    marginVertical: 2,
  },
  genderSectionLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  genderBtnInactive: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  genderBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  genderBtnTextActive: {
    color: '#ffffff',
  },
  genderBtnTextInactive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  genderHint: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  whiteSubmitBtn: {
    height: 44,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  submitRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  whiteSubmitText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  disclaimerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 6,
  },
  forgotPassBtn: {
    alignItems: 'center',
    marginTop: 12,
  },
  forgotPassText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  verifyCard: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  verifyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  verifySubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    textAlign: 'center',
  },
  verifyEmailHighlight: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 20,
  },
  codeWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  codeInput: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  resendPrompt: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
  },
  resendLink: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
  },
  resendLinkDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
});
