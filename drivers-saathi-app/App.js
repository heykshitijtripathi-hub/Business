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
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SW } = Dimensions.get('window');

// ─── Design System & Palette ──────────────────────────────────────────────────
const C = {
  // Brand
  brand:       '#1A237E',   // Deep navy — primary brand
  brandDark:   '#0D1557',   // Darker navy for headers & landing
  brandLight:  '#3949AB',   // Lighter brand blue
  accent:      '#FF6F00',   // Amber / orange — action color
  accentLight: '#FFF3E0',   // Amber tint background
  accentGold:  '#FFB300',   // Gold highlight

  // Driver portal
  driverPrimary: '#1B5E20', // Forest green
  driverAccent:  '#43A047', // Green action
  driverBg:      '#E8F5E9', // Green tint bg

  // Owner portal
  ownerPrimary:  '#4A148C', // Royal purple
  ownerAccent:   '#7B1FA2', // Purple action
  ownerBg:       '#F3E5F5', // Purple tint bg

  // Admin portal
  adminPrimary:  '#B71C1C', // Deep crimson red
  adminAccent:   '#E53935', // Red action
  adminBg:       '#FFEBEE', // Red tint bg

  // Neutrals & Status
  white:     '#FFFFFF',
  bg:        '#F5F6FA',
  card:      '#FFFFFF',
  border:    '#E0E3EE',
  divider:   '#ECEFF1',
  text:      '#1A1F36',
  textSub:   '#5A6480',
  textMuted: '#94A3B8',
  green:     '#2E7D32',
  greenBg:   '#E8F5E9',
  red:       '#C62828',
  redBg:     '#FFEBEE',
  amber:     '#F57F17',
  amberBg:   '#FFFDE7',
  blue:      '#1565C0',
  blueBg:    '#E3F2FD',
};

// ─── Verified Candidate Pool ──────────────────────────────────────────────────
const CANDIDATES = [
  {
    id: 'c1', name: 'Rameshwar Dayal', exp: '15 yrs', rating: '4.95',
    trips: 184, badge: 'Senior Chauffeur',
    skills: 'Automatic, SUVs (Fortuner, Creta)',
    location: 'South Delhi & Gurugram',
    languages: 'Hindi, Basic English',
    photo: require('./assets/indian_driver_portrait.jpg'),
    verified: true,
  },
  {
    id: 'c2', name: 'Vikramaditya Singh', exp: '11 yrs', rating: '4.88',
    trips: 142, badge: 'Luxury Specialist',
    skills: 'BMW, Mercedes, Tesla EV',
    location: 'Gurugram & Central Delhi',
    languages: 'Hindi, English',
    photo: require('./assets/indian_driver_wheel.jpg'),
    verified: true,
  },
  {
    id: 'c3', name: 'Mohan Lal Verma', exp: '18 yrs', rating: '4.98',
    trips: 260, badge: 'Highway Expert',
    skills: 'Outstation, Expressways, Night Driving',
    location: 'Noida & Central Delhi',
    languages: 'Hindi, Bhojpuri',
    photo: require('./assets/driver_passenger_service.jpg'),
    verified: true,
  },
];

// ─── Main Application ─────────────────────────────────────────────────────────
export default function App() {
  const [portal, setPortal] = useState('landing');
  // 'landing' | 'customer' | 'driver_login' | 'driver_register' | 'driver_app' | 'owner_login' | 'owner_app' | 'admin_login' | 'admin_app'

  // Customer State
  const [custTab, setCustTab] = useState('home'); // 'home' | 'services' | 'calculator' | 'drivers' | 'book' | 'about' | 'contact'
  const [calcCity,  setCalcCity]  = useState('South Delhi');
  const [calcHours, setCalcHours] = useState('10 Hours');
  const [calcTrans, setCalcTrans] = useState('Automatic');
  const [form, setForm] = useState({ name: '', phone: '', car: '', location: '', service: 'Personal Chauffeur', trans: 'Automatic' });
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({ visible: false, msg: '' });

  // Driver Onboarding & Registration State (Driver Pipeline Builder)
  const [driverReg, setDriverReg] = useState({
    name: '',
    phone: '',
    area: '',
    exp: '5-8 Years',
    trans: 'Both (Manual + Auto)',
    dl: '',
  });
  const [driverRegSuccess, setDriverRegSuccess] = useState(false);
  const [inboundDriverApplicants, setInboundDriverApplicants] = useState([
    { id: 'app-1', name: 'Satish Kumar', phone: '+91 98118 77665', area: 'Badarpur & South Delhi', exp: '8 Years', trans: 'Both (Manual + Auto)', dl: 'DL-042016008812', date: 'Today' },
    { id: 'app-2', name: 'Manoj Yadav', phone: '+91 97112 33441', area: 'Sector 56, Gurugram', exp: '6 Years', trans: 'Automatic & SUVs', dl: 'HR-262019004451', date: 'Yesterday' },
  ]);

  // Driver Credentials & State
  const [drvId, setDrvId] = useState('');
  const [drvPass, setDrvPass] = useState('');
  const [drvTab, setDrvTab] = useState('today'); // 'today' | 'logbook' | 'attend' | 'leave' | 'docs' | 'salary'
  const [dutyLogs, setDutyLogs] = useState([
    { id: 'dl1', date: '11 Sep 2026', inTime: '08:30 AM', outTime: '07:15 PM', startKm: '42,100', endKm: '42,165', ot: '1.5 hrs', approved: true },
    { id: 'dl2', date: '10 Sep 2026', inTime: '08:30 AM', outTime: '07:45 PM', startKm: '42,020', endKm: '42,100', ot: '2.0 hrs', approved: true },
    { id: 'dl3', date: '09 Sep 2026', inTime: '08:35 AM', outTime: '06:50 PM', startKm: '41,960', endKm: '42,020', ot: '0.5 hrs', approved: false },
  ]);
  const [logDate, setLogDate]       = useState(new Date().toISOString().split('T')[0]);
  const [logIn, setLogIn]           = useState('08:30 AM');
  const [logOut, setLogOut]         = useState('07:00 PM');
  const [logStartKm, setLogStartKm] = useState('42,220');
  const [logEndKm, setLogEndKm]     = useState('42,280');
  const [logOT, setLogOT]           = useState('1.0');
  const [logPhoto, setLogPhoto]     = useState(null);

  // Driver Leaves & Grievances
  const [leaves, setLeaves] = useState([
    { id: 'lr1', date: '19 Sep 2026', reason: 'Family medical visit', status: 'Approved', sub: 'Vikramaditya S.' },
  ]);
  const [lvDate, setLvDate]     = useState('2026-09-24');
  const [lvReason, setLvReason] = useState('');
  const [feedbackText, setFeedbackText] = useState('');

  // Driver Advance Requests
  const [advanceRequests, setAdvanceRequests] = useState([
    { id: 'a1', amount: 'Rs. 2,000', reason: 'School fee payment', status: 'Approved', date: '05 Sep 2026' }
  ]);
  const [advanceAmt, setAdvanceAmt] = useState('');
  const [advanceReason, setAdvanceReason] = useState('');

  // Owner Credentials & State
  const [ownId, setOwnId]   = useState('');
  const [ownPass, setOwnPass] = useState('');
  const [ownTab, setOwnTab]  = useState('driver'); // 'driver' | 'vehicle' | 'approve' | 'payments' | 'substitute' | 'agreement'
  const [ownerRating, setOwnerRating] = useState(5);
  const [ownerComment, setOwnerComment] = useState('');

  // Owner Payments & Expense Claims
  const [payments, setPayments] = useState([
    { id: 'p1', month: 'July 2026', amount: 'Rs. 22,000', status: 'Paid', date: '05 Jul 2026' },
    { id: 'p2', month: 'August 2026', amount: 'Rs. 22,000', status: 'Paid', date: '04 Aug 2026' },
    { id: 'p3', month: 'September 2026', amount: 'Rs. 22,000', status: 'Pending', date: '—' },
  ]);
  const [expenses, setExpenses] = useState([
    { id: 'e1', desc: 'Toll (NH-48 Outstation)', amount: 'Rs. 150', date: '08 Sep', status: 'Pending' },
    { id: 'e2', desc: 'Khan Market Parking Slip', amount: 'Rs. 80', date: '09 Sep', status: 'Pending' },
    { id: 'e3', desc: 'Emergency Fuel Top-up (5L)', amount: 'Rs. 500', date: '10 Sep', status: 'Pending' },
  ]);

  // Admin State & Onboarding
  const [admId, setAdmId]   = useState('');
  const [admPass, setAdmPass] = useState('');
  const [admTab, setAdmTab]  = useState('overview'); // 'overview' | 'placements' | 'leads' | 'standby'
  const [newDrvName, setNewDrvName]   = useState('');
  const [newDrvPhone, setNewDrvPhone] = useState('');
  const [newDrvDL, setNewDrvDL]       = useState('');
  const [newDrvArea, setNewDrvArea]   = useState('');
  const [newDrvExp, setNewDrvExp]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@ds_logs_v5');
        if (saved) setDutyLogs(JSON.parse(saved));
        const savedLeaves = await AsyncStorage.getItem('@ds_leaves_v5');
        if (savedLeaves) setLeaves(JSON.parse(savedLeaves));
        const savedAdv = await AsyncStorage.getItem('@ds_advances_v5');
        if (savedAdv) setAdvanceRequests(JSON.parse(savedAdv));
        const savedPay = await AsyncStorage.getItem('@ds_payments_v5');
        if (savedPay) setPayments(JSON.parse(savedPay));
        const savedApps = await AsyncStorage.getItem('@ds_driver_apps_v5');
        if (savedApps) setInboundDriverApplicants(JSON.parse(savedApps));
      } catch (_) {}
    })();
  }, []);

  // Helpers
  const call = () => Linking.openURL('tel:+918175087004');
  const whatsapp = (msg = '') => {
    const t = msg || 'Hello Drivers Saathi, I need a verified driver in Delhi NCR.';
    Linking.openURL(`https://wa.me/918175087004?text=${encodeURIComponent(t)}`);
  };

  const driverWhatsAppJoin = () => {
    const text = `नमस्ते ड्राइवर्स साथी, मुझे प्राइवेट कार ड्राइवर की नौकरी चाहिए।\nनाम: ${driverReg.name || 'ड्राइवर साथी'}\nइलाका: ${driverReg.area || 'दिल्ली NCR'}\nअनुभव: ${driverReg.exp}`;
    Linking.openURL(`https://wa.me/918175087004?text=${encodeURIComponent(text)}`);
  };

  const salary = () => {
    let b = 18500;
    if (['South Delhi', 'Gurugram'].includes(calcCity)) b += 2000;
    if (calcHours === '12 Hours') b += 3000;
    if (calcHours === '24-Hr Live-in') b += 6000;
    if (calcTrans === 'Luxury / EV') b += 3500;
    return { min: b, max: b + 2500, ot: b >= 24000 ? 100 : 80, fee: 4500 };
  };

  const pickPhoto = async () => {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.6 });
      if (!r.canceled && r.assets[0]) { setLogPhoto(r.assets[0].uri); }
    } catch (_) {}
  };

  const submitBooking = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      Alert.alert('Required Fields', 'Please fill your name and mobile number.');
      return;
    }
    setLoading(true);
    const ref = `DS-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await fetch('https://formsubmit.co/ajax/support@driverssaathi.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          Ref: ref, Name: form.name, Phone: form.phone,
          Car: form.car, Area: form.location, Service: form.service,
          _subject: `[Lead #${ref}] ${form.service} — ${form.name}`,
        }),
      });
    } catch (_) {}
    setSuccessModal({
      visible: true,
      msg: `Thank you, ${form.name}!\n\nYour request (Ref #${ref}) has been received. Our account manager will call you within 4 hours with shortlisted driver profiles.\n\nHelpline: +91 8175087004`
    });
    setForm({ name: '', phone: '', car: '', location: '', service: 'Personal Chauffeur', trans: 'Automatic' });
    setLoading(false);
  };

  const handleDriverSelfRegister = async () => {
    if (!driverReg.name.trim() || !driverReg.phone.trim() || !driverReg.area.trim()) {
      Alert.alert('कृपया ध्यान दें', 'कृपया अपना नाम, मोबाइल नंबर और इलाका अवश्य भरें।');
      return;
    }

    const newApp = {
      id: `app-${Date.now()}`,
      name: driverReg.name,
      phone: driverReg.phone,
      area: driverReg.area,
      exp: driverReg.exp,
      trans: driverReg.trans,
      dl: driverReg.dl || 'Not Provided',
      date: 'Just Now',
    };

    const updated = [newApp, ...inboundDriverApplicants];
    setInboundDriverApplicants(updated);
    await AsyncStorage.setItem('@ds_driver_apps_v5', JSON.stringify(updated));

    // Also send email alert to admin behind the scenes
    try {
      fetch('https://formsubmit.co/ajax/support@driverssaathi.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `[NEW DRIVER ONBOARDING] ${driverReg.name} (${driverReg.area})`,
          Name: driverReg.name,
          Phone: driverReg.phone,
          Area: driverReg.area,
          Experience: driverReg.exp,
          Transmission: driverReg.trans,
          DL: driverReg.dl,
        }),
      });
    } catch (_) {}

    setDriverRegSuccess(true);
  };

  const loginDriver = () => {
    if ((drvId.trim() === 'DRV-101') && drvPass === '1234') setPortal('driver_app');
    else Alert.alert('Login Failed', 'Demo credentials: DRV-101 / 1234');
  };
  const loginOwner = () => {
    if ((ownId.trim() === 'OWN-501') && ownPass === '1234') setPortal('owner_app');
    else Alert.alert('Login Failed', 'Demo credentials: OWN-501 / 1234');
  };
  const loginAdmin = () => {
    if (admId.trim().toUpperCase() === 'ADMIN' && admPass === '1234') setPortal('admin_app');
    else Alert.alert('Login Failed', 'Demo credentials: ADMIN / 1234');
  };

  const saveLog = async () => {
    const km = (parseInt(logEndKm.replace(/,/g,''),10) || 0) - (parseInt(logStartKm.replace(/,/g,''),10) || 0);
    const entry = { id: Date.now().toString(), date: logDate, inTime: logIn, outTime: logOut, startKm: logStartKm, endKm: logEndKm, ot: `${logOT} hrs`, approved: false };
    const updated = [entry, ...dutyLogs];
    setDutyLogs(updated);
    await AsyncStorage.setItem('@ds_logs_v5', JSON.stringify(updated));
    setLogPhoto(null);
    Alert.alert('Duty Logged', `Duty entry for ${logDate} saved and submitted to owner for verification.`);
  };

  const submitLeave = async () => {
    if (!lvReason.trim()) { Alert.alert('Reason Required', 'Please state your reason for leave.'); return; }
    const entry = { id: Date.now().toString(), date: lvDate, reason: lvReason, status: 'Pending', sub: 'Pending Assignment' };
    const updated = [entry, ...leaves];
    setLeaves(updated);
    await AsyncStorage.setItem('@ds_leaves_v5', JSON.stringify(updated));
    setLvReason('');
    Alert.alert('Leave Submitted', 'Leave request sent to car owner. Dispatch desk alerted for backup coverage.');
  };

  const submitAdvance = async () => {
    if (!advanceAmt.trim()) { Alert.alert('Amount Required', 'Please enter the requested advance amount.'); return; }
    const entry = { id: Date.now().toString(), amount: `Rs. ${advanceAmt}`, reason: advanceReason || 'General expense', status: 'Pending Review', date: 'Today' };
    const updated = [entry, ...advanceRequests];
    setAdvanceRequests(updated);
    await AsyncStorage.setItem('@ds_advances_v5', JSON.stringify(updated));
    setAdvanceAmt('');
    setAdvanceReason('');
    Alert.alert('Advance Requested', 'Advance salary request has been forwarded to car owner and dispatch desk.');
  };

  const submitFeedback = () => {
    if (!feedbackText.trim()) { Alert.alert('Required', 'Please write your message or complaint.'); return; }
    setFeedbackText('');
    Alert.alert('Feedback Recorded', 'Your grievance has been submitted securely to the Drivers Saathi Welfare Desk.');
  };

  const approveLog = async (id) => {
    const updated = dutyLogs.map(l => l.id === id ? { ...l, approved: true } : l);
    setDutyLogs(updated);
    await AsyncStorage.setItem('@ds_logs_v5', JSON.stringify(updated));
    Alert.alert('Approved', 'Overtime hours authenticated for payroll calculation.');
  };

  const markPaymentPaid = async (pid) => {
    const updated = payments.map(p => p.id === pid ? { ...p, status: 'Paid', date: '11 Sep 2026' } : p);
    setPayments(updated);
    await AsyncStorage.setItem('@ds_payments_v5', JSON.stringify(updated));
    Alert.alert('Salary Marked as Paid', 'September 2026 salary marked paid. Notification receipt generated.');
  };

  const handleExpenseAction = (eid, action) => {
    const updated = expenses.map(e => e.id === eid ? { ...e, status: action === 'approve' ? 'Approved' : 'Rejected' } : e);
    setExpenses(updated);
    Alert.alert(action === 'approve' ? 'Expense Approved' : 'Expense Rejected', `Claim marked ${action === 'approve' ? 'Approved for reimbursement' : 'Rejected'}.`);
  };

  const submitDriverRating = () => {
    Alert.alert('Rating Submitted', `Thank you! Rated Rameshwar Dayal ${ownerRating} Stars for September 2026.`);
  };

  const handleAddNewDriver = () => {
    if (!newDrvName.trim() || !newDrvPhone.trim()) {
      Alert.alert('Required', 'Please fill driver name and phone number.');
      return;
    }
    Alert.alert('Driver Added', `${newDrvName} added to the onboarding pipeline. Police verification initiated.`);
    setNewDrvName('');
    setNewDrvPhone('');
    setNewDrvDL('');
    setNewDrvArea('');
    setNewDrvExp('');
  };

  const salCalc = salary();

  // ============================================================================
  // VIEW: ROLE SELECTION LANDING SCREEN
  // ============================================================================
  const renderLanding = () => (
    <View style={{ flex: 1, backgroundColor: C.brandDark }}>
      {/* Brand Header */}
      <View style={styles.landingHeader}>
        <Image
          source={require('./assets/driver-saathi-logo-light.png')}
          style={styles.landingLogo}
          resizeMode="contain"
        />
        <Text style={styles.landingBrand}>DRIVERS SAATHI</Text>
        <Text style={styles.landingTagline}>Delhi NCR's Trusted Chauffeur Service</Text>
        <View style={styles.landingTrustRow}>
          <Text style={styles.landingTrustPill}>500+ Placements</Text>
          <Text style={styles.landingTrustPill}>Police Verified</Text>
          <Text style={styles.landingTrustPill}>4.9 Star Rating</Text>
        </View>
      </View>

      {/* Role Selection Cards */}
      <ScrollView contentContainerStyle={styles.landingScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.landingPrompt}>Who are you?</Text>
        <Text style={styles.landingPromptSub}>Choose your portal to proceed</Text>

        {/* Card 1: Customer */}
        <TouchableOpacity
          style={[styles.roleCard, { backgroundColor: '#FF6F00' }]}
          onPress={() => { setCustTab('home'); setPortal('customer'); }}
          activeOpacity={0.9}
        >
          <View style={styles.roleCardIconBox}>
            <Text style={styles.roleCardEmoji}>🚗</Text>
          </View>
          <View style={styles.roleCardText}>
            <Text style={styles.roleCardTitle}>I want to hire a Driver</Text>
            <Text style={styles.roleCardDesc}>Find & book a verified, police-cleared chauffeur for your private car in Delhi NCR</Text>
            <View style={styles.roleCardChips}>
              <Text style={styles.roleCardChip}>Personal Chauffeur</Text>
              <Text style={styles.roleCardChip}>Outstation</Text>
              <Text style={styles.roleCardChip}>Salary Calculator</Text>
            </View>
          </View>
          <Text style={styles.roleCardArrow}>→</Text>
        </TouchableOpacity>

        {/* Card 2: Driver (With Registration + Login Dual Action) */}
        <View style={[styles.roleCardWrapper, { backgroundColor: C.driverPrimary }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.roleCardIconBox}>
              <Text style={styles.roleCardEmoji}>👤</Text>
            </View>
            <View style={styles.roleCardText}>
              <Text style={styles.roleCardTitle}>I am a Driver / मैं ड्राइवर हूँ</Text>
              <Text style={styles.roleCardDesc}>महीने का ₹20,000 से ₹28,000 कमाएं • प्राइवेट कार में फिक्स्ड ड्यूटी • ड्यूटी लॉगबुक व हाजिरी</Text>
            </View>
          </View>

          {/* Dual Action Buttons for Drivers */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <TouchableOpacity
              style={styles.driverCardRegBtn}
              onPress={() => setPortal('driver_register')}
            >
              <Text style={styles.driverCardRegBtnText}>ड्राइवर रजिस्ट्रेशन (Join Now)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.driverCardLoginBtn}
              onPress={() => setPortal('driver_login')}
            >
              <Text style={styles.driverCardLoginBtnText}>ड्राइवर लॉगिन (Sign In)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 3: Car Owner */}
        <TouchableOpacity
          style={[styles.roleCard, { backgroundColor: C.ownerPrimary }]}
          onPress={() => setPortal('owner_login')}
          activeOpacity={0.9}
        >
          <View style={styles.roleCardIconBox}>
            <Text style={styles.roleCardEmoji}>🏠</Text>
          </View>
          <View style={styles.roleCardText}>
            <Text style={styles.roleCardTitle}>I own a Car</Text>
            <Text style={styles.roleCardDesc}>Track driver background check, approve overtime, record monthly salary payments, and request emergency substitute</Text>
            <View style={styles.roleCardChips}>
              <Text style={styles.roleCardChip}>Driver Dossier</Text>
              <Text style={styles.roleCardChip}>Vehicle Compliance</Text>
              <Text style={styles.roleCardChip}>Payments</Text>
            </View>
          </View>
          <Text style={styles.roleCardArrow}>→</Text>
        </TouchableOpacity>

        {/* Small Admin Console Link */}
        <TouchableOpacity style={styles.adminLink} onPress={() => setPortal('admin_login')}>
          <Text style={styles.adminLinkText}>Drivers Saathi Admin Console</Text>
        </TouchableOpacity>

        <View style={styles.landingFooter}>
          <Text style={styles.landingFooterText}>Helpline: +91 8175087004  •  Mon–Sat, 9 AM – 8 PM</Text>
          <Text style={styles.landingFooterText}>Delhi • Gurugram • Noida • Faridabad • Ghaziabad</Text>
        </View>
      </ScrollView>
    </View>
  );

  // ============================================================================
  // VIEW: DRIVER ONBOARDING & REGISTRATION SCREEN (Hindi-Friendly)
  // ============================================================================
  const renderDriverRegister = () => (
    <View style={{ flex: 1, backgroundColor: C.driverBg }}>
      {/* Header */}
      <View style={styles.loginPortalHeader}>
        <TouchableOpacity onPress={() => setPortal('landing')}>
          <Text style={[styles.loginBackBtn, { color: C.driverPrimary }]}>← मुख्य पृष्ठ (Back)</Text>
        </TouchableOpacity>
        <Text style={styles.loginPortalTitle}>ड्राइवर भर्ती (Join Saathi)</Text>
        <TouchableOpacity onPress={() => setPortal('driver_login')}>
          <Text style={{ color: C.driverPrimary, fontWeight: '700', fontSize: 13 }}>लॉगिन</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Value Pitch Banner */}
        <View style={styles.driverPitchBanner}>
          <Text style={styles.driverPitchPre}>प्राइवेट कार ड्राइवर जॉब्स • दिल्ली NCR</Text>
          <Text style={styles.driverPitchHeadline}>महीने का ₹20,000 से ₹28,000 कमाएं</Text>
          <Text style={styles.driverPitchSub}>बिना किसी दलाली या कमीशन के • सीधा कार मालिक से वेतन</Text>

          {/* Benefits Grid */}
          <View style={styles.driverBenefitsGrid}>
            <View style={styles.driverBenefitItem}>
              <Text style={styles.driverBenefitDot}>✓</Text>
              <Text style={styles.driverBenefitText}>मालिक की गाड़ी, मालिक का पेट्रोल</Text>
            </View>
            <View style={styles.driverBenefitItem}>
              <Text style={styles.driverBenefitDot}>✓</Text>
              <Text style={styles.driverBenefitText}>10 घंटे फिक्स्ड ड्यूटी + ओवर-टाइम अलग से</Text>
            </View>
            <View style={styles.driverBenefitItem}>
              <Text style={styles.driverBenefitDot}>✓</Text>
              <Text style={styles.driverBenefitText}>रविवार साप्ताहिक अवकाश (Sunday Off)</Text>
            </View>
            <View style={styles.driverBenefitItem}>
              <Text style={styles.driverBenefitDot}>✓</Text>
              <Text style={styles.driverBenefitText}>100% फ्री रजिस्ट्रेशन • ₹0 चार्ज</Text>
            </View>
          </View>
        </View>

        {/* Registration Form Card */}
        <View style={styles.infoCard}>
          <Text style={styles.formCardHeader}>ड्राइवर आवेदन पत्र (Registration Form)</Text>
          <Text style={{ fontSize: 12, color: C.textSub, marginBottom: 14 }}>
            कृपया अपनी सही जानकारी भरें। हमारी टीम 24 घंटे में आपको कॉल करके ट्रायल शेड्यूल करेगी।
          </Text>

          <Text style={styles.fieldLabel}>आपका पूरा नाम (Full Name) *</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="उदा. सतीश कुमार / Satish Kumar"
            value={driverReg.name}
            onChangeText={v => setDriverReg({ ...driverReg, name: v })}
          />

          <Text style={styles.fieldLabel}>मोबाइल नंबर (WhatsApp / Phone) *</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
            value={driverReg.phone}
            onChangeText={v => setDriverReg({ ...driverReg, phone: v })}
          />

          <Text style={styles.fieldLabel}>आप दिल्ली NCR में कहाँ रहते हैं? (Your Area) *</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="उदा. बदरपुर, साउथ दिल्ली / सेक्टर 56 गुड़गांव"
            value={driverReg.area}
            onChangeText={v => setDriverReg({ ...driverReg, area: v })}
          />

          <Text style={styles.fieldLabel}>ड्राइविंग अनुभव (Total Driving Experience)</Text>
          <View style={styles.pillRow}>
            {['1-3 साल', '4-7 साल', '8-12 साल', '15+ साल'].map(exp => (
              <TouchableOpacity
                key={exp}
                onPress={() => setDriverReg({ ...driverReg, exp })}
                style={[styles.pill, driverReg.exp === exp && styles.pillActiveGreen]}
              >
                <Text style={[styles.pillText, driverReg.exp === exp && styles.pillTextActive]}>{exp}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>कौन सी गाड़ी चलाते हैं? (Transmission)</Text>
          <View style={styles.pillRow}>
            {['मैनुअल (Manual)', 'ऑटोमेटिक (Auto)', 'दोनों (Both)', 'लग्जरी (BMW/Audi)'].map(trans => (
              <TouchableOpacity
                key={trans}
                onPress={() => setDriverReg({ ...driverReg, trans })}
                style={[styles.pill, driverReg.trans === trans && styles.pillActiveGreen]}
              >
                <Text style={[styles.pillText, driverReg.trans === trans && styles.pillTextActive]}>{trans}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>कमर्शियल ड्राइविंग लाइसेंस नंबर (DL - यदि उपलब्ध हो)</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="DL-0420180012345"
            autoCapitalize="characters"
            value={driverReg.dl}
            onChangeText={v => setDriverReg({ ...driverReg, dl: v })}
          />

          {/* Submit Button */}
          <TouchableOpacity style={styles.driverSubmitBtn} onPress={handleDriverSelfRegister}>
            <Text style={styles.driverSubmitBtnText}>आवेदन सबमिट करें (Submit Application)</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.bookOrRow}>
            <View style={styles.bookOrLine} /><Text style={styles.bookOrText}>या सीधे व्हाट्सएप पर जुड़ें</Text><View style={styles.bookOrLine} />
          </View>

          {/* WhatsApp Direct */}
          <TouchableOpacity style={styles.driverWABtn} onPress={driverWhatsAppJoin}>
            <Text style={styles.driverWABtnText}>व्हाट्सएप पर तुरंत जुड़ें (Join on WhatsApp)</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: C.textMuted }}>
              हेल्पलाइन नंबर: +91 8175087004 (सोमवार से शनिवार, सुबह 9 से शाम 8)
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Driver Registration Success Modal */}
      <Modal visible={driverRegSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalCheckCircle, { backgroundColor: C.greenBg }]}>
              <Text style={[styles.modalCheck, { color: C.green }]}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>बधाई हो, आवेदन प्राप्त हुआ!</Text>
            <Text style={styles.modalMsg}>
              {driverReg.name ? `धन्यवाद ${driverReg.name}!` : 'धन्यवाद!'}
              {'\n\n'}ड्राइवर्स साथी में आपका रजिस्ट्रेशन सुरक्षित दर्ज कर लिया गया है।
              {'\n\n'}हमारे भर्ती अधिकारी (Recruitment Manager) अगले 24 घंटों में आपके नंबर पर कॉल करके आपके इलाके में प्राइवेट कार मालिक का ट्रायल शेड्यूल करेंगे।
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: C.driverPrimary }]}
              onPress={() => {
                setDriverRegSuccess(false);
                setPortal('landing');
              }}
            >
              <Text style={styles.modalBtnText}>ठीक है (Go to Home)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  // ============================================================================
  // VIEW: CUSTOMER WEBSITE
  // ============================================================================
  const renderCustomer = () => (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={styles.custHeader}>
        <View style={styles.custHeaderInner}>
          <Image source={require('./assets/driver-saathi-logo-light.png')} style={styles.custLogo} resizeMode="contain" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.custBrandName}>DRIVERS SAATHI</Text>
            <Text style={styles.custBrandTagline}>Delhi NCR's Trusted Chauffeur Service</Text>
          </View>
        </View>
        <View style={styles.custPortalRow}>
          <TouchableOpacity style={styles.custHomeBackBtn} onPress={() => setPortal('landing')}>
            <Text style={styles.custHomeBackText}>← Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.custPortalBtn, { backgroundColor: '#1B5E20' }]}
            onPress={() => setPortal('driver_register')}>
            <Text style={styles.custPortalBtnText}>ड्राइवर बनें (Join)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.custPortalBtn, { backgroundColor: '#4A148C' }]}
            onPress={() => { setOwnId('OWN-501'); setOwnPass('1234'); setPortal('owner_login'); }}>
            <Text style={styles.custPortalBtnText}>Owner Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.custPortalBtn, { backgroundColor: '#B71C1C' }]}
            onPress={() => { setAdmId('ADMIN'); setAdmPass('1234'); setPortal('admin_login'); }}>
            <Text style={styles.custPortalBtnText}>Admin</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.custTabBar}>
        {[
          { key: 'home', label: 'Home' },
          { key: 'services', label: 'Services' },
          { key: 'calculator', label: 'Salary Tool' },
          { key: 'drivers', label: 'Chauffeurs' },
          { key: 'book', label: 'Hire Now' },
          { key: 'about', label: 'About Us' },
          { key: 'contact', label: 'Contact' },
        ].map(t => (
          <TouchableOpacity key={t.key} onPress={() => setCustTab(t.key)}
            style={[styles.custTabItem, custTab === t.key && styles.custTabItemActive]}>
            <Text style={[styles.custTabText, custTab === t.key && styles.custTabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* ── HOME TAB ── */}
        {custTab === 'home' && (
          <View>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Image source={require('./assets/fleet_cabs_delhi.jpg')} style={styles.heroImage} resizeMode="cover" />
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTagline}>DELHI NCR'S #1 VERIFIED CHAUFFEUR SERVICE</Text>
                <Text style={styles.heroHeadline}>Professional Drivers for Your Private Car</Text>
                <Text style={styles.heroSub}>Police-cleared, background-verified drivers for daily commute, outstation trips & corporate fleets.</Text>
                <View style={styles.heroButtonRow}>
                  <TouchableOpacity style={styles.heroBtnPrimary} onPress={() => setCustTab('book')}>
                    <Text style={styles.heroBtnPrimaryText}>Hire a Driver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.heroBtnSecondary} onPress={call}>
                    <Text style={styles.heroBtnSecondaryText}>+91 8175087004</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Trust Strip */}
            <View style={styles.trustStrip}>
              {[
                { label: '500+', sub: 'Drivers Placed' },
                { label: '4.9★', sub: 'Avg. Rating' },
                { label: '30-Day', sub: 'Free Replacement' },
                { label: 'GST', sub: 'Invoice Provided' },
              ].map((t, i) => (
                <View key={i} style={styles.trustItem}>
                  <Text style={styles.trustNum}>{t.label}</Text>
                  <Text style={styles.trustSub}>{t.sub}</Text>
                </View>
              ))}
            </View>

            {/* How It Works */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>How It Works</Text>
              <Text style={styles.sectionSubtitle}>Get a verified driver placed at your home in 48 hours</Text>
              <View style={styles.stepsRow}>
                {[
                  { n: '1', title: 'Submit Requirement', desc: 'Tell us your car model, location, and shift hours' },
                  { n: '2', title: 'We Shortlist', desc: 'We match 3 verified candidate profiles matching your car' },
                  { n: '3', title: 'Trial & Selection', desc: 'Take a 1-day trial before confirming dedicated placement' },
                  { n: '4', title: 'Placement Confirmed', desc: 'Formal agreement with 30-day free replacement guarantee' },
                ].map((s, i) => (
                  <View key={i} style={styles.stepCard}>
                    <View style={styles.stepNum}><Text style={styles.stepNumText}>{s.n}</Text></View>
                    <Text style={styles.stepTitle}>{s.title}</Text>
                    <Text style={styles.stepDesc}>{s.desc}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Driver Recruitment Callout Banner (Recruits drivers from customer web) */}
            <View style={styles.driverWebRecruitBanner}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.driverWebRecruitTitle}>Are you a Driver? / क्या आप ड्राइवर हैं?</Text>
                <Text style={styles.driverWebRecruitDesc}>
                  महीने का ₹20,000 से ₹28,000 निश्चित वेतन कमाएं। 100% फ्री रजिस्ट्रेशन, सीधा कार मालिक से वेतन।
                </Text>
              </View>
              <TouchableOpacity style={styles.driverWebRecruitBtn} onPress={() => setPortal('driver_register')}>
                <Text style={styles.driverWebRecruitBtnText}>रजिस्ट्रेशन करें &rarr;</Text>
              </TouchableOpacity>
            </View>

            {/* Area Coverage Strip */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Delhi NCR Service Coverage</Text>
              <Text style={styles.sectionSubtitle}>Drivers available across all major sectors and colonies</Text>
              <View style={styles.areaGrid}>
                {[
                  'South Delhi (Vasant Vihar, GK, Defence Colony)',
                  'Gurugram (DLF 1-5, Golf Course Rd, Sohna Rd)',
                  'Noida & Greater Noida (Sector 18, 62, 137)',
                  'Central & West Delhi (Connaught Place, Punjabi Bagh)',
                  'Faridabad (Sector 15, Green Field)',
                  'Ghaziabad (Indirapuram, Vaishali)',
                ].map((area, idx) => (
                  <View key={idx} style={styles.areaPill}>
                    <View style={styles.areaDot} />
                    <Text style={styles.areaPillText}>{area}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Customer Testimonials */}
            <View style={[styles.sectionBlock, { backgroundColor: '#EEF2F9' }]}>
              <Text style={styles.sectionTitle}>What Car Owners Say</Text>
              <Text style={styles.sectionSubtitle}>Real experiences from Delhi NCR families and executives</Text>
              <View>
                {[
                  {
                    name: 'Mr. Vikram Bhatia',
                    loc: 'Vasant Vihar, South Delhi',
                    quote: 'Ramesh has been driving my Creta for 8 months now. Extremely punctual and handles Delhi traffic calmly. The background check report provided complete peace of mind.',
                    rating: '5.0'
                  },
                  {
                    name: 'Mrs. Anjali Kapoor',
                    loc: 'DLF Phase 5, Gurugram',
                    quote: 'Found a verified automatic driver within 48 hours for our school drops and office commute. The police verification copy and driving licence details were handed over on day one.',
                    rating: '5.0'
                  },
                  {
                    name: 'Dr. Sanjeev Mehta',
                    loc: 'Sector 62, Noida',
                    quote: 'Booked an outstation chauffeur for our family trip to Jaipur and Ranthambore. Excellent expressway driving, polite behavior, and zero fatigue.',
                    rating: '4.9'
                  },
                  {
                    name: 'Mr. Rohit Agarwal',
                    loc: 'Sector 11, Dwarka',
                    quote: 'The 30-day replacement guarantee is completely genuine. When our first driver had a medical issue at his village, Drivers Saathi sent a replacement within 36 hours.',
                    rating: '5.0'
                  },
                ].map((t, idx) => (
                  <View key={idx} style={styles.testimonialCard}>
                    <Text style={styles.testimonialStars}>★★★★★ <Text style={{ color: C.textSub, fontSize: 12 }}>({t.rating})</Text></Text>
                    <Text style={styles.testimonialQuote}>"{t.quote}"</Text>
                    <Text style={styles.testimonialName}>{t.name}</Text>
                    <Text style={styles.testimonialLoc}>{t.loc}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Why Choose Us */}
            <View style={[styles.sectionBlock, { backgroundColor: C.brand }]}>
              <Text style={[styles.sectionTitle, { color: C.white }]}>Why Drivers Saathi?</Text>
              <View style={styles.featureGrid}>
                {[
                  { icon: 'S', title: 'Police Verified', desc: 'Valid local police station clearance report for each candidate' },
                  { icon: 'K', title: 'KYC & References', desc: 'Aadhaar, Commercial DL, and past employer verification' },
                  { icon: 'T', title: 'Digital Timesheet', desc: 'Track daily clock-in, clock-out, and odometer readings' },
                  { icon: 'R', title: '30-Day Guarantee', desc: 'Free candidate replacement if expectations are not met' },
                  { icon: 'D', title: 'Written Contract', desc: 'Formal placement agreement protecting owner and driver' },
                  { icon: 'B', title: 'Emergency Backup', desc: 'Standby driver coverage when primary chauffeur is on leave' },
                ].map((f, i) => (
                  <View key={i} style={styles.featureCard}>
                    <View style={styles.featureIcon}><Text style={styles.featureIconText}>{f.icon}</Text></View>
                    <Text style={styles.featureTitle}>{f.title}</Text>
                    <Text style={styles.featureDesc}>{f.desc}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Quick CTA */}
            <View style={styles.ctaBlock}>
              <Text style={styles.ctaTitle}>Need a Driver Placed This Week?</Text>
              <Text style={styles.ctaSub}>Talk directly with our Delhi NCR dispatch team</Text>
              <View style={styles.ctaButtonRow}>
                <TouchableOpacity style={styles.ctaBtnCall} onPress={call}>
                  <Text style={styles.ctaBtnCallText}>Call Helpline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ctaBtnWA} onPress={() => whatsapp()}>
                  <Text style={styles.ctaBtnWAText}>Chat on WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ── SERVICES TAB ── */}
        {custTab === 'services' && (
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>Our Chauffeur Services</Text>
            <Text style={styles.pageSub}>Tailored driver placement models for private car owners and fleets</Text>

            {[
              {
                img: require('./assets/indian_driver_portrait.jpg'),
                tag: 'Most Popular',
                tagColor: C.accent,
                title: 'Personal Chauffeur Placement',
                price: 'One-time Placement Fee: Rs. 4,500',
                desc: 'Dedicated full-time driver for your private car. Route familiar, punctual, with an iron-clad 30-day free replacement warranty. Monthly salary is paid directly to the driver.',
                highlights: ['30-day free replacement warranty', 'Police clearance certificate provided', 'Salary advice & agreement drafting included'],
                cta: 'Request Chauffeur',
                ctaFn: () => setCustTab('book'),
              },
              {
                img: require('./assets/driver_passenger_service.jpg'),
                tag: 'Outstation',
                tagColor: C.blue,
                title: 'Highway & Outstation Driver',
                price: 'From Rs. 1,500 per day',
                desc: 'Experienced highway drivers for Yamuna Expressway, Agra, Jaipur, Chandigarh, and Uttarakhand. Night driving expertise, FASTag management, and vehicle care included.',
                highlights: ['Available on 4-hour advance notice', 'Expressway & night driving certified', 'Fixed daily driver allowance terms'],
                cta: 'Book Trip Driver',
                ctaFn: () => setCustTab('book'),
              },
              {
                img: require('./assets/fleet_cabs_delhi.jpg'),
                tag: 'Corporate',
                tagColor: C.brand,
                title: 'Corporate Fleet Retainer',
                price: 'B2B Retainer Contract',
                desc: 'Reliable driver supply for company leadership cars, corporate shuttles, and travel desks. Standby driver pool ensures zero downtime with GST billing.',
                highlights: ['Dedicated account coordinator', 'Monthly GST invoicing', 'Instant standby replacement dispatch'],
                cta: 'Contact Corporate Desk',
                ctaFn: call,
              },
              {
                img: require('./assets/indian_driver_wheel.jpg'),
                tag: 'Live-in',
                tagColor: C.green,
                title: 'Live-in Residential Chauffeur',
                price: 'Placement Fee: Rs. 5,500',
                desc: 'Full-time residential chauffeur with on-premises accommodation. Ideal for families requiring round-the-clock availability for school, office, and night emergencies.',
                highlights: ['24x7 family readiness', 'Full background & home address verified', 'Clear boarding & accommodation clauses'],
                cta: 'Enquire for Live-in',
                ctaFn: () => setCustTab('book'),
              },
            ].map((s, i) => (
              <View key={i} style={styles.serviceCard}>
                <View style={{ position: 'relative' }}>
                  <Image source={s.img} style={styles.serviceCardImg} resizeMode="cover" />
                  <View style={[styles.serviceCardTag, { backgroundColor: s.tagColor }]}>
                    <Text style={styles.serviceCardTagText}>{s.tag}</Text>
                  </View>
                </View>
                <View style={styles.serviceCardBody}>
                  <Text style={styles.serviceCardTitle}>{s.title}</Text>
                  <Text style={styles.serviceCardPrice}>{s.price}</Text>
                  <Text style={styles.serviceCardDesc}>{s.desc}</Text>
                  <View style={styles.serviceHighlights}>
                    {s.highlights.map((h, hi) => (
                      <View key={hi} style={styles.serviceHighlightRow}>
                        <View style={styles.bulletDot} />
                        <Text style={styles.serviceHighlightText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity style={styles.serviceCardBtn} onPress={s.ctaFn}>
                    <Text style={styles.serviceCardBtnText}>{s.cta}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── CALCULATOR TAB ── */}
        {custTab === 'calculator' && (
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>Salary Benchmark Calculator</Text>
            <Text style={styles.pageSub}>Find the prevailing market salary for private drivers in Delhi NCR</Text>

            <View style={styles.calcCard}>
              <Text style={styles.calcLabel}>Select Area</Text>
              <View style={styles.pillRow}>
                {['South Delhi', 'Gurugram', 'Noida', 'Central / West Delhi'].map(c => (
                  <TouchableOpacity key={c} onPress={() => setCalcCity(c)}
                    style={[styles.pill, calcCity === c && styles.pillActive]}>
                    <Text style={[styles.pillText, calcCity === c && styles.pillTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.calcLabel}>Daily Duty Shift</Text>
              <View style={styles.pillRow}>
                {['8 Hours', '10 Hours', '12 Hours', '24-Hr Live-in'].map(h => (
                  <TouchableOpacity key={h} onPress={() => setCalcHours(h)}
                    style={[styles.pill, calcHours === h && styles.pillActive]}>
                    <Text style={[styles.pillText, calcHours === h && styles.pillTextActive]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.calcLabel}>Vehicle Transmission</Text>
              <View style={styles.pillRow}>
                {['Manual', 'Automatic', 'Luxury / EV'].map(t => (
                  <TouchableOpacity key={t} onPress={() => setCalcTrans(t)}
                    style={[styles.pill, calcTrans === t && styles.pillActive]}>
                    <Text style={[styles.pillText, calcTrans === t && styles.pillTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Benchmark Output Card */}
            <View style={styles.salaryResultCard}>
              <Text style={styles.salaryResultLabel}>RECOMMENDED MONTHLY SALARY</Text>
              <Text style={styles.salaryResultAmount}>
                Rs. {salCalc.min.toLocaleString('en-IN')} – Rs. {salCalc.max.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.salaryResultFor}>For {calcHours} shift in {calcCity} ({calcTrans})</Text>
              <View style={styles.salaryDivider} />
              <View style={styles.salaryRow}>
                <Text style={styles.salaryRowLabel}>Overtime Rate</Text>
                <Text style={styles.salaryRowValue}>Rs. {salCalc.ot} per hour</Text>
              </View>
              <View style={styles.salaryRow}>
                <Text style={styles.salaryRowLabel}>Sunday / Holiday Allowance</Text>
                <Text style={styles.salaryRowValue}>Rs. 200 per day</Text>
              </View>
              <View style={styles.salaryRow}>
                <Text style={styles.salaryRowLabel}>One-Time Placement Fee</Text>
                <Text style={styles.salaryRowValue}>Rs. {salCalc.fee} (30-day warranty)</Text>
              </View>
              <View style={styles.salaryRow}>
                <Text style={styles.salaryRowLabel}>Notice Period</Text>
                <Text style={styles.salaryRowValue}>15 days mutual notice</Text>
              </View>
              <TouchableOpacity style={styles.salaryHireBtn}
                onPress={() => { setForm({ ...form, location: calcCity, trans: calcTrans }); setCustTab('book'); }}>
                <Text style={styles.salaryHireBtnText}>Hire Driver at This Rate</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calcNote}>
              <Text style={styles.calcNoteText}>Note: These benchmark figures reflect current Delhi NCR market rates. Actual salary is finalized directly between you and the driver.</Text>
            </View>
          </View>
        )}

        {/* ── DRIVERS TAB ── */}
        {custTab === 'drivers' && (
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>Verified Candidate Pool</Text>
            <Text style={styles.pageSub}>Sample chauffeur profiles ready for immediate placement</Text>

            {CANDIDATES.map(d => (
              <View key={d.id} style={styles.driverCard}>
                <View style={styles.driverCardTop}>
                  <Image source={d.photo} style={styles.driverAvatar} resizeMode="cover" />
                  <View style={styles.driverCardInfo}>
                    <View style={styles.driverNameRow}>
                      <Text style={styles.driverName}>{d.name}</Text>
                      {d.verified && <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>Police Verified</Text></View>}
                    </View>
                    <Text style={styles.driverBadge}>{d.badge}</Text>
                    <Text style={styles.driverExp}>{d.exp} experience</Text>
                    <View style={styles.driverRatingRow}>
                      <Text style={styles.driverRating}>★ {d.rating}</Text>
                      <Text style={styles.driverTrips}> ({d.trips} verified placements)</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.driverDivider} />
                <View style={styles.driverDetailGrid}>
                  <View style={styles.driverDetailItem}>
                    <Text style={styles.driverDetailLabel}>Expertise</Text>
                    <Text style={styles.driverDetailValue}>{d.skills}</Text>
                  </View>
                  <View style={styles.driverDetailItem}>
                    <Text style={styles.driverDetailLabel}>Preferred Area</Text>
                    <Text style={styles.driverDetailValue}>{d.location}</Text>
                  </View>
                  <View style={styles.driverDetailItem}>
                    <Text style={styles.driverDetailLabel}>Languages</Text>
                    <Text style={styles.driverDetailValue}>{d.languages}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.driverCardBtn} onPress={() => setCustTab('book')}>
                  <Text style={styles.driverCardBtnText}>Schedule 1-Day Trial with {d.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ── BOOK TAB ── */}
        {custTab === 'book' && (
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>Request a Verified Chauffeur</Text>
            <Text style={styles.pageSub}>Submit your requirements. We will share 3 candidate dossiers within 4 hours.</Text>

            <View style={styles.bookForm}>
              <Text style={styles.fieldLabel}>Full Name *</Text>
              <TextInput style={styles.fieldInput} placeholder="e.g. Priya Sharma"
                value={form.name} onChangeText={v => setForm({ ...form, name: v })} />

              <Text style={styles.fieldLabel}>Mobile Number *</Text>
              <TextInput style={styles.fieldInput} placeholder="+91 98765 43210"
                keyboardType="phone-pad" value={form.phone} onChangeText={v => setForm({ ...form, phone: v })} />

              <Text style={styles.fieldLabel}>Your Car Model</Text>
              <TextInput style={styles.fieldInput} placeholder="e.g. Hyundai Creta / Honda City ZX"
                value={form.car} onChangeText={v => setForm({ ...form, car: v })} />

              <Text style={styles.fieldLabel}>Your Area / Colony</Text>
              <TextInput style={styles.fieldInput} placeholder="e.g. Vasant Vihar, South Delhi"
                value={form.location} onChangeText={v => setForm({ ...form, location: v })} />

              <Text style={styles.fieldLabel}>Service Type</Text>
              <View style={styles.pillRow}>
                {['Personal Chauffeur', 'Outstation Trip', 'Corporate Fleet'].map(s => (
                  <TouchableOpacity key={s} onPress={() => setForm({ ...form, service: s })}
                    style={[styles.pill, form.service === s && styles.pillActive]}>
                    <Text style={[styles.pillText, form.service === s && styles.pillTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Transmission</Text>
              <View style={styles.pillRow}>
                {['Manual', 'Automatic', 'Luxury / EV'].map(t => (
                  <TouchableOpacity key={t} onPress={() => setForm({ ...form, trans: t })}
                    style={[styles.pill, form.trans === t && styles.pillActive]}>
                    <Text style={[styles.pillText, form.trans === t && styles.pillTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.bookSubmitBtn} onPress={submitBooking} disabled={loading}>
                {loading ? <ActivityIndicator color={C.white} /> : <Text style={styles.bookSubmitBtnText}>Submit Driver Request</Text>}
              </TouchableOpacity>

              <View style={styles.bookOrRow}>
                <View style={styles.bookOrLine} /><Text style={styles.bookOrText}>or contact dispatch directly</Text><View style={styles.bookOrLine} />
              </View>
              <View style={styles.bookDirectRow}>
                <TouchableOpacity style={styles.bookCallBtn} onPress={call}>
                  <Text style={styles.bookCallBtnText}>Call +91 8175087004</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bookWABtn} onPress={() => whatsapp()}>
                  <Text style={styles.bookWABtnText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ── ABOUT TAB ── */}
        {custTab === 'about' && (
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>About Drivers Saathi</Text>
            <Text style={styles.pageSub}>Organizing private car driver recruitment across Delhi NCR since 2019</Text>

            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Our Story</Text>
              <Text style={{ color: C.textSub, lineHeight: 22, fontSize: 13, marginBottom: 12 }}>
                Drivers Saathi was founded in 2019 by Kshitij Tripathi after seeing how informal and stressful hiring private drivers was in Delhi NCR. Families relied on unverified word-of-mouth recommendations with zero background verification, while hardworking drivers had no formal contracts or fair wage transparency.
              </Text>
              <Text style={{ color: C.textSub, lineHeight: 22, fontSize: 13 }}>
                We built a structured platform that bridges this trust gap: police verification from local stations, transparent salary benchmarks, written legal agreements, and a 30-day replacement warranty.
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Our Core Principles</Text>
              {[
                { title: 'Zero Compromise on Verification', desc: 'Police clearance certificate, Aadhaar, and commercial driving licence are mandatory for every candidate.' },
                { title: 'Fair Wages & Dignity', desc: 'We educate car owners on market overtime rates and standard working hours, ensuring long-term driver retention.' },
                { title: 'Replacement Assurance', desc: 'If a driver leaves or is not suitable within 30 days, we arrange a verified replacement at no extra charge.' },
                { title: 'Standby Backup Network', desc: 'Emergency 1-day substitute drivers when your regular chauffeur takes planned or urgent leave.' },
              ].map((p, idx) => (
                <View key={idx} style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: '800', color: C.brand, fontSize: 13 }}>{p.title}</Text>
                  <Text style={{ color: C.textSub, fontSize: 12, marginTop: 2, lineHeight: 18 }}>{p.desc}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Operations & Dispatch Hubs</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>South Delhi Desk</Text>
                <Text style={styles.infoValue}>Ring Road, Near South Ex</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gurugram Desk</Text>
                <Text style={styles.infoValue}>DLF Cyber City, Phase 2</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Noida Desk</Text>
                <Text style={styles.infoValue}>Sector 62 Institutional Area</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Placements</Text>
                <Text style={[styles.infoValue, { color: C.green, fontWeight: '700' }]}>500+ Active Placements</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── CONTACT TAB ── */}
        {custTab === 'contact' && (
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>Contact & Helpline</Text>
            <Text style={styles.pageSub}>Connect with our client placement desk</Text>

            <View style={styles.contactCard}>
              <Text style={styles.contactCardTitle}>Delhi NCR Central Dispatch</Text>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Phone Helpline</Text>
                <Text style={styles.contactValue}>+91 8175087004</Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>WhatsApp Desk</Text>
                <Text style={styles.contactValue}>+91 8175087004</Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Email Support</Text>
                <Text style={styles.contactValue}>support@driverssaathi.com</Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Operating Hours</Text>
                <Text style={styles.contactValue}>Mon–Sat, 9:00 AM – 8:00 PM</Text>
              </View>
              <TouchableOpacity style={[styles.serviceCardBtn, { marginTop: 14 }]} onPress={call}>
                <Text style={styles.serviceCardBtnText}>Call Dispatch Desk</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.serviceCardBtn, { marginTop: 8, backgroundColor: C.green }]} onPress={() => whatsapp()}>
                <Text style={styles.serviceCardBtnText}>Message on WhatsApp</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.faqCard}>
              <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
              {[
                { q: 'How quickly can I get a driver?', a: 'We share verified candidate profiles within 4 hours. You can conduct a 1-day trial the following day, with final placement within 48 hours.' },
                { q: 'What does the 30-day replacement guarantee cover?', a: 'If the placed driver leaves, is consistently late, or does not match your car requirements, we provide a free candidate replacement within 48 hours.' },
                { q: 'Who pays the driver monthly salary?', a: 'You pay the salary directly to the driver by the 5th of each month. Drivers Saathi only charges a one-time placement fee of Rs. 4,500.' },
                { q: 'Do you verify police records?', a: 'Yes. Every candidate has a verified local police clearance certificate and commercial driving licence check before we present them.' },
              ].map((f, i) => (
                <View key={i} style={styles.faqItem}>
                  <Text style={styles.faqQ}>{f.q}</Text>
                  <Text style={styles.faqA}>{f.a}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={successModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalCheckCircle}><Text style={styles.modalCheck}>✓</Text></View>
            <Text style={styles.modalTitle}>Inquiry Logged!</Text>
            <Text style={styles.modalMsg}>{successModal.msg}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setSuccessModal({ visible: false, msg: '' })}>
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  // ============================================================================
  // VIEW: DRIVER LOGIN
  // ============================================================================
  const renderDriverLogin = () => (
    <View style={{ flex: 1, backgroundColor: C.driverBg }}>
      <View style={styles.loginPortalHeader}>
        <TouchableOpacity onPress={() => setPortal('landing')}>
          <Text style={styles.loginBackBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.loginPortalTitle}>Driver Partner Login</Text>
        <TouchableOpacity onPress={() => setPortal('driver_register')}>
          <Text style={{ color: C.driverPrimary, fontWeight: '700', fontSize: 12 }}>रजिस्ट्रेशन</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.loginScroll}>
        <View style={styles.loginCard}>
          <View style={[styles.loginIcon, { backgroundColor: C.driverPrimary }]}>
            <Text style={styles.loginIconText}>D</Text>
          </View>
          <Text style={styles.loginTitle}>Driver Sign In</Text>
          <Text style={styles.loginSub}>Enter your Driver ID and password provided by the dispatch desk</Text>

          <Text style={styles.fieldLabel}>Driver ID</Text>
          <TextInput style={styles.fieldInput} placeholder="e.g. DRV-101" autoCapitalize="characters"
            value={drvId} onChangeText={setDrvId} />

          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput style={styles.fieldInput} placeholder="Enter password" secureTextEntry
            value={drvPass} onChangeText={setDrvPass} />

          <TouchableOpacity style={[styles.loginBtn, { backgroundColor: C.driverPrimary }]} onPress={loginDriver}>
            <Text style={styles.loginBtnText}>Sign In to Driver Workspace</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginDemoBtn}
            onPress={() => { setDrvId('DRV-101'); setDrvPass('1234'); setPortal('driver_app'); }}>
            <Text style={styles.loginDemoBtnText}>Instant Demo Sign In (DRV-101 / 1234)</Text>
          </TouchableOpacity>

          {/* New Driver Register Link */}
          <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.divider, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: C.textSub, marginBottom: 8 }}>नया ड्राइवर हैं? अपना रजिस्ट्रेशन करें:</Text>
            <TouchableOpacity style={styles.linkRegBtn} onPress={() => setPortal('driver_register')}>
              <Text style={styles.linkRegBtnText}>ड्राइवर साथी से जुड़ें (New Driver Registration)</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.loginHelpText}>Need login help? Call Helpline: +91 8175087004</Text>
        </View>
      </ScrollView>
    </View>
  );

  // ============================================================================
  // VIEW: DRIVER APP WORKSPACE
  // ============================================================================
  const renderDriverApp = () => (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={[styles.portalHeader, { backgroundColor: C.driverPrimary }]}>
        <View>
          <Text style={styles.portalHeaderGreet}>Good Morning,</Text>
          <Text style={styles.portalHeaderName}>Rameshwar Dayal</Text>
          <Text style={styles.portalHeaderId}>ID: DRV-101 • Verified Chauffeur</Text>
        </View>
        <TouchableOpacity style={styles.portalLogoutBtn} onPress={() => setPortal('landing')}>
          <Text style={styles.portalLogoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.portalTabBar}>
        {[
          { k: 'today',   l: 'Today' },
          { k: 'logbook', l: 'Logbook' },
          { k: 'attend',  l: 'Attendance' },
          { k: 'leave',   l: 'Leave' },
          { k: 'docs',    l: 'Documents' },
          { k: 'salary',  l: 'Salary' },
        ].map(t => (
          <TouchableOpacity key={t.k} onPress={() => setDrvTab(t.k)}
            style={[styles.portalTab, drvTab === t.k && { borderBottomColor: C.driverAccent, borderBottomWidth: 3 }]}>
            <Text style={[styles.portalTabText, drvTab === t.k && { color: C.driverAccent, fontWeight: '800' }]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* ── DRIVER: TODAY DUTY ── */}
        {drvTab === 'today' && (
          <View>
            <View style={[styles.statusBanner, { backgroundColor: C.driverPrimary }]}>
              <View>
                <Text style={styles.statusBannerTitle}>Active Duty Assignment</Text>
                <Text style={styles.statusBannerSub}>Friday, 11 September 2026</Text>
              </View>
              <View style={styles.onDutyPill}>
                <Text style={styles.onDutyPillText}>ON DUTY</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Today's Assignment Details</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Car Owner</Text>
                <Text style={styles.infoValue}>Mr. Rajesh Agarwal</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vehicle</Text>
                <Text style={styles.infoValue}>Hyundai Creta (DL 3C XX 1234)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Shift Time</Text>
                <Text style={styles.infoValue}>08:30 AM – 06:30 PM (10 Hours)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Reporting Address</Text>
                <Text style={styles.infoValue}>Villa 14, Poorvi Marg, Vasant Vihar</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Monthly Pay</Text>
                <Text style={[styles.infoValue, { color: C.green, fontWeight: '700' }]}>Rs. 22,000 / month</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>OT Rate</Text>
                <Text style={styles.infoValue}>Rs. 80 / hour</Text>
              </View>
            </View>

            <Text style={styles.sectionHeading}>Quick Duty Actions</Text>
            <View style={styles.actionGrid}>
              {[
                { label: 'Record Check-In', color: C.driverPrimary, fn: () => Alert.alert('Check-In Recorded', 'Check-in logged at 08:30 AM.') },
                { label: 'Record Check-Out', color: C.driverAccent, fn: () => Alert.alert('Check-Out Recorded', 'Check-out recorded. Submit end odometer reading in Logbook.') },
                { label: 'Call Car Owner', color: C.blue, fn: () => Linking.openURL('tel:+919811023456') },
                { label: 'Call Dispatch Desk', color: C.amber, fn: call },
              ].map((a, i) => (
                <TouchableOpacity key={i} onPress={a.fn}
                  style={[styles.actionBtn, { backgroundColor: a.color }]}>
                  <Text style={styles.actionBtnText}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Emergency SOS Card */}
            <View style={styles.sosCard}>
              <Text style={styles.sosTitle}>EMERGENCY SOS</Text>
              <Text style={styles.sosSub}>In case of accident, roadside breakdown, or medical emergency, tap below to contact the 24x7 dispatch desk immediately.</Text>
              <TouchableOpacity style={styles.sosBtn} onPress={call}>
                <Text style={styles.sosBtnText}>Emergency Call Dispatch: +91 8175087004</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── DRIVER: LOGBOOK ── */}
        {drvTab === 'logbook' && (
          <View>
            <Text style={styles.sectionHeading}>Submit Daily Duty Record</Text>
            <View style={styles.infoCard}>
              <View style={styles.formRowGroup}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.fieldLabel}>Date</Text>
                  <TextInput style={styles.fieldInput} value={logDate} onChangeText={setLogDate} />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.fieldLabel}>Check-In</Text>
                  <TextInput style={styles.fieldInput} value={logIn} onChangeText={setLogIn} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Check-Out</Text>
                  <TextInput style={styles.fieldInput} value={logOut} onChangeText={setLogOut} />
                </View>
              </View>

              <View style={styles.formRowGroup}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.fieldLabel}>Start KM</Text>
                  <TextInput style={styles.fieldInput} value={logStartKm} onChangeText={setLogStartKm} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.fieldLabel}>End KM</Text>
                  <TextInput style={styles.fieldInput} value={logEndKm} onChangeText={setLogEndKm} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>OT (hrs)</Text>
                  <TextInput style={styles.fieldInput} value={logOT} onChangeText={setLogOT} keyboardType="decimal-pad" />
                </View>
              </View>

              <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.driverPrimary }]} onPress={pickPhoto}>
                <Text style={styles.serviceCardBtnText}>{logPhoto ? 'Odometer Photo Attached' : 'Attach Odometer Photo'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.serviceCardBtn, { marginTop: 8 }]} onPress={saveLog}>
                <Text style={styles.serviceCardBtnText}>Save Duty Record</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeading}>Timesheet Log History</Text>
            {dutyLogs.map(log => (
              <View key={log.id} style={styles.logRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logDate}>{log.date}</Text>
                  <Text style={styles.logMeta}>{log.inTime} – {log.outTime} | Overtime: {log.ot}</Text>
                  <Text style={styles.logKm}>{log.startKm} → {log.endKm} km</Text>
                </View>
                <View style={[styles.logStatusBadge, { backgroundColor: log.approved ? C.greenBg : C.amberBg }]}>
                  <Text style={[styles.logStatusText, { color: log.approved ? C.green : C.amber }]}>
                    {log.approved ? 'Approved' : 'Pending Review'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── DRIVER: ATTENDANCE CALENDAR ── */}
        {drvTab === 'attend' && (
          <View>
            <Text style={styles.sectionHeading}>September 2026 Attendance</Text>
            <View style={styles.kpiGrid}>
              <View style={[styles.kpiCard, { backgroundColor: C.greenBg }]}>
                <Text style={[styles.kpiValue, { color: C.green }]}>18</Text>
                <Text style={styles.kpiLabel}>Days Present</Text>
              </View>
              <View style={[styles.kpiCard, { backgroundColor: C.amberBg }]}>
                <Text style={[styles.kpiValue, { color: C.amber }]}>1</Text>
                <Text style={styles.kpiLabel}>Planned Leave</Text>
              </View>
              <View style={[styles.kpiCard, { backgroundColor: C.blueBg }]}>
                <Text style={[styles.kpiValue, { color: C.blue }]}>11</Text>
                <Text style={styles.kpiLabel}>Remaining</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Monthly Calendar Grid</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                  <Text key={i} style={{ width: 34, textAlign: 'center', fontWeight: '800', color: C.textSub, fontSize: 11 }}>{d}</Text>
                ))}
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                {/* 30 Days of Sept */}
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                  let bg = C.bg;
                  let txtColor = C.text;
                  if (day <= 10) { bg = C.green; txtColor = C.white; }
                  else if (day === 11) { bg = C.green; txtColor = C.white; }
                  else if (day === 19) { bg = C.amber; txtColor = C.white; }
                  else if (day === 13 || day === 20 || day === 27) { bg = '#E2E8F0'; txtColor = C.textMuted; }

                  return (
                    <View key={day} style={{ width: (SW - 72) / 7, height: 36, backgroundColor: bg, borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: txtColor }}>{day}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={{ flexDirection: 'row', gap: 14, marginTop: 14, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: C.green }} />
                  <Text style={{ fontSize: 11, color: C.textSub }}>Worked</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: C.amber }} />
                  <Text style={{ fontSize: 11, color: C.textSub }}>Leave</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#E2E8F0' }} />
                  <Text style={{ fontSize: 11, color: C.textSub }}>Weekly Off / Future</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── DRIVER: LEAVE & GRIEVANCE ── */}
        {drvTab === 'leave' && (
          <View>
            <Text style={styles.sectionHeading}>Apply for Leave</Text>
            <View style={styles.infoCard}>
              <Text style={styles.fieldLabel}>Leave Date</Text>
              <TextInput style={styles.fieldInput} value={lvDate} onChangeText={setLvDate} placeholder="YYYY-MM-DD" />
              <Text style={styles.fieldLabel}>Reason for Leave</Text>
              <TextInput style={[styles.fieldInput, { height: 70, textAlignVertical: 'top' }]}
                multiline value={lvReason} onChangeText={setLvReason}
                placeholder="e.g. Family function, medical visit" />
              <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.driverPrimary, marginTop: 10 }]} onPress={submitLeave}>
                <Text style={styles.serviceCardBtnText}>Submit Leave Request</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeading}>Leave History</Text>
            {leaves.map(l => (
              <View key={l.id} style={styles.leaveRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.leaveDate}>{l.date}</Text>
                  <Text style={styles.leaveReason}>{l.reason}</Text>
                  {l.sub !== 'Pending Assignment' && (
                    <Text style={styles.leaveSub}>Substitute Arranged: {l.sub}</Text>
                  )}
                </View>
                <View style={[styles.logStatusBadge, {
                  backgroundColor: l.status === 'Approved' ? C.greenBg : C.amberBg
                }]}>
                  <Text style={[styles.logStatusText, {
                    color: l.status === 'Approved' ? C.green : C.amber
                  }]}>{l.status}</Text>
                </View>
              </View>
            ))}

            {/* Grievance & Feedback Box */}
            <Text style={styles.sectionHeading}>Driver Welfare & Grievance Box</Text>
            <View style={styles.infoCard}>
              <Text style={{ fontSize: 12, color: C.textSub, marginBottom: 8 }}>
                Facing any issue with duty timings, delayed salary, or car owner behavior? Submit confidentially to the Drivers Saathi Welfare team.
              </Text>
              <TextInput style={[styles.fieldInput, { height: 70, textAlignVertical: 'top' }]}
                multiline placeholder="Write your message or grievance..."
                value={feedbackText} onChangeText={setFeedbackText} />
              <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.brand, marginTop: 8 }]} onPress={submitFeedback}>
                <Text style={styles.serviceCardBtnText}>Submit Confidential Grievance</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── DRIVER: DOCUMENTS ── */}
        {drvTab === 'docs' && (
          <View>
            <Text style={styles.sectionHeading}>Verified Documents Vault</Text>
            {[
              { title: 'Aadhaar Card', num: 'XXXX XXXX 7821', status: 'Verified', color: C.green },
              { title: 'Driving Licence (Commercial)', num: 'DL-0420110012345', status: 'Active (LMV-TR)', color: C.green },
              { title: 'Police Clearance Certificate', num: 'PC/DL/2024/8871', status: 'Station Verified', color: C.green },
              { title: 'Medical Fitness Certificate', num: 'MFC-2025-114', status: 'Valid till Mar 2027', color: C.blue },
              { title: 'Passport Size Photograph', num: 'On File', status: 'Uploaded', color: C.brand },
            ].map((d, i) => (
              <View key={i} style={styles.docCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitle}>{d.title}</Text>
                  <Text style={styles.docNum}>{d.num}</Text>
                </View>
                <View style={[styles.logStatusBadge, { backgroundColor: d.color + '20' }]}>
                  <Text style={[styles.logStatusText, { color: d.color }]}>{d.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── DRIVER: SALARY & ADVANCE ── */}
        {drvTab === 'salary' && (
          <View>
            <Text style={styles.sectionHeading}>Monthly Payroll Breakdown</Text>
            <View style={[styles.infoCard, { backgroundColor: C.driverPrimary }]}>
              <Text style={[styles.infoCardTitle, { color: C.white }]}>September 2026 Earnings</Text>
              <Text style={{ color: C.white, fontSize: 32, fontWeight: '800', marginVertical: 6 }}>Rs. 23,560</Text>
              <Text style={{ color: '#A5D6A7', fontSize: 13 }}>Estimated Net Take-Home</Text>
            </View>

            <View style={styles.infoCard}>
              {[
                { label: 'Base Salary (10 Hours)', value: 'Rs. 22,000' },
                { label: 'Overtime (18.5 hrs @ Rs. 80)', value: 'Rs. 1,480' },
                { label: 'Sunday Duty Allowance', value: 'Rs. 600' },
                { label: 'Festival Bonus (Ganesh Chaturthi)', value: 'Rs. 500' },
                { label: 'Previous Advance Deduction', value: '- Rs. 1,020' },
              ].map((r, i) => (
                <View key={i} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{r.label}</Text>
                  <Text style={[styles.infoValue, r.value.startsWith('-') && { color: C.red }]}>{r.value}</Text>
                </View>
              ))}
              <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, marginTop: 4 }]}>
                <Text style={[styles.infoLabel, { fontWeight: '700', color: C.text }]}>Net Salary Due</Text>
                <Text style={[styles.infoValue, { fontWeight: '800', color: C.green, fontSize: 16 }]}>Rs. 23,560</Text>
              </View>
            </View>

            {/* Request Advance Section */}
            <Text style={styles.sectionHeading}>Request Salary Advance</Text>
            <View style={styles.infoCard}>
              <Text style={styles.fieldLabel}>Amount Needed (Rs.)</Text>
              <TextInput style={styles.fieldInput} placeholder="e.g. 2000"
                keyboardType="numeric" value={advanceAmt} onChangeText={setAdvanceAmt} />
              <Text style={styles.fieldLabel}>Reason for Advance</Text>
              <TextInput style={styles.fieldInput} placeholder="e.g. Medical, children school fees"
                value={advanceReason} onChangeText={setAdvanceReason} />
              <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.driverPrimary, marginTop: 10 }]} onPress={submitAdvance}>
                <Text style={styles.serviceCardBtnText}>Submit Advance Request</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeading}>Advance Request History</Text>
            {advanceRequests.map(adv => (
              <View key={adv.id} style={styles.logRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logDate}>{adv.amount} — {adv.reason}</Text>
                  <Text style={styles.logMeta}>Date: {adv.date}</Text>
                </View>
                <View style={[styles.logStatusBadge, { backgroundColor: adv.status === 'Approved' ? C.greenBg : C.amberBg }]}>
                  <Text style={[styles.logStatusText, { color: adv.status === 'Approved' ? C.green : C.amber }]}>
                    {adv.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );

  // ============================================================================
  // VIEW: OWNER LOGIN
  // ============================================================================
  const renderOwnerLogin = () => (
    <View style={{ flex: 1, backgroundColor: C.ownerBg }}>
      <View style={styles.loginPortalHeader}>
        <TouchableOpacity onPress={() => setPortal('landing')}>
          <Text style={styles.loginBackBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.loginPortalTitle}>Car Owner Portal</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.loginScroll}>
        <View style={styles.loginCard}>
          <View style={[styles.loginIcon, { backgroundColor: C.ownerPrimary }]}>
            <Text style={styles.loginIconText}>O</Text>
          </View>
          <Text style={styles.loginTitle}>Car Owner Sign In</Text>
          <Text style={styles.loginSub}>Access assigned driver dossier, vehicle compliance, duty approvals, and payment records</Text>

          <Text style={styles.fieldLabel}>Owner ID</Text>
          <TextInput style={styles.fieldInput} placeholder="e.g. OWN-501" autoCapitalize="characters"
            value={ownId} onChangeText={setOwnId} />
          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput style={styles.fieldInput} placeholder="Enter password" secureTextEntry
            value={ownPass} onChangeText={setOwnPass} />

          <TouchableOpacity style={[styles.loginBtn, { backgroundColor: C.ownerPrimary }]} onPress={loginOwner}>
            <Text style={styles.loginBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginDemoBtn}
            onPress={() => { setOwnId('OWN-501'); setOwnPass('1234'); setPortal('owner_app'); }}>
            <Text style={styles.loginDemoBtnText}>Demo Sign In (OWN-501 / 1234)</Text>
          </TouchableOpacity>
          <Text style={styles.loginHelpText}>Helpline: +91 8175087004</Text>
        </View>
      </ScrollView>
    </View>
  );

  // ============================================================================
  // VIEW: OWNER PORTAL WORKSPACE
  // ============================================================================
  const renderOwnerApp = () => (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={[styles.portalHeader, { backgroundColor: C.ownerPrimary }]}>
        <View>
          <Text style={styles.portalHeaderGreet}>Owner Portal</Text>
          <Text style={styles.portalHeaderName}>Mr. Rajesh Agarwal</Text>
          <Text style={styles.portalHeaderId}>ID: OWN-501 • Vasant Vihar, South Delhi</Text>
        </View>
        <TouchableOpacity style={styles.portalLogoutBtn} onPress={() => setPortal('landing')}>
          <Text style={styles.portalLogoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.portalTabBar}>
        {[
          { k: 'driver',    l: 'Driver' },
          { k: 'vehicle',   l: 'Vehicle' },
          { k: 'approve',   l: 'Approve' },
          { k: 'payments',  l: 'Payments' },
          { k: 'substitute',l: 'Substitute' },
          { k: 'agreement', l: 'Agreement' },
        ].map(t => (
          <TouchableOpacity key={t.k} onPress={() => setOwnTab(t.k)}
            style={[styles.portalTab, ownTab === t.k && { borderBottomColor: C.ownerAccent, borderBottomWidth: 3 }]}>
            <Text style={[styles.portalTabText, ownTab === t.k && { color: C.ownerAccent, fontWeight: '800' }]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* ── OWNER: DRIVER PROFILE & RATING ── */}
        {ownTab === 'driver' && (
          <View>
            <Text style={styles.sectionHeading}>Assigned Driver Dossier</Text>
            <View style={styles.infoCard}>
              <Image source={require('./assets/indian_driver_portrait.jpg')} style={{ width: '100%', height: 160, borderRadius: 10, marginBottom: 12 }} resizeMode="cover" />
              <View style={styles.driverNameRow}>
                <Text style={styles.driverName}>Rameshwar Dayal</Text>
                <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>Police Verified</Text></View>
              </View>
              <Text style={styles.driverBadge}>Senior Chauffeur • DRV-101</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Experience</Text>
                <Text style={styles.infoValue}>15 Years</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Driving Score</Text>
                <Text style={[styles.infoValue, { color: C.green }]}>★ 4.95 (184 placements)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Commercial DL</Text>
                <Text style={styles.infoValue}>DL-0420110012345 (LMV-TR)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Police Verification</Text>
                <Text style={[styles.infoValue, { color: C.green }]}>Verified: PC/DL/2024/8871</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Aadhaar UID</Text>
                <Text style={[styles.infoValue, { color: C.green }]}>Verified: XXXX XXXX 7821</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mobile Number</Text>
                <Text style={styles.infoValue}>+91 98765 43210</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Emergency Contact</Text>
                <Text style={styles.infoValue}>Sunita Devi (Wife) — +91 99887 76655</Text>
              </View>
              <TouchableOpacity style={[styles.serviceCardBtn, { marginTop: 12 }]}
                onPress={() => Linking.openURL('tel:+919876543210')}>
                <Text style={styles.serviceCardBtnText}>Call Assigned Driver</Text>
              </TouchableOpacity>
            </View>

            {/* Monthly Driver Rating Box */}
            <Text style={styles.sectionHeading}>Rate Performance (September 2026)</Text>
            <View style={styles.infoCard}>
              <Text style={{ fontSize: 13, color: C.textSub, marginBottom: 10 }}>Rate your driver's punctuality, car maintenance, and driving quality:</Text>
              <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', marginVertical: 8 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity key={star} onPress={() => setOwnerRating(star)} style={{ padding: 6 }}>
                    <Text style={{ fontSize: 32, color: star <= ownerRating ? C.accentGold : '#CBD5E1' }}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput style={[styles.fieldInput, { height: 60, marginTop: 8 }]}
                placeholder="Optional comments for admin file (e.g. punctual, smooth driving)..."
                value={ownerComment} onChangeText={setOwnerComment} />
              <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.ownerPrimary, marginTop: 10 }]} onPress={submitDriverRating}>
                <Text style={styles.serviceCardBtnText}>Submit Monthly Rating</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── OWNER: VEHICLE COMPLIANCE & EXPENSES ── */}
        {ownTab === 'vehicle' && (
          <View>
            <Text style={styles.sectionHeading}>Vehicle Compliance Status</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Hyundai Creta 2023</Text>
              <Text style={{ color: C.textSub, fontSize: 13, marginBottom: 12 }}>Reg: DL 3C XX 1234 • Automatic • Silver</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current Odometer</Text>
                <Text style={styles.infoValue}>42,280 km</Text>
              </View>
            </View>

            {[
              { title: 'PUC Certificate', expiry: '25 Oct 2026', status: 'Valid', daysLeft: 44, color: C.green },
              { title: 'Comprehensive Insurance', expiry: '14 Dec 2026', status: 'Valid', daysLeft: 94, color: C.green },
              { title: 'Fitness Certificate', expiry: '10 Oct 2026', status: 'Expiring Soon', daysLeft: 29, color: C.amber },
              { title: 'Road Tax', expiry: 'Lifetime Paid', status: 'Valid', daysLeft: 999, color: C.green },
            ].map((item, i) => (
              <View key={i} style={styles.complianceCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.complianceTitle}>{item.title}</Text>
                  <Text style={styles.complianceExpiry}>Expiry Date: {item.expiry}</Text>
                  {item.daysLeft < 60 && item.daysLeft < 999 && (
                    <Text style={[styles.complianceDays, { color: item.color }]}>{item.daysLeft} days remaining</Text>
                  )}
                </View>
                <View style={[styles.logStatusBadge, { backgroundColor: item.color + '20' }]}>
                  <Text style={[styles.logStatusText, { color: item.color }]}>{item.status}</Text>
                </View>
              </View>
            ))}

            {/* Driver Expense Claims */}
            <Text style={styles.sectionHeading}>Driver Expense Reimbursement Claims</Text>
            {expenses.map(exp => (
              <View key={exp.id} style={styles.infoCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontWeight: '800', color: C.text, fontSize: 14 }}>{exp.desc}</Text>
                  <Text style={{ fontWeight: '800', color: C.brand, fontSize: 14 }}>{exp.amount}</Text>
                </View>
                <Text style={{ color: C.textSub, fontSize: 12, marginBottom: 10 }}>Date Submitted: {exp.date} • Status: {exp.status}</Text>
                {exp.status === 'Pending' ? (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity style={[styles.serviceCardBtn, { flex: 1, backgroundColor: C.green }]} onPress={() => handleExpenseAction(exp.id, 'approve')}>
                      <Text style={styles.serviceCardBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.serviceCardBtn, { flex: 1, backgroundColor: C.red }]} onPress={() => handleExpenseAction(exp.id, 'reject')}>
                      <Text style={styles.serviceCardBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={[styles.logStatusBadge, { alignSelf: 'flex-start', backgroundColor: exp.status === 'Approved' ? C.greenBg : C.redBg }]}>
                    <Text style={[styles.logStatusText, { color: exp.status === 'Approved' ? C.green : C.red }]}>{exp.status}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── OWNER: APPROVE DUTY & OVERTIME ── */}
        {ownTab === 'approve' && (
          <View>
            <Text style={styles.sectionHeading}>Driver Daily Duty Approvals</Text>
            <Text style={{ color: C.textSub, marginBottom: 12, fontSize: 13 }}>Review driver logged hours and approve overtime before payroll generation</Text>
            {dutyLogs.map(log => (
              <View key={log.id} style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Duty Date</Text>
                  <Text style={styles.infoValue}>{log.date}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Duty Shift</Text>
                  <Text style={styles.infoValue}>{log.inTime} – {log.outTime}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Odometer Reading</Text>
                  <Text style={styles.infoValue}>{log.startKm} → {log.endKm} km</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Overtime Claim</Text>
                  <Text style={styles.infoValue}>{log.ot}</Text>
                </View>
                {!log.approved ? (
                  <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.ownerPrimary, marginTop: 10 }]}
                    onPress={() => approveLog(log.id)}>
                    <Text style={styles.serviceCardBtnText}>Approve Timesheet & Overtime</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.logStatusBadge, { alignSelf: 'flex-start', marginTop: 8 }]}>
                    <Text style={[styles.logStatusText, { color: C.green }]}>Approved by Owner</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── OWNER: SALARY PAYMENTS TRACKER ── */}
        {ownTab === 'payments' && (
          <View>
            <Text style={styles.sectionHeading}>Driver Salary Payment Tracker</Text>
            <Text style={{ color: C.textSub, marginBottom: 12, fontSize: 13 }}>Maintain your monthly salary payout history and receipts</Text>

            {payments.map(p => (
              <View key={p.id} style={styles.infoCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: C.text }}>{p.month}</Text>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: C.green }}>{p.amount}</Text>
                </View>
                <Text style={{ fontSize: 12, color: C.textSub, marginBottom: 10 }}>Paid Date: {p.date}</Text>

                {p.status === 'Pending' ? (
                  <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.ownerPrimary }]} onPress={() => markPaymentPaid(p.id)}>
                    <Text style={styles.serviceCardBtnText}>Mark September Salary as Paid</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.logStatusBadge, { alignSelf: 'flex-start' }]}>
                    <Text style={[styles.logStatusText, { color: C.green }]}>Paid Successfully</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── OWNER: EMERGENCY SUBSTITUTE ── */}
        {ownTab === 'substitute' && (
          <View>
            <Text style={styles.sectionHeading}>Emergency Standby Driver Dispatch</Text>
            <View style={[styles.infoCard, { borderLeftWidth: 4, borderLeftColor: C.ownerAccent }]}>
              <Text style={styles.infoCardTitle}>1-Day Backup Chauffeur Guarantee</Text>
              <Text style={{ color: C.textSub, lineHeight: 20, marginBottom: 16 }}>
                If your assigned driver Rameshwar Dayal is unavailable due to leave or medical emergency, Drivers Saathi dispatches a pre-verified substitute driver to your location within 2 hours.
              </Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Included Allowance</Text>
                <Text style={styles.infoValue}>2 free standby dispatches per year</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Response SLA</Text>
                <Text style={styles.infoValue}>Under 2 hours in Delhi NCR</Text>
              </View>
              <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.ownerPrimary, marginTop: 12 }]}
                onPress={() => Alert.alert('Substitute Requested', 'Dispatch desk received your request. A coordinator will call in 15 minutes to confirm vehicle keys and time.')}>
                <Text style={styles.serviceCardBtnText}>Request Emergency Substitute</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.blue, marginTop: 8 }]} onPress={call}>
                <Text style={styles.serviceCardBtnText}>Direct Dispatch Helpline: +91 8175087004</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeading}>Next Standby Driver in Queue</Text>
            <View style={styles.driverCard}>
              <View style={styles.driverCardTop}>
                <Image source={require('./assets/indian_driver_wheel.jpg')} style={styles.driverAvatar} resizeMode="cover" />
                <View style={styles.driverCardInfo}>
                  <Text style={styles.driverName}>Vikramaditya Singh</Text>
                  <Text style={styles.driverBadge}>Luxury Specialist • DRV-102</Text>
                  <Text style={styles.driverRating}>★ 4.88 (142 placements)</Text>
                  <Text style={{ fontSize: 12, color: C.green, fontWeight: '700', marginTop: 4 }}>Standby Status: Ready for Dispatch</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── OWNER: LEGAL PLACEMENT AGREEMENT ── */}
        {ownTab === 'agreement' && (
          <View>
            <Text style={styles.sectionHeading}>Placement Contract & Warranty Terms</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Drivers Saathi Placement Agreement</Text>
              <Text style={{ color: C.textSub, fontSize: 12, marginBottom: 16 }}>Reference: DS-PL-2026-501 • Dated: 12 Aug 2026</Text>
              {[
                { section: '1. Contracting Parties', content: 'Agreement between Drivers Saathi Agency and Mr. Rajesh Agarwal (Client), for placement of Mr. Rameshwar Dayal (Driver).' },
                { section: '2. Working Shift', content: 'Standard 10 Hours daily, Monday to Saturday. Overtime compensated at Rs. 80/hr beyond shift.' },
                { section: '3. Direct Salary', content: 'Rs. 22,000 per month paid directly by Client to Driver by the 5th of each calendar month.' },
                { section: '4. Replacement Warranty', content: '30-day iron-clad free replacement warranty from deployment date if candidate is unsuitable.' },
                { section: '5. Mutual Notice Period', content: '15 calendar days notice required from either party before ending the service agreement.' },
                { section: '6. Standby Coverage', content: 'Access to agency backup pool at subsidized rates during driver approved leaves.' },
              ].map((c, i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: '700', color: C.text, fontSize: 13 }}>{c.section}</Text>
                  <Text style={{ color: C.textSub, fontSize: 12, marginTop: 3, lineHeight: 18 }}>{c.content}</Text>
                  {i < 5 && <View style={{ height: 1, backgroundColor: C.divider, marginTop: 10 }} />}
                </View>
              ))}
              <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.ownerPrimary, marginTop: 8 }]}
                onPress={() => Alert.alert('Agreement', 'Placement contract copy sent to registered email.')}>
                <Text style={styles.serviceCardBtnText}>Download Official Agreement Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );

  // ============================================================================
  // VIEW: ADMIN LOGIN
  // ============================================================================
  const renderAdminLogin = () => (
    <View style={{ flex: 1, backgroundColor: C.adminBg }}>
      <View style={styles.loginPortalHeader}>
        <TouchableOpacity onPress={() => setPortal('landing')}>
          <Text style={styles.loginBackBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.loginPortalTitle}>Dispatch Admin Console</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.loginScroll}>
        <View style={styles.loginCard}>
          <View style={[styles.loginIcon, { backgroundColor: C.adminPrimary }]}>
            <Text style={styles.loginIconText}>A</Text>
          </View>
          <Text style={styles.loginTitle}>Admin Dispatch Console</Text>
          <Text style={styles.loginSub}>Operations panel for placement management, lead tracking, and standby pool</Text>

          <Text style={styles.fieldLabel}>Admin ID</Text>
          <TextInput style={styles.fieldInput} placeholder="ADMIN" autoCapitalize="characters"
            value={admId} onChangeText={setAdmId} />
          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput style={styles.fieldInput} placeholder="Enter password" secureTextEntry
            value={admPass} onChangeText={setAdmPass} />

          <TouchableOpacity style={[styles.loginBtn, { backgroundColor: C.adminPrimary }]} onPress={loginAdmin}>
            <Text style={styles.loginBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginDemoBtn}
            onPress={() => { setAdmId('ADMIN'); setAdmPass('1234'); setPortal('admin_app'); }}>
            <Text style={styles.loginDemoBtnText}>Demo Sign In (ADMIN / 1234)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  // ============================================================================
  // VIEW: ADMIN OPERATIONS CONSOLE
  // ============================================================================
  const renderAdminApp = () => {
    const adminPlacements = [
      { id: 'P-101', owner: 'Mr. Rajesh Agarwal, Vasant Vihar', car: 'Hyundai Creta (DL 3C XX 1234)', driver: 'Rameshwar Dayal — DRV-101', status: 'Active Duty', warrantyEnd: '04 Oct 2026' },
      { id: 'P-102', owner: 'Dr. Sameer Kapoor, DLF Phase 5', car: 'BMW 5 Series (HR 26 BR 5678)', driver: 'Vikramaditya Singh — DRV-102', status: 'Active Duty', warrantyEnd: '12 Oct 2026' },
      { id: 'P-103', owner: 'Mrs. Anita Mehta, Sector 18 Noida', car: 'Honda City ZX (UP 16 XX 9090)', driver: 'Mohan Lal Verma — DRV-103', status: 'Trial in Progress', warrantyEnd: 'Pending Confirmation' },
    ];
    const leads = [
      { id: 'DS-3421', name: 'Sunita Bhatia', phone: '+91 98112 33445', area: 'Dwarka, Delhi', car: 'Maruti Swift', service: 'Personal Chauffeur', status: 'New Lead' },
      { id: 'DS-3420', name: 'Rajiv Malhotra', phone: '+91 97118 55667', area: 'Sector 56, Gurugram', car: 'Honda Amaze', service: 'Corporate Fleet', status: 'Contacted' },
      { id: 'DS-3419', name: 'Priya Menon', phone: '+91 99100 22334', area: 'Indirapuram, Noida', car: 'Hyundai Verna', service: 'Personal Chauffeur', status: 'Trial Scheduled' },
    ];

    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={[styles.portalHeader, { backgroundColor: C.adminPrimary }]}>
          <View>
            <Text style={styles.portalHeaderGreet}>Central Dispatch</Text>
            <Text style={styles.portalHeaderName}>Drivers Saathi Admin</Text>
            <Text style={styles.portalHeaderId}>Delhi NCR Operations</Text>
          </View>
          <TouchableOpacity style={styles.portalLogoutBtn} onPress={() => setPortal('landing')}>
            <Text style={styles.portalLogoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.portalTabBar}>
          {[
            { k: 'overview',   l: 'Overview' },
            { k: 'placements', l: 'Placements' },
            { k: 'leads',      l: 'Leads Funnel' },
            { k: 'standby',    l: 'Driver Pool' },
          ].map(t => (
            <TouchableOpacity key={t.k} onPress={() => setAdmTab(t.k)}
              style={[styles.portalTab, admTab === t.k && { borderBottomColor: C.adminAccent, borderBottomWidth: 3 }]}>
              <Text style={[styles.portalTabText, admTab === t.k && { color: C.adminAccent, fontWeight: '800' }]}>{t.l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* ── ADMIN: OVERVIEW & REVENUE ── */}
          {admTab === 'overview' && (
            <View>
              {/* Revenue Dashboard */}
              <View style={[styles.infoCard, { backgroundColor: C.brand }]}>
                <Text style={{ color: '#90CAF9', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 }}>SEPTEMBER 2026 REVENUE</Text>
                <Text style={{ color: C.white, fontSize: 32, fontWeight: '900', marginVertical: 6 }}>Rs. 22,500</Text>
                <Text style={{ color: '#BBDEFB', fontSize: 12 }}>Placement Fees (5 Confirmed Placements × Rs. 4,500)</Text>
                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 12 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#90CAF9', fontSize: 12 }}>Year-To-Date (2026):</Text>
                  <Text style={{ color: C.white, fontWeight: '800', fontSize: 12 }}>Rs. 2,16,000</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                  <Text style={{ color: '#90CAF9', fontSize: 12 }}>Lead Conversion Rate:</Text>
                  <Text style={{ color: C.accentGold, fontWeight: '800', fontSize: 12 }}>42% (5 placed of 12 inquiries)</Text>
                </View>
              </View>

              {/* Warranty Expiry Alerts */}
              <Text style={styles.sectionHeading}>Warranty Expiry Watch (Next 35 Days)</Text>
              {[
                { id: 'P-101', client: 'Mr. Rajesh Agarwal', driver: 'Rameshwar Dayal', daysLeft: 23, date: '04 Oct 2026' },
                { id: 'P-102', client: 'Dr. Sameer Kapoor', driver: 'Vikramaditya Singh', daysLeft: 31, date: '12 Oct 2026' },
              ].map(w => (
                <View key={w.id} style={[styles.infoCard, { borderLeftWidth: 4, borderLeftColor: C.amber }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontWeight: '800', color: C.text, fontSize: 14 }}>{w.client} ({w.id})</Text>
                    <Text style={{ color: C.amber, fontWeight: '800', fontSize: 12 }}>{w.daysLeft} Days Left</Text>
                  </View>
                  <Text style={{ color: C.textSub, fontSize: 12, marginTop: 4 }}>Assigned Driver: {w.driver} • Warranty Expiry: {w.date}</Text>
                  <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.amber, marginTop: 10 }]}
                    onPress={() => Alert.alert('Renewal Follow-Up', `Follow-up reminder sent to ${w.client} for annual contract renewal.`)}>
                    <Text style={styles.serviceCardBtnText}>Send Annual Retainer Renewal Reminder</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* KPI Grid */}
              <Text style={styles.sectionHeading}>Operational Metrics</Text>
              <View style={styles.kpiGrid}>
                {[
                  { label: 'Active Placements', value: '3', color: C.adminPrimary },
                  { label: 'Drivers on Duty', value: '2', color: C.driverPrimary },
                  { label: 'Pending Approvals', value: '1', color: C.amber },
                  { label: 'Inbound Driver Apps', value: inboundDriverApplicants.length.toString(), color: C.green },
                  { label: 'New Web Leads', value: '3', color: C.blue },
                  { label: 'Standby Drivers', value: '3', color: C.ownerPrimary },
                ].map((k, i) => (
                  <View key={i} style={styles.kpiCard}>
                    <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
                    <Text style={styles.kpiLabel}>{k.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── ADMIN: PLACEMENTS ── */}
          {admTab === 'placements' && (
            <View>
              <Text style={styles.sectionHeading}>Active Placement Records</Text>
              {adminPlacements.map(p => (
                <View key={p.id} style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Placement ID</Text>
                    <Text style={[styles.infoValue, { fontWeight: '800' }]}>{p.id}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Car Owner</Text>
                    <Text style={styles.infoValue}>{p.owner}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Car Model</Text>
                    <Text style={styles.infoValue}>{p.car}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Assigned Driver</Text>
                    <Text style={styles.infoValue}>{p.driver}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Warranty Expiry</Text>
                    <Text style={styles.infoValue}>{p.warrantyEnd}</Text>
                  </View>
                  <View style={[styles.logStatusBadge, { alignSelf: 'flex-start', marginTop: 8, backgroundColor: p.status === 'Active Duty' ? C.greenBg : C.amberBg }]}>
                    <Text style={[styles.logStatusText, { color: p.status === 'Active Duty' ? C.green : C.amber }]}>{p.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── ADMIN: LEADS & CONVERSION FUNNEL ── */}
          {admTab === 'leads' && (
            <View>
              {/* Lead Conversion Funnel */}
              <Text style={styles.sectionHeading}>Lead Conversion Funnel</Text>
              <View style={styles.infoCard}>
                {[
                  { step: '1. Website Calculator Inquiries', count: '12 Leads', color: C.blue },
                  { step: '2. Contacted by Phone / WhatsApp', count: '8 Contacted', color: C.amber },
                  { step: '3. 1-Day Trial Scheduled', count: '4 Trials', color: C.ownerPrimary },
                  { step: '4. Confirmed Placements', count: '3 Placed', color: C.green },
                ].map((fn, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: idx < 3 ? 1 : 0, borderBottomColor: C.divider }}>
                    <Text style={{ fontSize: 13, color: C.text, fontWeight: '600' }}>{fn.step}</Text>
                    <View style={[styles.logStatusBadge, { backgroundColor: fn.color + '20' }]}>
                      <Text style={[styles.logStatusText, { color: fn.color }]}>{fn.count}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionHeading}>Recent Inbound Customer Leads</Text>
              {leads.map(l => (
                <View key={l.id} style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Lead Ref</Text>
                    <Text style={[styles.infoValue, { fontWeight: '800' }]}>{l.id}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Client Name</Text>
                    <Text style={styles.infoValue}>{l.name}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone Number</Text>
                    <Text style={styles.infoValue}>{l.phone}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Area</Text>
                    <Text style={styles.infoValue}>{l.area}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Car & Service</Text>
                    <Text style={styles.infoValue}>{l.car} ({l.service})</Text>
                  </View>
                  <View style={styles.leadActionRow}>
                    <View style={[styles.logStatusBadge, { backgroundColor: l.status === 'New Lead' ? C.blueBg : l.status === 'Contacted' ? C.amberBg : C.greenBg }]}>
                      <Text style={[styles.logStatusText, { color: l.status === 'New Lead' ? C.blue : l.status === 'Contacted' ? C.amber : C.green }]}>{l.status}</Text>
                    </View>
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${l.phone}`)}>
                      <Text style={{ color: C.blue, fontWeight: '700', fontSize: 13 }}>Call Client</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── ADMIN: DRIVER PIPELINE & STANDBY POOL ── */}
          {admTab === 'standby' && (
            <View>
              {/* Inbound Driver Applications from App (Your Driver Pipeline!) */}
              <Text style={styles.sectionHeading}>Inbound Driver Applicants ({inboundDriverApplicants.length})</Text>
              <Text style={{ fontSize: 12, color: C.textSub, marginBottom: 10 }}>
                Drivers who registered themselves through the app. Call them to verify and schedule a trial:
              </Text>
              {inboundDriverApplicants.map(app => (
                <View key={app.id} style={[styles.infoCard, { borderLeftWidth: 4, borderLeftColor: C.driverPrimary }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: C.text }}>{app.name}</Text>
                    <View style={[styles.logStatusBadge, { backgroundColor: C.greenBg }]}>
                      <Text style={[styles.logStatusText, { color: C.green }]}>New Applicant</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: C.textSub, marginBottom: 2 }}>Phone: {app.phone} • Area: {app.area}</Text>
                  <Text style={{ fontSize: 12, color: C.textSub, marginBottom: 2 }}>Exp: {app.exp} • Transmission: {app.trans}</Text>
                  {app.dl && <Text style={{ fontSize: 11, color: C.textMuted }}>DL No: {app.dl}</Text>}
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <TouchableOpacity
                      style={[styles.serviceCardBtn, { flex: 1, backgroundColor: C.driverPrimary }]}
                      onPress={() => Linking.openURL(`tel:${app.phone}`)}
                    >
                      <Text style={styles.serviceCardBtnText}>Call Driver: {app.name.split(' ')[0]}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.serviceCardBtn, { flex: 1, backgroundColor: C.green }]}
                      onPress={() => {
                        const t = `नमस्ते ${app.name} जी, हम ड्राइवर्स साथी से बोल रहे हैं। हमें आपका प्राइवेट ड्राइवर का आवेदन प्राप्त हुआ है। क्या आप अभी बात कर सकते हैं?`;
                        Linking.openURL(`https://wa.me/${app.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(t)}`);
                      }}
                    >
                      <Text style={styles.serviceCardBtnText}>WhatsApp Chat</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Manual Onboarding Form */}
              <Text style={styles.sectionHeading}>Manual Driver Registration</Text>
              <View style={styles.infoCard}>
                <Text style={styles.fieldLabel}>Driver Full Name *</Text>
                <TextInput style={styles.fieldInput} placeholder="e.g. Surender Kumar"
                  value={newDrvName} onChangeText={setNewDrvName} />

                <Text style={styles.fieldLabel}>Mobile Number *</Text>
                <TextInput style={styles.fieldInput} placeholder="+91 98765 00000"
                  keyboardType="phone-pad" value={newDrvPhone} onChangeText={setNewDrvPhone} />

                <Text style={styles.fieldLabel}>Commercial DL Number</Text>
                <TextInput style={styles.fieldInput} placeholder="DL-0420180012345"
                  value={newDrvDL} onChangeText={setNewDrvDL} />

                <Text style={styles.fieldLabel}>Location & Area</Text>
                <TextInput style={styles.fieldInput} placeholder="South Delhi / Gurugram"
                  value={newDrvArea} onChangeText={setNewDrvArea} />

                <Text style={styles.fieldLabel}>Driving Experience</Text>
                <TextInput style={styles.fieldInput} placeholder="e.g. 10 Years (Manual + Auto)"
                  value={newDrvExp} onChangeText={setNewDrvExp} />

                <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.adminPrimary, marginTop: 14 }]} onPress={handleAddNewDriver}>
                  <Text style={styles.serviceCardBtnText}>Add Driver to Verification Pipeline</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionHeading}>Verified Standby Pool</Text>
              {CANDIDATES.map(d => (
                <View key={d.id} style={styles.driverCard}>
                  <View style={styles.driverCardTop}>
                    <Image source={d.photo} style={styles.driverAvatar} resizeMode="cover" />
                    <View style={styles.driverCardInfo}>
                      <Text style={styles.driverName}>{d.name}</Text>
                      <Text style={styles.driverBadge}>{d.badge}</Text>
                      <Text style={styles.driverExp}>{d.exp} • {d.location}</Text>
                      <Text style={styles.driverRating}>★ {d.rating} ({d.trips} placements)</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.adminPrimary, marginTop: 10 }]}
                    onPress={() => Alert.alert('Standby Assigned', `${d.name} assigned as emergency substitute. Owner notified.`)}>
                    <Text style={styles.serviceCardBtnText}>Assign as Emergency Substitute</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  // ─── Root Render Router ──────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {portal === 'landing'         && renderLanding()}
        {portal === 'customer'        && renderCustomer()}
        {portal === 'driver_register' && renderDriverRegister()}
        {portal === 'driver_login'    && renderDriverLogin()}
        {portal === 'driver_app'      && renderDriverApp()}
        {portal === 'owner_login'     && renderOwnerLogin()}
        {portal === 'owner_app'       && renderOwnerApp()}
        {portal === 'admin_login'     && renderAdminLogin()}
        {portal === 'admin_app'       && renderAdminApp()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Complete Stylesheet ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Customer Header
  custHeader: { backgroundColor: C.brandDark, paddingTop: Platform.OS === 'android' ? 36 : 12, paddingBottom: 12, paddingHorizontal: 16 },
  custHeaderInner: { flexDirection: 'row', alignItems: 'center' },
  custLogo: { width: 52, height: 52, borderRadius: 10 },
  custBrandName: { color: C.white, fontSize: 18, fontWeight: '900', letterSpacing: 1.5 },
  custBrandTagline: { color: '#90CAF9', fontSize: 11, marginTop: 1 },
  custPortalRow: { flexDirection: 'row', gap: 6, marginTop: 10, alignItems: 'center' },
  custHomeBackBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  custHomeBackText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
  custPortalBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  custPortalBtnText: { color: C.white, fontSize: 11, fontWeight: '700' },

  // Customer Tab Bar
  custTabBar: { backgroundColor: C.brand, flexDirection: 'row', paddingHorizontal: 4 },
  custTabItem: { paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  custTabItemActive: { borderBottomColor: C.accentGold },
  custTabText: { color: '#90CAF9', fontSize: 12, fontWeight: '600' },
  custTabTextActive: { color: C.white, fontWeight: '800' },

  // Hero Section
  heroSection: { position: 'relative', height: 300 },
  heroImage: { width: '100%', height: 300, position: 'absolute' },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(13,21,87,0.78)', justifyContent: 'flex-end', padding: 20, height: 300 },
  heroTagline: { color: C.accentGold, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  heroHeadline: { color: C.white, fontSize: 24, fontWeight: '900', lineHeight: 30, marginBottom: 8 },
  heroSub: { color: '#BBDEFB', fontSize: 13, lineHeight: 19, marginBottom: 16 },
  heroButtonRow: { flexDirection: 'row', gap: 10 },
  heroBtnPrimary: { backgroundColor: C.accent, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 8 },
  heroBtnPrimaryText: { color: C.white, fontWeight: '800', fontSize: 14 },
  heroBtnSecondary: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: C.white, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 8 },
  heroBtnSecondaryText: { color: C.white, fontWeight: '700', fontSize: 14 },

  // Trust Strip
  trustStrip: { flexDirection: 'row', backgroundColor: C.accent, paddingVertical: 14 },
  trustItem: { flex: 1, alignItems: 'center' },
  trustNum: { color: C.white, fontSize: 18, fontWeight: '900' },
  trustSub: { color: '#FFF3E0', fontSize: 10, fontWeight: '600', textAlign: 'center', marginTop: 2 },

  // Sections
  sectionBlock: { paddingHorizontal: 16, paddingVertical: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: C.text, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: C.textSub, marginBottom: 18, lineHeight: 18 },

  // Steps
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stepCard: { width: (SW - 44) / 2, backgroundColor: C.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.brand, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  stepNumText: { color: C.white, fontWeight: '900', fontSize: 14 },
  stepTitle: { fontSize: 13, fontWeight: '800', color: C.text, marginBottom: 4 },
  stepDesc: { fontSize: 11, color: C.textSub, lineHeight: 16 },

  // Area Grid
  areaGrid: { gap: 8 },
  areaPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  areaDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green, marginRight: 10 },
  areaPillText: { fontSize: 13, fontWeight: '600', color: C.text },

  // Testimonials
  testimonialCard: { backgroundColor: C.white, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  testimonialStars: { fontSize: 14, color: C.accentGold, fontWeight: '800', marginBottom: 6 },
  testimonialQuote: { fontSize: 13, color: C.text, lineHeight: 19, fontStyle: 'italic', marginBottom: 8 },
  testimonialName: { fontSize: 13, fontWeight: '800', color: C.text },
  testimonialLoc: { fontSize: 11, color: C.textSub },

  // Features
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  featureCard: { width: (SW - 44) / 2, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14 },
  featureIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  featureIconText: { color: C.white, fontWeight: '900', fontSize: 16 },
  featureTitle: { color: C.white, fontWeight: '800', fontSize: 13, marginBottom: 4 },
  featureDesc: { color: '#90CAF9', fontSize: 11, lineHeight: 16 },

  // Driver Recruitment Banners
  driverWebRecruitBanner: { marginHorizontal: 16, marginVertical: 8, backgroundColor: C.driverPrimary, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  driverWebRecruitTitle: { color: C.white, fontSize: 15, fontWeight: '800', marginBottom: 3 },
  driverWebRecruitDesc: { color: '#C8E6C9', fontSize: 11, lineHeight: 16 },
  driverWebRecruitBtn: { backgroundColor: C.accentGold, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  driverWebRecruitBtnText: { color: C.brandDark, fontWeight: '800', fontSize: 12 },

  // Driver Pitch Banner (in driver_register view)
  driverPitchBanner: { backgroundColor: C.driverPrimary, borderRadius: 16, padding: 20, marginBottom: 16 },
  driverPitchPre: { color: '#A5D6A7', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  driverPitchHeadline: { color: C.white, fontSize: 22, fontWeight: '900', marginVertical: 6 },
  driverPitchSub: { color: '#E8F5E9', fontSize: 12, marginBottom: 14 },
  driverBenefitsGrid: { gap: 6 },
  driverBenefitItem: { flexDirection: 'row', alignItems: 'center' },
  driverBenefitDot: { color: C.accentGold, fontWeight: '900', fontSize: 14, marginRight: 8 },
  driverBenefitText: { color: C.white, fontSize: 13, fontWeight: '600' },
  formCardHeader: { fontSize: 17, fontWeight: '800', color: C.text, marginBottom: 4 },
  pillActiveGreen: { backgroundColor: C.driverPrimary, borderColor: C.driverPrimary },

  // Driver Register Buttons
  driverSubmitBtn: { backgroundColor: C.driverPrimary, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 18 },
  driverSubmitBtnText: { color: C.white, fontWeight: '800', fontSize: 14 },
  driverWABtn: { backgroundColor: C.green, paddingVertical: 13, borderRadius: 8, alignItems: 'center' },
  driverWABtnText: { color: C.white, fontWeight: '800', fontSize: 13 },
  linkRegBtn: { backgroundColor: C.driverBg, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: C.driverAccent },
  linkRegBtnText: { color: C.driverPrimary, fontWeight: '700', fontSize: 12 },

  // CTA Block
  ctaBlock: { margin: 16, backgroundColor: C.accentLight, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#FFCC80' },
  ctaTitle: { fontSize: 18, fontWeight: '900', color: C.text, marginBottom: 4 },
  ctaSub: { fontSize: 13, color: C.textSub, marginBottom: 16 },
  ctaButtonRow: { flexDirection: 'row', gap: 10 },
  ctaBtnCall: { flex: 1, backgroundColor: C.accent, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  ctaBtnCallText: { color: C.white, fontWeight: '800', fontSize: 14 },
  ctaBtnWA: { flex: 1, backgroundColor: C.green, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  ctaBtnWAText: { color: C.white, fontWeight: '800', fontSize: 14 },

  // Tab Content
  tabContent: { padding: 16 },
  pageTitle: { fontSize: 22, fontWeight: '900', color: C.text, marginBottom: 4 },
  pageSub: { fontSize: 13, color: C.textSub, marginBottom: 20, lineHeight: 18 },

  // Service Cards
  serviceCard: { backgroundColor: C.white, borderRadius: 14, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  serviceCardImg: { width: '100%', height: 180 },
  serviceCardTag: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  serviceCardTagText: { color: C.white, fontSize: 11, fontWeight: '800' },
  serviceCardBody: { padding: 16 },
  serviceCardTitle: { fontSize: 17, fontWeight: '800', color: C.text, marginBottom: 4 },
  serviceCardPrice: { fontSize: 13, fontWeight: '700', color: C.accent, marginBottom: 8 },
  serviceCardDesc: { fontSize: 13, color: C.textSub, lineHeight: 19, marginBottom: 12 },
  serviceHighlights: { marginBottom: 14 },
  serviceHighlightRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent, marginRight: 8 },
  serviceHighlightText: { fontSize: 12, color: C.textSub },
  serviceCardBtn: { backgroundColor: C.brand, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  serviceCardBtnText: { color: C.white, fontWeight: '700', fontSize: 13 },

  // Calculator
  calcCard: { backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  calcLabel: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 8, marginTop: 14 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  pillActive: { backgroundColor: C.brand, borderColor: C.brand },
  pillText: { fontSize: 12, color: C.textSub, fontWeight: '600' },
  pillTextActive: { color: C.white, fontWeight: '800' },

  // Salary Result Card
  salaryResultCard: { backgroundColor: C.brand, borderRadius: 16, padding: 20, marginBottom: 12 },
  salaryResultLabel: { color: '#90CAF9', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  salaryResultAmount: { color: C.white, fontSize: 28, fontWeight: '900', marginVertical: 8 },
  salaryResultFor: { color: '#BBDEFB', fontSize: 12, marginBottom: 16 },
  salaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 14 },
  salaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  salaryRowLabel: { color: '#90CAF9', fontSize: 12 },
  salaryRowValue: { color: C.white, fontSize: 12, fontWeight: '700' },
  salaryHireBtn: { backgroundColor: C.accent, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  salaryHireBtnText: { color: C.white, fontWeight: '800', fontSize: 14 },
  calcNote: { backgroundColor: C.amberBg, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#FFCC80' },
  calcNoteText: { fontSize: 12, color: C.amber, lineHeight: 17 },

  // Driver Cards
  driverCard: { backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  driverCardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  driverAvatar: { width: 72, height: 72, borderRadius: 36, marginRight: 12 },
  driverCardInfo: { flex: 1 },
  driverNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  driverName: { fontSize: 16, fontWeight: '800', color: C.text, marginRight: 8 },
  verifiedBadge: { backgroundColor: C.greenBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  verifiedText: { fontSize: 10, color: C.green, fontWeight: '700' },
  driverBadge: { fontSize: 12, color: C.brand, fontWeight: '700', marginBottom: 2 },
  driverExp: { fontSize: 12, color: C.textSub, marginBottom: 2 },
  driverRatingRow: { flexDirection: 'row', alignItems: 'center' },
  driverRating: { fontSize: 13, color: C.amber, fontWeight: '800' },
  driverTrips: { fontSize: 12, color: C.textMuted },
  driverDivider: { height: 1, backgroundColor: C.divider, marginVertical: 12 },
  driverDetailGrid: { gap: 6 },
  driverDetailItem: { flexDirection: 'row', justifyContent: 'space-between' },
  driverDetailLabel: { fontSize: 12, color: C.textMuted, flex: 1 },
  driverDetailValue: { fontSize: 12, color: C.text, fontWeight: '600', flex: 2, textAlign: 'right' },
  driverCardBtn: { backgroundColor: C.brand, paddingVertical: 11, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  driverCardBtnText: { color: C.white, fontWeight: '700', fontSize: 13 },

  // Booking Form
  bookForm: { backgroundColor: C.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 6, marginTop: 14 },
  fieldInput: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text },
  bookSubmitBtn: { backgroundColor: C.accent, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  bookSubmitBtnText: { color: C.white, fontWeight: '800', fontSize: 15 },
  bookOrRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 8 },
  bookOrLine: { flex: 1, height: 1, backgroundColor: C.divider },
  bookOrText: { color: C.textMuted, fontSize: 12 },
  bookDirectRow: { flexDirection: 'row', gap: 10 },
  bookCallBtn: { flex: 1, backgroundColor: C.brand, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  bookCallBtnText: { color: C.white, fontWeight: '700', fontSize: 13 },
  bookWABtn: { flex: 1, backgroundColor: C.green, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  bookWABtnText: { color: C.white, fontWeight: '700', fontSize: 13 },

  // Contact & FAQ
  contactCard: { backgroundColor: C.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  contactCardTitle: { fontSize: 17, fontWeight: '800', color: C.text, marginBottom: 12 },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.divider },
  contactLabel: { fontSize: 13, color: C.textMuted, flex: 1 },
  contactValue: { fontSize: 13, color: C.text, fontWeight: '600', flex: 2, textAlign: 'right' },
  faqCard: { backgroundColor: C.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border },
  faqTitle: { fontSize: 17, fontWeight: '800', color: C.text, marginBottom: 16 },
  faqItem: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.divider },
  faqQ: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 5 },
  faqA: { fontSize: 12, color: C.textSub, lineHeight: 18 },

  // Confirmation Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: C.white, borderRadius: 20, padding: 28, width: '100%', maxWidth: 400, alignItems: 'center' },
  modalCheckCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.greenBg, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalCheck: { fontSize: 28, color: C.green },
  modalTitle: { fontSize: 20, fontWeight: '900', color: C.text, marginBottom: 12 },
  modalMsg: { fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 21, marginBottom: 20 },
  modalBtn: { backgroundColor: C.brand, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 },
  modalBtnText: { color: C.white, fontWeight: '700', fontSize: 15 },

  // Portal Header
  portalHeader: { paddingTop: Platform.OS === 'android' ? 36 : 12, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  portalHeaderGreet: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  portalHeaderName: { color: C.white, fontSize: 18, fontWeight: '900' },
  portalHeaderId: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
  portalLogoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 6 },
  portalLogoutText: { color: C.white, fontSize: 12, fontWeight: '700' },

  // Portal Tab Bar
  portalTabBar: { flexDirection: 'row', backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border, paddingHorizontal: 4 },
  portalTab: { paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  portalTabText: { fontSize: 12, color: C.textSub, fontWeight: '600' },

  // Info Card
  infoCard: { backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  infoCardTitle: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: C.divider },
  infoLabel: { fontSize: 12, color: C.textMuted, flex: 1 },
  infoValue: { fontSize: 13, color: C.text, fontWeight: '600', flex: 2, textAlign: 'right' },

  // Status Banner
  statusBanner: { borderRadius: 14, padding: 16, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBannerTitle: { color: C.white, fontSize: 15, fontWeight: '800' },
  statusBannerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  onDutyPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  onDutyPillText: { color: C.white, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },

  // Emergency SOS Card
  sosCard: { backgroundColor: C.red, borderRadius: 14, padding: 16, marginTop: 14 },
  sosTitle: { color: C.white, fontSize: 16, fontWeight: '900', marginBottom: 4 },
  sosSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 17, marginBottom: 12 },
  sosBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: C.white, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  sosBtnText: { color: C.white, fontWeight: '800', fontSize: 13 },

  // Actions
  sectionHeading: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 10, marginTop: 4 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  actionBtn: { flex: 1, minWidth: (SW - 52) / 2, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { color: C.white, fontWeight: '700', fontSize: 13 },
  formRowGroup: { flexDirection: 'row', marginBottom: 8 },

  // Log Rows & Leaves
  logRow: { backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center' },
  logDate: { fontSize: 13, fontWeight: '700', color: C.text },
  logMeta: { fontSize: 12, color: C.textSub, marginTop: 2 },
  logKm: { fontSize: 12, color: C.textMuted, marginTop: 1 },
  leaveRow: { backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center' },
  leaveDate: { fontSize: 13, fontWeight: '700', color: C.text },
  leaveReason: { fontSize: 12, color: C.textSub, marginTop: 2 },
  leaveSub: { fontSize: 11, color: C.textMuted, marginTop: 2, fontStyle: 'italic' },
  logStatusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: C.greenBg },
  logStatusText: { fontSize: 11, fontWeight: '700', color: C.green },

  // Documents & Compliance
  docCard: { backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center' },
  docTitle: { fontSize: 13, fontWeight: '700', color: C.text },
  docNum: { fontSize: 11, color: C.textSub, marginTop: 2 },
  complianceCard: { backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center' },
  complianceTitle: { fontSize: 13, fontWeight: '700', color: C.text },
  complianceExpiry: { fontSize: 11, color: C.textSub, marginTop: 2 },
  complianceDays: { fontSize: 11, fontWeight: '700', marginTop: 2 },

  // Login
  loginPortalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'android' ? 36 : 16, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  loginBackBtn: { fontSize: 14, fontWeight: '700', color: C.brand },
  loginPortalTitle: { fontSize: 16, fontWeight: '800', color: C.text },
  loginScroll: { padding: 20, paddingTop: 30 },
  loginCard: { backgroundColor: C.white, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  loginIcon: { width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  loginIconText: { color: C.white, fontSize: 26, fontWeight: '900' },
  loginTitle: { fontSize: 22, fontWeight: '900', color: C.text, textAlign: 'center', marginBottom: 6 },
  loginSub: { fontSize: 13, color: C.textSub, textAlign: 'center', lineHeight: 19, marginBottom: 20 },
  loginBtn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  loginBtnText: { color: C.white, fontWeight: '800', fontSize: 15 },
  loginDemoBtn: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingVertical: 11, alignItems: 'center', marginTop: 10 },
  loginDemoBtnText: { fontSize: 12, color: C.textSub, fontWeight: '600' },
  loginHelpText: { fontSize: 11, color: C.textMuted, textAlign: 'center', marginTop: 14 },

  // Admin KPI Grid & Leads
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  kpiCard: { flex: 1, minWidth: (SW - 52) / 2, backgroundColor: C.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  kpiValue: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  kpiLabel: { fontSize: 11, color: C.textSub, fontWeight: '600', textAlign: 'center' },
  leadActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },

  // Landing / Role Selection Screen
  landingHeader: { backgroundColor: C.brandDark, paddingTop: Platform.OS === 'android' ? 48 : 24, paddingBottom: 24, paddingHorizontal: 20, alignItems: 'center' },
  landingLogo: { width: 80, height: 80, borderRadius: 16, marginBottom: 12 },
  landingBrand: { color: C.white, fontSize: 24, fontWeight: '900', letterSpacing: 2, textAlign: 'center' },
  landingTagline: { color: '#90CAF9', fontSize: 13, marginTop: 4, textAlign: 'center' },
  landingTrustRow: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  landingTrustPill: { backgroundColor: 'rgba(255,255,255,0.12)', color: C.white, fontSize: 11, fontWeight: '700', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, overflow: 'hidden' },
  landingScroll: { padding: 20, paddingTop: 24, paddingBottom: 40, backgroundColor: '#F0F2FA' },
  landingPrompt: { fontSize: 26, fontWeight: '900', color: C.text, textAlign: 'center' },
  landingPromptSub: { fontSize: 14, color: C.textSub, textAlign: 'center', marginTop: 4, marginBottom: 20 },

  // Role Selection Cards
  roleCard: {
    borderRadius: 18, padding: 20, marginBottom: 14,
    flexDirection: 'row', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.15,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  roleCardWrapper: {
    borderRadius: 18, padding: 20, marginBottom: 14,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.15,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  roleCardIconBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  roleCardEmoji: { fontSize: 26 },
  roleCardText: { flex: 1 },
  roleCardTitle: { fontSize: 17, fontWeight: '900', color: C.white, marginBottom: 4 },
  roleCardDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 17, marginBottom: 6 },
  roleCardChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  roleCardChip: { backgroundColor: 'rgba(255,255,255,0.2)', color: C.white, fontSize: 10, fontWeight: '700', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, overflow: 'hidden' },
  roleCardArrow: { color: 'rgba(255,255,255,0.7)', fontSize: 22, fontWeight: '900', marginLeft: 10 },

  // Landing Driver Sub-buttons
  driverCardRegBtn: { flex: 1.2, backgroundColor: C.accentGold, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  driverCardRegBtnText: { color: C.brandDark, fontWeight: '800', fontSize: 12 },
  driverCardLoginBtn: { flex: 0.9, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: C.white, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  driverCardLoginBtnText: { color: C.white, fontWeight: '700', fontSize: 12 },

  adminLink: { alignSelf: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  adminLinkText: { color: C.textMuted, fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },
  landingFooter: { alignItems: 'center', marginTop: 20 },
  landingFooterText: { color: C.textMuted, fontSize: 12, marginTop: 3 },
});
