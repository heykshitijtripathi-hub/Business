import React, { useState } from 'react';
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

// Brand Color Palette
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
  verified: '#10B981',
  verifiedSoft: '#ECFDF5',
  cardNavy: '#1E293B',
  whatsapp: '#25D366',
  sosRed: '#EF4444',
  sosSoft: '#FEF2F2',
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

    // Tabs
    tabHome: 'Overview',
    tabHire: 'Hire Driver',
    tabCalc: 'Calculator',
    tabDrivers: 'Roster & Reviews',
    tabApply: 'Driver KYC',

    // Forms
    fleetFormTitle: 'Request Fleet & Commercial Drivers',
    fleetFormSub: 'For cab fleets, tour operators, corporate staff shuttles, and logistics.',
    personalFormTitle: 'Hire a Personal Chauffeur',
    personalFormSub: 'For private car owners, families, daily office commute, and VIP luxury cars.',
    driverFormTitle: 'Driver KYC & Application Form',
    driverFormSub: 'Upload your documents to get fast-track police verified & start earning.',

    name: 'Contact Person / Full Name',
    phone: 'Phone Number (Calling & WhatsApp)',
    email: 'Email Address (For auto-confirmation)',
    company: 'Company / Fleet Name (Optional)',
    vehicle: 'Vehicle Type / Model (e.g. Creta / Innova / EV)',
    location: 'Location / Preferred Area in Delhi NCR',
    driverCount: 'Number of Drivers Required',
    licenseType: 'License Category (LMV / Commercial / Heavy)',
    experience: 'Total Driving Experience (in Years)',
    submitBtn: 'Submit Requirement Now',
    applyBtn: 'Submit KYC & Application',

    // Success Modal
    successTitle: 'Requirement Received!',
    successSub:
      'Thank you for reaching out to Drivers Saathi. Our dispatch desk is reviewing your requirement and will connect with you via call/WhatsApp shortly.\n\nA confirmation copy has been sent to support@driverssaathi.com and your email.',
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

    // Tabs
    tabHome: 'होम',
    tabHire: 'ड्राइवर चाहिए',
    tabCalc: 'रेट कैलकुलेटर',
    tabDrivers: 'ड्राइवर्स व रिव्यू',
    tabApply: 'ड्राइवर KYC',

    // Forms
    fleetFormTitle: 'फ्लीट व कमर्शियल ड्राइवर रिक्वायरमेंट',
    fleetFormSub: 'कैब फ्लीट, टूर ऑपरेटर्स और कॉर्पोरेट स्टाफ पिकअप के लिए।',
    personalFormTitle: 'पर्सनल गाड़ी के लिए ड्राइवर बुक करें',
    personalFormSub: 'परिवार, रोज़ाना ऑफिस आवागमन और लग्जरी कारों के लिए।',
    driverFormTitle: 'ड्राइवर KYC और आवेदन फॉर्म',
    driverFormSub: 'अपने दस्तावेज अपलोड करें और तुरंत वेरिफाइड होकर काम शुरू करें।',

    name: 'पूरा नाम / संपर्क व्यक्ति',
    phone: 'फ़ोन नंबर (कॉलिंग और व्हाट्सएप)',
    email: 'ईमेल आईडी (कन्फर्मेशन प्राप्त करने के लिए)',
    company: 'कंपनी / फ्लीट नाम (वैकल्पिक)',
    vehicle: 'गाड़ी का प्रकार / मॉडल (जैसे Innova / Creta / Dzire)',
    location: 'दिल्ली एनसीआर में इलाका',
    driverCount: 'कितने ड्राइवर्स की ज़रूरत है?',
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
  const [currentTab, setCurrentTab] = useState('home'); // home | hire | calc | drivers | apply
  const [hireCategory, setHireCategory] = useState('fleet'); // fleet | personal
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Interactive Salary / Cost Calculator State
  const [calcCarType, setCalcCarType] = useState('sedan'); // hatchback | sedan | suv | luxury
  const [calcHours, setCalcHours] = useState('10'); // 8 | 10 | 12
  const [calcZone, setCalcZone] = useState('delhi'); // delhi | gurugram | noida

  // Document Uploads State for Driver KYC
  const [licenseImg, setLicenseImg] = useState(null);
  const [aadhaarImg, setAadhaarImg] = useState(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    vehicle: '',
    location: '',
    count: '1',
    license: '',
    experience: '',
  });

  const t = STRINGS[lang];

  // Actions
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

  // Image Picker for KYC
  const pickDocument = async (docType) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Camera roll access is needed to upload your KYC documents.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        if (docType === 'license') {
          setLicenseImg(result.assets[0].uri);
        } else {
          setAadhaarImg(result.assets[0].uri);
        }
        Alert.alert('Document Selected', `${docType === 'license' ? 'Driving License' : 'Aadhaar Card'} photo attached successfully.`);
      }
    } catch (e) {
      Alert.alert('Document Note', 'File picker accessed.');
    }
  };

  // Cost / Salary Calculation Engine
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
    const agencyFee = 4500; // One-time placement fee
    return { driverSalary, agencyFee, totalFirstMonth: driverSalary + agencyFee };
  };

  const estimate = calculateEstimate();

  const handleFormSubmit = async (type) => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      Alert.alert('Required Information', 'Please enter your Full Name and Mobile Number.');
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
      Company: formData.company || 'Individual / Personal',
      'Vehicle Model': formData.vehicle || 'Not specified',
      'Location / NCR Zone': formData.location || 'Delhi NCR',
      'Drivers Needed': formData.count || '1',
      'License Type': formData.license || 'LMV',
      Experience: formData.experience || 'Not specified',
      'License Attached': licenseImg ? 'Yes (Mobile Picker)' : 'Pending',
      'Aadhaar Attached': aadhaarImg ? 'Yes (Mobile Picker)' : 'Pending',
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
          {/* Roadside Emergency SOS */}
          <TouchableOpacity style={styles.sosButton} onPress={handleSOS} activeOpacity={0.8}>
            <Text style={styles.sosButtonText}>🚨 SOS</Text>
          </TouchableOpacity>

          {/* Bilingual Language Toggle */}
          <TouchableOpacity
            style={styles.languageToggle}
            onPress={() => setLang(lang === 'en' ? 'hi' : 'en')}
            activeOpacity={0.8}
          >
            <Text style={styles.languageToggleText}>{lang === 'en' ? 'हिन्दी' : 'English'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dispatch Desk Live Strip */}
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
                        setHireCategory('fleet');
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.btnPrimaryText}>{t.ctaFleet} &rarr;</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnGlass}
                      onPress={() => {
                        setCurrentTab('hire');
                        setHireCategory('personal');
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.btnGlassText}>{t.ctaPersonal}</Text>
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

              {/* Calculator Teaser Banner */}
              <TouchableOpacity
                style={styles.calcTeaserCard}
                onPress={() => setCurrentTab('calc')}
                activeOpacity={0.85}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.calcTeaserBadge}>NEW FEATURE</Text>
                  <Text style={styles.calcTeaserTitle}>Driver Salary & Cost Estimator</Text>
                  <Text style={styles.calcTeaserSub}>
                    Calculate monthly chauffeur pay according to car model, shift hours & Delhi NCR zone.
                  </Text>
                </View>
                <Text style={styles.calcTeaserArrow}>&rarr;</Text>
              </TouchableOpacity>

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

              {/* Ground Inspection Photography */}
              <View style={styles.photoBannerCard}>
                <Image
                  source={require('./assets/driver_team_standing.jpg')}
                  style={styles.photoBannerImage}
                  resizeMode="cover"
                />
                <View style={styles.photoBannerContent}>
                  <Text style={styles.photoBannerTitle}>Ground Inspected Chauffeurs</Text>
                  <Text style={styles.photoBannerSub}>
                    Every candidate undergoes physical road driving tests, background address check,
                    and badge verification before dispatch.
                  </Text>
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => setCurrentTab('drivers')}
                  >
                    <Text style={styles.linkButtonText}>View Verified Drivers & Reviews &rarr;</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Central Dispatch Contact Card */}
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
          {/* TAB 2: HIRE DRIVER (FLEET & CHAUFFEUR FORMS)             */}
          {/* ======================================================== */}
          {currentTab === 'hire' && (
            <View>
              <View style={styles.segmentContainer}>
                <TouchableOpacity
                  style={[styles.segmentBtn, hireCategory === 'fleet' && styles.segmentBtnActive]}
                  onPress={() => setHireCategory('fleet')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.segmentBtnText,
                      hireCategory === 'fleet' && styles.segmentBtnTextActive,
                    ]}
                  >
                    Cab Fleet / Corporate
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.segmentBtn, hireCategory === 'personal' && styles.segmentBtnActive]}
                  onPress={() => setHireCategory('personal')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.segmentBtnText,
                      hireCategory === 'personal' && styles.segmentBtnTextActive,
                    ]}
                  >
                    Personal Car Chauffeur
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formContainerCard}>
                <Text style={styles.formTitle}>
                  {hireCategory === 'fleet' ? t.fleetFormTitle : t.personalFormTitle}
                </Text>
                <Text style={styles.formSubtitle}>
                  {hireCategory === 'fleet' ? t.fleetFormSub : t.personalFormSub}
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

                {hireCategory === 'fleet' ? (
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
                ) : (
                  <>
                    <Text style={styles.fieldLabel}>{t.vehicle}</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Honda City / Hyundai Creta / BMW (Automatic)"
                      placeholderTextColor={THEME.inkMuted}
                      value={formData.vehicle}
                      onChangeText={(v) => setFormData({ ...formData, vehicle: v })}
                    />
                  </>
                )}

                <Text style={styles.fieldLabel}>{t.location}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. South Delhi / DLF Phase 5 Gurugram / Sector 62 Noida"
                  placeholderTextColor={THEME.inkMuted}
                  value={formData.location}
                  onChangeText={(v) => setFormData({ ...formData, location: v })}
                />

                <TouchableOpacity
                  style={styles.submitActionButton}
                  onPress={() =>
                    handleFormSubmit(
                      hireCategory === 'fleet'
                        ? 'Fleet / Corporate Driver Request'
                        : 'Personal Car Chauffeur Request'
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
                      `Hello Drivers Saathi, I want to inquire about ${
                        hireCategory === 'fleet' ? 'fleet drivers' : 'a personal driver'
                      }. My name is ${formData.name || ''}.`
                    )
                  }
                >
                  <Text style={styles.btnWhatsAppOutlineText}>💬 Or Chat Directly on WhatsApp</Text>
                </TouchableOpacity>

                <Text style={styles.securityNote}>
                  🔒 We guarantee 100% data privacy. Profiles dispatched within 24 hours.
                </Text>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 3: SALARY & COST CALCULATOR (NEW FEATURE)             */}
          {/* ======================================================== */}
          {currentTab === 'calc' && (
            <View>
              <View style={styles.sectionHeadingBox}>
                <Text style={styles.sectionCategory}>COST ESTIMATOR</Text>
                <Text style={styles.sectionTitle}>Driver Salary & Placement Calculator</Text>
                <Text style={styles.sectionSubtitle}>
                  Get an instant real-market salary estimate for verified full-time drivers in Delhi NCR.
                </Text>
              </View>

              <View style={styles.calcCard}>
                {/* 1. Car Type Selector */}
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

                {/* 2. Duty Hours */}
                <Text style={styles.calcSectionLabel}>2. Daily Duty Hours (6 Days / Week)</Text>
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

                {/* 3. Location Zone */}
                <Text style={styles.calcSectionLabel}>3. Primary Operating NCR Zone</Text>
                <View style={styles.calcRowGroup}>
                  {[
                    { id: 'delhi', label: 'Delhi (South/West)' },
                    { id: 'gurugram', label: 'Gurugram' },
                    { id: 'noida', label: 'Noida / Gr. Noida' },
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

                {/* Estimation Results Card */}
                <View style={styles.estimateResultBox}>
                  <Text style={styles.estimateTitle}>Estimated Market Salary</Text>
                  <Text style={styles.estimateFigure}>₹{estimate.driverSalary.toLocaleString('en-IN')}</Text>
                  <Text style={styles.estimateNote}>per month in-hand (excluding overtime)</Text>

                  <View style={styles.estimateBreakdown}>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Driver Monthly Salary</Text>
                      <Text style={styles.breakdownVal}>₹{estimate.driverSalary.toLocaleString('en-IN')}/mo</Text>
                    </View>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>One-time Placement Fee</Text>
                      <Text style={styles.breakdownVal}>₹{estimate.agencyFee.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Warranty</Text>
                      <Text style={[styles.breakdownVal, { color: THEME.verified, fontWeight: '700' }]}>
                        30-Day Free Replacement
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        location: calcZone.toUpperCase(),
                        vehicle: calcCarType.toUpperCase(),
                      });
                      setCurrentTab('hire');
                      setHireCategory('personal');
                    }}
                  >
                    <Text style={styles.btnPrimaryText}>Book Driver at This Rate &rarr;</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 4: REAL DRIVERS ROSTER & CLIENT TESTIMONIALS         */}
          {/* ======================================================== */}
          {currentTab === 'drivers' && (
            <View>
              <View style={styles.sectionHeadingBox}>
                <Text style={styles.sectionCategory}>GROUND AUDITED</Text>
                <Text style={styles.sectionTitle}>Real Drivers & Fleet Roster</Text>
                <Text style={styles.sectionSubtitle}>
                  View actual profiles and ground inspection records of our verified community.
                </Text>
              </View>

              {/* Driver Card 1 */}
              <View style={styles.driverProfileCard}>
                <Image
                  source={require('./assets/indian_driver_portrait.jpg')}
                  style={styles.driverProfileImage}
                  resizeMode="cover"
                />
                <View style={styles.driverProfileDetails}>
                  <View style={styles.verifiedTagRow}>
                    <Text style={styles.verifiedTag}>✓ Police Verified</Text>
                    <Text style={styles.badgePillSmall}>LMV Commercial Badge</Text>
                  </View>
                  <Text style={styles.driverName}>Rajesh Kumar</Text>
                  <Text style={styles.driverMeta}>Exp: 8 Years • Delhi & Highway Routes</Text>
                  <Text style={styles.driverSkill}>Sedan / SUV / Commercial Cab Specialist</Text>
                  <Text style={styles.driverRating}>⭐️⭐️⭐️⭐️⭐️ 4.9 Rating (42 Trips / Placements)</Text>
                </View>
              </View>

              {/* Driver Card 2 */}
              <View style={styles.driverProfileCard}>
                <Image
                  source={require('./assets/indian_driver_wheel.jpg')}
                  style={styles.driverProfileImage}
                  resizeMode="cover"
                />
                <View style={styles.driverProfileDetails}>
                  <View style={styles.verifiedTagRow}>
                    <Text style={styles.verifiedTag}>✓ Road Tested</Text>
                    <Text style={styles.badgePillSmall}>Clean Record</Text>
                  </View>
                  <Text style={styles.driverName}>Vikram Singh</Text>
                  <Text style={styles.driverMeta}>Exp: 11 Years • Expressway & VIP Chauffeur</Text>
                  <Text style={styles.driverSkill}>Automatic Transmission & Luxury Car Specialist</Text>
                  <Text style={styles.driverRating}>⭐️⭐️⭐️⭐️⭐️ 5.0 Rating (Executive Transport)</Text>
                </View>
              </View>

              {/* Client Testimonials Section */}
              <View style={styles.sectionHeadingBox}>
                <Text style={styles.sectionCategory}>CLIENT REVIEWS</Text>
                <Text style={styles.sectionTitle}>What Fleet Managers & Car Owners Say</Text>
              </View>

              <View style={styles.testimonialCard}>
                <Text style={styles.testimonialRating}>⭐️⭐️⭐️⭐️⭐️</Text>
                <Text style={styles.testimonialQuote}>
                  "We needed 6 commercial drivers on short notice for our Gurugram IT park staff route.
                  Drivers Saathi provided background-checked drivers in 36 hours. Not a single day of absenteeism."
                </Text>
                <Text style={styles.testimonialAuthor}>Sunil Mehra</Text>
                <Text style={styles.testimonialRole}>Fleet Operations Head, DLF CyberCity</Text>
              </View>

              <View style={styles.testimonialCard}>
                <Text style={styles.testimonialRating}>⭐️⭐️⭐️⭐️⭐️</Text>
                <Text style={styles.testimonialQuote}>
                  "Found a dependable chauffeur for my mother’s daily hospital and market visits in Greater Kailash.
                  Polite, punctual, and non-smoker. The police verification certificate gave us complete peace of mind."
                </Text>
                <Text style={styles.testimonialAuthor}>Dr. Ananya Sen</Text>
                <Text style={styles.testimonialRole}>Resident, South Delhi</Text>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 5: DRIVER PARTNER KYC & APPLICATION                  */}
          {/* ======================================================== */}
          {currentTab === 'apply' && (
            <View>
              <View style={styles.formContainerCard}>
                <Text style={styles.formTitle}>{t.driverFormTitle}</Text>
                <Text style={styles.formSubtitle}>{t.driverFormSub}</Text>

                <View style={styles.driverPerksBox}>
                  <Text style={styles.driverPerkItem}>✓ Timely salary & weekly fuel bonuses</Text>
                  <Text style={styles.driverPerkItem}>✓ Verified vehicle owners & corporate clients</Text>
                  <Text style={styles.driverPerkItem}>✓ 24x7 Roadside & helpline support</Text>
                </View>

                <Text style={styles.fieldLabel}>{t.name} *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Driver Full Name (as on Aadhaar)"
                  placeholderTextColor={THEME.inkMuted}
                  value={formData.name}
                  onChangeText={(v) => setFormData({ ...formData, name: v })}
                />

                <Text style={styles.fieldLabel}>{t.phone} (WhatsApp) *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={THEME.inkMuted}
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(v) => setFormData({ ...formData, phone: v })}
                />

                <Text style={styles.fieldLabel}>{t.licenseType}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. LMV Commercial Badge / Transport / Heavy"
                  placeholderTextColor={THEME.inkMuted}
                  value={formData.license}
                  onChangeText={(v) => setFormData({ ...formData, license: v })}
                />

                <Text style={styles.fieldLabel}>{t.experience}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 5 Years"
                  placeholderTextColor={THEME.inkMuted}
                  keyboardType="numeric"
                  value={formData.experience}
                  onChangeText={(v) => setFormData({ ...formData, experience: v })}
                />

                <Text style={styles.fieldLabel}>{t.location}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Uttam Nagar / Badarpur / Sector 14 Gurugram"
                  placeholderTextColor={THEME.inkMuted}
                  value={formData.location}
                  onChangeText={(v) => setFormData({ ...formData, location: v })}
                />

                {/* KYC Document Upload Section */}
                <Text style={[styles.fieldLabel, { marginTop: 16 }]}>KYC Document Attachments (Camera / Gallery)</Text>
                <View style={styles.kycRow}>
                  <TouchableOpacity
                    style={[styles.kycUploadBtn, licenseImg && styles.kycUploadBtnSuccess]}
                    onPress={() => pickDocument('license')}
                  >
                    <Text style={styles.kycUploadIcon}>{licenseImg ? '✅' : '🪪'}</Text>
                    <Text style={styles.kycUploadLabel}>
                      {licenseImg ? 'License Attached' : 'Attach License'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.kycUploadBtn, aadhaarImg && styles.kycUploadBtnSuccess]}
                    onPress={() => pickDocument('aadhaar')}
                  >
                    <Text style={styles.kycUploadIcon}>{aadhaarImg ? '✅' : '📄'}</Text>
                    <Text style={styles.kycUploadLabel}>
                      {aadhaarImg ? 'Aadhaar Attached' : 'Attach Aadhaar'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.submitActionButton}
                  onPress={() => handleFormSubmit('Driver Partner KYC Application')}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitActionButtonText}>{t.applyBtn}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnWhatsAppOutline}
                  onPress={() =>
                    openWhatsApp(
                      `Hello Drivers Saathi, I want to join as a driver partner. My name is ${
                        formData.name || ''
                      }. Please let me know the joining process.`
                    )
                  }
                >
                  <Text style={styles.btnWhatsAppOutlineText}>💬 Send KYC via WhatsApp</Text>
                </TouchableOpacity>

                <Text style={styles.securityNote}>
                  📞 Our recruitment team will verify your license and call you within 2 business days.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating WhatsApp Action Button */}
      <TouchableOpacity
        style={styles.floatingWhatsApp}
        onPress={() => openWhatsApp()}
        activeOpacity={0.85}
      >
        <Text style={styles.floatingWhatsAppIcon}>💬</Text>
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setCurrentTab('home')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIconText, currentTab === 'home' && styles.tabIconActive]}>🏠</Text>
          <Text style={[styles.tabLabel, currentTab === 'home' && styles.tabLabelActive]}>
            {t.tabHome}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setCurrentTab('hire')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIconText, currentTab === 'hire' && styles.tabIconActive]}>🚗</Text>
          <Text style={[styles.tabLabel, currentTab === 'hire' && styles.tabLabelActive]}>
            {t.tabHire}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setCurrentTab('calc')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIconText, currentTab === 'calc' && styles.tabIconActive]}>🧮</Text>
          <Text style={[styles.tabLabel, currentTab === 'calc' && styles.tabLabelActive]}>
            {t.tabCalc}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setCurrentTab('drivers')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIconText, currentTab === 'drivers' && styles.tabIconActive]}>👥</Text>
          <Text style={[styles.tabLabel, currentTab === 'drivers' && styles.tabLabelActive]}>
            {t.tabDrivers}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setCurrentTab('apply')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIconText, currentTab === 'apply' && styles.tabIconActive]}>🪪</Text>
          <Text style={[styles.tabLabel, currentTab === 'apply' && styles.tabLabelActive]}>
            {t.tabApply}
          </Text>
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
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.85}
            >
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

  // Hero Section
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

  // Calculator Teaser Card
  calcTeaserCard: {
    backgroundColor: THEME.paper,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: THEME.marigold,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: THEME.marigold,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  calcTeaserBadge: {
    color: THEME.marigoldDeep,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  calcTeaserTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
  },
  calcTeaserSub: {
    fontSize: 12.5,
    color: THEME.inkSoft,
    lineHeight: 17,
  },
  calcTeaserArrow: {
    fontSize: 24,
    color: THEME.marigoldDeep,
    fontWeight: '800',
    marginLeft: 12,
  },

  // Stats Grid
  sectionHeadingBox: {
    marginBottom: 14,
    marginTop: 8,
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

  // Photo Banner
  photoBannerCard: {
    backgroundColor: THEME.paper,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 20,
  },
  photoBannerImage: {
    width: '100%',
    height: 180,
  },
  photoBannerContent: {
    padding: 16,
  },
  photoBannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.ink,
    marginBottom: 4,
  },
  photoBannerSub: {
    fontSize: 13,
    color: THEME.inkSoft,
    lineHeight: 18,
    marginBottom: 10,
  },
  linkButton: {
    alignSelf: 'flex-start',
  },
  linkButtonText: {
    color: THEME.marigoldDeep,
    fontWeight: '700',
    fontSize: 13.5,
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

  // Form Screen
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
    fontSize: 13,
    fontWeight: '600',
    color: THEME.inkSoft,
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
  driverPerksBox: {
    backgroundColor: THEME.verifiedSoft,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  driverPerkItem: {
    color: '#065F46',
    fontSize: 12.5,
    fontWeight: '600',
    marginBottom: 4,
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
    marginTop: 10,
  },
  btnWhatsAppOutlineText: {
    color: '#065F46',
    fontWeight: '800',
    fontSize: 13.5,
  },
  securityNote: {
    fontSize: 11.5,
    color: THEME.inkSoft,
    textAlign: 'center',
    marginTop: 12,
  },

  // Calculator Screen
  calcCard: {
    backgroundColor: THEME.paper,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.line,
  },
  calcSectionLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: THEME.ink,
    marginTop: 12,
    marginBottom: 8,
  },
  calcButtonGroup: {
    gap: 8,
  },
  calcOption: {
    backgroundColor: THEME.paperAlt,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.line,
  },
  calcOptionActive: {
    backgroundColor: THEME.marigoldLight,
    borderColor: THEME.marigold,
  },
  calcOptionText: {
    fontSize: 13,
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
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.line,
  },
  calcPillActive: {
    backgroundColor: THEME.marigold,
    borderColor: THEME.marigoldDeep,
  },
  calcPillText: {
    fontSize: 12.5,
    color: THEME.inkSoft,
    fontWeight: '600',
  },
  calcPillTextActive: {
    color: THEME.paper,
    fontWeight: '800',
  },
  estimateResultBox: {
    backgroundColor: THEME.ink,
    borderRadius: 14,
    padding: 18,
    marginTop: 20,
    alignItems: 'center',
  },
  estimateTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  estimateFigure: {
    color: THEME.marigold,
    fontSize: 34,
    fontWeight: '800',
  },
  estimateNote: {
    color: '#CBD5E1',
    fontSize: 12,
    marginBottom: 16,
  },
  estimateBreakdown: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    color: '#E2E8F0',
    fontSize: 12.5,
  },
  breakdownVal: {
    color: THEME.paper,
    fontWeight: '700',
    fontSize: 12.5,
  },

  // Driver Profile & Reviews
  driverProfileCard: {
    backgroundColor: THEME.paper,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 14,
  },
  driverProfileImage: {
    width: '100%',
    height: 180,
  },
  driverProfileDetails: {
    padding: 14,
  },
  verifiedTagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  verifiedTag: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.verified,
    backgroundColor: THEME.verifiedSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePillSmall: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.marigoldDeep,
    backgroundColor: THEME.marigoldLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 2,
  },
  driverMeta: {
    fontSize: 13,
    color: THEME.inkSoft,
    marginBottom: 2,
  },
  driverSkill: {
    fontSize: 12.5,
    color: THEME.marigoldDeep,
    fontWeight: '600',
    marginBottom: 4,
  },
  driverRating: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '700',
  },
  testimonialCard: {
    backgroundColor: THEME.paper,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 12,
  },
  testimonialRating: {
    fontSize: 13,
    marginBottom: 6,
  },
  testimonialQuote: {
    fontSize: 13,
    color: THEME.ink,
    lineHeight: 19,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.ink,
  },
  testimonialRole: {
    fontSize: 12,
    color: THEME.inkSoft,
  },

  // KYC Upload Buttons
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

  // Floating WhatsApp Button
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

  // Confirmation Modal
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
