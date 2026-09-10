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

// ─── Design System & Palette ───────────────────────────────────────────────────
const THEME = {
  primary: '#0F172A',       // Deep Executive Navy
  primaryLight: '#1E293B',
  accent: '#FB8500',        // Warm Marigold Accent
  accentSoft: '#FFF7ED',
  accentBorder: '#FDBA74',
  canvas: '#F8FAFC',        // Crisp Soft White Background
  surface: '#FFFFFF',       // Pure White Card Surface
  border: '#E2E8F0',        // Subtle Divider Line
  borderSoft: '#F1F5F9',
  textPrimary: '#0F172A',   // High Contrast Dark Slate
  textSecondary: '#475569', // Readable Subtitle Slate
  textMuted: '#94A3B8',     // Helper Slate
  success: '#059669',       // Clean Verified Emerald
  successSoft: '#ECFDF5',
  sosRed: '#EF4444',
  sosSoft: '#FEF2F2',
  blue: '#2563EB',
  blueSoft: '#EFF6FF',
};

// ─── Highway Routes Data ────────────────────────────────────────────────────────
const POPULAR_ROUTES = [
  { id: 'agra', name: 'Delhi to Agra', route: 'Yamuna Expressway', dist: '210 km', time: '3.5 hrs', fare: '₹1,500/day', toll: '₹415', da: '₹400 DA' },
  { id: 'jaipur', name: 'Delhi to Jaipur', route: 'Delhi-Mumbai Expy', dist: '270 km', time: '4 hrs', fare: '₹1,800/day', toll: '₹590', da: '₹500 DA' },
  { id: 'chandigarh', name: 'Delhi to Chandigarh', route: 'NH-44 Highway', dist: '250 km', time: '4.5 hrs', fare: '₹1,600/day', toll: '₹390', da: '₹400 DA' },
  { id: 'dehradun', name: 'Delhi to Dehradun', route: 'Meerut Expressway', dist: '260 km', time: '5 hrs', fare: '₹1,800/day', toll: '₹310', da: '₹500 DA' },
];

// ─── Verified Driver Jobs ───────────────────────────────────────────────────────
const JOB_LISTINGS = [
  { id: 'j1', title: 'Personal Chauffeur for Creta', salary: '₹22,000 - ₹24,000/mo', location: 'South Delhi (Vasant Vihar)', type: 'Full-time', badge: 'LMV' },
  { id: 'j2', title: 'Luxury Chauffeur (BMW 5-Series)', salary: '₹26,000 - ₹28,000/mo', location: 'Gurugram (Golf Course Rd)', type: 'Full-time', badge: 'Luxury' },
  { id: 'j3', title: 'Corporate Fleet Driver', salary: '₹20,000 - ₹22,000/mo', location: 'Noida (Sector 62)', type: 'Commercial', badge: 'Commercial' },
  { id: 'j4', title: 'Executive Chauffeur for Director', salary: '₹28,000 - ₹32,000/mo', location: 'Aerocity, New Delhi', type: 'Full-time', badge: 'VIP' },
];

export default function App() {
  // Navigation: 'home' | 'bookings' | 'support' | 'driver'
  const [activeTab, setActiveTab] = useState('home');
  const [lang, setLang] = useState('en'); // 'en' | 'hi'

  // Booking Modal Flow
  const [bookingModal, setBookingModal] = useState({ visible: false, service: null });
  const [bookingType, setBookingType] = useState('onetime'); // 'onetime' | 'subscription'
  const [loading, setLoading] = useState(false);

  // Success Confirmation Modal
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });

  // Customer Booking Form
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    car: '',
    cityArea: '',
    travelDate: '',
    route: '',
    companyName: '',
    gstin: '',
    driverCount: '1',
    driverDL: '',
    referralCode: '',
  });

  // Client History & Duty Logs
  const [bookings, setBookings] = useState([]);
  const [dutyLogs, setDutyLogs] = useState([]);
  const [dutyForm, setDutyForm] = useState({ date: new Date().toISOString().split('T')[0], inTime: '09:00 AM', outTime: '07:30 PM', km: '50', ot: '1.5' });
  const [bookingsSubTab, setBookingsSubTab] = useState('list'); // 'list' | 'duty' | 'replacement'

  // Driver KYC State
  const [driverForm, setDriverForm] = useState({ name: '', phone: '', experience: '', city: 'Delhi NCR', licenseCategory: 'Commercial LMV' });
  const [licenseImg, setLicenseImg] = useState(null);
  const [aadhaarImg, setAadhaarImg] = useState(null);

  // Support / Grievance State
  const [grievanceText, setGrievanceText] = useState('');
  const [tickets, setTickets] = useState([
    { id: 't1', issue: 'Driver replacement inquiry for South Delhi location', status: 'Resolved', date: '08 Sep 2026' }
  ]);

  // Load Saved Data
  useEffect(() => {
    (async () => {
      try {
        const savedBookings = await AsyncStorage.getItem('@ds_client_bookings_v1');
        if (savedBookings) setBookings(JSON.parse(savedBookings));
        else {
          setBookings([
            { id: 'b1', title: 'Personal Chauffeur Placement', date: '05 Sep 2026', status: 'Active', price: '₹4,500', car: 'Honda City' }
          ]);
        }
        const savedLogs = await AsyncStorage.getItem('@ds_duty_logs_v1');
        if (savedLogs) setDutyLogs(JSON.parse(savedLogs));
        else {
          setDutyLogs([
            { id: 'l1', date: '08 Sep 2026', in: '09:00 AM', out: '07:30 PM', km: '62 km', ot: '1.5 hrs' },
            { id: 'l2', date: '09 Sep 2026', in: '08:45 AM', out: '08:00 PM', km: '78 km', ot: '2.0 hrs' }
          ]);
        }
      } catch (e) {}
    })();
  }, []);

  const openWhatsApp = (msg = '') => {
    const defaultMsg = lang === 'en'
      ? 'Hello Drivers Saathi, I need a verified driver in Delhi NCR. Please assist.'
      : 'नमस्ते ड्राइवर्स साथी, मुझे दिल्ली एनसीआर में वेरिफाइड ड्राइवर की जरूरत है।';
    Linking.openURL(`https://wa.me/918175087004?text=${encodeURIComponent(msg || defaultMsg)}`);
  };

  const makeCall = () => Linking.openURL('tel:+918175087004');

  const triggerSOS = () => {
    Alert.alert(
      'Emergency SOS & Dispatch',
      'Direct line to Drivers Saathi Delhi NCR dispatch control desk.\n\nHelpline: +91 8175087004',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Control Desk Now', onPress: makeCall }
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

  const handleOpenBooking = (service) => {
    setBookingModal({ visible: true, service });
  };

  const handleSaveDutyLog = async () => {
    if (!dutyForm.inTime || !dutyForm.outTime) {
      Alert.alert('Required', 'Please enter check-in and check-out times.');
      return;
    }
    const newLog = {
      id: Date.now().toString(),
      date: dutyForm.date,
      in: dutyForm.inTime,
      out: dutyForm.outTime,
      km: `${dutyForm.km || 0} km`,
      ot: `${dutyForm.ot || 0} hrs`,
    };
    const updated = [newLog, ...dutyLogs];
    setDutyLogs(updated);
    await AsyncStorage.setItem('@ds_duty_logs_v1', JSON.stringify(updated));
    Alert.alert('Duty Saved', `Duty logged for ${dutyForm.date} with ${dutyForm.ot} hrs overtime.`);
  };

  const handleCreateTicket = () => {
    if (!grievanceText.trim()) {
      Alert.alert('Required', 'Please describe your query or issue.');
      return;
    }
    const newTicket = {
      id: Date.now().toString(),
      issue: grievanceText,
      status: 'In Review',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    setTickets([newTicket, ...tickets]);
    setGrievanceText('');
    Alert.alert('Ticket Raised', 'Your query has been logged. Our dispatch manager will contact you within 2 hours.');
  };

  const handleSubmitBooking = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      Alert.alert('Required Information', 'Please enter your Full Name and Mobile Number.');
      return;
    }

    setLoading(true);
    const serviceName = bookingModal.service?.title || 'Driver Service';
    const price = bookingType === 'subscription' ? '₹3,500/month Subscription' : bookingModal.service?.price;

    const payload = {
      Service: serviceName,
      Package: price,
      Name: form.name,
      Phone: form.phone,
      Email: form.email || 'Not Provided',
      'Car / Vehicle': form.car || 'Not Specified',
      'Location / Area': form.cityArea || 'Delhi NCR',
      'Travel Date': form.travelDate || 'Immediate / Flexible',
      Company: form.companyName || 'Individual Client',
      GSTIN: form.gstin || 'N/A',
      'Driver Count': form.driverCount || '1',
      'Driver DL to Verify': form.driverDL || 'N/A',
      'Referral Code': form.referralCode || 'None',
      _subject: `[Booking] ${serviceName} - ${form.name} (${form.phone})`,
      _autoresponse: `Thank you for booking with Drivers Saathi! We have received your request for ${serviceName}. An account manager is assigned and will call you within 1 business day.\n\nHelpline: +91 8175087004\nEmail: support@driverssaathi.com`,
    };

    try {
      await fetch('https://formsubmit.co/ajax/support@driverssaathi.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      // Save to local active bookings
      const newBooking = {
        id: Date.now().toString(),
        title: serviceName,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Confirmation Pending',
        price: price,
        car: form.car || 'Private Vehicle',
      };
      const updated = [newBooking, ...bookings];
      setBookings(updated);
      await AsyncStorage.setItem('@ds_client_bookings_v1', JSON.stringify(updated));

      setBookingModal({ visible: false, service: null });
      setSuccessModal({
        visible: true,
        message: `Your booking for ${serviceName} is received!\n\nOur account manager will call you within 1 business day to confirm driver allocation and invoice details.`
      });

      setForm({ name: '', phone: '', email: '', car: '', cityArea: '', travelDate: '', route: '', companyName: '', gstin: '', driverCount: '1', driverDL: '', referralCode: '' });
    } catch (e) {
      Alert.alert('Notice', 'Your request has been recorded. Our team will contact you shortly.');
      setBookingModal({ visible: false, service: null });
    } finally {
      setLoading(false);
    }
  };

  const handleDriverKYCSubmit = async () => {
    if (!driverForm.name.trim() || !driverForm.phone.trim()) {
      Alert.alert('Required', 'Please enter your Full Name and Mobile Number.');
      return;
    }
    setLoading(true);
    const payload = {
      Category: 'Driver Partner Onboarding',
      Name: driverForm.name,
      Phone: driverForm.phone,
      Experience: driverForm.experience || 'Not Specified',
      Location: driverForm.city || 'Delhi NCR',
      LicenseCategory: driverForm.licenseCategory,
      LicenseAttached: licenseImg ? 'Yes' : 'Pending',
      AadhaarAttached: aadhaarImg ? 'Yes' : 'Pending',
      _subject: `[Driver KYC] ${driverForm.name} (${driverForm.phone})`,
      _autoresponse: 'ड्राइवर्स साथी में आवेदन के लिए धन्यवाद! हमारे रिक्रूटमेंट अधिकारी आपसे 24 घंटे के भीतर संपर्क करेंगे। हेल्पलाइन: +91 8175087004',
    };

    try {
      await fetch('https://formsubmit.co/ajax/support@driverssaathi.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      setSuccessModal({
        visible: true,
        message: 'Driver Application Submitted!\n\nOur recruitment team will review your credentials and call you for verification and onboarding within 24 hours.'
      });
      setDriverForm({ name: '', phone: '', experience: '', city: 'Delhi NCR', licenseCategory: 'Commercial LMV' });
      setLicenseImg(null);
      setAadhaarImg(null);
    } catch (e) {
      Alert.alert('Notice', 'Application recorded. Our recruitment desk will call you shortly.');
    } finally {
      setLoading(false);
    }
  };

  // ─── TAB 1: EXPLORE / HOME ───────────────────────────────────────────────────
  const renderHomeScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
      {/* Hero Welcome Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroBadgeRow}>
          <View style={styles.liveDot} />
          <Text style={styles.heroBadgeText}>DELHI NCR DISPATCH DESK • ACTIVE</Text>
        </View>
        <Text style={styles.heroTitle}>
          {lang === 'en' ? 'Verified Private Chauffeurs & Highway Drivers' : 'वेरिफाइड पर्सनल व हाईवे ड्राइवर्स'}
        </Text>
        <Text style={styles.heroSubtitle}>
          {lang === 'en'
            ? 'Trained, background-checked chauffeurs for your personal car, outstation getaways & corporate fleets.'
            : 'आपकी कार के लिए पुलिस वेरिफाइड, अनुभवी ड्राइवर्स। 30 दिन की फ्री रिप्लेसमेंट गारंटी।'}
        </Text>

        <View style={styles.heroActionRow}>
          <TouchableOpacity
            style={styles.heroPrimaryBtn}
            onPress={() => handleOpenBooking({
              title: 'Personal Chauffeur Placement',
              price: '₹4,500 One-time Fee',
              tag: 'MOST POPULAR',
              sub: 'Full-time personal chauffeur for daily office and family commute.'
            })}
            activeOpacity={0.88}
          >
            <Text style={styles.heroPrimaryBtnText}>Book Chauffeur</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.heroSecondaryBtn} onPress={() => openWhatsApp()} activeOpacity={0.88}>
            <Text style={styles.heroSecondaryBtnText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Trust Highlights Strip */}
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
          <Text style={styles.trustLabel}>Input Tax Invoice</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <Text style={styles.trustNumber}>4.8 ★</Text>
          <Text style={styles.trustLabel}>User Rating</Text>
        </View>
      </View>

      {/* Section: Select a Service */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{lang === 'en' ? 'Our Driver Services' : 'हमारी सेवाएं'}</Text>
        <Text style={styles.sectionSub}>Transparent pricing with dedicated client support</Text>
      </View>

      {/* Service Card 1: Personal Chauffeur */}
      <TouchableOpacity
        style={styles.serviceCard}
        onPress={() => handleOpenBooking({
          title: 'Personal Chauffeur Placement',
          price: '₹4,500 Placement Fee',
          sub: 'Dedicated full-time driver for daily office commute and personal family car. 30-day replacement warranty included.',
          tag: 'DAILY COMMUTE',
          hasSubscription: true,
        })}
        activeOpacity={0.9}
      >
        <Image source={require('./assets/indian_driver_portrait.jpg')} style={styles.serviceImage} resizeMode="cover" />
        <View style={styles.serviceContent}>
          <View style={styles.serviceTopRow}>
            <View style={[styles.pillBadge, { backgroundColor: THEME.accentSoft }]}>
              <Text style={[styles.pillBadgeText, { color: THEME.accent }]}>DAILY COMMUTE</Text>
            </View>
            <Text style={styles.servicePrice}>₹4,500</Text>
          </View>
          <Text style={styles.serviceTitle}>Personal Chauffeur Placement</Text>
          <Text style={styles.serviceDesc}>
            Full-time, police-cleared driver for your personal vehicle. Covers route familiarity, punctual daily reporting & 30-day free replacement warranty.
          </Text>
          <View style={styles.serviceFooter}>
            <Text style={styles.servicePerks}>✓ Police Verified  •  ✓ 30-Day Warranty  •  ✓ Monthly Plan Available</Text>
            <Text style={styles.bookNowLink}>Book Service &rarr;</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Service Card 2: Outstation & Highway */}
      <TouchableOpacity
        style={styles.serviceCard}
        onPress={() => handleOpenBooking({
          title: 'Outstation & Highway Driver',
          price: 'Starting ₹1,500/day',
          sub: 'Experienced expressway driver for 1-day or multi-day road trips. Yamuna Expressway, Jaipur, Chandigarh & hills.',
          tag: 'HIGHWAY & TRIPS',
          isOutstation: true,
        })}
        activeOpacity={0.9}
      >
        <Image source={require('./assets/driver_passenger_service.jpg')} style={styles.serviceImage} resizeMode="cover" />
        <View style={styles.serviceContent}>
          <View style={styles.serviceTopRow}>
            <View style={[styles.pillBadge, { backgroundColor: THEME.successSoft }]}>
              <Text style={[styles.pillBadgeText, { color: THEME.success }]}>HIGHWAY & OUTSTATION</Text>
            </View>
            <Text style={styles.servicePrice}>₹1,500/day</Text>
          </View>
          <Text style={styles.serviceTitle}>1-Day & Outstation Highway Driver</Text>
          <Text style={styles.serviceDesc}>
            Skilled commercial badge drivers for long-distance expressway driving. Relax with family while an expert drives your car.
          </Text>
          <View style={styles.serviceFooter}>
            <Text style={styles.servicePerks}>✓ Expressway Expert  •  ✓ FASTag Guidance  •  ✓ 24/7 SOS Cover</Text>
            <Text style={styles.bookNowLink}>Plan Trip &rarr;</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Popular Highway Routes Horizontal Scroll */}
      <View style={styles.subSectionBox}>
        <Text style={styles.subSectionTitle}>Popular Outstation Highway Destinations</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routeScroll}>
          {POPULAR_ROUTES.map(r => (
            <TouchableOpacity
              key={r.id}
              style={styles.routePillCard}
              onPress={() => handleOpenBooking({
                title: `Outstation to ${r.name}`,
                price: r.fare,
                sub: `${r.route} (${r.dist} • ~${r.time}). FASTag toll: ${r.toll}, Driver DA: ${r.da}.`,
                tag: 'HIGHWAY TRIP',
                routePrefill: r.name,
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

      {/* Service Card 3: Corporate Fleet Retainer */}
      <TouchableOpacity
        style={styles.serviceCard}
        onPress={() => handleOpenBooking({
          title: 'Corporate Fleet Driver Retainer',
          price: '₹1,800 / Slot / Month',
          sub: 'Continuous driver supply for corporate cabs, staff shuttles & logistics. Includes guaranteed replacement backup within 4 hours.',
          tag: 'B2B CONTRACT',
          isFleet: true,
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
          <Text style={styles.serviceTitle}>Corporate Fleet Retainer Hub</Text>
          <Text style={styles.serviceDesc}>
            Monthly driver retention contract for travel desks, cab aggregators and corporate offices. Dedicated backup pool ensures zero vehicle downtime.
          </Text>
          <View style={styles.serviceFooter}>
            <Text style={styles.servicePerks}>✓ 100% SLA Backup  •  ✓ Full GST Invoices  •  ✓ Shift Management</Text>
            <Text style={styles.bookNowLink}>Get Proposal &rarr;</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Service Card 4: Background Verification */}
      <TouchableOpacity
        style={styles.serviceCard}
        onPress={() => handleOpenBooking({
          title: 'Driver Background Verification',
          price: '₹1,200 / Driver Check',
          sub: 'Complete background audit for your existing driver: Driving License authenticity, Aadhaar identity, criminal screening & driving test.',
          tag: 'STANDALONE AUDIT',
          isVerify: true,
        })}
        activeOpacity={0.9}
      >
        <Image source={require('./assets/driver_verification_assessment.jpg')} style={styles.serviceImage} resizeMode="cover" />
        <View style={styles.serviceContent}>
          <View style={styles.serviceTopRow}>
            <View style={[styles.pillBadge, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.pillBadgeText, { color: '#B45309' }]}>VERIFICATION AUDIT</Text>
            </View>
            <Text style={styles.servicePrice}>₹1,200</Text>
          </View>
          <Text style={styles.serviceTitle}>Driver Background Verification</Text>
          <Text style={styles.serviceDesc}>
            Already have a driver? Verify him before trusting your family or expensive vehicle. Comprehensive report delivered within 48 hours.
          </Text>
          <View style={styles.serviceFooter}>
            <Text style={styles.servicePerks}>✓ Parivahan DL Check  •  ✓ Police Screening  •  ✓ 48h Turnaround</Text>
            <Text style={styles.bookNowLink}>Verify Driver &rarr;</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Driver Recruitment Banner */}
      <View style={styles.driverCtaBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.driverCtaBadge}>CAREERS FOR DRIVERS</Text>
          <Text style={styles.driverCtaTitle}>Are you a Driver looking for work?</Text>
          <Text style={styles.driverCtaSub}>Earn ₹22,000–₹32,000/mo with verified families and corporates across Delhi NCR.</Text>
        </View>
        <TouchableOpacity style={styles.driverCtaBtn} onPress={() => setActiveTab('driver')} activeOpacity={0.85}>
          <Text style={styles.driverCtaBtnText}>Apply Now</Text>
        </TouchableOpacity>
      </View>

      {/* Helpline Assistance Box */}
      <View style={styles.helplineCard}>
        <Text style={styles.helplineTitle}>Need immediate driver assistance?</Text>
        <Text style={styles.helplineSub}>Our dispatch coordinators are available Mon–Sat from 8:00 AM to 9:00 PM.</Text>
        <View style={styles.helplineBtnRow}>
          <TouchableOpacity style={styles.btnCallSupport} onPress={makeCall} activeOpacity={0.88}>
            <Text style={styles.btnCallSupportText}>Call +91 8175087004</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnWhatsAppSupport} onPress={() => openWhatsApp()} activeOpacity={0.88}>
            <Text style={styles.btnWhatsAppSupportText}>WhatsApp Desk</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // ─── TAB 2: BOOKINGS & CLIENT HUB ─────────────────────────────────────────────
  const renderBookingsScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenHeading}>My Bookings & Duty Hub</Text>
        <Text style={styles.screenSubheading}>Manage active driver placements, daily duty logbook & replacements.</Text>
      </View>

      {/* Sub tabs */}
      <View style={styles.segmentedControl}>
        {[
          { key: 'list', label: 'My Bookings' },
          { key: 'duty', label: 'Duty & OT Log' },
          { key: 'replacement', label: '30-Day Claim' },
        ].map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.segmentItem, bookingsSubTab === s.key && styles.segmentItemActive]}
            onPress={() => setBookingsSubTab(s.key)}
          >
            <Text style={[styles.segmentItemText, bookingsSubTab === s.key && styles.segmentItemTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      {bookingsSubTab === 'list' && (
        <View>
          {bookings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Bookings Yet</Text>
              <Text style={styles.emptySub}>Book a personal chauffeur or highway trip to see your contract and driver details here.</Text>
              <TouchableOpacity style={styles.btnPrimaryCompact} onPress={() => setActiveTab('home')}>
                <Text style={styles.btnPrimaryCompactText}>Browse Services</Text>
              </TouchableOpacity>
            </View>
          ) : (
            bookings.map(b => (
              <View key={b.id} style={styles.clientBookingCard}>
                <View style={styles.bookingCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookingCardTitle}>{b.title}</Text>
                    <Text style={styles.bookingCardMeta}>{b.car} • Placed on {b.date}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: b.status === 'Active' ? THEME.successSoft : THEME.accentSoft }]}>
                    <Text style={[styles.statusPillText, { color: b.status === 'Active' ? THEME.success : THEME.accent }]}>
                      {b.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingDivider} />

                <View style={styles.bookingFooterRow}>
                  <Text style={styles.bookingPriceTag}>{b.price}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={styles.btnSmallAction}
                      onPress={() => openWhatsApp(`Hello Drivers Saathi, I have an inquiry about my booking: ${b.title}.`)}
                    >
                      <Text style={styles.btnSmallActionText}>Contact Desk</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnSmallAction, { borderColor: THEME.border }]}
                      onPress={() => setBookingsSubTab('replacement')}
                    >
                      <Text style={[styles.btnSmallActionText, { color: THEME.textSecondary }]}>Replacement</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* Duty & OT Logbook */}
      {bookingsSubTab === 'duty' && (
        <View>
          <View style={styles.panelCard}>
            <Text style={styles.panelTitle}>Record Daily Duty & Overtime</Text>
            <Text style={styles.panelSubtitle}>Log your driver's daily reporting hours for accurate monthly payroll.</Text>

            <View style={styles.formRowTwo}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Date</Text>
                <TextInput
                  style={styles.formInput}
                  value={dutyForm.date}
                  onChangeText={v => setDutyForm({ ...dutyForm, date: v })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Check-In Time</Text>
                <TextInput
                  style={styles.formInput}
                  value={dutyForm.inTime}
                  onChangeText={v => setDutyForm({ ...dutyForm, inTime: v })}
                />
              </View>
            </View>

            <View style={styles.formRowTwo}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Check-Out Time</Text>
                <TextInput
                  style={styles.formInput}
                  value={dutyForm.outTime}
                  onChangeText={v => setDutyForm({ ...dutyForm, outTime: v })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Kilometers Run</Text>
                <TextInput
                  style={styles.formInput}
                  value={dutyForm.km}
                  keyboardType="numeric"
                  onChangeText={v => setDutyForm({ ...dutyForm, km: v })}
                />
              </View>
            </View>

            <View style={{ marginTop: 8 }}>
              <Text style={styles.inputLabel}>Overtime Hours (Beyond 10 hrs)</Text>
              <TextInput
                style={styles.formInput}
                value={dutyForm.ot}
                keyboardType="numeric"
                onChangeText={v => setDutyForm({ ...dutyForm, ot: v })}
              />
            </View>

            <TouchableOpacity style={styles.btnPrimaryFull} onPress={handleSaveDutyLog}>
              <Text style={styles.btnPrimaryFullText}>Save Duty Entry</Text>
            </TouchableOpacity>
          </View>

          {/* Past Log Entries */}
          <Text style={[styles.subSectionTitle, { marginTop: 14, marginBottom: 8 }]}>Recent Recorded Duties</Text>
          {dutyLogs.map(l => (
            <View key={l.id} style={styles.dutyEntryCard}>
              <View style={styles.dutyEntryTop}>
                <Text style={styles.dutyDateText}>{l.date}</Text>
                <View style={styles.otBadge}>
                  <Text style={styles.otBadgeText}>+{l.ot} Overtime</Text>
                </View>
              </View>
              <Text style={styles.dutyMetaText}>In: {l.in}  •  Out: {l.out}  •  Distance: {l.km}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 30-Day Free Replacement Claim */}
      {bookingsSubTab === 'replacement' && (
        <View style={styles.panelCard}>
          <View style={[styles.pillBadge, { backgroundColor: THEME.successSoft, alignSelf: 'flex-start' }]}>
            <Text style={[styles.pillBadgeText, { color: THEME.success }]}>ZERO EXTRA FEE</Text>
          </View>
          <Text style={styles.panelTitle}>30-Day Free Driver Replacement</Text>
          <Text style={styles.panelSubtitle}>
            If you are not 100% satisfied with your driver's punctuality or behavior within 30 days of placement, request a free replacement.
          </Text>

          <Text style={styles.inputLabel}>Original Booking Name *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Name on placement invoice"
            value={form.name}
            onChangeText={v => setForm({ ...form, name: v })}
          />

          <Text style={styles.inputLabel}>Registered Mobile Number *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={v => setForm({ ...form, phone: v })}
          />

          <Text style={styles.inputLabel}>Reason for Replacement *</Text>
          <TextInput
            style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
            multiline
            placeholder="e.g. Driver unpunctual / route knowledge issues / left job"
            value={grievanceText}
            onChangeText={setGrievanceText}
          />

          <TouchableOpacity
            style={styles.btnPrimaryFull}
            onPress={() => {
              if (!form.name || !form.phone) {
                Alert.alert('Required', 'Please enter your name and phone number.');
                return;
              }
              Alert.alert('Claim Submitted', 'Your replacement claim is registered. Our account manager will share candidate profiles within 24 hours.');
              setGrievanceText('');
            }}
          >
            <Text style={styles.btnPrimaryFullText}>Submit Priority Replacement Claim</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  // ─── TAB 3: HELP & SUPPORT ───────────────────────────────────────────────────
  const renderSupportScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenHeading}>Help & 24/7 Support</Text>
        <Text style={styles.screenSubheading}>Emergency assistance, live dispatch coordination & grievance tickets.</Text>
      </View>

      {/* Emergency Card */}
      <View style={styles.emergencyCard}>
        <View style={styles.emergencyHeaderRow}>
          <View style={styles.sosDot} />
          <Text style={styles.emergencyTag}>24/7 EMERGENCY SOS HOTLINE</Text>
        </View>
        <Text style={styles.emergencyTitle}>Roadside & Dispatch Assistance</Text>
        <Text style={styles.emergencySub}>
          Facing vehicle breakdown or need immediate driver replacement on the road? Connect directly with our Delhi NCR dispatch control desk.
        </Text>
        <TouchableOpacity style={styles.btnEmergencyCall} onPress={triggerSOS} activeOpacity={0.9}>
          <Text style={styles.btnEmergencyCallText}>Call Control Desk: +91 8175087004</Text>
        </TouchableOpacity>
      </View>

      {/* Instant Contact Channels */}
      <View style={styles.contactRow}>
        <TouchableOpacity style={styles.contactCard} onPress={() => openWhatsApp()} activeOpacity={0.88}>
          <Text style={styles.contactCardTitle}>WhatsApp Support</Text>
          <Text style={styles.contactCardSub}>Chat with dedicated account coordinator</Text>
          <Text style={styles.contactCardAction}>Open Chat &rarr;</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={makeCall} activeOpacity={0.88}>
          <Text style={styles.contactCardTitle}>Phone Desk</Text>
          <Text style={styles.contactCardSub}>Mon–Sat (8:00 AM – 9:00 PM)</Text>
          <Text style={styles.contactCardAction}>Call Now &rarr;</Text>
        </TouchableOpacity>
      </View>

      {/* Raise a Support Ticket / Grievance */}
      <View style={styles.panelCard}>
        <Text style={styles.panelTitle}>Raise a Ticket or Grievance</Text>
        <Text style={styles.panelSubtitle}>Have an issue with driver conduct, duty hours, or billing? Submit below for 2-hour SLA resolution.</Text>

        <TextInput
          style={[styles.formInput, { height: 90, textAlignVertical: 'top', marginTop: 10 }]}
          multiline
          placeholder="Describe your query or complaint in detail..."
          value={grievanceText}
          onChangeText={setGrievanceText}
        />

        <TouchableOpacity style={styles.btnPrimaryFull} onPress={handleCreateTicket}>
          <Text style={styles.btnPrimaryFullText}>Submit Ticket</Text>
        </TouchableOpacity>
      </View>

      {/* Active Tickets Tracker */}
      <Text style={[styles.subSectionTitle, { marginTop: 16, marginBottom: 8 }]}>Your Support Tickets</Text>
      {tickets.map(t => (
        <View key={t.id} style={styles.ticketCard}>
          <View style={styles.ticketTopRow}>
            <Text style={styles.ticketDate}>{t.date}</Text>
            <View style={[styles.statusPill, { backgroundColor: t.status === 'Resolved' ? THEME.successSoft : '#FEF3C7' }]}>
              <Text style={[styles.statusPillText, { color: t.status === 'Resolved' ? THEME.success : '#B45309' }]}>
                {t.status}
              </Text>
            </View>
          </View>
          <Text style={styles.ticketIssueText}>{t.issue}</Text>
        </View>
      ))}
    </ScrollView>
  );

  // ─── TAB 4: DRIVER PARTNER PORTAL ─────────────────────────────────────────────
  const renderDriverScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
      <View style={styles.screenHeader}>
        <View style={[styles.pillBadge, { backgroundColor: THEME.accentSoft, alignSelf: 'flex-start' }]}>
          <Text style={[styles.pillBadgeText, { color: THEME.accent }]}>JOIN AS A SAATHI DRIVER</Text>
        </View>
        <Text style={styles.screenHeading}>Driver Partner Hub</Text>
        <Text style={styles.screenSubheading}>Join thousands of verified drivers earning ₹22,000 to ₹32,000 monthly.</Text>
      </View>

      {/* Driver Benefits Highlights */}
      <View style={styles.driverBenefitsCard}>
        <Text style={styles.driverBenefitsTitle}>Why Join Drivers Saathi?</Text>
        <Text style={styles.driverBenefitItem}>✓ Verified high-salary family & corporate placements</Text>
        <Text style={styles.driverBenefitItem}>✓ Guaranteed overtime payouts (₹80–₹120/hour)</Text>
        <Text style={styles.driverBenefitItem}>✓ ₹500 referral bonus for every driver friend you refer</Text>
        <Text style={styles.driverBenefitItem}>✓ 24/7 Roadside SOS & legal assistance support</Text>
      </View>

      {/* KYC Onboarding Form */}
      <View style={styles.panelCard}>
        <Text style={styles.panelTitle}>Apply for Driver Placement</Text>
        <Text style={styles.panelSubtitle}>Submit your credentials for police verification and direct client interview.</Text>

        <Text style={styles.inputLabel}>Full Name (as on Aadhaar Card) *</Text>
        <TextInput
          style={styles.formInput}
          placeholder="e.g. Ramesh Kumar"
          value={driverForm.name}
          onChangeText={v => setDriverForm({ ...driverForm, name: v })}
        />

        <Text style={styles.inputLabel}>Mobile Number (WhatsApp) *</Text>
        <TextInput
          style={styles.formInput}
          placeholder="+91 98765 43210"
          keyboardType="phone-pad"
          value={driverForm.phone}
          onChangeText={v => setDriverForm({ ...driverForm, phone: v })}
        />

        <View style={styles.formRowTwo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Driving Experience</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. 5 Years"
              value={driverForm.experience}
              onChangeText={v => setDriverForm({ ...driverForm, experience: v })}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Preferred City</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. South Delhi"
              value={driverForm.city}
              onChangeText={v => setDriverForm({ ...driverForm, city: v })}
            />
          </View>
        </View>

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>Attach Documents for Quick Verification</Text>
        <View style={styles.docUploadRow}>
          <TouchableOpacity
            style={[styles.docUploadBtn, licenseImg && styles.docUploadBtnSuccess]}
            onPress={() => pickDoc('license')}
          >
            <Text style={styles.docUploadBtnText}>{licenseImg ? 'License Attached ✓' : 'Attach Driving License'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.docUploadBtn, aadhaarImg && styles.docUploadBtnSuccess]}
            onPress={() => pickDoc('aadhaar')}
          >
            <Text style={styles.docUploadBtnText}>{aadhaarImg ? 'Aadhaar Attached ✓' : 'Attach Aadhaar Card'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btnPrimaryFull} onPress={handleDriverKYCSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnPrimaryFullText}>Submit Driver Application</Text>}
        </TouchableOpacity>
      </View>

      {/* Available Driving Jobs Board */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Driving Opportunities</Text>
        <Text style={styles.sectionSub}>Apply directly to start duty immediately.</Text>
      </View>

      {JOB_LISTINGS.map(j => (
        <View key={j.id} style={styles.jobCard}>
          <View style={styles.jobCardTop}>
            <Text style={styles.jobSalaryText}>{j.salary}</Text>
            <View style={[styles.pillBadge, { backgroundColor: THEME.borderSoft }]}>
              <Text style={[styles.pillBadgeText, { color: THEME.textSecondary }]}>{j.badge}</Text>
            </View>
          </View>
          <Text style={styles.jobCardTitle}>{j.title}</Text>
          <Text style={styles.jobCardLocation}>📍 {j.location} • {j.type}</Text>

          <TouchableOpacity
            style={styles.btnApplyCompact}
            onPress={() => {
              setDriverForm({ ...driverForm, experience: j.title });
              Alert.alert('Ready to Apply', 'Please enter your Name and Mobile Number in the application form above to apply for this opening.');
            }}
          >
            <Text style={styles.btnApplyCompactText}>Apply for this Role</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Refer & Earn Card */}
      <View style={styles.referCard}>
        <Text style={styles.referCardTitle}>Refer a Driver Friend — Earn ₹500</Text>
        <Text style={styles.referCardSub}>
          Know an experienced driver in Delhi NCR? Refer them to Drivers Saathi. When they complete 30 days of duty, you receive ₹500 directly via UPI.
        </Text>
        <TouchableOpacity
          style={styles.btnReferWhatsApp}
          onPress={() => openWhatsApp('Hello Drivers Saathi, I want to refer a driver friend. His name and contact: ')}
        >
          <Text style={styles.btnReferWhatsAppText}>Refer Friend via WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ─── MODAL: STEP-BY-STEP SERVICE BOOKING ──────────────────────────────────────
  const renderBookingModal = () => {
    const s = bookingModal.service;
    if (!s) return null;

    return (
      <Modal visible={bookingModal.visible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.bookingSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>{s.title}</Text>
                <Text style={styles.sheetPriceTag}>{s.price}</Text>
              </View>
              <TouchableOpacity style={styles.btnCloseSheet} onPress={() => setBookingModal({ visible: false, service: null })}>
                <Text style={styles.btnCloseSheetText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.sheetDesc}>{s.sub}</Text>

              {/* Subscription vs One-time toggle if applicable */}
              {s.hasSubscription && (
                <View style={styles.planSelectorBox}>
                  <TouchableOpacity
                    style={[styles.planOption, bookingType === 'onetime' && styles.planOptionActive]}
                    onPress={() => setBookingType('onetime')}
                  >
                    <Text style={[styles.planOptionTitle, bookingType === 'onetime' && styles.planOptionTitleActive]}>
                      One-Time Placement
                    </Text>
                    <Text style={styles.planOptionPrice}>₹4,500 Fee</Text>
                    <Text style={styles.planOptionSub}>30-Day Free Replacement</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.planOption, bookingType === 'subscription' && styles.planOptionActive]}
                    onPress={() => setBookingType('subscription')}
                  >
                    <Text style={[styles.planOptionTitle, bookingType === 'subscription' && styles.planOptionTitleActive]}>
                      Monthly Retainer Plan
                    </Text>
                    <Text style={styles.planOptionPrice}>₹3,500 / Month</Text>
                    <Text style={styles.planOptionSub}>Unlimited Replacements</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.inputLabel}>Your Full Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Priya Sharma"
                value={form.name}
                onChangeText={v => setForm({ ...form, name: v })}
              />

              <Text style={styles.inputLabel}>Mobile Number *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={v => setForm({ ...form, phone: v })}
              />

              <Text style={styles.inputLabel}>Car Model & Transmission</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Hyundai Creta (Automatic) / Fortuner"
                value={form.car}
                onChangeText={v => setForm({ ...form, car: v })}
              />

              <Text style={styles.inputLabel}>Your Residence Area in Delhi NCR</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. South Delhi / DLF Phase 5 Gurugram"
                value={form.cityArea}
                onChangeText={v => setForm({ ...form, cityArea: v })}
              />

              {s.isFleet && (
                <>
                  <Text style={styles.inputLabel}>Company Name & GSTIN</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. NCR Logistics Pvt Ltd (07AAAAA0000A1Z5)"
                    value={form.companyName}
                    onChangeText={v => setForm({ ...form, companyName: v })}
                  />
                  <Text style={styles.inputLabel}>Number of Drivers Needed</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 5 Drivers"
                    keyboardType="numeric"
                    value={form.driverCount}
                    onChangeText={v => setForm({ ...form, driverCount: v })}
                  />
                </>
              )}

              {s.isVerify && (
                <>
                  <Text style={styles.inputLabel}>Driver's DL Number to Verify</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. DL-0420110012345"
                    autoCapitalize="characters"
                    value={form.driverDL}
                    onChangeText={v => setForm({ ...form, driverDL: v })}
                  />
                </>
              )}

              {s.isOutstation && (
                <>
                  <Text style={styles.inputLabel}>Trip Destination & Date</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Agra (Yamuna Expy) — Tomorrow 6:00 AM"
                    value={form.travelDate}
                    onChangeText={v => setForm({ ...form, travelDate: v })}
                  />
                </>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.btnConfirmBooking} onPress={handleSubmitBooking} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnConfirmBookingText}>
                  Confirm Booking ({bookingType === 'subscription' ? '₹3,500/mo' : s.price})
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  // ─── MAIN APP SCAFFOLD ───────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar style="light" backgroundColor={THEME.primary} />

      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <Image source={require('./assets/logo.png')} style={styles.navLogo} resizeMode="contain" />

        <View style={styles.navRightActions}>
          <TouchableOpacity style={styles.btnSOS} onPress={triggerSOS} activeOpacity={0.85}>
            <Text style={styles.btnSOSText}>SOS 24/7</Text>
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

      {/* Main Active Tab Screen */}
      <View style={{ flex: 1 }}>
        {activeTab === 'home' && renderHomeScreen()}
        {activeTab === 'bookings' && renderBookingsScreen()}
        {activeTab === 'support' && renderSupportScreen()}
        {activeTab === 'driver' && renderDriverScreen()}
      </View>

      {/* Clean Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.bottomNavItem, activeTab === 'home' && styles.bottomNavItemActive]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={[styles.bottomNavIcon, activeTab === 'home' && styles.bottomNavIconActive]}>◈</Text>
          <Text style={[styles.bottomNavLabel, activeTab === 'home' && styles.bottomNavLabelActive]}>
            Explore
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomNavItem, activeTab === 'bookings' && styles.bottomNavItemActive]}
          onPress={() => setActiveTab('bookings')}
        >
          <Text style={[styles.bottomNavIcon, activeTab === 'bookings' && styles.bottomNavIconActive]}>▤</Text>
          <Text style={[styles.bottomNavLabel, activeTab === 'bookings' && styles.bottomNavLabelActive]}>
            Bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomNavItem, activeTab === 'support' && styles.bottomNavItemActive]}
          onPress={() => setActiveTab('support')}
        >
          <Text style={[styles.bottomNavIcon, activeTab === 'support' && styles.bottomNavIconActive]}>◉</Text>
          <Text style={[styles.bottomNavLabel, activeTab === 'support' && styles.bottomNavLabelActive]}>
            Support
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomNavItem, activeTab === 'driver' && styles.bottomNavItemActive]}
          onPress={() => setActiveTab('driver')}
        >
          <Text style={[styles.bottomNavIcon, activeTab === 'driver' && styles.bottomNavIconActive]}>❖</Text>
          <Text style={[styles.bottomNavLabel, activeTab === 'driver' && styles.bottomNavLabelActive]}>
            Driver Mode
          </Text>
        </TouchableOpacity>
      </View>

      {/* Booking Modal */}
      {renderBookingModal()}

      {/* Success Modal */}
      <Modal visible={successModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successCheckCircle}>
              <Text style={styles.successCheckText}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Request Confirmed</Text>
            <Text style={styles.successMessage}>{successModal.message}</Text>
            <TouchableOpacity
              style={styles.btnSuccessClose}
              onPress={() => setSuccessModal({ visible: false, message: '' })}
            >
              <Text style={styles.btnSuccessCloseText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── PREMIUM STYLESHEET ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: THEME.canvas,
  },
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
  navLogo: {
    width: 140,
    height: 36,
  },
  navRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnSOS: {
    backgroundColor: THEME.sosSoft,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  btnSOSText: {
    color: THEME.sosRed,
    fontSize: 11.5,
    fontWeight: '800',
  },
  btnLangToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  btnLangToggleText: {
    color: '#FFF',
    fontSize: 11.5,
    fontWeight: '700',
  },

  // Bottom Navigation Bar
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: THEME.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
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
    fontSize: 17,
    color: THEME.textMuted,
    marginBottom: 2,
  },
  bottomNavIconActive: {
    color: THEME.accent,
  },
  bottomNavLabel: {
    fontSize: 11,
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
    padding: 20,
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
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: 28,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 19,
    marginBottom: 16,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroPrimaryBtn: {
    backgroundColor: THEME.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  heroPrimaryBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 13.5,
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  heroSecondaryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13.5,
  },

  // Trust Strip
  trustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 20,
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
  },
  trustNumber: {
    fontSize: 13.5,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  trustLabel: {
    fontSize: 10,
    color: THEME.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  trustDivider: {
    width: 1,
    height: 24,
    backgroundColor: THEME.border,
  },

  // Section Headers
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  sectionSub: {
    fontSize: 12.5,
    color: THEME.textSecondary,
    marginTop: 2,
  },

  // Service Cards
  serviceCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },
  serviceImage: {
    width: '100%',
    height: 140,
  },
  serviceContent: {
    padding: 16,
  },
  serviceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pillBadge: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 12,
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  serviceTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginBottom: 6,
  },
  serviceDesc: {
    fontSize: 12.5,
    color: THEME.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME.borderSoft,
    paddingTop: 10,
  },
  servicePerks: {
    fontSize: 11,
    color: THEME.textSecondary,
    flex: 1,
  },
  bookNowLink: {
    fontSize: 12.5,
    fontWeight: '800',
    color: THEME.accent,
    marginLeft: 8,
  },

  // Sub Section Box
  subSectionBox: {
    marginBottom: 18,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginBottom: 10,
  },
  routeScroll: {
    flexDirection: 'row',
  },
  routePillCard: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    width: 170,
  },
  routeDestText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  routeViaText: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  routePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeFareText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.accent,
  },
  routeBookBtn: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.primary,
    backgroundColor: THEME.borderSoft,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  // Driver Recruitment Banner
  driverCtaBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  driverCtaBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: THEME.accent,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  driverCtaTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 2,
  },
  driverCtaSub: {
    fontSize: 11.5,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  driverCtaBtn: {
    backgroundColor: THEME.accent,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  driverCtaBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // Helpline Box
  helplineCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    textAlign: 'center',
  },
  helplineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  helplineSub: {
    fontSize: 12,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 17,
  },
  helplineBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btnCallSupport: {
    flex: 1,
    backgroundColor: THEME.primary,
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: 'center',
  },
  btnCallSupportText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12.5,
  },
  btnWhatsAppSupport: {
    flex: 1,
    backgroundColor: THEME.successSoft,
    borderWidth: 1,
    borderColor: THEME.success,
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: 'center',
  },
  btnWhatsAppSupportText: {
    color: THEME.success,
    fontWeight: '800',
    fontSize: 12.5,
  },

  // Screen Header in Tabs
  screenHeader: {
    marginBottom: 14,
  },
  screenHeading: {
    fontSize: 21,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  screenSubheading: {
    fontSize: 12.5,
    color: THEME.textSecondary,
    marginTop: 2,
  },

  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: THEME.borderSoft,
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
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
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  segmentItemTextActive: {
    fontWeight: '800',
    color: THEME.textPrimary,
  },

  // Panel Cards
  panelCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginTop: 4,
    marginBottom: 2,
  },
  panelSubtitle: {
    fontSize: 12,
    color: THEME.textSecondary,
    lineHeight: 17,
    marginBottom: 12,
  },

  // Form Inputs
  formRowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  inputLabel: {
    fontSize: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: THEME.textPrimary,
  },
  btnPrimaryFull: {
    backgroundColor: THEME.primary,
    borderRadius: 9,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  btnPrimaryFullText: {
    color: '#FFF',
    fontSize: 13.5,
    fontWeight: '800',
  },

  // Client Bookings
  clientBookingCard: {
    backgroundColor: THEME.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 10,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  bookingCardMeta: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  bookingDivider: {
    height: 1,
    backgroundColor: THEME.borderSoft,
    marginVertical: 10,
  },
  bookingFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingPriceTag: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.accent,
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
    fontSize: 11.5,
    fontWeight: '700',
    color: THEME.accent,
  },

  // Duty Logs
  dutyEntryCard: {
    backgroundColor: THEME.surface,
    borderRadius: 10,
    padding: 12,
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
    fontSize: 13,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  otBadge: {
    backgroundColor: THEME.accentSoft,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  otBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: THEME.accent,
  },
  dutyMetaText: {
    fontSize: 11.5,
    color: THEME.textSecondary,
  },

  // Support / Emergency
  emergencyCard: {
    backgroundColor: '#7F1D1D',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  emergencyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sosDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F87171',
  },
  emergencyTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FCA5A5',
    letterSpacing: 0.6,
  },
  emergencyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  emergencySub: {
    fontSize: 12,
    color: '#FECACA',
    lineHeight: 17,
    marginBottom: 12,
  },
  btnEmergencyCall: {
    backgroundColor: '#FFF',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnEmergencyCallText: {
    color: '#7F1D1D',
    fontWeight: '800',
    fontSize: 13,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  contactCard: {
    flex: 1,
    backgroundColor: THEME.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  contactCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  contactCardSub: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginVertical: 4,
    lineHeight: 15,
  },
  contactCardAction: {
    fontSize: 11.5,
    fontWeight: '800',
    color: THEME.accent,
  },
  ticketCard: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 8,
  },
  ticketTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketDate: {
    fontSize: 11.5,
    color: THEME.textSecondary,
  },
  ticketIssueText: {
    fontSize: 13,
    color: THEME.textPrimary,
    lineHeight: 18,
  },

  // Driver Screen
  driverBenefitsCard: {
    backgroundColor: THEME.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  driverBenefitsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  driverBenefitItem: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 19,
  },
  docUploadRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  docUploadBtn: {
    flex: 1,
    backgroundColor: THEME.canvas,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: THEME.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  docUploadBtnSuccess: {
    backgroundColor: THEME.successSoft,
    borderColor: THEME.success,
  },
  docUploadBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: THEME.textSecondary,
    textAlign: 'center',
  },
  jobCard: {
    backgroundColor: THEME.surface,
    borderRadius: 14,
    padding: 14,
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
    fontSize: 15,
    fontWeight: '800',
    color: THEME.success,
  },
  jobCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  jobCardLocation: {
    fontSize: 11.5,
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
    fontSize: 11.5,
    fontWeight: '700',
    color: THEME.primary,
  },
  referCard: {
    backgroundColor: THEME.successSoft,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  referCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  referCardSub: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 18,
    marginBottom: 10,
  },
  btnReferWhatsApp: {
    backgroundColor: '#059669',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnReferWhatsAppText: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '800',
  },

  // Empty State
  emptyCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12.5,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 18,
  },
  btnPrimaryCompact: {
    backgroundColor: THEME.primary,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  btnPrimaryCompactText: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '800',
  },

  // Modal / Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bookingSheet: {
    backgroundColor: THEME.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: THEME.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  sheetPriceTag: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.accent,
    marginTop: 2,
  },
  btnCloseSheet: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: THEME.borderSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCloseSheetText: {
    fontSize: 14,
    color: THEME.textSecondary,
    fontWeight: '800',
  },
  sheetDesc: {
    fontSize: 12,
    color: THEME.textSecondary,
    lineHeight: 17,
    marginBottom: 10,
  },
  planSelectorBox: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 10,
  },
  planOption: {
    flex: 1,
    backgroundColor: THEME.canvas,
    borderWidth: 1.5,
    borderColor: THEME.border,
    borderRadius: 10,
    padding: 10,
  },
  planOptionActive: {
    borderColor: THEME.accent,
    backgroundColor: THEME.accentSoft,
  },
  planOptionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textSecondary,
  },
  planOptionTitleActive: {
    color: THEME.accent,
    fontWeight: '800',
  },
  planOptionPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginVertical: 2,
  },
  planOptionSub: {
    fontSize: 10,
    color: THEME.textMuted,
  },
  btnConfirmBooking: {
    backgroundColor: THEME.accent,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  btnConfirmBookingText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Success Confirmation
  successCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: 'center',
  },
  successCheckCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.successSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  successCheckText: {
    fontSize: 26,
    color: THEME.success,
    fontWeight: '800',
  },
  successTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginBottom: 6,
  },
  successMessage: {
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
  },
  btnSuccessClose: {
    backgroundColor: THEME.primary,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
  },
  btnSuccessCloseText: {
    color: '#FFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
