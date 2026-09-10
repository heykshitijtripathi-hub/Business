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

// Executive Color Hierarchy
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
  purple: '#7C3AED',
  purpleSoft: '#F5F3FF',
};

// Highway Routes Database
const ROUTES_DB = [
  {
    id: 'agra',
    name: 'Delhi ⇄ Agra (Yamuna Expressway)',
    distance: '210 km (One-way)',
    toll: '₹415 One-way / ₹665 Return',
    driverDA: '₹400 Night Halt DA',
    rate: '₹1,500 / Day',
  },
  {
    id: 'jaipur',
    name: 'Delhi ⇄ Jaipur (Delhi-Mumbai Expy)',
    distance: '270 km (One-way)',
    toll: '₹590 (Sohna-Dausa)',
    driverDA: '₹500 Night Halt DA',
    rate: '₹1,800 / Day',
  },
  {
    id: 'chandigarh',
    name: 'Delhi ⇄ Chandigarh (NH-44)',
    distance: '250 km (One-way)',
    toll: '₹390 Toll Plaza Total',
    driverDA: '₹400 Night Halt DA',
    rate: '₹1,600 / Day',
  },
  {
    id: 'dehradun',
    name: 'Delhi ⇄ Dehradun / Rishikesh',
    distance: '260 km (One-way)',
    toll: '₹310 (Meerut Expy)',
    driverDA: '₹500 Night Halt DA',
    rate: '₹1,800 / Day',
  },
];

export default function App() {
  const [lang, setLang] = useState('en'); // 'en' | 'hi'
  // Current Portal Mode: null (Selector) | 'personal' | 'fleet' | 'outstation' | 'verify' | 'driver'
  const [userRole, setUserRole] = useState(null);

  // Subtabs per portal
  const [personalSubTab, setPersonalSubTab] = useState('book'); // book | logbook | replace
  const [fleetSubTab, setFleetSubTab] = useState('retainer'); // retainer | request | gst
  const [driverSubTab, setDriverSubTab] = useState('kyc'); // kyc | jobs | refer

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Selected Outstation Route
  const [selectedRoute, setSelectedRoute] = useState(ROUTES_DB[0]);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    gstin: '',
    vehicle: '',
    location: '',
    count: '1',
    tripDate: '',
    destination: '',
    license: '',
    experience: '',
    replaceReason: '',
    referralName: '',
    referralPhone: '',
    verifyDriverDL: '',
    verifyDriverAadhaar: '',
  });

  // KYC Image Pickers
  const [licenseImg, setLicenseImg] = useState(null);
  const [aadhaarImg, setAadhaarImg] = useState(null);

  // Digital Duty Logbook State
  const [logEntries, setLogEntries] = useState([]);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logInTime, setLogInTime] = useState('09:00 AM');
  const [logOutTime, setLogOutTime] = useState('07:30 PM');
  const [logKm, setLogKm] = useState('45');
  const [logOT, setLogOT] = useState('1.5');

  // Load saved data
  useEffect(() => {
    (async () => {
      try {
        const savedRole = await AsyncStorage.getItem('@user_selected_role_v3');
        if (savedRole) setUserRole(savedRole);

        const savedLogs = await AsyncStorage.getItem('@duty_logs_v5');
        if (savedLogs) setLogEntries(JSON.parse(savedLogs));
        else {
          setLogEntries([
            { id: '1', date: '2026-09-08', in: '09:00 AM', out: '07:30 PM', km: '62 km', ot: '1.5 hrs' },
            { id: '2', date: '2026-09-09', in: '08:45 AM', out: '08:00 PM', km: '84 km', ot: '2.0 hrs' },
          ]);
        }
      } catch (e) {}
    })();
  }, []);

  const selectRole = async (role) => {
    setUserRole(role);
    await AsyncStorage.setItem('@user_selected_role_v3', role);
  };

  const switchRole = async () => {
    setUserRole(null);
    await AsyncStorage.removeItem('@user_selected_role_v3');
  };

  const openWhatsApp = (prefilled = '') => {
    const text =
      prefilled ||
      (lang === 'en'
        ? 'Hello Drivers Saathi! I need a verified driver in Delhi NCR. Please share details and pricing.'
        : 'नमस्ते ड्राइवर्स साथी! मुझे दिल्ली एनसीआर में वेरिफाइड ड्राइवर की आवश्यकता है। कृपया जानकारी दें।');
    Linking.openURL(`https://wa.me/918175087004?text=${encodeURIComponent(text)}`);
  };

  const handleCall = () => {
    Linking.openURL('tel:+918175087004');
  };

  const handleSOS = () => {
    Alert.alert(
      'Roadside & Dispatch SOS',
      'Emergency roadside assistance & live dispatch hotline for Delhi NCR drivers and passengers.\n\nHelpline: +91 8175087004',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call SOS Helpline', onPress: handleCall },
      ]
    );
  };

  const pickDoc = async (type) => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });
      if (!res.canceled && res.assets[0]) {
        if (type === 'license') setLicenseImg(res.assets[0].uri);
        else setAadhaarImg(res.assets[0].uri);
        Alert.alert('Attached', `${type === 'license' ? 'Driving License' : 'Aadhaar Card'} attached successfully.`);
      }
    } catch (e) {}
  };

  const saveDutyLog = async () => {
    if (!logInTime || !logOutTime) {
      Alert.alert('Incomplete Entry', 'Please enter check-in and check-out times.');
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
    await AsyncStorage.setItem('@duty_logs_v5', JSON.stringify(updated));
    Alert.alert('Duty Saved', `Recorded duty for ${logDate} with ${logOT} hrs overtime.`);
  };

  const handleFormSubmit = async (type, pricingInfo = '') => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      Alert.alert('Required Information', 'Please enter Full Name and Phone Number.');
      return;
    }
    setLoading(true);

    const autoResp =
      lang === 'en'
        ? `Thank you for contacting Drivers Saathi! We have received your ${type}. Our account manager is reviewing your requirements and will connect with you within 1 business day. For urgent inquiries, call +91 8175087004 or write to support@driverssaathi.com.`
        : `ड्राइवर्स साथी से संपर्क करने के लिए धन्यवाद! आपकी ${type} हमें मिल गई है। हमारी टीम जल्द आपसे संपर्क करेगी। सहायता: +91 8175087004.`;

    const payload = {
      Category: type,
      'Package Details': pricingInfo || 'Standard Service',
      Name: formData.name,
      'Phone Number': formData.phone,
      Email: formData.email || 'Not Provided',
      Company: formData.company || 'Individual / Personal',
      GSTIN: formData.gstin || 'N/A',
      'Vehicle Model': formData.vehicle || 'Not specified',
      'Location / Zone': formData.location || 'Delhi NCR',
      'Drivers Count': formData.count || '1',
      'Trip Date': formData.tripDate || 'N/A',
      Destination: formData.destination || 'Delhi NCR',
      'DL to Verify': formData.verifyDriverDL || 'N/A',
      'Aadhaar to Verify': formData.verifyDriverAadhaar || 'N/A',
      'Replacement Reason': formData.replaceReason || 'N/A',
      'Referred Driver Name': formData.referralName || 'N/A',
      'Referred Driver Phone': formData.referralPhone || 'N/A',
      'License Attached': licenseImg ? 'Yes' : 'Pending',
      'Aadhaar Attached': aadhaarImg ? 'Yes' : 'Pending',
      _subject: `[Revenue Lead Alert] ${type} - ${formData.name} (${formData.phone})`,
      _autoresponse: autoResp,
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

      setModalMessage(
        lang === 'en'
          ? 'Thank you! Your request has been delivered to support@driverssaathi.com. Our account manager will contact you within 1 business day to confirm booking & invoice details.\n\nA confirmation copy has been emailed to you.'
          : 'धन्यवाद! आपकी रिक्वेस्ट दर्ज कर ली गई है। हमारी टीम आपसे जल्द संपर्क करेगी।'
      );
      setModalVisible(true);

      setFormData({
        name: '',
        phone: '',
        email: '',
        company: '',
        gstin: '',
        vehicle: '',
        location: '',
        count: '1',
        tripDate: '',
        destination: '',
        license: '',
        experience: '',
        replaceReason: '',
        referralName: '',
        referralPhone: '',
        verifyDriverDL: '',
        verifyDriverAadhaar: '',
      });
      setLicenseImg(null);
      setAadhaarImg(null);
    } catch (e) {
      setModalMessage('Your request has been recorded. Our team will contact you shortly.');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar style="light" backgroundColor={THEME.ink} />

      {/* Global Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image
            source={require('./assets/logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerRightButtons}>
          {userRole && (
            <TouchableOpacity style={styles.roleSwitchBtn} onPress={switchRole} activeOpacity={0.8}>
              <Text style={styles.roleSwitchBtnText}>Switch Portal</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.sosButton} onPress={handleSOS} activeOpacity={0.8}>
            <Text style={styles.sosButtonText}>SOS Hotline</Text>
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

      {/* Ticker */}
      <View style={styles.liveTicker}>
        <View style={styles.livePulse} />
        <Text style={styles.liveTickerText}>
          {lang === 'en'
            ? 'Delhi NCR Dispatch Desk: Active & Verified (Mon-Sat: 8 AM - 9 PM)'
            : 'दिल्ली एनसीआर डिस्पैच डेस्क: सक्रिय व वेरिफाइड (सोम-शनि: 8 AM - 9 PM)'}
        </Text>
      </View>

      {/* ======================================================== */}
      {/* REVENUE PORTAL SELECTOR (5 COMMERCIAL PATHWAYS)         */}
      {/* ======================================================== */}
      {!userRole ? (
        <ScrollView contentContainerStyle={styles.welcomeScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeHero}>
            <Text style={styles.welcomeBadge}>BUSINESS & SERVICE PORTALS</Text>
            <Text style={styles.welcomeTitle}>
              {lang === 'en' ? 'Drivers Saathi Platform' : 'ड्राइवर्स साथी प्लेटफॉर्म'}
            </Text>
            <Text style={styles.welcomeSub}>
              {lang === 'en'
                ? 'Select your service requirement below to view pricing, book drivers, or request background verifications.'
                : 'अपनी आवश्यकता अनुसार सर्विस पोर्टल चुनें।'}
            </Text>
          </View>

          {/* Revenue Stream 1: Personal Car Owner (Pay-Per-Hire ₹4,500) */}
          <TouchableOpacity
            style={[styles.portalSelectCard, { borderColor: '#FDBA74' }]}
            onPress={() => selectRole('personal')}
            activeOpacity={0.88}
          >
            <View style={styles.portalIconBox}>
              <Text style={styles.portalTagText}>REVENUE M1</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titlePriceRow}>
                <Text style={styles.portalCardTitle}>1. Personal Chauffeur Placement</Text>
                <Text style={styles.priceTag}>₹4,500 Fee</Text>
              </View>
              <Text style={styles.portalCardSub}>
                Full-time police-verified chauffeur for private car & daily office commute. Includes 30-day replacement warranty.
              </Text>
            </View>
            <Text style={styles.portalArrow}>&rarr;</Text>
          </TouchableOpacity>

          {/* Revenue Stream 2: Corporate Retainer (₹1,500-₹2,500/slot/mo) */}
          <TouchableOpacity
            style={[styles.portalSelectCard, { borderColor: '#93C5FD' }]}
            onPress={() => selectRole('fleet')}
            activeOpacity={0.88}
          >
            <View style={[styles.portalIconBox, { backgroundColor: THEME.blueSoft }]}>
              <Text style={[styles.portalTagText, { color: THEME.blue }]}>REVENUE M2</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titlePriceRow}>
                <Text style={styles.portalCardTitle}>2. Corporate Fleet Retainer</Text>
                <Text style={[styles.priceTag, { color: THEME.blue }]}>B2B Contract</Text>
              </View>
              <Text style={styles.portalCardSub}>
                Bulk commercial drivers for cab fleets, staff shuttles & corporate offices. Dedicated backup pool & GST invoices.
              </Text>
            </View>
            <Text style={styles.portalArrow}>&rarr;</Text>
          </TouchableOpacity>

          {/* Revenue Stream 3: Outstation Commission (₹1,500/day + DA) */}
          <TouchableOpacity
            style={[styles.portalSelectCard, { borderColor: '#A7F3D0' }]}
            onPress={() => selectRole('outstation')}
            activeOpacity={0.88}
          >
            <View style={[styles.portalIconBox, { backgroundColor: THEME.verifiedSoft }]}>
              <Text style={[styles.portalTagText, { color: THEME.verified }]}>REVENUE M3</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titlePriceRow}>
                <Text style={styles.portalCardTitle}>3. Outstation & 1-Day Driver</Text>
                <Text style={[styles.priceTag, { color: THEME.verified }]}>₹1,500/Day</Text>
              </View>
              <Text style={styles.portalCardSub}>
                1-Day highway driver for Agra, Jaipur, Chandigarh, weekend getaways or airport drops. Clear FASTag toll guide.
              </Text>
            </View>
            <Text style={styles.portalArrow}>&rarr;</Text>
          </TouchableOpacity>

          {/* Revenue Stream 4: Standalone Driver Verification Package (₹1,200) */}
          <TouchableOpacity
            style={[styles.portalSelectCard, { borderColor: '#FDE68A' }]}
            onPress={() => selectRole('verify')}
            activeOpacity={0.88}
          >
            <View style={[styles.portalIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.portalTagText, { color: '#B45309' }]}>REVENUE M4</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titlePriceRow}>
                <Text style={styles.portalCardTitle}>4. Driver Background Verification</Text>
                <Text style={[styles.priceTag, { color: '#B45309' }]}>₹1,200 / Check</Text>
              </View>
              <Text style={styles.portalCardSub}>
                Verify your existing driver: Aadhaar ID, Driving License validity, police criminal screening & road driving audit.
              </Text>
            </View>
            <Text style={styles.portalArrow}>&rarr;</Text>
          </TouchableOpacity>

          {/* Path 5: Driver Partner Recruitment */}
          <TouchableOpacity
            style={[styles.portalSelectCard, { borderColor: '#DDD6FE' }]}
            onPress={() => selectRole('driver')}
            activeOpacity={0.88}
          >
            <View style={[styles.portalIconBox, { backgroundColor: '#F5F3FF' }]}>
              <Text style={[styles.portalTagText, { color: '#7C3AED' }]}>JOBS</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.portalCardTitle}>5. Driver Partner Application</Text>
              <Text style={styles.portalCardSub}>
                Join as a verified driver. Upload KYC documents, browse high-salary Delhi NCR driving jobs & earn referral bonuses.
              </Text>
            </View>
            <Text style={styles.portalArrow}>&rarr;</Text>
          </TouchableOpacity>

          <View style={styles.welcomeHelplineBox}>
            <Text style={styles.welcomeHelplineTitle}>Need immediate assistance from our account desk?</Text>
            <TouchableOpacity style={styles.actionCallBtn} onPress={handleCall} activeOpacity={0.9}>
              <Text style={styles.actionCallBtnText}>Call Dispatch Desk: +91 8175087004</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        /* ======================================================== */
        /* ACTIVE PORTAL DASHBOARDS                                 */
        /* ======================================================== */
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
            {/* ------------------------------------------------------ */}
            {/* PORTAL 1: PERSONAL CHAUFFEUR (PAY-PER-HIRE MODEL)      */}
            {/* ------------------------------------------------------ */}
            {userRole === 'personal' && (
              <View>
                <View style={styles.portalHeaderBox}>
                  <Text style={styles.portalTag}>REVENUE MODEL 1 • PAY-PER-HIRE</Text>
                  <Text style={styles.portalHeading}>Personal Chauffeur Placement</Text>
                </View>

                <View style={styles.segmentContainer}>
                  <TouchableOpacity
                    style={[styles.segmentBtn, personalSubTab === 'book' && styles.segmentBtnActive]}
                    onPress={() => setPersonalSubTab('book')}
                  >
                    <Text style={[styles.segmentBtnText, personalSubTab === 'book' && styles.segmentBtnTextActive]}>
                      Hire Chauffeur
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.segmentBtn, personalSubTab === 'logbook' && styles.segmentBtnActive]}
                    onPress={() => setPersonalSubTab('logbook')}
                  >
                    <Text style={[styles.segmentBtnText, personalSubTab === 'logbook' && styles.segmentBtnTextActive]}>
                      Duty Log & OT
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.segmentBtn, personalSubTab === 'replace' && styles.segmentBtnActive]}
                    onPress={() => setPersonalSubTab('replace')}
                  >
                    <Text style={[styles.segmentBtnText, personalSubTab === 'replace' && styles.segmentBtnTextActive]}>
                      30-Day Warranty
                    </Text>
                  </TouchableOpacity>
                </View>

                {personalSubTab === 'book' && (
                  <View style={styles.formContainerCard}>
                    <View style={styles.priceHeaderCard}>
                      <Text style={styles.priceHeaderTitle}>Pay-Per-Hire Placement Package</Text>
                      <Text style={styles.priceHeaderAmount}>₹4,500 One-time Fee</Text>
                      <Text style={styles.priceHeaderSub}>Includes Police Clearance & 30-Day Free Driver Replacement Warranty</Text>
                    </View>

                    <Text style={styles.fieldLabel}>Your Full Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Priya Sharma"
                      value={formData.name}
                      onChangeText={(v) => setFormData({ ...formData, name: v })}
                    />

                    <Text style={styles.fieldLabel}>Phone Number *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="+91 81750 87004"
                      keyboardType="phone-pad"
                      value={formData.phone}
                      onChangeText={(v) => setFormData({ ...formData, phone: v })}
                    />

                    <Text style={styles.fieldLabel}>Email Address (To receive placement contract)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. name@example.com"
                      keyboardType="email-address"
                      value={formData.email}
                      onChangeText={(v) => setFormData({ ...formData, email: v })}
                    />

                    <Text style={styles.fieldLabel}>Car Model & Transmission</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Honda City / Hyundai Creta (Automatic)"
                      value={formData.vehicle}
                      onChangeText={(v) => setFormData({ ...formData, vehicle: v })}
                    />

                    <Text style={styles.fieldLabel}>Residence Area in Delhi NCR</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. South Delhi / DLF Phase 5 Gurugram"
                      value={formData.location}
                      onChangeText={(v) => setFormData({ ...formData, location: v })}
                    />

                    <TouchableOpacity
                      style={styles.submitActionButton}
                      onPress={() => handleFormSubmit('Personal Chauffeur Placement (Pay-Per-Hire ₹4,500)', 'One-time ₹4,500 Placement Fee')}
                      disabled={loading}
                    >
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Book Personal Chauffeur (₹4,500)</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnWhatsAppOutline}
                      onPress={() => openWhatsApp(`Hello Drivers Saathi, I want to book a personal chauffeur (Pay-Per-Hire ₹4,500) for my car in ${formData.location || 'Delhi NCR'}.`)}
                    >
                      <Text style={styles.btnWhatsAppOutlineText}>💬 Inquire via WhatsApp</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {personalSubTab === 'logbook' && (
                  <View>
                    <View style={styles.logCard}>
                      <Text style={styles.logCardTitle}>Record Daily Driver Duty & OT</Text>
                      <View style={styles.logInputRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.miniLabel}>Date</Text>
                          <TextInput style={styles.miniInput} value={logDate} onChangeText={setLogDate} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.miniLabel}>In</Text>
                          <TextInput style={styles.miniInput} value={logInTime} onChangeText={setLogInTime} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.miniLabel}>Out</Text>
                          <TextInput style={styles.miniInput} value={logOutTime} onChangeText={setLogOutTime} />
                        </View>
                      </View>
                      <View style={styles.logInputRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.miniLabel}>Distance (Km)</Text>
                          <TextInput style={styles.miniInput} value={logKm} onChangeText={setLogKm} keyboardType="numeric" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.miniLabel}>OT (Hours)</Text>
                          <TextInput style={styles.miniInput} value={logOT} onChangeText={setLogOT} keyboardType="numeric" />
                        </View>
                      </View>
                      <TouchableOpacity style={styles.btnLogSave} onPress={saveDutyLog}>
                        <Text style={styles.btnLogSaveText}>Save Duty Entry</Text>
                      </TouchableOpacity>
                    </View>

                    {logEntries.map((e) => (
                      <View key={e.id} style={styles.logEntryCard}>
                        <View style={styles.logEntryTop}>
                          <Text style={styles.logEntryDate}>{e.date}</Text>
                          <Text style={styles.logEntryOT}>+{e.ot} OT</Text>
                        </View>
                        <Text style={styles.logEntryMeta}>In: {e.in} • Out: {e.out} • {e.km}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {personalSubTab === 'replace' && (
                  <View style={styles.formContainerCard}>
                    <Text style={styles.formTitle}>30-Day Free Driver Replacement Claim</Text>
                    <Text style={styles.formSubtitle}>Priority SLA portal for active clients. Zero extra placement fee.</Text>

                    <Text style={styles.fieldLabel}>Client Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Name on original placement invoice"
                      value={formData.name}
                      onChangeText={(v) => setFormData({ ...formData, name: v })}
                    />

                    <Text style={styles.fieldLabel}>Phone Number *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="+91 81750 87004"
                      keyboardType="phone-pad"
                      value={formData.phone}
                      onChangeText={(v) => setFormData({ ...formData, phone: v })}
                    />

                    <Text style={styles.fieldLabel}>Reason for Replacement *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Driver left job / Punctuality / Route knowledge"
                      value={formData.replaceReason}
                      onChangeText={(v) => setFormData({ ...formData, replaceReason: v })}
                    />

                    <TouchableOpacity
                      style={styles.submitActionButton}
                      onPress={() => handleFormSubmit('30-Day Free Driver Replacement Claim')}
                      disabled={loading}
                    >
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Submit Priority Replacement Claim</Text>}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* ------------------------------------------------------ */}
            {/* PORTAL 2: CORPORATE FLEET RETAINER MODEL               */}
            {/* ------------------------------------------------------ */}
            {userRole === 'fleet' && (
              <View>
                <View style={styles.portalHeaderBox}>
                  <Text style={styles.portalTag}>REVENUE MODEL 2 • MONTHLY RETAINER</Text>
                  <Text style={styles.portalHeading}>Corporate Fleet Retainer Hub</Text>
                </View>

                <View style={styles.segmentContainer}>
                  <TouchableOpacity
                    style={[styles.segmentBtn, fleetSubTab === 'retainer' && styles.segmentBtnActive]}
                    onPress={() => setFleetSubTab('retainer')}
                  >
                    <Text style={[styles.segmentBtnText, fleetSubTab === 'retainer' && styles.segmentBtnTextActive]}>
                      Retainer Contract
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.segmentBtn, fleetSubTab === 'request' && styles.segmentBtnActive]}
                    onPress={() => setFleetSubTab('request')}
                  >
                    <Text style={[styles.segmentBtnText, fleetSubTab === 'request' && styles.segmentBtnTextActive]}>
                      Fleet Request
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.segmentBtn, fleetSubTab === 'gst' && styles.segmentBtnActive]}
                    onPress={() => setFleetSubTab('gst')}
                  >
                    <Text style={[styles.segmentBtnText, fleetSubTab === 'gst' && styles.segmentBtnTextActive]}>
                      GST Invoicing
                    </Text>
                  </TouchableOpacity>
                </View>

                {fleetSubTab === 'retainer' && (
                  <View>
                    <View style={styles.pricingCard}>
                      <Text style={styles.pricingTitle}>Corporate Monthly Retainer</Text>
                      <Text style={styles.priceHeaderAmount}>₹1,800 / Driver Slot / Month</Text>
                      <Text style={styles.pricingDesc}>
                        Continuous driver supply & dedicated backup pool. Guaranteed replacement within 2-4 hours with zero operational downtime.
                      </Text>
                      <TouchableOpacity style={styles.btnPrimary} onPress={() => setFleetSubTab('request')}>
                        <Text style={styles.btnPrimaryText}>Contract Retainer Plan</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.pricingCard}>
                      <Text style={styles.pricingTitle}>One-time Fleet Placement</Text>
                      <Text style={styles.priceHeaderAmount}>₹4,000 / Commercial Placement</Text>
                      <Text style={styles.pricingDesc}>Bulk commercial driver onboarding for cab fleets and tour operators.</Text>
                      <TouchableOpacity style={styles.btnPrimary} onPress={() => setFleetSubTab('request')}>
                        <Text style={styles.btnPrimaryText}>Request Commercial Drivers</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {fleetSubTab === 'request' && (
                  <View style={styles.formContainerCard}>
                    <Text style={styles.formTitle}>Corporate Fleet Requirement</Text>
                    <Text style={styles.formSubtitle}>For cab fleets, corporate staff shuttles & logistics operators.</Text>

                    <Text style={styles.fieldLabel}>Contact Person *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Amit Verma"
                      value={formData.name}
                      onChangeText={(v) => setFormData({ ...formData, name: v })}
                    />

                    <Text style={styles.fieldLabel}>Mobile Number *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="+91 81750 87004"
                      keyboardType="phone-pad"
                      value={formData.phone}
                      onChangeText={(v) => setFormData({ ...formData, phone: v })}
                    />

                    <Text style={styles.fieldLabel}>Company / Fleet Name</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. NCR Fleet Logistics"
                      value={formData.company}
                      onChangeText={(v) => setFormData({ ...formData, company: v })}
                    />

                    <Text style={styles.fieldLabel}>Number of Drivers Needed</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 5 Drivers"
                      keyboardType="numeric"
                      value={formData.count}
                      onChangeText={(v) => setFormData({ ...formData, count: v })}
                    />

                    <TouchableOpacity
                      style={styles.submitActionButton}
                      onPress={() => handleFormSubmit('Corporate Fleet Placement Request', 'Monthly Retainer B2B Contract')}
                      disabled={loading}
                    >
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Submit Fleet Contract Request</Text>}
                    </TouchableOpacity>
                  </View>
                )}

                {fleetSubTab === 'gst' && (
                  <View style={styles.formContainerCard}>
                    <Text style={styles.formTitle}>Request Corporate GST Invoice</Text>
                    <Text style={styles.formSubtitle}>Submit GSTIN details to receive input tax credit invoices.</Text>

                    <Text style={styles.fieldLabel}>Registered Company Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Company Name"
                      value={formData.company}
                      onChangeText={(v) => setFormData({ ...formData, company: v })}
                    />

                    <Text style={styles.fieldLabel}>Company GSTIN *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 07AAAAA0000A1Z5"
                      autoCapitalize="characters"
                      value={formData.gstin}
                      onChangeText={(v) => setFormData({ ...formData, gstin: v })}
                    />

                    <Text style={styles.fieldLabel}>Accounts Phone Number *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="+91 81750 87004"
                      keyboardType="phone-pad"
                      value={formData.phone}
                      onChangeText={(v) => setFormData({ ...formData, phone: v })}
                    />

                    <TouchableOpacity
                      style={styles.submitActionButton}
                      onPress={() => handleFormSubmit('Corporate GST Invoice Request')}
                      disabled={loading}
                    >
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Request GST Invoice</Text>}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* ------------------------------------------------------ */}
            {/* PORTAL 3: OUTSTATION & HIGHWAY MODEL                   */}
            {/* ------------------------------------------------------ */}
            {userRole === 'outstation' && (
              <View>
                <View style={styles.portalHeaderBox}>
                  <Text style={styles.portalTag}>REVENUE MODEL 3 • OUTSTATION COMMISSION</Text>
                  <Text style={styles.portalHeading}>1-Day & Highway Driver Booking</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routeScroll}>
                  {ROUTES_DB.map((r) => (
                    <TouchableOpacity
                      key={r.id}
                      style={[styles.routePill, selectedRoute.id === r.id && styles.routePillActive]}
                      onPress={() => setSelectedRoute(r)}
                    >
                      <Text style={[styles.routePillText, selectedRoute.id === r.id && styles.routePillTextActive]}>
                        {r.name.split('⇄')[1] || r.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.routeDetailsCard}>
                  <Text style={styles.routeCardName}>{selectedRoute.name}</Text>
                  <Text style={styles.priceHeaderAmount}>{selectedRoute.rate} + FASTag</Text>
                  <Text style={styles.routeCardDistance}>Distance: {selectedRoute.distance}</Text>
                  <Text style={styles.routeItemLabel}>FASTag Toll: {selectedRoute.toll}</Text>
                  <Text style={styles.routeItemLabel}>Driver DA: {selectedRoute.driverDA}</Text>
                </View>

                <View style={styles.formContainerCard}>
                  <Text style={styles.formTitle}>Book Highway Driver</Text>
                  <Text style={styles.formSubtitle}>Commercial badge driver for smooth expressway driving.</Text>

                  <Text style={styles.fieldLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Rohit Kapoor"
                    value={formData.name}
                    onChangeText={(v) => setFormData({ ...formData, name: v })}
                  />

                  <Text style={styles.fieldLabel}>Mobile Number *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="+91 81750 87004"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(v) => setFormData({ ...formData, phone: v })}
                  />

                  <Text style={styles.fieldLabel}>Trip Date & Departure Time *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Tomorrow 6:00 AM Departure"
                    value={formData.tripDate}
                    onChangeText={(v) => setFormData({ ...formData, tripDate: v })}
                  />

                  <TouchableOpacity
                    style={styles.submitActionButton}
                    onPress={() => handleFormSubmit('Outstation Highway Driver Booking', `${selectedRoute.name} (${selectedRoute.rate})`)}
                    disabled={loading}
                  >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Confirm Highway Driver (₹1,500/day)</Text>}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnWhatsAppOutline}
                    onPress={() => openWhatsApp(`Hello Drivers Saathi, I want to book an outstation driver for ${selectedRoute.name}. Departure: ${formData.tripDate || 'This Weekend'}.`)}
                  >
                    <Text style={styles.btnWhatsAppOutlineText}>💬 Book Instantly via WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ------------------------------------------------------ */}
            {/* PORTAL 4: DRIVER VERIFICATION PACKAGE MODEL            */}
            {/* ------------------------------------------------------ */}
            {userRole === 'verify' && (
              <View>
                <View style={styles.portalHeaderBox}>
                  <Text style={styles.portalTag}>REVENUE MODEL 4 • BACKGROUND CHECK</Text>
                  <Text style={styles.portalHeading}>Driver Verification Package</Text>
                </View>

                <View style={styles.formContainerCard}>
                  <View style={styles.priceHeaderCard}>
                    <Text style={styles.priceHeaderTitle}>Driver Background Check Package</Text>
                    <Text style={styles.priceHeaderAmount}>₹1,200 / Driver Verification</Text>
                    <Text style={styles.priceHeaderSub}>Aadhaar ID, Driving License Validity, Criminal Record Screening & Road Driving Audit</Text>
                  </View>

                  <Text style={styles.fieldLabel}>Vehicle Owner Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Car Owner Full Name"
                    value={formData.name}
                    onChangeText={(v) => setFormData({ ...formData, name: v })}
                  />

                  <Text style={styles.fieldLabel}>Owner Phone Number *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="+91 81750 87004"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(v) => setFormData({ ...formData, phone: v })}
                  />

                  <Text style={styles.fieldLabel}>Driver's DL Number to Verify *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. DL-0420110012345"
                    autoCapitalize="characters"
                    value={formData.verifyDriverDL}
                    onChangeText={(v) => setFormData({ ...formData, verifyDriverDL: v })}
                  />

                  <Text style={styles.fieldLabel}>Driver's Aadhaar Number *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 1234 5678 9012"
                    keyboardType="numeric"
                    value={formData.verifyDriverAadhaar}
                    onChangeText={(v) => setFormData({ ...formData, verifyDriverAadhaar: v })}
                  />

                  <TouchableOpacity
                    style={styles.submitActionButton}
                    onPress={() => handleFormSubmit('Driver Background Verification Request (₹1,200)', 'Verification Package ₹1,200')}
                    disabled={loading}
                  >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Request Verification Check (₹1,200)</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ------------------------------------------------------ */}
            {/* PORTAL 5: DRIVER PARTNER APPLICATION                   */}
            {/* ------------------------------------------------------ */}
            {userRole === 'driver' && (
              <View>
                <View style={styles.portalHeaderBox}>
                  <Text style={styles.portalTag}>DRIVER RECRUITMENT</Text>
                  <Text style={styles.portalHeading}>Saathi Driver Hub</Text>
                </View>

                <View style={styles.segmentContainer}>
                  <TouchableOpacity
                    style={[styles.segmentBtn, driverSubTab === 'kyc' && styles.segmentBtnActive]}
                    onPress={() => setDriverSubTab('kyc')}
                  >
                    <Text style={[styles.segmentBtnText, driverSubTab === 'kyc' && styles.segmentBtnTextActive]}>
                      KYC & Join
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.segmentBtn, driverSubTab === 'jobs' && styles.segmentBtnActive]}
                    onPress={() => setDriverSubTab('jobs')}
                  >
                    <Text style={[styles.segmentBtnText, driverSubTab === 'jobs' && styles.segmentBtnTextActive]}>
                      Job Board
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.segmentBtn, driverSubTab === 'refer' && styles.segmentBtnActive]}
                    onPress={() => setDriverSubTab('refer')}
                  >
                    <Text style={[styles.segmentBtnText, driverSubTab === 'refer' && styles.segmentBtnTextActive]}>
                      Refer & Earn
                    </Text>
                  </TouchableOpacity>
                </View>

                {driverSubTab === 'kyc' && (
                  <View style={styles.formContainerCard}>
                    <Text style={styles.formTitle}>Driver KYC Onboarding</Text>
                    <Text style={styles.formSubtitle}>Attach documents for police verification and direct placement.</Text>

                    <Text style={styles.fieldLabel}>Full Name (as on Aadhaar) *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChangeText={(v) => setFormData({ ...formData, name: v })}
                    />

                    <Text style={styles.fieldLabel}>Phone Number (WhatsApp) *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="+91 98765 43210"
                      keyboardType="phone-pad"
                      value={formData.phone}
                      onChangeText={(v) => setFormData({ ...formData, phone: v })}
                    />

                    <Text style={styles.fieldLabel}>License Category</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Commercial LMV Badge"
                      value={formData.license}
                      onChangeText={(v) => setFormData({ ...formData, license: v })}
                    />

                    <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Attach Verification Documents</Text>
                    <View style={styles.kycRow}>
                      <TouchableOpacity
                        style={[styles.kycUploadBtn, licenseImg && styles.kycUploadBtnSuccess]}
                        onPress={() => pickDoc('license')}
                      >
                        <Text style={styles.kycUploadLabel}>{licenseImg ? 'License Attached ✓' : 'Attach License'}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.kycUploadBtn, aadhaarImg && styles.kycUploadBtnSuccess]}
                        onPress={() => pickDoc('aadhaar')}
                      >
                        <Text style={styles.kycUploadLabel}>{aadhaarImg ? 'Aadhaar Attached ✓' : 'Attach Aadhaar'}</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.submitActionButton}
                      onPress={() => handleFormSubmit('Driver Partner KYC Registration')}
                      disabled={loading}
                    >
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Submit Application</Text>}
                    </TouchableOpacity>
                  </View>
                )}

                {driverSubTab === 'jobs' && (
                  <View>
                    <View style={styles.jobCard}>
                      <Text style={styles.jobSalary}>₹22,000 - ₹24,000 / mo</Text>
                      <Text style={styles.jobTitle}>Chauffeur for Hyundai Creta</Text>
                      <Text style={styles.jobLocation}>📍 Vasant Vihar, South Delhi</Text>
                      <TouchableOpacity style={styles.jobApplyBtn} onPress={() => setDriverSubTab('kyc')}>
                        <Text style={styles.jobApplyBtnText}>Apply for this Duty</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.jobCard}>
                      <Text style={styles.jobSalary}>₹26,000 - ₹28,000 / mo</Text>
                      <Text style={styles.jobTitle}>Luxury Chauffeur (Mercedes / BMW)</Text>
                      <Text style={styles.jobLocation}>📍 DLF Golf Course Road, Gurugram</Text>
                      <TouchableOpacity style={styles.jobApplyBtn} onPress={() => setDriverSubTab('kyc')}>
                        <Text style={styles.jobApplyBtnText}>Apply for this Duty</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {driverSubTab === 'refer' && (
                  <View style={styles.formContainerCard}>
                    <Text style={styles.formTitle}>Refer a Driver Friend</Text>
                    <Text style={styles.formSubtitle}>Earn a ₹500 referral bonus when your referred driver completes 30 days.</Text>

                    <Text style={styles.fieldLabel}>Your Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Your Full Name"
                      value={formData.name}
                      onChangeText={(v) => setFormData({ ...formData, name: v })}
                    />

                    <Text style={styles.fieldLabel}>Referred Driver's Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Friend's Full Name"
                      value={formData.referralName}
                      onChangeText={(v) => setFormData({ ...formData, referralName: v })}
                    />

                    <Text style={styles.fieldLabel}>Referred Driver's Phone *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Friend's Phone Number"
                      keyboardType="phone-pad"
                      value={formData.referralPhone}
                      onChangeText={(v) => setFormData({ ...formData, referralPhone: v })}
                    />

                    <TouchableOpacity
                      style={styles.submitActionButton}
                      onPress={() => handleFormSubmit('Driver Referral Submission')}
                      disabled={loading}
                    >
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Submit Driver Referral</Text>}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* Confirmation Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalCheckCircle}>
              <Text style={styles.modalCheckMark}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>Request Received</Text>
            <Text style={styles.modalBody}>{modalMessage}</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)} activeOpacity={0.85}>
              <Text style={styles.modalCloseBtnText}>Done</Text>
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
    width: 160,
    height: 40,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleSwitchBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  roleSwitchBtnText: {
    color: '#FFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  sosButton: {
    backgroundColor: THEME.sosSoft,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  sosButtonText: {
    color: THEME.sosRed,
    fontSize: 11.5,
    fontWeight: '800',
  },
  languageToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  languageToggleText: {
    color: THEME.paper,
    fontSize: 11.5,
    fontWeight: '700',
  },
  liveTicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.cardNavy,
    paddingVertical: 6,
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

  // Welcome Screen
  welcomeScroll: {
    padding: 18,
    backgroundColor: THEME.paperAlt,
    paddingBottom: 60,
  },
  welcomeHero: {
    marginTop: 8,
    marginBottom: 20,
  },
  welcomeBadge: {
    color: THEME.marigoldDeep,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  welcomeTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 6,
  },
  welcomeSub: {
    fontSize: 13.5,
    color: THEME.inkSoft,
    lineHeight: 20,
  },
  portalSelectCard: {
    backgroundColor: THEME.paper,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  portalIconBox: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: THEME.marigoldLight,
    marginRight: 12,
  },
  portalTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: THEME.marigoldDeep,
    letterSpacing: 0.6,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  portalCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: THEME.ink,
    flex: 1,
  },
  priceTag: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.marigoldDeep,
    marginLeft: 6,
  },
  portalCardSub: {
    fontSize: 12,
    color: THEME.inkSoft,
    lineHeight: 17,
  },
  portalArrow: {
    fontSize: 20,
    color: THEME.marigoldDeep,
    fontWeight: '800',
    marginLeft: 8,
  },
  welcomeHelplineBox: {
    backgroundColor: THEME.cardNavy,
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    alignItems: 'center',
  },
  welcomeHelplineTitle: {
    color: '#E2E8F0',
    fontSize: 13,
    marginBottom: 10,
  },

  // Main Scroll
  mainScroll: {
    padding: 16,
    backgroundColor: THEME.paperAlt,
    paddingBottom: 60,
  },
  portalHeaderBox: {
    marginBottom: 14,
  },
  portalTag: {
    color: THEME.marigoldDeep,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  portalHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.ink,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: THEME.paper,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 12,
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
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.line,
  },
  priceHeaderCard: {
    backgroundColor: THEME.cardNavy,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  priceHeaderTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  priceHeaderAmount: {
    color: THEME.marigold,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: 2,
  },
  priceHeaderSub: {
    color: '#E2E8F0',
    fontSize: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 12.5,
    color: THEME.inkSoft,
    lineHeight: 18,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: THEME.ink,
    marginTop: 10,
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: THEME.paperAlt,
    borderWidth: 1,
    borderColor: THEME.line,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: THEME.ink,
  },
  submitActionButton: {
    backgroundColor: THEME.marigold,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitActionButtonText: {
    color: THEME.paper,
    fontWeight: '800',
    fontSize: 14.5,
  },
  btnWhatsAppOutline: {
    backgroundColor: THEME.verifiedSoft,
    borderWidth: 1.5,
    borderColor: THEME.whatsapp,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  btnWhatsAppOutlineText: {
    color: '#065F46',
    fontWeight: '800',
    fontSize: 13,
  },
  actionCallBtn: {
    backgroundColor: THEME.marigold,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
  },
  actionCallBtnText: {
    color: THEME.paper,
    fontWeight: '800',
    fontSize: 13.5,
  },

  // Duty Log
  logCard: {
    backgroundColor: THEME.paper,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: THEME.blue,
    marginBottom: 14,
  },
  logCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 10,
  },
  logInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  miniLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.inkSoft,
    marginBottom: 3,
  },
  miniInput: {
    backgroundColor: THEME.paperAlt,
    borderWidth: 1,
    borderColor: THEME.line,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 7,
    fontSize: 12,
    color: THEME.ink,
  },
  btnLogSave: {
    backgroundColor: THEME.blue,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  btnLogSaveText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  logEntryCard: {
    backgroundColor: THEME.paper,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 8,
  },
  logEntryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logEntryDate: {
    fontSize: 13.5,
    fontWeight: '800',
    color: THEME.ink,
  },
  logEntryOT: {
    fontSize: 11.5,
    fontWeight: '800',
    color: THEME.marigoldDeep,
  },
  logEntryMeta: {
    fontSize: 12,
    color: THEME.inkSoft,
  },

  // Pricing
  pricingCard: {
    backgroundColor: THEME.paper,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 12,
  },
  pricingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
  },
  pricingDesc: {
    fontSize: 12.5,
    color: THEME.inkSoft,
    lineHeight: 18,
    marginBottom: 12,
  },
  btnPrimary: {
    backgroundColor: THEME.marigold,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13.5,
  },

  // Routes
  routeScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  routePill: {
    backgroundColor: THEME.paper,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.line,
    marginRight: 8,
  },
  routePillActive: {
    backgroundColor: THEME.marigold,
    borderColor: THEME.marigoldDeep,
  },
  routePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.inkSoft,
  },
  routePillTextActive: {
    color: THEME.paper,
    fontWeight: '800',
  },
  routeDetailsCard: {
    backgroundColor: THEME.paper,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 14,
  },
  routeCardName: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 3,
  },
  routeCardDistance: {
    fontSize: 12.5,
    color: THEME.inkSoft,
    marginBottom: 6,
  },
  routeItemLabel: {
    fontSize: 12.5,
    color: THEME.ink,
    marginBottom: 3,
  },

  // Driver KYC & Job Board
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
    paddingVertical: 12,
    alignItems: 'center',
  },
  kycUploadBtnSuccess: {
    backgroundColor: THEME.verifiedSoft,
    borderColor: THEME.verified,
    borderStyle: 'solid',
  },
  kycUploadLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: THEME.ink,
  },
  jobCard: {
    backgroundColor: THEME.paper,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 12,
  },
  jobSalary: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.verified,
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
  },
  jobLocation: {
    fontSize: 12,
    color: THEME.inkSoft,
    marginBottom: 6,
  },
  jobApplyBtn: {
    backgroundColor: THEME.ink,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  jobApplyBtnText: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '700',
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.verifiedSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: THEME.verified,
  },
  modalCheckMark: {
    color: THEME.verified,
    fontSize: 28,
    fontWeight: '800',
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 13,
    color: THEME.inkSoft,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
  },
  modalCloseBtn: {
    backgroundColor: THEME.ink,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: THEME.paper,
    fontSize: 13.5,
    fontWeight: '700',
  },
});
