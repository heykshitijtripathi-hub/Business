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
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Brand Colors ──────────────────────────────────────────────────────────────
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
  gold: '#F59E0B',
  goldSoft: '#FFFBEB',
  teal: '#0D9488',
  tealSoft: '#F0FDFA',
};

// ─── Route Database ─────────────────────────────────────────────────────────────
const ROUTES_DB = [
  { id: 'agra', name: 'Delhi to Agra (Yamuna Expressway)', city: 'Agra', distance: '210 km', toll: '₹415 One-way / ₹665 Return', driverDA: '₹400 Night Halt DA', rate: '₹1,500 / Day' },
  { id: 'jaipur', name: 'Delhi to Jaipur (Delhi-Mumbai Expy)', city: 'Jaipur', distance: '270 km', toll: '₹590 (Sohna-Dausa)', driverDA: '₹500 Night Halt DA', rate: '₹1,800 / Day' },
  { id: 'chandigarh', name: 'Delhi to Chandigarh (NH-44)', city: 'Chandigarh', distance: '250 km', toll: '₹390 Toll Plaza Total', driverDA: '₹400 Night Halt DA', rate: '₹1,600 / Day' },
  { id: 'dehradun', name: 'Delhi to Dehradun / Rishikesh', city: 'Dehradun', distance: '260 km', toll: '₹310 (Meerut Expy)', driverDA: '₹500 Night Halt DA', rate: '₹1,800 / Day' },
  { id: 'mathura', name: 'Delhi to Mathura / Vrindavan', city: 'Mathura', distance: '145 km', toll: '₹295 One-way', driverDA: '₹350 Night Halt DA', rate: '₹1,200 / Day' },
  { id: 'shimla', name: 'Delhi to Shimla (NH-5)', city: 'Shimla', distance: '345 km', toll: '₹520 Total', driverDA: '₹600 Night Halt DA', rate: '₹2,200 / Day' },
];

// ─── Job Listings ───────────────────────────────────────────────────────────────
const JOB_BOARD = [
  { id: 'j1', salary: '₹22,000 - ₹24,000 / mo', title: 'Personal Chauffeur for Hyundai Creta', location: 'Vasant Vihar, South Delhi', city: 'Delhi', badge: 'LMV', urgent: true },
  { id: 'j2', salary: '₹26,000 - ₹28,000 / mo', title: 'Luxury Chauffeur (Mercedes / BMW)', location: 'DLF Golf Course Road, Gurugram', city: 'Gurugram', badge: 'LMV + Luxury', urgent: false },
  { id: 'j3', salary: '₹18,000 - ₹20,000 / mo', title: 'Office Cab Driver for Startup', location: 'Cyber City, Gurugram', city: 'Gurugram', badge: 'Commercial LMV', urgent: false },
  { id: 'j4', salary: '₹20,000 - ₹22,000 / mo', title: 'Driver for SUV (Fortuner/Innova)', location: 'Noida Sector 62', city: 'Noida', badge: 'LMV', urgent: true },
  { id: 'j5', salary: '₹28,000 - ₹32,000 / mo', title: 'Executive Chauffeur for MD/CEO', location: 'Aerocity / IGI Airport Zone', city: 'Delhi', badge: 'LMV + PSV', urgent: false },
  { id: 'j6', salary: '₹16,000 - ₹18,000 / mo', title: 'School Van Driver (AC 12-Seater)', location: 'Dwarka Sector 22, Delhi', city: 'Delhi', badge: 'Commercial HMV', urgent: false },
  { id: 'j7', salary: '₹22,000 - ₹25,000 / mo', title: 'Night Shift Ola/Uber Fleet Driver', location: 'Faridabad, Haryana', city: 'Faridabad', badge: 'Commercial LMV', urgent: true },
  { id: 'j8', salary: '₹24,000 - ₹26,000 / mo', title: 'Airport Transfer Driver (Premium)', location: 'Mahipalpur, Delhi', city: 'Delhi', badge: 'LMV + PSV', urgent: false },
];

// ─── Festival / Surge Events ─────────────────────────────────────────────────────
const SURGE_EVENTS = [
  { id: 'dussehra', name: 'Navratri & Dussehra', date: 'Oct 2–12, 2026', surge: '20% surge on outstation bookings. Book now to lock in base rate.', active: true },
  { id: 'diwali', name: 'Diwali Weekend', date: 'Oct 20–24, 2026', surge: '₹500 extra per trip during Diwali week (peak demand zone).', active: false },
  { id: 'newyear', name: 'New Year Travel', date: 'Dec 30 – Jan 2, 2027', surge: 'Premium holiday rates apply. Limited drivers available.', active: false },
];

// ─── Grievance Tickets ────────────────────────────────────────────────────────────
const GRIEVANCE_STATUS = { open: '#EF4444', progress: '#F59E0B', resolved: '#10B981' };

export default function App() {
  const [lang, setLang] = useState('en');
  const [userRole, setUserRole] = useState(null);

  // Sub-tabs
  const [personalSubTab, setPersonalSubTab] = useState('book');
  const [fleetSubTab, setFleetSubTab] = useState('retainer');
  const [driverSubTab, setDriverSubTab] = useState('kyc');
  const [verifySubTab, setVerifySubTab] = useState('check');
  const [outstationSubTab, setOutstationSubTab] = useState('book');

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const [selectedRoute, setSelectedRoute] = useState(ROUTES_DB[0]);
  const [cityFilter, setCityFilter] = useState('All');

  // Quote Calculator
  const [quoteDays, setQuoteDays] = useState('1');
  const [quoteDriverType, setQuoteDriverType] = useState('personal');
  const [quoteResult, setQuoteResult] = useState(null);

  // Notification opt-in
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  // Payroll
  const [baseSalary, setBaseSalary] = useState('18000');
  const [otRate, setOtRate] = useState('80');
  const [payrollResult, setPayrollResult] = useState(null);

  // Grievance
  const [grievanceText, setGrievanceText] = useState('');
  const [grievances, setGrievances] = useState([
    { id: 'g1', issue: 'Driver arrived 45 minutes late on 8 Sep', status: 'resolved', date: '2026-09-08' },
  ]);

  // Saved Drivers (Favourite)
  const [savedDrivers, setSavedDrivers] = useState([
    { id: 'd1', name: 'Rajesh Kumar', badge: 'GOLD', years: '7 yrs exp', zone: 'South Delhi' },
    { id: 'd2', name: 'Vikram Singh', badge: 'SILVER', years: '4 yrs exp', zone: 'Gurugram' },
  ]);

  // Booking History
  const [bookingHistory, setBookingHistory] = useState([
    { id: 'b1', type: 'Personal Chauffeur', date: '2026-09-01', amount: '₹4,500', status: 'Completed' },
    { id: 'b2', type: 'Outstation — Jaipur', date: '2026-09-07', amount: '₹1,800', status: 'Completed' },
  ]);

  // In-app message (simulated)
  const [chatMessages, setChatMessages] = useState([
    { id: 'm1', from: 'support', text: 'Hello! I am your account manager at Drivers Saathi. How can I help you today?', time: '10:00 AM' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Duty Logbook
  const [logEntries, setLogEntries] = useState([]);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logInTime, setLogInTime] = useState('09:00 AM');
  const [logOutTime, setLogOutTime] = useState('07:30 PM');
  const [logKm, setLogKm] = useState('45');
  const [logOT, setLogOT] = useState('1.5');

  // Form
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', company: '', gstin: '',
    vehicle: '', location: '', count: '1', tripDate: '', destination: '',
    license: '', experience: '', replaceReason: '', referralName: '',
    referralPhone: '', verifyDriverDL: '', verifyDriverAadhaar: '',
    clientReferralCode: '', insurancePhone: '',
  });
  const [licenseImg, setLicenseImg] = useState(null);
  const [aadhaarImg, setAadhaarImg] = useState(null);

  // Multi-driver fleet dashboard
  const [fleetDrivers] = useState([
    { id: 'fd1', name: 'Mohan Lal', status: 'On Duty', vehicle: 'Swift Dzire', km: '142 km today', ot: '1.5 hrs', dlExpiry: '2027-03-15', badge: 'GOLD' },
    { id: 'fd2', name: 'Suresh Yadav', status: 'Off Duty', vehicle: 'Honda City', km: '0 km today', ot: '0 hrs', dlExpiry: '2026-11-30', badge: 'SILVER' },
    { id: 'fd3', name: 'Anil Sharma', status: 'Leave', vehicle: 'Innova Crysta', km: '0 km today', ot: '0 hrs', dlExpiry: '2028-06-22', badge: 'BRONZE' },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const savedRole = await AsyncStorage.getItem('@user_selected_role_v4');
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
    await AsyncStorage.setItem('@user_selected_role_v4', role);
  };

  const switchRole = async () => {
    setUserRole(null);
    await AsyncStorage.removeItem('@user_selected_role_v4');
  };

  const openWhatsApp = (prefilled = '') => {
    const text = prefilled || 'Hello Drivers Saathi! I need a verified driver. Please share pricing.';
    Linking.openURL(`https://wa.me/918175087004?text=${encodeURIComponent(text)}`);
  };

  const handleCall = () => Linking.openURL('tel:+918175087004');

  const handleSOS = () => {
    Alert.alert(
      'Roadside & Dispatch SOS',
      'Emergency hotline for Delhi NCR drivers and passengers.\n\nHelpline: +91 8175087004',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Call SOS Helpline', onPress: handleCall }]
    );
  };

  const pickDoc = async (type) => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.7 });
      if (!res.canceled && res.assets[0]) {
        if (type === 'license') setLicenseImg(res.assets[0].uri);
        else setAadhaarImg(res.assets[0].uri);
        Alert.alert('Attached', `${type === 'license' ? 'Driving License' : 'Aadhaar Card'} attached.`);
      }
    } catch (e) {}
  };

  const saveDutyLog = async () => {
    if (!logInTime || !logOutTime) { Alert.alert('Incomplete', 'Enter check-in and check-out times.'); return; }
    const newEntry = { id: Date.now().toString(), date: logDate, in: logInTime, out: logOutTime, km: `${logKm || 0} km`, ot: `${logOT || 0} hrs` };
    const updated = [newEntry, ...logEntries];
    setLogEntries(updated);
    await AsyncStorage.setItem('@duty_logs_v5', JSON.stringify(updated));
    Alert.alert('Saved', `Duty logged for ${logDate}`);
  };

  const calculateQuote = () => {
    const days = parseInt(quoteDays) || 1;
    const rateMap = { personal: 4500, fleet: 1800, outstation: 1500, verify: 1200 };
    const base = rateMap[quoteDriverType] || 4500;
    const total = quoteDriverType === 'fleet' ? base * days : base;
    setQuoteResult({ days, base, total, type: quoteDriverType });
  };

  const calculatePayroll = () => {
    const base = parseInt(baseSalary) || 18000;
    const rate = parseInt(otRate) || 80;
    const totalOTHrs = logEntries.reduce((sum, e) => sum + parseFloat(e.ot) || 0, 0);
    const otPay = Math.round(totalOTHrs * rate);
    const gross = base + otPay;
    setPayrollResult({ base, otPay, totalOTHrs: totalOTHrs.toFixed(1), gross });
  };

  const submitGrievance = () => {
    if (!grievanceText.trim()) { Alert.alert('Required', 'Please describe the issue.'); return; }
    const newG = { id: Date.now().toString(), issue: grievanceText, status: 'open', date: new Date().toISOString().split('T')[0] };
    setGrievances([newG, ...grievances]);
    setGrievanceText('');
    Alert.alert('Submitted', 'Your complaint has been registered. Our team will respond within 4 hours.');
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { id: Date.now().toString(), from: 'user', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages([...chatMessages, userMsg]);
    setChatInput('');
    setTimeout(() => {
      const reply = { id: Date.now().toString() + 'r', from: 'support', text: 'Thank you for your message! Our account manager will respond within 30 minutes. For urgent help call +91 8175087004.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatMessages(prev => [...prev, reply]);
    }, 1200);
  };

  const handleFormSubmit = async (type, pricingInfo = '') => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      Alert.alert('Required', 'Please enter Full Name and Phone Number.'); return;
    }
    setLoading(true);
    const autoResp = `Thank you for contacting Drivers Saathi! We received your ${type}. Our account manager will connect within 1 business day.\n\nFor urgent help: +91 8175087004 | support@driverssaathi.com`;
    const payload = {
      Category: type, 'Package Details': pricingInfo || 'Standard Service',
      Name: formData.name, 'Phone Number': formData.phone, Email: formData.email || 'Not Provided',
      Company: formData.company || 'Individual', GSTIN: formData.gstin || 'N/A',
      'Vehicle Model': formData.vehicle || 'Not specified', 'Location / Zone': formData.location || 'Delhi NCR',
      'Drivers Count': formData.count || '1', 'Trip Date': formData.tripDate || 'N/A',
      Destination: formData.destination || 'Delhi NCR', 'DL to Verify': formData.verifyDriverDL || 'N/A',
      'Aadhaar to Verify': formData.verifyDriverAadhaar || 'N/A', 'Replacement Reason': formData.replaceReason || 'N/A',
      'Referred Driver Name': formData.referralName || 'N/A', 'Referred Driver Phone': formData.referralPhone || 'N/A',
      'Client Referral Code': formData.clientReferralCode || 'N/A',
      'License Attached': licenseImg ? 'Yes' : 'Pending', 'Aadhaar Attached': aadhaarImg ? 'Yes' : 'Pending',
      'Alerts Opted In': alertsEnabled ? 'Yes' : 'No',
      _subject: `[Revenue Lead] ${type} - ${formData.name} (${formData.phone})`,
      _autoresponse: autoResp, _template: 'table', _captcha: 'false',
    };
    try {
      await fetch('https://formsubmit.co/ajax/support@driverssaathi.com', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (type.includes('Personal') || type.includes('Outstation') || type.includes('Fleet') || type.includes('Verification')) {
        setBookingHistory(prev => [{ id: Date.now().toString(), type, date: new Date().toISOString().split('T')[0], amount: pricingInfo || 'Quote Pending', status: 'Pending' }, ...prev]);
      }
      setModalMessage('Request delivered to support@driverssaathi.com\n\nOur account manager will contact you within 1 business day to confirm booking and invoice.\n\nA confirmation email has been sent to you.');
      setModalVisible(true);
      setFormData({ name: '', phone: '', email: '', company: '', gstin: '', vehicle: '', location: '', count: '1', tripDate: '', destination: '', license: '', experience: '', replaceReason: '', referralName: '', referralPhone: '', verifyDriverDL: '', verifyDriverAadhaar: '', clientReferralCode: '', insurancePhone: '' });
      setLicenseImg(null); setAadhaarImg(null);
    } catch (e) {
      setModalMessage('Request recorded. Our team will contact you shortly.');
      setModalVisible(true);
    } finally { setLoading(false); }
  };

  const getDLExpiryStatus = (dateStr) => {
    const days = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: 'EXPIRED', color: THEME.sosRed };
    if (days <= 60) return { label: `${days}d left`, color: '#F59E0B' };
    return { label: 'Valid', color: THEME.verified };
  };

  const badgeColor = (b) => b === 'GOLD' ? '#D97706' : b === 'SILVER' ? '#64748B' : '#92400E';

  const cities = ['All', 'Delhi', 'Gurugram', 'Noida', 'Faridabad'];
  const filteredJobs = cityFilter === 'All' ? JOB_BOARD : JOB_BOARD.filter(j => j.city === cityFilter);

  // ─── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar style="light" backgroundColor={THEME.ink} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image source={require('./assets/logo.png')} style={styles.brandLogo} resizeMode="contain" />
        </View>
        <View style={styles.headerRightButtons}>
          {userRole && (
            <TouchableOpacity style={styles.roleSwitchBtn} onPress={switchRole} activeOpacity={0.8}>
              <Text style={styles.roleSwitchBtnText}>Switch Portal</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.sosButton} onPress={handleSOS} activeOpacity={0.8}>
            <Text style={styles.sosButtonText}>SOS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.languageToggle} onPress={() => setLang(lang === 'en' ? 'hi' : 'en')} activeOpacity={0.8}>
            <Text style={styles.languageToggleText}>{lang === 'en' ? 'हिन्दी' : 'ENG'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Live ticker */}
      <View style={styles.liveTicker}>
        <View style={styles.livePulse} />
        <Text style={styles.liveTickerText}>
          {lang === 'en'
            ? 'Delhi NCR Dispatch Desk: Active & Verified (Mon-Sat 8AM-9PM)'
            : 'दिल्ली एनसीआर डिस्पैच: सक्रिय व वेरिफाइड (सोम-शनि 8AM-9PM)'}
        </Text>
      </View>

      {/* Surge banner */}
      {SURGE_EVENTS.filter(e => e.active).map(ev => (
        <View key={ev.id} style={styles.surgeBanner}>
          <Text style={styles.surgeBadge}>SEASONAL SURGE</Text>
          <Text style={styles.surgeTitle}>{ev.name} — {ev.date}</Text>
          <Text style={styles.surgeBody}>{ev.surge}</Text>
        </View>
      ))}

      {/* ── PORTAL SELECTOR ────────────────────────────────────────────────────── */}
      {!userRole ? (
        <ScrollView contentContainerStyle={styles.welcomeScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeHero}>
            <Text style={styles.welcomeBadge}>BUSINESS & SERVICE PORTALS</Text>
            <Text style={styles.welcomeTitle}>{lang === 'en' ? 'Drivers Saathi Platform' : 'ड्राइवर्स साथी प्लेटफॉर्म'}</Text>
            <Text style={styles.welcomeSub}>{lang === 'en' ? 'Select your requirement to view pricing, book drivers, or run background verifications.' : 'अपनी आवश्यकता अनुसार पोर्टल चुनें।'}</Text>
          </View>

          {[
            { role: 'personal', tag: 'REVENUE M1', color: '#FDBA74', tagColor: THEME.marigoldDeep, bgColor: THEME.marigoldLight, title: '1. Personal Chauffeur Placement', sub: 'Full-time police-verified chauffeur for private car. Includes 30-day replacement warranty.', price: '₹4,500 Fee' },
            { role: 'fleet', tag: 'REVENUE M2', color: '#93C5FD', tagColor: THEME.blue, bgColor: THEME.blueSoft, title: '2. Corporate Fleet Retainer', sub: 'Bulk drivers for cab fleets, staff shuttles & offices. Dedicated backup pool & GST invoices.', price: 'B2B Contract' },
            { role: 'outstation', tag: 'REVENUE M3', color: '#A7F3D0', tagColor: THEME.verified, bgColor: THEME.verifiedSoft, title: '3. Outstation & 1-Day Driver', sub: '1-Day highway driver for Agra, Jaipur, Chandigarh, Dehradun or airport drops.', price: '₹1,500/Day' },
            { role: 'verify', tag: 'REVENUE M4', color: '#FDE68A', tagColor: '#B45309', bgColor: '#FEF3C7', title: '4. Driver Background Verification', sub: 'Aadhaar ID, Driving License, criminal record screening & road driving audit.', price: '₹1,200 / Check' },
            { role: 'driver', tag: 'DRIVER JOBS', color: '#DDD6FE', tagColor: THEME.purple, bgColor: THEME.purpleSoft, title: '5. Driver Partner Application', sub: 'Join as a verified driver. KYC upload, browse Delhi NCR jobs, earn referral bonuses.', price: null },
          ].map(p => (
            <TouchableOpacity key={p.role} style={[styles.portalSelectCard, { borderColor: p.color }]} onPress={() => selectRole(p.role)} activeOpacity={0.88}>
              <View style={[styles.portalIconBox, { backgroundColor: p.bgColor }]}>
                <Text style={[styles.portalTagText, { color: p.tagColor }]}>{p.tag}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.titlePriceRow}>
                  <Text style={styles.portalCardTitle}>{p.title}</Text>
                  {p.price && <Text style={[styles.priceTag, { color: p.tagColor }]}>{p.price}</Text>}
                </View>
                <Text style={styles.portalCardSub}>{p.sub}</Text>
              </View>
              <Text style={styles.portalArrow}>&#8594;</Text>
            </TouchableOpacity>
          ))}

          {/* Quote Calculator on home screen */}
          <View style={styles.calcCard}>
            <Text style={styles.calcTitle}>Instant Quote Calculator</Text>
            <Text style={styles.calcSub}>Get pricing in seconds before booking</Text>
            <Text style={styles.fieldLabel}>Service Type</Text>
            <View style={styles.quoteTypeRow}>
              {[['personal', 'Personal'], ['fleet', 'Fleet (per slot)'], ['outstation', 'Outstation'], ['verify', 'Verify']].map(([key, label]) => (
                <TouchableOpacity key={key} style={[styles.quoteTypeBtn, quoteDriverType === key && styles.quoteTypeBtnActive]} onPress={() => setQuoteDriverType(key)}>
                  <Text style={[styles.quoteTypeBtnText, quoteDriverType === key && styles.quoteTypeBtnTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {quoteDriverType === 'fleet' && (
              <>
                <Text style={styles.fieldLabel}>Number of Driver Slots</Text>
                <TextInput style={styles.textInput} placeholder="e.g. 3" keyboardType="numeric" value={quoteDays} onChangeText={setQuoteDays} />
              </>
            )}
            <TouchableOpacity style={styles.btnCalc} onPress={calculateQuote}>
              <Text style={styles.btnCalcText}>Get Instant Quote</Text>
            </TouchableOpacity>
            {quoteResult && (
              <View style={styles.quoteResultBox}>
                <Text style={styles.quoteResultLabel}>{quoteResult.type === 'fleet' ? `${quoteResult.days} Driver Slots/Month` : 'One-time Service'}</Text>
                <Text style={styles.quoteResultAmount}>Total: ₹{quoteResult.total.toLocaleString('en-IN')}</Text>
                <Text style={styles.quoteResultNote}>Inclusive of placement fee. GST invoice available on request.</Text>
              </View>
            )}
          </View>

          <View style={styles.welcomeHelplineBox}>
            <Text style={styles.welcomeHelplineTitle}>Need immediate help from our account desk?</Text>
            <TouchableOpacity style={styles.actionCallBtn} onPress={handleCall} activeOpacity={0.9}>
              <Text style={styles.actionCallBtnText}>Call Dispatch: +91 8175087004</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        /* ── ACTIVE PORTALS ──────────────────────────────────────────────────── */
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>

            {/* ────────────────────────────────────────────────────────────────── */}
            {/* PORTAL 1: PERSONAL                                                */}
            {/* ────────────────────────────────────────────────────────────────── */}
            {userRole === 'personal' && (
              <View>
                <View style={styles.portalHeaderBox}>
                  <Text style={styles.portalTag}>REVENUE MODEL 1 • PAY-PER-HIRE</Text>
                  <Text style={styles.portalHeading}>Personal Chauffeur Placement</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  {[['book', 'Hire Chauffeur'], ['logbook', 'Duty Log & OT'], ['replace', '30-Day Warranty'], ['saved', 'Saved Drivers'], ['history', 'Booking History'], ['chat', 'Chat with Us'], ['grievance', 'Grievance'], ['insurance', 'Driver Insurance']].map(([key, label]) => (
                    <TouchableOpacity key={key} style={[styles.tabPill, personalSubTab === key && styles.tabPillActive]} onPress={() => setPersonalSubTab(key)}>
                      <Text style={[styles.tabPillText, personalSubTab === key && styles.tabPillTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Hire Chauffeur */}
                {personalSubTab === 'book' && (
                  <View style={styles.formContainerCard}>
                    <View style={styles.priceHeaderCard}>
                      <Text style={styles.priceHeaderTitle}>Pay-Per-Hire Placement Package</Text>
                      <Text style={styles.priceHeaderAmount}>₹4,500 One-time Fee</Text>
                      <Text style={styles.priceHeaderSub}>Includes Police Clearance + 30-Day Free Replacement Warranty</Text>
                    </View>
                    <Text style={styles.fieldLabel}>Your Full Name *</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. Priya Sharma" value={formData.name} onChangeText={v => setFormData({ ...formData, name: v })} />
                    <Text style={styles.fieldLabel}>Phone Number *</Text>
                    <TextInput style={styles.textInput} placeholder="+91 98765 43210" keyboardType="phone-pad" value={formData.phone} onChangeText={v => setFormData({ ...formData, phone: v })} />
                    <Text style={styles.fieldLabel}>Email Address</Text>
                    <TextInput style={styles.textInput} placeholder="name@example.com" keyboardType="email-address" value={formData.email} onChangeText={v => setFormData({ ...formData, email: v })} />
                    <Text style={styles.fieldLabel}>Car Model & Transmission</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. Honda City / Hyundai Creta (Automatic)" value={formData.vehicle} onChangeText={v => setFormData({ ...formData, vehicle: v })} />
                    <Text style={styles.fieldLabel}>Residence Area in Delhi NCR</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. South Delhi / DLF Phase 5 Gurugram" value={formData.location} onChangeText={v => setFormData({ ...formData, location: v })} />
                    <Text style={styles.fieldLabel}>Referral Code (optional — get ₹500 credit)</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. DS-REF-0042" value={formData.clientReferralCode} onChangeText={v => setFormData({ ...formData, clientReferralCode: v })} />

                    <View style={styles.alertOptInRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.alertOptLabel}>Get WhatsApp/SMS alerts when a driver is available near you</Text>
                      </View>
                      <Switch value={alertsEnabled} onValueChange={setAlertsEnabled} trackColor={{ true: THEME.marigold }} thumbColor={THEME.paper} />
                    </View>

                    <TouchableOpacity style={styles.submitActionButton} onPress={() => handleFormSubmit('Personal Chauffeur Placement (Pay-Per-Hire ₹4,500)', '₹4,500')} disabled={loading}>
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Book Personal Chauffeur (₹4,500)</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnWhatsAppOutline} onPress={() => openWhatsApp(`Hello Drivers Saathi, I want to book a personal chauffeur (Pay-Per-Hire ₹4,500) for my car in ${formData.location || 'Delhi NCR'}.`)}>
                      <Text style={styles.btnWhatsAppOutlineText}>Inquire via WhatsApp</Text>
                    </TouchableOpacity>

                    {/* Subscription Plan */}
                    <View style={styles.upsellCard}>
                      <Text style={styles.upsellBadge}>SAVE ₹500/MONTH</Text>
                      <Text style={styles.upsellTitle}>Monthly Subscription Plan</Text>
                      <Text style={styles.upsellDesc}>Instead of paying ₹4,500 per placement, subscribe at ₹3,500/month and get priority dispatch, dedicated account manager, and free replacement anytime.</Text>
                      <TouchableOpacity style={styles.btnUpsell} onPress={() => handleFormSubmit('Monthly Subscription Enquiry (₹3,500/mo)', '₹3,500/month subscription')}>
                        <Text style={styles.btnUpsellText}>Enquire Monthly Plan (₹3,500)</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Duty Logbook */}
                {personalSubTab === 'logbook' && (
                  <View>
                    <View style={styles.logCard}>
                      <Text style={styles.logCardTitle}>Record Daily Driver Duty & OT</Text>
                      <View style={styles.logInputRow}>
                        <View style={{ flex: 1 }}><Text style={styles.miniLabel}>Date</Text><TextInput style={styles.miniInput} value={logDate} onChangeText={setLogDate} /></View>
                        <View style={{ flex: 1 }}><Text style={styles.miniLabel}>In</Text><TextInput style={styles.miniInput} value={logInTime} onChangeText={setLogInTime} /></View>
                        <View style={{ flex: 1 }}><Text style={styles.miniLabel}>Out</Text><TextInput style={styles.miniInput} value={logOutTime} onChangeText={setLogOutTime} /></View>
                      </View>
                      <View style={styles.logInputRow}>
                        <View style={{ flex: 1 }}><Text style={styles.miniLabel}>Distance (km)</Text><TextInput style={styles.miniInput} value={logKm} onChangeText={setLogKm} keyboardType="numeric" /></View>
                        <View style={{ flex: 1 }}><Text style={styles.miniLabel}>OT (hrs)</Text><TextInput style={styles.miniInput} value={logOT} onChangeText={setLogOT} keyboardType="numeric" /></View>
                      </View>
                      <TouchableOpacity style={styles.btnLogSave} onPress={saveDutyLog}><Text style={styles.btnLogSaveText}>Save Duty Entry</Text></TouchableOpacity>
                    </View>
                    {/* Payroll Summary */}
                    <View style={styles.payrollCard}>
                      <Text style={styles.logCardTitle}>Monthly Payroll Summary</Text>
                      <View style={styles.logInputRow}>
                        <View style={{ flex: 1 }}><Text style={styles.miniLabel}>Base Salary (₹)</Text><TextInput style={styles.miniInput} value={baseSalary} onChangeText={setBaseSalary} keyboardType="numeric" /></View>
                        <View style={{ flex: 1 }}><Text style={styles.miniLabel}>OT Rate/hr (₹)</Text><TextInput style={styles.miniInput} value={otRate} onChangeText={setOtRate} keyboardType="numeric" /></View>
                      </View>
                      <TouchableOpacity style={styles.btnPayroll} onPress={calculatePayroll}><Text style={styles.btnLogSaveText}>Calculate Payroll</Text></TouchableOpacity>
                      {payrollResult && (
                        <View style={styles.payrollResult}>
                          <Text style={styles.payrollRow}>Base Salary: <Text style={styles.payrollVal}>₹{payrollResult.base.toLocaleString('en-IN')}</Text></Text>
                          <Text style={styles.payrollRow}>OT ({payrollResult.totalOTHrs} hrs x ₹{otRate}): <Text style={styles.payrollVal}>₹{payrollResult.otPay.toLocaleString('en-IN')}</Text></Text>
                          <Text style={[styles.payrollRow, { marginTop: 6 }]}>Gross Payable: <Text style={[styles.payrollVal, { color: THEME.marigold, fontSize: 17 }]}>₹{payrollResult.gross.toLocaleString('en-IN')}</Text></Text>
                        </View>
                      )}
                    </View>
                    {logEntries.map(e => (
                      <View key={e.id} style={styles.logEntryCard}>
                        <View style={styles.logEntryTop}><Text style={styles.logEntryDate}>{e.date}</Text><Text style={styles.logEntryOT}>+{e.ot} OT</Text></View>
                        <Text style={styles.logEntryMeta}>In: {e.in} • Out: {e.out} • {e.km}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* 30-Day Warranty */}
                {personalSubTab === 'replace' && (
                  <View style={styles.formContainerCard}>
                    <Text style={styles.formTitle}>30-Day Free Driver Replacement Claim</Text>
                    <Text style={styles.formSubtitle}>Priority SLA portal for active clients. Zero extra placement fee.</Text>
                    <Text style={styles.fieldLabel}>Client Name *</Text>
                    <TextInput style={styles.textInput} placeholder="Name on original placement invoice" value={formData.name} onChangeText={v => setFormData({ ...formData, name: v })} />
                    <Text style={styles.fieldLabel}>Phone Number *</Text>
                    <TextInput style={styles.textInput} placeholder="+91 98765 43210" keyboardType="phone-pad" value={formData.phone} onChangeText={v => setFormData({ ...formData, phone: v })} />
                    <Text style={styles.fieldLabel}>Reason for Replacement *</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. Driver left / Punctuality / Route knowledge" value={formData.replaceReason} onChangeText={v => setFormData({ ...formData, replaceReason: v })} />
                    <TouchableOpacity style={styles.submitActionButton} onPress={() => handleFormSubmit('30-Day Free Driver Replacement Claim')} disabled={loading}>
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Submit Replacement Claim</Text>}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Saved Drivers */}
                {personalSubTab === 'saved' && (
                  <View>
                    <Text style={styles.sectionHeading}>Your Saved Drivers</Text>
                    <Text style={styles.sectionSub}>Drivers you have worked with before — request them directly.</Text>
                    {savedDrivers.map(d => (
                      <View key={d.id} style={styles.savedDriverCard}>
                        <View style={[styles.driverBadgeDot, { backgroundColor: badgeColor(d.badge) }]} />
                        <View style={{ flex: 1 }}>
                          <View style={styles.driverNameRow}>
                            <Text style={styles.driverName}>{d.name}</Text>
                            <View style={[styles.badgeChip, { backgroundColor: badgeColor(d.badge) + '22' }]}>
                              <Text style={[styles.badgeChipText, { color: badgeColor(d.badge) }]}>{d.badge} DRIVER</Text>
                            </View>
                          </View>
                          <Text style={styles.driverMeta}>{d.zone} • {d.years}</Text>
                        </View>
                        <TouchableOpacity style={styles.btnRequestDriver} onPress={() => openWhatsApp(`Hello Drivers Saathi, I want to rebook driver ${d.name} from ${d.zone}.`)}>
                          <Text style={styles.btnRequestDriverText}>Request Again</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Booking History */}
                {personalSubTab === 'history' && (
                  <View>
                    <Text style={styles.sectionHeading}>Booking History</Text>
                    <Text style={styles.sectionSub}>Your past placements and payments.</Text>
                    {bookingHistory.map(b => (
                      <View key={b.id} style={styles.historyCard}>
                        <View style={styles.historyTop}>
                          <Text style={styles.historyType}>{b.type}</Text>
                          <Text style={[styles.historyStatus, { color: b.status === 'Completed' ? THEME.verified : THEME.marigoldDeep }]}>{b.status}</Text>
                        </View>
                        <Text style={styles.historyMeta}>{b.date} • {b.amount}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Chat */}
                {personalSubTab === 'chat' && (
                  <View style={styles.chatContainer}>
                    <Text style={styles.sectionHeading}>Chat with Account Manager</Text>
                    <View style={styles.chatBox}>
                      {chatMessages.map(m => (
                        <View key={m.id} style={[styles.chatBubble, m.from === 'user' ? styles.chatBubbleUser : styles.chatBubbleSupport]}>
                          <Text style={[styles.chatText, m.from === 'user' && { color: '#FFF' }]}>{m.text}</Text>
                          <Text style={[styles.chatTime, m.from === 'user' && { color: 'rgba(255,255,255,0.6)' }]}>{m.time}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.chatInputRow}>
                      <TextInput style={styles.chatInput} placeholder="Type a message..." value={chatInput} onChangeText={setChatInput} />
                      <TouchableOpacity style={styles.chatSendBtn} onPress={sendChatMessage}><Text style={styles.chatSendText}>Send</Text></TouchableOpacity>
                    </View>
                    <TouchableOpacity style={[styles.btnWhatsAppOutline, { marginTop: 10 }]} onPress={() => openWhatsApp()}>
                      <Text style={styles.btnWhatsAppOutlineText}>Continue on WhatsApp</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Grievance */}
                {personalSubTab === 'grievance' && (
                  <View>
                    <Text style={styles.sectionHeading}>Grievance & Complaint Tracker</Text>
                    <Text style={styles.sectionSub}>Raise a complaint. Our team resolves within 4 hours.</Text>
                    <View style={styles.formContainerCard}>
                      <Text style={styles.fieldLabel}>Describe the Issue *</Text>
                      <TextInput style={[styles.textInput, { height: 90, textAlignVertical: 'top' }]} multiline placeholder="e.g. Driver was late / rude behavior / route issue..." value={grievanceText} onChangeText={setGrievanceText} />
                      <TouchableOpacity style={styles.submitActionButton} onPress={submitGrievance}>
                        <Text style={styles.submitActionButtonText}>Submit Complaint</Text>
                      </TouchableOpacity>
                    </View>
                    {grievances.map(g => (
                      <View key={g.id} style={styles.grievanceCard}>
                        <View style={styles.grievanceTop}>
                          <Text style={styles.grievanceDate}>{g.date}</Text>
                          <View style={[styles.grievanceStatusChip, { backgroundColor: GRIEVANCE_STATUS[g.status] + '22' }]}>
                            <Text style={[styles.grievanceStatusText, { color: GRIEVANCE_STATUS[g.status] }]}>{g.status.toUpperCase()}</Text>
                          </View>
                        </View>
                        <Text style={styles.grievanceIssue}>{g.issue}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Insurance upsell */}
                {personalSubTab === 'insurance' && (
                  <View style={styles.formContainerCard}>
                    <View style={[styles.priceHeaderCard, { backgroundColor: '#1E3A5F' }]}>
                      <Text style={styles.priceHeaderTitle}>Driver Accident Insurance</Text>
                      <Text style={styles.priceHeaderAmount}>₹299 / month</Text>
                      <Text style={styles.priceHeaderSub}>Personal accident cover for your driver. Hospital expenses, partial disability & life cover.</Text>
                    </View>
                    <Text style={styles.fieldLabel}>Your Name *</Text>
                    <TextInput style={styles.textInput} placeholder="Car owner name" value={formData.name} onChangeText={v => setFormData({ ...formData, name: v })} />
                    <Text style={styles.fieldLabel}>Phone Number *</Text>
                    <TextInput style={styles.textInput} placeholder="+91 98765 43210" keyboardType="phone-pad" value={formData.phone} onChangeText={v => setFormData({ ...formData, phone: v })} />
                    <Text style={styles.fieldLabel}>Driver's Full Name</Text>
                    <TextInput style={styles.textInput} placeholder="Driver's name as on Aadhaar" value={formData.referralName} onChangeText={v => setFormData({ ...formData, referralName: v })} />
                    <TouchableOpacity style={[styles.submitActionButton, { backgroundColor: '#1E3A5F' }]} onPress={() => handleFormSubmit('Driver Insurance Enquiry (₹299/month)', '₹299/month accident cover')} disabled={loading}>
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Enquire Insurance Cover (₹299/mo)</Text>}
                    </TouchableOpacity>
                    <Text style={styles.calcSub}>Our partner insurance team will call you with policy documents within 24 hours.</Text>
                  </View>
                )}
              </View>
            )}

            {/* ────────────────────────────────────────────────────────────────── */}
            {/* PORTAL 2: FLEET                                                   */}
            {/* ────────────────────────────────────────────────────────────────── */}
            {userRole === 'fleet' && (
              <View>
                <View style={styles.portalHeaderBox}>
                  <Text style={styles.portalTag}>REVENUE MODEL 2 • MONTHLY RETAINER</Text>
                  <Text style={styles.portalHeading}>Corporate Fleet Retainer Hub</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  {[['retainer', 'Retainer Plans'], ['request', 'Fleet Request'], ['gst', 'GST Invoice'], ['dashboard', 'Driver Dashboard'], ['priority', 'Priority Listing']].map(([key, label]) => (
                    <TouchableOpacity key={key} style={[styles.tabPill, fleetSubTab === key && styles.tabPillActive]} onPress={() => setFleetSubTab(key)}>
                      <Text style={[styles.tabPillText, fleetSubTab === key && styles.tabPillTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Retainer Plans */}
                {fleetSubTab === 'retainer' && (
                  <View>
                    {[
                      { title: 'Monthly Driver Retainer', amount: '₹1,800 / Driver Slot / Month', desc: 'Dedicated backup pool. Guaranteed 2-4 hour replacement. Zero operational downtime.', btn: 'Contract Retainer Plan' },
                      { title: 'One-time Commercial Placement', amount: '₹4,000 / Placement', desc: 'Bulk driver onboarding for cab fleets and tour operators.', btn: 'Request Commercial Drivers' },
                      { title: 'Staff Shuttle Driver Pack', amount: '₹6,500 / 5 Drivers / Month', desc: 'Corporate shuttle drivers — background checked, shift-ready, includes backup.', btn: 'Get Shuttle Pack Quote' },
                    ].map((p, i) => (
                      <View key={i} style={styles.pricingCard}>
                        <Text style={styles.pricingTitle}>{p.title}</Text>
                        <Text style={styles.priceHeaderAmount}>{p.amount}</Text>
                        <Text style={styles.pricingDesc}>{p.desc}</Text>
                        <TouchableOpacity style={styles.btnPrimary} onPress={() => setFleetSubTab('request')}><Text style={styles.btnPrimaryText}>{p.btn}</Text></TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Fleet Request */}
                {fleetSubTab === 'request' && (
                  <View style={styles.formContainerCard}>
                    <Text style={styles.formTitle}>Corporate Fleet Requirement</Text>
                    <Text style={styles.formSubtitle}>For cab fleets, corporate shuttles & logistics operators.</Text>
                    <Text style={styles.fieldLabel}>Contact Person *</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. Amit Verma" value={formData.name} onChangeText={v => setFormData({ ...formData, name: v })} />
                    <Text style={styles.fieldLabel}>Mobile Number *</Text>
                    <TextInput style={styles.textInput} placeholder="+91 98765 43210" keyboardType="phone-pad" value={formData.phone} onChangeText={v => setFormData({ ...formData, phone: v })} />
                    <Text style={styles.fieldLabel}>Company / Fleet Name</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. NCR Fleet Logistics Pvt Ltd" value={formData.company} onChangeText={v => setFormData({ ...formData, company: v })} />
                    <Text style={styles.fieldLabel}>Number of Drivers Needed</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. 5 Drivers" keyboardType="numeric" value={formData.count} onChangeText={v => setFormData({ ...formData, count: v })} />
                    <TouchableOpacity style={styles.submitActionButton} onPress={() => handleFormSubmit('Corporate Fleet Placement Request', 'Monthly Retainer B2B Contract')} disabled={loading}>
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Submit Fleet Contract Request</Text>}
                    </TouchableOpacity>
                  </View>
                )}

                {/* GST Invoice */}
                {fleetSubTab === 'gst' && (
                  <View style={styles.formContainerCard}>
                    <Text style={styles.formTitle}>Request Corporate GST Invoice</Text>
                    <Text style={styles.formSubtitle}>Submit GSTIN to receive input tax credit invoices.</Text>
                    <Text style={styles.fieldLabel}>Registered Company Name *</Text>
                    <TextInput style={styles.textInput} placeholder="Company Name" value={formData.company} onChangeText={v => setFormData({ ...formData, company: v })} />
                    <Text style={styles.fieldLabel}>Company GSTIN *</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. 07AAAAA0000A1Z5" autoCapitalize="characters" value={formData.gstin} onChangeText={v => setFormData({ ...formData, gstin: v })} />
                    <Text style={styles.fieldLabel}>Accounts Phone Number *</Text>
                    <TextInput style={styles.textInput} placeholder="+91 98765 43210" keyboardType="phone-pad" value={formData.phone} onChangeText={v => setFormData({ ...formData, phone: v })} />
                    <TouchableOpacity style={styles.submitActionButton} onPress={() => handleFormSubmit('Corporate GST Invoice Request')} disabled={loading}>
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Request GST Invoice</Text>}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Multi-Driver Dashboard */}
                {fleetSubTab === 'dashboard' && (
                  <View>
                    <Text style={styles.sectionHeading}>Multi-Driver Fleet Dashboard</Text>
                    <Text style={styles.sectionSub}>Live status, DL expiry alerts & OT tracking for all your drivers.</Text>
                    {fleetDrivers.map(d => {
                      const dlStatus = getDLExpiryStatus(d.dlExpiry);
                      return (
                        <View key={d.id} style={styles.fleetDriverCard}>
                          <View style={styles.fleetDriverTop}>
                            <View style={{ flex: 1 }}>
                              <View style={styles.driverNameRow}>
                                <Text style={styles.driverName}>{d.name}</Text>
                                <View style={[styles.badgeChip, { backgroundColor: badgeColor(d.badge) + '22' }]}>
                                  <Text style={[styles.badgeChipText, { color: badgeColor(d.badge) }]}>{d.badge}</Text>
                                </View>
                              </View>
                              <Text style={styles.driverMeta}>{d.vehicle} • {d.km} • OT: {d.ot}</Text>
                            </View>
                            <View style={[styles.statusChip, { backgroundColor: d.status === 'On Duty' ? THEME.verifiedSoft : d.status === 'Leave' ? THEME.sosSoft : THEME.lineSoft }]}>
                              <Text style={[styles.statusChipText, { color: d.status === 'On Duty' ? THEME.verified : d.status === 'Leave' ? THEME.sosRed : THEME.inkSoft }]}>{d.status}</Text>
                            </View>
                          </View>
                          <View style={styles.dlExpiryRow}>
                            <Text style={styles.dlExpiryLabel}>DL Expiry: {d.dlExpiry}</Text>
                            <View style={[styles.dlStatusChip, { backgroundColor: dlStatus.color + '22' }]}>
                              <Text style={[styles.dlStatusText, { color: dlStatus.color }]}>{dlStatus.label}</Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Priority Listing */}
                {fleetSubTab === 'priority' && (
                  <View style={styles.formContainerCard}>
                    <View style={[styles.priceHeaderCard, { backgroundColor: '#1A1040' }]}>
                      <Text style={styles.priceHeaderTitle}>Priority Driver Listing</Text>
                      <Text style={styles.priceHeaderAmount}>₹500 / Month Add-on</Text>
                      <Text style={styles.priceHeaderSub}>Your drivers appear first in client search results. Faster job allocation. 3x more placement calls.</Text>
                    </View>
                    <Text style={styles.fieldLabel}>Company / Fleet Name *</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. NCR Fleet Pvt Ltd" value={formData.company} onChangeText={v => setFormData({ ...formData, company: v })} />
                    <Text style={styles.fieldLabel}>Contact Phone *</Text>
                    <TextInput style={styles.textInput} placeholder="+91 98765 43210" keyboardType="phone-pad" value={formData.phone} onChangeText={v => setFormData({ ...formData, phone: v })} />
                    <Text style={styles.fieldLabel}>Number of Drivers to Feature</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. 5" keyboardType="numeric" value={formData.count} onChangeText={v => setFormData({ ...formData, count: v })} />
                    <TouchableOpacity style={[styles.submitActionButton, { backgroundColor: THEME.purple }]} onPress={() => handleFormSubmit('Priority Driver Listing Subscription', '₹500/month per fleet')} disabled={loading}>
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Activate Priority Listing (₹500/mo)</Text>}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* ────────────────────────────────────────────────────────────────── */}
            {/* PORTAL 3: OUTSTATION                                              */}
            {/* ────────────────────────────────────────────────────────────────── */}
            {userRole === 'outstation' && (
              <View>
                <View style={styles.portalHeaderBox}>
                  <Text style={styles.portalTag}>REVENUE MODEL 3 • OUTSTATION COMMISSION</Text>
                  <Text style={styles.portalHeading}>1-Day & Highway Driver Booking</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  {[['book', 'Book Driver'], ['quote', 'Price Calculator'], ['alerts', 'Availability Alerts'], ['chat', 'Chat with Us']].map(([key, label]) => (
                    <TouchableOpacity key={key} style={[styles.tabPill, outstationSubTab === key && styles.tabPillActive]} onPress={() => setOutstationSubTab(key)}>
                      <Text style={[styles.tabPillText, outstationSubTab === key && styles.tabPillTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {outstationSubTab === 'book' && (
                  <View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routeScroll}>
                      {ROUTES_DB.map(r => (
                        <TouchableOpacity key={r.id} style={[styles.routePill, selectedRoute.id === r.id && styles.routePillActive]} onPress={() => setSelectedRoute(r)}>
                          <Text style={[styles.routePillText, selectedRoute.id === r.id && styles.routePillTextActive]}>{r.city}</Text>
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
                      <Text style={styles.fieldLabel}>Full Name *</Text>
                      <TextInput style={styles.textInput} placeholder="e.g. Rohit Kapoor" value={formData.name} onChangeText={v => setFormData({ ...formData, name: v })} />
                      <Text style={styles.fieldLabel}>Mobile Number *</Text>
                      <TextInput style={styles.textInput} placeholder="+91 98765 43210" keyboardType="phone-pad" value={formData.phone} onChangeText={v => setFormData({ ...formData, phone: v })} />
                      <Text style={styles.fieldLabel}>Trip Date & Departure Time *</Text>
                      <TextInput style={styles.textInput} placeholder="e.g. Tomorrow 6:00 AM Departure" value={formData.tripDate} onChangeText={v => setFormData({ ...formData, tripDate: v })} />
                      <TouchableOpacity style={styles.submitActionButton} onPress={() => handleFormSubmit('Outstation Highway Driver Booking', `${selectedRoute.name} (${selectedRoute.rate})`)} disabled={loading}>
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Confirm Highway Driver ({selectedRoute.rate})</Text>}
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.btnWhatsAppOutline} onPress={() => openWhatsApp(`Hello Drivers Saathi, I want to book an outstation driver to ${selectedRoute.city}. Departure: ${formData.tripDate || 'This Weekend'}.`)}>
                        <Text style={styles.btnWhatsAppOutlineText}>Book Instantly via WhatsApp</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {outstationSubTab === 'quote' && (
                  <View style={styles.calcCard}>
                    <Text style={styles.calcTitle}>Outstation Trip Price Calculator</Text>
                    <Text style={styles.calcSub}>Select route and number of days to get full trip estimate.</Text>
                    <Text style={styles.fieldLabel}>Select Route</Text>
                    {ROUTES_DB.map(r => (
                      <TouchableOpacity key={r.id} style={[styles.routeSelectRow, selectedRoute.id === r.id && styles.routeSelectRowActive]} onPress={() => setSelectedRoute(r)}>
                        <Text style={[styles.routeSelectText, selectedRoute.id === r.id && { color: THEME.marigoldDeep, fontWeight: '800' }]}>{r.name}</Text>
                        <Text style={styles.routeSelectRate}>{r.rate}</Text>
                      </TouchableOpacity>
                    ))}
                    <Text style={styles.fieldLabel}>Number of Days</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. 2" keyboardType="numeric" value={quoteDays} onChangeText={setQuoteDays} />
                    <TouchableOpacity style={styles.btnCalc} onPress={() => {
                      const days = parseInt(quoteDays) || 1;
                      const baseRate = parseInt(selectedRoute.rate.replace(/[^0-9]/g, '')) || 1500;
                      const total = baseRate * days;
                      setQuoteResult({ days, base: baseRate, total, type: 'outstation' });
                    }}>
                      <Text style={styles.btnCalcText}>Calculate Trip Cost</Text>
                    </TouchableOpacity>
                    {quoteResult && quoteResult.type === 'outstation' && (
                      <View style={styles.quoteResultBox}>
                        <Text style={styles.quoteResultLabel}>{selectedRoute.name} • {quoteResult.days} Day(s)</Text>
                        <Text style={styles.quoteResultAmount}>Driver Fee: ₹{quoteResult.total.toLocaleString('en-IN')}</Text>
                        <Text style={styles.quoteResultNote}>+ FASTag Toll ({selectedRoute.toll}) + Driver DA ({selectedRoute.driverDA})</Text>
                      </View>
                    )}
                  </View>
                )}

                {outstationSubTab === 'alerts' && (
                  <View style={styles.formContainerCard}>
                    <Text style={styles.formTitle}>Driver Availability Alerts</Text>
                    <Text style={styles.formSubtitle}>Get WhatsApp/SMS alerts when a highway driver is available for your preferred route.</Text>
                    <Text style={styles.fieldLabel}>Your Name *</Text>
                    <TextInput style={styles.textInput} placeholder="Full Name" value={formData.name} onChangeText={v => setFormData({ ...formData, name: v })} />
                    <Text style={styles.fieldLabel}>WhatsApp Number *</Text>
                    <TextInput style={styles.textInput} placeholder="+91 98765 43210" keyboardType="phone-pad" value={formData.phone} onChangeText={v => setFormData({ ...formData, phone: v })} />
                    <Text style={styles.fieldLabel}>Preferred Route</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      {ROUTES_DB.map(r => (
                        <TouchableOpacity key={r.id} style={[styles.routePill, selectedRoute.id === r.id && styles.routePillActive]} onPress={() => setSelectedRoute(r)}>
                          <Text style={[styles.routePillText, selectedRoute.id === r.id && styles.routePillTextActive]}>{r.city}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.alertOptInRow}>
                      <Text style={styles.alertOptLabel}>Enable WhatsApp & SMS Alerts (₹199/month)</Text>
                      <Switch value={alertsEnabled} onValueChange={setAlertsEnabled} trackColor={{ true: THEME.marigold }} thumbColor={THEME.paper} />
                    </View>
                    <TouchableOpacity style={styles.submitActionButton} onPress={() => handleFormSubmit('Driver Availability Alert Subscription (₹199/month)', '₹199/month alert pack')} disabled={loading}>
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Subscribe Alerts (₹199/mo)</Text>}
                    </TouchableOpacity>
                  </View>
                )}

                {outstationSubTab === 'chat' && (
                  <View style={styles.chatContainer}>
                    <Text style={styles.sectionHeading}>Chat with Account Manager</Text>
                    <View style={styles.chatBox}>
                      {chatMessages.map(m => (
                        <View key={m.id} style={[styles.chatBubble, m.from === 'user' ? styles.chatBubbleUser : styles.chatBubbleSupport]}>
                          <Text style={[styles.chatText, m.from === 'user' && { color: '#FFF' }]}>{m.text}</Text>
                          <Text style={[styles.chatTime, m.from === 'user' && { color: 'rgba(255,255,255,0.6)' }]}>{m.time}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.chatInputRow}>
                      <TextInput style={styles.chatInput} placeholder="Type a message..." value={chatInput} onChangeText={setChatInput} />
                      <TouchableOpacity style={styles.chatSendBtn} onPress={sendChatMessage}><Text style={styles.chatSendText}>Send</Text></TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* ────────────────────────────────────────────────────────────────── */}
            {/* PORTAL 4: VERIFY                                                  */}
            {/* ────────────────────────────────────────────────────────────────── */}
            {userRole === 'verify' && (
              <View>
                <View style={styles.portalHeaderBox}>
                  <Text style={styles.portalTag}>REVENUE MODEL 4 • BACKGROUND CHECK</Text>
                  <Text style={styles.portalHeading}>Driver Verification Package</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  {[['check', 'Run Verification'], ['status', 'Check Status'], ['chat', 'Support Chat']].map(([key, label]) => (
                    <TouchableOpacity key={key} style={[styles.tabPill, verifySubTab === key && styles.tabPillActive]} onPress={() => setVerifySubTab(key)}>
                      <Text style={[styles.tabPillText, verifySubTab === key && styles.tabPillTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {verifySubTab === 'check' && (
                  <View style={styles.formContainerCard}>
                    <View style={styles.priceHeaderCard}>
                      <Text style={styles.priceHeaderTitle}>Driver Background Check Package</Text>
                      <Text style={styles.priceHeaderAmount}>₹1,200 / Driver Verification</Text>
                      <Text style={styles.priceHeaderSub}>Aadhaar ID + DL Validity + Criminal Record Screening + Road Driving Audit</Text>
                    </View>
                    <Text style={styles.fieldLabel}>Vehicle Owner Name *</Text>
                    <TextInput style={styles.textInput} placeholder="Car Owner Full Name" value={formData.name} onChangeText={v => setFormData({ ...formData, name: v })} />
                    <Text style={styles.fieldLabel}>Owner Phone Number *</Text>
                    <TextInput style={styles.textInput} placeholder="+91 98765 43210" keyboardType="phone-pad" value={formData.phone} onChangeText={v => setFormData({ ...formData, phone: v })} />
                    <Text style={styles.fieldLabel}>Driver's DL Number *</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. DL-0420110012345" autoCapitalize="characters" value={formData.verifyDriverDL} onChangeText={v => setFormData({ ...formData, verifyDriverDL: v })} />
                    <Text style={styles.fieldLabel}>Driver's Aadhaar Number *</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. 1234 5678 9012" keyboardType="numeric" value={formData.verifyDriverAadhaar} onChangeText={v => setFormData({ ...formData, verifyDriverAadhaar: v })} />
                    <TouchableOpacity style={styles.submitActionButton} onPress={() => handleFormSubmit('Driver Background Verification Request (₹1,200)', '₹1,200 Verification Package')} disabled={loading}>
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Request Verification (₹1,200)</Text>}
                    </TouchableOpacity>
                  </View>
                )}

                {verifySubTab === 'status' && (
                  <View>
                    <Text style={styles.sectionHeading}>Verification Status Tracker</Text>
                    <Text style={styles.sectionSub}>Status updates for recent verification requests.</Text>
                    {[
                      { dl: 'DL-04201100XXXXX', aadhaar: '1234 XXXX XXXX', status: 'Completed', result: 'Clear — No criminal record. License valid till 2029.', date: '2026-09-05' },
                    ].map((v, i) => (
                      <View key={i} style={styles.historyCard}>
                        <View style={styles.historyTop}>
                          <Text style={styles.historyType}>DL: {v.dl}</Text>
                          <Text style={[styles.historyStatus, { color: THEME.verified }]}>{v.status}</Text>
                        </View>
                        <Text style={styles.historyMeta}>{v.date}</Text>
                        <Text style={[styles.historyMeta, { color: THEME.verified, marginTop: 4 }]}>{v.result}</Text>
                      </View>
                    ))}
                    <View style={styles.formContainerCard}>
                      <Text style={styles.formSubtitle}>Check status of a new verification by calling our team or sending the DL number on WhatsApp.</Text>
                      <TouchableOpacity style={styles.btnWhatsAppOutline} onPress={() => openWhatsApp('Hello, I want to check my driver verification status. DL Number: ')}>
                        <Text style={styles.btnWhatsAppOutlineText}>Check Status on WhatsApp</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {verifySubTab === 'chat' && (
                  <View style={styles.chatContainer}>
                    <Text style={styles.sectionHeading}>Verification Support Chat</Text>
                    <View style={styles.chatBox}>
                      {chatMessages.map(m => (
                        <View key={m.id} style={[styles.chatBubble, m.from === 'user' ? styles.chatBubbleUser : styles.chatBubbleSupport]}>
                          <Text style={[styles.chatText, m.from === 'user' && { color: '#FFF' }]}>{m.text}</Text>
                          <Text style={[styles.chatTime, m.from === 'user' && { color: 'rgba(255,255,255,0.6)' }]}>{m.time}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.chatInputRow}>
                      <TextInput style={styles.chatInput} placeholder="Type a message..." value={chatInput} onChangeText={setChatInput} />
                      <TouchableOpacity style={styles.chatSendBtn} onPress={sendChatMessage}><Text style={styles.chatSendText}>Send</Text></TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* ────────────────────────────────────────────────────────────────── */}
            {/* PORTAL 5: DRIVER PARTNER                                          */}
            {/* ────────────────────────────────────────────────────────────────── */}
            {userRole === 'driver' && (
              <View>
                <View style={styles.portalHeaderBox}>
                  <Text style={styles.portalTag}>DRIVER RECRUITMENT</Text>
                  <Text style={styles.portalHeading}>Saathi Driver Hub</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  {[['kyc', 'KYC & Join'], ['jobs', 'Job Board'], ['refer', 'Refer & Earn'], ['badges', 'Driver Badges'], ['chat', 'Support Chat']].map(([key, label]) => (
                    <TouchableOpacity key={key} style={[styles.tabPill, driverSubTab === key && styles.tabPillActive]} onPress={() => setDriverSubTab(key)}>
                      <Text style={[styles.tabPillText, driverSubTab === key && styles.tabPillTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* KYC */}
                {driverSubTab === 'kyc' && (
                  <View style={styles.formContainerCard}>
                    <Text style={styles.formTitle}>Driver KYC Onboarding</Text>
                    <Text style={styles.formSubtitle}>Attach documents for police verification and direct placement.</Text>
                    <Text style={styles.fieldLabel}>Full Name (as on Aadhaar) *</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. Ramesh Kumar" value={formData.name} onChangeText={v => setFormData({ ...formData, name: v })} />
                    <Text style={styles.fieldLabel}>Phone (WhatsApp) *</Text>
                    <TextInput style={styles.textInput} placeholder="+91 98765 43210" keyboardType="phone-pad" value={formData.phone} onChangeText={v => setFormData({ ...formData, phone: v })} />
                    <Text style={styles.fieldLabel}>License Category</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. Commercial LMV Badge" value={formData.license} onChangeText={v => setFormData({ ...formData, license: v })} />
                    <Text style={styles.fieldLabel}>Years of Experience</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. 5 years" value={formData.experience} onChangeText={v => setFormData({ ...formData, experience: v })} />
                    <Text style={styles.fieldLabel}>Preferred City / Zone</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. South Delhi / Gurugram" value={formData.location} onChangeText={v => setFormData({ ...formData, location: v })} />
                    <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Attach Verification Documents</Text>
                    <View style={styles.kycRow}>
                      <TouchableOpacity style={[styles.kycUploadBtn, licenseImg && styles.kycUploadBtnSuccess]} onPress={() => pickDoc('license')}>
                        <Text style={styles.kycUploadLabel}>{licenseImg ? 'License Attached' : 'Attach License'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.kycUploadBtn, aadhaarImg && styles.kycUploadBtnSuccess]} onPress={() => pickDoc('aadhaar')}>
                        <Text style={styles.kycUploadLabel}>{aadhaarImg ? 'Aadhaar Attached' : 'Attach Aadhaar'}</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.submitActionButton} onPress={() => handleFormSubmit('Driver Partner KYC Registration')} disabled={loading}>
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Submit Application</Text>}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Job Board with City Filter */}
                {driverSubTab === 'jobs' && (
                  <View>
                    <Text style={styles.sectionHeading}>Delhi NCR Job Board</Text>
                    <Text style={styles.sectionSub}>Filter by city and apply directly.</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                      {cities.map(c => (
                        <TouchableOpacity key={c} style={[styles.routePill, cityFilter === c && styles.routePillActive]} onPress={() => setCityFilter(c)}>
                          <Text style={[styles.routePillText, cityFilter === c && styles.routePillTextActive]}>{c}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    {filteredJobs.map(j => (
                      <View key={j.id} style={styles.jobCard}>
                        <View style={styles.jobTop}>
                          <Text style={styles.jobSalary}>{j.salary}</Text>
                          {j.urgent && <View style={styles.urgentChip}><Text style={styles.urgentText}>URGENT</Text></View>}
                        </View>
                        <Text style={styles.jobTitle}>{j.title}</Text>
                        <Text style={styles.jobLocation}>{j.location} • Badge: {j.badge}</Text>
                        <TouchableOpacity style={styles.jobApplyBtn} onPress={() => setDriverSubTab('kyc')}>
                          <Text style={styles.jobApplyBtnText}>Apply for this Duty</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Refer & Earn */}
                {driverSubTab === 'refer' && (
                  <View style={styles.formContainerCard}>
                    <View style={[styles.priceHeaderCard, { backgroundColor: '#064E3B' }]}>
                      <Text style={styles.priceHeaderTitle}>Refer & Earn Program</Text>
                      <Text style={styles.priceHeaderAmount}>₹500 per Referral</Text>
                      <Text style={styles.priceHeaderSub}>Earn ₹500 when your referred driver completes 30 days of duty. No limit on referrals.</Text>
                    </View>
                    <Text style={styles.fieldLabel}>Your Name *</Text>
                    <TextInput style={styles.textInput} placeholder="Your Full Name" value={formData.name} onChangeText={v => setFormData({ ...formData, name: v })} />
                    <Text style={styles.fieldLabel}>Your Phone *</Text>
                    <TextInput style={styles.textInput} placeholder="+91 98765 43210" keyboardType="phone-pad" value={formData.phone} onChangeText={v => setFormData({ ...formData, phone: v })} />
                    <Text style={styles.fieldLabel}>Referred Driver's Name *</Text>
                    <TextInput style={styles.textInput} placeholder="Friend's Full Name" value={formData.referralName} onChangeText={v => setFormData({ ...formData, referralName: v })} />
                    <Text style={styles.fieldLabel}>Referred Driver's Phone *</Text>
                    <TextInput style={styles.textInput} placeholder="Friend's Phone Number" keyboardType="phone-pad" value={formData.referralPhone} onChangeText={v => setFormData({ ...formData, referralPhone: v })} />
                    <TouchableOpacity style={[styles.submitActionButton, { backgroundColor: '#065F46' }]} onPress={() => handleFormSubmit('Driver Referral Submission', '₹500 referral bonus on 30-day completion')} disabled={loading}>
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionButtonText}>Submit Driver Referral</Text>}
                    </TouchableOpacity>
                    <View style={styles.referEarnInfo}>
                      <Text style={styles.referEarnInfoText}>How it works:</Text>
                      <Text style={styles.referEarnInfoItem}>1. You submit your friend's details above</Text>
                      <Text style={styles.referEarnInfoItem}>2. Our team calls your friend and onboards them</Text>
                      <Text style={styles.referEarnInfoItem}>3. After 30 days of duty — you receive ₹500 via UPI</Text>
                      <Text style={styles.referEarnInfoItem}>4. No limit on how many friends you can refer</Text>
                    </View>
                  </View>
                )}

                {/* Driver Badges */}
                {driverSubTab === 'badges' && (
                  <View>
                    <Text style={styles.sectionHeading}>Driver Trust Badge System</Text>
                    <Text style={styles.sectionSub}>Earn badges based on your job completion rate and client reviews.</Text>
                    {[
                      { badge: 'GOLD', color: '#D97706', bg: '#FEF3C7', req: '5+ years experience, 50+ jobs, 4.8+ rating', earn: 'Priority placement, ₹2,000+ salary premium, premium job access' },
                      { badge: 'SILVER', color: '#64748B', bg: '#F1F5F9', req: '2-4 years experience, 20+ jobs, 4.5+ rating', earn: 'Featured in search, ₹1,000 salary premium, faster callback' },
                      { badge: 'BRONZE', color: '#92400E', bg: '#FEF3C7', req: 'Fresh verified driver, completed KYC & training', earn: 'Listed in job board, standard placement, building reputation' },
                    ].map(b => (
                      <View key={b.badge} style={[styles.badgeInfoCard, { borderColor: b.color, backgroundColor: b.bg }]}>
                        <View style={[styles.badgeLargeChip, { backgroundColor: b.color }]}>
                          <Text style={styles.badgeLargeText}>{b.badge} DRIVER</Text>
                        </View>
                        <Text style={styles.badgeReq}>Requirements: {b.req}</Text>
                        <Text style={styles.badgeEarn}>Benefits: {b.earn}</Text>
                      </View>
                    ))}
                    <TouchableOpacity style={styles.submitActionButton} onPress={() => setDriverSubTab('kyc')}>
                      <Text style={styles.submitActionButtonText}>Start KYC to Earn Your Badge</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Support Chat */}
                {driverSubTab === 'chat' && (
                  <View style={styles.chatContainer}>
                    <Text style={styles.sectionHeading}>Driver Support Chat</Text>
                    <View style={styles.chatBox}>
                      {chatMessages.map(m => (
                        <View key={m.id} style={[styles.chatBubble, m.from === 'user' ? styles.chatBubbleUser : styles.chatBubbleSupport]}>
                          <Text style={[styles.chatText, m.from === 'user' && { color: '#FFF' }]}>{m.text}</Text>
                          <Text style={[styles.chatTime, m.from === 'user' && { color: 'rgba(255,255,255,0.6)' }]}>{m.time}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.chatInputRow}>
                      <TextInput style={styles.chatInput} placeholder="Type a message..." value={chatInput} onChangeText={setChatInput} />
                      <TouchableOpacity style={styles.chatSendBtn} onPress={sendChatMessage}><Text style={styles.chatSendText}>Send</Text></TouchableOpacity>
                    </View>
                    <TouchableOpacity style={[styles.btnWhatsAppOutline, { marginTop: 10 }]} onPress={() => openWhatsApp('Hello Drivers Saathi, I am a driver partner and need assistance.')}>
                      <Text style={styles.btnWhatsAppOutlineText}>Continue on WhatsApp</Text>
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

// ─── STYLES ──────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: THEME.ink },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: THEME.ink, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  brandLogo: { width: 150, height: 38 },
  headerRightButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleSwitchBtn: { backgroundColor: 'rgba(255,255,255,0.12)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  roleSwitchBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  sosButton: { backgroundColor: THEME.sosSoft, paddingVertical: 5, paddingHorizontal: 9, borderRadius: 14, borderWidth: 1, borderColor: '#FCA5A5' },
  sosButtonText: { color: THEME.sosRed, fontSize: 11, fontWeight: '800' },
  languageToggle: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 14 },
  languageToggleText: { color: THEME.paper, fontSize: 11, fontWeight: '700' },

  liveTicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.cardNavy, paddingVertical: 6, paddingHorizontal: 12, gap: 8 },
  livePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: THEME.verified },
  liveTickerText: { color: '#E2E8F0', fontSize: 11, fontWeight: '600' },

  surgeBanner: { backgroundColor: '#7C1D1D', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#991B1B' },
  surgeBadge: { color: '#FCA5A5', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
  surgeTitle: { color: '#FFF', fontSize: 13, fontWeight: '800', marginBottom: 2 },
  surgeBody: { color: '#FECACA', fontSize: 11.5 },

  welcomeScroll: { padding: 18, backgroundColor: THEME.paperAlt, paddingBottom: 60 },
  welcomeHero: { marginTop: 8, marginBottom: 20 },
  welcomeBadge: { color: THEME.marigoldDeep, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  welcomeTitle: { fontSize: 25, fontWeight: '800', color: THEME.ink, marginBottom: 6 },
  welcomeSub: { fontSize: 13.5, color: THEME.inkSoft, lineHeight: 20 },

  portalSelectCard: { backgroundColor: THEME.paper, borderRadius: 16, padding: 16, borderWidth: 1.5, marginBottom: 14, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  portalIconBox: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: THEME.marigoldLight, marginRight: 12 },
  portalTagText: { fontSize: 9, fontWeight: '800', color: THEME.marigoldDeep, letterSpacing: 0.6 },
  titlePriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  portalCardTitle: { fontSize: 14, fontWeight: '800', color: THEME.ink, flex: 1 },
  priceTag: { fontSize: 11.5, fontWeight: '800', color: THEME.marigoldDeep, marginLeft: 6 },
  portalCardSub: { fontSize: 11.5, color: THEME.inkSoft, lineHeight: 16 },
  portalArrow: { fontSize: 20, color: THEME.marigoldDeep, fontWeight: '800', marginLeft: 8 },

  welcomeHelplineBox: { backgroundColor: THEME.cardNavy, borderRadius: 14, padding: 16, marginTop: 10, alignItems: 'center' },
  welcomeHelplineTitle: { color: '#E2E8F0', fontSize: 13, marginBottom: 10 },

  calcCard: { backgroundColor: THEME.paper, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: THEME.line, marginBottom: 14 },
  calcTitle: { fontSize: 17, fontWeight: '800', color: THEME.ink, marginBottom: 2 },
  calcSub: { fontSize: 12, color: THEME.inkSoft, marginBottom: 10 },
  quoteTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  quoteTypeBtn: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 20, backgroundColor: THEME.lineSoft, borderWidth: 1, borderColor: THEME.line },
  quoteTypeBtnActive: { backgroundColor: THEME.marigold, borderColor: THEME.marigold },
  quoteTypeBtnText: { fontSize: 12, fontWeight: '600', color: THEME.inkSoft },
  quoteTypeBtnTextActive: { color: '#FFF', fontWeight: '800' },
  btnCalc: { backgroundColor: THEME.ink, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnCalcText: { color: '#FFF', fontWeight: '700', fontSize: 13.5 },
  quoteResultBox: { backgroundColor: THEME.marigoldLight, borderRadius: 10, padding: 14, marginTop: 10, borderWidth: 1, borderColor: '#FDBA74' },
  quoteResultLabel: { fontSize: 11, fontWeight: '700', color: THEME.marigoldDeep, textTransform: 'uppercase', letterSpacing: 0.5 },
  quoteResultAmount: { fontSize: 22, fontWeight: '800', color: THEME.ink, marginVertical: 2 },
  quoteResultNote: { fontSize: 11.5, color: THEME.inkSoft },

  mainScroll: { padding: 16, backgroundColor: THEME.paperAlt, paddingBottom: 60 },
  portalHeaderBox: { marginBottom: 14 },
  portalTag: { color: THEME.marigoldDeep, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 2 },
  portalHeading: { fontSize: 22, fontWeight: '800', color: THEME.ink },

  tabPill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: THEME.paper, borderWidth: 1, borderColor: THEME.line, marginRight: 8 },
  tabPillActive: { backgroundColor: THEME.ink, borderColor: THEME.ink },
  tabPillText: { fontSize: 12, fontWeight: '600', color: THEME.inkSoft },
  tabPillTextActive: { color: THEME.marigold, fontWeight: '800' },

  formContainerCard: { backgroundColor: THEME.paper, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: THEME.line },
  priceHeaderCard: { backgroundColor: THEME.cardNavy, borderRadius: 12, padding: 14, marginBottom: 14 },
  priceHeaderTitle: { color: '#94A3B8', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  priceHeaderAmount: { color: THEME.marigold, fontSize: 22, fontWeight: '800', marginTop: 2, marginBottom: 2 },
  priceHeaderSub: { color: '#E2E8F0', fontSize: 11.5 },
  formTitle: { fontSize: 18, fontWeight: '800', color: THEME.ink, marginBottom: 4 },
  formSubtitle: { fontSize: 12.5, color: THEME.inkSoft, lineHeight: 18, marginBottom: 14 },
  fieldLabel: { fontSize: 12.5, fontWeight: '700', color: THEME.ink, marginTop: 10, marginBottom: 5 },
  textInput: { backgroundColor: THEME.paperAlt, borderWidth: 1, borderColor: THEME.line, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13.5, color: THEME.ink },
  submitActionButton: { backgroundColor: THEME.marigold, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  submitActionButtonText: { color: THEME.paper, fontWeight: '800', fontSize: 14 },
  btnWhatsAppOutline: { backgroundColor: THEME.verifiedSoft, borderWidth: 1.5, borderColor: THEME.whatsapp, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  btnWhatsAppOutlineText: { color: '#065F46', fontWeight: '800', fontSize: 13 },
  actionCallBtn: { backgroundColor: THEME.marigold, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center', width: '100%' },
  actionCallBtnText: { color: THEME.paper, fontWeight: '800', fontSize: 13.5 },

  alertOptInRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.paperAlt, borderRadius: 10, padding: 12, marginTop: 12, gap: 10 },
  alertOptLabel: { fontSize: 12.5, color: THEME.ink, fontWeight: '600', flex: 1 },

  upsellCard: { backgroundColor: THEME.purpleSoft, borderRadius: 12, padding: 14, marginTop: 16, borderWidth: 1, borderColor: '#DDD6FE' },
  upsellBadge: { fontSize: 9, fontWeight: '800', color: THEME.purple, letterSpacing: 0.8, marginBottom: 4 },
  upsellTitle: { fontSize: 15, fontWeight: '800', color: THEME.ink, marginBottom: 4 },
  upsellDesc: { fontSize: 12, color: THEME.inkSoft, lineHeight: 17, marginBottom: 10 },
  btnUpsell: { backgroundColor: THEME.purple, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  btnUpsellText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  sectionHeading: { fontSize: 17, fontWeight: '800', color: THEME.ink, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: THEME.inkSoft, marginBottom: 12 },

  savedDriverCard: { backgroundColor: THEME.paper, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: THEME.line, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  driverBadgeDot: { width: 10, height: 10, borderRadius: 5 },
  driverNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  driverName: { fontSize: 14, fontWeight: '800', color: THEME.ink },
  driverMeta: { fontSize: 12, color: THEME.inkSoft },
  badgeChip: { paddingVertical: 2, paddingHorizontal: 7, borderRadius: 10 },
  badgeChipText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  btnRequestDriver: { backgroundColor: THEME.marigoldLight, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FDBA74' },
  btnRequestDriverText: { fontSize: 11.5, fontWeight: '800', color: THEME.marigoldDeep },

  historyCard: { backgroundColor: THEME.paper, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: THEME.line, marginBottom: 10 },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  historyType: { fontSize: 13.5, fontWeight: '700', color: THEME.ink, flex: 1 },
  historyStatus: { fontSize: 12, fontWeight: '800' },
  historyMeta: { fontSize: 12, color: THEME.inkSoft },

  chatContainer: { gap: 10 },
  chatBox: { backgroundColor: THEME.paper, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: THEME.line, minHeight: 200 },
  chatBubble: { borderRadius: 10, padding: 10, marginBottom: 10, maxWidth: '82%' },
  chatBubbleSupport: { backgroundColor: THEME.lineSoft, alignSelf: 'flex-start' },
  chatBubbleUser: { backgroundColor: THEME.marigold, alignSelf: 'flex-end' },
  chatText: { fontSize: 13, color: THEME.ink, lineHeight: 18 },
  chatTime: { fontSize: 10, color: THEME.inkMuted, marginTop: 3 },
  chatInputRow: { flexDirection: 'row', gap: 8 },
  chatInput: { flex: 1, backgroundColor: THEME.paper, borderWidth: 1, borderColor: THEME.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: THEME.ink },
  chatSendBtn: { backgroundColor: THEME.marigold, borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center' },
  chatSendText: { color: '#FFF', fontWeight: '800', fontSize: 13 },

  grievanceCard: { backgroundColor: THEME.paper, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: THEME.line, marginBottom: 10 },
  grievanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  grievanceDate: { fontSize: 12, color: THEME.inkSoft },
  grievanceStatusChip: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10 },
  grievanceStatusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  grievanceIssue: { fontSize: 13, color: THEME.ink, lineHeight: 18 },

  logCard: { backgroundColor: THEME.paper, borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: THEME.blue, marginBottom: 14 },
  logCardTitle: { fontSize: 15, fontWeight: '800', color: THEME.ink, marginBottom: 10 },
  logInputRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  miniLabel: { fontSize: 11, fontWeight: '700', color: THEME.inkSoft, marginBottom: 3 },
  miniInput: { backgroundColor: THEME.paperAlt, borderWidth: 1, borderColor: THEME.line, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 7, fontSize: 12, color: THEME.ink },
  btnLogSave: { backgroundColor: THEME.blue, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  btnLogSaveText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  logEntryCard: { backgroundColor: THEME.paper, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: THEME.line, marginBottom: 8 },
  logEntryTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  logEntryDate: { fontSize: 13.5, fontWeight: '800', color: THEME.ink },
  logEntryOT: { fontSize: 11.5, fontWeight: '800', color: THEME.marigoldDeep },
  logEntryMeta: { fontSize: 12, color: THEME.inkSoft },

  payrollCard: { backgroundColor: THEME.paper, borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: THEME.teal, marginBottom: 14 },
  btnPayroll: { backgroundColor: THEME.teal, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  payrollResult: { backgroundColor: THEME.tealSoft, borderRadius: 10, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#99F6E4' },
  payrollRow: { fontSize: 13, color: THEME.ink, marginBottom: 4 },
  payrollVal: { fontWeight: '800', color: THEME.ink },

  pricingCard: { backgroundColor: THEME.paper, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: THEME.line, marginBottom: 12 },
  pricingTitle: { fontSize: 17, fontWeight: '800', color: THEME.ink, marginBottom: 4 },
  pricingDesc: { fontSize: 12.5, color: THEME.inkSoft, lineHeight: 18, marginBottom: 12 },
  btnPrimary: { backgroundColor: THEME.marigold, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnPrimaryText: { color: '#FFF', fontWeight: '700', fontSize: 13.5 },

  fleetDriverCard: { backgroundColor: THEME.paper, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: THEME.line, marginBottom: 12 },
  fleetDriverTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statusChip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  statusChipText: { fontSize: 11, fontWeight: '800' },
  dlExpiryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  dlExpiryLabel: { fontSize: 12, color: THEME.inkSoft },
  dlStatusChip: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10 },
  dlStatusText: { fontSize: 11, fontWeight: '800' },

  routeScroll: { flexDirection: 'row', marginBottom: 12 },
  routePill: { backgroundColor: THEME.paper, paddingVertical: 7, paddingHorizontal: 13, borderRadius: 18, borderWidth: 1, borderColor: THEME.line, marginRight: 8 },
  routePillActive: { backgroundColor: THEME.ink, borderColor: THEME.ink },
  routePillText: { fontSize: 12, fontWeight: '600', color: THEME.inkSoft },
  routePillTextActive: { color: THEME.marigold, fontWeight: '800' },
  routeDetailsCard: { backgroundColor: THEME.cardNavy, borderRadius: 14, padding: 16, marginBottom: 12 },
  routeCardName: { fontSize: 16, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  routeCardDistance: { fontSize: 12.5, color: '#94A3B8', marginBottom: 6 },
  routeItemLabel: { fontSize: 12.5, color: '#CBD5E1', marginBottom: 2 },
  routeSelectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: THEME.line, marginBottom: 8, backgroundColor: THEME.paper },
  routeSelectRowActive: { borderColor: THEME.marigold, backgroundColor: THEME.marigoldLight },
  routeSelectText: { fontSize: 13, color: THEME.ink, flex: 1 },
  routeSelectRate: { fontSize: 12, fontWeight: '700', color: THEME.marigoldDeep },

  jobCard: { backgroundColor: THEME.paper, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: THEME.line, marginBottom: 12 },
  jobTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  jobSalary: { fontSize: 17, fontWeight: '800', color: THEME.verified },
  urgentChip: { backgroundColor: THEME.sosSoft, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10, borderWidth: 1, borderColor: '#FCA5A5' },
  urgentText: { fontSize: 9, fontWeight: '800', color: THEME.sosRed, letterSpacing: 0.5 },
  jobTitle: { fontSize: 14, fontWeight: '700', color: THEME.ink, marginBottom: 4 },
  jobLocation: { fontSize: 12, color: THEME.inkSoft, marginBottom: 12 },
  jobApplyBtn: { backgroundColor: THEME.ink, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  jobApplyBtnText: { color: THEME.marigold, fontWeight: '800', fontSize: 13 },

  referEarnInfo: { backgroundColor: THEME.verifiedSoft, borderRadius: 10, padding: 12, marginTop: 14 },
  referEarnInfoText: { fontSize: 12.5, fontWeight: '800', color: THEME.teal, marginBottom: 6 },
  referEarnInfoItem: { fontSize: 12.5, color: THEME.ink, marginBottom: 4, lineHeight: 18 },

  badgeInfoCard: { borderRadius: 14, padding: 14, borderWidth: 1.5, marginBottom: 12 },
  badgeLargeChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
  badgeLargeText: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  badgeReq: { fontSize: 12, color: THEME.ink, marginBottom: 4 },
  badgeEarn: { fontSize: 12, color: THEME.inkSoft },

  kycRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  kycUploadBtn: { flex: 1, backgroundColor: THEME.paperAlt, borderWidth: 1.5, borderColor: THEME.line, borderRadius: 10, paddingVertical: 14, alignItems: 'center', borderStyle: 'dashed' },
  kycUploadBtnSuccess: { backgroundColor: THEME.verifiedSoft, borderColor: THEME.verified },
  kycUploadLabel: { fontSize: 12.5, fontWeight: '700', color: THEME.inkSoft },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: THEME.paper, borderRadius: 20, padding: 24, width: '100%', alignItems: 'center' },
  modalCheckCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: THEME.verifiedSoft, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  modalCheckMark: { fontSize: 26, color: THEME.verified, fontWeight: '800' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: THEME.ink, marginBottom: 8 },
  modalBody: { fontSize: 13, color: THEME.inkSoft, lineHeight: 19, textAlign: 'center', marginBottom: 18 },
  modalCloseBtn: { backgroundColor: THEME.ink, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 30, width: '100%', alignItems: 'center' },
  modalCloseBtnText: { color: THEME.paper, fontSize: 13.5, fontWeight: '700' },
});
