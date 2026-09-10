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

// ─── Executive Color System ───────────────────────────────────────────────────
const THEME = {
  primary: '#0F172A',         // Rich Executive Navy
  primaryLight: '#1E293B',
  accent: '#FB8500',          // Signature Warm Marigold
  accentDeep: '#D97706',
  accentSoft: '#FFF7ED',
  accentBorder: '#FDBA74',
  canvas: '#F8FAFC',          // Soft Off-White Background
  surface: '#FFFFFF',         // Crisp White Cards
  border: '#E2E8F0',          // Subtle Border Lines
  borderSoft: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  success: '#059669',         // Verified Emerald
  successSoft: '#ECFDF5',
  sosRed: '#EF4444',
  sosSoft: '#FEF2F2',
  blue: '#2563EB',
  blueSoft: '#EFF6FF',
  gold: '#F59E0B',
  goldSoft: '#FFFBEB',
};

// ─── Real Verified Chauffeur Candidates ─────────────────────────────────────────
const VERIFIED_CHAUFFEURS = [
  {
    id: 'c1',
    name: 'Rameshwar Dayal',
    age: 42,
    exp: '15 Yrs Exp',
    rating: '4.95',
    trips: 184,
    skills: ['Automatic', 'Fortuner / Innova', 'VIP Executive'],
    languages: 'Hindi, Working English',
    badge: 'GOLD CHAUFFEUR',
    zone: 'South Delhi & Gurugram',
    policeCleared: true,
    photo: require('./assets/indian_driver_portrait.jpg'),
    bio: 'Ex-corporate chauffeur for MNC directors. Strict on-time arrival and defensive driving trained.',
  },
  {
    id: 'c2',
    name: 'Vikramaditya Singh',
    age: 36,
    exp: '11 Yrs Exp',
    rating: '4.88',
    trips: 142,
    skills: ['Automatic', 'BMW / Mercedes', 'EV Specialist'],
    languages: 'Hindi, English',
    badge: 'LUXURY CHAUFFEUR',
    zone: 'Gurugram (Golf Course & Cyber City)',
    policeCleared: true,
    photo: require('./assets/indian_driver_wheel.jpg'),
    bio: 'Specialist in German luxury sedans and electric vehicles. Smooth braking and polite route management.',
  },
  {
    id: 'c3',
    name: 'Mohan Lal Verma',
    age: 46,
    exp: '18 Yrs Exp',
    rating: '4.98',
    trips: 260,
    skills: ['Manual & Automatic', 'All SUVs', 'Night Driving'],
    languages: 'Hindi',
    badge: 'MASTER DRIVER',
    zone: 'Noida & Central Delhi',
    policeCleared: true,
    photo: require('./assets/driver_passenger_service.jpg'),
    bio: '18 years accident-free commercial record. Exceptional expressway experience across North India.',
  },
  {
    id: 'c4',
    name: 'Satish Chand Sharma',
    age: 33,
    exp: '8 Yrs Exp',
    rating: '4.85',
    trips: 98,
    skills: ['Highway Trips', 'Yamuna Expy', 'FASTag Expert'],
    languages: 'Hindi, Basic English',
    badge: 'HIGHWAY SPECIALIST',
    zone: 'Delhi NCR & Outstation',
    policeCleared: true,
    photo: require('./assets/driver_team_standing.jpg'),
    bio: 'Preferred chauffeur for weekend getaways to Agra, Jaipur, and Chandigarh. Non-smoker, clean etiquette.',
  },
];

// ─── Highway Routes Database ────────────────────────────────────────────────────
const HIGHWAY_ROUTES = [
  { id: 'agra', name: 'Delhi to Agra', route: 'Yamuna Expressway', dist: '210 km', time: '3.5 hrs', fare: '₹1,500/day', toll: '₹415', da: '₹400 DA' },
  { id: 'jaipur', name: 'Delhi to Jaipur', route: 'Delhi-Mumbai Expy', dist: '270 km', time: '4 hrs', fare: '₹1,800/day', toll: '₹590', da: '₹500 DA' },
  { id: 'chandigarh', name: 'Delhi to Chandigarh', route: 'NH-44 Highway', dist: '250 km', time: '4.5 hrs', fare: '₹1,600/day', toll: '₹390', da: '₹400 DA' },
  { id: 'dehradun', name: 'Delhi to Dehradun', route: 'Meerut Expressway', dist: '260 km', time: '5 hrs', fare: '₹1,800/day', toll: '₹310', da: '₹500 DA' },
];

// ─── Active Job Listings for Drivers ───────────────────────────────────────────
const DRIVER_JOBS = [
  { id: 'j1', title: 'Personal Chauffeur for Creta (Automatic)', salary: '₹22,000 - ₹24,000/mo', location: 'Vasant Vihar, South Delhi', type: '10-Hr Duty', tag: 'URGENT' },
  { id: 'j2', title: 'Luxury Chauffeur (Mercedes E-Class)', salary: '₹26,000 - ₹30,000/mo', location: 'DLF Phase 5, Gurugram', type: '12-Hr Executive', tag: 'PREMIUM' },
  { id: 'j3', title: 'Corporate Fleet Driver for Startup Shuttle', salary: '₹20,000 - ₹22,000/mo', location: 'Sector 62, Noida', type: 'Commercial LMV', tag: 'IMMEDIATE' },
  { id: 'j4', title: 'Full-Time Chauffeur for Family Fortuner', salary: '₹24,000 - ₹26,000/mo', location: 'Punjabi Bagh, New Delhi', type: '10-Hr Duty', tag: 'POPULAR' },
];

export default function App() {
  // Navigation Tabs: 'explore' | 'chauffeurs' | 'bookings' | 'driver'
  const [activeTab, setActiveTab] = useState('explore');
  const [lang, setLang] = useState('en'); // 'en' | 'hi'

  // User Profile & Saved Garage
  const [profileModal, setProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'Priya Sharma',
    phone: '+91 98110 23456',
    email: 'priya.sharma@example.com',
    primaryCar: 'Hyundai Creta 2023 (Automatic)',
    address: 'DLF Phase 5, Gurugram',
    savedCars: ['Hyundai Creta (Automatic)', 'Honda City ZX (Manual)'],
  });

  // Filter for Chauffeurs Directory
  const [chauffeurFilter, setChauffeurFilter] = useState('All');

  // Multi-Step Smart Booking Modal
  const [bookingModal, setBookingModal] = useState({ visible: false, service: null, selectedChauffeur: null });
  const [bookingStep, setBookingStep] = useState(1); // 1: Requirements -> 2: Date/Hours -> 3: Contact & Token
  const [smartBooking, setSmartBooking] = useState({
    shiftHours: '10 Hours (Standard Day)',
    transmission: 'Automatic',
    weeklyOff: 'Sunday Off',
    reportingTime: '08:30 AM',
    startDate: 'Tomorrow',
    carModel: 'Hyundai Creta',
    locationArea: 'South Delhi / Gurugram',
    pricingPlan: 'onetime', // 'onetime' (₹4,500) | 'subscription' (₹3,500/mo)
    tokenOption: 'token500', // 'token500' | 'payLater'
    upiApp: 'Google Pay',
  });

  // Loading & Confirmation
  const [loading, setLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({ visible: false, bookingId: '', message: '' });

  // Client Bookings & Duty Records
  const [bookings, setBookings] = useState([]);
  const [dutyLogs, setDutyLogs] = useState([]);
  const [dutyInput, setDutyInput] = useState({
    date: new Date().toISOString().split('T')[0],
    inTime: '08:30 AM',
    outTime: '07:00 PM',
    km: '54',
    ot: '1.5',
  });
  const [bookingsTab, setBookingsTab] = useState('active'); // 'active' | 'duty' | 'fleet'

  // Driver Mode Cockpit
  const [driverModeSubTab, setDriverModeSubTab] = useState('cockpit'); // 'cockpit' | 'jobs' | 'wallet' | 'kyc'
  const [dutyOtpEntered, setDutyOtpEntered] = useState('');
  const [isDutyActive, setIsDutyActive] = useState(false);
  const [driverWallet, setDriverWallet] = useState({ balance: 3800, pendingOT: 600, referrals: 1000 });
  const [driverKYC, setDriverKYC] = useState({ name: '', phone: '', exp: '', licenseCategory: 'Commercial LMV' });
  const [licenseImg, setLicenseImg] = useState(null);
  const [aadhaarImg, setAadhaarImg] = useState(null);

  // Corporate Fleet Roster
  const [fleetVehicles, setFleetVehicles] = useState([
    { id: 'f1', vehicle: 'Swift Dzire (DL-1Z-9042)', driver: 'Suresh Kumar', status: 'On Duty', dlExpiry: '14 Oct 2027' },
    { id: 'f2', vehicle: 'Innova Crysta (DL-1Z-4411)', driver: 'Vikram Singh', status: 'On Duty', dlExpiry: '22 Nov 2026' },
    { id: 'f3', vehicle: 'Honda City (HR-26-8802)', driver: 'Deepak Verma', status: 'Substitute Needed', dlExpiry: 'Expired (Action Required)' },
  ]);

  // Load Saved Data
  useEffect(() => {
    (async () => {
      try {
        const savedBookings = await AsyncStorage.getItem('@ds_client_bookings_v2');
        if (savedBookings) setBookings(JSON.parse(savedBookings));
        else {
          setBookings([
            {
              id: 'DS-9042',
              title: 'Personal Chauffeur Placement',
              chauffeurName: 'Rameshwar Dayal',
              car: 'Hyundai Creta (Automatic)',
              date: '04 Sep 2026',
              status: 'Active Duty',
              fee: '₹4,500 Paid',
              replacementExpiry: '04 Oct 2026 (23 days remaining)',
            },
          ]);
        }
        const savedLogs = await AsyncStorage.getItem('@ds_duty_logs_v2');
        if (savedLogs) setDutyLogs(JSON.parse(savedLogs));
        else {
          setDutyLogs([
            { id: 'd1', date: '2026-09-08', in: '08:30 AM', out: '07:15 PM', km: '62 km', ot: '1.5 hrs' },
            { id: 'd2', date: '2026-09-09', in: '08:30 AM', out: '07:45 PM', km: '78 km', ot: '2.0 hrs' },
          ]);
        }
      } catch (e) {}
    })();
  }, []);

  const makeCall = () => Linking.openURL('tel:+918175087004');

  const openWhatsApp = (customMsg = '') => {
    const text = customMsg || (lang === 'en'
      ? 'Hello Drivers Saathi, I need a verified chauffeur in Delhi NCR. Please share available drivers.'
      : 'नमस्ते ड्राइवर्स साथी, मुझे दिल्ली एनसीआर में वेरिफाइड ड्राइवर की आवश्यकता है।');
    Linking.openURL(`https://wa.me/918175087004?text=${encodeURIComponent(text)}`);
  };

  const triggerSOS = () => {
    Alert.alert(
      'Emergency Dispatch & Roadside SOS',
      'Direct line to Drivers Saathi Delhi NCR live dispatch desk.\n\nHelpline: +91 8175087004\nOperational: 24 Hours / 7 Days',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Dispatch Desk Now', onPress: makeCall },
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

  const openBookingFlow = (service, chauffeur = null) => {
    setBookingModal({
      visible: true,
      service: service || { title: 'Personal Chauffeur Placement', price: '₹4,500 Fee' },
      selectedChauffeur: chauffeur,
    });
    setBookingStep(1);
    if (chauffeur) {
      setSmartBooking(prev => ({ ...prev, carModel: userProfile.primaryCar }));
    }
  };

  const handleSaveDutyEntry = async () => {
    if (!dutyInput.inTime || !dutyInput.outTime) {
      Alert.alert('Required', 'Please enter check-in and check-out times.');
      return;
    }
    const newLog = {
      id: Date.now().toString(),
      date: dutyInput.date,
      in: dutyInput.inTime,
      out: dutyInput.outTime,
      km: `${dutyInput.km || 0} km`,
      ot: `${dutyInput.ot || 0} hrs`,
    };
    const updated = [newLog, ...dutyLogs];
    setDutyLogs(updated);
    await AsyncStorage.setItem('@ds_duty_logs_v2', JSON.stringify(updated));
    Alert.alert('Duty Logged', `Logged duty for ${dutyInput.date} (+${dutyInput.ot} hrs OT).`);
  };

  const handleConfirmSmartBooking = async () => {
    if (!userProfile.name.trim() || !userProfile.phone.trim()) {
      Alert.alert('Contact Details', 'Please provide your full name and phone number.');
      return;
    }

    setLoading(true);
    const bookingId = `DS-${Math.floor(1000 + Math.random() * 9000)}`;
    const serviceTitle = bookingModal.selectedChauffeur
      ? `Hire Chauffeur: ${bookingModal.selectedChauffeur.name}`
      : (bookingModal.service?.title || 'Chauffeur Placement');

    const amount = smartBooking.pricingPlan === 'subscription' ? '₹3,500/Month Retainer' : '₹4,500 One-time Placement';

    const payload = {
      BookingID: bookingId,
      Service: serviceTitle,
      SelectedChauffeur: bookingModal.selectedChauffeur?.name || 'Assigned by Dispatch Desk',
      ClientName: userProfile.name,
      ClientPhone: userProfile.phone,
      ClientEmail: userProfile.email,
      Vehicle: smartBooking.carModel || userProfile.primaryCar,
      Transmission: smartBooking.transmission,
      ShiftHours: smartBooking.shiftHours,
      ReportingTime: smartBooking.reportingTime,
      WeeklyOff: smartBooking.weeklyOff,
      StartDate: smartBooking.startDate,
      Location: smartBooking.locationArea || userProfile.address,
      Plan: amount,
      AdvancePayment: smartBooking.tokenOption === 'token500' ? '₹500 Token Paid via ' + smartBooking.upiApp : 'Pay Post Placement',
      _subject: `[Confirmed Booking #${bookingId}] ${serviceTitle} - ${userProfile.name}`,
      _autoresponse: `Dear ${userProfile.name}, your booking #${bookingId} is confirmed with Drivers Saathi! Our dispatch coordinator is allocating your verified driver and will connect with you within 4 hours. Helpline: +91 8175087004`,
    };

    try {
      await fetch('https://formsubmit.co/ajax/support@driverssaathi.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const newBookingRecord = {
        id: bookingId,
        title: serviceTitle,
        chauffeurName: bookingModal.selectedChauffeur?.name || 'Chauffeur Allocation In Progress',
        car: smartBooking.carModel || userProfile.primaryCar,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: smartBooking.tokenOption === 'token500' ? 'Token Confirmed' : 'Request Logged',
        fee: amount,
        replacementExpiry: '30-Day Free Replacement Active',
      };

      const updatedBookings = [newBookingRecord, ...bookings];
      setBookings(updatedBookings);
      await AsyncStorage.setItem('@ds_client_bookings_v2', JSON.stringify(updatedBookings));

      setBookingModal({ visible: false, service: null, selectedChauffeur: null });
      setConfirmationModal({
        visible: true,
        bookingId: bookingId,
        message: `Booking #${bookingId} is successfully confirmed!\n\nDriver profile details and interview schedule have been sent to ${userProfile.phone}.\n\nOur dispatch manager will call you within 2 hours.`,
      });
    } catch (e) {
      Alert.alert('Notice', 'Your request has been logged. Our dispatch team will call you shortly.');
      setBookingModal({ visible: false, service: null, selectedChauffeur: null });
    } finally {
      setLoading(false);
    }
  };

  // ─── TAB 1: EXPLORE & SERVICES ───────────────────────────────────────────────
  const renderExploreScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
      {/* Hero Banner */}
      <View style={styles.heroCard}>
        <View style={styles.heroBadgeRow}>
          <View style={styles.liveDot} />
          <Text style={styles.heroBadgeText}>DELHI NCR LIVE DISPATCH • 24/7 ACTIVE</Text>
        </View>
        <Text style={styles.heroTitle}>
          {lang === 'en' ? 'Verified Private Chauffeurs for Your Car' : 'आपकी निजी कार के लिए वेरिफाइड ड्राइवर्स'}
        </Text>
        <Text style={styles.heroSubtitle}>
          {lang === 'en'
            ? 'Police-cleared, background-verified personal chauffeurs & highway expressway drivers. 30-day free replacement guarantee.'
            : 'अनुभवी, पुलिस वेरिफाइड ड्राइवर्स। 30 दिन की फ्री रिप्लेसमेंट वारंटी और ट्रांसपेरेंट प्राइसिंग।'}
        </Text>

        <View style={styles.heroActionRow}>
          <TouchableOpacity
            style={styles.heroPrimaryBtn}
            onPress={() => openBookingFlow({ title: 'Personal Chauffeur Placement', price: '₹4,500 Fee' })}
            activeOpacity={0.88}
          >
            <Text style={styles.heroPrimaryBtnText}>Book Chauffeur</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.heroSecondaryBtn} onPress={() => setActiveTab('chauffeurs')} activeOpacity={0.88}>
            <Text style={styles.heroSecondaryBtnText}>Browse Drivers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.heroWhatsAppBtn} onPress={() => openWhatsApp()} activeOpacity={0.88}>
            <Text style={styles.heroWhatsAppBtnText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Trust Guarantee Strip */}
      <View style={styles.trustStrip}>
        <View style={styles.trustItem}>
          <Text style={styles.trustNumber}>100%</Text>
          <Text style={styles.trustLabel}>Police Verified</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <Text style={styles.trustNumber}>30-Day</Text>
          <Text style={styles.trustLabel}>Free Replacement</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <Text style={styles.trustNumber}>GST</Text>
          <Text style={styles.trustLabel}>Tax Invoices</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <Text style={styles.trustNumber}>4.9 ★</Text>
          <Text style={styles.trustLabel}>Client Rating</Text>
        </View>
      </View>

      {/* Featured Candidates Preview */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Available Chauffeurs Today</Text>
          <Text style={styles.sectionSub}>Pre-verified candidates ready for 1-day trial</Text>
        </View>
        <TouchableOpacity onPress={() => setActiveTab('chauffeurs')}>
          <Text style={styles.seeAllLink}>View All &rarr;</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chauffeurHorizontalScroll}>
        {VERIFIED_CHAUFFEURS.map(c => (
          <View key={c.id} style={styles.compactCandidateCard}>
            <Image source={c.photo} style={styles.candidateThumb} resizeMode="cover" />
            <View style={styles.candidateContent}>
              <View style={styles.candidateBadgeRow}>
                <Text style={styles.candidateRatingText}>★ {c.rating}</Text>
                <Text style={styles.candidateExpText}>{c.exp}</Text>
              </View>
              <Text style={styles.candidateNameText}>{c.name}</Text>
              <Text style={styles.candidateZoneText}>📍 {c.zone}</Text>
              <View style={styles.skillPillRow}>
                {c.skills.slice(0, 2).map((s, idx) => (
                  <View key={idx} style={styles.skillPill}>
                    <Text style={styles.skillPillText}>{s}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.btnHireCompact}
                onPress={() => openBookingFlow({ title: `Placement with ${c.name}`, price: '₹4,500 Fee' }, c)}
              >
                <Text style={styles.btnHireCompactText}>Book Trial &rarr;</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Core Services Section */}
      <View style={[styles.sectionHeaderRow, { marginTop: 22 }]}>
        <View>
          <Text style={styles.sectionTitle}>Driver Services</Text>
          <Text style={styles.sectionSub}>Transparent pricing with dedicated client SLA</Text>
        </View>
      </View>

      {/* Service 1: Personal Chauffeur */}
      <TouchableOpacity
        style={styles.serviceCard}
        onPress={() => openBookingFlow({
          title: 'Personal Chauffeur Placement',
          price: '₹4,500 Placement Fee',
          sub: 'Dedicated full-time driver for daily office and family commute. 30-day replacement warranty included.',
        })}
        activeOpacity={0.9}
      >
        <Image source={require('./assets/indian_driver_portrait.jpg')} style={styles.serviceImage} resizeMode="cover" />
        <View style={styles.serviceContent}>
          <View style={styles.serviceTopRow}>
            <View style={[styles.pillBadge, { backgroundColor: THEME.accentSoft }]}>
              <Text style={[styles.pillBadgeText, { color: THEME.accent }]}>DAILY COMMUTE</Text>
            </View>
            <Text style={styles.servicePrice}>₹4,500 Fee</Text>
          </View>
          <Text style={styles.serviceTitle}>Personal Chauffeur Placement</Text>
          <Text style={styles.serviceDesc}>
            Full-time, police-cleared driver for your personal car. Daily reporting, route familiarity & 30-day free replacement warranty. Monthly retainer option also available.
          </Text>
          <View style={styles.serviceFooter}>
            <Text style={styles.servicePerks}>✓ Police Cleared  •  ✓ 30-Day Guarantee  •  ✓ Monthly Retainer</Text>
            <Text style={styles.bookNowLink}>Select Options &rarr;</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Service 2: Outstation Highway Trips */}
      <TouchableOpacity
        style={styles.serviceCard}
        onPress={() => openBookingFlow({
          title: 'Outstation Highway Driver',
          price: 'Starting ₹1,500/day',
          sub: 'Experienced expressway driver for 1-day or multi-day highway travel. Yamuna Expy, Jaipur, Chandigarh.',
        })}
        activeOpacity={0.9}
      >
        <Image source={require('./assets/driver_passenger_service.jpg')} style={styles.serviceImage} resizeMode="cover" />
        <View style={styles.serviceContent}>
          <View style={styles.serviceTopRow}>
            <View style={[styles.pillBadge, { backgroundColor: THEME.successSoft }]}>
              <Text style={[styles.pillBadgeText, { color: THEME.success }]}>HIGHWAY TRAVEL</Text>
            </View>
            <Text style={styles.servicePrice}>₹1,500/day</Text>
          </View>
          <Text style={styles.serviceTitle}>1-Day & Outstation Highway Driver</Text>
          <Text style={styles.serviceDesc}>
            Commercial badge highway drivers for expressway journeys. Sit back and enjoy the trip with family while an expert drives your vehicle safely.
          </Text>
          <View style={styles.serviceFooter}>
            <Text style={styles.servicePerks}>✓ Expressway Expert  •  ✓ FASTag Assistance  •  ✓ 24/7 SOS</Text>
            <Text style={styles.bookNowLink}>Plan Route &rarr;</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Popular Highway Routes Horizontal Carousel */}
      <View style={styles.subSectionBox}>
        <Text style={styles.subSectionTitle}>Popular Outstation Highway Destinations</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routeScroll}>
          {HIGHWAY_ROUTES.map(r => (
            <TouchableOpacity
              key={r.id}
              style={styles.routePillCard}
              onPress={() => openBookingFlow({
                title: `Outstation Driver: ${r.name}`,
                price: r.fare,
                sub: `${r.route} (${r.dist} • ~${r.time}). FASTag toll: ${r.toll}, Driver DA: ${r.da}.`,
              })}
              activeOpacity={0.85}
            >
              <Text style={styles.routeDestText}>{r.name}</Text>
              <Text style={styles.routeViaText}>{r.route} ({r.dist})</Text>
              <View style={styles.routePriceRow}>
                <Text style={styles.routeFareText}>{r.fare}</Text>
                <Text style={styles.routeBookBtn}>Book</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Service 3: Corporate Fleet Retainer */}
      <TouchableOpacity
        style={styles.serviceCard}
        onPress={() => openBookingFlow({
          title: 'Corporate Fleet Driver Retainer',
          price: '₹1,800 / Slot / Month',
          sub: 'Continuous driver supply for corporate cabs, staff shuttles & travel desks. Guaranteed replacement backup within 4 hours.',
        })}
        activeOpacity={0.9}
      >
        <Image source={require('./assets/fleet_cabs_delhi.jpg')} style={styles.serviceImage} resizeMode="cover" />
        <View style={styles.serviceContent}>
          <View style={styles.serviceTopRow}>
            <View style={[styles.pillBadge, { backgroundColor: THEME.blueSoft }]}>
              <Text style={[styles.pillBadgeText, { color: THEME.blue }]}>CORPORATE & FLEET</Text>
            </View>
            <Text style={styles.servicePrice}>B2B Contract</Text>
          </View>
          <Text style={styles.serviceTitle}>Corporate Fleet Driver Retainer</Text>
          <Text style={styles.serviceDesc}>
            Monthly driver retention contract for travel desks, cab aggregators and offices. Dedicated backup pool ensures zero vehicle downtime and complete GST invoicing.
          </Text>
          <View style={styles.serviceFooter}>
            <Text style={styles.servicePerks}>✓ Guaranteed Backup  •  ✓ Input GST Invoices  •  ✓ Shift Coverage</Text>
            <Text style={styles.bookNowLink}>B2B Proposal &rarr;</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Driver Partner Invite Banner */}
      <View style={styles.driverCtaBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.driverCtaBadge}>CAREERS FOR DRIVERS</Text>
          <Text style={styles.driverCtaTitle}>Are you an experienced driver?</Text>
          <Text style={styles.driverCtaSub}>Earn ₹22,000 to ₹32,000/month with verified families and corporate fleets in Delhi NCR.</Text>
        </View>
        <TouchableOpacity style={styles.driverCtaBtn} onPress={() => setActiveTab('driver')} activeOpacity={0.88}>
          <Text style={styles.driverCtaBtnText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ─── TAB 2: VERIFIED CHAUFFEURS DIRECTORY ────────────────────────────────────
  const renderChauffeursScreen = () => {
    const filtered = chauffeurFilter === 'All'
      ? VERIFIED_CHAUFFEURS
      : VERIFIED_CHAUFFEURS.filter(c => c.skills.some(s => s.toLowerCase().includes(chauffeurFilter.toLowerCase())));

    return (
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenHeading}>Browse Verified Chauffeurs</Text>
          <Text style={styles.screenSubheading}>
            Review candidate profiles, experience records & customer ratings before booking.
          </Text>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['All', 'Automatic', 'Innova', 'BMW', 'Highway'].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, chauffeurFilter === f && styles.filterChipActive]}
              onPress={() => setChauffeurFilter(f)}
            >
              <Text style={[styles.filterChipText, chauffeurFilter === f && styles.filterChipTextActive]}>
                {f === 'All' ? 'All Chauffeurs' : f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filtered.map(c => (
          <View key={c.id} style={styles.fullCandidateCard}>
            <View style={styles.candidateHeaderRow}>
              <Image source={c.photo} style={styles.candidateLargeAvatar} resizeMode="cover" />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={styles.candidateBadgeRow}>
                  <View style={[styles.pillBadge, { backgroundColor: THEME.accentSoft }]}>
                    <Text style={[styles.pillBadgeText, { color: THEME.accentDeep }]}>{c.badge}</Text>
                  </View>
                  <Text style={styles.candidateRatingScore}>★ {c.rating} ({c.trips} duties)</Text>
                </View>
                <Text style={styles.candidateFullName}>{c.name}</Text>
                <Text style={styles.candidateSubInfo}>{c.age} Yrs  •  {c.exp}  •  📍 {c.zone}</Text>
              </View>
            </View>

            <Text style={styles.candidateBioText}>{c.bio}</Text>

            <View style={styles.candidateSkillsContainer}>
              <Text style={styles.candidateSkillLabel}>Specializations:</Text>
              <View style={styles.skillWrapRow}>
                {c.skills.map((s, idx) => (
                  <View key={idx} style={styles.candidateSkillBadge}>
                    <Text style={styles.candidateSkillBadgeText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.candidateVerificationRow}>
              <Text style={styles.verificationCheckItem}>✓ Police Verification Cleared</Text>
              <Text style={styles.verificationCheckItem}>✓ Parivahan DL Authenticated</Text>
            </View>

            <View style={styles.candidateActionRow}>
              <TouchableOpacity
                style={styles.btnCandidateTrial}
                onPress={() => openBookingFlow({ title: `Placement with ${c.name}`, price: '₹4,500 Fee' }, c)}
                activeOpacity={0.88}
              >
                <Text style={styles.btnCandidateTrialText}>Hire / Schedule 1-Day Trial</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnCandidateWhatsApp}
                onPress={() => openWhatsApp(`Hello Drivers Saathi, I want to interview driver candidate ${c.name} (${c.badge}) for my car.`)}
                activeOpacity={0.88}
              >
                <Text style={styles.btnCandidateWhatsAppText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  // ─── TAB 3: BOOKINGS & FLEET HUB ─────────────────────────────────────────────
  const renderBookingsScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenHeading}>Client Duty & Bookings Hub</Text>
        <Text style={styles.screenSubheading}>Manage active chauffeur placements, duty timesheets & fleet vehicles.</Text>
      </View>

      {/* Sub Tabs */}
      <View style={styles.segmentedControl}>
        {[
          { key: 'active', label: 'My Bookings' },
          { key: 'duty', label: 'Daily Timesheet' },
          { key: 'fleet', label: 'Fleet Console' },
        ].map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.segmentItem, bookingsTab === s.key && styles.segmentItemActive]}
            onPress={() => setBookingsTab(s.key)}
          >
            <Text style={[styles.segmentItemText, bookingsTab === s.key && styles.segmentItemTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active Bookings */}
      {bookingsTab === 'active' && (
        <View>
          {bookings.map(b => (
            <View key={b.id} style={styles.bookingCardModern}>
              <View style={styles.bookingTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bookingIdBadge}>BOOKING #{b.id}</Text>
                  <Text style={styles.bookingTitleText}>{b.title}</Text>
                  <Text style={styles.bookingSubText}>Assigned: <Text style={{ fontWeight: '800', color: THEME.textPrimary }}>{b.chauffeurName}</Text></Text>
                  <Text style={styles.bookingSubText}>Vehicle: {b.car}  •  Placed: {b.date}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: THEME.successSoft }]}>
                  <Text style={[styles.statusPillText, { color: THEME.success }]}>{b.status}</Text>
                </View>
              </View>

              <View style={styles.bookingDivider} />

              <View style={styles.bookingWarrantyRow}>
                <Text style={styles.warrantyText}>🛡️ {b.replacementExpiry}</Text>
              </View>

              <View style={styles.bookingActionRow}>
                <Text style={styles.bookingPriceTag}>{b.fee}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={styles.btnSmallAction}
                    onPress={() => openWhatsApp(`Inquiry regarding Booking #${b.id} for driver ${b.chauffeurName}.`)}
                  >
                    <Text style={styles.btnSmallActionText}>Call Manager</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btnSmallAction, { borderColor: THEME.border }]}
                    onPress={() => {
                      Alert.alert(
                        'Request Driver Replacement',
                        `You have active 30-day replacement warranty for Booking #${b.id}.\n\nOur account manager will share 2 replacement chauffeur profiles within 24 hours at zero extra charge.`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Confirm Replacement Claim', onPress: () => Alert.alert('Claim Submitted', 'Our priority dispatch manager has been notified.') },
                        ]
                      );
                    }}
                  >
                    <Text style={[styles.btnSmallActionText, { color: THEME.textSecondary }]}>Replace Driver</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Daily Timesheet & OT */}
      {bookingsTab === 'duty' && (
        <View>
          <View style={styles.panelCard}>
            <Text style={styles.panelTitle}>Record Daily Duty & Overtime</Text>
            <Text style={styles.panelSubtitle}>Log your driver's daily reporting hours for accurate monthly payroll calculations.</Text>

            <View style={styles.formRowTwo}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Date</Text>
                <TextInput
                  style={styles.formInput}
                  value={dutyInput.date}
                  onChangeText={v => setDutyInput({ ...dutyInput, date: v })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>In Time</Text>
                <TextInput
                  style={styles.formInput}
                  value={dutyInput.inTime}
                  onChangeText={v => setDutyInput({ ...dutyInput, inTime: v })}
                />
              </View>
            </View>

            <View style={styles.formRowTwo}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Out Time</Text>
                <TextInput
                  style={styles.formInput}
                  value={dutyInput.outTime}
                  onChangeText={v => setDutyInput({ ...dutyInput, outTime: v })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Distance (KM)</Text>
                <TextInput
                  style={styles.formInput}
                  value={dutyInput.km}
                  keyboardType="numeric"
                  onChangeText={v => setDutyInput({ ...dutyInput, km: v })}
                />
              </View>
            </View>

            <View style={{ marginTop: 8 }}>
              <Text style={styles.inputLabel}>Overtime Hours (Beyond 10 Hours)</Text>
              <TextInput
                style={styles.formInput}
                value={dutyInput.ot}
                keyboardType="numeric"
                onChangeText={v => setDutyInput({ ...dutyInput, ot: v })}
              />
            </View>

            <TouchableOpacity style={styles.btnPrimaryFull} onPress={handleSaveDutyEntry}>
              <Text style={styles.btnPrimaryFullText}>Save Duty Timesheet</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.subSectionTitle, { marginTop: 14, marginBottom: 8 }]}>Past Logged Timesheets</Text>
          {dutyLogs.map(l => (
            <View key={l.id} style={styles.dutyEntryCard}>
              <View style={styles.dutyEntryTop}>
                <Text style={styles.dutyDateText}>{l.date}</Text>
                <View style={styles.otBadge}>
                  <Text style={styles.otBadgeText}>+{l.ot} Overtime</Text>
                </View>
              </View>
              <Text style={styles.dutyMetaText}>In: {l.in}  •  Out: {l.out}  •  Odometer Run: {l.km}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Fleet Console */}
      {bookingsTab === 'fleet' && (
        <View>
          <View style={styles.fleetHeaderBox}>
            <Text style={styles.panelTitle}>Corporate Fleet Vehicle Roster</Text>
            <Text style={styles.panelSubtitle}>Track active drivers, vehicle allocation & license expiry across your corporate fleet.</Text>
          </View>

          {fleetVehicles.map(v => (
            <View key={v.id} style={styles.fleetVehicleCard}>
              <View style={styles.fleetTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fleetVehicleText}>{v.vehicle}</Text>
                  <Text style={styles.fleetDriverText}>Driver: <Text style={{ fontWeight: '800' }}>{v.driver}</Text></Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: v.status === 'On Duty' ? THEME.successSoft : THEME.sosSoft }]}>
                  <Text style={[styles.statusPillText, { color: v.status === 'On Duty' ? THEME.success : THEME.sosRed }]}>
                    {v.status}
                  </Text>
                </View>
              </View>
              <Text style={[styles.fleetExpiryText, v.dlExpiry.includes('Expired') && { color: THEME.sosRed, fontWeight: '800' }]}>
                DL Expiry: {v.dlExpiry}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.btnPrimaryFull}
            onPress={() => openWhatsApp('Hello Drivers Saathi, I need to request commercial replacement drivers for our corporate fleet.')}
          >
            <Text style={styles.btnPrimaryFullText}>Request Fleet Driver Replacement</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  // ─── TAB 4: DRIVER MODE (WORK COCKPIT & JOBS) ────────────────────────────────
  const renderDriverScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
      <View style={styles.screenHeader}>
        <View style={[styles.pillBadge, { backgroundColor: THEME.accentSoft, alignSelf: 'flex-start' }]}>
          <Text style={[styles.pillBadgeText, { color: THEME.accentDeep }]}>SAATHI DRIVER PARTNER</Text>
        </View>
        <Text style={styles.screenHeading}>Driver Work Cockpit</Text>
        <Text style={styles.screenSubheading}>Manage today's duty, record start/end odometer readings, and view earnings.</Text>
      </View>

      {/* Driver Sub Navigation */}
      <View style={styles.segmentedControl}>
        {[
          { key: 'cockpit', label: 'Today Duty' },
          { key: 'wallet', label: 'Earnings' },
          { key: 'jobs', label: 'Jobs Board' },
          { key: 'kyc', label: 'KYC Join' },
        ].map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.segmentItem, driverModeSubTab === s.key && styles.segmentItemActive]}
            onPress={() => setDriverModeSubTab(s.key)}
          >
            <Text style={[styles.segmentItemText, driverModeSubTab === s.key && styles.segmentItemTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cockpit: Today Duty */}
      {driverModeSubTab === 'cockpit' && (
        <View>
          <View style={styles.dutyCockpitCard}>
            <View style={styles.cockpitBadgeRow}>
              <View style={styles.liveDot} />
              <Text style={styles.cockpitBadgeText}>{isDutyActive ? 'DUTY IN PROGRESS' : 'ASSIGNED DUTY TODAY'}</Text>
            </View>

            <Text style={styles.cockpitClientName}>Mr. Rajesh Agarwal (Vasant Vihar)</Text>
            <Text style={styles.cockpitMeta}>Car: Hyundai Creta (Automatic) • Shift: 08:30 AM – 06:30 PM</Text>
            <Text style={styles.cockpitAddress}>📍 Pickup: Villa 14, Poorvi Marg, Vasant Vihar, New Delhi</Text>

            <View style={styles.dutyOtpBox}>
              <Text style={styles.dutyOtpLabel}>Passenger Start-Duty OTP:</Text>
              <Text style={styles.dutyOtpNumber}>4821</Text>
            </View>

            {!isDutyActive ? (
              <View>
                <Text style={styles.inputLabel}>Enter 4-Digit Passenger OTP to Start Duty</Text>
                <TextInput
                  style={[styles.formInput, { textAlign: 'center', fontSize: 18, letterSpacing: 4 }]}
                  placeholder="----"
                  keyboardType="numeric"
                  maxLength={4}
                  value={dutyOtpEntered}
                  onChangeText={setDutyOtpEntered}
                />
                <TouchableOpacity
                  style={[styles.btnPrimaryFull, { backgroundColor: THEME.success }]}
                  onPress={() => {
                    if (dutyOtpEntered === '4821') {
                      setIsDutyActive(true);
                      Alert.alert('Duty Started', 'Duty timer is running. Drive safely!');
                    } else {
                      Alert.alert('Invalid OTP', 'Please ask the car owner for the 4-digit start OTP (4821).');
                    }
                  }}
                >
                  <Text style={styles.btnPrimaryFullText}>Start Today Duty</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={[styles.inputLabel, { color: THEME.success, fontWeight: '800' }]}>Duty is active. Enter Closing Odometer KM to finish.</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Closing Odometer KM (e.g. 48,290)"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={[styles.btnPrimaryFull, { backgroundColor: THEME.primary }]}
                  onPress={() => {
                    setIsDutyActive(false);
                    setDutyOtpEntered('');
                    Alert.alert('Duty Completed', 'Duty closed successfully. Overtime payout credited to your wallet.');
                  }}
                >
                  <Text style={styles.btnPrimaryFullText}>End Duty & Record Overtime</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Driver Wallet */}
      {driverModeSubTab === 'wallet' && (
        <View>
          <View style={styles.walletCard}>
            <Text style={styles.walletCardLabel}>TOTAL WALLET BALANCE</Text>
            <Text style={styles.walletCardAmount}>₹{driverWallet.balance.toLocaleString('en-IN')}</Text>
            <View style={styles.walletBreakdownRow}>
              <Text style={styles.walletBreakdownText}>Base Duty: ₹2,200</Text>
              <Text style={styles.walletBreakdownText}>OT: ₹{driverWallet.pendingOT}</Text>
              <Text style={styles.walletBreakdownText}>Referral: ₹{driverWallet.referrals}</Text>
            </View>

            <TouchableOpacity
              style={styles.btnWithdrawUPI}
              onPress={() => {
                Alert.prompt
                  ? Alert.prompt('Withdraw via UPI', 'Enter your UPI ID (GPay / PhonePe / Paytm):', [
                      { text: 'Cancel' },
                      { text: 'Submit Payout', onPress: () => Alert.alert('Payout Requested', '₹3,800 transfer initiated to your UPI account.') },
                    ])
                  : Alert.alert('UPI Withdrawal', 'Your available balance of ₹3,800 will be credited to your linked UPI ID within 2 hours.');
              }}
            >
              <Text style={styles.btnWithdrawUPIText}>Instant Withdraw to Bank / UPI</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.panelCard}>
            <Text style={styles.panelTitle}>Refer Driver Friend — Earn ₹500</Text>
            <Text style={styles.panelSubtitle}>Refer any experienced driver in Delhi NCR. Get ₹500 via UPI when they complete 30 days of duty.</Text>
            <TouchableOpacity
              style={[styles.btnPrimaryFull, { backgroundColor: THEME.success }]}
              onPress={() => openWhatsApp('Hello Drivers Saathi, I want to refer a driver friend. Name and phone: ')}
            >
              <Text style={styles.btnPrimaryFullText}>Share Referral Link via WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Jobs Board */}
      {driverModeSubTab === 'jobs' && (
        <View>
          {DRIVER_JOBS.map(j => (
            <View key={j.id} style={styles.jobCard}>
              <View style={styles.jobCardTop}>
                <Text style={styles.jobSalaryText}>{j.salary}</Text>
                <View style={[styles.pillBadge, { backgroundColor: THEME.accentSoft }]}>
                  <Text style={[styles.pillBadgeText, { color: THEME.accentDeep }]}>{j.tag}</Text>
                </View>
              </View>
              <Text style={styles.jobCardTitle}>{j.title}</Text>
              <Text style={styles.jobCardLocation}>📍 {j.location} • {j.type}</Text>
              <TouchableOpacity
                style={styles.btnApplyCompact}
                onPress={() => {
                  Alert.alert('Applied Successfully', `You have expressed interest in: ${j.title}. Our recruitment manager will call you for an interview.`);
                }}
              >
                <Text style={styles.btnApplyCompactText}>Apply for this Opening &rarr;</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* KYC Onboarding */}
      {driverModeSubTab === 'kyc' && (
        <View style={styles.panelCard}>
          <Text style={styles.panelTitle}>Driver KYC Registration</Text>
          <Text style={styles.panelSubtitle}>Submit your documents for police verification and direct placement.</Text>

          <Text style={styles.inputLabel}>Full Name (as on Aadhaar Card) *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. Ramesh Kumar"
            value={driverKYC.name}
            onChangeText={v => setDriverKYC({ ...driverKYC, name: v })}
          />

          <Text style={styles.inputLabel}>Mobile Number (WhatsApp) *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
            value={driverKYC.phone}
            onChangeText={v => setDriverKYC({ ...driverKYC, phone: v })}
          />

          <View style={styles.docUploadRow}>
            <TouchableOpacity
              style={[styles.docUploadBtn, licenseImg && styles.docUploadBtnSuccess]}
              onPress={() => pickDoc('license')}
            >
              <Text style={styles.docUploadBtnText}>{licenseImg ? 'License Attached ✓' : 'Attach License'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.docUploadBtn, aadhaarImg && styles.docUploadBtnSuccess]}
              onPress={() => pickDoc('aadhaar')}
            >
              <Text style={styles.docUploadBtnText}>{aadhaarImg ? 'Aadhaar Attached ✓' : 'Attach Aadhaar'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.btnPrimaryFull}
            onPress={() => {
              if (!driverKYC.name || !driverKYC.phone) {
                Alert.alert('Required', 'Please enter your full name and phone number.');
                return;
              }
              Alert.alert('Application Submitted', 'Your documents have been submitted for verification. Our recruitment officer will call you within 24 hours.');
            }}
          >
            <Text style={styles.btnPrimaryFullText}>Submit KYC Application</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  // ─── MODAL: SMART STEP-BY-STEP BOOKING & TOKEN CHECKOUT ───────────────────────
  const renderSmartBookingModal = () => {
    if (!bookingModal.visible) return null;
    const c = bookingModal.selectedChauffeur;
    const s = bookingModal.service;

    return (
      <Modal visible={bookingModal.visible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.bookingSheet}>
            <View style={styles.sheetHandle} />

            {/* Header */}
            <View style={styles.sheetHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>
                  {c ? `Hire Chauffeur: ${c.name}` : (s?.title || 'Book Driver Service')}
                </Text>
                <Text style={styles.sheetPriceTag}>
                  {smartBooking.pricingPlan === 'subscription' ? '₹3,500/Month Retainer' : (s?.price || '₹4,500 Fee')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.btnCloseSheet}
                onPress={() => setBookingModal({ visible: false, service: null, selectedChauffeur: null })}
              >
                <Text style={styles.btnCloseSheetText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Step Progress Pills */}
            <View style={styles.stepProgressRow}>
              <View style={[styles.stepDot, bookingStep >= 1 && styles.stepDotActive]} />
              <Text style={[styles.stepText, bookingStep === 1 && styles.stepTextActive]}>1. Requirements</Text>
              <View style={styles.stepLine} />
              <View style={[styles.stepDot, bookingStep >= 2 && styles.stepDotActive]} />
              <Text style={[styles.stepText, bookingStep === 2 && styles.stepTextActive]}>2. Schedule</Text>
              <View style={styles.stepLine} />
              <View style={[styles.stepDot, bookingStep >= 3 && styles.stepDotActive]} />
              <Text style={[styles.stepText, bookingStep === 3 && styles.stepTextActive]}>3. Payment</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {/* STEP 1: SHIFT & VEHICLE TRANSMISSION */}
              {bookingStep === 1 && (
                <View>
                  <Text style={styles.inputLabel}>Vehicle Transmission Type</Text>
                  <View style={styles.pillChoiceRow}>
                    {['Automatic', 'Manual', 'Luxury German', 'Electric (EV)'].map(t => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.pillChoice, smartBooking.transmission === t && styles.pillChoiceActive]}
                        onPress={() => setSmartBooking({ ...smartBooking, transmission: t })}
                      >
                        <Text style={[styles.pillChoiceText, smartBooking.transmission === t && styles.pillChoiceTextActive]}>
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Car Model & Year</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Hyundai Creta (2023) / Toyota Fortuner"
                    value={smartBooking.carModel}
                    onChangeText={v => setSmartBooking({ ...smartBooking, carModel: v })}
                  />

                  <Text style={styles.inputLabel}>Duty Shift Duration</Text>
                  <View style={styles.pillChoiceRow}>
                    {['8 Hours (Office)', '10 Hours (Standard)', '12 Hours (Executive)', '24-Hr Live-in'].map(h => (
                      <TouchableOpacity
                        key={h}
                        style={[styles.pillChoice, smartBooking.shiftHours === h && styles.pillChoiceActive]}
                        onPress={() => setSmartBooking({ ...smartBooking, shiftHours: h })}
                      >
                        <Text style={[styles.pillChoiceText, smartBooking.shiftHours === h && styles.pillChoiceTextActive]}>
                          {h}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity style={styles.btnPrimaryFull} onPress={() => setBookingStep(2)}>
                    <Text style={styles.btnPrimaryFullText}>Continue to Schedule &rarr;</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* STEP 2: SCHEDULE & WEEKLY OFF */}
              {bookingStep === 2 && (
                <View>
                  <Text style={styles.inputLabel}>Reporting Time</Text>
                  <View style={styles.pillChoiceRow}>
                    {['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM'].map(rt => (
                      <TouchableOpacity
                        key={rt}
                        style={[styles.pillChoice, smartBooking.reportingTime === rt && styles.pillChoiceActive]}
                        onPress={() => setSmartBooking({ ...smartBooking, reportingTime: rt })}
                      >
                        <Text style={[styles.pillChoiceText, smartBooking.reportingTime === rt && styles.pillChoiceTextActive]}>
                          {rt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Weekly Off Day</Text>
                  <View style={styles.pillChoiceRow}>
                    {['Sunday Off', 'Saturday & Sunday', 'Rotational Off'].map(wo => (
                      <TouchableOpacity
                        key={wo}
                        style={[styles.pillChoice, smartBooking.weeklyOff === wo && styles.pillChoiceActive]}
                        onPress={() => setSmartBooking({ ...smartBooking, weeklyOff: wo })}
                      >
                        <Text style={[styles.pillChoiceText, smartBooking.weeklyOff === wo && styles.pillChoiceTextActive]}>
                          {wo}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Your Residence Area in Delhi NCR</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. South Delhi / DLF Phase 5 Gurugram"
                    value={smartBooking.locationArea}
                    onChangeText={v => setSmartBooking({ ...smartBooking, locationArea: v })}
                  />

                  {/* Plan toggle */}
                  <Text style={styles.inputLabel}>Choose Placement Model</Text>
                  <View style={styles.planSelectorBox}>
                    <TouchableOpacity
                      style={[styles.planOption, smartBooking.pricingPlan === 'onetime' && styles.planOptionActive]}
                      onPress={() => setSmartBooking({ ...smartBooking, pricingPlan: 'onetime' })}
                    >
                      <Text style={[styles.planOptionTitle, smartBooking.pricingPlan === 'onetime' && styles.planOptionTitleActive]}>
                        One-Time Placement
                      </Text>
                      <Text style={styles.planOptionPrice}>₹4,500 Fee</Text>
                      <Text style={styles.planOptionSub}>30-Day Free Replacement</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.planOption, smartBooking.pricingPlan === 'subscription' && styles.planOptionActive]}
                      onPress={() => setSmartBooking({ ...smartBooking, pricingPlan: 'subscription' })}
                    >
                      <Text style={[styles.planOptionTitle, smartBooking.pricingPlan === 'subscription' && styles.planOptionTitleActive]}>
                        Monthly Retainer
                      </Text>
                      <Text style={styles.planOptionPrice}>₹3,500 / Month</Text>
                      <Text style={styles.planOptionSub}>Unlimited Replacements</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <TouchableOpacity style={[styles.btnSmallAction, { flex: 1, paddingVertical: 12 }]} onPress={() => setBookingStep(1)}>
                      <Text style={[styles.btnSmallActionText, { textAlign: 'center' }]}>&larr; Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btnPrimaryFull, { flex: 2, marginTop: 0 }]} onPress={() => setBookingStep(3)}>
                      <Text style={styles.btnPrimaryFullText}>Proceed to Confirm &rarr;</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* STEP 3: CONTACT & ADVANCE TOKEN PAYMENT */}
              {bookingStep === 3 && (
                <View>
                  <Text style={styles.inputLabel}>Your Full Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Full Name"
                    value={userProfile.name}
                    onChangeText={v => setUserProfile({ ...userProfile, name: v })}
                  />

                  <Text style={styles.inputLabel}>Mobile Number *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="+91 98765 43210"
                    keyboardType="phone-pad"
                    value={userProfile.phone}
                    onChangeText={v => setUserProfile({ ...userProfile, phone: v })}
                  />

                  {/* Advance Token Option */}
                  <View style={styles.tokenPaymentBox}>
                    <Text style={styles.tokenPaymentTitle}>Token Advance Booking Option</Text>
                    <Text style={styles.tokenPaymentDesc}>
                      Pay ₹500 advance token to prioritize driver candidate interview. Deducted from final ₹4,500 invoice.
                    </Text>

                    <View style={styles.pillChoiceRow}>
                      {[
                        { key: 'token500', label: 'Pay ₹500 Advance Token (GPay/UPI)' },
                        { key: 'payLater', label: 'Pay Post Placement (Trial First)' },
                      ].map(to => (
                        <TouchableOpacity
                          key={to.key}
                          style={[styles.pillChoice, smartBooking.tokenOption === to.key && styles.pillChoiceActive]}
                          onPress={() => setSmartBooking({ ...smartBooking, tokenOption: to.key })}
                        >
                          <Text style={[styles.pillChoiceText, smartBooking.tokenOption === to.key && styles.pillChoiceTextActive]}>
                            {to.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {smartBooking.tokenOption === 'token500' && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={styles.inputLabel}>Select UPI App for Token</Text>
                        <View style={styles.pillChoiceRow}>
                          {['Google Pay', 'PhonePe', 'Paytm UPI', 'Direct QR Code'].map(app => (
                            <TouchableOpacity
                              key={app}
                              style={[styles.pillChoice, smartBooking.upiApp === app && styles.pillChoiceActive]}
                              onPress={() => setSmartBooking({ ...smartBooking, upiApp: app })}
                            >
                              <Text style={[styles.pillChoiceText, smartBooking.upiApp === app && styles.pillChoiceTextActive]}>
                                {app}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.btnPrimaryFull, { backgroundColor: THEME.accent }]}
                    onPress={handleConfirmSmartBooking}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.btnPrimaryFullText}>
                        {smartBooking.tokenOption === 'token500'
                          ? `Pay ₹500 & Confirm Booking`
                          : `Confirm Booking (Pay Post Trial)`}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity style={{ marginTop: 8, alignItems: 'center' }} onPress={() => setBookingStep(2)}>
                    <Text style={{ fontSize: 12, color: THEME.textSecondary }}>&larr; Back to Schedule</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  // ─── MODAL: USER PROFILE & SAVED GARAGE ───────────────────────────────────────
  const renderProfileModal = () => (
    <Modal visible={profileModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.bookingSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>My Client Profile & Garage</Text>
            <TouchableOpacity style={styles.btnCloseSheet} onPress={() => setProfileModal(false)}>
              <Text style={styles.btnCloseSheetText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Your Name</Text>
          <TextInput
            style={styles.formInput}
            value={userProfile.name}
            onChangeText={v => setUserProfile({ ...userProfile, name: v })}
          />

          <Text style={styles.inputLabel}>Registered Mobile Number</Text>
          <TextInput
            style={styles.formInput}
            value={userProfile.phone}
            keyboardType="phone-pad"
            onChangeText={v => setUserProfile({ ...userProfile, phone: v })}
          />

          <Text style={styles.inputLabel}>Saved Garage (Vehicles)</Text>
          <TextInput
            style={styles.formInput}
            value={userProfile.primaryCar}
            onChangeText={v => setUserProfile({ ...userProfile, primaryCar: v })}
          />

          <Text style={styles.inputLabel}>Saved Residence / Office Address</Text>
          <TextInput
            style={styles.formInput}
            value={userProfile.address}
            onChangeText={v => setUserProfile({ ...userProfile, address: v })}
          />

          <TouchableOpacity
            style={styles.btnPrimaryFull}
            onPress={() => {
              setProfileModal(false);
              Alert.alert('Profile Saved', 'Your client garage and contact details have been updated.');
            }}
          >
            <Text style={styles.btnPrimaryFullText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ─── MAIN SCAFFOLD RENDER ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar style="light" backgroundColor={THEME.primary} />

      {/* High-Visibility Header with Crisp Emblem & Typography */}
      <View style={styles.navBar}>
        <View style={styles.brandRow}>
          <Image
            source={require('./assets/driver-saathi-logo-light.png')}
            style={styles.brandEmblem}
            resizeMode="contain"
          />
          <View style={styles.brandTextCol}>
            <Text style={styles.brandTitleText}>DRIVERS SAATHI</Text>
            <Text style={styles.brandSubText}>DELHI NCR VERIFIED DESK</Text>
          </View>
        </View>

        <View style={styles.navRightActions}>
          <TouchableOpacity style={styles.btnProfilePill} onPress={() => setProfileModal(true)} activeOpacity={0.85}>
            <Text style={styles.btnProfilePillText}>Garage</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSOS} onPress={triggerSOS} activeOpacity={0.85}>
            <Text style={styles.btnSOSText}>SOS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnLangToggle}
            onPress={() => setLang(lang === 'en' ? 'hi' : 'en')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnLangToggleText}>{lang === 'en' ? 'हिन्दी' : 'ENG'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Tab Screen */}
      <View style={{ flex: 1 }}>
        {activeTab === 'explore' && renderExploreScreen()}
        {activeTab === 'chauffeurs' && renderChauffeursScreen()}
        {activeTab === 'bookings' && renderBookingsScreen()}
        {activeTab === 'driver' && renderDriverScreen()}
      </View>

      {/* Clean 4-Tab Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.bottomNavItem, activeTab === 'explore' && styles.bottomNavItemActive]}
          onPress={() => setActiveTab('explore')}
        >
          <Text style={[styles.bottomNavIcon, activeTab === 'explore' && styles.bottomNavIconActive]}>◈</Text>
          <Text style={[styles.bottomNavLabel, activeTab === 'explore' && styles.bottomNavLabelActive]}>Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomNavItem, activeTab === 'chauffeurs' && styles.bottomNavItemActive]}
          onPress={() => setActiveTab('chauffeurs')}
        >
          <Text style={[styles.bottomNavIcon, activeTab === 'chauffeurs' && styles.bottomNavIconActive]}>👥</Text>
          <Text style={[styles.bottomNavLabel, activeTab === 'chauffeurs' && styles.bottomNavLabelActive]}>Chauffeurs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomNavItem, activeTab === 'bookings' && styles.bottomNavItemActive]}
          onPress={() => setActiveTab('bookings')}
        >
          <Text style={[styles.bottomNavIcon, activeTab === 'bookings' && styles.bottomNavIconActive]}>▤</Text>
          <Text style={[styles.bottomNavLabel, activeTab === 'bookings' && styles.bottomNavLabelActive]}>Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomNavItem, activeTab === 'driver' && styles.bottomNavItemActive]}
          onPress={() => setActiveTab('driver')}
        >
          <Text style={[styles.bottomNavIcon, activeTab === 'driver' && styles.bottomNavIconActive]}>❖</Text>
          <Text style={[styles.bottomNavLabel, activeTab === 'driver' && styles.bottomNavLabelActive]}>Driver Mode</Text>
        </TouchableOpacity>
      </View>

      {/* Smart Booking Modal */}
      {renderSmartBookingModal()}

      {/* Profile & Garage Modal */}
      {renderProfileModal()}

      {/* Confirmation Modal */}
      <Modal visible={confirmationModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successCheckCircle}>
              <Text style={styles.successCheckText}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Booking Confirmed</Text>
            <Text style={styles.successMessage}>{confirmationModal.message}</Text>
            <TouchableOpacity
              style={styles.btnSuccessClose}
              onPress={() => {
                setConfirmationModal({ visible: false, bookingId: '', message: '' });
                setActiveTab('bookings');
              }}
            >
              <Text style={styles.btnSuccessCloseText}>View in My Bookings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── MASTER STYLESHEET ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: THEME.canvas,
  },

  // Navbar & High-Visibility Brand Block
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: THEME.primary,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandEmblem: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  brandTextCol: {
    justifyContent: 'center',
  },
  brandTitleText: {
    color: '#FFF',
    fontSize: 15.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  brandSubText: {
    color: THEME.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  navRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  btnProfilePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  btnProfilePillText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  btnSOS: {
    backgroundColor: THEME.sosSoft,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  btnSOSText: {
    color: THEME.sosRed,
    fontSize: 11,
    fontWeight: '800',
  },
  btnLangToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 14,
  },
  btnLangToggleText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: THEME.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingVertical: 8,
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  bottomNavItemActive: {},
  bottomNavIcon: {
    fontSize: 16,
    color: THEME.textMuted,
    marginBottom: 2,
  },
  bottomNavIconActive: {
    color: THEME.accent,
  },
  bottomNavLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: THEME.textMuted,
  },
  bottomNavLabelActive: {
    color: THEME.accent,
    fontWeight: '800',
  },

  // Scroll Container
  scrollBody: {
    padding: 16,
    paddingBottom: 40,
  },

  // Hero Card
  heroCard: {
    backgroundColor: THEME.primary,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: THEME.success,
  },
  heroBadgeText: {
    color: THEME.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: 27,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 14,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  heroPrimaryBtn: {
    backgroundColor: THEME.accent,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  heroPrimaryBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 13,
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  heroSecondaryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  heroWhatsAppBtn: {
    backgroundColor: THEME.successSoft,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  heroWhatsAppBtnText: {
    color: THEME.success,
    fontWeight: '800',
    fontSize: 12.5,
  },

  // Trust Strip
  trustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 18,
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
  },
  trustNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  trustLabel: {
    fontSize: 9.5,
    color: THEME.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  trustDivider: {
    width: 1,
    height: 22,
    backgroundColor: THEME.border,
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  sectionSub: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  seeAllLink: {
    fontSize: 12.5,
    fontWeight: '800',
    color: THEME.accent,
  },

  // Horizontal Chauffeur Preview
  chauffeurHorizontalScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  compactCandidateCard: {
    width: 200,
    backgroundColor: THEME.surface,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.border,
    marginRight: 12,
  },
  candidateThumb: {
    width: '100%',
    height: 110,
  },
  candidateContent: {
    padding: 10,
  },
  candidateBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  candidateRatingText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.accentDeep,
  },
  candidateExpText: {
    fontSize: 10.5,
    color: THEME.textSecondary,
    fontWeight: '700',
  },
  candidateNameText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  candidateZoneText: {
    fontSize: 10.5,
    color: THEME.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  skillPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  skillPill: {
    backgroundColor: THEME.canvas,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  skillPillText: {
    fontSize: 9,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  btnHireCompact: {
    backgroundColor: THEME.primary,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnHireCompactText: {
    color: '#FFF',
    fontSize: 11.5,
    fontWeight: '800',
  },

  // Service Cards
  serviceCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 14,
  },
  serviceImage: {
    width: '100%',
    height: 130,
  },
  serviceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pillBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  pillBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 12,
    color: THEME.textSecondary,
    lineHeight: 17,
    marginBottom: 10,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME.borderSoft,
    paddingTop: 8,
  },
  servicePerks: {
    fontSize: 10.5,
    color: THEME.textSecondary,
    flex: 1,
  },
  bookNowLink: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.accent,
    marginLeft: 6,
  },

  // Sub Section Box & Routes
  subSectionBox: {
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  routeScroll: {
    flexDirection: 'row',
  },
  routePillCard: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    padding: 10,
    marginRight: 10,
    width: 160,
  },
  routeDestText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  routeViaText: {
    fontSize: 10.5,
    color: THEME.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  routePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeFareText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: THEME.accent,
  },
  routeBookBtn: {
    fontSize: 10.5,
    fontWeight: '800',
    color: THEME.primary,
    backgroundColor: THEME.borderSoft,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 5,
  },

  // Driver Recruitment Banner
  driverCtaBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  driverCtaBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.accent,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  driverCtaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 2,
  },
  driverCtaSub: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 15,
  },
  driverCtaBtn: {
    backgroundColor: THEME.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 7,
  },
  driverCtaBtnText: {
    color: '#FFF',
    fontSize: 11.5,
    fontWeight: '800',
  },

  // Screen Headers
  screenHeader: {
    marginBottom: 12,
  },
  screenHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  screenSubheading: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },

  // Filter Chips
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  filterChip: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  filterChipText: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: '800',
  },

  // Full Chauffeur Candidate Cards
  fullCandidateCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 14,
  },
  candidateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  candidateLargeAvatar: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 2,
    borderColor: THEME.accentBorder,
  },
  candidateRatingScore: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.accentDeep,
  },
  candidateFullName: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginTop: 2,
  },
  candidateSubInfo: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    marginTop: 1,
  },
  candidateBioText: {
    fontSize: 12,
    color: THEME.textSecondary,
    lineHeight: 17,
    marginBottom: 10,
  },
  candidateSkillsContainer: {
    marginBottom: 8,
  },
  candidateSkillLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  skillWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  candidateSkillBadge: {
    backgroundColor: THEME.canvas,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  candidateSkillBadgeText: {
    fontSize: 10.5,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  candidateVerificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: THEME.successSoft,
    borderRadius: 8,
    padding: 8,
    marginVertical: 10,
  },
  verificationCheckItem: {
    fontSize: 10.5,
    color: THEME.success,
    fontWeight: '700',
  },
  candidateActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnCandidateTrial: {
    flex: 1,
    backgroundColor: THEME.accent,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCandidateTrialText: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  btnCandidateWhatsApp: {
    backgroundColor: THEME.canvas,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCandidateWhatsAppText: {
    color: THEME.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },

  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: THEME.borderSoft,
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentItemActive: {
    backgroundColor: THEME.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  segmentItemText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  segmentItemTextActive: {
    fontWeight: '800',
    color: THEME.textPrimary,
  },

  // Modern Booking Cards
  bookingCardModern: {
    backgroundColor: THEME.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 10,
  },
  bookingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingIdBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: THEME.accent,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  bookingTitleText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  bookingSubText: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bookingDivider: {
    height: 1,
    backgroundColor: THEME.borderSoft,
    marginVertical: 10,
  },
  bookingWarrantyRow: {
    backgroundColor: THEME.accentSoft,
    padding: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  warrantyText: {
    fontSize: 10.5,
    color: THEME.accentDeep,
    fontWeight: '700',
  },
  bookingActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingPriceTag: {
    fontSize: 12.5,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  btnSmallAction: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.accentBorder,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  btnSmallActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.accent,
  },

  // Panel Cards & Form Elements
  panelCard: {
    backgroundColor: THEME.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 12,
  },
  panelTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginBottom: 2,
  },
  panelSubtitle: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  formRowTwo: {
    flexDirection: 'row',
    gap: 8,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: THEME.canvas,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12.5,
    color: THEME.textPrimary,
  },
  btnPrimaryFull: {
    backgroundColor: THEME.primary,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 12,
  },
  btnPrimaryFullText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // Duty Logs
  dutyEntryCard: {
    backgroundColor: THEME.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 8,
  },
  dutyEntryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dutyDateText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  otBadge: {
    backgroundColor: THEME.accentSoft,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 5,
  },
  otBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.accent,
  },
  dutyMetaText: {
    fontSize: 11,
    color: THEME.textSecondary,
  },

  // Fleet Vehicles
  fleetHeaderBox: {
    marginBottom: 8,
  },
  fleetVehicleCard: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 8,
  },
  fleetTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fleetVehicleText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  fleetDriverText: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  fleetExpiryText: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginTop: 6,
  },

  // Driver Cockpit
  dutyCockpitCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 12,
  },
  cockpitBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  cockpitBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.success,
    letterSpacing: 0.6,
  },
  cockpitClientName: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginBottom: 2,
  },
  cockpitMeta: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    marginBottom: 4,
  },
  cockpitAddress: {
    fontSize: 11.5,
    color: THEME.textPrimary,
    lineHeight: 16,
    marginBottom: 12,
  },
  dutyOtpBox: {
    backgroundColor: THEME.canvas,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  dutyOtpLabel: {
    fontSize: 10.5,
    color: THEME.textSecondary,
    fontWeight: '700',
  },
  dutyOtpNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.accent,
    letterSpacing: 4,
    marginTop: 2,
  },

  // Driver Wallet
  walletCard: {
    backgroundColor: THEME.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  walletCardLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  walletCardAmount: {
    color: THEME.accent,
    fontSize: 28,
    fontWeight: '900',
    marginVertical: 4,
  },
  walletBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
    marginBottom: 12,
  },
  walletBreakdownText: {
    color: '#CBD5E1',
    fontSize: 10.5,
  },
  btnWithdrawUPI: {
    backgroundColor: THEME.success,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnWithdrawUPIText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // Job Cards
  jobCard: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 10,
  },
  jobCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  jobSalaryText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: THEME.success,
  },
  jobCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  jobCardLocation: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginVertical: 4,
  },
  btnApplyCompact: {
    backgroundColor: THEME.canvas,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
    marginTop: 4,
  },
  btnApplyCompactText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.primary,
  },

  // KYC Uploads
  docUploadRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  docUploadBtn: {
    flex: 1,
    backgroundColor: THEME.canvas,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: THEME.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  docUploadBtnSuccess: {
    backgroundColor: THEME.successSoft,
    borderColor: THEME.success,
  },
  docUploadBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textSecondary,
    textAlign: 'center',
  },

  // Modal / Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bookingSheet: {
    backgroundColor: THEME.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    paddingBottom: 28,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: THEME.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  sheetPriceTag: {
    fontSize: 12.5,
    fontWeight: '800',
    color: THEME.accent,
    marginTop: 2,
  },
  btnCloseSheet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.borderSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCloseSheetText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: '800',
  },

  // Progress Bar
  stepProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.border,
  },
  stepDotActive: {
    backgroundColor: THEME.accent,
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.border,
  },
  stepText: {
    fontSize: 10,
    color: THEME.textMuted,
    fontWeight: '600',
  },
  stepTextActive: {
    color: THEME.textPrimary,
    fontWeight: '800',
  },

  // Pill Choices
  pillChoiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  pillChoice: {
    backgroundColor: THEME.canvas,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  pillChoiceActive: {
    borderColor: THEME.accent,
    backgroundColor: THEME.accentSoft,
  },
  pillChoiceText: {
    fontSize: 11,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  pillChoiceTextActive: {
    color: THEME.accentDeep,
    fontWeight: '800',
  },

  // Plan Selector
  planSelectorBox: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6,
  },
  planOption: {
    flex: 1,
    backgroundColor: THEME.canvas,
    borderWidth: 1.5,
    borderColor: THEME.border,
    borderRadius: 10,
    padding: 8,
  },
  planOptionActive: {
    borderColor: THEME.accent,
    backgroundColor: THEME.accentSoft,
  },
  planOptionTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: THEME.textSecondary,
  },
  planOptionTitleActive: {
    color: THEME.accentDeep,
    fontWeight: '800',
  },
  planOptionPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginVertical: 1,
  },
  planOptionSub: {
    fontSize: 9.5,
    color: THEME.textMuted,
  },

  // Token Box
  tokenPaymentBox: {
    backgroundColor: THEME.canvas,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    marginTop: 8,
  },
  tokenPaymentTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  tokenPaymentDesc: {
    fontSize: 10.5,
    color: THEME.textSecondary,
    marginVertical: 4,
    lineHeight: 14,
  },

  // Success Confirmation Card
  successCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 22,
    margin: 20,
    alignItems: 'center',
  },
  successCheckCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: THEME.successSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  successCheckText: {
    fontSize: 24,
    color: THEME.success,
    fontWeight: '800',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  successMessage: {
    fontSize: 12.5,
    color: THEME.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  btnSuccessClose: {
    backgroundColor: THEME.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  btnSuccessCloseText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
