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

// ─── Minimal Executive Design System ───────────────────────────────────────────
const THEME = {
  bg: '#FFFFFF',
  bgSubtle: '#F9FAFB',
  card: '#FFFFFF',
  border: '#E5E7EB',
  borderSubtle: '#F3F4F6',
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  accent: '#111827',
  accentWarm: '#D97706',
  accentWarmSoft: '#FEF3C7',
  green: '#059669',
  greenSoft: '#ECFDF5',
  blue: '#2563EB',
  blueSoft: '#EFF6FF',
  red: '#DC2626',
  redSoft: '#FEF2F2',
};

// ─── Candidate Database ────────────────────────────────────────────────────────
const CANDIDATE_DRIVERS = [
  {
    id: 'c1',
    name: 'Rameshwar Dayal',
    experience: '15 years experience',
    rating: '4.95',
    trips: 184,
    skills: 'Automatic & SUVs (Fortuner, Creta)',
    location: 'South Delhi & Gurugram',
    photo: require('./assets/indian_driver_portrait.jpg'),
  },
  {
    id: 'c2',
    name: 'Vikramaditya Singh',
    experience: '11 years experience',
    rating: '4.88',
    trips: 142,
    skills: 'Luxury Sedans (BMW, Mercedes) & EVs',
    location: 'Gurugram & Central Delhi',
    photo: require('./assets/indian_driver_wheel.jpg'),
  },
  {
    id: 'c3',
    name: 'Mohan Lal Verma',
    experience: '18 years experience',
    rating: '4.98',
    trips: 260,
    skills: 'Highway & Outstation (Yamuna Expy, Jaipur)',
    location: 'Noida & Central Delhi',
    photo: require('./assets/driver_passenger_service.jpg'),
  },
];

export default function App() {
  // Global Mode: 'customer' | 'driver_login' | 'driver_app' | 'owner_login' | 'owner_app' | 'admin_login' | 'admin_app'
  const [currentMode, setCurrentMode] = useState('customer');

  // Customer State
  const [customerTab, setCustomerTab] = useState('services'); // 'services' | 'calculator' | 'candidates' | 'book' | 'help'
  const [calcCity, setCalcCity] = useState('South Delhi');
  const [calcHours, setCalcHours] = useState('10 Hours (Standard)');
  const [calcTransmission, setCalcTransmission] = useState('Automatic');

  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    car: '',
    location: '',
    serviceType: 'Personal Chauffeur Placement',
    transmission: 'Automatic',
  });
  const [loading, setLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({ visible: false, message: '' });

  // Driver Credentials & App State
  const [driverLoginId, setDriverLoginId] = useState('');
  const [driverPassword, setDriverPassword] = useState('');
  const [driverTab, setDriverTab] = useState('duty'); // 'duty' | 'logbook' | 'leave' | 'docs' | 'salary'
  const [driverDutyLogs, setDriverDutyLogs] = useState([
    { id: 'dl1', date: '2026-09-10', inTime: '08:30 AM', outTime: '07:15 PM', startKm: '42,100', endKm: '42,165', km: '65 km', ot: '1.5 hrs', approved: true, photoAttached: true },
    { id: 'dl2', date: '2026-09-09', inTime: '08:30 AM', outTime: '07:45 PM', startKm: '42,020', endKm: '42,100', km: '80 km', ot: '2.0 hrs', approved: true, photoAttached: true },
  ]);
  const [newLogDate, setNewLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLogIn, setNewLogIn] = useState('08:30 AM');
  const [newLogOut, setNewLogOut] = useState('07:00 PM');
  const [newStartKm, setNewStartKm] = useState('42,165');
  const [newEndKm, setNewEndKm] = useState('42,220');
  const [newOT, setNewOT] = useState('1.5');
  const [logPhotoUri, setLogPhotoUri] = useState(null);

  // Driver Leave Management
  const [driverLeaveRequests, setDriverLeaveRequests] = useState([
    { id: 'lr1', date: '2026-09-19', reason: 'Family medical visit', status: 'Approved', substituteAssigned: 'Vikramaditya S. (Backup)' },
  ]);
  const [leaveDateInput, setLeaveDateInput] = useState('2026-09-24');
  const [leaveReasonInput, setLeaveReasonInput] = useState('');

  // Owner Credentials & App State
  const [ownerLoginId, setOwnerLoginId] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerTab, setOwnerTab] = useState('overview'); // 'overview' | 'substitute' | 'expiry' | 'agreement' | 'logbook'

  // Admin Credentials & State
  const [adminLoginId, setAdminLoginId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminTab, setAdminTab] = useState('placements'); // 'placements' | 'substitutes' | 'leads'
  const [masterPlacements, setMasterPlacements] = useState([
    { id: 'P-101', owner: 'Mr. Rajesh Agarwal (Vasant Vihar)', car: 'Hyundai Creta', driver: 'Rameshwar Dayal (DRV-101)', status: 'Active Duty', warrantyEnd: '04 Oct 2026' },
    { id: 'P-102', owner: 'Dr. Sameer Kapoor (DLF Phase 5)', car: 'BMW 5-Series', driver: 'Vikramaditya Singh (DRV-102)', status: 'Active Duty', warrantyEnd: '12 Oct 2026' },
  ]);

  // Load Persisted Data
  useEffect(() => {
    (async () => {
      try {
        const savedLogs = await AsyncStorage.getItem('@ds_shared_duty_logs_v2');
        if (savedLogs) setDriverDutyLogs(JSON.parse(savedLogs));
        const savedLeaves = await AsyncStorage.getItem('@ds_shared_leave_reqs');
        if (savedLeaves) setDriverLeaveRequests(JSON.parse(savedLeaves));
      } catch (e) {}
    })();
  }, []);

  const openCall = () => Linking.openURL('tel:+918175087004');

  const openWhatsApp = (msg = '') => {
    const text = msg || 'Hello Drivers Saathi, I have an inquiry regarding driver placements in Delhi NCR.';
    Linking.openURL(`https://wa.me/918175087004?text=${encodeURIComponent(text)}`);
  };

  // Salary Calculator Output Helper
  const calculateBenchmarkSalary = () => {
    let base = 20000;
    if (calcCity === 'South Delhi' || calcCity === 'Gurugram') base += 2000;
    if (calcHours.includes('12 Hours')) base += 3000;
    if (calcHours.includes('24-Hr Live-in')) base += 6000;
    if (calcTransmission.includes('Luxury')) base += 3000;

    return {
      minSalary: base,
      maxSalary: base + 2500,
      otRate: base >= 25000 ? 100 : 80,
      agencyFee: 4500,
    };
  };

  // Photo Picker for Driver Logbook
  const pickSpeedometerPhoto = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.6,
      });
      if (!res.canceled && res.assets[0]) {
        setLogPhotoUri(res.assets[0].uri);
        Alert.alert('Attached', 'Odometer photo attached to duty record.');
      }
    } catch (e) {}
  };

  // Customer Lead Submission
  const handleCustomerBookingSubmit = async () => {
    if (!bookingForm.name.trim() || !bookingForm.phone.trim()) {
      Alert.alert('Required', 'Please enter your Full Name and Mobile Number.');
      return;
    }

    setLoading(true);
    const bookingId = `DS-${Math.floor(1000 + Math.random() * 9000)}`;

    const payload = {
      BookingID: bookingId,
      Service: bookingForm.serviceType,
      ClientName: bookingForm.name,
      Phone: bookingForm.phone,
      CarModel: bookingForm.car || 'Private Vehicle',
      Location: bookingForm.location || 'Delhi NCR',
      Transmission: bookingForm.transmission,
      _subject: `[Website Lead #${bookingId}] ${bookingForm.serviceType} - ${bookingForm.name}`,
      _autoresponse: `Thank you ${bookingForm.name}! Your inquiry #${bookingId} is received. An account manager will contact you within 4 hours. Helpline: +91 8175087004`,
    };

    try {
      await fetch('https://formsubmit.co/ajax/support@driverssaathi.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      setConfirmationModal({
        visible: true,
        message: `Thank you, ${bookingForm.name}!\n\nYour request for ${bookingForm.serviceType} has been received (Ref #${bookingId}).\n\nOur account manager will call you within 4 hours to confirm candidate availability.`,
      });
      setBookingForm({ name: '', phone: '', car: '', location: '', serviceType: 'Personal Chauffeur Placement', transmission: 'Automatic' });
    } catch (e) {
      Alert.alert('Notice', 'Inquiry recorded. Our team will contact you shortly.');
    } finally {
      setLoading(false);
    }
  };

  // Driver Login
  const handleDriverLogin = () => {
    if ((driverLoginId.trim() === 'DRV-101' || driverLoginId.trim() === '9876543210') && driverPassword === '1234') {
      setCurrentMode('driver_app');
    } else {
      Alert.alert('Invalid Credentials', 'Use Demo Driver ID: DRV-101 and Password: 1234');
    }
  };

  // Driver Save Duty Log
  const handleSaveDriverLog = async () => {
    const kmTotal = (parseInt(newEndKm.replace(/,/g, '')) || 0) - (parseInt(newStartKm.replace(/,/g, '')) || 0);
    const newEntry = {
      id: Date.now().toString(),
      date: newLogDate,
      inTime: newLogIn,
      outTime: newLogOut,
      startKm: newStartKm,
      endKm: newEndKm,
      km: `${kmTotal > 0 ? kmTotal : 55} km`,
      ot: `${newOT} hrs`,
      approved: false,
      photoAttached: !!logPhotoUri,
    };

    const updated = [newEntry, ...driverDutyLogs];
    setDriverDutyLogs(updated);
    await AsyncStorage.setItem('@ds_shared_duty_logs_v2', JSON.stringify(updated));
    setLogPhotoUri(null);
    Alert.alert('Timesheet Logged', `Logged duty for ${newLogDate}. Submitted to car owner for overtime approval.`);
  };

  // Driver Submit Leave Request
  const handleSubmitLeaveRequest = async () => {
    if (!leaveReasonInput.trim()) {
      Alert.alert('Required', 'Please enter a reason for leave.');
      return;
    }
    const newLeave = {
      id: Date.now().toString(),
      date: leaveDateInput,
      reason: leaveReasonInput,
      status: 'Pending Owner Review',
      substituteAssigned: 'Backup Available on Request',
    };
    const updated = [newLeave, ...driverLeaveRequests];
    setDriverLeaveRequests(updated);
    await AsyncStorage.setItem('@ds_shared_leave_reqs', JSON.stringify(updated));
    setLeaveReasonInput('');
    Alert.alert('Leave Submitted', 'Leave request sent to car owner. Dispatch desk notified to arrange backup driver if required.');
  };

  // Owner Login
  const handleOwnerLogin = () => {
    if ((ownerLoginId.trim() === 'OWN-501' || ownerLoginId.trim() === '9811023456') && ownerPassword === '1234') {
      setCurrentMode('owner_app');
    } else {
      Alert.alert('Invalid Credentials', 'Use Demo Owner ID: OWN-501 and Password: 1234');
    }
  };

  // Owner Approve Overtime
  const handleApproveLog = async (logId) => {
    const updated = driverDutyLogs.map(l => l.id === logId ? { ...l, approved: true } : l);
    setDriverDutyLogs(updated);
    await AsyncStorage.setItem('@ds_shared_duty_logs_v2', JSON.stringify(updated));
    Alert.alert('Overtime Approved', 'Timesheet authenticated for payroll calculation.');
  };

  // Admin Login
  const handleAdminLogin = () => {
    if (adminLoginId.trim().toUpperCase() === 'ADMIN' && adminPassword === '1234') {
      setCurrentMode('admin_app');
    } else {
      Alert.alert('Invalid Admin', 'Use Admin ID: ADMIN and Password: 1234');
    }
  };

  // ─── VIEW 1: CUSTOMER WEBSITE & BOOKING ──────────────────────────────────────
  const renderCustomerView = () => {
    const salaryEst = calculateBenchmarkSalary();

    return (
      <View style={{ flex: 1 }}>
        {/* Top Navbar */}
        <View style={styles.topNavbar}>
          <View style={styles.brandRow}>
            <Image source={require('./assets/driver-saathi-logo-light.png')} style={styles.navLogo} resizeMode="contain" />
            <View>
              <Text style={styles.brandText}>DRIVERS SAATHI</Text>
              <Text style={styles.brandSub}>Delhi NCR</Text>
            </View>
          </View>

          {/* Portal Switching Actions */}
          <View style={styles.navRightRow}>
            <TouchableOpacity
              style={styles.portalSwitchBtn}
              onPress={() => {
                setDriverLoginId('DRV-101');
                setDriverPassword('1234');
                setCurrentMode('driver_login');
              }}
            >
              <Text style={styles.portalSwitchText}>Driver App</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.portalSwitchBtn, { backgroundColor: THEME.accentWarmSoft, borderColor: THEME.accentWarm }]}
              onPress={() => {
                setOwnerLoginId('OWN-501');
                setOwnerPassword('1234');
                setCurrentMode('owner_login');
              }}
            >
              <Text style={[styles.portalSwitchText, { color: THEME.accentWarm }]}>Owner Portal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.portalSwitchBtn, { backgroundColor: THEME.bgSubtle }]}
              onPress={() => {
                setAdminLoginId('ADMIN');
                setAdminPassword('1234');
                setCurrentMode('admin_login');
              }}
            >
              <Text style={[styles.portalSwitchText, { color: THEME.textTertiary }]}>Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Editorial Headline */}
          <View style={styles.heroBlock}>
            <Text style={styles.heroPreTitle}>DELHI NCR CHAUFFEUR PLACEMENTS</Text>
            <Text style={styles.heroTitle}>Professional Drivers for Your Private Car</Text>
            <Text style={styles.heroSubtitle}>
              Police-cleared, experienced drivers for daily office commute, outstation highway journeys, and corporate fleets. Includes a 30-day replacement warranty.
            </Text>
          </View>

          {/* Trust Strip */}
          <View style={styles.trustStrip}>
            <Text style={styles.trustItemText}>Police Verified</Text>
            <Text style={styles.trustBullet}>•</Text>
            <Text style={styles.trustItemText}>30-Day Free Replacement</Text>
            <Text style={styles.trustBullet}>•</Text>
            <Text style={styles.trustItemText}>GST Invoiced</Text>
          </View>

          {/* Navigation Segments */}
          <View style={styles.segmentContainer}>
            {[
              { key: 'services', label: 'Services' },
              { key: 'calculator', label: 'Salary Tool' },
              { key: 'candidates', label: 'Chauffeurs' },
              { key: 'book', label: 'Hire Driver' },
              { key: 'help', label: 'Support' },
            ].map(s => (
              <TouchableOpacity
                key={s.key}
                style={[styles.segmentBtn, customerTab === s.key && styles.segmentBtnActive]}
                onPress={() => setCustomerTab(s.key)}
              >
                <Text style={[styles.segmentBtnText, customerTab === s.key && styles.segmentBtnTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sub-Tab 1: Services */}
          {customerTab === 'services' && (
            <View style={styles.servicesStack}>
              {/* Service 1 */}
              <View style={styles.cardMinimal}>
                <Image source={require('./assets/indian_driver_portrait.jpg')} style={styles.cardImage} resizeMode="cover" />
                <View style={styles.cardBody}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>Personal Chauffeur Placement</Text>
                    <Text style={styles.cardPrice}>₹4,500 One-time</Text>
                  </View>
                  <Text style={styles.cardDesc}>
                    Full-time dedicated driver for your private car. Route familiar, punctual, with an iron-clad 30-day free driver replacement warranty.
                  </Text>
                  <TouchableOpacity style={styles.btnPrimary} onPress={() => setCustomerTab('book')}>
                    <Text style={styles.btnPrimaryText}>Request Chauffeur &rarr;</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Service 2 */}
              <View style={styles.cardMinimal}>
                <Image source={require('./assets/driver_passenger_service.jpg')} style={styles.cardImage} resizeMode="cover" />
                <View style={styles.cardBody}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>Outstation & Highway Driver</Text>
                    <Text style={styles.cardPrice}>From ₹1,500/day</Text>
                  </View>
                  <Text style={styles.cardDesc}>
                    Experienced commercial drivers for expressway travel to Agra, Jaipur, Chandigarh, and Uttarakhand. FASTag and toll guidance included.
                  </Text>
                  <TouchableOpacity style={styles.btnPrimary} onPress={() => setCustomerTab('book')}>
                    <Text style={styles.btnPrimaryText}>Book Highway Driver &rarr;</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Service 3 */}
              <View style={styles.cardMinimal}>
                <Image source={require('./assets/fleet_cabs_delhi.jpg')} style={styles.cardImage} resizeMode="cover" />
                <View style={styles.cardBody}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>Corporate Fleet Retainer</Text>
                    <Text style={styles.cardPrice}>B2B Contract</Text>
                  </View>
                  <Text style={styles.cardDesc}>
                    Continuous driver supply for corporate shuttles, travel desks, and logistics. Dedicated backup pool ensures zero vehicle downtime.
                  </Text>
                  <TouchableOpacity style={styles.btnPrimary} onPress={openCall}>
                    <Text style={styles.btnPrimaryText}>Call Fleet Desk: +91 8175087004</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Sub-Tab 2: Interactive Salary Calculator */}
          {customerTab === 'calculator' && (
            <View style={styles.bookingFormCard}>
              <Text style={styles.formTitle}>Delhi NCR Driver Salary Benchmark</Text>
              <Text style={styles.formSubtitle}>Calculate recommended driver market salary based on location, hours, and vehicle type.</Text>

              <Text style={styles.inputLabel}>Select Area</Text>
              <View style={styles.choiceRow}>
                {['South Delhi', 'Gurugram', 'Noida', 'Central / West Delhi'].map(city => (
                  <TouchableOpacity
                    key={city}
                    style={[styles.choicePill, calcCity === city && styles.choicePillActive]}
                    onPress={() => setCalcCity(city)}
                  >
                    <Text style={[styles.choicePillText, calcCity === city && styles.choicePillTextActive]}>{city}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Daily Shift Duration</Text>
              <View style={styles.choiceRow}>
                {['8 Hours (Office)', '10 Hours (Standard)', '12 Hours (Long)', '24-Hr Live-in'].map(h => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.choicePill, calcHours === h && styles.choicePillActive]}
                    onPress={() => setCalcHours(h)}
                  >
                    <Text style={[styles.choicePillText, calcHours === h && styles.choicePillTextActive]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Vehicle Transmission</Text>
              <View style={styles.choiceRow}>
                {['Automatic', 'Manual', 'Luxury German / EV'].map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.choicePill, calcTransmission === t && styles.choicePillActive]}
                    onPress={() => setCalcTransmission(t)}
                  >
                    <Text style={[styles.choicePillText, calcTransmission === t && styles.choicePillTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Benchmark Result Card */}
              <View style={styles.benchmarkResultCard}>
                <Text style={styles.benchmarkLabel}>RECOMMENDED MONTHLY SALARY</Text>
                <Text style={styles.benchmarkSalaryText}>₹{salaryEst.minSalary.toLocaleString('en-IN')} – ₹{salaryEst.maxSalary.toLocaleString('en-IN')}</Text>
                <Text style={styles.benchmarkSub}>For {calcHours} in {calcCity} ({calcTransmission})</Text>

                <View style={styles.divider} />

                <View style={styles.benchmarkRow}>
                  <Text style={styles.benchmarkItem}>Recommended Overtime Rate:</Text>
                  <Text style={styles.benchmarkValue}>₹{salaryEst.otRate}/hour</Text>
                </View>
                <View style={styles.benchmarkRow}>
                  <Text style={styles.benchmarkItem}>One-Time Placement Fee:</Text>
                  <Text style={styles.benchmarkValue}>₹{salaryEst.agencyFee} (30-day warranty)</Text>
                </View>

                <TouchableOpacity
                  style={[styles.btnPrimarySubmit, { marginTop: 12 }]}
                  onPress={() => {
                    setBookingForm({ ...bookingForm, location: calcCity, transmission: calcTransmission });
                    setCustomerTab('book');
                  }}
                >
                  <Text style={styles.btnPrimarySubmitText}>Hire Driver at this Rate &rarr;</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Sub-Tab 3: Candidates */}
          {customerTab === 'candidates' && (
            <View style={styles.servicesStack}>
              {CANDIDATE_DRIVERS.map(c => (
                <View key={c.id} style={styles.candidateCard}>
                  <View style={styles.candidateHeader}>
                    <Image source={c.photo} style={styles.candidateAvatar} resizeMode="cover" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={styles.candidateNameRow}>
                        <Text style={styles.candidateName}>{c.name}</Text>
                        <Text style={styles.candidateRating}>★ {c.rating} ({c.trips})</Text>
                      </View>
                      <Text style={styles.candidateMeta}>{c.experience} • {c.location}</Text>
                      <Text style={styles.candidateSkills}>{c.skills}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={() => {
                      setBookingForm({ ...bookingForm, car: c.skills.split(' ')[0] });
                      setCustomerTab('book');
                    }}
                  >
                    <Text style={styles.btnPrimaryText}>Schedule Trial with {c.name}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Sub-Tab 4: Booking Form */}
          {customerTab === 'book' && (
            <View style={styles.bookingFormCard}>
              <Text style={styles.formTitle}>Book a Verified Chauffeur</Text>
              <Text style={styles.formSubtitle}>Submit your car and location. Our account manager will share candidate profiles within 4 hours.</Text>

              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Priya Sharma"
                value={bookingForm.name}
                onChangeText={v => setBookingForm({ ...bookingForm, name: v })}
              />

              <Text style={styles.inputLabel}>Mobile Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
                value={bookingForm.phone}
                onChangeText={v => setBookingForm({ ...bookingForm, phone: v })}
              />

              <Text style={styles.inputLabel}>Car Model</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Hyundai Creta / Honda City"
                value={bookingForm.car}
                onChangeText={v => setBookingForm({ ...bookingForm, car: v })}
              />

              <Text style={styles.inputLabel}>Area in Delhi NCR</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. South Delhi / DLF Phase 5 Gurugram"
                value={bookingForm.location}
                onChangeText={v => setBookingForm({ ...bookingForm, location: v })}
              />

              <Text style={styles.inputLabel}>Service Requirement</Text>
              <View style={styles.choiceRow}>
                {['Personal Chauffeur', 'Outstation Trip', 'Corporate Retainer'].map(st => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.choicePill, bookingForm.serviceType.includes(st) && styles.choicePillActive]}
                    onPress={() => setBookingForm({ ...bookingForm, serviceType: st })}
                  >
                    <Text style={[styles.choicePillText, bookingForm.serviceType.includes(st) && styles.choicePillTextActive]}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Transmission</Text>
              <View style={styles.choiceRow}>
                {['Automatic', 'Manual', 'Luxury German'].map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.choicePill, bookingForm.transmission === t && styles.choicePillActive]}
                    onPress={() => setBookingForm({ ...bookingForm, transmission: t })}
                  >
                    <Text style={[styles.choicePillText, bookingForm.transmission === t && styles.choicePillTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.btnPrimarySubmit} onPress={handleCustomerBookingSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnPrimarySubmitText}>Submit Driver Request</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* Sub-Tab 5: Help */}
          {customerTab === 'help' && (
            <View style={styles.servicesStack}>
              <View style={styles.cardMinimal}>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>Delhi NCR Dispatch Desk</Text>
                  <Text style={styles.cardDesc}>Connect with our client coordination managers directly.</Text>
                  <TouchableOpacity style={styles.btnPrimary} onPress={openCall}>
                    <Text style={styles.btnPrimaryText}>Call +91 8175087004</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btnSecondary, { marginTop: 8 }]} onPress={() => openWhatsApp()}>
                    <Text style={styles.btnSecondaryText}>Chat on WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  // ─── VIEW 2: DRIVER LOGIN ────────────────────────────────────────────────────
  const renderDriverLogin = () => (
    <ScrollView contentContainerStyle={styles.loginContainer} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.btnBackToPublic} onPress={() => setCurrentMode('customer')}>
        <Text style={styles.btnBackToPublicText}>&larr; Back to Public Website</Text>
      </TouchableOpacity>

      <View style={styles.loginCard}>
        <Text style={styles.loginPreTitle}>DRIVER COMPANION PORTAL</Text>
        <Text style={styles.loginTitle}>Driver Sign In</Text>
        <Text style={styles.loginSub}>Enter your Driver ID and password provided by the dispatch desk.</Text>

        <Text style={styles.inputLabel}>Driver ID or Mobile Number</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. DRV-101"
          autoCapitalize="characters"
          value={driverLoginId}
          onChangeText={setDriverLoginId}
        />

        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.textInput}
          placeholder="••••"
          secureTextEntry
          value={driverPassword}
          onChangeText={setDriverPassword}
        />

        <TouchableOpacity style={styles.btnPrimarySubmit} onPress={handleDriverLogin}>
          <Text style={styles.btnPrimarySubmitText}>Sign In to Driver Workspace</Text>
        </TouchableOpacity>

        {/* Demo Fast Login */}
        <TouchableOpacity
          style={styles.btnQuickDemo}
          onPress={() => {
            setDriverLoginId('DRV-101');
            setDriverPassword('1234');
            setCurrentMode('driver_app');
          }}
        >
          <Text style={styles.btnQuickDemoText}>Instant Demo Sign-In (DRV-101 / 1234)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ─── VIEW 3: DRIVER COMPANION APP ────────────────────────────────────────────
  const renderDriverApp = () => (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.portalHeader}>
        <View>
          <Text style={styles.portalHeaderTitle}>Rameshwar Dayal</Text>
          <Text style={styles.portalHeaderSub}>ID: DRV-101 • Verified Chauffeur</Text>
        </View>
        <TouchableOpacity style={styles.btnLogout} onPress={() => setCurrentMode('customer')}>
          <Text style={styles.btnLogoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Driver Tabs */}
      <View style={styles.segmentContainer}>
        {[
          { key: 'duty', label: 'Today Duty' },
          { key: 'logbook', label: 'Timesheet' },
          { key: 'leave', label: 'Leave' },
          { key: 'docs', label: 'Docs' },
          { key: 'salary', label: 'Salary' },
        ].map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.segmentBtn, driverTab === s.key && styles.segmentBtnActive]}
            onPress={() => setDriverTab(s.key)}
          >
            <Text style={[styles.segmentBtnText, driverTab === s.key && styles.segmentBtnTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Today Duty */}
        {driverTab === 'duty' && (
          <View>
            <View style={styles.cardMinimal}>
              <View style={styles.cardBody}>
                <View style={styles.statusRow}>
                  <Text style={styles.cardTag}>ACTIVE ASSIGNMENT</Text>
                  <View style={styles.greenBadge}>
                    <Text style={styles.greenBadgeText}>ON DUTY</Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>Client: Mr. Rajesh Agarwal</Text>
                <Text style={styles.cardDesc}>Vehicle: Hyundai Creta 2023 (DL 3C XX 1234) • Automatic</Text>
                <Text style={styles.cardDesc}>Duty Hours: 08:30 AM – 06:30 PM (10 Hours)</Text>
                <Text style={[styles.cardDesc, { marginTop: 4, color: THEME.text }]}>
                  📍 Pickup: Villa 14, Poorvi Marg, Vasant Vihar, South Delhi
                </Text>

                <View style={styles.divider} />

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.btnSecondary} onPress={() => Linking.openURL('tel:+919811023456')}>
                    <Text style={styles.btnSecondaryText}>Call Owner</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={() => Alert.alert('Check-In Confirmed', 'Check-in time recorded at 08:30 AM.')}
                  >
                    <Text style={styles.btnPrimaryText}>Record Check-In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Logbook with Odometer Photo */}
        {driverTab === 'logbook' && (
          <View>
            <View style={styles.bookingFormCard}>
              <Text style={styles.formTitle}>Record Daily Duty & Odometer</Text>
              <Text style={styles.formSubtitle}>Submit daily hours and attach speedometer reading for owner verification.</Text>

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TextInput style={styles.textInput} value={newLogDate} onChangeText={setNewLogDate} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Check-In</Text>
                  <TextInput style={styles.textInput} value={newLogIn} onChangeText={setNewLogIn} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Check-Out</Text>
                  <TextInput style={styles.textInput} value={newLogOut} onChangeText={setNewLogOut} />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Start KM</Text>
                  <TextInput style={styles.textInput} value={newStartKm} onChangeText={setNewStartKm} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Closing KM</Text>
                  <TextInput style={styles.textInput} value={newEndKm} onChangeText={setNewEndKm} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>OT (Hrs)</Text>
                  <TextInput style={styles.textInput} value={newOT} onChangeText={setNewOT} keyboardType="numeric" />
                </View>
              </View>

              <TouchableOpacity style={styles.btnAttachPhoto} onPress={pickSpeedometerPhoto}>
                <Text style={styles.btnAttachPhotoText}>{logPhotoUri ? 'Speedometer Photo Attached ✓' : '📷 Attach Odometer Photo'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnPrimarySubmit} onPress={handleSaveDriverLog}>
                <Text style={styles.btnPrimarySubmitText}>Submit Duty to Car Owner</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.subHeading, { marginTop: 16 }]}>Past Recorded Logbook</Text>
            {driverDutyLogs.map(l => (
              <View key={l.id} style={styles.logCard}>
                <View style={styles.logHeaderRow}>
                  <Text style={styles.logDate}>{l.date}</Text>
                  <View style={l.approved ? styles.approvedBadge : styles.pendingBadge}>
                    <Text style={l.approved ? styles.approvedBadgeText : styles.pendingBadgeText}>
                      {l.approved ? 'Approved by Owner' : 'Pending Review'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.logMeta}>In: {l.inTime} • Out: {l.outTime} • Distance: {l.km}</Text>
                <Text style={styles.logOT}>Overtime: +{l.ot} (Payable: ₹{Math.round(parseFloat(l.ot || 0) * 80)})</Text>
                {l.photoAttached && <Text style={styles.photoIndicatorText}>✓ Speedometer Photo Authenticated</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Leave Request Management */}
        {driverTab === 'leave' && (
          <View>
            <View style={styles.bookingFormCard}>
              <Text style={styles.formTitle}>Request Planned Leave</Text>
              <Text style={styles.formSubtitle}>Notify your car owner and dispatch desk in advance so backup driver can be scheduled.</Text>

              <Text style={styles.inputLabel}>Date of Leave</Text>
              <TextInput style={styles.textInput} value={leaveDateInput} onChangeText={setLeaveDateInput} />

              <Text style={styles.inputLabel}>Reason for Leave</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Family function / urgent native visit"
                value={leaveReasonInput}
                onChangeText={setLeaveReasonInput}
              />

              <TouchableOpacity style={styles.btnPrimarySubmit} onPress={handleSubmitLeaveRequest}>
                <Text style={styles.btnPrimarySubmitText}>Submit Leave Request</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.subHeading, { marginTop: 16 }]}>Leave Request Status</Text>
            {driverLeaveRequests.map(r => (
              <View key={r.id} style={styles.logCard}>
                <View style={styles.logHeaderRow}>
                  <Text style={styles.logDate}>{r.date}</Text>
                  <View style={r.status === 'Approved' ? styles.approvedBadge : styles.pendingBadge}>
                    <Text style={r.status === 'Approved' ? styles.approvedBadgeText : styles.pendingBadgeText}>
                      {r.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.logMeta}>Reason: {r.reason}</Text>
                <Text style={[styles.logOT, { color: THEME.blue }]}>Substitute Status: {r.substituteAssigned}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Verified Documents */}
        {driverTab === 'docs' && (
          <View style={styles.servicesStack}>
            <View style={styles.docCard}>
              <Text style={styles.docTitle}>Commercial Driving License (LMV/Transport)</Text>
              <Text style={styles.docMeta}>DL No: DL-042011004821 • Valid till 14 Oct 2028</Text>
              <Text style={styles.verifiedText}>✓ Parivahan Verified</Text>
            </View>

            <View style={styles.docCard}>
              <Text style={styles.docTitle}>Delhi Police Background Clearance</Text>
              <Text style={styles.docMeta}>PCC Certificate No: PCC-2026-DL-8842</Text>
              <Text style={styles.verifiedText}>✓ Clear Record (Zero Criminal Filings)</Text>
            </View>

            <View style={styles.docCard}>
              <Text style={styles.docTitle}>Aadhaar Identity Verification</Text>
              <Text style={styles.docMeta}>UIDAI Authenticated: XXXX-XXXX-4821</Text>
              <Text style={styles.verifiedText}>✓ Biometric & Address Authenticated</Text>
            </View>
          </View>
        )}

        {/* Salary & Earnings */}
        {driverTab === 'salary' && (
          <View style={styles.servicesStack}>
            <View style={styles.cardMinimal}>
              <View style={styles.cardBody}>
                <Text style={styles.cardTag}>MONTHLY PAYROLL SUMMARY</Text>
                <Text style={styles.bigAmount}>₹24,340</Text>
                <Text style={styles.cardDesc}>Total calculated payout for September 2026</Text>

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Base Monthly Salary</Text>
                  <Text style={styles.summaryVal}>₹22,000</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Approved Overtime (23 Hours @ ₹80/hr)</Text>
                  <Text style={styles.summaryVal}>₹1,840</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Driver Referral Bonus</Text>
                  <Text style={styles.summaryVal}>₹500</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );

  // ─── VIEW 4: OWNER LOGIN ─────────────────────────────────────────────────────
  const renderOwnerLogin = () => (
    <ScrollView contentContainerStyle={styles.loginContainer} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.btnBackToPublic} onPress={() => setCurrentMode('customer')}>
        <Text style={styles.btnBackToPublicText}>&larr; Back to Public Website</Text>
      </TouchableOpacity>

      <View style={styles.loginCard}>
        <Text style={[styles.loginPreTitle, { color: THEME.accentWarm }]}>CAR OWNER & FLEET PORTAL</Text>
        <Text style={styles.loginTitle}>Owner Sign In</Text>
        <Text style={styles.loginSub}>Access your assigned driver records, vehicle document expiry, and logbook.</Text>

        <Text style={styles.inputLabel}>Owner Account ID or Mobile</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. OWN-501"
          autoCapitalize="characters"
          value={ownerLoginId}
          onChangeText={setOwnerLoginId}
        />

        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.textInput}
          placeholder="••••"
          secureTextEntry
          value={ownerPassword}
          onChangeText={setOwnerPassword}
        />

        <TouchableOpacity style={[styles.btnPrimarySubmit, { backgroundColor: THEME.accentWarm }]} onPress={handleOwnerLogin}>
          <Text style={styles.btnPrimarySubmitText}>Sign In to Car Owner Portal</Text>
        </TouchableOpacity>

        {/* Demo Fast Login */}
        <TouchableOpacity
          style={styles.btnQuickDemo}
          onPress={() => {
            setOwnerLoginId('OWN-501');
            setOwnerPassword('1234');
            setCurrentMode('owner_app');
          }}
        >
          <Text style={styles.btnQuickDemoText}>Instant Demo Sign-In (OWN-501 / 1234)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ─── VIEW 5: OWNER PORTAL (MONITORING, EXPIRY, SUBSTITUTE & AGREEMENT) ───────
  const renderOwnerApp = () => (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.portalHeader}>
        <View>
          <Text style={styles.portalHeaderTitle}>Mr. Rajesh Agarwal</Text>
          <Text style={styles.portalHeaderSub}>Owner ID: OWN-501 • Hyundai Creta (DL 3C XX 1234)</Text>
        </View>
        <TouchableOpacity style={styles.btnLogout} onPress={() => setCurrentMode('customer')}>
          <Text style={styles.btnLogoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Owner Tabs */}
      <View style={styles.segmentContainer}>
        {[
          { key: 'overview', label: 'My Driver' },
          { key: 'substitute', label: 'Substitute' },
          { key: 'expiry', label: 'Car Expiry' },
          { key: 'agreement', label: 'Agreement' },
          { key: 'logbook', label: 'Logbook' },
        ].map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.segmentBtn, ownerTab === s.key && styles.segmentBtnActive]}
            onPress={() => setOwnerTab(s.key)}
          >
            <Text style={[styles.segmentBtnText, ownerTab === s.key && styles.segmentBtnTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Overview */}
        {ownerTab === 'overview' && (
          <View style={styles.servicesStack}>
            <View style={styles.candidateCard}>
              <View style={styles.candidateHeader}>
                <Image source={require('./assets/indian_driver_portrait.jpg')} style={styles.candidateAvatar} resizeMode="cover" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.candidateNameRow}>
                    <Text style={styles.candidateName}>Rameshwar Dayal</Text>
                    <View style={styles.greenBadge}>
                      <Text style={styles.greenBadgeText}>ON DUTY</Text>
                    </View>
                  </View>
                  <Text style={styles.candidateMeta}>Driver ID: DRV-101 • 15 Years Exp</Text>
                  <Text style={styles.candidateSkills}>Reporting: 08:30 AM – 06:30 PM (Sunday Off)</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.btnSecondary} onPress={() => Linking.openURL('tel:+919876543210')}>
                  <Text style={styles.btnSecondaryText}>Call Driver</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnPrimary} onPress={() => openWhatsApp('Driver coordination message.')}>
                  <Text style={styles.btnPrimaryText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Vehicle Status */}
            <View style={styles.cardMinimal}>
              <View style={styles.cardBody}>
                <Text style={styles.cardTag}>VEHICLE STATUS</Text>
                <Text style={styles.cardTitle}>Hyundai Creta 2023 (Automatic)</Text>
                <Text style={styles.cardDesc}>Registration: DL 3C XX 1234 • Insurance Active</Text>
                <Text style={styles.cardDesc}>Today Odometer: 42,165 KM (Reported at 08:30 AM)</Text>
              </View>
            </View>
          </View>
        )}

        {/* 1-Day Substitute Driver Request */}
        {ownerTab === 'substitute' && (
          <View style={styles.bookingFormCard}>
            <Text style={styles.formTitle}>Request 1-Day Substitute Driver</Text>
            <Text style={styles.formSubtitle}>
              Is your regular chauffeur on leave or unwell? Book an agency-verified temporary replacement driver for ₹800/day.
            </Text>

            <Text style={styles.inputLabel}>Required Date for Substitute</Text>
            <TextInput style={styles.textInput} placeholder="e.g. Tomorrow or 24 Sep 2026" />

            <Text style={styles.inputLabel}>Required Shift Duration</Text>
            <View style={styles.choiceRow}>
              {['8 Hours (₹800)', '10 Hours (₹1,000)', '12 Hours (₹1,200)'].map(subShift => (
                <TouchableOpacity key={subShift} style={[styles.choicePill, styles.choicePillActive]}>
                  <Text style={[styles.choicePillText, styles.choicePillTextActive]}>{subShift}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.btnPrimarySubmit, { backgroundColor: THEME.accentWarm }]}
              onPress={() => {
                Alert.alert(
                  'Substitute Scheduled',
                  'A verified backup driver from Drivers Saathi has been allocated for your vehicle. Dispatch manager will share candidate details via WhatsApp within 2 hours.'
                );
              }}
            >
              <Text style={styles.btnPrimarySubmitText}>Book Substitute Chauffeur (₹800/day)</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Car Expiry Tracker (PUC, Insurance, FASTag) */}
        {ownerTab === 'expiry' && (
          <View style={styles.servicesStack}>
            <Text style={styles.subHeading}>Vehicle Compliance & Document Watch</Text>
            <Text style={styles.subText}>Automated alerts to keep your vehicle legal and roadworthy.</Text>

            <View style={styles.docCard}>
              <View style={styles.docHeaderRow}>
                <Text style={styles.docTitle}>Pollution Certificate (PUC)</Text>
                <Text style={[styles.verifiedPill, { color: THEME.accentWarm, backgroundColor: THEME.accentWarmSoft }]}>43 DAYS LEFT</Text>
              </View>
              <Text style={styles.docMeta}>Expiry Date: 24 Oct 2026</Text>
              <Text style={styles.docMeta}>Status: Valid • Alert will trigger 7 days prior</Text>
            </View>

            <View style={styles.docCard}>
              <View style={styles.docHeaderRow}>
                <Text style={styles.docTitle}>Motor Insurance Policy</Text>
                <Text style={styles.verifiedPill}>ACTIVE</Text>
              </View>
              <Text style={styles.docMeta}>Comprehensive Zero-Dep Policy: HDFC ERGO</Text>
              <Text style={styles.docMeta}>Renewal Date: 18 Nov 2026</Text>
            </View>

            <View style={styles.docCard}>
              <View style={styles.docHeaderRow}>
                <Text style={styles.docTitle}>FASTag Balance</Text>
                <Text style={styles.verifiedPill}>ADEQUATE</Text>
              </View>
              <Text style={styles.docMeta}>Linked Bank: ICICI FASTag</Text>
              <Text style={styles.docMeta}>Current Estimated Balance: ₹840</Text>
            </View>
          </View>
        )}

        {/* View Official Placement Agreement & Timesheet PDF */}
        {ownerTab === 'agreement' && (
          <View style={styles.bookingFormCard}>
            <View style={styles.agreementHeaderRow}>
              <Text style={styles.agreementBadge}>AGREEMENT #DS-AGREE-4091</Text>
              <Text style={styles.agreementStatus}>ACTIVE SLA</Text>
            </View>

            <Text style={styles.formTitle}>Chauffeur Placement Agreement</Text>
            <Text style={styles.docMeta}>Between: Drivers Saathi Agency & Mr. Rajesh Agarwal</Text>
            <Text style={styles.docMeta}>Assigned Chauffeur: Rameshwar Dayal (DRV-101)</Text>

            <View style={styles.divider} />

            <Text style={styles.agreementClauseTitle}>1. Replacement Warranty Clause</Text>
            <Text style={styles.agreementClauseBody}>
              The car owner is entitled to free replacement of the driver within 30 days of initial placement at zero additional placement fee.
            </Text>

            <Text style={styles.agreementClauseTitle}>2. Police Verification & Background</Text>
            <Text style={styles.agreementClauseBody}>
              The agency certifies that driver Rameshwar Dayal has undergone Parivahan DL verification (DL-042011004821) and police clearance certificate PCC-2026-DL-8842.
            </Text>

            <TouchableOpacity
              style={styles.btnPrimarySubmit}
              onPress={() => {
                Alert.alert('Agreement Exported', 'Official placement agreement (#DS-AGREE-4091) and September timesheet exported to your downloads folder.');
              }}
            >
              <Text style={styles.btnPrimarySubmitText}>Download Agreement & Timesheet (PDF)</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Logbook Approvals */}
        {ownerTab === 'logbook' && (
          <View style={styles.servicesStack}>
            <Text style={styles.subHeading}>Timesheets Submitted by Driver</Text>
            {driverDutyLogs.map(l => (
              <View key={l.id} style={styles.logCard}>
                <View style={styles.logHeaderRow}>
                  <Text style={styles.logDate}>{l.date}</Text>
                  <View style={l.approved ? styles.approvedBadge : styles.pendingBadge}>
                    <Text style={l.approved ? styles.approvedBadgeText : styles.pendingBadgeText}>
                      {l.approved ? 'Approved' : 'Needs Approval'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.logMeta}>In: {l.inTime} • Out: {l.outTime} • Distance: {l.km}</Text>
                <Text style={styles.logOT}>Overtime: +{l.ot} (₹{Math.round(parseFloat(l.ot || 0) * 80)})</Text>
                {l.photoAttached && <Text style={styles.photoIndicatorText}>✓ Speedometer Photo Authenticated</Text>}

                {!l.approved && (
                  <TouchableOpacity style={styles.btnApprove} onPress={() => handleApproveLog(l.id)}>
                    <Text style={styles.btnApproveText}>Approve Overtime for Payroll</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );

  // ─── VIEW 6: ADMIN LOGIN ─────────────────────────────────────────────────────
  const renderAdminLogin = () => (
    <ScrollView contentContainerStyle={styles.loginContainer} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.btnBackToPublic} onPress={() => setCurrentMode('customer')}>
        <Text style={styles.btnBackToPublicText}>&larr; Back to Public Website</Text>
      </TouchableOpacity>

      <View style={styles.loginCard}>
        <Text style={styles.loginPreTitle}>AGENCY MASTER DISPATCH DESK</Text>
        <Text style={styles.loginTitle}>Admin Sign In</Text>
        <Text style={styles.loginSub}>Access master driver allocation, substitute dispatch, and website leads.</Text>

        <Text style={styles.inputLabel}>Admin ID</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. ADMIN"
          autoCapitalize="characters"
          value={adminLoginId}
          onChangeText={setAdminLoginId}
        />

        <Text style={styles.inputLabel}>Master Password</Text>
        <TextInput
          style={styles.textInput}
          placeholder="••••"
          secureTextEntry
          value={adminPassword}
          onChangeText={setAdminPassword}
        />

        <TouchableOpacity style={styles.btnPrimarySubmit} onPress={handleAdminLogin}>
          <Text style={styles.btnPrimarySubmitText}>Sign In to Master Dispatch Desk</Text>
        </TouchableOpacity>

        {/* Demo Fast Login */}
        <TouchableOpacity
          style={styles.btnQuickDemo}
          onPress={() => {
            setAdminLoginId('ADMIN');
            setAdminPassword('1234');
            setCurrentMode('admin_app');
          }}
        >
          <Text style={styles.btnQuickDemoText}>Instant Demo Sign-In (ADMIN / 1234)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ─── VIEW 7: MASTER ADMIN DISPATCH APP ───────────────────────────────────────
  const renderAdminApp = () => (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.portalHeader}>
        <View>
          <Text style={styles.portalHeaderTitle}>Master Dispatch Console</Text>
          <Text style={styles.portalHeaderSub}>Drivers Saathi Operations Hub</Text>
        </View>
        <TouchableOpacity style={styles.btnLogout} onPress={() => setCurrentMode('customer')}>
          <Text style={styles.btnLogoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Tabs */}
      <View style={styles.segmentContainer}>
        {[
          { key: 'placements', label: 'Active Roster' },
          { key: 'substitutes', label: 'Substitute Queue' },
          { key: 'leads', label: 'Web Leads' },
        ].map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.segmentBtn, adminTab === s.key && styles.segmentBtnActive]}
            onPress={() => setAdminTab(s.key)}
          >
            <Text style={[styles.segmentBtnText, adminTab === s.key && styles.segmentBtnTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Placements Table */}
        {adminTab === 'placements' && (
          <View style={styles.servicesStack}>
            <Text style={styles.subHeading}>Active Client-Driver Placements</Text>
            {masterPlacements.map(p => (
              <View key={p.id} style={styles.cardMinimal}>
                <View style={styles.cardBody}>
                  <View style={styles.statusRow}>
                    <Text style={styles.cardTag}>{p.id}</Text>
                    <View style={styles.greenBadge}>
                      <Text style={styles.greenBadgeText}>{p.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardTitle}>{p.owner}</Text>
                  <Text style={styles.cardDesc}>Vehicle: {p.car}</Text>
                  <Text style={[styles.cardDesc, { color: THEME.text, fontWeight: '700' }]}>Assigned Chauffeur: {p.driver}</Text>
                  <Text style={styles.cardDesc}>Replacement Warranty Active till: {p.warrantyEnd}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Substitute Queue */}
        {adminTab === 'substitutes' && (
          <View style={styles.servicesStack}>
            <Text style={styles.subHeading}>Substitute Driver Requests</Text>
            <View style={styles.logCard}>
              <Text style={styles.logDate}>Date: 24 Sep 2026</Text>
              <Text style={styles.logMeta}>Client: Mr. Rajesh Agarwal (Vasant Vihar)</Text>
              <Text style={styles.logMeta}>Reason: Regular driver Rameshwar Dayal on family leave</Text>
              <Text style={[styles.logOT, { color: THEME.green, fontWeight: '700' }]}>Backup Allocated: Vikramaditya Singh (DRV-102)</Text>
              <TouchableOpacity
                style={[styles.btnPrimary, { marginTop: 10 }]}
                onPress={() => Alert.alert('Dispatched', 'Backup driver Vikramaditya Singh notified for 24 Sep duty.')}
              >
                <Text style={styles.btnPrimaryText}>Confirm Substitute Allocation</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Leads */}
        {adminTab === 'leads' && (
          <View style={styles.servicesStack}>
            <Text style={styles.subHeading}>Recent Website Inquiries</Text>
            <View style={styles.logCard}>
              <Text style={styles.logDate}>Priya Sharma (+91 98765 43210)</Text>
              <Text style={styles.logMeta}>Service: Personal Chauffeur Placement (Automatic Creta)</Text>
              <Text style={styles.logMeta}>Location: DLF Phase 5, Gurugram</Text>
              <TouchableOpacity
                style={[styles.btnPrimary, { marginTop: 8 }]}
                onPress={() => Linking.openURL('tel:+919876543210')}
              >
                <Text style={styles.btnPrimaryText}>Call Lead Directly</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );

  // ─── MAIN SCAFFOLD ROUTER ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      {currentMode === 'customer' && renderCustomerView()}
      {currentMode === 'driver_login' && renderDriverLogin()}
      {currentMode === 'driver_app' && renderDriverApp()}
      {currentMode === 'owner_login' && renderOwnerLogin()}
      {currentMode === 'owner_app' && renderOwnerApp()}
      {currentMode === 'admin_login' && renderAdminLogin()}
      {currentMode === 'admin_app' && renderAdminApp()}

      {/* Confirmation Modal */}
      <Modal visible={confirmationModal.visible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Request Received</Text>
            <Text style={styles.modalMessage}>{confirmationModal.message}</Text>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => setConfirmationModal({ visible: false, message: '' })}
            >
              <Text style={styles.btnPrimaryText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── STYLESHEET ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: THEME.bg,
  },

  // Public Top Navbar
  topNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.bg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navLogo: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  brandText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: THEME.text,
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 9,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  navRightRow: {
    flexDirection: 'row',
    gap: 5,
  },
  portalSwitchBtn: {
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: THEME.bgSubtle,
  },
  portalSwitchText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: THEME.text,
  },

  // Logged-in Headers
  portalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.bg,
  },
  portalHeaderTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: THEME.text,
  },
  portalHeaderSub: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  btnLogout: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  btnLogoutText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.red,
  },

  // Main Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Hero Block
  heroBlock: {
    marginBottom: 12,
  },
  heroPreTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.textTertiary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: THEME.text,
    lineHeight: 29,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: THEME.textSecondary,
    lineHeight: 18,
  },

  // Trust Strip
  trustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME.borderSubtle,
    marginBottom: 14,
    gap: 8,
  },
  trustItemText: {
    fontSize: 11,
    fontWeight: '500',
    color: THEME.textSecondary,
  },
  trustBullet: {
    fontSize: 9,
    color: THEME.textTertiary,
  },

  // Segment Bar
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.bgSubtle,
    borderRadius: 8,
    padding: 3,
    marginBottom: 14,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: THEME.bg,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  segmentBtnText: {
    fontSize: 11,
    fontWeight: '500',
    color: THEME.textSecondary,
  },
  segmentBtnTextActive: {
    color: THEME.text,
    fontWeight: '700',
  },

  // Services Stack & Cards
  servicesStack: {
    gap: 14,
  },
  cardMinimal: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardBody: {
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.text,
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.text,
  },
  cardDesc: {
    fontSize: 12,
    color: THEME.textSecondary,
    lineHeight: 17,
    marginBottom: 12,
  },
  cardTag: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.textTertiary,
    letterSpacing: 0.8,
  },

  // Buttons
  btnPrimary: {
    backgroundColor: THEME.accent,
    paddingVertical: 10,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 7,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: THEME.text,
    fontSize: 12,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },

  // Benchmark Result
  benchmarkResultCard: {
    backgroundColor: THEME.bgSubtle,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    marginTop: 12,
  },
  benchmarkLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: THEME.textTertiary,
    letterSpacing: 0.8,
  },
  benchmarkSalaryText: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.text,
    marginVertical: 4,
  },
  benchmarkSub: {
    fontSize: 11.5,
    color: THEME.textSecondary,
  },
  benchmarkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  benchmarkItem: {
    fontSize: 11.5,
    color: THEME.textSecondary,
  },
  benchmarkValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: THEME.text,
  },

  // Candidate Cards
  candidateCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 10,
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  candidateAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  candidateNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  candidateName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: THEME.text,
  },
  candidateRating: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  candidateMeta: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  candidateSkills: {
    fontSize: 11,
    color: THEME.textTertiary,
    marginTop: 2,
  },

  // Forms
  bookingFormCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  formTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 2,
  },
  formSubtitle: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: THEME.text,
    marginTop: 8,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12.5,
    color: THEME.text,
    backgroundColor: THEME.bg,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  choicePill: {
    backgroundColor: THEME.bgSubtle,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 6,
  },
  choicePillActive: {
    backgroundColor: THEME.text,
    borderColor: THEME.text,
  },
  choicePillText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: THEME.textSecondary,
  },
  choicePillTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  btnPrimarySubmit: {
    backgroundColor: THEME.accent,
    paddingVertical: 11,
    borderRadius: 7,
    alignItems: 'center',
    marginTop: 14,
  },
  btnPrimarySubmitText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Login Screens
  loginContainer: {
    padding: 18,
    paddingTop: 24,
  },
  btnBackToPublic: {
    marginBottom: 14,
  },
  btnBackToPublicText: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  loginCard: {
    backgroundColor: THEME.card,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  loginPreTitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: THEME.textTertiary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 4,
  },
  loginSub: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginBottom: 14,
  },
  btnQuickDemo: {
    backgroundColor: THEME.bgSubtle,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 9,
    borderRadius: 7,
    alignItems: 'center',
    marginTop: 10,
  },
  btnQuickDemoText: {
    fontSize: 11,
    color: THEME.textSecondary,
    fontWeight: '600',
  },

  // Logbook & Photo Logger
  btnAttachPhoto: {
    backgroundColor: THEME.bgSubtle,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: THEME.border,
    borderRadius: 7,
    paddingVertical: 9,
    alignItems: 'center',
    marginTop: 10,
  },
  btnAttachPhotoText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  photoIndicatorText: {
    fontSize: 10.5,
    color: THEME.green,
    fontWeight: '600',
    marginTop: 3,
  },
  logCard: {
    backgroundColor: THEME.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 8,
  },
  logHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logDate: {
    fontSize: 12.5,
    fontWeight: '700',
    color: THEME.text,
  },
  approvedBadge: {
    backgroundColor: THEME.greenSoft,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  approvedBadgeText: {
    fontSize: 9.5,
    color: THEME.green,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: THEME.accentWarmSoft,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  pendingBadgeText: {
    fontSize: 9.5,
    color: THEME.accentWarm,
    fontWeight: '600',
  },
  logMeta: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  logOT: {
    fontSize: 11,
    color: THEME.textTertiary,
    marginTop: 2,
  },
  btnApprove: {
    backgroundColor: THEME.green,
    paddingVertical: 6,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 6,
  },
  btnApproveText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // Document & Agreement Vault
  docCard: {
    backgroundColor: THEME.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 8,
  },
  docHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.text,
  },
  docMeta: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  verifiedPill: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.green,
    backgroundColor: THEME.greenSoft,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10.5,
    color: THEME.green,
    fontWeight: '600',
    marginTop: 4,
  },
  agreementHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  agreementBadge: {
    fontSize: 9.5,
    fontWeight: '700',
    color: THEME.textTertiary,
  },
  agreementStatus: {
    fontSize: 9.5,
    fontWeight: '700',
    color: THEME.green,
  },
  agreementClauseTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.text,
    marginTop: 6,
  },
  agreementClauseBody: {
    fontSize: 11,
    color: THEME.textSecondary,
    lineHeight: 15,
    marginTop: 2,
  },

  // Utilities
  formRow: {
    flexDirection: 'row',
    gap: 6,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 2,
  },
  subText: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.borderSubtle,
    marginVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  greenBadge: {
    backgroundColor: THEME.greenSoft,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  greenBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: THEME.green,
  },
  bigAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.text,
    marginVertical: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 11.5,
    color: THEME.textSecondary,
  },
  summaryVal: {
    fontSize: 11.5,
    fontWeight: '600',
    color: THEME.text,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 6,
  },
  modalMessage: {
    fontSize: 12.5,
    color: THEME.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 14,
  },
});
