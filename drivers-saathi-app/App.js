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
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Minimal Executive Palette ────────────────────────────────────────────────
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

// ─── Verified Candidates for Customer View ────────────────────────────────────
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
  // Global Mode: 'customer' | 'driver_login' | 'driver_app' | 'owner_login' | 'owner_app'
  const [currentMode, setCurrentMode] = useState('customer');

  // Customer State
  const [customerTab, setCustomerTab] = useState('services'); // 'services' | 'candidates' | 'book' | 'help'
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
  const [driverTab, setDriverTab] = useState('duty'); // 'duty' | 'logbook' | 'docs' | 'salary'
  const [driverDutyStatus, setDriverDutyStatus] = useState('Checked In (08:30 AM)');
  const [driverDutyLogs, setDriverDutyLogs] = useState([
    { id: 'dl1', date: '2026-09-10', inTime: '08:30 AM', outTime: '07:15 PM', startKm: '42,100', endKm: '42,165', km: '65 km', ot: '1.5 hrs', approved: true },
    { id: 'dl2', date: '2026-09-09', inTime: '08:30 AM', outTime: '07:45 PM', startKm: '42,020', endKm: '42,100', km: '80 km', ot: '2.0 hrs', approved: true },
  ]);
  const [newLogDate, setNewLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLogIn, setNewLogIn] = useState('08:30 AM');
  const [newLogOut, setNewLogOut] = useState('07:00 PM');
  const [newStartKm, setNewStartKm] = useState('42,165');
  const [newEndKm, setNewEndKm] = useState('42,220');
  const [newOT, setNewOT] = useState('1.5');

  // Owner Credentials & App State
  const [ownerLoginId, setOwnerLoginId] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerTab, setOwnerTab] = useState('overview'); // 'overview' | 'docs' | 'logbook' | 'replacement'

  // Load Saved Logs
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@ds_shared_duty_logs');
        if (saved) setDriverDutyLogs(JSON.parse(saved));
      } catch (e) {}
    })();
  }, []);

  const openCall = () => Linking.openURL('tel:+918175087004');

  const openWhatsApp = (msg = '') => {
    const text = msg || 'Hello Drivers Saathi, I have an inquiry regarding your driver services in Delhi NCR.';
    Linking.openURL(`https://wa.me/918175087004?text=${encodeURIComponent(text)}`);
  };

  // ─── CUSTOMER ACTIONS ────────────────────────────────────────────────────────
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
      _autoresponse: `Thank you ${bookingForm.name} for choosing Drivers Saathi! Your inquiry #${bookingId} has been received. Our account manager will connect with you within 4 hours. Helpline: +91 8175087004`,
    };

    try {
      await fetch('https://formsubmit.co/ajax/support@driverssaathi.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      setConfirmationModal({
        visible: true,
        message: `Thank you, ${bookingForm.name}!\n\nYour request for ${bookingForm.serviceType} has been received (Ref #${bookingId}).\n\nOur account manager will contact you within 4 hours to confirm driver candidate availability.`,
      });
      setBookingForm({ name: '', phone: '', car: '', location: '', serviceType: 'Personal Chauffeur Placement', transmission: 'Automatic' });
    } catch (e) {
      Alert.alert('Notice', 'Inquiry recorded. Our team will contact you shortly.');
    } finally {
      setLoading(false);
    }
  };

  // ─── DRIVER ACTIONS ──────────────────────────────────────────────────────────
  const handleDriverLogin = () => {
    if ((driverLoginId.trim() === 'DRV-101' || driverLoginId.trim() === '9876543210') && driverPassword === '1234') {
      setCurrentMode('driver_app');
    } else {
      Alert.alert('Invalid Credentials', 'Please use Demo Driver ID: DRV-101 and Password: 1234');
    }
  };

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
      approved: false, // requires owner approval
    };

    const updated = [newEntry, ...driverDutyLogs];
    setDriverDutyLogs(updated);
    await AsyncStorage.setItem('@ds_shared_duty_logs', JSON.stringify(updated));
    Alert.alert('Timesheet Logged', `Logged duty for ${newLogDate}. Submitted to car owner for overtime approval.`);
  };

  // ─── OWNER ACTIONS ───────────────────────────────────────────────────────────
  const handleOwnerLogin = () => {
    if ((ownerLoginId.trim() === 'OWN-501' || ownerLoginId.trim() === '9811023456') && ownerPassword === '1234') {
      setCurrentMode('owner_app');
    } else {
      Alert.alert('Invalid Credentials', 'Please use Demo Owner ID: OWN-501 and Password: 1234');
    }
  };

  const handleApproveLog = async (logId) => {
    const updated = driverDutyLogs.map(l => l.id === logId ? { ...l, approved: true } : l);
    setDriverDutyLogs(updated);
    await AsyncStorage.setItem('@ds_shared_duty_logs', JSON.stringify(updated));
    Alert.alert('Timesheet Approved', 'Overtime hours have been authenticated for monthly payroll.');
  };

  // ─── RENDER 1: CUSTOMER APP (WEBSITE STYLE) ─────────────────────────────────
  const renderCustomerView = () => (
    <View style={{ flex: 1 }}>
      {/* Top Navbar with Driver & Owner Login Access */}
      <View style={styles.topNavbar}>
        <View style={styles.brandRow}>
          <Image source={require('./assets/driver-saathi-logo-light.png')} style={styles.navLogo} resizeMode="contain" />
          <View>
            <Text style={styles.brandText}>DRIVERS SAATHI</Text>
            <Text style={styles.brandSub}>Delhi NCR</Text>
          </View>
        </View>

        {/* Portal Switching Buttons */}
        <View style={styles.navRightRow}>
          <TouchableOpacity
            style={styles.portalSwitchBtn}
            onPress={() => {
              setDriverLoginId('DRV-101');
              setDriverPassword('1234');
              setCurrentMode('driver_login');
            }}
          >
            <Text style={styles.portalSwitchText}>Driver Portal</Text>
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
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Editorial Hero */}
        <View style={styles.heroBlock}>
          <Text style={styles.heroPreTitle}>DELHI NCR CHAUFFEUR PLACEMENTS</Text>
          <Text style={styles.heroTitle}>Professional Drivers for Your Personal Car</Text>
          <Text style={styles.heroSubtitle}>
            Trained, police-cleared chauffeurs for daily office commute, outstation highway journeys, and corporate fleets. Includes a 30-day replacement warranty.
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
                  Experienced commercial drivers for expressway travel to Agra, Jaipur, Chandigarh, and Uttarakhand. FASTag and toll assistance included.
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

        {/* Sub-Tab 2: Candidates */}
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

        {/* Sub-Tab 3: Booking Form (Website Style) */}
        {customerTab === 'book' && (
          <View style={styles.bookingFormCard}>
            <Text style={styles.formTitle}>Book a Verified Driver</Text>
            <Text style={styles.formSubtitle}>Submit requirements. Our account manager will call you with candidate profiles.</Text>

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
                  <Text style={[styles.choicePillText, bookingForm.serviceType.includes(st) && styles.choicePillTextActive]}>
                    {st}
                  </Text>
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
                  <Text style={[styles.choicePillText, bookingForm.transmission === t && styles.choicePillTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.btnPrimarySubmit} onPress={handleCustomerBookingSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnPrimarySubmitText}>Submit Driver Request</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Sub-Tab 4: Help */}
        {customerTab === 'help' && (
          <View style={styles.servicesStack}>
            <View style={styles.cardMinimal}>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>Direct Dispatch Desk</Text>
                <Text style={styles.cardDesc}>Connect with our client coordination team in Delhi NCR.</Text>
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

  // ─── RENDER 2: DRIVER LOGIN SCREEN ───────────────────────────────────────────
  const renderDriverLogin = () => (
    <ScrollView contentContainerStyle={styles.loginContainer} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.btnBackToPublic} onPress={() => setCurrentMode('customer')}>
        <Text style={styles.btnBackToPublicText}>&larr; Back to Website</Text>
      </TouchableOpacity>

      <View style={styles.loginCard}>
        <Text style={styles.loginPreTitle}>DRIVER PARTNER PORTAL</Text>
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

        {/* Quick Demo Fill Button */}
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

  // ─── RENDER 3: DRIVER COMPANION APP ──────────────────────────────────────────
  const renderDriverApp = () => (
    <View style={{ flex: 1 }}>
      {/* Driver App Header */}
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
          { key: 'logbook', label: 'Duty Log' },
          { key: 'docs', label: 'Documents' },
          { key: 'salary', label: 'Earnings' },
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
        {/* Sub-Tab 1: Today Duty */}
        {driverTab === 'duty' && (
          <View>
            <View style={styles.cardMinimal}>
              <View style={styles.cardBody}>
                <View style={styles.statusRow}>
                  <Text style={styles.cardTag}>ACTIVE PLACEMENT</Text>
                  <View style={styles.greenBadge}>
                    <Text style={styles.greenBadgeText}>ON DUTY</Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>Client: Mr. Rajesh Agarwal</Text>
                <Text style={styles.cardDesc}>Vehicle: Hyundai Creta 2023 (DL 3C XX 1234) • Automatic</Text>
                <Text style={styles.cardDesc}>Reporting Hours: 08:30 AM – 06:30 PM (10 Hours)</Text>
                <Text style={[styles.cardDesc, { marginTop: 4, color: THEME.text }]}>
                  📍 Pickup: Villa 14, Poorvi Marg, Vasant Vihar, South Delhi
                </Text>

                <View style={styles.divider} />

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.btnSecondary} onPress={() => Linking.openURL('tel:+919811023456')}>
                    <Text style={styles.btnSecondaryText}>Call Car Owner</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={() => Alert.alert('Check-In Confirmed', 'Check-in time recorded at 08:30 AM. Have a safe duty!')}
                  >
                    <Text style={styles.btnPrimaryText}>Record Check-In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Sub-Tab 2: Digital Logbook */}
        {driverTab === 'logbook' && (
          <View>
            <View style={styles.bookingFormCard}>
              <Text style={styles.formTitle}>Record Daily Duty & Overtime</Text>
              <Text style={styles.formSubtitle}>Submit your daily kilometer readings and hours for owner approval.</Text>

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Duty Date</Text>
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

              <TouchableOpacity style={styles.btnPrimarySubmit} onPress={handleSaveDriverLog}>
                <Text style={styles.btnPrimarySubmitText}>Submit Duty Entry to Owner</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.subHeading, { marginTop: 16 }]}>Past Recorded Logbook</Text>
            {driverDutyLogs.map(l => (
              <View key={l.id} style={styles.logCard}>
                <View style={styles.logHeaderRow}>
                  <Text style={styles.logDate}>{l.date}</Text>
                  <View style={l.approved ? styles.approvedBadge : styles.pendingBadge}>
                    <Text style={l.approved ? styles.approvedBadgeText : styles.pendingBadgeText}>
                      {l.approved ? 'Approved by Owner' : 'Pending Approval'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.logMeta}>In: {l.inTime} • Out: {l.outTime} • Distance: {l.km}</Text>
                <Text style={styles.logOT}>Overtime: +{l.ot} (Payable: ₹{Math.round(parseFloat(l.ot || 0) * 80)})</Text>
              </View>
            ))}
          </View>
        )}

        {/* Sub-Tab 3: Verified Documents */}
        {driverTab === 'docs' && (
          <View style={styles.servicesStack}>
            <View style={styles.docCard}>
              <Text style={styles.docTitle}>Commercial Driving License (LMV/Transport)</Text>
              <Text style={styles.docMeta}>DL No: DL-042011004821 • Valid till 14 Oct 2028</Text>
              <View style={styles.verifiedRow}>
                <Text style={styles.verifiedText}>✓ Parivahan Verified</Text>
              </View>
            </View>

            <View style={styles.docCard}>
              <Text style={styles.docTitle}>Delhi Police Background Clearance</Text>
              <Text style={styles.docMeta}>Verification Certificate No: PCC-2026-DL-8842</Text>
              <View style={styles.verifiedRow}>
                <Text style={styles.verifiedText}>✓ Clear Record (Zero Criminal Filings)</Text>
              </View>
            </View>

            <View style={styles.docCard}>
              <Text style={styles.docTitle}>Aadhaar Identity Verification</Text>
              <Text style={styles.docMeta}>UIDAI Authenticated: XXXX-XXXX-4821</Text>
              <View style={styles.verifiedRow}>
                <Text style={styles.verifiedText}>✓ Biometric & Address Authenticated</Text>
              </View>
            </View>
          </View>
        )}

        {/* Sub-Tab 4: Salary & Earnings */}
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

                <TouchableOpacity
                  style={[styles.btnPrimary, { marginTop: 14 }]}
                  onPress={() => Alert.alert('Salary Payout', 'Your salary of ₹24,340 will be credited directly to your bank account on 1st October.')}
                >
                  <Text style={styles.btnPrimaryText}>View Bank Account Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );

  // ─── RENDER 4: OWNER LOGIN SCREEN ────────────────────────────────────────────
  const renderOwnerLogin = () => (
    <ScrollView contentContainerStyle={styles.loginContainer} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.btnBackToPublic} onPress={() => setCurrentMode('customer')}>
        <Text style={styles.btnBackToPublicText}>&larr; Back to Website</Text>
      </TouchableOpacity>

      <View style={styles.loginCard}>
        <Text style={[styles.loginPreTitle, { color: THEME.accentWarm }]}>CAR OWNER / FLEET PORTAL</Text>
        <Text style={styles.loginTitle}>Owner Sign In</Text>
        <Text style={styles.loginSub}>Access your assigned driver's documents, live status, and logbook.</Text>

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

        {/* Quick Demo Fill Button */}
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

  // ─── RENDER 5: CAR OWNER / FLEET PORTAL ───────────────────────────────────────
  const renderOwnerApp = () => (
    <View style={{ flex: 1 }}>
      {/* Owner App Header */}
      <View style={[styles.portalHeader, { borderBottomColor: THEME.border }]}>
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
          { key: 'docs', label: 'Verification Docs' },
          { key: 'logbook', label: 'Timesheet & OT' },
          { key: 'replacement', label: '30-Day SLA' },
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
        {/* Sub-Tab 1: Assigned Driver Overview */}
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

            {/* Quick Vehicle Stats */}
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

        {/* Sub-Tab 2: Driver Verification Document Vault */}
        {ownerTab === 'docs' && (
          <View style={styles.servicesStack}>
            <Text style={styles.subHeading}>Authenticated Background Records</Text>
            <Text style={styles.subText}>Verified documents on file for driver Rameshwar Dayal.</Text>

            <View style={styles.docCard}>
              <View style={styles.docHeaderRow}>
                <Text style={styles.docTitle}>Driving License Authenticity</Text>
                <Text style={styles.verifiedPill}>PARIVAHAN VERIFIED</Text>
              </View>
              <Text style={styles.docMeta}>DL No: DL-042011004821</Text>
              <Text style={styles.docMeta}>Class: LMV / Transport Badge</Text>
              <Text style={styles.docMeta}>Validity: Valid till 14 Oct 2028 (Active)</Text>
            </View>

            <View style={styles.docCard}>
              <View style={styles.docHeaderRow}>
                <Text style={styles.docTitle}>Delhi Police Clearance Certificate</Text>
                <Text style={styles.verifiedPill}>POLICE CLEARED</Text>
              </View>
              <Text style={styles.docMeta}>Reference: PCC-2026-DL-8842</Text>
              <Text style={styles.docMeta}>Status: No criminal or traffic record found.</Text>
            </View>

            <View style={styles.docCard}>
              <View style={styles.docHeaderRow}>
                <Text style={styles.docTitle}>Aadhaar Identity Verification</Text>
                <Text style={styles.verifiedPill}>UIDAI MATCHED</Text>
              </View>
              <Text style={styles.docMeta}>Aadhaar: XXXX-XXXX-4821</Text>
              <Text style={styles.docMeta}>Permanent Address: Alwar, Rajasthan (NCR Resident 12 yrs)</Text>
            </View>
          </View>
        )}

        {/* Sub-Tab 3: Duty Logbook & Approvals */}
        {ownerTab === 'logbook' && (
          <View style={styles.servicesStack}>
            <Text style={styles.subHeading}>Daily Timesheets Submitted by Driver</Text>
            <Text style={styles.subText}>Review hours, kilometers run, and authenticate overtime payouts.</Text>

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
                <Text style={styles.logOT}>Overtime: +{l.ot} (Amount: ₹{Math.round(parseFloat(l.ot || 0) * 80)})</Text>

                {!l.approved && (
                  <TouchableOpacity style={styles.btnApprove} onPress={() => handleApproveLog(l.id)}>
                    <Text style={styles.btnApproveText}>Approve Overtime for Payroll</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Sub-Tab 4: 30-Day Free Replacement Claim */}
        {ownerTab === 'replacement' && (
          <View style={styles.bookingFormCard}>
            <Text style={styles.formTitle}>30-Day Free Replacement SLA</Text>
            <Text style={styles.formSubtitle}>
              You have active warranty coverage for placement #DS-9042 (23 days remaining). Request a replacement at zero extra placement fee.
            </Text>

            <Text style={styles.inputLabel}>Reason for Replacement Claim *</Text>
            <TextInput
              style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
              multiline
              placeholder="e.g. Unpunctuality / route knowledge / personal reasons"
            />

            <TouchableOpacity
              style={[styles.btnPrimarySubmit, { backgroundColor: THEME.red }]}
              onPress={() => {
                Alert.alert(
                  'Claim Submitted',
                  'Your priority replacement claim is registered. Our dispatch manager will call you within 2 hours with 2 new candidate profiles.'
                );
              }}
            >
              <Text style={styles.btnPrimarySubmitText}>Submit Priority Replacement Claim</Text>
            </TouchableOpacity>
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

// ─── MINIMAL ENTERPRISE STYLESHEET ────────────────────────────────────────────
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
    paddingHorizontal: 16,
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
    fontSize: 14,
    fontWeight: '800',
    color: THEME.text,
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 9.5,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  navRightRow: {
    flexDirection: 'row',
    gap: 6,
  },
  portalSwitchBtn: {
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 6,
    backgroundColor: THEME.bgSubtle,
  },
  portalSwitchText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.text,
  },

  // Portal Logged-in Headers
  portalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.bg,
  },
  portalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.text,
  },
  portalHeaderSub: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  btnLogout: {
    paddingVertical: 5,
    paddingHorizontal: 10,
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
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
  },

  // Hero Block
  heroBlock: {
    marginBottom: 14,
  },
  heroPreTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.textTertiary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.text,
    lineHeight: 30,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 19,
  },

  // Trust Strip
  trustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME.borderSubtle,
    marginBottom: 16,
    gap: 8,
  },
  trustItemText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: THEME.textSecondary,
  },
  trustBullet: {
    fontSize: 10,
    color: THEME.textTertiary,
  },

  // Segment Bar
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.bgSubtle,
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
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
    fontSize: 11.5,
    fontWeight: '500',
    color: THEME.textSecondary,
  },
  segmentBtnTextActive: {
    color: THEME.text,
    fontWeight: '700',
  },

  // Services Stack & Cards
  servicesStack: {
    gap: 16,
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
    fontSize: 15.5,
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
    fontSize: 9.5,
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

  // Candidate Cards
  candidateCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 12,
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  candidateAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    fontSize: 11.5,
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
    fontSize: 17,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 2,
  },
  formSubtitle: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: THEME.text,
    marginTop: 10,
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
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  choicePillActive: {
    backgroundColor: THEME.text,
    borderColor: THEME.text,
  },
  choicePillText: {
    fontSize: 11,
    fontWeight: '500',
    color: THEME.textSecondary,
  },
  choicePillTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  btnPrimarySubmit: {
    backgroundColor: THEME.accent,
    paddingVertical: 12,
    borderRadius: 7,
    alignItems: 'center',
    marginTop: 16,
  },
  btnPrimarySubmitText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Login Screens
  loginContainer: {
    padding: 20,
    paddingTop: 30,
  },
  btnBackToPublic: {
    marginBottom: 16,
  },
  btnBackToPublicText: {
    fontSize: 12.5,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  loginCard: {
    backgroundColor: THEME.card,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  loginPreTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.textTertiary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  loginTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 4,
  },
  loginSub: {
    fontSize: 12.5,
    color: THEME.textSecondary,
    marginBottom: 16,
  },
  btnQuickDemo: {
    backgroundColor: THEME.bgSubtle,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 10,
    borderRadius: 7,
    alignItems: 'center',
    marginTop: 10,
  },
  btnQuickDemoText: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    fontWeight: '600',
  },

  // Logbook Cards
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
    fontSize: 13,
    fontWeight: '700',
    color: THEME.text,
  },
  approvedBadge: {
    backgroundColor: THEME.greenSoft,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 4,
  },
  approvedBadgeText: {
    fontSize: 10,
    color: THEME.green,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: THEME.accentWarmSoft,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 4,
  },
  pendingBadgeText: {
    fontSize: 10,
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
    paddingVertical: 7,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 8,
  },
  btnApproveText: {
    color: '#FFF',
    fontSize: 11.5,
    fontWeight: '600',
  },

  // Doc Vault Cards
  docCard: {
    backgroundColor: THEME.card,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 10,
  },
  docHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  docTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: THEME.text,
  },
  docMeta: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    marginTop: 3,
  },
  verifiedPill: {
    fontSize: 9.5,
    fontWeight: '700',
    color: THEME.green,
    backgroundColor: THEME.greenSoft,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  verifiedRow: {
    marginTop: 6,
  },
  verifiedText: {
    fontSize: 11,
    color: THEME.green,
    fontWeight: '600',
  },

  // Small Utilities
  formRow: {
    flexDirection: 'row',
    gap: 6,
  },
  subHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 2,
  },
  subText: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.borderSubtle,
    marginVertical: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  greenBadge: {
    backgroundColor: THEME.greenSoft,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  greenBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.green,
  },
  bigAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.text,
    marginVertical: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.text,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 22,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 6,
  },
  modalMessage: {
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
});
