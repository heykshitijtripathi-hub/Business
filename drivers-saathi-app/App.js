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

// Outstation routes database
const ROUTES_DB = [
  {
    id: 'agra',
    name: 'Delhi ⇄ Agra (Yamuna Expressway)',
    distance: '210 km (One-way)',
    toll: '₹415 One-way / ₹665 Return',
    driverDA: '₹400 / Night Halt',
    speedLimit: '100 km/h Strict Cameras',
  },
  {
    id: 'jaipur',
    name: 'Delhi ⇄ Jaipur (Delhi-Mumbai Expy)',
    distance: '270 km (One-way)',
    toll: '₹590 (Sohna-Dausa)',
    driverDA: '₹500 / Night Halt',
    speedLimit: '120 km/h Expressway',
  },
  {
    id: 'chandigarh',
    name: 'Delhi ⇄ Chandigarh (NH-44)',
    distance: '250 km (One-way)',
    toll: '₹390 Toll Plaza Total',
    driverDA: '₹400 / Night Halt',
    speedLimit: '90 km/h Highway',
  },
  {
    id: 'dehradun',
    name: 'Delhi ⇄ Dehradun / Rishikesh',
    distance: '260 km (One-way)',
    toll: '₹310 (Meerut Expy)',
    driverDA: '₹500 / Night Halt',
    speedLimit: '80 km/h Hill Section',
  },
];

export default function App() {
  const [lang, setLang] = useState('en'); // 'en' | 'hi'
  // Current user role: null (Role Selector) | 'personal' | 'fleet' | 'driver' | 'outstation'
  const [userRole, setUserRole] = useState(null);

  // Subtabs within each portal
  const [personalSubTab, setPersonalSubTab] = useState('book'); // book | logbook | fuel
  const [fleetSubTab, setFleetSubTab] = useState('request'); // request | pricing | toll
  const [driverSubTab, setDriverSubTab] = useState('kyc'); // kyc | jobs | academy

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
    vehicle: '',
    location: '',
    count: '1',
    tripDate: '',
    destination: '',
    license: '',
    experience: '',
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

  // Fuel Diary State
  const [fuelLitres, setFuelLitres] = useState('35');
  const [fuelCost, setFuelCost] = useState('3200');
  const [fuelOdo, setFuelOdo] = useState('41250');
  const [fuelEntries, setFuelEntries] = useState([
    { id: '1', date: '2026-09-08', litres: '35 L', cost: '₹3,200', odo: '41,250 km', mileage: '16.4 km/L' },
    { id: '2', date: '2026-08-25', litres: '40 L', cost: '₹3,750', odo: '40,680 km', mileage: '15.8 km/L' },
  ]);

  // Persistent role & duty log retrieval
  useEffect(() => {
    (async () => {
      try {
        const savedRole = await AsyncStorage.getItem('@user_selected_role');
        if (savedRole) setUserRole(savedRole);

        const savedLogs = await AsyncStorage.getItem('@duty_logs_v3');
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
    await AsyncStorage.setItem('@user_selected_role', role);
  };

  const switchRole = async () => {
    setUserRole(null);
    await AsyncStorage.removeItem('@user_selected_role');
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
      '🚨 24x7 Roadside & Dispatch SOS',
      'Emergency roadside assistance & live dispatch desk for Delhi NCR drivers and passengers.\n\nHelpline: +91 8175087004',
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
    await AsyncStorage.setItem('@duty_logs_v3', JSON.stringify(updated));
    Alert.alert('Duty Saved', `Recorded duty for ${logDate} with ${logOT} hrs overtime.`);
  };

  const addFuelRecord = () => {
    if (!fuelLitres || !fuelCost) {
      Alert.alert('Incomplete', 'Please enter Liters and Cost.');
      return;
    }
    const newRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      litres: `${fuelLitres} L`,
      cost: `₹${Number(fuelCost).toLocaleString('en-IN')}`,
      odo: `${fuelOdo} km`,
      mileage: '16.2 km/L',
    };
    setFuelEntries([newRecord, ...fuelEntries]);
    Alert.alert('Saved', 'Fuel fill-up recorded.');
  };

  const handleFormSubmit = async (type) => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      Alert.alert('Required Info', 'Please provide Full Name and Mobile Number.');
      return;
    }
    setLoading(true);

    const autoResp =
      lang === 'en'
        ? `Thank you for contacting Drivers Saathi! We have received your ${type}. Our central dispatch desk is reviewing your requirements and will connect with you via Call / WhatsApp shortly. For urgent assistance, call +91 8175087004 or email support@driverssaathi.com.`
        : `ड्राइवर्स साथी से संपर्क करने के लिए धन्यवाद! आपकी ${type} हमें मिल गई है। हमारी टीम जल्द आपसे फोन/व्हाट्सएप पर संपर्क करेगी। तत्काल सहायता: +91 8175087004.`;

    const payload = {
      Category: type,
      Name: formData.name,
      'Phone Number': formData.phone,
      Email: formData.email || 'Not Provided',
      Company: formData.company || 'Individual / Personal',
      'Vehicle Model': formData.vehicle || 'Not specified',
      'Location / NCR Zone': formData.location || 'Delhi NCR',
      'Drivers Needed': formData.count || '1',
      'Trip Date & Time': formData.tripDate || 'N/A',
      Destination: formData.destination || 'Delhi NCR',
      'License Attached': licenseImg ? 'Yes' : 'Pending',
      'Aadhaar Attached': aadhaarImg ? 'Yes' : 'Pending',
      _subject: `[New Lead] ${type} - ${formData.name} (${formData.phone})`,
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
          ? 'Thank you! Your request has been sent to support@driverssaathi.com. Our dispatch desk will call you shortly with verified candidate profiles.\n\nA confirmation has been emailed to you.'
          : 'धन्यवाद! आपकी रिक्वेस्ट support@driverssaathi.com पर भेज दी गई है। हमारी टीम जल्द आपसे संपर्क करेगी।'
      );
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

      {/* Global Brand Header */}
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
              <Text style={styles.roleSwitchBtnText}>⇄ Switch Portal</Text>
            </TouchableOpacity>
          )}

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
        <Text style={styles.liveTickerText}>
          {lang === 'en'
            ? 'Delhi NCR Dispatch: Active & Verified (Mon-Sat: 8 AM - 9 PM)'
            : 'दिल्ली एनसीआर डेस्क: चालू है (सोम-शनि: 8 AM - 9 PM)'}
        </Text>
      </View>

      {/* ======================================================== */}
      {/* SCREEN A: ROLE SELECTOR (CLEAN ENTRY SCREEN)              */}
      {/* ======================================================== */}
      {!userRole ? (
        <ScrollView contentContainerStyle={styles.welcomeScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeHero}>
            <Text style={styles.welcomeBadge}>SELECT YOUR PROFILE</Text>
            <Text style={styles.welcomeTitle}>
              {lang === 'en' ? 'Welcome to Drivers Saathi' : 'ड्राइवर्स साथी में आपका स्वागत है'}
            </Text>
            <Text style={styles.welcomeSub}>
              {lang === 'en'
                ? 'Please choose how you would like to use the app to access your dedicated dashboard.'
                : 'अपनी आवश्यकता के अनुसार विकल्प चुनें ताकि आपको सही डैशबोर्ड दिखे।'}
            </Text>
          </View>

          {/* Role Card 1: Personal Car Owner */}
          <TouchableOpacity
            style={[styles.portalSelectCard, { borderColor: '#FDBA74' }]}
            onPress={() => selectRole('personal')}
            activeOpacity={0.88}
          >
            <View style={styles.portalIconBox}>
              <Text style={styles.portalEmoji}>🚗</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.portalCardTitle}>
                {lang === 'en' ? '1. Personal Car Owner' : '1. पर्सनल कार मालिक'}
              </Text>
              <Text style={styles.portalCardSub}>
                {lang === 'en'
                  ? 'Hire full-time verified chauffeurs for daily office, luxury cars & family commute. Duty logbook & car fuel tracker.'
                  : 'परिवार और ऑफिस के लिए परमानेंट ड्राइवर लें। हाजिरी डायरी और गाड़ी का हिसाब रखें।'}
              </Text>
            </View>
            <Text style={styles.portalArrow}>&rarr;</Text>
          </TouchableOpacity>

          {/* Role Card 2: Fleet & Corporate */}
          <TouchableOpacity
            style={[styles.portalSelectCard, { borderColor: '#93C5FD' }]}
            onPress={() => selectRole('fleet')}
            activeOpacity={0.88}
          >
            <View style={[styles.portalIconBox, { backgroundColor: THEME.blueSoft }]}>
              <Text style={styles.portalEmoji}>🏢</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.portalCardTitle}>
                {lang === 'en' ? '2. Fleet & Corporate Manager' : '2. फ्लीट व कंपनी मैनेजर'}
              </Text>
              <Text style={styles.portalCardSub}>
                {lang === 'en'
                  ? 'Commercial driver placement for cab fleets, tour operators & staff shuttles. Monthly retainer & SLA replacement.'
                  : 'कैब फ्लीट व कंपनियों के लिए बल्क कमर्शियल ड्राइवर्स। फास्ट रिप्लेसमेंट और मासिक प्लान।'}
              </Text>
            </View>
            <Text style={styles.portalArrow}>&rarr;</Text>
          </TouchableOpacity>

          {/* Role Card 3: Outstation / 1-Day Trip Customer */}
          <TouchableOpacity
            style={[styles.portalSelectCard, { borderColor: '#A7F3D0' }]}
            onPress={() => selectRole('outstation')}
            activeOpacity={0.88}
          >
            <View style={[styles.portalIconBox, { backgroundColor: THEME.verifiedSoft }]}>
              <Text style={styles.portalEmoji}>🛣️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.portalCardTitle}>
                {lang === 'en' ? '3. Outstation & 1-Day Driver' : '3. हाईवे व आउटस्टेशन ट्रिप'}
              </Text>
              <Text style={styles.portalCardSub}>
                {lang === 'en'
                  ? 'Book a reliable highway driver on short notice for Agra, Jaipur, Chandigarh, weekend trips or Airport transfer.'
                  : '1 दिन के ट्रिप, वीकेंड सफर या एयरपोर्ट ड्रॉप के लिए तुरंत हाईवे ड्राइवर बुक करें।'}
              </Text>
            </View>
            <Text style={styles.portalArrow}>&rarr;</Text>
          </TouchableOpacity>

          {/* Role Card 4: Driver Partner */}
          <TouchableOpacity
            style={[styles.portalSelectCard, { borderColor: '#DDD6FE' }]}
            onPress={() => selectRole('driver')}
            activeOpacity={0.88}
          >
            <View style={[styles.portalIconBox, { backgroundColor: '#F5F3FF' }]}>
              <Text style={styles.portalEmoji}>🪪</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.portalCardTitle}>
                {lang === 'en' ? '4. Driver Partner (Job Seeker)' : '4. ड्राइवर साथी (नौकरी हेतु)'}
              </Text>
              <Text style={styles.portalCardSub}>
                {lang === 'en'
                  ? 'Upload KYC documents, browse verified high-paying driving jobs (₹18k-₹28k), and access the Chauffeur Academy.'
                  : 'दस्तावेज अपलोड करें, दिल्ली एनसीआर की ड्राइविंग नौकरियां देखें और ट्रेनिंग टिप्स सीखें।'}
              </Text>
            </View>
            <Text style={styles.portalArrow}>&rarr;</Text>
          </TouchableOpacity>

          {/* Quick Helpline Box */}
          <View style={styles.welcomeHelplineBox}>
            <Text style={styles.welcomeHelplineTitle}>Need immediate human assistance?</Text>
            <TouchableOpacity style={styles.actionCallBtn} onPress={handleCall} activeOpacity={0.9}>
              <Text style={styles.actionCallBtnText}>📞 Call Dispatch Desk: +91 8175087004</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        /* ======================================================== */
        /* SCREEN B: DEDICATED PORTAL VIEW BASED ON SELECTED ROLE    */
        /* ======================================================== */
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
            {/* ------------------------------------------------------ */}
            {/* PORTAL 1: PERSONAL CAR OWNER DASHBOARD                 */}
            {/* ------------------------------------------------------ */}
            {userRole === 'personal' && (
              <View>
                <View style={styles.portalHeaderBox}>
                  <Text style={styles.portalTag}>CAR OWNER PORTAL</Text>
                  <Text style={styles.portalHeading}>Private Chauffeur Management</Text>
                </View>

                {/* Subtabs for Car Owner */}
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
                    style={[styles.segmentBtn, personalSubTab === 'fuel' && styles.segmentBtnActive]}
                    onPress={() => setPersonalSubTab('fuel')}
                  >
                    <Text style={[styles.segmentBtnText, personalSubTab === 'fuel' && styles.segmentBtnTextActive]}>
                      Fuel & Care
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* SUBTAB 1: HIRE FORM */}
                {personalSubTab === 'book' && (
                  <View style={styles.formContainerCard}>
                    <Text style={styles.formTitle}>Book a Verified Personal Chauffeur</Text>
                    <Text style={styles.formSubtitle}>
                      100% Police Verified, clean background, 30-day free replacement policy.
                    </Text>

                    <Text style={styles.fieldLabel}>Your Full Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Priya Sharma"
                      placeholderTextColor={THEME.inkMuted}
                      value={formData.name}
                      onChangeText={(v) => setFormData({ ...formData, name: v })}
                    />

                    <Text style={styles.fieldLabel}>Phone Number *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="+91 81750 87004"
                      placeholderTextColor={THEME.inkMuted}
                      keyboardType="phone-pad"
                      value={formData.phone}
                      onChangeText={(v) => setFormData({ ...formData, phone: v })}
                    />

                    <Text style={styles.fieldLabel}>Email Address (For confirmation copy)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. priya@gmail.com"
                      placeholderTextColor={THEME.inkMuted}
                      keyboardType="email-address"
                      value={formData.email}
                      onChangeText={(v) => setFormData({ ...formData, email: v })}
                    />

                    <Text style={styles.fieldLabel}>Car Model & Transmission</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Honda City / Hyundai Creta (Automatic)"
                      placeholderTextColor={THEME.inkMuted}
                      value={formData.vehicle}
                      onChangeText={(v) => setFormData({ ...formData, vehicle: v })}
                    />

                    <Text style={styles.fieldLabel}>Residence Area in Delhi NCR</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. South Delhi / DLF Phase 5 Gurugram"
                      placeholderTextColor={THEME.inkMuted}
                      value={formData.location}
                      onChangeText={(v) => setFormData({ ...formData, location: v })}
                    />

                    <TouchableOpacity
                      style={styles.submitActionButton}
                      onPress={() => handleFormSubmit('Personal Permanent Chauffeur Request')}
                      disabled={loading}
                    >
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Submit Chauffeur Requirement</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnWhatsAppOutline}
                      onPress={() => openWhatsApp(`Hello Drivers Saathi, I want to hire a personal chauffeur for my car in ${formData.location || 'Delhi NCR'}.`)}
                    >
                      <Text style={styles.btnWhatsAppOutlineText}>💬 Or Inquire via WhatsApp</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* SUBTAB 2: DUTY LOGBOOK */}
                {personalSubTab === 'logbook' && (
                  <View>
                    <View style={styles.logCard}>
                      <Text style={styles.logCardTitle}>Record Daily Duty & Overtime</Text>
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
                        <Text style={styles.btnLogSaveText}>💾 Save Duty Entry</Text>
                      </TouchableOpacity>
                    </View>

                    {logEntries.map((e) => (
                      <View key={e.id} style={styles.logEntryCard}>
                        <View style={styles.logEntryTop}>
                          <Text style={styles.logEntryDate}>📅 {e.date}</Text>
                          <Text style={styles.logEntryOT}>+{e.ot} OT</Text>
                        </View>
                        <Text style={styles.logEntryMeta}>Timing: {e.in} - {e.out} • {e.km}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* SUBTAB 3: FUEL & CAR CARE */}
                {personalSubTab === 'fuel' && (
                  <View>
                    <View style={styles.carDocCard}>
                      <Text style={styles.sectionTitle}>Compliance & Documents</Text>
                      <View style={styles.docRow}>
                        <Text style={styles.docName}>🛡️ Insurance: Active (2027-03-15)</Text>
                      </View>
                      <View style={styles.docRow}>
                        <Text style={styles.docName}>💨 PUC Certificate: Valid (Renew in 70D)</Text>
                      </View>
                    </View>

                    <View style={styles.fuelInputCard}>
                      <Text style={styles.logCardTitle}>+ Record Fuel Fill-up</Text>
                      <View style={styles.logInputRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.miniLabel}>Litres</Text>
                          <TextInput style={styles.miniInput} value={fuelLitres} onChangeText={setFuelLitres} keyboardType="numeric" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.miniLabel}>Cost (₹)</Text>
                          <TextInput style={styles.miniInput} value={fuelCost} onChangeText={setFuelCost} keyboardType="numeric" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.miniLabel}>Odo (km)</Text>
                          <TextInput style={styles.miniInput} value={fuelOdo} onChangeText={setFuelOdo} keyboardType="numeric" />
                        </View>
                      </View>
                      <TouchableOpacity style={styles.btnFuelSave} onPress={addFuelRecord}>
                        <Text style={styles.btnFuelSaveText}>💾 Save Fuel Record</Text>
                      </TouchableOpacity>
                    </View>

                    {fuelEntries.map((f) => (
                      <View key={f.id} style={styles.fuelEntryCard}>
                        <View style={styles.fuelEntryTop}>
                          <Text style={styles.fuelEntryDate}>⛽ {f.date}</Text>
                          <Text style={styles.fuelEntryCost}>{f.cost}</Text>
                        </View>
                        <Text style={styles.fuelEntryMeta}>{f.litres} • Odo: {f.odo} • {f.mileage}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* ------------------------------------------------------ */}
            {/* PORTAL 2: FLEET & CORPORATE MANAGER DASHBOARD           */}
            {/* ------------------------------------------------------ */}
            {userRole === 'fleet' && (
              <View>
                <View style={styles.portalHeaderBox}>
                  <Text style={styles.portalTag}>FLEET & CORPORATE</Text>
                  <Text style={styles.portalHeading}>B2B Driver Placement Hub</Text>
                </View>

                <View style={styles.segmentContainer}>
                  <TouchableOpacity
                    style={[styles.segmentBtn, fleetSubTab === 'request' && styles.segmentBtnActive]}
                    onPress={() => setFleetSubTab('request')}
                  >
                    <Text style={[styles.segmentBtnText, fleetSubTab === 'request' && styles.segmentBtnTextActive]}>
                      Fleet Request
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.segmentBtn, fleetSubTab === 'pricing' && styles.segmentBtnActive]}
                    onPress={() => setFleetSubTab('pricing')}
                  >
                    <Text style={[styles.segmentBtnText, fleetSubTab === 'pricing' && styles.segmentBtnTextActive]}>
                      Pricing Plans
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.segmentBtn, fleetSubTab === 'toll' && styles.segmentBtnActive]}
                    onPress={() => setFleetSubTab('toll')}
                  >
                    <Text style={[styles.segmentBtnText, fleetSubTab === 'toll' && styles.segmentBtnTextActive]}>
                      NCR Border Toll
                    </Text>
                  </TouchableOpacity>
                </View>

                {fleetSubTab === 'request' && (
                  <View style={styles.formContainerCard}>
                    <Text style={styles.formTitle}>Request Commercial Drivers</Text>
                    <Text style={styles.formSubtitle}>For cab fleets, employee shuttles & luxury car rental fleets.</Text>

                    <Text style={styles.fieldLabel}>Contact Person *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Rajesh Mehra"
                      value={formData.name}
                      onChangeText={(v) => setFormData({ ...formData, name: v })}
                    />

                    <Text style={styles.fieldLabel}>Mobile Number *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="+91 98765 43210"
                      keyboardType="phone-pad"
                      value={formData.phone}
                      onChangeText={(v) => setFormData({ ...formData, phone: v })}
                    />

                    <Text style={styles.fieldLabel}>Company / Fleet Name</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. NCR Cab Logistics Pvt Ltd"
                      value={formData.company}
                      onChangeText={(v) => setFormData({ ...formData, company: v })}
                    />

                    <Text style={styles.fieldLabel}>Drivers Required</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 10 Drivers"
                      keyboardType="numeric"
                      value={formData.count}
                      onChangeText={(v) => setFormData({ ...formData, count: v })}
                    />

                    <TouchableOpacity
                      style={styles.submitActionButton}
                      onPress={() => handleFormSubmit('Corporate Fleet Driver Request')}
                      disabled={loading}
                    >
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Submit Fleet Requirement</Text>}
                    </TouchableOpacity>
                  </View>
                )}

                {fleetSubTab === 'pricing' && (
                  <View>
                    <View style={styles.pricingCard}>
                      <Text style={styles.pricingTitle}>Pay-Per-Hire (Onboarding)</Text>
                      <Text style={styles.pricingDesc}>One-time fee per placement. 30-Day Free Replacement guarantee.</Text>
                      <TouchableOpacity style={styles.btnPrimary} onPress={() => setFleetSubTab('request')}>
                        <Text style={styles.btnPrimaryText}>Book Pay-Per-Hire</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.pricingCard, { borderColor: THEME.marigold, borderWidth: 1.5 }]}>
                      <Text style={styles.pricingTitle}>Monthly Retainer (Zero Downtime)</Text>
                      <Text style={styles.pricingDesc}>Dedicated standby driver pool with replacement within 2-4 hours.</Text>
                      <TouchableOpacity style={styles.btnPrimary} onPress={() => setFleetSubTab('request')}>
                        <Text style={styles.btnPrimaryText}>Select Monthly Retainer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {fleetSubTab === 'toll' && (
                  <View>
                    <Text style={styles.sectionTitle}>Delhi NCR Border Entry & Tolls</Text>
                    {ROUTES_DB.map((r) => (
                      <View key={r.id} style={styles.routeDetailsCard}>
                        <Text style={styles.routeCardName}>{r.name}</Text>
                        <Text style={styles.routeItemLabel}>FASTag: {r.toll}</Text>
                        <Text style={styles.routeItemLabel}>Driver DA: {r.driverDA}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* ------------------------------------------------------ */}
            {/* PORTAL 3: OUTSTATION & 1-DAY TRIP DASHBOARD             */}
            {/* ------------------------------------------------------ */}
            {userRole === 'outstation' && (
              <View>
                <View style={styles.portalHeaderBox}>
                  <Text style={styles.portalTag}>HIGHWAY & OUTSTATION</Text>
                  <Text style={styles.portalHeading}>1-Day & Weekend Outstation Chauffeur</Text>
                </View>

                {/* Popular Route Selector */}
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
                  <Text style={styles.routeCardDistance}>📍 {selectedRoute.distance}</Text>
                  <Text style={styles.routeItemLabel}>💳 FASTag Toll: {selectedRoute.toll}</Text>
                  <Text style={styles.routeItemLabel}>🍽️ Driver DA: {selectedRoute.driverDA}</Text>
                </View>

                {/* Instant Booking Form */}
                <View style={styles.formContainerCard}>
                  <Text style={styles.formTitle}>Book Highway Driver</Text>
                  <Text style={styles.formSubtitle}>Experienced commercial badge driver for smooth expressway driving.</Text>

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
                    placeholder="e.g. Tomorrow 6:00 AM"
                    value={formData.tripDate}
                    onChangeText={(v) => setFormData({ ...formData, tripDate: v })}
                  />

                  <Text style={styles.fieldLabel}>Destination</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Agra / Jaipur / Dehradun"
                    value={formData.destination || selectedRoute.name}
                    onChangeText={(v) => setFormData({ ...formData, destination: v })}
                  />

                  <TouchableOpacity
                    style={styles.submitActionButton}
                    onPress={() => handleFormSubmit('Outstation Highway Driver Booking')}
                    disabled={loading}
                  >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Confirm Outstation Driver</Text>}
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
            {/* PORTAL 4: DRIVER PARTNER DASHBOARD (JOB SEEKER)         */}
            {/* ------------------------------------------------------ */}
            {userRole === 'driver' && (
              <View>
                <View style={styles.portalHeaderBox}>
                  <Text style={styles.portalTag}>DRIVER PARTNER</Text>
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
                    style={[styles.segmentBtn, driverSubTab === 'academy' && styles.segmentBtnActive]}
                    onPress={() => setDriverSubTab('academy')}
                  >
                    <Text style={[styles.segmentBtnText, driverSubTab === 'academy' && styles.segmentBtnTextActive]}>
                      Academy
                    </Text>
                  </TouchableOpacity>
                </View>

                {driverSubTab === 'kyc' && (
                  <View style={styles.formContainerCard}>
                    <Text style={styles.formTitle}>Driver KYC Onboarding</Text>
                    <Text style={styles.formSubtitle}>Attach documents for police verification and direct placement.</Text>

                    <Text style={styles.fieldLabel}>Full Name (as per Aadhaar) *</Text>
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

                    <Text style={styles.fieldLabel}>License Category (LMV / Commercial)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Commercial LMV Badge"
                      value={formData.license}
                      onChangeText={(v) => setFormData({ ...formData, license: v })}
                    />

                    <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Document Attachments</Text>
                    <View style={styles.kycRow}>
                      <TouchableOpacity
                        style={[styles.kycUploadBtn, licenseImg && styles.kycUploadBtnSuccess]}
                        onPress={() => pickDoc('license')}
                      >
                        <Text style={styles.kycUploadIcon}>{licenseImg ? '✅' : '🪪'}</Text>
                        <Text style={styles.kycUploadLabel}>{licenseImg ? 'License Attached' : 'Attach DL'}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.kycUploadBtn, aadhaarImg && styles.kycUploadBtnSuccess]}
                        onPress={() => pickDoc('aadhaar')}
                      >
                        <Text style={styles.kycUploadIcon}>{aadhaarImg ? '✅' : '📄'}</Text>
                        <Text style={styles.kycUploadLabel}>{aadhaarImg ? 'Aadhaar Attached' : 'Attach Aadhaar'}</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.submitActionButton}
                      onPress={() => handleFormSubmit('Driver Partner KYC Registration')}
                      disabled={loading}
                    >
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Submit Application</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnWhatsAppOutline}
                      onPress={() => openWhatsApp(`नमस्ते ड्राइवर्स साथी, मेरा नाम ${formData.name || ''} है। मैं ड्राइवर के रूप में जुड़ना चाहता हूँ।`)}
                    >
                      <Text style={styles.btnWhatsAppOutlineText}>💬 Send KYC via WhatsApp</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {driverSubTab === 'jobs' && (
                  <View>
                    <View style={styles.jobCard}>
                      <Text style={styles.jobSalary}>₹22,000 - ₹24,000 / mo</Text>
                      <Text style={styles.jobTitle}>Chauffeur for Hyundai Creta</Text>
                      <Text style={styles.jobLocation}>📍 Vasant Vihar, South Delhi</Text>
                      <Text style={styles.jobDesc}>10 hours/day, 6 days a week. Office commute & family.</Text>
                      <TouchableOpacity style={styles.jobApplyBtn} onPress={() => setDriverSubTab('kyc')}>
                        <Text style={styles.jobApplyBtnText}>Apply for this Job</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.jobCard}>
                      <Text style={styles.jobSalary}>₹26,000 - ₹28,000 / mo</Text>
                      <Text style={styles.jobTitle}>Luxury Chauffeur (Mercedes / BMW)</Text>
                      <Text style={styles.jobLocation}>📍 Golf Course Road, Gurugram</Text>
                      <Text style={styles.jobDesc}>VIP Executive travel. Automatic transmission specialist.</Text>
                      <TouchableOpacity style={styles.jobApplyBtn} onPress={() => setDriverSubTab('kyc')}>
                        <Text style={styles.jobApplyBtnText}>Apply for this Job</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {driverSubTab === 'academy' && (
                  <View>
                    <Text style={styles.sectionTitle}>Chauffeur Etiquette Academy</Text>
                    <View style={styles.academyCard}>
                      <Text style={styles.academyTitle}>VIP Passenger Protocol</Text>
                      <Text style={styles.academyTip}>Always open the rear left door, keep AC at 23°C, and maintain zero gossip.</Text>
                    </View>
                    <View style={styles.academyCard}>
                      <Text style={styles.academyTitle}>Expressway Speed Rules</Text>
                      <Text style={styles.academyTip}>Never cross 100 km/h on Yamuna Expressway. Always use extreme left shoulder on breakdown.</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* Floating WhatsApp Action Button */}
      <TouchableOpacity style={styles.floatingWhatsApp} onPress={() => openWhatsApp()} activeOpacity={0.85}>
        <Text style={styles.floatingWhatsAppIcon}>💬</Text>
      </TouchableOpacity>

      {/* Confirmation Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalCheckCircle}>
              <Text style={styles.modalCheckMark}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>Received!</Text>
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

  // Welcome Screen (Role Selector)
  welcomeScroll: {
    padding: 18,
    backgroundColor: THEME.paperAlt,
    paddingBottom: 100,
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
    fontSize: 26,
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  portalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: THEME.marigoldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  portalEmoji: {
    fontSize: 24,
  },
  portalCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 3,
  },
  portalCardSub: {
    fontSize: 12,
    color: THEME.inkSoft,
    lineHeight: 17,
  },
  portalArrow: {
    fontSize: 22,
    color: THEME.marigoldDeep,
    fontWeight: '800',
    marginLeft: 10,
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

  // Portal View Common
  mainScroll: {
    padding: 16,
    backgroundColor: THEME.paperAlt,
    paddingBottom: 100,
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
    shadowColor: '#000',
    shadowOpacity: 0.08,
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
    elevation: 2,
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

  // Car Care & Fuel
  carDocCard: {
    backgroundColor: THEME.paper,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
  },
  docRow: {
    paddingVertical: 4,
  },
  docName: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.ink,
  },
  fuelInputCard: {
    backgroundColor: THEME.paper,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 14,
  },
  btnFuelSave: {
    backgroundColor: THEME.verified,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  btnFuelSaveText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  fuelEntryCard: {
    backgroundColor: THEME.paper,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 8,
  },
  fuelEntryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  fuelEntryDate: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.ink,
  },
  fuelEntryCost: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.marigoldDeep,
  },
  fuelEntryMeta: {
    fontSize: 12,
    color: THEME.inkSoft,
  },

  // Pricing Cards
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

  // Route Outstation
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
    marginBottom: 8,
  },
  routeItemLabel: {
    fontSize: 12.5,
    color: THEME.ink,
    marginBottom: 4,
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
  kycUploadIcon: {
    fontSize: 20,
    marginBottom: 3,
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
  jobDesc: {
    fontSize: 12,
    color: THEME.inkSoft,
    marginBottom: 10,
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
  academyCard: {
    backgroundColor: THEME.paper,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 10,
  },
  academyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
  },
  academyTip: {
    fontSize: 12,
    color: THEME.inkSoft,
    lineHeight: 17,
  },

  // Floating WhatsApp
  floatingWhatsApp: {
    position: 'absolute',
    bottom: 24,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.verifiedSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: THEME.verified,
  },
  modalCheckMark: {
    color: THEME.verified,
    fontSize: 30,
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
