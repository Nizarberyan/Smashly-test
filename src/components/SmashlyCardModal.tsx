import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Info, Download } from 'lucide-react-native';
import { QrCodeView } from './QrCodeView';

interface SmashlyCardModalProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
  userRole?: string;
  userCity?: string;
  userLevel?: string;
}

export const SmashlyCardModal: React.FC<SmashlyCardModalProps> = ({
  visible,
  onClose,
  userName = 'Nizar Beriane',
  userRole = 'Player padel',
  userCity = 'Marseille',
  userLevel = '1',
}) => {
  const [firstName, ...lastNames] = userName.split(' ');
  const lastName = lastNames.join(' ');

  const handleDownload = () => {
    Alert.alert(
      'Carte Smashly',
      'Votre carte Smashly a été téléchargée avec succès dans votre galerie !'
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Image
                source={require('../../images/pwa-icon-192.png')}
                style={styles.headerIcon}
                resizeMode="contain"
              />
              <Text style={styles.headerTitle}>My Smashly Card</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.closeBtn}
              onPress={onClose}
            >
              <X size={17} color="#64748b" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* The Blue Card */}
          <LinearGradient
            colors={['#1d4ed8', '#2563eb', '#1e40af']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardContainer}
          >
            {/* Left side info */}
            <View style={styles.cardLeft}>
              <View style={styles.mascotAndName}>
                <Image
                  source={require('../../images/mascotte-assistant-tight.png')}
                  style={styles.mascotImg}
                  resizeMode="contain"
                />
                <View style={styles.nameCol}>
                  <Text style={styles.cardName}>{firstName}</Text>
                  <Text style={styles.cardName}>{lastName}</Text>
                  <Text style={styles.cardSub}>
                    {userRole} - {userCity}
                  </Text>
                </View>
              </View>

              {/* Level row */}
              <View style={styles.levelRow}>
                <Text style={styles.levelLabel}>LEVEL</Text>
                <View style={styles.bronzeBadge}>
                  <Text style={styles.bronzeText}>Bronze</Text>
                </View>
                <Text style={styles.levelNum}>{userLevel}</Text>
              </View>
            </View>

            {/* Right side QR code */}
            <View style={styles.cardRight}>
              <View style={styles.qrBox}>
                <QrCodeView size={84} color="#67e8f9" />
                <Text style={styles.scanMeText}>SCAN ME</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Info yellow notice */}
          <View style={styles.noticeBox}>
            <Info size={19} color="#eab308" strokeWidth={2.4} style={styles.noticeIcon} />
            <Text style={styles.noticeText}>
              Anyone who scans the QR code lands directly on your Smashly profile.
            </Text>
          </View>

          {/* Download button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.downloadBtn}
            onPress={handleDownload}
          >
            <Download size={19} color="#ffffff" strokeWidth={2.5} style={{ marginRight: 8 }} />
            <Text style={styles.downloadBtnText}>Download</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  cardLeft: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mascotAndName: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mascotImg: {
    width: 48,
    height: 52,
    marginRight: 8,
  },
  nameCol: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 20,
  },
  cardSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 3,
    fontWeight: '500',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  levelLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.6,
  },
  bronzeBadge: {
    backgroundColor: '#b45309',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 8,
  },
  bronzeText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '700',
  },
  levelNum: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 6,
  },
  cardRight: {
    marginLeft: 12,
  },
  qrBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  scanMeText: {
    color: '#ffffff',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  noticeBox: {
    backgroundColor: '#fefce8',
    borderColor: '#fef08a',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  noticeIcon: {
    marginRight: 10,
    alignSelf: 'center',
  },
  noticeText: {
    flex: 1,
    color: '#854d0e',
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
  },
  downloadBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadBtnText: {
    color: '#ffffff',
    fontSize: 15.5,
    fontWeight: '700',
  },
});
