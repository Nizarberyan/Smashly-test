import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Send,
  Sparkles,
  Users2,
  GraduationCap,
  Lightbulb,
  MapPin,
  Target,
  UserPlus,
  RefreshCw,
  MessageSquare,
} from 'lucide-react-native';
import { apiSendChatMessage, SmashlyChatResponse } from '../api/smashlyClient';
import { useMatches } from '../context/MatchesContext';
import { colors } from '../theme/colors';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  profileCard?: {
    user_id: string;
    first_name: string;
    last_name?: string;
    level: number;
    city: string;
    clubs?: string[];
    position?: string;
    photo_url?: string | null;
  } | null;
  quickReplies?: string[];
  type?: string;
}

interface SmashlyAIChatModalProps {
  visible: boolean;
  onClose: () => void;
  initialMode?: 'matching' | 'assistant' | 'coach';
  initialPrompt?: string;
}

const QUICK_SUGGESTIONS = [
  'Trouve des joueurs niveau 5 à Marseille',
  'Comment bien défendre sur les vitres ?',
  'Quels exercices pour progresser en bandeja ?',
  'Je cherche des partenaires pour ce week-end',
];

// Parse raw assistant response to extract clean text and [[suggestion]] chips
function parseAssistantContent(rawText: string): { cleanText: string; suggestions: string[] } {
  if (!rawText) return { cleanText: '', suggestions: [] };

  let cleanText = rawText;
  const suggestions: string[] = [];

  const suggestionsMatch = rawText.match(/<suggestions>([\s\S]*?)<\/suggestions>/);
  if (suggestionsMatch) {
    cleanText = rawText.replace(/<suggestions>[\s\S]*?<\/suggestions>/, '').trim();
    const inner = suggestionsMatch[1];
    const items = inner.match(/\[\[(.*?)\]\]/g);
    if (items) {
      items.forEach((item) => {
        const text = item.replace(/^\[\[/, '').replace(/\]\]$/, '').trim();
        if (text) suggestions.push(text);
      });
    }
  }

  return { cleanText, suggestions };
}

function cleanBoldMarkers(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} style={{ fontWeight: '800', color: '#f8fafc' }}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return part;
  });
}

export const SmashlyAIChatModal: React.FC<SmashlyAIChatModalProps> = ({
  visible,
  onClose,
  initialMode = 'matching',
  initialPrompt = '',
}) => {
  const insets = useSafeAreaInsets();
  const { currentUser, authToken } = useMatches();

  const [chatMode, setChatMode] = useState<'matching' | 'assistant' | 'coach'>(initialMode);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const scrollViewRef = useRef<any>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      role: 'assistant',
      content: `Salut ${
        currentUser.first_name || 'champion'
      } ! 🎾 Je suis l'IA Smashly. Dis-moi ce que tu recherches : un partenaire de jeu, des conseils techniques, ou un club près de chez toi ?`,
      timestamp: new Date(),
      quickReplies: QUICK_SUGGESTIONS,
    },
  ]);

  // Handle initial prompt if passed
  useEffect(() => {
    if (visible && initialPrompt && initialPrompt.trim() !== '') {
      handleSendMessage(initialPrompt.trim());
    }
  }, [visible, initialPrompt]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    scrollToBottom();

    try {
      const response: SmashlyChatResponse = await apiSendChatMessage({
        message: text,
        token: authToken || undefined,
        userId: currentUser.user_id,
        userProfile: {
          firstName: currentUser.first_name,
          lastName: currentUser.last_name,
          level: currentUser.level,
          city: currentUser.city,
          position: currentUser.position || '',
          bio: currentUser.bio || 'Padel enthusiast for 2 years, looking for partners to improve together!',
          clubs: currentUser.favouriteClubs ? [currentUser.favouriteClubs] : [],
          availability: [],
        },
        chatMode,
        conversationId,
        network_only: false,
        current_profile: null,
        rejected_profile_ids: [],
      });

      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      const { cleanText, suggestions } = parseAssistantContent(response.response || '');

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: cleanText,
        timestamp: new Date(),
        profileCard: response.recommended_profile || null,
        quickReplies: suggestions.length > 0 ? suggestions : undefined,
        type: response.recommended_type,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content:
          err?.message ||
          "Désolé, une petite erreur réseau est survenue. Vérifiez votre connexion à Smashly AI.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleResetChat = () => {
    setConversationId(null);
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content: `Conversation réinitialisée ! Comment puis-je t'aider aujourd'hui ?`,
        timestamp: new Date(),
        quickReplies: QUICK_SUGGESTIONS,
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Image
              source={require('../../images/mascotte-assistant-tight.png')}
              style={styles.headerAvatar}
            />
            <View>
              <View style={styles.headerNameRow}>
                <Text style={styles.headerTitle}>Smashly AI</Text>
                <View style={styles.onlineBadge}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>En ligne</Text>
                </View>
              </View>
              <Text style={styles.headerSub}>Moteur RAG & Matchmaking Padel</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity activeOpacity={0.7} style={styles.headerBtn} onPress={handleResetChat}>
              <RefreshCw size={17} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} style={styles.headerBtn} onPress={onClose}>
              <X size={20} color="#f8fafc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode Selector Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, chatMode === 'matching' && styles.tabBtnActiveMatching]}
            onPress={() => setChatMode('matching')}
          >
            <Users2 size={14} color={chatMode === 'matching' ? '#ffffff' : '#94a3b8'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, chatMode === 'matching' && styles.tabTextActive]}>
              Partenaires
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, chatMode === 'assistant' && styles.tabBtnActiveAssistant]}
            onPress={() => setChatMode('assistant')}
          >
            <Lightbulb size={14} color={chatMode === 'assistant' ? '#0f172a' : '#94a3b8'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, chatMode === 'assistant' && styles.tabTextActiveAssistant]}>
              Conseils Padel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, chatMode === 'coach' && styles.tabBtnActiveCoach]}
            onPress={() => setChatMode('coach')}
          >
            <GraduationCap size={14} color={chatMode === 'coach' ? '#ffffff' : '#94a3b8'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, chatMode === 'coach' && styles.tabTextActive]}>
              Coachs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          contentContainerStyle={[styles.messagesContent, { paddingBottom: 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.role === 'user' ? styles.messageRowUser : styles.messageRowBot,
              ]}
            >
              {msg.role === 'assistant' && (
                <Image
                  source={require('../../images/mascotte-assistant-tight.png')}
                  style={styles.messageBotAvatar}
                />
              )}

              <View style={{ maxWidth: '82%' }}>
                <View
                  style={[
                    styles.messageBubble,
                    msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot,
                  ]}
                >
                  {msg.role === 'user' ? (
                    <Text style={[styles.messageText, styles.textUser]}>{msg.content}</Text>
                  ) : (
                    <View style={{ gap: 4 }}>
                      {msg.content.split('\n').map((line, idx) => {
                        const trimmed = line.trim();
                        if (!trimmed) {
                          return <View key={idx} style={{ height: 4 }} />;
                        }
                        if (trimmed.startsWith('### ')) {
                          return (
                            <Text key={idx} style={styles.markdownH3}>
                              {trimmed.replace(/^###\s+/, '')}
                            </Text>
                          );
                        }
                        if (trimmed.startsWith('## ')) {
                          return (
                            <Text key={idx} style={styles.markdownH2}>
                              {trimmed.replace(/^##\s+/, '')}
                            </Text>
                          );
                        }
                        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                          const bulletContent = trimmed.replace(/^(\*|-)\s+/, '');
                          return (
                            <View key={idx} style={styles.bulletRow}>
                              <Text style={styles.bulletDot}>•</Text>
                              <Text style={[styles.messageText, styles.textBot, { flex: 1 }]}>
                                {cleanBoldMarkers(bulletContent)}
                              </Text>
                            </View>
                          );
                        }
                        return (
                          <Text key={idx} style={[styles.messageText, styles.textBot]}>
                            {cleanBoldMarkers(line)}
                          </Text>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* Profile Recommendation Card (if AI suggested a player) */}
                {msg.profileCard && (
                  <View style={styles.recommendedCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.avatarInitialsBox}>
                        <Text style={styles.avatarInitialsText}>
                          {(msg.profileCard.first_name[0] || '?') +
                            (msg.profileCard.last_name?.[0] || '')}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.cardName}>
                          {msg.profileCard.first_name} {msg.profileCard.last_name || ''}
                        </Text>
                        <View style={styles.cardTagRow}>
                          <View style={styles.levelBadge}>
                            <Text style={styles.levelBadgeText}>
                              Niveau {msg.profileCard.level}
                            </Text>
                          </View>
                          <Text style={styles.cardCity}>📍 {msg.profileCard.city}</Text>
                        </View>
                      </View>
                    </View>

                    {msg.profileCard.position && (
                      <Text style={styles.cardDetailText}>
                        Position : {msg.profileCard.position}
                      </Text>
                    )}

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.cardActionBtn}
                      onPress={() =>
                        Alert.alert(
                          'Demande de contact',
                          `Souhaitez-vous envoyer une invitation à jouer à ${msg.profileCard?.first_name} ?`,
                          [
                            { text: 'Annuler', style: 'cancel' },
                            {
                              text: 'Inviter',
                              onPress: () =>
                                Alert.alert(
                                  'Succès',
                                  `Invitation envoyée à ${msg.profileCard?.first_name} !`
                                ),
                            },
                          ]
                        )
                      }
                    >
                      <UserPlus size={14} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={styles.cardActionText}>Inviter à jouer</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Token Limit Reached Upgrade Action */}
                {msg.type === 'token_limit_reached' && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.proUpgradeBanner}
                    onPress={() =>
                      Alert.alert(
                        'Smashly PRO',
                        'Passez à Smashly PRO sur smashlyai.com pour poser des questions en illimité et trouver des partenaires sans restriction !'
                      )
                    }
                  >
                    <Sparkles size={15} color="#0f172a" style={{ marginRight: 6 }} />
                    <Text style={styles.proUpgradeBannerText}>Débloquer les requêtes illimitées (PRO)</Text>
                  </TouchableOpacity>
                )}

                {/* Quick replies */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <View style={styles.quickRepliesContainer}>
                    {msg.quickReplies.map((q, idx) => (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.8}
                        style={styles.quickChip}
                        onPress={() => handleSendMessage(q)}
                      >
                        <Text style={styles.quickChipText}>{q}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}

          {loading && (
            <View style={[styles.messageRow, styles.messageRowBot]}>
              <Image
                source={require('../../images/mascotte-assistant-tight.png')}
                style={styles.messageBotAvatar}
              />
              <View style={[styles.messageBubble, styles.bubbleBot, styles.loadingBubble]}>
                <ActivityIndicator size="small" color="#38bdf8" />
                <Text style={styles.loadingText}>Smashly réfléchit...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <View style={[styles.inputBarWrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View style={styles.inputInner}>
              <TextInput
                style={styles.textInput}
                placeholder={
                  chatMode === 'matching'
                    ? 'Rechercher des partenaires à Marseille...'
                    : 'Pose ta question tactique ou technique...'
                }
                placeholderTextColor="#64748b"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => handleSendMessage()}
                returnKeyType="send"
                multiline={false}
              />

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.sendBtn,
                  inputText.trim() !== '' ? styles.sendBtnActive : styles.sendBtnDisabled,
                ]}
                onPress={() => handleSendMessage()}
                disabled={inputText.trim() === '' || loading}
              >
                <Send
                  size={17}
                  color={inputText.trim() !== '' ? '#ffffff' : '#64748b'}
                  strokeWidth={2.4}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    marginRight: 10,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  onlineText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#1e293b',
  },
  tabBtnActiveMatching: {
    backgroundColor: '#2563eb',
  },
  tabBtnActiveAssistant: {
    backgroundColor: '#facc15',
  },
  tabBtnActiveCoach: {
    backgroundColor: '#f97316',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  tabTextActiveAssistant: {
    color: '#0f172a',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowBot: {
    justifyContent: 'flex-start',
  },
  messageBotAvatar: {
    width: 30,
    height: 30,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 21,
  },
  textUser: {
    color: '#ffffff',
  },
  textBot: {
    color: '#f1f5f9',
  },
  markdownH2: {
    fontSize: 15,
    fontWeight: '800',
    color: '#38bdf8',
    marginTop: 6,
    marginBottom: 2,
  },
  markdownH3: {
    fontSize: 14,
    fontWeight: '700',
    color: '#facc15',
    marginTop: 5,
    marginBottom: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 2,
  },
  bulletDot: {
    color: '#38bdf8',
    fontSize: 15,
    marginRight: 6,
    lineHeight: 20,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 13,
    fontStyle: 'italic',
  },
  recommendedCard: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarInitialsBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  cardName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  cardTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  levelBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  levelBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  cardCity: {
    color: '#94a3b8',
    fontSize: 11,
  },
  cardDetailText: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 6,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 7,
    marginTop: 10,
  },
  cardActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  proUpgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#facc15',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  proUpgradeBannerText: {
    color: '#0f172a',
    fontSize: 12.5,
    fontWeight: '800',
  },
  quickRepliesContainer: {
    marginTop: 10,
    gap: 6,
  },
  quickChip: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  quickChipText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '500',
  },
  inputBarWrapper: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14.5,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  sendBtnActive: {
    backgroundColor: '#2563eb',
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
  },
});
