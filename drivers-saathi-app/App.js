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

// ─── Design System ──────────────────────────────────────────────────────────
const C = {
  // Brand
  brand:       '#1A237E',   // Deep navy — primary brand
  brandDark:   '#0D1557',   // Darker navy for headers
  brandLight:  '#3949AB',   // Lighter brand blue
  accent:      '#FF6F00',   // Amber / orange — action color
  accentLight: '#FFF3E0',   // Amber tint background
  accentGold:  '#FFB300',   // Gold highlight

  // Driver portal
  driverPrimary: '#1B5E20', // Deep green
  driverAccent:  '#43A047', // Green action
  driverBg:      '#E8F5E9', // Green tint bg

  // Owner portal
  ownerPrimary:  '#4A148C', // Deep purple
  ownerAccent:   '#7B1FA2', // Purple action
  ownerBg:       '#F3E5F5', // Purple tint bg

  // Admin portal
  adminPrimary:  '#B71C1C', // Deep red
  adminAccent:   '#E53935', // Red action
  adminBg:       '#FFEBEE', // Red tint bg

  // Neutrals
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

// ─── Candidate Data ──────────────────────────────────────────────────────────
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

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [portal, setPortal] = useState('customer');
  // 'customer' | 'driver_login' | 'driver_app' | 'owner_login' | 'owner_app' | 'admin_login' | 'admin_app'

  // Customer tabs
  const [custTab, setCustTab] = useState('home');

  // Calculator
  const [calcCity,  setCalcCity]  = useState('South Delhi');
  const [calcHours, setCalcHours] = useState('10 Hours');
  const [calcTrans, setCalcTrans] = useState('Automatic');

  // Booking form
  const [form, setForm] = useState({ name: '', phone: '', car: '', location: '', service: 'Personal Chauffeur', trans: 'Automatic' });
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({ visible: false, msg: '' });

  // Driver portal
  const [drvId, setDrvId] = useState('');
  const [drvPass, setDrvPass] = useState('');
  const [drvTab, setDrvTab] = useState('today');
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
  const [leaves, setLeaves] = useState([
    { id: 'lr1', date: '19 Sep 2026', reason: 'Family medical visit', status: 'Approved', sub: 'Vikramaditya S.' },
  ]);
  const [lvDate, setLvDate]     = useState('2026-09-24');
  const [lvReason, setLvReason] = useState('');

  // Owner portal
  const [ownId, setOwnId]   = useState('');
  const [ownPass, setOwnPass] = useState('');
  const [ownTab, setOwnTab]  = useState('driver');

  // Admin portal
  const [admId, setAdmId]   = useState('');
  const [admPass, setAdmPass] = useState('');
  const [admTab, setAdmTab]  = useState('overview');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@ds_logs_v3');
        if (saved) setDutyLogs(JSON.parse(saved));
        const savedLeaves = await AsyncStorage.getItem('@ds_leaves_v3');
        if (savedLeaves) setLeaves(JSON.parse(savedLeaves));
      } catch (_) {}
    })();
  }, []);

  // ── Helpers ──
  const call   = () => Linking.openURL('tel:+918175087004');
  const whatsapp = (msg = '') => {
    const t = msg || 'Hello Drivers Saathi, I need a verified driver in Delhi NCR.';
    Linking.openURL(`https://wa.me/918175087004?text=${encodeURIComponent(t)}`);
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
    setSuccessModal({ visible: true, msg: `Thank you, ${form.name}!\n\nYour request (Ref #${ref}) has been received. Our account manager will call you within 4 hours.\n\nHelpline: +91 8175087004` });
    setForm({ name: '', phone: '', car: '', location: '', service: 'Personal Chauffeur', trans: 'Automatic' });
    setLoading(false);
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
    await AsyncStorage.setItem('@ds_logs_v3', JSON.stringify(updated));
    setLogPhoto(null);
    Alert.alert('Duty Logged', `Record for ${logDate} submitted to owner.`);
  };

  const submitLeave = async () => {
    if (!lvReason.trim()) { Alert.alert('Reason Required', 'Please state your reason for leave.'); return; }
    const entry = { id: Date.now().toString(), date: lvDate, reason: lvReason, status: 'Pending', sub: 'Pending Assignment' };
    const updated = [entry, ...leaves];
    setLeaves(updated);
    await AsyncStorage.setItem('@ds_leaves_v3', JSON.stringify(updated));
    setLvReason('');
    Alert.alert('Leave Submitted', 'Leave request sent to owner. Dispatch desk notified for backup coverage.');
  };

  const approveLog = async (id) => {
    const updated = dutyLogs.map(l => l.id === id ? { ...l, approved: true } : l);
    setDutyLogs(updated);
    await AsyncStorage.setItem('@ds_logs_v3', JSON.stringify(updated));
    Alert.alert('Approved', 'Overtime hours approved for this duty day.');
  };

  const salCalc = salary();

  // ============================================================
  // CUSTOMER PORTAL
  // ============================================================
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
        {/* Portal Access Buttons */}
        <View style={styles.custPortalRow}>
          <TouchableOpacity style={[styles.custPortalBtn, { backgroundColor: '#1B5E20' }]}
            onPress={() => { setDrvId('DRV-101'); setDrvPass('1234'); setPortal('driver_login'); }}>
            <Text style={styles.custPortalBtnText}>Driver Login</Text>
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

      {/* Tab Bar */}
      <View style={styles.custTabBar}>
        {[
          { key: 'home', label: 'Home' },
          { key: 'services', label: 'Services' },
          { key: 'calculator', label: 'Salary Tool' },
          { key: 'drivers', label: 'Our Drivers' },
          { key: 'book', label: 'Hire Now' },
          { key: 'contact', label: 'Contact' },
        ].map(t => (
          <TouchableOpacity key={t.key} onPress={() => setCustTab(t.key)}
            style={[styles.custTabItem, custTab === t.key && styles.custTabItemActive]}>
            <Text style={[styles.custTabText, custTab === t.key && styles.custTabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* HOME TAB */}
        {custTab === 'home' && (
          <View>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Image source={require('./assets/fleet_cabs_delhi.jpg')} style={styles.heroImage} resizeMode="cover" />
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTagline}>Delhi NCR's #1 Verified Chauffeur Service</Text>
                <Text style={styles.heroHeadline}>Professional Drivers for Your Private Car</Text>
                <Text style={styles.heroSub}>Police-cleared, background-verified drivers for daily commute, outstation trips & corporate fleets</Text>
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
                  { n: '1', title: 'Submit Requirement', desc: 'Tell us your car, area, and preferred duty hours' },
                  { n: '2', title: 'We Shortlist', desc: 'We match 3 verified candidates based on your requirements' },
                  { n: '3', title: 'Trial & Selection', desc: 'Run a 1-day unpaid trial before confirming placement' },
                  { n: '4', title: 'Driver Placed', desc: 'Placement confirmed with agreement & 30-day warranty' },
                ].map((s, i) => (
                  <View key={i} style={styles.stepCard}>
                    <View style={styles.stepNum}><Text style={styles.stepNumText}>{s.n}</Text></View>
                    <Text style={styles.stepTitle}>{s.title}</Text>
                    <Text style={styles.stepDesc}>{s.desc}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Why Choose Us */}
            <View style={[styles.sectionBlock, { backgroundColor: C.brand }]}>
              <Text style={[styles.sectionTitle, { color: C.white }]}>Why Drivers Saathi?</Text>
              <View style={styles.featureGrid}>
                {[
                  { icon: 'Shield', title: 'Police Verified', desc: 'Every driver has valid police clearance certificate from local station' },
                  { icon: 'Check', title: 'Background Check', desc: 'Aadhaar, DL verification, previous employer reference checks done' },
                  { icon: 'Clock', title: 'Punctuality Track', desc: 'Regular monitoring of duty hours and timely reporting' },
                  { icon: 'Phone', title: '24x7 Support', desc: 'Our dispatch desk is always reachable for any urgent requirement' },
                  { icon: 'Doc', title: 'Written Agreement', desc: 'Formal placement agreement protecting both owner and driver' },
                  { icon: 'Star', title: 'Replacement Guarantee', desc: '30-day free replacement if driver does not meet expectations' },
                ].map((f, i) => (
                  <View key={i} style={styles.featureCard}>
                    <View style={styles.featureIcon}><Text style={styles.featureIconText}>{f.icon[0]}</Text></View>
                    <Text style={styles.featureTitle}>{f.title}</Text>
                    <Text style={styles.featureDesc}>{f.desc}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Quick CTA */}
            <View style={styles.ctaBlock}>
              <Text style={styles.ctaTitle}>Need a Driver Today?</Text>
              <Text style={styles.ctaSub}>Call or WhatsApp our dispatch desk directly</Text>
              <View style={styles.ctaButtonRow}>
                <TouchableOpacity style={styles.ctaBtnCall} onPress={call}>
                  <Text style={styles.ctaBtnCallText}>Call Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ctaBtnWA} onPress={() => whatsapp()}>
                  <Text style={styles.ctaBtnWAText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* SERVICES TAB */}
        {custTab === 'services' && (
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>Our Services</Text>
            <Text style={styles.pageSub}>Specialized driver solutions for every requirement in Delhi NCR</Text>

            {[
              {
                img: require('./assets/indian_driver_portrait.jpg'),
                tag: 'Most Popular',
                tagColor: C.accent,
                title: 'Personal Chauffeur Placement',
                price: 'One-time Fee: Rs. 4,500',
                desc: 'A dedicated full-time driver placed at your home for daily office runs, school drops, and personal errands. Salary is paid directly to driver by you every month.',
                highlights: ['30-day free replacement warranty', 'Police clearance certificate provided', 'Route familiarization included'],
                cta: 'Request Chauffeur',
                ctaFn: () => setCustTab('book'),
              },
              {
                img: require('./assets/driver_passenger_service.jpg'),
                tag: 'Outstation',
                tagColor: C.blue,
                title: 'Highway & Outstation Driver',
                price: 'From Rs. 1,500 per day',
                desc: 'Experienced highway drivers for Agra, Jaipur, Chandigarh, Uttarakhand, and all Yamuna Expressway routes. Night driving, FASTag and toll management included.',
                highlights: ['Available within 4 hours notice', 'Experienced in expressway driving', 'Night driving certified'],
                cta: 'Book for Trip',
                ctaFn: () => setCustTab('book'),
              },
              {
                img: require('./assets/fleet_cabs_delhi.jpg'),
                tag: 'Corporate',
                tagColor: C.brand,
                title: 'Corporate Fleet Retainer',
                price: 'B2B Contract — Negotiable',
                desc: 'Ongoing driver supply for corporate travel desks, company fleets, and logistics. Dedicated backup pool ensures zero downtime. GST invoice provided.',
                highlights: ['Dedicated account manager', 'Monthly billing with GST invoice', 'Emergency backup coverage'],
                cta: 'Contact Fleet Desk',
                ctaFn: call,
              },
              {
                img: require('./assets/driver_passenger_service.jpg'),
                tag: 'Live-in',
                tagColor: C.green,
                title: 'Live-in Driver with Accommodation',
                price: 'Placement Fee: Rs. 5,500',
                desc: 'Full-time residential driver who stays at your premises. Ideal for large bungalows, farmhouses, or families requiring round-the-clock availability.',
                highlights: ['24x7 availability', 'Background-verified only', 'Agreement includes accommodation terms'],
                cta: 'Enquire Now',
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

        {/* CALCULATOR TAB */}
        {custTab === 'calculator' && (
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>Salary Benchmark Calculator</Text>
            <Text style={styles.pageSub}>Find out the correct market salary for a driver in your area based on hours and vehicle type</Text>

            <View style={styles.calcCard}>
              <Text style={styles.calcLabel}>Select Your Area</Text>
              <View style={styles.pillRow}>
                {['South Delhi', 'Gurugram', 'Noida', 'Central / West Delhi'].map(c => (
                  <TouchableOpacity key={c} onPress={() => setCalcCity(c)}
                    style={[styles.pill, calcCity === c && styles.pillActive]}>
                    <Text style={[styles.pillText, calcCity === c && styles.pillTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.calcLabel}>Daily Duty Hours</Text>
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

            {/* Result Card */}
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
                <Text style={styles.salaryRowValue}>15 days (both sides)</Text>
              </View>

              <TouchableOpacity style={styles.salaryHireBtn}
                onPress={() => { setForm({ ...form, location: calcCity, trans: calcTrans }); setCustTab('book'); }}>
                <Text style={styles.salaryHireBtnText}>Hire Driver at This Rate</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calcNote}>
              <Text style={styles.calcNoteText}>Note: These are market benchmark figures for Delhi NCR as of 2026. Actual salary is agreed directly between the driver and car owner.</Text>
            </View>
          </View>
        )}

        {/* DRIVERS TAB */}
        {custTab === 'drivers' && (
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>Our Verified Chauffeurs</Text>
            <Text style={styles.pageSub}>All drivers are background-checked, police-verified, and skill-assessed before listing</Text>

            {CANDIDATES.map(d => (
              <View key={d.id} style={styles.driverCard}>
                <View style={styles.driverCardTop}>
                  <Image source={d.photo} style={styles.driverAvatar} resizeMode="cover" />
                  <View style={styles.driverCardInfo}>
                    <View style={styles.driverNameRow}>
                      <Text style={styles.driverName}>{d.name}</Text>
                      {d.verified && <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>Verified</Text></View>}
                    </View>
                    <Text style={styles.driverBadge}>{d.badge}</Text>
                    <Text style={styles.driverExp}>{d.exp} experience</Text>
                    <View style={styles.driverRatingRow}>
                      <Text style={styles.driverRating}>★ {d.rating}</Text>
                      <Text style={styles.driverTrips}> ({d.trips} assignments)</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.driverDivider} />
                <View style={styles.driverDetailGrid}>
                  <View style={styles.driverDetailItem}>
                    <Text style={styles.driverDetailLabel}>Skills</Text>
                    <Text style={styles.driverDetailValue}>{d.skills}</Text>
                  </View>
                  <View style={styles.driverDetailItem}>
                    <Text style={styles.driverDetailLabel}>Location</Text>
                    <Text style={styles.driverDetailValue}>{d.location}</Text>
                  </View>
                  <View style={styles.driverDetailItem}>
                    <Text style={styles.driverDetailLabel}>Languages</Text>
                    <Text style={styles.driverDetailValue}>{d.languages}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.driverCardBtn}
                  onPress={() => setCustTab('book')}>
                  <Text style={styles.driverCardBtnText}>Schedule Trial with {d.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* BOOK TAB */}
        {custTab === 'book' && (
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>Request a Chauffeur</Text>
            <Text style={styles.pageSub}>Fill the form below. Our team will share verified candidate profiles within 4 hours.</Text>

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
                {loading ? <ActivityIndicator color={C.white} /> : <Text style={styles.bookSubmitBtnText}>Submit Request</Text>}
              </TouchableOpacity>

              <View style={styles.bookOrRow}>
                <View style={styles.bookOrLine} /><Text style={styles.bookOrText}>or contact directly</Text><View style={styles.bookOrLine} />
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

        {/* CONTACT TAB */}
        {custTab === 'contact' && (
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>Contact & Support</Text>
            <Text style={styles.pageSub}>We are available Monday to Saturday, 9 AM to 8 PM. Emergency support on WhatsApp 24x7.</Text>

            <View style={styles.contactCard}>
              <Text style={styles.contactCardTitle}>Delhi NCR Dispatch Desk</Text>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>+91 8175087004</Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>WhatsApp</Text>
                <Text style={styles.contactValue}>+91 8175087004</Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>support@driverssaathi.com</Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Hours</Text>
                <Text style={styles.contactValue}>Mon–Sat, 9 AM – 8 PM</Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Coverage</Text>
                <Text style={styles.contactValue}>All areas of Delhi NCR, Gurugram, Noida, Faridabad</Text>
              </View>
              <TouchableOpacity style={[styles.serviceCardBtn, { marginTop: 16 }]} onPress={call}>
                <Text style={styles.serviceCardBtnText}>Call the Dispatch Desk</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.serviceCardBtn, { marginTop: 10, backgroundColor: C.green }]} onPress={() => whatsapp()}>
                <Text style={styles.serviceCardBtnText}>Send WhatsApp Message</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.faqCard}>
              <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
              {[
                { q: 'How long does driver placement take?', a: 'We typically present 2–3 shortlisted profiles within 24 hours. After your trial, placement is confirmed in 48 hours.' },
                { q: 'What if the driver is not suitable?', a: 'We offer a 30-day free replacement guarantee. Just call our dispatch desk and a new candidate will be arranged at no extra cost.' },
                { q: 'Who pays the driver salary?', a: 'The driver salary is paid directly by you (the car owner) every month. We only charge a one-time placement fee.' },
                { q: 'Do you provide a formal agreement?', a: 'Yes. A signed placement agreement is provided to both the driver and owner, covering duties, salary, notice period, and replacement terms.' },
                { q: 'Is there a background check on drivers?', a: 'Every driver has a police clearance certificate, Aadhaar verification, and driving licence (commercial) verification done before listing.' },
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

      {/* Success Modal */}
      <Modal visible={successModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalCheckCircle}><Text style={styles.modalCheck}>✓</Text></View>
            <Text style={styles.modalTitle}>Request Received!</Text>
            <Text style={styles.modalMsg}>{successModal.msg}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setSuccessModal({ visible: false, msg: '' })}>
              <Text style={styles.modalBtnText}>OK, Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  // ============================================================
  // DRIVER LOGIN
  // ============================================================
  const renderDriverLogin = () => (
    <View style={{ flex: 1, backgroundColor: C.driverBg }}>
      <View style={styles.loginPortalHeader}>
        <TouchableOpacity onPress={() => setPortal('customer')}>
          <Text style={styles.loginBackBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.loginPortalTitle}>Driver Portal</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.loginScroll}>
        <View style={styles.loginCard}>
          <View style={[styles.loginIcon, { backgroundColor: C.driverPrimary }]}>
            <Text style={styles.loginIconText}>D</Text>
          </View>
          <Text style={styles.loginTitle}>Driver Sign In</Text>
          <Text style={styles.loginSub}>Enter your Driver ID and password provided by the Drivers Saathi dispatch desk</Text>

          <Text style={styles.fieldLabel}>Driver ID</Text>
          <TextInput style={styles.fieldInput} placeholder="e.g. DRV-101" autoCapitalize="characters"
            value={drvId} onChangeText={setDrvId} />

          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput style={styles.fieldInput} placeholder="Enter password" secureTextEntry
            value={drvPass} onChangeText={setDrvPass} />

          <TouchableOpacity style={[styles.loginBtn, { backgroundColor: C.driverPrimary }]} onPress={loginDriver}>
            <Text style={styles.loginBtnText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginDemoBtn}
            onPress={() => { setDrvId('DRV-101'); setDrvPass('1234'); setPortal('driver_app'); }}>
            <Text style={styles.loginDemoBtnText}>Demo Login: DRV-101 / 1234</Text>
          </TouchableOpacity>

          <Text style={styles.loginHelpText}>Forgot your credentials? Contact the dispatch desk: +91 8175087004</Text>
        </View>
      </ScrollView>
    </View>
  );

  // ============================================================
  // DRIVER APP
  // ============================================================
  const renderDriverApp = () => (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Driver Header */}
      <View style={[styles.portalHeader, { backgroundColor: C.driverPrimary }]}>
        <View>
          <Text style={styles.portalHeaderGreet}>Good Morning,</Text>
          <Text style={styles.portalHeaderName}>Rameshwar Dayal</Text>
          <Text style={styles.portalHeaderId}>ID: DRV-101  •  Verified Chauffeur</Text>
        </View>
        <TouchableOpacity style={styles.portalLogoutBtn} onPress={() => setPortal('customer')}>
          <Text style={styles.portalLogoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Driver Tabs */}
      <View style={styles.portalTabBar}>
        {[
          { k: 'today',   l: 'Today' },
          { k: 'logbook', l: 'Logbook' },
          { k: 'leave',   l: 'Leave' },
          { k: 'docs',    l: 'Documents' },
          { k: 'salary',  l: 'Salary' },
        ].map(t => (
          <TouchableOpacity key={t.k} onPress={() => setDrvTab(t.k)}
            style={[styles.portalTab, drvTab === t.k && { borderBottomColor: C.driverAccent, borderBottomWidth: 2 }]}>
            <Text style={[styles.portalTabText, drvTab === t.k && { color: C.driverAccent, fontWeight: '700' }]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* TODAY DUTY */}
        {drvTab === 'today' && (
          <View>
            {/* Status Banner */}
            <View style={[styles.statusBanner, { backgroundColor: C.driverPrimary }]}>
              <View>
                <Text style={styles.statusBannerTitle}>Active Assignment</Text>
                <Text style={styles.statusBannerSub}>Thursday, 11 September 2026</Text>
              </View>
              <View style={styles.onDutyPill}>
                <Text style={styles.onDutyPillText}>ON DUTY</Text>
              </View>
            </View>

            {/* Assignment Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Today's Duty Details</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Client</Text>
                <Text style={styles.infoValue}>Mr. Rajesh Agarwal</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vehicle</Text>
                <Text style={styles.infoValue}>Hyundai Creta 2023 (DL 3C XX 1234)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Transmission</Text>
                <Text style={styles.infoValue}>Automatic</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Duty Hours</Text>
                <Text style={styles.infoValue}>08:30 AM – 06:30 PM (10 Hrs)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pickup Location</Text>
                <Text style={styles.infoValue}>Villa 14, Poorvi Marg, Vasant Vihar, South Delhi</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Monthly Salary</Text>
                <Text style={[styles.infoValue, { color: C.green, fontWeight: '700' }]}>Rs. 22,000 per month</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Overtime Rate</Text>
                <Text style={styles.infoValue}>Rs. 80 per hour</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionHeading}>Quick Actions</Text>
            <View style={styles.actionGrid}>
              {[
                { label: 'Record Check-In', color: C.driverPrimary, fn: () => Alert.alert('Check-In Recorded', 'Check-in logged at 08:30 AM today.') },
                { label: 'Record Check-Out', color: C.driverAccent, fn: () => Alert.alert('Check-Out Recorded', 'Check-out logged. Submit odometer reading in Logbook.') },
                { label: 'Call Owner', color: C.blue, fn: () => Linking.openURL('tel:+919811023456') },
                { label: 'Contact Dispatch', color: C.amber, fn: call },
              ].map((a, i) => (
                <TouchableOpacity key={i} onPress={a.fn}
                  style={[styles.actionBtn, { backgroundColor: a.color }]}>
                  <Text style={styles.actionBtnText}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* LOGBOOK */}
        {drvTab === 'logbook' && (
          <View>
            <Text style={styles.sectionHeading}>Add Duty Record</Text>
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

            <Text style={styles.sectionHeading}>Duty History</Text>
            {dutyLogs.map(log => (
              <View key={log.id} style={styles.logRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logDate}>{log.date}</Text>
                  <Text style={styles.logMeta}>{log.inTime} – {log.outTime} | OT: {log.ot}</Text>
                  <Text style={styles.logKm}>{log.startKm} → {log.endKm} km</Text>
                </View>
                <View style={[styles.logStatusBadge, { backgroundColor: log.approved ? C.greenBg : C.amberBg }]}>
                  <Text style={[styles.logStatusText, { color: log.approved ? C.green : C.amber }]}>
                    {log.approved ? 'Approved' : 'Pending'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* LEAVE */}
        {drvTab === 'leave' && (
          <View>
            <Text style={styles.sectionHeading}>Request Leave</Text>
            <View style={styles.infoCard}>
              <Text style={styles.fieldLabel}>Leave Date</Text>
              <TextInput style={styles.fieldInput} value={lvDate} onChangeText={setLvDate} placeholder="YYYY-MM-DD" />
              <Text style={styles.fieldLabel}>Reason for Leave</Text>
              <TextInput style={[styles.fieldInput, { height: 80, textAlignVertical: 'top' }]}
                multiline value={lvReason} onChangeText={setLvReason}
                placeholder="e.g. Family medical visit, personal emergency" />
              <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.driverPrimary }]} onPress={submitLeave}>
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
                    <Text style={styles.leaveSub}>Substitute: {l.sub}</Text>
                  )}
                </View>
                <View style={[styles.logStatusBadge, {
                  backgroundColor: l.status === 'Approved' ? C.greenBg : l.status === 'Rejected' ? C.redBg : C.amberBg
                }]}>
                  <Text style={[styles.logStatusText, {
                    color: l.status === 'Approved' ? C.green : l.status === 'Rejected' ? C.red : C.amber
                  }]}>{l.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* DOCUMENTS */}
        {drvTab === 'docs' && (
          <View>
            <Text style={styles.sectionHeading}>Verified Documents</Text>
            {[
              { title: 'Aadhaar Card', num: 'XXXX XXXX 7821', status: 'Verified', color: C.green },
              { title: 'Driving Licence (Commercial)', num: 'DL-0420110012345', status: 'Active', color: C.green },
              { title: 'Police Clearance Certificate', num: 'PC/DL/2024/8871', status: 'Verified', color: C.green },
              { title: 'Medical Fitness Certificate', num: 'MFC-2025-114', status: 'Valid till Mar 2027', color: C.blue },
              { title: 'PASSPORTPHOTO', num: 'On File', status: 'On File', color: C.brand },
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

        {/* SALARY */}
        {drvTab === 'salary' && (
          <View>
            <Text style={styles.sectionHeading}>Monthly Payroll</Text>
            <View style={[styles.infoCard, { backgroundColor: C.driverPrimary }]}>
              <Text style={[styles.infoCardTitle, { color: C.white }]}>September 2026</Text>
              <Text style={{ color: C.white, fontSize: 32, fontWeight: '800', marginVertical: 8 }}>Rs. 23,560</Text>
              <Text style={{ color: '#A5D6A7', fontSize: 13 }}>Net Pay (estimated)</Text>
            </View>
            <View style={styles.infoCard}>
              {[
                { label: 'Basic Salary (10 Hrs)', value: 'Rs. 22,000' },
                { label: 'Overtime (18.5 hrs @ Rs. 80)', value: 'Rs. 1,480' },
                { label: 'Sunday Allowance (3 days)', value: 'Rs. 600' },
                { label: 'Festival Bonus (Ganesh Chaturthi)', value: 'Rs. 500' },
                { label: 'Advance Deduction', value: '- Rs. 1,020' },
              ].map((r, i) => (
                <View key={i} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{r.label}</Text>
                  <Text style={[styles.infoValue, r.value.startsWith('-') && { color: C.red }]}>{r.value}</Text>
                </View>
              ))}
              <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, marginTop: 4 }]}>
                <Text style={[styles.infoLabel, { fontWeight: '700', color: C.text }]}>Net Pay</Text>
                <Text style={[styles.infoValue, { fontWeight: '800', color: C.green, fontSize: 16 }]}>Rs. 23,560</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );

  // ============================================================
  // OWNER LOGIN
  // ============================================================
  const renderOwnerLogin = () => (
    <View style={{ flex: 1, backgroundColor: C.ownerBg }}>
      <View style={styles.loginPortalHeader}>
        <TouchableOpacity onPress={() => setPortal('customer')}>
          <Text style={styles.loginBackBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.loginPortalTitle}>Owner Portal</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.loginScroll}>
        <View style={styles.loginCard}>
          <View style={[styles.loginIcon, { backgroundColor: C.ownerPrimary }]}>
            <Text style={styles.loginIconText}>O</Text>
          </View>
          <Text style={styles.loginTitle}>Car Owner Sign In</Text>
          <Text style={styles.loginSub}>Access your driver dossier, vehicle compliance, duty approvals, and placement agreement</Text>

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
            <Text style={styles.loginDemoBtnText}>Demo Login: OWN-501 / 1234</Text>
          </TouchableOpacity>
          <Text style={styles.loginHelpText}>Need help? Call: +91 8175087004</Text>
        </View>
      </ScrollView>
    </View>
  );

  // ============================================================
  // OWNER APP
  // ============================================================
  const renderOwnerApp = () => (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[styles.portalHeader, { backgroundColor: C.ownerPrimary }]}>
        <View>
          <Text style={styles.portalHeaderGreet}>Owner Dashboard</Text>
          <Text style={styles.portalHeaderName}>Mr. Rajesh Agarwal</Text>
          <Text style={styles.portalHeaderId}>ID: OWN-501  •  Vasant Vihar, South Delhi</Text>
        </View>
        <TouchableOpacity style={styles.portalLogoutBtn} onPress={() => setPortal('customer')}>
          <Text style={styles.portalLogoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.portalTabBar}>
        {[
          { k: 'driver', l: 'My Driver' },
          { k: 'vehicle', l: 'Vehicle' },
          { k: 'approve', l: 'Approve Duty' },
          { k: 'substitute', l: 'Substitute' },
          { k: 'agreement', l: 'Agreement' },
        ].map(t => (
          <TouchableOpacity key={t.k} onPress={() => setOwnTab(t.k)}
            style={[styles.portalTab, ownTab === t.k && { borderBottomColor: C.ownerAccent, borderBottomWidth: 2 }]}>
            <Text style={[styles.portalTabText, ownTab === t.k && { color: C.ownerAccent, fontWeight: '700' }]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {ownTab === 'driver' && (
          <View>
            <Text style={styles.sectionHeading}>Assigned Driver Profile</Text>
            <View style={styles.infoCard}>
              <Image source={require('./assets/indian_driver_portrait.jpg')} style={{ width: '100%', height: 160, borderRadius: 10, marginBottom: 12 }} resizeMode="cover" />
              <View style={styles.driverNameRow}>
                <Text style={styles.driverName}>Rameshwar Dayal</Text>
                <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>Verified</Text></View>
              </View>
              <Text style={styles.driverBadge}>Senior Chauffeur  •  DRV-101</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Experience</Text>
                <Text style={styles.infoValue}>15 Years</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Driving Score</Text>
                <Text style={[styles.infoValue, { color: C.green }]}>★ 4.95 (184 assignments)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>DL Number</Text>
                <Text style={styles.infoValue}>DL-0420110012345 (Commercial)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Police Clearance</Text>
                <Text style={[styles.infoValue, { color: C.green }]}>Verified — PC/DL/2024/8871</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Aadhaar</Text>
                <Text style={[styles.infoValue, { color: C.green }]}>Verified — XXXX XXXX 7821</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mobile</Text>
                <Text style={styles.infoValue}>+91 98765 43210</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Emergency Contact</Text>
                <Text style={styles.infoValue}>Sunita Devi (Wife) — +91 99887 76655</Text>
              </View>
              <TouchableOpacity style={[styles.serviceCardBtn, { marginTop: 12 }]}
                onPress={() => Linking.openURL('tel:+919876543210')}>
                <Text style={styles.serviceCardBtnText}>Call Driver</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {ownTab === 'vehicle' && (
          <View>
            <Text style={styles.sectionHeading}>Vehicle Compliance Status</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Hyundai Creta 2023</Text>
              <Text style={{ color: C.textSub, fontSize: 13, marginBottom: 12 }}>Reg: DL 3C XX 1234  •  Automatic  •  Silver</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current Odometer</Text>
                <Text style={styles.infoValue}>42,220 km</Text>
              </View>
            </View>

            {[
              { title: 'PUC Certificate', expiry: '25 Oct 2026', status: 'Valid', daysLeft: 44, color: C.green },
              { title: 'Comprehensive Insurance', expiry: '14 Dec 2026', status: 'Valid', daysLeft: 94, color: C.green },
              { title: 'Fitness Certificate', expiry: '10 Oct 2026', status: 'Expiring Soon', daysLeft: 29, color: C.amber },
              { title: 'Road Tax', expiry: 'Lifetime', status: 'Valid', daysLeft: 999, color: C.green },
            ].map((item, i) => (
              <View key={i} style={styles.complianceCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.complianceTitle}>{item.title}</Text>
                  <Text style={styles.complianceExpiry}>Expires: {item.expiry}</Text>
                  {item.daysLeft < 60 && item.daysLeft < 999 && (
                    <Text style={[styles.complianceDays, { color: item.color }]}>{item.daysLeft} days remaining</Text>
                  )}
                </View>
                <View style={[styles.logStatusBadge, { backgroundColor: item.color + '20' }]}>
                  <Text style={[styles.logStatusText, { color: item.color }]}>{item.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {ownTab === 'approve' && (
          <View>
            <Text style={styles.sectionHeading}>Driver Duty Approval</Text>
            <Text style={{ color: C.textSub, marginBottom: 12, fontSize: 13 }}>Review and approve driver-submitted duty logs and overtime hours</Text>
            {dutyLogs.map(log => (
              <View key={log.id} style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{log.date}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Duty</Text>
                  <Text style={styles.infoValue}>{log.inTime} – {log.outTime}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Odometer</Text>
                  <Text style={styles.infoValue}>{log.startKm} → {log.endKm}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Overtime</Text>
                  <Text style={styles.infoValue}>{log.ot}</Text>
                </View>
                {!log.approved ? (
                  <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.ownerPrimary, marginTop: 8 }]}
                    onPress={() => approveLog(log.id)}>
                    <Text style={styles.serviceCardBtnText}>Approve Overtime</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.logStatusBadge, { alignSelf: 'flex-start', marginTop: 8 }]}>
                    <Text style={[styles.logStatusText, { color: C.green }]}>Approved</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {ownTab === 'substitute' && (
          <View>
            <Text style={styles.sectionHeading}>Request Emergency Substitute</Text>
            <View style={[styles.infoCard, { borderLeftWidth: 4, borderLeftColor: C.ownerAccent }]}>
              <Text style={styles.infoCardTitle}>1-Day Backup Driver</Text>
              <Text style={{ color: C.textSub, lineHeight: 20, marginBottom: 16 }}>
                If your driver Rameshwar Dayal is on approved leave or unavailable for the day, Drivers Saathi will arrange a verified substitute driver from the standby pool within 2 hours.
              </Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Substitute Coverage</Text>
                <Text style={styles.infoValue}>Included in placement fee (2 times/year)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Response Time</Text>
                <Text style={styles.infoValue}>Within 2 hours of request</Text>
              </View>
              <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.ownerPrimary, marginTop: 12 }]}
                onPress={() => Alert.alert('Substitute Requested', 'Your request has been sent to the dispatch desk. You will receive a confirmation call within 30 minutes.')}>
                <Text style={styles.serviceCardBtnText}>Request Substitute Driver</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.blue, marginTop: 8 }]} onPress={call}>
                <Text style={styles.serviceCardBtnText}>Call Dispatch: +91 8175087004</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeading}>Standby Driver Available</Text>
            <View style={styles.driverCard}>
              <View style={styles.driverCardTop}>
                <Image source={require('./assets/indian_driver_wheel.jpg')} style={styles.driverAvatar} resizeMode="cover" />
                <View style={styles.driverCardInfo}>
                  <Text style={styles.driverName}>Vikramaditya Singh</Text>
                  <Text style={styles.driverBadge}>Luxury Specialist  •  DRV-102</Text>
                  <Text style={styles.driverRating}>★ 4.88 (142 assignments)</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {ownTab === 'agreement' && (
          <View>
            <Text style={styles.sectionHeading}>Placement Agreement</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Driver Placement Agreement</Text>
              <Text style={{ color: C.textSub, fontSize: 12, marginBottom: 16 }}>Agreement Date: 12 August 2026  •  Ref: DS-PL-2026-501</Text>
              {[
                { section: 'Parties', content: 'Between Drivers Saathi (Agency) and Mr. Rajesh Agarwal (Car Owner), for placement of Mr. Rameshwar Dayal (Driver).' },
                { section: 'Duty Hours', content: '10 Hours per day, Monday to Saturday. Sunday duty and overtime at mutually agreed rates.' },
                { section: 'Salary', content: 'Rs. 22,000 per month, paid directly by the Car Owner to the Driver by the 5th of each month.' },
                { section: 'Overtime', content: 'Rs. 80 per hour beyond the daily shift. Approved by car owner in the Drivers Saathi portal.' },
                { section: 'Notice Period', content: '15 calendar days notice required from both the car owner and the driver for ending the arrangement.' },
                { section: 'Replacement Guarantee', content: '30-day free driver replacement if the driver does not perform as expected. One replacement per placement included.' },
                { section: 'Security Deposit', content: 'No security deposit charged by the agency. Placement fee: Rs. 4,500 (one-time, paid at placement).' },
                { section: 'Jurisdiction', content: 'Any disputes shall be resolved under the jurisdiction of Delhi courts.' },
              ].map((c, i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: '700', color: C.text, fontSize: 13 }}>{c.section}</Text>
                  <Text style={{ color: C.textSub, fontSize: 12, marginTop: 3, lineHeight: 18 }}>{c.content}</Text>
                  {i < 7 && <View style={{ height: 1, backgroundColor: C.divider, marginTop: 10 }} />}
                </View>
              ))}
              <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.ownerPrimary, marginTop: 8 }]}
                onPress={() => Alert.alert('Agreement', 'PDF download feature will be available in the next update.')}>
                <Text style={styles.serviceCardBtnText}>Download PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );

  // ============================================================
  // ADMIN LOGIN
  // ============================================================
  const renderAdminLogin = () => (
    <View style={{ flex: 1, backgroundColor: C.adminBg }}>
      <View style={styles.loginPortalHeader}>
        <TouchableOpacity onPress={() => setPortal('customer')}>
          <Text style={styles.loginBackBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.loginPortalTitle}>Admin Console</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.loginScroll}>
        <View style={styles.loginCard}>
          <View style={[styles.loginIcon, { backgroundColor: C.adminPrimary }]}>
            <Text style={styles.loginIconText}>A</Text>
          </View>
          <Text style={styles.loginTitle}>Admin Sign In</Text>
          <Text style={styles.loginSub}>Master dispatch console for Drivers Saathi operations team</Text>

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
            <Text style={styles.loginDemoBtnText}>Demo Login: ADMIN / 1234</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  // ============================================================
  // ADMIN APP
  // ============================================================
  const renderAdminApp = () => {
    const adminPlacements = [
      { id: 'P-101', owner: 'Mr. Rajesh Agarwal, Vasant Vihar', car: 'Hyundai Creta (DL 3C XX 1234)', driver: 'Rameshwar Dayal — DRV-101', status: 'Active', warrantyEnd: '04 Oct 2026' },
      { id: 'P-102', owner: 'Dr. Sameer Kapoor, DLF Phase 5', car: 'BMW 5 Series (HR 26 BR 5678)', driver: 'Vikramaditya Singh — DRV-102', status: 'Active', warrantyEnd: '12 Oct 2026' },
      { id: 'P-103', owner: 'Mrs. Anita Mehta, Sector 18 Noida', car: 'Honda City ZX (UP 16 XX 9090)', driver: 'Mohan Lal Verma — DRV-103', status: 'Trial', warrantyEnd: 'Pending' },
    ];
    const leads = [
      { id: 'DS-3421', name: 'Sunita Bhatia', phone: '+91 98112 33445', area: 'Dwarka, Delhi', car: 'Maruti Swift', service: 'Personal Chauffeur', status: 'New' },
      { id: 'DS-3420', name: 'Rajiv Malhotra', phone: '+91 97118 55667', area: 'Sector 56, Gurugram', car: 'Honda Amaze', service: 'Corporate Fleet', status: 'Contacted' },
      { id: 'DS-3419', name: 'Priya Menon', phone: '+91 99100 22334', area: 'Indirapuram, Noida', car: 'Hyundai Verna', service: 'Personal Chauffeur', status: 'Trial Scheduled' },
    ];

    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={[styles.portalHeader, { backgroundColor: C.adminPrimary }]}>
          <View>
            <Text style={styles.portalHeaderGreet}>Dispatch Console</Text>
            <Text style={styles.portalHeaderName}>Drivers Saathi Admin</Text>
            <Text style={styles.portalHeaderId}>Master Operations Panel</Text>
          </View>
          <TouchableOpacity style={styles.portalLogoutBtn} onPress={() => setPortal('customer')}>
            <Text style={styles.portalLogoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.portalTabBar}>
          {[
            { k: 'overview', l: 'Overview' },
            { k: 'placements', l: 'Placements' },
            { k: 'leads', l: 'Inquiries' },
            { k: 'standby', l: 'Standby Pool' },
          ].map(t => (
            <TouchableOpacity key={t.k} onPress={() => setAdmTab(t.k)}
              style={[styles.portalTab, admTab === t.k && { borderBottomColor: C.adminAccent, borderBottomWidth: 2 }]}>
              <Text style={[styles.portalTabText, admTab === t.k && { color: C.adminAccent, fontWeight: '700' }]}>{t.l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {admTab === 'overview' && (
            <View>
              <View style={styles.kpiGrid}>
                {[
                  { label: 'Active Placements', value: '3', color: C.adminPrimary },
                  { label: 'Drivers on Duty', value: '2', color: C.driverPrimary },
                  { label: 'Pending Approvals', value: '1', color: C.amber },
                  { label: 'New Inquiries', value: '3', color: C.blue },
                  { label: 'Substitute Requests', value: '0', color: C.ownerPrimary },
                  { label: 'Expiry Alerts', value: '1', color: C.red },
                ].map((k, i) => (
                  <View key={i} style={styles.kpiCard}>
                    <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
                    <Text style={styles.kpiLabel}>{k.label}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionHeading}>Quick Actions</Text>
              <View style={styles.actionGrid}>
                {[
                  { label: 'Add New Driver', color: C.driverPrimary, fn: () => Alert.alert('Coming Soon', 'Driver onboarding form will be available in next update.') },
                  { label: 'New Placement', color: C.adminPrimary, fn: () => setAdmTab('placements') },
                  { label: 'View Leads', color: C.blue, fn: () => setAdmTab('leads') },
                  { label: 'Assign Substitute', color: C.ownerPrimary, fn: () => setAdmTab('standby') },
                ].map((a, i) => (
                  <TouchableOpacity key={i} onPress={a.fn}
                    style={[styles.actionBtn, { backgroundColor: a.color }]}>
                    <Text style={styles.actionBtnText}>{a.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {admTab === 'placements' && (
            <View>
              <Text style={styles.sectionHeading}>Active Placements</Text>
              {adminPlacements.map(p => (
                <View key={p.id} style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Placement ID</Text>
                    <Text style={[styles.infoValue, { fontWeight: '700' }]}>{p.id}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Owner</Text>
                    <Text style={styles.infoValue}>{p.owner}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Vehicle</Text>
                    <Text style={styles.infoValue}>{p.car}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Driver</Text>
                    <Text style={styles.infoValue}>{p.driver}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Warranty Ends</Text>
                    <Text style={styles.infoValue}>{p.warrantyEnd}</Text>
                  </View>
                  <View style={[styles.logStatusBadge, { alignSelf: 'flex-start', backgroundColor: p.status === 'Active' ? C.greenBg : C.amberBg }]}>
                    <Text style={[styles.logStatusText, { color: p.status === 'Active' ? C.green : C.amber }]}>{p.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {admTab === 'leads' && (
            <View>
              <Text style={styles.sectionHeading}>Customer Inquiries</Text>
              {leads.map(l => (
                <View key={l.id} style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ref</Text>
                    <Text style={[styles.infoValue, { fontWeight: '700' }]}>{l.id}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>{l.name}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{l.phone}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Area</Text>
                    <Text style={styles.infoValue}>{l.area}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Service</Text>
                    <Text style={styles.infoValue}>{l.service}</Text>
                  </View>
                  <View style={styles.leadActionRow}>
                    <View style={[styles.logStatusBadge, { backgroundColor: l.status === 'New' ? C.blueBg : l.status === 'Contacted' ? C.amberBg : C.greenBg }]}>
                      <Text style={[styles.logStatusText, { color: l.status === 'New' ? C.blue : l.status === 'Contacted' ? C.amber : C.green }]}>{l.status}</Text>
                    </View>
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${l.phone}`)}>
                      <Text style={{ color: C.blue, fontWeight: '600', fontSize: 13 }}>Call Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {admTab === 'standby' && (
            <View>
              <Text style={styles.sectionHeading}>Standby Driver Pool</Text>
              {CANDIDATES.map(d => (
                <View key={d.id} style={styles.driverCard}>
                  <View style={styles.driverCardTop}>
                    <Image source={d.photo} style={styles.driverAvatar} resizeMode="cover" />
                    <View style={styles.driverCardInfo}>
                      <Text style={styles.driverName}>{d.name}</Text>
                      <Text style={styles.driverBadge}>{d.badge}</Text>
                      <Text style={styles.driverExp}>{d.exp} • {d.location}</Text>
                      <Text style={styles.driverRating}>★ {d.rating}  ({d.trips} assignments)</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.serviceCardBtn, { backgroundColor: C.adminPrimary, marginTop: 10 }]}
                    onPress={() => Alert.alert('Assigned', `${d.name} assigned as substitute. Owner has been notified.`)}>
                    <Text style={styles.serviceCardBtnText}>Assign as Substitute</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  // ─── Root Render ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style={portal === 'customer' ? 'light' : 'light'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {portal === 'customer'    && renderCustomer()}
        {portal === 'driver_login' && renderDriverLogin()}
        {portal === 'driver_app'  && renderDriverApp()}
        {portal === 'owner_login' && renderOwnerLogin()}
        {portal === 'owner_app'   && renderOwnerApp()}
        {portal === 'admin_login' && renderAdminLogin()}
        {portal === 'admin_app'   && renderAdminApp()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Stylesheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Customer Header
  custHeader: { backgroundColor: C.brandDark, paddingTop: Platform.OS === 'android' ? 36 : 12, paddingBottom: 12, paddingHorizontal: 16 },
  custHeaderInner: { flexDirection: 'row', alignItems: 'center' },
  custLogo: { width: 52, height: 52, borderRadius: 10 },
  custBrandName: { color: C.white, fontSize: 18, fontWeight: '900', letterSpacing: 1.5 },
  custBrandTagline: { color: '#90CAF9', fontSize: 11, marginTop: 1 },
  custPortalRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  custPortalBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  custPortalBtnText: { color: C.white, fontSize: 11, fontWeight: '700' },

  // Customer Tab Bar
  custTabBar: { backgroundColor: C.brand, flexDirection: 'row', paddingHorizontal: 8 },
  custTabItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  custTabItemActive: { borderBottomColor: C.accentGold },
  custTabText: { color: '#90CAF9', fontSize: 13, fontWeight: '600' },
  custTabTextActive: { color: C.white, fontWeight: '800' },

  // Hero
  heroSection: { position: 'relative', height: 300 },
  heroImage: { width: '100%', height: 300, position: 'absolute' },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(13,21,87,0.75)', justifyContent: 'flex-end', padding: 20, height: 300 },
  heroTagline: { color: C.accentGold, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
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

  // Section Blocks
  sectionBlock: { paddingHorizontal: 16, paddingVertical: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: C.text, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: C.textSub, marginBottom: 20, lineHeight: 18 },

  // How It Works
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stepCard: { width: (SW - 44) / 2, backgroundColor: C.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.brand, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  stepNumText: { color: C.white, fontWeight: '900', fontSize: 14 },
  stepTitle: { fontSize: 13, fontWeight: '800', color: C.text, marginBottom: 4 },
  stepDesc: { fontSize: 11, color: C.textSub, lineHeight: 16 },

  // Feature Grid
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  featureCard: { width: (SW - 44) / 2, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14 },
  featureIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  featureIconText: { color: C.white, fontWeight: '900', fontSize: 16 },
  featureTitle: { color: C.white, fontWeight: '800', fontSize: 13, marginBottom: 4 },
  featureDesc: { color: '#90CAF9', fontSize: 11, lineHeight: 16 },

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

  // Salary Result
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

  // Book Form
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

  // Contact
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

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: C.white, borderRadius: 20, padding: 28, width: '100%', maxWidth: 400, alignItems: 'center' },
  modalCheckCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.greenBg, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalCheck: { fontSize: 28, color: C.green },
  modalTitle: { fontSize: 20, fontWeight: '900', color: C.text, marginBottom: 12 },
  modalMsg: { fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 21, marginBottom: 20 },
  modalBtn: { backgroundColor: C.brand, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 },
  modalBtnText: { color: C.white, fontWeight: '700', fontSize: 15 },

  // Portal Header (Driver / Owner / Admin)
  portalHeader: { paddingTop: Platform.OS === 'android' ? 36 : 12, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  portalHeaderGreet: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  portalHeaderName: { color: C.white, fontSize: 18, fontWeight: '900' },
  portalHeaderId: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
  portalLogoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 6 },
  portalLogoutText: { color: C.white, fontSize: 12, fontWeight: '700' },

  // Portal Tab Bar
  portalTabBar: { flexDirection: 'row', backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border, paddingHorizontal: 8 },
  portalTab: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
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

  // Quick Action Grid
  sectionHeading: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 10, marginTop: 4 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  actionBtn: { flex: 1, minWidth: (SW - 52) / 2, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { color: C.white, fontWeight: '700', fontSize: 13 },

  // Form Row Group
  formRowGroup: { flexDirection: 'row', marginBottom: 8 },

  // Log Row
  logRow: { backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center' },
  logDate: { fontSize: 13, fontWeight: '700', color: C.text },
  logMeta: { fontSize: 12, color: C.textSub, marginTop: 2 },
  logKm: { fontSize: 12, color: C.textMuted, marginTop: 1 },

  // Leave Row
  leaveRow: { backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center' },
  leaveDate: { fontSize: 13, fontWeight: '700', color: C.text },
  leaveReason: { fontSize: 12, color: C.textSub, marginTop: 2 },
  leaveSub: { fontSize: 11, color: C.textMuted, marginTop: 2, fontStyle: 'italic' },

  // Status Badge
  logStatusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: C.greenBg },
  logStatusText: { fontSize: 11, fontWeight: '700', color: C.green },

  // Doc Card
  docCard: { backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center' },
  docTitle: { fontSize: 13, fontWeight: '700', color: C.text },
  docNum: { fontSize: 11, color: C.textSub, marginTop: 2 },

  // Compliance Card
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

  // KPI Grid (Admin)
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  kpiCard: { flex: 1, minWidth: (SW - 52) / 2, backgroundColor: C.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  kpiValue: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  kpiLabel: { fontSize: 11, color: C.textSub, fontWeight: '600', textAlign: 'center' },

  // Lead Actions
  leadActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
});
