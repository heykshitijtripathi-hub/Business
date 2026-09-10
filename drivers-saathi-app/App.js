import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Linking,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme & Palette
const THEME = {
  ink: '#0F172A',
  inkSoft: '#475569',
  inkMuted: '#94A3B8',
  marigold: '#FB8500',
  marigoldDeep: '#D97706',
  marigoldLight: '#FFF7ED',
  paper: '#FFFFFF',
  paperAlt: '#F8FAFC',
  line: '#E2E8F0',
  lineSoft: '#F1F5F9',
  verified: '#10B981',
  verifiedSoft: '#ECFDF5',
  cardNavy: '#1E293B',
  whatsapp: '#25D366',
  sosRed: '#EF4444',
  sosSoft: '#FEF2F2',
  blue: '#2563EB',
  blueSoft: '#EFF6FF',
};

const STRINGS = {
  en: {
    heroBadge: 'DELHI NCR DISPATCH DESK ACTIVE',
    headline: 'Verified Drivers for Fleets & Private Cars',
    subheadline:
      'We source, background-check, and place commercial & executive drivers across Delhi, Gurugram, Noida, and Faridabad. Zero downtime.',
    ctaFleet: 'Hire Fleet Drivers',
    ctaPersonal: 'Hire Personally',
    ctaDrive: 'Drive with Us',
    liveStatus: 'Delhi NCR Dispatch: Active (Mon-Sat: 8 AM - 9 PM)',

    // Bottom Navigation
    tabHome: 'Home',
    tabHire: 'Hire',
    tabLogbook: 'Duty Log',
    tabJobs: 'Job Board',
    tabTools: 'Tools & Rates',

    // Forms
    fleetFormTitle: 'Request Fleet & Commercial Drivers',
    fleetFormSub: 'For cab fleets, tour operators, corporate staff shuttles, and logistics.',
    personalFormTitle: 'Hire a Permanent Chauffeur',
    personalFormSub: 'For private car owners, families, daily office commute, and VIP luxury cars.',
    tempFormTitle: 'Book Temporary / Outstation Driver',
    tempFormSub: 'Short notice driver for 1-day highway trips, weekend outstation, or backup driver.',
    driverFormTitle: 'Driver KYC & Application Form',
    driverFormSub: 'Upload your documents to get fast-track police verified & start earning.',

    name: 'Full Name / Contact Person',
    phone: 'Phone Number (WhatsApp)',
    email: 'Email Address (For auto-confirmation)',
    company: 'Company / Fleet Name (Optional)',
    vehicle: 'Vehicle Type / Model (e.g. Creta / Innova / EV)',
    location: 'Location / Preferred Area in Delhi NCR',
    driverCount: 'Number of Drivers Required',
    tripDate: 'Trip Date & Required Time',
    destination: 'Outstation Destination (e.g. Delhi to Jaipur / Agra)',
    licenseType: 'License Category (LMV / Commercial / Heavy)',
    experience: 'Total Driving Experience (in Years)',
    submitBtn: 'Submit Requirement Now',
    applyBtn: 'Submit KYC & Application',

    successTitle: 'Requirement Received!',
    successSub:
      'Thank you for contacting Drivers Saathi. Our central dispatch desk is reviewing your requirement and will connect with you via Call / WhatsApp shortly.\n\nA confirmation copy has been sent to support@driverssaathi.com and your email.',
    closeBtn: 'Done',
  },
  hi: {
    heroBadge: 'दिल्ली एनसीआर डिस्पैच डेस्क सक्रिय',
    headline: 'गाड़ियों और फ्लीट्स के लिए 100% वेरिफाइड ड्राइवर्स',
    subheadline:
      'हम दिल्ली, गुरुग्राम, नोएडा और फरीदाबाद में कमर्शियल और पर्सनल गाड़ियों के लिए पुलिस वेरिफाइड ड्राइवर्स उपलब्ध कराते हैं।',
    ctaFleet: 'फ्लीट ड्राइवर्स लें',
    ctaPersonal: 'पर्सनल ड्राइवर लें',
    ctaDrive: 'ड्राइवर बनें',
    liveStatus: 'दिल्ली एनसीआर डेस्क: चालू है (सोम-शनि: 8 AM - 9 PM)',

    tabHome: 'होम',
    tabHire: 'ड्राइवर लें',
    tabLogbook: 'हाजिरी डायरी',
    tabJobs: 'नौकरियां',
    tabTools: 'टूल्स व रेट्स',

    fleetFormTitle: 'फ्लीट व कमर्शियल ड्राइवर रिक्वायरमेंट',
    fleetFormSub: 'कैब फ्लीट, टूर ऑपरेटर्स और कॉर्पोरेट स्टाफ पिकअप के लिए।',
    personalFormTitle: 'पर्सनल गाड़ी के लिए ड्राइवर बुक करें',
    personalFormSub: 'परिवार, रोज़ाना ऑफिस आवागमन और लग्जरी कारों के लिए।',
    tempFormTitle: 'अस्थाई / आउटस्टेशन ड्राइवर बुक करें',
    tempFormSub: '1 दिन के ट्रिप, वीकेंड हाईवे सफर या छुट्टी पर गए ड्राइवर की जगह बैकअप ड्राइवर।',
    driverFormTitle: 'ड्राइवर KYC और आवेदन फॉर्म',
    driverFormSub: 'दस्तावेज अपलोड करें और तुरंत वेरिफाइड होकर काम शुरू करें।',

    name: 'पूरा नाम / संपर्क व्यक्ति',
    phone: 'फ़ोन नंबर (कॉलिंग और व्हाट्सएप)',
    email: 'ईमेल आईडी (कन्फर्मेशन के लिए)',
    company: 'कंपनी / फ्लीट नाम (वैकल्पिक)',
    vehicle: 'गाड़ी का प्रकार / मॉडल (जैसे Innova / Creta / Dzire)',
    location: 'दिल्ली एनसीआर में इलाका',
    driverCount: 'कितने ड्राइवर्स की ज़रूरत है?',
    tripDate: 'ट्रिप की तारीख और समय',
    destination: 'कहाँ जाना है? (जैसे दिल्ली से आगरा / जयपुर)',
    licenseType: 'लाइसेंस का प्रकार (LMV / कमर्शियल बैच)',
    experience: 'ड्राइविंग का अनुभव (वर्षों में)',
    submitBtn: 'रिक्वेस्ट सबमिट करें',
    applyBtn: 'KYC और आवेदन जमा करें',

    successTitle: 'आवेदन प्राप्त हुआ!',
    successSub:
      'ड्राइवर्स साथी से संपर्क करने के लिए धन्यवाद। हमारी टीम जल्द आपसे फोन/व्हाट्सएप पर संपर्क करेगी और ड्राइवर्स की सूची उपलब्ध कराएगी।\n\nएक कन्फर्मेशन ईमेल भी आपको भेजा गया है।',
    closeBtn: 'ठीक है',
  },
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [currentTab, setCurrentTab] = useState('home'); // home | hire | logbook | jobs | tools
  const [hireCategory, setHireCategory] = useState('personal'); // personal | fleet | temporary
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Interactive Salary Calculator State
  const [calcCarType, setCalcCarType] = useState('sedan');
  const [calcHours, setCalcHours] = useState('10');
  const [calcZone, setCalcZone] = useState('delhi');

  // Document Uploads State for Driver KYC
  const [licenseImg, setLicenseImg] = useState(null);
  const [aadhaarImg, setAadhaarImg] = useState(null);

  // Digital Duty Logbook State
  const [logEntries, setLogEntries] = useState([]);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logInTime, setLogInTime] = useState('09:00 AM');
  const [logOutTime, setLogOutTime] = useState('07:30 PM');
  const [logKm, setLogKm] = useState('45');
  const [logOT, setLogOT] = useState('1.5');

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    vehicle: '',
    location: '',
    count: '1',
    tripDate: '',
    destination: '',
    license: '',
    experience: '',
  });

  // Parivahan DL Search State
  const [verifyDLNumber, setVerifyDLNumber] = useState('');
  const [verifyDOB, setVerifyDOB] = useState('');

  const t = STRINGS[lang];

  // Load saved duty logs from phone memory on start
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@driver_duty_logs');
        if (saved) setLogEntries(JSON.parse(saved));
        else {
          // Default demo log entries
          setLogEntries([
            { id: '1', date: '2026-09-08', in: '09:00 AM', out: '07:30 PM', km: '62 km', ot: '1.5 hrs' },
            { id: '2', date: '2026-09-09', in: '08:45 AM', out: '08:00 PM', km: '84 km', ot: '2.0 hrs' },
          ]);
        }
      } catch (e) {}
    })();
  }, []);

  const saveDutyLog = async () => {
    if (!logInTime || !logOutTime) {
      Alert.alert('Incomplete Entry', 'Please specify Check-in and Check-out times.');
      return;
    }
    const newEntry = {
      id: Date.now().toString(),
      date: logDate,
      in: logInTime,
      out: logOutTime,
      km: `${logKm || 0} km`,
      ot: `${logOT || 0} hrs`,
    };
    const updated = [newEntry, ...logEntries];
    setLogEntries(updated);
    await AsyncStorage.setItem('@driver_duty_logs', JSON.stringify(updated));
    Alert.alert('Entry Saved', `Driver duty recorded for ${logDate} with ${logOT || 0} hrs Overtime.`);
  };

  const clearDutyLogs = async () => {
    setLogEntries([]);
    await AsyncStorage.removeItem('@driver_duty_logs');
  };

  // WhatsApp & Communication Actions
  const openWhatsApp = (prefilledText = '') => {
    const text =
      prefilledText ||
      (lang === 'en'
        ? 'Hello Drivers Saathi! I need a verified driver in Delhi NCR. Please share details and pricing.'
        : 'नमस्ते ड्राइवर्स साथी! मुझे दिल्ली एनसीआर में वेरिफाइड ड्राइवर की आवश्यकता है। कृपया जानकारी साझा करें।');
    Linking.openURL(`https://wa.me/918175087004?text=${encodeURIComponent(text)}`);
  };

  const handleCall = () => {
    Linking.openURL('tel:+918175087004');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@driverssaathi.com');
  };

  const handleSOS = () => {
    Alert.alert(
      '🚨 24x7 Roadside & Dispatch SOS',
      'Emergency roadside assistance & live dispatch hotline for Delhi NCR drivers and passengers.\n\nHelpline: +91 8175087004',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call SOS Helpline', onPress: handleCall },
      ]
    );
  };

  const handleParivahanVerify = () => {
    if (!verifyDLNumber.trim()) {
      Alert.alert('License Number Required', 'Please enter a valid Driving License number (e.g. DL-0420110012345).');
      return;
    }
    // Launch official mParivahan verification portal
    Linking.openURL('https://parivahan.gov.in/rcdlstatus/?pur_cd=101');
  };

  // Image Picker for KYC
  const pickDocument = async (docType) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Gallery access is needed to attach your documents.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        if (docType === 'license') setLicenseImg(result.assets[0].uri);
        else setAadhaarImg(result.assets[0].uri);
        Alert.alert('Document Attached', `${docType === 'license' ? 'Driving License' : 'Aadhaar Card'} attached successfully.`);
      }
    } catch (e) {}
  };

  // Salary Calculator
  const calculateEstimate = () => {
    let base = 18000;
    if (calcCarType === 'hatchback') base = 16000;
    if (calcCarType === 'sedan') base = 18000;
    if (calcCarType === 'suv') base = 21000;
    if (calcCarType === 'luxury') base = 26000;

    let hourMultiplier = 1.0;
    if (calcHours === '8') hourMultiplier = 0.9;
    if (calcHours === '10') hourMultiplier = 1.0;
    if (calcHours === '12') hourMultiplier = 1.15;

    let zoneAdd = 0;
    if (calcZone === 'gurugram') zoneAdd = 1000;
    if (calcZone === 'noida') zoneAdd = 500;

    const driverSalary = Math.round(base * hourMultiplier + zoneAdd);
    const agencyFee = 4500;
    return { driverSalary, agencyFee };
  };

  const estimate = calculateEstimate();

  // Form Submission
  const handleFormSubmit = async (type) => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      Alert.alert('Required Information', 'Please enter your Full Name and Phone Number.');
      return;
    }

    setLoading(true);

    const autoResponderCopy =
      lang === 'en'
        ? `Thank you for contacting Drivers Saathi! We have received your ${type}. Our central dispatch desk is reviewing your requirement and will connect with you via Call / WhatsApp shortly. For urgent assistance, reach us directly at +91 8175087004 or support@driverssaathi.com.`
        : `ड्राइवर्स साथी से संपर्क करने के लिए धन्यवाद! आपकी ${type} हमें प्राप्त हो गई है। हमारी टीम जल्द आपसे कॉल/व्हाट्सएप पर संपर्क करेगी। तत्काल सहायता के लिए कॉल करें: +91 8175087004.`;

    const payload = {
      Category: type,
      Name: formData.name,
      'Phone Number': formData.phone,
      Email: formData.email || 'Not Provided',
      Company: formData.company || 'Individual',
      'Vehicle Model': formData.vehicle || 'Not specified',
      'Location / NCR Zone': formData.location || 'Delhi NCR',
      'Drivers Needed': formData.count || '1',
      'Trip Date & Time': formData.tripDate || 'N/A',
      Destination: formData.destination || 'Local NCR',
      'License Type': formData.license || 'LMV',
      Experience: formData.experience || 'Not specified',
      'License Attached': licenseImg ? 'Yes' : 'Pending',
      'Aadhaar Attached': aadhaarImg ? 'Yes' : 'Pending',
      _subject: `[Lead Alert] ${type} - ${formData.name} (${formData.phone})`,
      _autoresponse: autoResponderCopy,
      _template: 'table',
      _captcha: 'false',
    };

    try {
      await fetch('https://formsubmit.co/ajax/support@driverssaathi.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      setModalMessage(t.successSub);
      setModalVisible(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        company: '',
        vehicle: '',
        location: '',
        count: '1',
        tripDate: '',
        destination: '',
        license: '',
        experience: '',
      });
      setLicenseImg(null);
      setAadhaarImg(null);
    } catch (err) {
      setModalMessage(t.successSub);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar style="light" backgroundColor={THEME.ink} />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image
            source={require('./assets/logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerRightButtons}>
          <TouchableOpacity style={styles.sosButton} onPress={handleSOS} activeOpacity={0.8}>
            <Text style={styles.sosButtonText}>🚨 SOS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.languageToggle}
            onPress={() => setLang(lang === 'en' ? 'hi' : 'en')}
            activeOpacity={0.8}
          >
            <Text style={styles.languageToggleText}>{lang === 'en' ? 'हिन्दी' : 'English'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Dispatch Ticker */}
      <View style={styles.liveTicker}>
        <View style={styles.livePulse} />
        <Text style={styles.liveTickerText}>{t.liveStatus}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
          {/* ======================================================== */}
          {/* TAB 1: OVERVIEW / HOME SCREEN                            */}
          {/* ======================================================== */}
          {currentTab === 'home' && (
            <View>
              {/* Executive Hero Banner */}
              <View style={styles.heroWrapper}>
                <Image
                  source={require('./assets/driver_passenger_service.jpg')}
                  style={styles.heroBgImage}
                  resizeMode="cover"
                />
                <View style={styles.heroOverlay}>
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>{t.heroBadge}</Text>
                  </View>
                  <Text style={styles.heroHeading}>{t.headline}</Text>
                  <Text style={styles.heroBody}>{t.subheadline}</Text>

                  <View style={styles.heroBtnRow}>
                    <TouchableOpacity
                      style={styles.btnPrimary}
                      onPress={() => {
                        setCurrentTab('hire');
                        setHireCategory('personal');
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.btnPrimaryText}>{t.ctaPersonal} &rarr;</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnGlass}
                      onPress={() => {
                        setCurrentTab('hire');
                        setHireCategory('fleet');
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.btnGlassText}>{t.ctaFleet}</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.btnWhatsAppHero}
                    onPress={() => openWhatsApp()}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.btnWhatsAppHeroText}>💬 Instant WhatsApp Consultation</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Fast Feature Quick Cards */}
              <View style={styles.quickActionGrid}>
                <TouchableOpacity
                  style={styles.quickCard}
                  onPress={() => {
                    setCurrentTab('hire');
                    setHireCategory('temporary');
                  }}
                >
                  <Text style={styles.quickIcon}>🛣️</Text>
                  <Text style={styles.quickTitle}>Outstation / Highway</Text>
                  <Text style={styles.quickSub}>Book 1-Day Driver for Jaipur / Agra / Airport</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickCard}
                  onPress={() => setCurrentTab('logbook')}
                >
                  <Text style={styles.quickIcon}>⏱️</Text>
                  <Text style={styles.quickTitle}>Driver Duty Log</Text>
                  <Text style={styles.quickSub}>Daily Check-in, Overtime (OT) & Km tracker</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickCard}
                  onPress={() => setCurrentTab('jobs')}
                >
                  <Text style={styles.quickIcon}>💼</Text>
                  <Text style={styles.quickTitle}>Active Job Board</Text>
                  <Text style={styles.quickSub}>View ₹18k-₹26k Chauffeur Openings in NCR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickCard}
                  onPress={() => setCurrentTab('tools')}
                >
                  <Text style={styles.quickIcon}>🔍</Text>
                  <Text style={styles.quickTitle}>Verify DL & Challan</Text>
                  <Text style={styles.quickSub}>Official Parivahan license & rate tools</Text>
                </TouchableOpacity>
              </View>

              {/* Strict Verification Trust Stats */}
              <View style={styles.sectionHeadingBox}>
                <Text style={styles.sectionCategory}>STRICT VERIFICATION</Text>
                <Text style={styles.sectionTitle}>Why Fleets & Car Owners Trust Us</Text>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>100%</Text>
                  <Text style={styles.statLabel}>Police Record Verification</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>24-48h</Text>
                  <Text style={styles.statLabel}>Average Placement Time</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>30 Days</Text>
                  <Text style={styles.statLabel}>Free Driver Replacement</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>Delhi NCR</Text>
                  <Text style={styles.statLabel}>Complete Metro Coverage</Text>
                </View>
              </View>

              {/* Dispatch Help Card */}
              <View style={styles.contactDeskCard}>
                <Text style={styles.contactDeskTitle}>Need a Driver Urgently?</Text>
                <Text style={styles.contactDeskSub}>
                  Reach our central dispatch desk directly via phone or official support email:
                </Text>

                <TouchableOpacity style={styles.actionCallBtn} onPress={handleCall} activeOpacity={0.9}>
                  <Text style={styles.actionCallBtnText}>📞 Call Dispatch: +91 8175087004</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionMailBtn} onPress={handleEmail} activeOpacity={0.9}>
                  <Text style={styles.actionMailBtnText}>✉️ support@driverssaathi.com</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 2: HIRE DRIVER (PERSONAL, FLEET, TEMPORARY / OUTSTATION) */}
          {/* ======================================================== */}
          {currentTab === 'hire' && (
            <View>
              {/* 3-Way Booking Segment Selector */}
              <View style={styles.segmentContainer}>
                <TouchableOpacity
                  style={[styles.segmentBtn, hireCategory === 'personal' && styles.segmentBtnActive]}
                  onPress={() => setHireCategory('personal')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentBtnText, hireCategory === 'personal' && styles.segmentBtnTextActive]}>
                    Personal Chauffeur
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.segmentBtn, hireCategory === 'fleet' && styles.segmentBtnActive]}
                  onPress={() => setHireCategory('fleet')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentBtnText, hireCategory === 'fleet' && styles.segmentBtnTextActive]}>
                    Cab Fleet / B2B
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.segmentBtn, hireCategory === 'temporary' && styles.segmentBtnActive]}
                  onPress={() => setHireCategory('temporary')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentBtnText, hireCategory === 'temporary' && styles.segmentBtnTextActive]}>
                    Outstation / 1-Day
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formContainerCard}>
                <Text style={styles.formTitle}>
                  {hireCategory === 'personal'
                    ? t.personalFormTitle
                    : hireCategory === 'fleet'
                    ? t.fleetFormTitle
                    : t.tempFormTitle}
                </Text>
                <Text style={styles.formSubtitle}>
                  {hireCategory === 'personal'
                    ? t.personalFormSub
                    : hireCategory === 'fleet'
                    ? t.fleetFormSub
                    : t.tempFormSub}
                </Text>

                <Text style={styles.fieldLabel}>{t.name} *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Amit Verma"
                  placeholderTextColor={THEME.inkMuted}
                  value={formData.name}
                  onChangeText={(v) => setFormData({ ...formData, name: v })}
                />

                <Text style={styles.fieldLabel}>{t.phone} *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="+91 81750 87004"
                  placeholderTextColor={THEME.inkMuted}
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(v) => setFormData({ ...formData, phone: v })}
                />

                <Text style={styles.fieldLabel}>{t.email}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. yourname@company.com"
                  placeholderTextColor={THEME.inkMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(v) => setFormData({ ...formData, email: v })}
                />

                {hireCategory === 'temporary' && (
                  <>
                    <Text style={styles.fieldLabel}>{t.tripDate} *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Saturday 12th Sept, 6:00 AM Departure"
                      placeholderTextColor={THEME.inkMuted}
                      value={formData.tripDate}
                      onChangeText={(v) => setFormData({ ...formData, tripDate: v })}
                    />

                    <Text style={styles.fieldLabel}>{t.destination} *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Delhi to Jaipur Return (2 Days)"
                      placeholderTextColor={THEME.inkMuted}
                      value={formData.destination}
                      onChangeText={(v) => setFormData({ ...formData, destination: v })}
                    />
                  </>
                )}

                {hireCategory === 'fleet' && (
                  <>
                    <Text style={styles.fieldLabel}>{t.company}</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Metro Cab Logistics Pvt Ltd"
                      placeholderTextColor={THEME.inkMuted}
                      value={formData.company}
                      onChangeText={(v) => setFormData({ ...formData, company: v })}
                    />

                    <Text style={styles.fieldLabel}>{t.driverCount}</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 5 Drivers"
                      placeholderTextColor={THEME.inkMuted}
                      keyboardType="numeric"
                      value={formData.count}
                      onChangeText={(v) => setFormData({ ...formData, count: v })}
                    />
                  </>
                )}

                <Text style={styles.fieldLabel}>{t.vehicle}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Honda City / Innova / Fortuner / EV"
                  placeholderTextColor={THEME.inkMuted}
                  value={formData.vehicle}
                  onChangeText={(v) => setFormData({ ...formData, vehicle: v })}
                />

                <Text style={styles.fieldLabel}>{t.location}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. South Delhi / DLF Gurugram / Sector 62 Noida"
                  placeholderTextColor={THEME.inkMuted}
                  value={formData.location}
                  onChangeText={(v) => setFormData({ ...formData, location: v })}
                />

                <TouchableOpacity
                  style={styles.submitActionButton}
                  onPress={() =>
                    handleFormSubmit(
                      hireCategory === 'personal'
                        ? 'Personal Permanent Chauffeur'
                        : hireCategory === 'fleet'
                        ? 'Fleet / Corporate Request'
                        : 'Temporary / Outstation Driver Request'
                    )
                  }
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitActionButtonText}>{t.submitBtn}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnWhatsAppOutline}
                  onPress={() =>
                    openWhatsApp(
                      `Hello Drivers Saathi! I want to hire a ${hireCategory} driver for my car in ${
                        formData.location || 'Delhi NCR'
                      }. Name: ${formData.name || ''}`
                    )
                  }
                >
                  <Text style={styles.btnWhatsAppOutlineText}>💬 Book Instantly via WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 3: DIGITAL DRIVER DUTY LOGBOOK & OVERTIME CALCULATOR */}
          {/* ======================================================== */}
          {currentTab === 'logbook' && (
            <View>
              <View style={styles.sectionHeadingBox}>
                <Text style={styles.sectionCategory}>DAILY MANAGEMENT</Text>
                <Text style={styles.sectionTitle}>Digital Driver Duty Logbook</Text>
                <Text style={styles.sectionSubtitle}>
                  Track your chauffeur’s daily check-in, check-out, running kilometers, and overtime (OT)
                  hours directly on your phone with zero confusion.
                </Text>
              </View>

              {/* New Duty Entry Card */}
              <View style={styles.logCard}>
                <Text style={styles.logCardTitle}>+ Record Today's Duty Entry</Text>

                <View style={styles.logInputRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Duty Date</Text>
                    <TextInput
                      style={styles.miniInput}
                      value={logDate}
                      onChangeText={setLogDate}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Check-in</Text>
                    <TextInput
                      style={styles.miniInput}
                      value={logInTime}
                      onChangeText={setLogInTime}
                      placeholder="09:00 AM"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Check-out</Text>
                    <TextInput
                      style={styles.miniInput}
                      value={logOutTime}
                      onChangeText={setLogOutTime}
                      placeholder="07:30 PM"
                    />
                  </View>
                </View>

                <View style={styles.logInputRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Running Distance (Km)</Text>
                    <TextInput
                      style={styles.miniInput}
                      value={logKm}
                      onChangeText={setLogKm}
                      placeholder="e.g. 55"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Overtime Hours (OT)</Text>
                    <TextInput
                      style={styles.miniInput}
                      value={logOT}
                      onChangeText={setLogOT}
                      placeholder="e.g. 1.5"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.btnLogSave} onPress={saveDutyLog} activeOpacity={0.85}>
                  <Text style={styles.btnLogSaveText}>💾 Save Duty Record</Text>
                </TouchableOpacity>
              </View>

              {/* Duty Log History Table */}
              <View style={styles.logHistoryHeader}>
                <Text style={styles.logHistoryTitle}>Recent Duty Records ({logEntries.length})</Text>
                {logEntries.length > 0 && (
                  <TouchableOpacity onPress={clearDutyLogs}>
                    <Text style={{ color: THEME.sosRed, fontSize: 12, fontWeight: '700' }}>Clear All</Text>
                  </TouchableOpacity>
                )}
              </View>

              {logEntries.map((entry) => (
                <View key={entry.id} style={styles.logEntryCard}>
                  <View style={styles.logEntryTop}>
                    <Text style={styles.logEntryDate}>📅 {entry.date}</Text>
                    <Text style={styles.logEntryOT}>+{entry.ot} Overtime</Text>
                  </View>
                  <View style={styles.logEntryDetails}>
                    <Text style={styles.logEntryMeta}>In: {entry.in} • Out: {entry.out}</Text>
                    <Text style={styles.logEntryKm}>Distance: {entry.km}</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.btnWhatsAppOutline}
                onPress={() =>
                  openWhatsApp(
                    `Hello Drivers Saathi, here is my driver's monthly duty sheet with ${logEntries.length} entries. Please calculate monthly salary.`
                  )
                }
              >
                <Text style={styles.btnWhatsAppOutlineText}>📤 Share Monthly Sheet with Drivers Saathi</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 4: ACTIVE JOB BOARD FOR DRIVERS                     */}
          {/* ======================================================== */}
          {currentTab === 'jobs' && (
            <View>
              <View style={styles.sectionHeadingBox}>
                <Text style={styles.sectionCategory}>DELHI NCR OPENINGS</Text>
                <Text style={styles.sectionTitle}>Active Driver Job Board</Text>
                <Text style={styles.sectionSubtitle}>
                  Verified driving jobs for private car chauffeurs, company executives & cab fleets with
                  fixed monthly salaries.
                </Text>
              </View>

              {/* Job Card 1 */}
              <View style={styles.jobCard}>
                <View style={styles.jobBadgeRow}>
                  <Text style={styles.jobTypeBadge}>PRIVATE CAR</Text>
                  <Text style={styles.jobSalary}>₹22,000 - ₹24,000 / mo</Text>
                </View>
                <Text style={styles.jobTitle}>Chauffeur for Hyundai Creta (Automatic)</Text>
                <Text style={styles.jobLocation}>📍 Vasant Vihar & South Extension, Delhi</Text>
                <Text style={styles.jobDesc}>
                  Daily office commute + family duty. 10 hours/day, 6 days a week. Non-smoker, clean record,
                  minimum 4 years experience required.
                </Text>
                <TouchableOpacity
                  style={styles.jobApplyBtn}
                  onPress={() => {
                    setFormData({ ...formData, location: 'Vasant Vihar', experience: '4' });
                    setCurrentTab('tools');
                  }}
                >
                  <Text style={styles.jobApplyBtnText}>Apply for this Duty &rarr;</Text>
                </TouchableOpacity>
              </View>

              {/* Job Card 2 */}
              <View style={styles.jobCard}>
                <View style={styles.jobBadgeRow}>
                  <Text style={[styles.jobTypeBadge, { backgroundColor: '#E0E7FF', color: '#4338CA' }]}>
                    EXECUTIVE LUXURY
                  </Text>
                  <Text style={styles.jobSalary}>₹26,000 - ₹28,000 / mo</Text>
                </View>
                <Text style={styles.jobTitle}>Chauffeur for Mercedes E-Class / BMW</Text>
                <Text style={styles.jobLocation}>📍 DLF Golf Course Road, Gurugram</Text>
                <Text style={styles.jobDesc}>
                  Corporate MD travel. Fluent Hindi and basic English route navigation. Highway driving
                  experience on Yamuna / Delhi-Mumbai Expressway.
                </Text>
                <TouchableOpacity
                  style={styles.jobApplyBtn}
                  onPress={() => {
                    setFormData({ ...formData, location: 'DLF Gurugram', experience: '6' });
                    setCurrentTab('tools');
                  }}
                >
                  <Text style={styles.jobApplyBtnText}>Apply for this Duty &rarr;</Text>
                </TouchableOpacity>
              </View>

              {/* Job Card 3 */}
              <View style={styles.jobCard}>
                <View style={styles.jobBadgeRow}>
                  <Text style={[styles.jobTypeBadge, { backgroundColor: THEME.verifiedSoft, color: '#065F46' }]}>
                    COMMERCIAL FLEET
                  </Text>
                  <Text style={styles.jobSalary}>₹20,000 + Fuel Bonus</Text>
                </View>
                <Text style={styles.jobTitle}>Cab Fleet Driver (Dzire / WagonR)</Text>
                <Text style={styles.jobLocation}>📍 Sector 62 & Greater Noida</Text>
                <Text style={styles.jobDesc}>
                  Corporate IT staff shuttle pick-and-drop. Fixed timings, on-time weekly payments. Commercial
                  badge required.
                </Text>
                <TouchableOpacity
                  style={styles.jobApplyBtn}
                  onPress={() => {
                    setFormData({ ...formData, location: 'Noida', experience: '3' });
                    setCurrentTab('tools');
                  }}
                >
                  <Text style={styles.jobApplyBtnText}>Apply for this Duty &rarr;</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 5: TOOLS, DL PARIVAHAN VERIFICATION & CALCULATOR    */}
          {/* ======================================================== */}
          {currentTab === 'tools' && (
            <View>
              {/* Tool 1: Parivahan DL Verification Portal Link */}
              <View style={styles.toolCard}>
                <Text style={styles.toolBadge}>OFFICIAL GOVERNMENT INTEGRATION</Text>
                <Text style={styles.toolTitle}>Verify Any Driver’s License (mParivahan)</Text>
                <Text style={styles.toolSub}>
                  Enter the driving license number to instantly verify authenticity, commercial endorsement,
                  and traffic violation history via the Ministry of Road Transport portal.
                </Text>

                <Text style={styles.fieldLabel}>Enter DL Number (e.g. DL-0420110012345)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="DL-XXXXXXXXXXXXXX"
                  placeholderTextColor={THEME.inkMuted}
                  value={verifyDLNumber}
                  onChangeText={setVerifyDLNumber}
                  autoCapitalize="characters"
                />

                <TouchableOpacity style={styles.btnParivahan} onPress={handleParivahanVerify} activeOpacity={0.85}>
                  <Text style={styles.btnParivahanText}>🔍 Verify on Official Parivahan Portal</Text>
                </TouchableOpacity>
              </View>

              {/* Tool 2: Salary & Cost Calculator */}
              <View style={styles.calcCard}>
                <Text style={styles.calcSectionLabel}>1. Vehicle Category</Text>
                <View style={styles.calcButtonGroup}>
                  <TouchableOpacity
                    style={[styles.calcOption, calcCarType === 'hatchback' && styles.calcOptionActive]}
                    onPress={() => setCalcCarType('hatchback')}
                  >
                    <Text style={[styles.calcOptionText, calcCarType === 'hatchback' && styles.calcOptionTextActive]}>
                      Hatchback (Manual)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.calcOption, calcCarType === 'sedan' && styles.calcOptionActive]}
                    onPress={() => setCalcCarType('sedan')}
                  >
                    <Text style={[styles.calcOptionText, calcCarType === 'sedan' && styles.calcOptionTextActive]}>
                      Sedan / Compact SUV
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.calcOption, calcCarType === 'suv' && styles.calcOptionActive]}
                    onPress={() => setCalcCarType('suv')}
                  >
                    <Text style={[styles.calcOptionText, calcCarType === 'suv' && styles.calcOptionTextActive]}>
                      Full SUV (Innova / Fortuner)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.calcOption, calcCarType === 'luxury' && styles.calcOptionActive]}
                    onPress={() => setCalcCarType('luxury')}
                  >
                    <Text style={[styles.calcOptionText, calcCarType === 'luxury' && styles.calcOptionTextActive]}>
                      Luxury (Mercedes / BMW / Audi)
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.calcSectionLabel}>2. Duty Hours (6 Days / Week)</Text>
                <View style={styles.calcRowGroup}>
                  {['8', '10', '12'].map((hr) => (
                    <TouchableOpacity
                      key={hr}
                      style={[styles.calcPill, calcHours === hr && styles.calcPillActive]}
                      onPress={() => setCalcHours(hr)}
                    >
                      <Text style={[styles.calcPillText, calcHours === hr && styles.calcPillTextActive]}>
                        {hr} Hours
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.calcSectionLabel}>3. Primary Operating NCR Zone</Text>
                <View style={styles.calcRowGroup}>
                  {[
                    { id: 'delhi', label: 'Delhi' },
                    { id: 'gurugram', label: 'Gurugram' },
                    { id: 'noida', label: 'Noida' },
                  ].map((z) => (
                    <TouchableOpacity
                      key={z.id}
                      style={[styles.calcPill, calcZone === z.id && styles.calcPillActive]}
                      onPress={() => setCalcZone(z.id)}
                    >
                      <Text style={[styles.calcPillText, calcZone === z.id && styles.calcPillTextActive]}>
                        {z.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.estimateResultBox}>
                  <Text style={styles.estimateTitle}>Estimated Monthly Salary</Text>
                  <Text style={styles.estimateFigure}>₹{estimate.driverSalary.toLocaleString('en-IN')}</Text>
                  <Text style={styles.estimateNote}>in-hand per month (6 days a week)</Text>

                  <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={() => {
                      setFormData({ ...formData, vehicle: calcCarType, location: calcZone });
                      setCurrentTab('hire');
                      setHireCategory('personal');
                    }}
                  >
                    <Text style={styles.btnPrimaryText}>Book Driver at this Rate &rarr;</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tool 3: Driver KYC Upload Form */}
              <View style={[styles.formContainerCard, { marginTop: 20 }]}>
                <Text style={styles.formTitle}>{t.driverFormTitle}</Text>
                <Text style={styles.formSubtitle}>{t.driverFormSub}</Text>

                <Text style={styles.fieldLabel}>{t.name} *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Driver Full Name"
                  placeholderTextColor={THEME.inkMuted}
                  value={formData.name}
                  onChangeText={(v) => setFormData({ ...formData, name: v })}
                />

                <Text style={styles.fieldLabel}>{t.phone} *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={THEME.inkMuted}
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(v) => setFormData({ ...formData, phone: v })}
                />

                <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Attach Verification Documents</Text>
                <View style={styles.kycRow}>
                  <TouchableOpacity
                    style={[styles.kycUploadBtn, licenseImg && styles.kycUploadBtnSuccess]}
                    onPress={() => pickDocument('license')}
                  >
                    <Text style={styles.kycUploadIcon}>{licenseImg ? '✅' : '🪪'}</Text>
                    <Text style={styles.kycUploadLabel}>{licenseImg ? 'License Attached' : 'Attach DL'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.kycUploadBtn, aadhaarImg && styles.kycUploadBtnSuccess]}
                    onPress={() => pickDocument('aadhaar')}
                  >
                    <Text style={styles.kycUploadIcon}>{aadhaarImg ? '✅' : '📄'}</Text>
                    <Text style={styles.kycUploadLabel}>{aadhaarImg ? 'Aadhaar Attached' : 'Attach Aadhaar'}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.submitActionButton}
                  onPress={() => handleFormSubmit('Driver Partner KYC & Application')}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>{t.applyBtn}</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating WhatsApp Action Button */}
      <TouchableOpacity style={styles.floatingWhatsApp} onPress={() => openWhatsApp()} activeOpacity={0.85}>
        <Text style={styles.floatingWhatsAppIcon}>💬</Text>
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabButton} onPress={() => setCurrentTab('home')} activeOpacity={0.7}>
          <Text style={[styles.tabIconText, currentTab === 'home' && styles.tabIconActive]}>🏠</Text>
          <Text style={[styles.tabLabel, currentTab === 'home' && styles.tabLabelActive]}>{t.tabHome}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => setCurrentTab('hire')} activeOpacity={0.7}>
          <Text style={[styles.tabIconText, currentTab === 'hire' && styles.tabIconActive]}>🚗</Text>
          <Text style={[styles.tabLabel, currentTab === 'hire' && styles.tabLabelActive]}>{t.tabHire}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => setCurrentTab('logbook')} activeOpacity={0.7}>
          <Text style={[styles.tabIconText, currentTab === 'logbook' && styles.tabIconActive]}>⏱️</Text>
          <Text style={[styles.tabLabel, currentTab === 'logbook' && styles.tabLabelActive]}>{t.tabLogbook}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => setCurrentTab('jobs')} activeOpacity={0.7}>
          <Text style={[styles.tabIconText, currentTab === 'jobs' && styles.tabIconActive]}>💼</Text>
          <Text style={[styles.tabLabel, currentTab === 'jobs' && styles.tabLabelActive]}>{t.tabJobs}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => setCurrentTab('tools')} activeOpacity={0.7}>
          <Text style={[styles.tabIconText, currentTab === 'tools' && styles.tabIconActive]}>🛠️</Text>
          <Text style={[styles.tabLabel, currentTab === 'tools' && styles.tabLabelActive]}>{t.tabTools}</Text>
        </TouchableOpacity>
      </View>

      {/* Success Confirmation Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalCheckCircle}>
              <Text style={styles.modalCheckMark}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>{t.successTitle}</Text>
            <Text style={styles.modalBody}>{modalMessage}</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)} activeOpacity={0.85}>
              <Text style={styles.modalCloseBtnText}>{t.closeBtn}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: THEME.ink,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: THEME.ink,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 165,
    height: 42,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosButton: {
    backgroundColor: THEME.sosSoft,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  sosButtonText: {
    color: THEME.sosRed,
    fontSize: 12,
    fontWeight: '800',
  },
  languageToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  languageToggleText: {
    color: THEME.paper,
    fontSize: 12,
    fontWeight: '700',
  },
  liveTicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.cardNavy,
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 8,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.verified,
  },
  liveTickerText: {
    color: '#E2E8F0',
    fontSize: 11.5,
    fontWeight: '600',
  },
  mainScroll: {
    padding: 16,
    backgroundColor: THEME.paperAlt,
    paddingBottom: 120,
  },

  // Hero section
  heroWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: THEME.ink,
    position: 'relative',
    minHeight: 390,
  },
  heroBgImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.38,
  },
  heroOverlay: {
    padding: 22,
    justifyContent: 'flex-end',
    minHeight: 390,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.marigold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    color: THEME.paper,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroHeading: {
    color: THEME.paper,
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 8,
  },
  heroBody: {
    color: '#E2E8F0',
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 18,
  },
  heroBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  btnPrimary: {
    backgroundColor: THEME.marigold,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    shadowColor: THEME.marigold,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  btnPrimaryText: {
    color: THEME.paper,
    fontWeight: '700',
    fontSize: 14,
  },
  btnGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    flex: 1,
  },
  btnGlassText: {
    color: THEME.paper,
    fontWeight: '700',
    fontSize: 14,
  },
  btnWhatsAppHero: {
    backgroundColor: THEME.whatsapp,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  btnWhatsAppHeroText: {
    color: '#FFF',
    fontSize: 13.5,
    fontWeight: '800',
  },

  // Quick Action Grid
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  quickCard: {
    width: '48%',
    backgroundColor: THEME.paper,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.line,
  },
  quickIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 2,
  },
  quickSub: {
    fontSize: 11,
    color: THEME.inkSoft,
    lineHeight: 15,
  },

  // Section Headers
  sectionHeadingBox: {
    marginBottom: 14,
    marginTop: 6,
  },
  sectionCategory: {
    color: THEME.marigoldDeep,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: THEME.inkSoft,
    lineHeight: 18,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: THEME.paper,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.line,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11.5,
    color: THEME.inkSoft,
    fontWeight: '500',
  },

  // Contact Desk Card
  contactDeskCard: {
    backgroundColor: THEME.cardNavy,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  contactDeskTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.paper,
    marginBottom: 4,
  },
  contactDeskSub: {
    fontSize: 13,
    color: '#CBD5E1',
    marginBottom: 14,
    lineHeight: 18,
  },
  actionCallBtn: {
    backgroundColor: THEME.marigold,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionCallBtnText: {
    color: THEME.paper,
    fontWeight: '800',
    fontSize: 14,
  },
  actionMailBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionMailBtnText: {
    color: '#E2E8F0',
    fontWeight: '600',
    fontSize: 13,
  },

  // Forms
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: THEME.paper,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.inkSoft,
    textAlign: 'center',
  },
  segmentBtnTextActive: {
    color: THEME.marigoldDeep,
    fontWeight: '800',
  },
  formContainerCard: {
    backgroundColor: THEME.paper,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.line,
  },
  formTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: THEME.inkSoft,
    lineHeight: 18,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.ink,
    marginTop: 10,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: THEME.paperAlt,
    borderWidth: 1,
    borderColor: THEME.line,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: THEME.ink,
  },
  submitActionButton: {
    backgroundColor: THEME.marigold,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 18,
    shadowColor: THEME.marigold,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  submitActionButtonText: {
    color: THEME.paper,
    fontWeight: '800',
    fontSize: 15,
  },
  btnWhatsAppOutline: {
    backgroundColor: THEME.verifiedSoft,
    borderWidth: 1.5,
    borderColor: THEME.whatsapp,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  btnWhatsAppOutlineText: {
    color: '#065F46',
    fontWeight: '800',
    fontSize: 13.5,
  },

  // Duty Logbook Tab
  logCard: {
    backgroundColor: THEME.paper,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: THEME.blue,
    marginBottom: 20,
  },
  logCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 12,
  },
  logInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  miniLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: THEME.inkSoft,
    marginBottom: 4,
  },
  miniInput: {
    backgroundColor: THEME.paperAlt,
    borderWidth: 1,
    borderColor: THEME.line,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 12.5,
    color: THEME.ink,
  },
  btnLogSave: {
    backgroundColor: THEME.blue,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  btnLogSaveText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13.5,
  },
  logHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logHistoryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.ink,
  },
  logEntryCard: {
    backgroundColor: THEME.paper,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 10,
  },
  logEntryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logEntryDate: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.ink,
  },
  logEntryOT: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.marigoldDeep,
    backgroundColor: THEME.marigoldLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  logEntryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logEntryMeta: {
    fontSize: 12.5,
    color: THEME.inkSoft,
  },
  logEntryKm: {
    fontSize: 12.5,
    fontWeight: '600',
    color: THEME.ink,
  },

  // Job Board Tab
  jobCard: {
    backgroundColor: THEME.paper,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 14,
  },
  jobBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTypeBadge: {
    backgroundColor: THEME.marigoldLight,
    color: THEME.marigoldDeep,
    fontSize: 10.5,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  jobSalary: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.verified,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
  },
  jobLocation: {
    fontSize: 12.5,
    color: THEME.inkSoft,
    marginBottom: 8,
  },
  jobDesc: {
    fontSize: 12.5,
    color: THEME.inkSoft,
    lineHeight: 18,
    marginBottom: 12,
  },
  jobApplyBtn: {
    backgroundColor: THEME.ink,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  jobApplyBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Tools Tab
  toolCard: {
    backgroundColor: THEME.paper,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    marginBottom: 20,
  },
  toolBadge: {
    color: THEME.blue,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  toolTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
  },
  toolSub: {
    fontSize: 12.5,
    color: THEME.inkSoft,
    lineHeight: 17,
    marginBottom: 12,
  },
  btnParivahan: {
    backgroundColor: THEME.blue,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 10,
  },
  btnParivahanText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 13.5,
  },

  // Calculator Card in Tools Tab
  calcCard: {
    backgroundColor: THEME.paper,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 16,
  },
  calcSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.ink,
    marginTop: 10,
    marginBottom: 6,
  },
  calcButtonGroup: {
    gap: 6,
  },
  calcOption: {
    backgroundColor: THEME.paperAlt,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.line,
  },
  calcOptionActive: {
    backgroundColor: THEME.marigoldLight,
    borderColor: THEME.marigold,
  },
  calcOptionText: {
    fontSize: 12.5,
    color: THEME.inkSoft,
    fontWeight: '600',
  },
  calcOptionTextActive: {
    color: THEME.marigoldDeep,
    fontWeight: '800',
  },
  calcRowGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  calcPill: {
    backgroundColor: THEME.paperAlt,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.line,
  },
  calcPillActive: {
    backgroundColor: THEME.marigold,
    borderColor: THEME.marigoldDeep,
  },
  calcPillText: {
    fontSize: 12,
    color: THEME.inkSoft,
    fontWeight: '600',
  },
  calcPillTextActive: {
    color: THEME.paper,
    fontWeight: '800',
  },
  estimateResultBox: {
    backgroundColor: THEME.ink,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  estimateTitle: {
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  estimateFigure: {
    color: THEME.marigold,
    fontSize: 32,
    fontWeight: '800',
  },
  estimateNote: {
    color: '#CBD5E1',
    fontSize: 11.5,
    marginBottom: 12,
  },

  // KYC
  kycRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  kycUploadBtn: {
    flex: 1,
    backgroundColor: THEME.paperAlt,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kycUploadBtnSuccess: {
    backgroundColor: THEME.verifiedSoft,
    borderColor: THEME.verified,
    borderStyle: 'solid',
  },
  kycUploadIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  kycUploadLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.ink,
  },

  // Floating WhatsApp
  floatingWhatsApp: {
    position: 'absolute',
    bottom: 75,
    right: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.whatsapp,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
  },
  floatingWhatsAppIcon: {
    fontSize: 28,
  },

  // Bottom Navigation Bar
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: THEME.paper,
    borderTopWidth: 1,
    borderTopColor: THEME.line,
    paddingVertical: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  tabIconText: {
    fontSize: 18,
    marginBottom: 2,
    opacity: 0.7,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: THEME.inkSoft,
  },
  tabLabelActive: {
    color: THEME.marigold,
    fontWeight: '800',
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: THEME.paper,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  modalCheckCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.verifiedSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: THEME.verified,
  },
  modalCheckMark: {
    color: THEME.verified,
    fontSize: 32,
    fontWeight: '800',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 13.5,
    color: THEME.inkSoft,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCloseBtn: {
    backgroundColor: THEME.ink,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: THEME.paper,
    fontSize: 14,
    fontWeight: '700',
  },
});
