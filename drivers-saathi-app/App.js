import React, { useState, useEffect, useRef } from 'react';
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

// ─── Executive & Mobility Design System ───────────────────────────────────────
const THEME = {
  primary: '#0F172A',         // Deep Obsidian Navy
  primaryLight: '#1E293B',
  accent: '#FB8500',          // Signature Warm Marigold
  accentDeep: '#D97706',
  accentSoft: '#FFF7ED',
  accentBorder: '#FDBA74',
  canvas: '#F8FAFC',          // Crisp Off-White Background
  surface: '#FFFFFF',         // Pure White Card Surface
  border: '#E2E8F0',          // Subtle Border Divider
  borderSoft: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  success: '#059669',         // Emerald Green
  successSoft: '#ECFDF5',
  sosRed: '#EF4444',
  sosSoft: '#FEF2F2',
  blue: '#2563EB',
  blueSoft: '#EFF6FF',
  uberDark: '#111827',
  mapRoad: '#E2E8F0',
  mapGrass: '#F1F5F9',
};

// ─── On-Demand Uber-Style Ride Categories ──────────────────────────────────────
const RIDE_CATEGORIES = [
  {
    id: 'hourly',
    title: 'Hourly Chauffeur',
    tag: 'MOST POPULAR',
    tagColor: THEME.accentDeep,
    tagBg: THEME.accentSoft,
    baseFare: 149,
    baseDesc: '₹149 1st Hour, then ₹99/hr',
    desc: 'For shopping, business meetings, errands & family doctor visits in your own car.',
    eta: '4-6 mins',
  },
  {
    id: 'party',
    title: 'Party & Safe Return Drop',
    tag: 'ZERO ALCOHOL RISK',
    tagColor: '#9333EA',
    tagBg: '#FAF5FF',
    baseFare: 299,
    baseDesc: '₹299 Flat Drop (Up to 2 hrs)',
    desc: 'Enjoy your evening dinners & parties. A verified driver drives your car home safely.',
    eta: '5-8 mins',
  },
  {
    id: 'airport',
    title: 'Airport / 1-Way Drop',
    tag: '1-WAY CONVENIENCE',
    tagColor: THEME.blue,
    tagBg: THEME.blueSoft,
    baseFare: 249,
    baseDesc: '₹249 Flat Drop (Up to 25 km)',
    desc: 'Going to IGI Airport or office? Driver drops you and drives your car safely back home.',
    eta: '6-9 mins',
  },
  {
    id: 'outstation',
    title: 'Outstation Expressway Day',
    tag: 'HIGHWAY SPECIALIST',
    tagColor: THEME.success,
    tagBg: THEME.successSoft,
    baseFare: 1500,
    baseDesc: '₹1,500/day + FASTag & DA',
    desc: 'Commercial badge highway driver for Agra, Jaipur, Chandigarh or Dehradun road trips.',
    eta: 'Scheduled',
  },
];

// ─── Nearby Simulated Live Drivers ─────────────────────────────────────────────
const NEARBY_DRIVERS = [
  { id: 'd1', name: 'Rameshwar D.', eta: '4 min', dist: '0.8 km', rating: '4.95 ★', carType: 'Auto/Manual', x: 42, y: 38 },
  { id: 'd2', name: 'Vikramaditya S.', eta: '7 min', dist: '1.4 km', rating: '4.88 ★', carType: 'Luxury/EV', x: 68, y: 55 },
  { id: 'd3', name: 'Mohan Lal V.', eta: '9 min', dist: '2.1 km', rating: '4.98 ★', carType: 'All SUVs', x: 25, y: 70 },
];

// ─── Verified Candidate Database (Full-Time Placement) ─────────────────────────
const VERIFIED_CHAUFFEURS = [
  {
    id: 'c1',
    name: 'Rameshwar Dayal',
    age: 42,
    exp: '15 Yrs Exp',
    rating: '4.95',
    trips: 184,
    skills: ['Automatic', 'Fortuner / Innova', 'VIP Executive'],
    zone: 'South Delhi & Gurugram',
    photo: require('./assets/indian_driver_portrait.jpg'),
    bio: 'Ex-corporate chauffeur for MNC directors. Strict on-time arrival, defensive driving certified.',
  },
  {
    id: 'c2',
    name: 'Vikramaditya Singh',
    age: 36,
    exp: '11 Yrs Exp',
    rating: '4.88',
    trips: 142,
    skills: ['Automatic', 'BMW / Mercedes', 'EV Specialist'],
    zone: 'Gurugram (Golf Course & Cyber City)',
    photo: require('./assets/indian_driver_wheel.jpg'),
    bio: 'Specialist in German luxury sedans and electric vehicles. Smooth acceleration and polite etiquette.',
  },
  {
    id: 'c3',
    name: 'Mohan Lal Verma',
    age: 46,
    exp: '18 Yrs Exp',
    rating: '4.98',
    trips: 260,
    skills: ['Manual & Automatic', 'All SUVs', 'Night Driving'],
    zone: 'Noida & Central Delhi',
    photo: require('./assets/driver_passenger_service.jpg'),
    bio: '18 years accident-free record. Exceptional expressway experience across North India.',
  },
];

export default function App() {
  // Navigation: 'uber' (Drive Now) | 'chauffeurs' | 'bookings' | 'driver'
  const [activeTab, setActiveTab] = useState('uber');
  const [lang, setLang] = useState('en');

  // Customer Profile & Saved Garage
  const [userProfile, setUserProfile] = useState({
    name: 'Priya Sharma',
    phone: '+91 98110 23456',
    primaryCar: 'Hyundai Creta 2023 (Automatic)',
    pickupLocation: 'DLF Cyber City, Phase 2, Gurugram',
  });
  const [profileModal, setProfileModal] = useState(false);

  // ─── UBER ON-DEMAND STATE MACHINE ───────────────────────────────────────────
  // rideState: 'select' | 'searching' | 'assigned' | 'active' | 'completed'
  const [rideState, setRideState] = useState('select');
  const [selectedCategory, setSelectedCategory] = useState(RIDE_CATEGORIES[0]);
  const [transmission, setTransmission] = useState('Automatic');
  const [searchCountdown, setSearchCountdown] = useState(6);
  const [tripElapsedSeconds, setTripElapsedSeconds] = useState(0);
  const [assignedDriver, setAssignedDriver] = useState(NEARBY_DRIVERS[0]);
  const [tripDistanceKm, setTripDistanceKm] = useState(3.4);
  const [tripCurrentFare, setTripCurrentFare] = useState(149);
  const [tripRating, setTripRating] = useState(5);

  // ─── DRIVER SIDE COCKPIT STATE ──────────────────────────────────────────────
  const [driverOnline, setDriverOnline] = useState(true);
  const [driverIncomingRequest, setDriverIncomingRequest] = useState(null);
  const [driverModeSubTab, setDriverModeSubTab] = useState('live'); // 'live' | 'wallet' | 'jobs' | 'kyc'
  const [driverWallet, setDriverWallet] = useState({ balance: 4120, todayTrips: 3, incentives: 500 });
  const [driverOtpInput, setDriverOtpInput] = useState('');
  const [driverTripActive, setDriverTripActive] = useState(false);

  // Client Bookings Record
  const [bookingsList, setBookingsList] = useState([]);

  // Live Timer for Active Trip
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@ds_client_bookings_v3');
        if (saved) setBookingsList(JSON.parse(saved));
        else {
          setBookingsList([
            {
              id: 'DS-UBER-1082',
              title: 'Hourly Driver (2.5 hrs)',
              driverName: 'Rameshwar Dayal',
              date: 'Today, 11:30 AM',
              car: 'Hyundai Creta (Automatic)',
              status: 'Completed',
              fare: '₹298 Paid',
            },
          ]);
        }
      } catch (e) {}
    })();
  }, []);

  // Ticking Timer during Active Trip
  useEffect(() => {
    if (rideState === 'active') {
      timerRef.current = setInterval(() => {
        setTripElapsedSeconds(prev => {
          const next = prev + 1;
          // Increment distance slightly every 5 seconds
          if (next % 5 === 0) {
            setTripDistanceKm(d => +(d + 0.2).toFixed(1));
            setTripCurrentFare(f => Math.round(149 + (next / 60) * 1.6));
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [rideState]);

  const makeCall = () => Linking.openURL('tel:+918175087004');

  const openWhatsApp = (msg = '') => {
    const text = msg || 'Hello Drivers Saathi, I need an immediate on-demand driver in Delhi NCR.';
    Linking.openURL(`https://wa.me/918175087004?text=${encodeURIComponent(text)}`);
  };

  const triggerSOS = () => {
    Alert.alert(
      'Emergency Dispatch & Roadside SOS',
      'Direct line to Drivers Saathi Delhi NCR live dispatch desk.\n\nHelpline: +91 8175087004\nAvailable 24/7',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Dispatch Desk', onPress: makeCall },
      ]
    );
  };

  // ─── UBER FLOW ACTIONS ──────────────────────────────────────────────────────
  const handleStartSearch = () => {
    setRideState('searching');
    setSearchCountdown(5);

    // Simulated 5-second radar matching
    const interval = setInterval(() => {
      setSearchCountdown(c => {
        if (c <= 1) {
          clearInterval(interval);
          setAssignedDriver(NEARBY_DRIVERS[0]);
          setRideState('assigned');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleStartTrip = () => {
    setTripElapsedSeconds(0);
    setTripDistanceKm(1.2);
    setTripCurrentFare(selectedCategory.baseFare);
    setRideState('active');
  };

  const handleEndTrip = async () => {
    const finalFare = tripCurrentFare;
    setRideState('completed');

    const newRecord = {
      id: `DS-UBER-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `${selectedCategory.title} (${Math.ceil(tripElapsedSeconds / 60)} mins)`,
      driverName: assignedDriver.name,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      car: userProfile.primaryCar,
      status: 'Completed',
      fare: `₹${finalFare} Paid via UPI`,
    };

    const updated = [newRecord, ...bookingsList];
    setBookingsList(updated);
    await AsyncStorage.setItem('@ds_client_bookings_v3', JSON.stringify(updated));
  };

  const handlePayAndClose = () => {
    Alert.alert('Payment Received', `₹${tripCurrentFare} paid successfully via UPI. Receipt sent to ${userProfile.phone}.`);
    setRideState('select');
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ─── TAB 1: UBER "DRIVE NOW" (ON-DEMAND) ─────────────────────────────────────
  const renderUberScreen = () => (
    <View style={{ flex: 1, backgroundColor: THEME.canvas }}>
      {/* Location Bar */}
      <View style={styles.pickupBar}>
        <View style={styles.pickupDot} />
        <View style={{ flex: 1 }}>
          <Text style={styles.pickupLabel}>YOUR CAR LOCATION (PICKUP)</Text>
          <Text style={styles.pickupAddressText} numberOfLines={1}>{userProfile.pickupLocation}</Text>
        </View>
        <TouchableOpacity style={styles.btnChangeLocation} onPress={() => setProfileModal(true)}>
          <Text style={styles.btnChangeLocationText}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Simulated Live GPS Map View */}
      <View style={styles.mapCanvas}>
        {/* Map Grid Elements (Roads & Landmarks) */}
        <View style={styles.mapRoadHorizontal} />
        <View style={styles.mapRoadVertical} />
        <View style={styles.mapLandmarkBox}>
          <Text style={styles.mapLandmarkText}>Cyber Hub</Text>
        </View>

        {/* User Car Pickup Pin */}
        <View style={styles.userCarPin}>
          <View style={styles.userCarPulse} />
          <View style={styles.userCarIconBox}>
            <Text style={{ fontSize: 13 }}>🚗</Text>
          </View>
          <View style={styles.userCarBadge}>
            <Text style={styles.userCarBadgeText}>Your Car</Text>
          </View>
        </View>

        {/* Nearby Drivers Floating on Map */}
        {NEARBY_DRIVERS.map(d => (
          <View key={d.id} style={[styles.driverMarkerPin, { top: `${d.y}%`, left: `${d.x}%` }]}>
            <View style={styles.driverMarkerDot}>
              <Text style={{ fontSize: 10 }}>👨‍✈️</Text>
            </View>
            <View style={styles.driverMarkerPill}>
              <Text style={styles.driverMarkerText}>{d.eta}</Text>
            </View>
          </View>
        ))}

        {/* Live Status Overlay Pill */}
        <View style={styles.mapLiveBadge}>
          <View style={styles.liveGreenDot} />
          <Text style={styles.mapLiveBadgeText}>3 Verified Drivers Nearby</Text>
        </View>
      </View>

      {/* ── BOTTOM INTERACTIVE WORKBENCH ────────────────────────────────────── */}

      {/* STATE 1: SELECTION MODE */}
      {rideState === 'select' && (
        <View style={styles.uberSheetContainer}>
          <View style={styles.sheetHandle} />

          {/* Vehicle Transmission Selector */}
          <View style={styles.transmissionRow}>
            <Text style={styles.transmissionLabel}>Car Transmission:</Text>
            {['Automatic', 'Manual', 'Luxury German', 'EV'].map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.transmissionChip, transmission === t && styles.transmissionChipActive]}
                onPress={() => setTransmission(t)}
              >
                <Text style={[styles.transmissionChipText, transmission === t && styles.transmissionChipTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Ride Category Cards Carousel */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {RIDE_CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.categoryCard, selectedCategory.id === c.id && styles.categoryCardActive]}
                onPress={() => setSelectedCategory(c)}
                activeOpacity={0.9}
              >
                <View style={styles.categoryTopRow}>
                  <View style={[styles.categoryTagPill, { backgroundColor: c.tagBg }]}>
                    <Text style={[styles.categoryTagText, { color: c.tagColor }]}>{c.tag}</Text>
                  </View>
                  <Text style={styles.categoryEtaText}>⚡ {c.eta}</Text>
                </View>

                <Text style={styles.categoryTitleText}>{c.title}</Text>
                <Text style={styles.categoryRateText}>{c.baseDesc}</Text>
                <Text style={styles.categoryDescText} numberOfLines={2}>{c.desc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Booking Action Bar */}
          <View style={styles.uberBookingActionBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.uberEstimateLabel}>ESTIMATED RATE</Text>
              <Text style={styles.uberEstimateAmount}>₹{selectedCategory.baseFare} Base</Text>
              <Text style={styles.uberEstimateCar} numberOfLines={1}>{userProfile.primaryCar}</Text>
            </View>

            <TouchableOpacity style={styles.btnBookDriverNow} onPress={handleStartSearch} activeOpacity={0.88}>
              <Text style={styles.btnBookDriverNowText}>Book Driver Now ⚡</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STATE 2: RADAR SEARCHING FOR DRIVER */}
      {rideState === 'searching' && (
        <View style={styles.uberSheetContainer}>
          <View style={styles.sheetHandle} />
          <View style={styles.radarBox}>
            <View style={styles.radarPulseCircle}>
              <ActivityIndicator size="large" color={THEME.accent} />
            </View>
            <Text style={styles.radarTitle}>Connecting with Nearest Driver...</Text>
            <Text style={styles.radarSub}>Pinging 3 verified chauffeurs near DLF Cyber City ({searchCountdown}s)</Text>
            <TouchableOpacity style={styles.btnCancelSearch} onPress={() => setRideState('select')}>
              <Text style={styles.btnCancelSearchText}>Cancel Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STATE 3: DRIVER ASSIGNED & EN ROUTE */}
      {rideState === 'assigned' && (
        <View style={styles.uberSheetContainer}>
          <View style={styles.sheetHandle} />

          <View style={styles.assignedDriverHeader}>
            <Image source={require('./assets/indian_driver_portrait.jpg')} style={styles.assignedDriverAvatar} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.assignedDriverName}>{assignedDriver.name}</Text>
                <Text style={styles.assignedDriverRating}>{assignedDriver.rating}</Text>
              </View>
              <Text style={styles.assignedDriverETA}>⚡ Arriving in {assignedDriver.eta} on two-wheeler</Text>
              <Text style={styles.assignedDriverCar}>Driving: {userProfile.primaryCar}</Text>
            </View>
          </View>

          {/* OTP Start Code Box */}
          <View style={styles.otpStartBox}>
            <Text style={styles.otpStartLabel}>GIVE THIS 4-DIGIT START OTP TO DRIVER</Text>
            <Text style={styles.otpStartCode}>7492</Text>
            <Text style={styles.otpStartSub}>Driver will enter this code on his app to start the trip meter.</Text>
          </View>

          <View style={styles.assignedActionRow}>
            <TouchableOpacity style={styles.btnCallDriver} onPress={makeCall} activeOpacity={0.88}>
              <Text style={styles.btnCallDriverText}>📞 Call Driver</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnSimulateStartTrip} onPress={handleStartTrip} activeOpacity={0.88}>
              <Text style={styles.btnSimulateStartTripText}>Driver Arrived (Start Meter)</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STATE 4: ACTIVE TRIP WITH DIGITAL METER */}
      {rideState === 'active' && (
        <View style={[styles.uberSheetContainer, { backgroundColor: THEME.primary }]}>
          <View style={[styles.sheetHandle, { backgroundColor: '#334155' }]} />

          <View style={styles.tripActiveTopRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.liveDotRed} />
              <Text style={styles.tripActiveBadge}>LIVE ON-DEMAND TRIP RUNNING</Text>
            </View>
            <Text style={styles.tripDriverName}>{assignedDriver.name}</Text>
          </View>

          {/* Big Digital Trip Meter */}
          <View style={styles.digitalMeterContainer}>
            <View style={styles.meterBlock}>
              <Text style={styles.meterBlockLabel}>ELAPSED TIME</Text>
              <Text style={styles.meterBlockValue}>{formatTimer(tripElapsedSeconds)}</Text>
            </View>

            <View style={styles.meterDivider} />

            <View style={styles.meterBlock}>
              <Text style={styles.meterBlockLabel}>DISTANCE RUN</Text>
              <Text style={styles.meterBlockValue}>{tripDistanceKm} KM</Text>
            </View>

            <View style={styles.meterDivider} />

            <View style={styles.meterBlock}>
              <Text style={styles.meterBlockLabel}>CURRENT FARE</Text>
              <Text style={[styles.meterBlockValue, { color: THEME.accent }]}>₹{tripCurrentFare}</Text>
            </View>
          </View>

          <View style={styles.meterSafetyRow}>
            <Text style={styles.meterSafetyText}>🛡️ Covered by 24/7 Roadside SOS & GPS Dispatch</Text>
            <TouchableOpacity onPress={triggerSOS}>
              <Text style={styles.sosInlineBtn}>SOS Alert</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btnEndTrip} onPress={handleEndTrip} activeOpacity={0.88}>
            <Text style={styles.btnEndTripText}>End Trip & Pay Fare</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STATE 5: TRIP COMPLETED & CASHLESS UPI CHECKOUT */}
      {rideState === 'completed' && (
        <View style={styles.uberSheetContainer}>
          <View style={styles.sheetHandle} />

          <View style={styles.completedHeader}>
            <View style={styles.completedCheckCircle}>
              <Text style={{ fontSize: 24, color: THEME.success }}>✓</Text>
            </View>
            <Text style={styles.completedTitle}>Trip Completed Safely</Text>
            <Text style={styles.completedSub}>Chauffeur {assignedDriver.name} has parked your vehicle safely.</Text>
          </View>

          {/* Receipt Breakdown Card */}
          <View style={styles.fareBreakdownCard}>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Base Fare ({selectedCategory.title})</Text>
              <Text style={styles.fareValue}>₹{selectedCategory.baseFare}</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Distance Driven ({tripDistanceKm} KM)</Text>
              <Text style={styles.fareValue}>Included</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Platform Fee & GST</Text>
              <Text style={styles.fareValue}>Included</Text>
            </View>
            <View style={styles.fareDivider} />
            <View style={styles.fareRowTotal}>
              <Text style={styles.fareTotalLabel}>Total Amount Payable</Text>
              <Text style={styles.fareTotalAmount}>₹{tripCurrentFare}</Text>
            </View>
          </View>

          {/* Star Rating for Driver */}
          <View style={styles.starRatingRow}>
            <Text style={styles.starRatingLabel}>Rate Driver:</Text>
            {[1, 2, 3, 4, 5].map(s => (
              <TouchableOpacity key={s} onPress={() => setTripRating(s)}>
                <Text style={[styles.starIcon, s <= tripRating && styles.starIconActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.btnPayUPI} onPress={handlePayAndClose} activeOpacity={0.88}>
            <Text style={styles.btnPayUPIText}>Pay ₹{tripCurrentFare} with GPay / PhonePe / UPI</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // ─── TAB 2: VERIFIED CHAUFFEURS (PERMANENT & 1-DAY PLACEMENT) ─────────────────
  const renderChauffeursScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenHeading}>Browse Full-Time Chauffeurs</Text>
        <Text style={styles.screenSubheading}>Pre-screened executive drivers ready for 1-day trial or permanent placement.</Text>
      </View>

      {VERIFIED_CHAUFFEURS.map(c => (
        <View key={c.id} style={styles.fullCandidateCard}>
          <View style={styles.candidateHeaderRow}>
            <Image source={c.photo} style={styles.candidateLargeAvatar} resizeMode="cover" />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={styles.candidateBadgeRow}>
                <View style={[styles.pillBadge, { backgroundColor: THEME.accentSoft }]}>
                  <Text style={[styles.pillBadgeText, { color: THEME.accentDeep }]}>VERIFIED CANDIDATE</Text>
                </View>
                <Text style={styles.candidateRatingScore}>★ {c.rating} ({c.trips} duties)</Text>
              </View>
              <Text style={styles.candidateFullName}>{c.name}</Text>
              <Text style={styles.candidateSubInfo}>{c.age} Yrs • {c.exp} • 📍 {c.zone}</Text>
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
            <Text style={styles.verificationCheckItem}>✓ Police Verified</Text>
            <Text style={styles.verificationCheckItem}>✓ Parivahan DL Authenticated</Text>
            <Text style={styles.verificationCheckItem}>✓ 30-Day Free Replacement</Text>
          </View>

          <View style={styles.candidateActionRow}>
            <TouchableOpacity
              style={styles.btnCandidateTrial}
              onPress={() => {
                Alert.alert(
                  'Book 1-Day Trial with ' + c.name,
                  `Car Model: ${userProfile.primaryCar}\nRate: ₹1,500 for 1-day trial duty.\n\nOur account manager will confirm the schedule within 2 hours.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Confirm Trial Booking', onPress: () => Alert.alert('Trial Scheduled', `Trial scheduled with ${c.name}. Details sent to ${userProfile.phone}.`) },
                  ]
                );
              }}
              activeOpacity={0.88}
            >
              <Text style={styles.btnCandidateTrialText}>Book 1-Day Trial (₹1,500)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnCandidateWhatsApp}
              onPress={() => openWhatsApp(`Hello, I want to interview driver candidate ${c.name} for my ${userProfile.primaryCar}.`)}
              activeOpacity={0.88}
            >
              <Text style={styles.btnCandidateWhatsAppText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  // ─── TAB 3: BOOKINGS & HISTORY ───────────────────────────────────────────────
  const renderBookingsScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenHeading}>My Bookings & Receipts</Text>
        <Text style={styles.screenSubheading}>Your on-demand trips, daily chauffeurs & invoice receipts.</Text>
      </View>

      {bookingsList.map(b => (
        <View key={b.id} style={styles.bookingCardModern}>
          <View style={styles.bookingTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bookingIdBadge}>{b.id}</Text>
              <Text style={styles.bookingTitleText}>{b.title}</Text>
              <Text style={styles.bookingSubText}>Chauffeur: <Text style={{ fontWeight: '800', color: THEME.textPrimary }}>{b.driverName}</Text></Text>
              <Text style={styles.bookingSubText}>Car: {b.car} • {b.date}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: THEME.successSoft }]}>
              <Text style={[styles.statusPillText, { color: THEME.success }]}>{b.status}</Text>
            </View>
          </View>

          <View style={styles.bookingDivider} />

          <View style={styles.bookingActionRow}>
            <Text style={styles.bookingPriceTag}>{b.fare}</Text>
            <TouchableOpacity
              style={styles.btnSmallAction}
              onPress={() => openWhatsApp(`Inquiry regarding Booking ${b.id} for driver ${b.driverName}.`)}
            >
              <Text style={styles.btnSmallActionText}>Download Tax Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  // ─── TAB 4: DRIVER PARTNER (UBER DRIVER DISPATCH COCKPIT) ─────────────────────
  const renderDriverScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
      <View style={styles.screenHeader}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.screenHeading}>Driver Partner Cockpit</Text>
            <Text style={styles.screenSubheading}>Receive on-demand trips & view earnings.</Text>
          </View>
          {/* Online / Offline Toggle */}
          <TouchableOpacity
            style={[styles.onlineToggleBtn, driverOnline ? styles.onlineBtnActive : styles.offlineBtnActive]}
            onPress={() => setDriverOnline(!driverOnline)}
          >
            <View style={[styles.onlineDot, { backgroundColor: driverOnline ? '#10B981' : '#94A3B8' }]} />
            <Text style={styles.onlineToggleText}>{driverOnline ? 'ONLINE' : 'OFFLINE'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Driver Status Card */}
      <View style={styles.driverEarningsWidget}>
        <View style={styles.walletHeaderRow}>
          <Text style={styles.walletHeaderLabel}>TODAY'S EARNINGS</Text>
          <Text style={styles.walletTripsCount}>{driverWallet.todayTrips} Trips Done</Text>
        </View>
        <Text style={styles.walletAmountLarge}>₹{driverWallet.balance.toLocaleString('en-IN')}</Text>

        <View style={styles.walletPillRow}>
          <Text style={styles.walletPillText}>Base Pay: ₹3,100</Text>
          <Text style={styles.walletPillText}>OT / Tips: ₹520</Text>
          <Text style={styles.walletPillText}>Bonus: ₹500</Text>
        </View>

        <TouchableOpacity
          style={styles.btnWithdrawUPI}
          onPress={() => Alert.alert('Instant Transfer', '₹4,120 transferred to your linked UPI bank account.')}
        >
          <Text style={styles.btnWithdrawUPIText}>Instant Withdraw via UPI</Text>
        </TouchableOpacity>
      </View>

      {/* Simulated Incoming Trip Ping for Driver */}
      {driverOnline && (
        <View style={styles.incomingTripCard}>
          <View style={styles.incomingBadgeRow}>
            <View style={styles.liveDot} />
            <Text style={styles.incomingBadgeText}>NEW ON-DEMAND TRIP REQUEST</Text>
            <Text style={styles.incomingTimer}>15s</Text>
          </View>

          <Text style={styles.incomingClient}>Passenger: Priya Sharma (4.9 ★)</Text>
          <Text style={styles.incomingCar}>Car to Drive: Hyundai Creta (Automatic)</Text>
          <Text style={styles.incomingPickup}>📍 Pickup: DLF Cyber City, Gurugram (0.8 km)</Text>
          <Text style={styles.incomingFare}>Est. Earning: ₹248 (2 Hours)</Text>

          <View style={styles.incomingActionRow}>
            <TouchableOpacity
              style={styles.btnAcceptTrip}
              onPress={() => Alert.alert('Trip Accepted', 'Navigate to DLF Cyber City. Passenger start OTP is 7492.')}
            >
              <Text style={styles.btnAcceptTripText}>ACCEPT TRIP (₹248)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnDeclineTrip}
              onPress={() => Alert.alert('Decline', 'Request passed to next available driver.')}
            >
              <Text style={styles.btnDeclineTripText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Refer Friend Card */}
      <View style={styles.referCard}>
        <Text style={styles.referCardTitle}>Refer a Driver Friend — Get ₹500</Text>
        <Text style={styles.referCardSub}>Refer any commercial driver friend. When they complete 30 duties, get ₹500 directly via UPI.</Text>
        <TouchableOpacity
          style={styles.btnReferWhatsApp}
          onPress={() => openWhatsApp('Hello Drivers Saathi, I want to refer a driver friend.')}
        >
          <Text style={styles.btnReferWhatsAppText}>Share Referral Link via WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ─── MODAL: USER PROFILE & GARAGE ─────────────────────────────────────────────
  const renderProfileModal = () => (
    <Modal visible={profileModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandle} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={styles.sheetTitle}>My Garage & Pickup Location</Text>
            <TouchableOpacity onPress={() => setProfileModal(false)}>
              <Text style={{ fontSize: 16, fontWeight: '800' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Your Name</Text>
          <TextInput
            style={styles.formInput}
            value={userProfile.name}
            onChangeText={v => setUserProfile({ ...userProfile, name: v })}
          />

          <Text style={styles.inputLabel}>Your Mobile Number</Text>
          <TextInput
            style={styles.formInput}
            value={userProfile.phone}
            keyboardType="phone-pad"
            onChangeText={v => setUserProfile({ ...userProfile, phone: v })}
          />

          <Text style={styles.inputLabel}>Vehicle in Your Garage</Text>
          <TextInput
            style={styles.formInput}
            value={userProfile.primaryCar}
            onChangeText={v => setUserProfile({ ...userProfile, primaryCar: v })}
          />

          <Text style={styles.inputLabel}>Default Pickup Address (Delhi NCR)</Text>
          <TextInput
            style={styles.formInput}
            value={userProfile.pickupLocation}
            onChangeText={v => setUserProfile({ ...userProfile, pickupLocation: v })}
          />

          <TouchableOpacity
            style={styles.btnSaveProfile}
            onPress={() => {
              setProfileModal(false);
              Alert.alert('Updated', 'Saved car garage and pickup location.');
            }}
          >
            <Text style={styles.btnSaveProfileText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ─── MAIN SCAFFOLD ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar style="light" backgroundColor={THEME.primary} />

      {/* Top Navbar with Crisp Logo Emblem & Typography */}
      <View style={styles.navBar}>
        <View style={styles.brandRow}>
          <Image
            source={require('./assets/driver-saathi-logo-light.png')}
            style={styles.brandEmblem}
            resizeMode="contain"
          />
          <View style={styles.brandTextCol}>
            <Text style={styles.brandTitleText}>DRIVERS SAATHI</Text>
            <Text style={styles.brandSubText}>ON-DEMAND CHAUFFEURS</Text>
          </View>
        </View>

        <View style={styles.navRightActions}>
          <TouchableOpacity style={styles.btnGaragePill} onPress={() => setProfileModal(true)} activeOpacity={0.85}>
            <Text style={styles.btnGaragePillText}>Garage</Text>
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

      {/* Active Tab Screen */}
      <View style={{ flex: 1 }}>
        {activeTab === 'uber' && renderUberScreen()}
        {activeTab === 'chauffeurs' && renderChauffeursScreen()}
        {activeTab === 'bookings' && renderBookingsScreen()}
        {activeTab === 'driver' && renderDriverScreen()}
      </View>

      {/* Modern Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.bottomNavItem, activeTab === 'uber' && styles.bottomNavItemActive]}
          onPress={() => setActiveTab('uber')}
        >
          <Text style={[styles.bottomNavIcon, activeTab === 'uber' && styles.bottomNavIconActive]}>⚡</Text>
          <Text style={[styles.bottomNavLabel, activeTab === 'uber' && styles.bottomNavLabelActive]}>Drive Now</Text>
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

      {/* Profile Modal */}
      {renderProfileModal()}
    </SafeAreaView>
  );
}

// ─── UBER & MOBILITY STYLESHEET ────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: THEME.canvas,
  },

  // Navbar
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
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  brandTextCol: {
    justifyContent: 'center',
  },
  brandTitleText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  brandSubText: {
    color: THEME.accent,
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  navRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  btnGaragePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  btnGaragePillText: {
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

  // Bottom Nav
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: THEME.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingVertical: 7,
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 3,
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

  // ── UBER LIVE MAP SECTION ────────────────────────────────────────────────────
  pickupBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    gap: 10,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.success,
  },
  pickupLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.6,
  },
  pickupAddressText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  btnChangeLocation: {
    backgroundColor: THEME.canvas,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  btnChangeLocationText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.accentDeep,
  },

  mapCanvas: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    position: 'relative',
  },
  mapRoadHorizontal: {
    position: 'absolute',
    top: '48%',
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: '#D1D5DB',
  },
  mapRoadVertical: {
    position: 'absolute',
    left: '46%',
    top: 0,
    bottom: 0,
    width: 28,
    backgroundColor: '#D1D5DB',
  },
  mapLandmarkBox: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  mapLandmarkText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.textSecondary,
  },
  userCarPin: {
    position: 'absolute',
    top: '46%',
    left: '44%',
    alignItems: 'center',
    transform: [{ translateX: -18 }, { translateY: -18 }],
  },
  userCarPulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(251, 133, 0, 0.25)',
  },
  userCarIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  userCarBadge: {
    backgroundColor: THEME.primary,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginTop: 3,
  },
  userCarBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },

  driverMarkerPin: {
    position: 'absolute',
    alignItems: 'center',
  },
  driverMarkerDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: THEME.surface,
    borderWidth: 2,
    borderColor: THEME.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  driverMarkerPill: {
    backgroundColor: THEME.primary,
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 4,
    marginTop: 2,
  },
  driverMarkerText: {
    color: '#FFF',
    fontSize: 8.5,
    fontWeight: '800',
  },

  mapLiveBadge: {
    position: 'absolute',
    top: 12,
    left: 14,
    backgroundColor: THEME.surface,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    elevation: 2,
  },
  liveGreenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: THEME.success,
  },
  mapLiveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textPrimary,
  },

  // ── BOTTOM UBER SHEET ────────────────────────────────────────────────────────
  uberSheetContainer: {
    backgroundColor: THEME.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    paddingBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: THEME.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },

  // Transmission Selector
  transmissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  transmissionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textSecondary,
  },
  transmissionChip: {
    backgroundColor: THEME.canvas,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  transmissionChipActive: {
    borderColor: THEME.accent,
    backgroundColor: THEME.accentSoft,
  },
  transmissionChipText: {
    fontSize: 10.5,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  transmissionChipTextActive: {
    color: THEME.accentDeep,
    fontWeight: '800',
  },

  // Category Cards Carousel
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryCard: {
    width: 200,
    backgroundColor: THEME.canvas,
    borderWidth: 1.5,
    borderColor: THEME.border,
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
  },
  categoryCardActive: {
    borderColor: THEME.accent,
    backgroundColor: THEME.accentSoft,
  },
  categoryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryTagPill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  categoryEtaText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: THEME.textSecondary,
  },
  categoryTitleText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  categoryRateText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: THEME.accentDeep,
    marginVertical: 2,
  },
  categoryDescText: {
    fontSize: 10.5,
    color: THEME.textSecondary,
    lineHeight: 14,
  },

  // Uber Booking Action Bar
  uberBookingActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME.borderSoft,
    paddingTop: 10,
    gap: 12,
  },
  uberEstimateLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.6,
  },
  uberEstimateAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.textPrimary,
  },
  uberEstimateCar: {
    fontSize: 10.5,
    color: THEME.textSecondary,
  },
  btnBookDriverNow: {
    backgroundColor: THEME.accent,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnBookDriverNowText: {
    color: '#FFF',
    fontSize: 13.5,
    fontWeight: '900',
  },

  // Radar Box
  radarBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  radarPulseCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  radarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  radarSub: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 4,
    marginBottom: 14,
  },
  btnCancelSearch: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: THEME.canvas,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  btnCancelSearchText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: THEME.sosRed,
  },

  // Assigned Driver Card
  assignedDriverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  assignedDriverAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: THEME.accent,
  },
  assignedDriverName: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  assignedDriverRating: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.accentDeep,
  },
  assignedDriverETA: {
    fontSize: 11.5,
    fontWeight: '700',
    color: THEME.success,
    marginTop: 2,
  },
  assignedDriverCar: {
    fontSize: 11,
    color: THEME.textSecondary,
  },
  otpStartBox: {
    backgroundColor: THEME.canvas,
    borderWidth: 1.5,
    borderColor: THEME.accentBorder,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  otpStartLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: THEME.accentDeep,
    letterSpacing: 0.6,
  },
  otpStartCode: {
    fontSize: 26,
    fontWeight: '900',
    color: THEME.primary,
    letterSpacing: 6,
    marginVertical: 2,
  },
  otpStartSub: {
    fontSize: 10,
    color: THEME.textSecondary,
    textAlign: 'center',
  },
  assignedActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnCallDriver: {
    flex: 1,
    backgroundColor: THEME.canvas,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCallDriverText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  btnSimulateStartTrip: {
    flex: 2,
    backgroundColor: THEME.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnSimulateStartTripText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // Digital Meter
  tripActiveTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveDotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.sosRed,
  },
  tripActiveBadge: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  tripDriverName: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  digitalMeterContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  meterBlock: {
    flex: 1,
    alignItems: 'center',
  },
  meterBlockLabel: {
    color: '#94A3B8',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  meterBlockValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  meterDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
  },
  meterSafetyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  meterSafetyText: {
    color: '#94A3B8',
    fontSize: 10,
  },
  sosInlineBtn: {
    color: THEME.sosRed,
    fontSize: 10.5,
    fontWeight: '800',
  },
  btnEndTrip: {
    backgroundColor: THEME.sosRed,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnEndTripText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
  },

  // Completed Receipt
  completedHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  completedCheckCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.successSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  completedSub: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  fareBreakdownCard: {
    backgroundColor: THEME.canvas,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fareLabel: {
    fontSize: 11.5,
    color: THEME.textSecondary,
  },
  fareValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  fareDivider: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 6,
  },
  fareRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  fareTotalAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.accent,
  },
  starRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 6,
  },
  starRatingLabel: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    fontWeight: '700',
  },
  starIcon: {
    fontSize: 22,
    color: '#CBD5E1',
  },
  starIconActive: {
    color: THEME.accent,
  },
  btnPayUPI: {
    backgroundColor: THEME.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  btnPayUPIText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
  },

  // ── CHAUFFEURS DIRECTORY ─────────────────────────────────────────────────────
  scrollBody: {
    padding: 16,
    paddingBottom: 40,
  },
  screenHeader: {
    marginBottom: 12,
  },
  screenHeading: {
    fontSize: 19,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  screenSubheading: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    marginTop: 2,
  },
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
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: THEME.accentBorder,
  },
  candidateBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pillBadge: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
  },
  pillBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  candidateRatingScore: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.accentDeep,
  },
  candidateFullName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginTop: 2,
  },
  candidateSubInfo: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginTop: 1,
  },
  candidateBioText: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  candidateSkillsContainer: {
    marginBottom: 6,
  },
  candidateSkillLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginBottom: 3,
  },
  skillWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  candidateSkillBadge: {
    backgroundColor: THEME.canvas,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  candidateSkillBadgeText: {
    fontSize: 10,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  candidateVerificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: THEME.successSoft,
    borderRadius: 8,
    padding: 7,
    marginVertical: 8,
  },
  verificationCheckItem: {
    fontSize: 10,
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
    fontSize: 12,
    fontWeight: '800',
  },
  btnCandidateWhatsApp: {
    backgroundColor: THEME.canvas,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCandidateWhatsAppText: {
    color: THEME.textPrimary,
    fontSize: 11.5,
    fontWeight: '700',
  },

  // ── BOOKINGS HUB ─────────────────────────────────────────────────────────────
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
    fontSize: 9,
    fontWeight: '800',
    color: THEME.accent,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  bookingTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  bookingSubText: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  bookingDivider: {
    height: 1,
    backgroundColor: THEME.borderSoft,
    marginVertical: 8,
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
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  btnSmallActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.accent,
  },

  // ── DRIVER COCKPIT ───────────────────────────────────────────────────────────
  onlineToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  onlineBtnActive: {
    backgroundColor: THEME.successSoft,
    borderWidth: 1,
    borderColor: THEME.success,
  },
  offlineBtnActive: {
    backgroundColor: THEME.canvas,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineToggleText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.textPrimary,
  },

  driverEarningsWidget: {
    backgroundColor: THEME.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  walletHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletHeaderLabel: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  walletTripsCount: {
    color: THEME.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  walletAmountLarge: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    marginVertical: 4,
  },
  walletPillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
    marginBottom: 10,
  },
  walletPillText: {
    color: '#CBD5E1',
    fontSize: 10.5,
  },
  btnWithdrawUPI: {
    backgroundColor: THEME.success,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  btnWithdrawUPIText: {
    color: '#FFF',
    fontSize: 11.5,
    fontWeight: '800',
  },

  incomingTripCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: THEME.accent,
    marginBottom: 14,
    elevation: 4,
  },
  incomingBadgeRow: {
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
  incomingBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: THEME.accentDeep,
    letterSpacing: 0.6,
    flex: 1,
  },
  incomingTimer: {
    fontSize: 12,
    fontWeight: '900',
    color: THEME.sosRed,
  },
  incomingClient: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  incomingCar: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  incomingPickup: {
    fontSize: 11.5,
    color: THEME.textPrimary,
    marginVertical: 4,
  },
  incomingFare: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.success,
    marginBottom: 10,
  },
  incomingActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnAcceptTrip: {
    flex: 2,
    backgroundColor: THEME.success,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnAcceptTripText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  btnDeclineTrip: {
    flex: 1,
    backgroundColor: THEME.canvas,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnDeclineTripText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: THEME.textSecondary,
  },

  referCard: {
    backgroundColor: THEME.successSoft,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  referCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
  },
  referCardSub: {
    fontSize: 11.5,
    color: '#047857',
    lineHeight: 16,
    marginVertical: 6,
  },
  btnReferWhatsApp: {
    backgroundColor: '#059669',
    paddingVertical: 8,
    borderRadius: 7,
    alignItems: 'center',
  },
  btnReferWhatsAppText: {
    color: '#FFF',
    fontSize: 11.5,
    fontWeight: '800',
  },

  // Modal / Profile Sheets
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: THEME.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    paddingBottom: 26,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textPrimary,
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
  btnSaveProfile: {
    backgroundColor: THEME.primary,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 14,
  },
  btnSaveProfileText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
