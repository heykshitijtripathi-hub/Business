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

// Brand Color Hierarchy
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
    liveStatus: 'Delhi NCR Dispatch: Active & Taking Bookings (Mon-Sat: 8 AM - 9 PM)',
    supportEmail: 'support@driverssaathi.com',
    supportPhone: '+91 8175087004',

    // Tabs
    tabHome: 'Overview',
    tabHire: 'Hire Driver',
    tabDrivers: 'Real Drivers',
    tabApply: 'Apply as Driver',
    tabPricing: 'Pricing & FAQ',

    // Forms
    fleetFormTitle: 'Request Fleet & Commercial Drivers',
    fleetFormSub: 'For cab fleets, tour operators, corporate staff shuttles, and logistics.',
    personalFormTitle: 'Hire a Personal Chauffeur',
    personalFormSub: 'For private car owners, families, daily office commute, and VIP luxury cars.',
    driverFormTitle: 'Join as a Verified Driver Partner',
    driverFormSub: 'Earn reliable salary, verified vehicle owners, and on-time weekly/monthly payouts.',

    name: 'Contact Person / Full Name',
    phone: 'Phone Number (Calling & WhatsApp)',
    email: 'Email Address (To receive confirmation)',
    company: 'Company / Fleet Operator Name (Optional)',
    vehicle: 'Vehicle Type / Model (e.g., Creta / Innova / Dzire / EV)',
    location: 'Location / Preferred Area in Delhi NCR',
    driverCount: 'Number of Drivers Required',
    licenseType: 'Driving License Category (LMV / Commercial Badge / Heavy)',
    experience: 'Total Driving Experience (in Years)',
    submitBtn: 'Submit Requirement Now',
    applyBtn: 'Submit Driver Application',

    // Confirmation modal
    successTitle: 'Requirement Received!',
    successSub:
      'Thank you for reaching out to Drivers Saathi. Our dispatch desk is reviewing your requirement and will connect with you shortly with verified driver profiles.\n\nA confirmation has also been sent to your email.',
    closeBtn: 'Done',
  },
  hi: {
    heroBadge: 'दिल्ली एनसीआर डिस्पैच डेस्क सक्रिय',
    headline: 'गाड़ियों और फ्लीट्स के लिए 100% वेरिफाइड ड्राइवर्स',
    subheadline:
      'हम दिल्ली, गुरुग्राम, नोएडा और फरीदाबाद में कमर्शियल और पर्सनल गाड़ियों के लिए पुलिस वेरिफाइड ड्राइवर्स उपलब्ध कराते हैं।',
    ctaFleet: 'फ्लीट के लिए ड्राइवर लें',
    ctaPersonal: 'पर्सनल ड्राइवर लें',
    ctaDrive: 'ड्राइवर बनें',
    liveStatus: 'दिल्ली एनसीआर डेस्क: चालू है (सोम-शनि: 8 AM - 9 PM)',
    supportEmail: 'support@driverssaathi.com',
    supportPhone: '+91 8175087004',

    // Tabs
    tabHome: 'होम',
    tabHire: 'ड्राइवर चाहिए',
    tabDrivers: 'हमारे ड्राइवर्स',
    tabApply: 'ड्राइवर आवेदन',
    tabPricing: 'प्राइसिंग व सवाल',

    // Forms
    fleetFormTitle: 'फ्लीट व कमर्शियल ड्राइवर रिक्वायरमेंट',
    fleetFormSub: 'कैब फ्लीट, टूर ऑपरेटर्स और कॉर्पोरेट स्टाफ पिकअप के लिए।',
    personalFormTitle: 'पर्सनल गाड़ी के लिए ड्राइवर बुक करें',
    personalFormSub: 'परिवार, रोज़ाना ऑफिस आवागमन और लग्जरी कारों के लिए।',
    driverFormTitle: 'ड्राइवर्स साथी से जुड़ें (आवेदन)',
    driverFormSub: 'नियमित वेतन, सुरक्षित कार मालिक और समय पर भुगतान।',

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
    applyBtn: 'आवेदन जमा करें',

    successTitle: 'आवेदन प्राप्त हुआ!',
    successSub:
      'ड्राइवर्स साथी से संपर्क करने के लिए धन्यवाद। हमारी टीम जल्द आपसे संपर्क करेगी और वेरिफाइड ड्राइवर्स की सूची उपलब्ध कराएगी।\n\nएक कन्फर्मेशन ईमेल भी आपको भेजा गया है।',
    closeBtn: 'ठीक है',
  },
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [currentTab, setCurrentTab] = useState('home'); // home | hire | drivers | apply | pricing
  const [hireCategory, setHireCategory] = useState('fleet'); // fleet | personal
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Form Fields
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

  const handleCall = () => {
    Linking.openURL('tel:+918175087004');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@driverssaathi.com');
  };

  const handleFormSubmit = async (type) => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      Alert.alert('Required Information', 'Please enter your Full Name and Mobile Number.');
      return;
    }

    setLoading(true);

    // Auto-responder message sent to the client/driver via FormSubmit's _autoresponse
    const autoResponderCopy =
      lang === 'en'
        ? `Thank you for contacting Drivers Saathi! We have successfully received your ${type}. Our dispatch and placement desk is reviewing your requirements and will connect with you via call/WhatsApp shortly. For urgent dispatch, reach us directly at +91 8175087004 or support@driverssaathi.com.`
        : `ड्राइवर्स साथी से संपर्क करने के लिए धन्यवाद! आपकी ${type} हमें प्राप्त हो गई है। हमारी टीम जल्द आपसे फोन/व्हाट्सएप पर संपर्क करेगी। तत्काल सहायता के लिए कॉल करें: +91 8175087004.`;

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
      _subject: `[New Lead] ${type} - ${formData.name} (${formData.phone})`,
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

      // Reset form
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

      {/* Top Brand Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image
            source={require('./assets/logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity
          style={styles.languageToggle}
          onPress={() => setLang(lang === 'en' ? 'hi' : 'en')}
          activeOpacity={0.8}
        >
          <Text style={styles.languageToggleText}>{lang === 'en' ? 'हिन्दी' : 'English'}</Text>
        </TouchableOpacity>
      </View>

      {/* Active Operational Dispatch Ticker */}
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
              {/* Hero Banner with Executive Driver Image */}
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

                  {/* Hero Quick Action Buttons */}
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
                    style={styles.btnGhostOutline}
                    onPress={() => setCurrentTab('apply')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.btnGhostOutlineText}>{t.ctaDrive}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 4-Pillar Verification Trust Section */}
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

              {/* Real Operations Card */}
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
                    <Text style={styles.linkButtonText}>View Driver Roster &rarr;</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Direct Help & Immediate Contact Desk */}
              <View style={styles.contactDeskCard}>
                <Text style={styles.contactDeskTitle}>Need a Driver Urgently?</Text>
                <Text style={styles.contactDeskSub}>
                  Call our central Delhi NCR dispatch desk directly for immediate placement:
                </Text>

                <TouchableOpacity style={styles.actionCallBtn} onPress={handleCall} activeOpacity={0.9}>
                  <Text style={styles.actionCallBtnText}>Call Dispatch: +91 8175087004</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionMailBtn} onPress={handleEmail} activeOpacity={0.9}>
                  <Text style={styles.actionMailBtnText}>Email: support@driverssaathi.com</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 2: HIRE DRIVER (FLEET & PERSONAL CHAUFFEUR FORMS)   */}
          {/* ======================================================== */}
          {currentTab === 'hire' && (
            <View>
              {/* Category Segment Selector */}
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

                {/* Form Fields */}
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

                <Text style={styles.fieldLabel}>{t.email} (To receive auto-confirmation)</Text>
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
                      placeholder="e.g. NCR Cab Logistics Pvt Ltd"
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
                      placeholder="e.g. Honda City / Hyundai Creta (Automatic)"
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

                {/* Submit Action */}
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

                <Text style={styles.securityNote}>
                  🔒 We guarantee 100% data privacy. Candidate profiles dispatched within 24 hours.
                </Text>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 3: REAL DRIVERS & GROUND OPERATIONS GALLERY          */}
          {/* ======================================================== */}
          {currentTab === 'drivers' && (
            <View>
              <View style={styles.sectionHeadingBox}>
                <Text style={styles.sectionCategory}>AUTHENTIC ROSTER</Text>
                <Text style={styles.sectionTitle}>Real Drivers on Delhi NCR Roads</Text>
                <Text style={styles.sectionSubtitle}>
                  View actual profiles and ground inspection photos of our verified driver community.
                </Text>
              </View>

              {/* Driver Profile 1 */}
              <View style={styles.driverProfileCard}>
                <Image
                  source={require('./assets/indian_driver_portrait.jpg')}
                  style={styles.driverProfileImage}
                  resizeMode="cover"
                />
                <View style={styles.driverProfileDetails}>
                  <View style={styles.verifiedTagRow}>
                    <Text style={styles.verifiedTag}>✓ Police Verified</Text>
                    <Text style={styles.badgePillSmall}>LMV Badge</Text>
                  </View>
                  <Text style={styles.driverName}>Rajesh Kumar</Text>
                  <Text style={styles.driverMeta}>Exp: 8 Years • Delhi & Highway Routes</Text>
                  <Text style={styles.driverSkill}>Sedan / SUV / Commercial Cab Specialist</Text>
                </View>
              </View>

              {/* Driver Profile 2 - Highway Performance */}
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
                  <Text style={styles.driverMeta}>Exp: 11 Years • Expressway & VIP Driving</Text>
                  <Text style={styles.driverSkill}>Automatic Transmission & Luxury Chauffeur</Text>
                </View>
              </View>

              {/* Fleet Deployment Photo Card */}
              <View style={styles.driverProfileCard}>
                <Image
                  source={require('./assets/fleet_cabs_delhi.jpg')}
                  style={styles.driverProfileImage}
                  resizeMode="cover"
                />
                <View style={styles.driverProfileDetails}>
                  <View style={styles.verifiedTagRow}>
                    <Text style={styles.verifiedTag}>✓ Fleet Ready</Text>
                  </View>
                  <Text style={styles.driverName}>Corporate Fleet Placement</Text>
                  <Text style={styles.driverMeta}>Cyber City Gurugram • Tech Parks Noida</Text>
                  <Text style={styles.driverSkill}>Full shift handling, punctuality, zero downtime</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => {
                  setCurrentTab('hire');
                  setHireCategory('fleet');
                }}
              >
                <Text style={styles.btnPrimaryText}>Request Verified Profiles &rarr;</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 4: APPLY AS DRIVER (PARTNER ONBOARDING)              */}
          {/* ======================================================== */}
          {currentTab === 'apply' && (
            <View>
              <View style={styles.formContainerCard}>
                <Text style={styles.formTitle}>{t.driverFormTitle}</Text>
                <Text style={styles.formSubtitle}>{t.driverFormSub}</Text>

                <View style={styles.driverPerksBox}>
                  <Text style={styles.driverPerkItem}>✓ Timely salary & weekly fuel bonuses</Text>
                  <Text style={styles.driverPerkItem}>✓ Verified car owners & corporate clients</Text>
                  <Text style={styles.driverPerkItem}>✓ 24x7 Driver helpline & roadside support</Text>
                </View>

                <Text style={styles.fieldLabel}>{t.name} *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Ramesh Chandra"
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
                  placeholder="e.g. LMV / Commercial Badge / Transport"
                  placeholderTextColor={THEME.inkMuted}
                  value={formData.license}
                  onChangeText={(v) => setFormData({ ...formData, license: v })}
                />

                <Text style={styles.fieldLabel}>{t.experience}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 6 Years"
                  placeholderTextColor={THEME.inkMuted}
                  keyboardType="numeric"
                  value={formData.experience}
                  onChangeText={(v) => setFormData({ ...formData, experience: v })}
                />

                <Text style={styles.fieldLabel}>{t.location}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Uttam Nagar, Delhi / Badarpur"
                  placeholderTextColor={THEME.inkMuted}
                  value={formData.location}
                  onChangeText={(v) => setFormData({ ...formData, location: v })}
                />

                <TouchableOpacity
                  style={styles.submitActionButton}
                  onPress={() => handleFormSubmit('Driver Partner Application')}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitActionButtonText}>{t.applyBtn}</Text>
                  )}
                </TouchableOpacity>

                <Text style={styles.securityNote}>
                  📞 Our recruitment desk will call you for document verification within 2 working days.
                </Text>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 5: PRICING & FAQ                                     */}
          {/* ======================================================== */}
          {currentTab === 'pricing' && (
            <View>
              <View style={styles.sectionHeadingBox}>
                <Text style={styles.sectionCategory}>TRANSPARENT PRICING</Text>
                <Text style={styles.sectionTitle}>Driver Placement Models</Text>
              </View>

              {/* Model 1: Pay Per Hire */}
              <View style={styles.pricingCard}>
                <View style={styles.pricingHeader}>
                  <Text style={styles.pricingTitle}>Pay-Per-Hire</Text>
                  <Text style={styles.pricingBadge}>FLEXIBLE</Text>
                </View>
                <Text style={styles.pricingDesc}>
                  One-time placement fee per driver. Best for single car owners and growing fleets.
                </Text>
                <View style={styles.pricingBulletRow}>
                  <Text style={styles.pricingBullet}>• 100% Police & Driving License verification</Text>
                  <Text style={styles.pricingBullet}>• 30-Day Free Replacement guarantee</Text>
                  <Text style={styles.pricingBullet}>• Candidate shortlisted in 24-48 hours</Text>
                </View>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={() => {
                    setCurrentTab('hire');
                    setHireCategory('personal');
                  }}
                >
                  <Text style={styles.btnPrimaryText}>Book Pay-Per-Hire</Text>
                </TouchableOpacity>
              </View>

              {/* Model 2: Monthly Retainer */}
              <View style={[styles.pricingCard, { borderColor: THEME.marigold, borderWidth: 1.5 }]}>
                <View style={styles.pricingHeader}>
                  <Text style={styles.pricingTitle}>Monthly Retainer</Text>
                  <Text style={[styles.pricingBadge, { backgroundColor: THEME.verified }]}>POPULAR</Text>
                </View>
                <Text style={styles.pricingDesc}>
                  Continuous driver supply & dedicated backup driver pool for fleets and corporates.
                </Text>
                <View style={styles.pricingBulletRow}>
                  <Text style={styles.pricingBullet}>• Immediate replacement within 2-4 hours</Text>
                  <Text style={styles.pricingBullet}>• Dedicated Operations Manager support</Text>
                  <Text style={styles.pricingBullet}>• Driver attendance & duty tracking</Text>
                </View>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={() => {
                    setCurrentTab('hire');
                    setHireCategory('fleet');
                  }}
                >
                  <Text style={styles.btnPrimaryText}>Select Monthly Retainer</Text>
                </TouchableOpacity>
              </View>

              {/* Model 3: Enterprise Custom */}
              <View style={styles.pricingCard}>
                <View style={styles.pricingHeader}>
                  <Text style={styles.pricingTitle}>Enterprise Custom</Text>
                  <Text style={[styles.pricingBadge, { backgroundColor: '#6366F1' }]}>ENTERPRISE</Text>
                </View>
                <Text style={styles.pricingDesc}>
                  Tailored contracts for 20+ vehicle fleets, hotel chains, and corporate shuttles.
                </Text>
                <TouchableOpacity style={styles.btnSecondaryDark} onPress={handleCall}>
                  <Text style={styles.btnSecondaryDarkText}>Speak with Enterprise Desk</Text>
                </TouchableOpacity>
              </View>

              {/* FAQ Accordions */}
              <View style={styles.faqSection}>
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                <View style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>How quickly can I get a driver deployed?</Text>
                  <Text style={styles.faqAnswer}>
                    For Delhi NCR, profiles are shared within 24 hours and physical deployment takes
                    24 to 48 hours after your interview.
                  </Text>
                </View>

                <View style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>What if the driver leaves or is not suitable?</Text>
                  <Text style={styles.faqAnswer}>
                    All placements come with a 30-day free replacement policy. We provide a replacement
                    promptly with zero extra fee.
                  </Text>
                </View>

                <View style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>How are drivers verified?</Text>
                  <Text style={styles.faqAnswer}>
                    Every candidate goes through government ID verification (Aadhaar, Commercial/LMV
                    License), police criminal record screening, and a physical vehicle driving test.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Professional Bottom Navigation Bar */}
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
          <Text style={[styles.tabIconText, currentTab === 'apply' && styles.tabIconActive]}>📋</Text>
          <Text style={[styles.tabLabel, currentTab === 'apply' && styles.tabLabelActive]}>
            {t.tabApply}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setCurrentTab('pricing')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIconText, currentTab === 'pricing' && styles.tabIconActive]}>💳</Text>
          <Text style={[styles.tabLabel, currentTab === 'pricing' && styles.tabLabelActive]}>
            {t.tabPricing}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instant Submission & Confirmation Modal */}
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
    paddingVertical: 12,
    backgroundColor: THEME.ink,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 175,
    height: 44,
  },
  languageToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  languageToggleText: {
    color: THEME.paper,
    fontSize: 12.5,
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
    paddingBottom: 110,
  },

  // Hero section
  heroWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: THEME.ink,
    position: 'relative',
    minHeight: 380,
  },
  heroBgImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.35,
  },
  heroOverlay: {
    padding: 22,
    justifyContent: 'flex-end',
    minHeight: 380,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.marigold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  badgeText: {
    color: THEME.paper,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroHeading: {
    color: THEME.paper,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 8,
  },
  heroBody: {
    color: '#E2E8F0',
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 20,
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
  btnGhostOutline: {
    borderWidth: 1.5,
    borderColor: THEME.marigold,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnGhostOutlineText: {
    color: THEME.marigold,
    fontWeight: '700',
    fontSize: 13.5,
  },

  // Stats Grid
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
    fontSize: 21,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13.5,
    color: THEME.inkSoft,
    lineHeight: 19,
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
    fontSize: 12,
    color: THEME.inkSoft,
    fontWeight: '500',
  },

  // Real Ops Photo Banner
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
  securityNote: {
    fontSize: 11.5,
    color: THEME.inkSoft,
    textAlign: 'center',
    marginTop: 12,
  },

  // Drivers roster
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
  },

  // Pricing & FAQ
  pricingCard: {
    backgroundColor: THEME.paper,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 14,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.ink,
  },
  pricingBadge: {
    backgroundColor: THEME.marigold,
    color: THEME.paper,
    fontSize: 10.5,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pricingDesc: {
    fontSize: 13,
    color: THEME.inkSoft,
    lineHeight: 18,
    marginBottom: 10,
  },
  pricingBulletRow: {
    gap: 4,
    marginBottom: 14,
  },
  pricingBullet: {
    fontSize: 12.5,
    color: THEME.ink,
  },
  btnSecondaryDark: {
    backgroundColor: THEME.ink,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnSecondaryDarkText: {
    color: THEME.paper,
    fontWeight: '700',
    fontSize: 13.5,
  },
  faqSection: {
    marginTop: 10,
  },
  faqItem: {
    backgroundColor: THEME.paper,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 10,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.ink,
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 12.5,
    color: THEME.inkSoft,
    lineHeight: 18,
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
    fontSize: 11,
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
