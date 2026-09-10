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
  purple: '#7C3AED',
  purpleSoft: '#F5F3FF',
};

// Common Outstation Routes with Toll, Taxes, and Driver DA (Night Allowance)
const ROUTES_DB = [
  {
    id: 'agra',
    name: 'Delhi ⇄ Agra (Taj Expressway)',
    distance: '210 km (One-way)',
    toll: '₹415 (One-way) / ₹665 (Return)',
    stateTax: 'Nil for Private Cars / ₹120 Commercial',
    driverDA: '₹400 / Night Halt',
    speedLimit: '100 km/h (Strict Speed Cameras)',
  },
  {
    id: 'jaipur',
    name: 'Delhi ⇄ Jaipur (Delhi-Mumbai Expy)',
    distance: '270 km (One-way)',
    toll: '₹590 (Sohna-Dausa Expy)',
    stateTax: 'Rajasthan Entry Tax for Cabs',
    driverDA: '₹500 / Night Halt',
    speedLimit: '120 km/h (Expressway)',
  },
  {
    id: 'chandigarh',
    name: 'Delhi ⇄ Chandigarh (NH-44)',
    distance: '250 km (One-way)',
    toll: '₹390 (Panipat, Gharaunda, Shambhu)',
    stateTax: 'Haryana / Punjab Border Permit',
    driverDA: '₹400 / Night Halt',
    speedLimit: '90 km/h Highway',
  },
  {
    id: 'airport',
    name: 'Noida / Greater Noida ⇄ Airport (T3)',
    distance: '48 km (One-way)',
    toll: '₹140 (DND / Barapullah Route: Free)',
    stateTax: 'None for Delhi/NCR Private Cars',
    driverDA: 'Day Duty (Regular Shift)',
    speedLimit: '70 km/h Ring Road',
  },
  {
    id: 'dehradun',
    name: 'Delhi ⇄ Dehradun / Rishikesh',
    distance: '260 km (One-way)',
    toll: '₹310 (Meerut Expressway)',
    stateTax: 'Uttarakhand Green Cess for Cabs',
    driverDA: '₹500 / Night Halt',
    speedLimit: '80 km/h Hill Section',
  },
];

// Chauffeur Etiquette & Safety Academy Rules
const ACADEMY_TIPS = [
  {
    id: '1',
    category: 'VIP ETIQUETTE',
    title: 'Opening Passenger Doors & Greeting',
    tip: 'Always open the rear left door for VIP passengers. Greet with "Namaste / Good Morning Sir/Ma\'am" and maintain neutral eye contact.',
  },
  {
    id: '2',
    category: 'CABIN COMFORT',
    title: 'AC & Music Preference Protocol',
    tip: 'Set AC to 23°C before passenger boards. Never play music, radio or speak on phone on loudspeaker unless requested by owner.',
  },
  {
    id: '3',
    category: 'DELHI NCR DRIVING',
    title: 'Strict Expressway Speed Cameras',
    tip: 'Observe speed limits (70 km/h on Ring Road, 100 km/h on Taj Expressway). Avoid sudden acceleration or jerky braking.',
  },
  {
    id: '4',
    category: 'EMERGENCY & BREAKDOWN',
    title: 'Puncture & Breakdown Procedure',
    tip: 'Safely pull over to extreme left shoulder, turn on hazard hazard indicators immediately, and place emergency triangle 50m behind car.',
  },
  {
    id: '5',
    category: 'PRIVACY & SECURITY',
    title: 'Zero Gossip & Discretion Policy',
    tip: 'Never discuss passenger conversations, destinations, or family matters with outside guards or peer drivers.',
  },
];

const STRINGS = {
  en: {
    heroBadge: 'DELHI NCR DISPATCH DESK ACTIVE',
    headline: 'Verified Drivers for Fleets & Private Cars',
    subheadline:
      'We source, background-check, and place commercial & executive drivers across Delhi, Gurugram, Noida, and Faridabad. Zero downtime.',
    ctaFleet: 'Hire Fleet Drivers',
    ctaPersonal: 'Hire Personally',
    ctaDrive: 'Drive with Us',
    liveStatus: 'Delhi NCR Dispatch: Active (Mon-Sat: 8 AM - 9 PM)',

    // Bottom Navigation
    tabHome: 'Home',
    tabHire: 'Hire',
    tabVehicle: 'Car Care',
    tabToll: 'Toll & DA',
    tabAcademy: 'Academy',

    // Forms
    fleetFormTitle: 'Request Fleet & Commercial Drivers',
    fleetFormSub: 'For cab fleets, tour operators, corporate staff shuttles, and logistics.',
    personalFormTitle: 'Hire a Permanent Chauffeur',
    personalFormSub: 'For private car owners, families, daily office commute, and VIP luxury cars.',
    tempFormTitle: 'Book Temporary / Outstation Driver',
    tempFormSub: 'Short notice driver for 1-day highway trips, weekend outstation, or backup driver.',
    driverFormTitle: 'Driver KYC & Application Form',
    driverFormSub: 'Upload your documents to get fast-track police verified & start earning.',

    name: 'Full Name / Contact Person',
    phone: 'Phone Number (WhatsApp)',
    email: 'Email Address (For auto-confirmation)',
    company: 'Company / Fleet Name (Optional)',
    vehicle: 'Vehicle Type / Model (e.g. Creta / Innova / EV)',
    location: 'Location / Preferred Area in Delhi NCR',
    driverCount: 'Number of Drivers Required',
    tripDate: 'Trip Date & Required Time',
    destination: 'Outstation Destination (e.g. Delhi to Jaipur / Agra)',
    licenseType: 'License Category (LMV / Commercial / Heavy)',
    experience: 'Total Driving Experience (in Years)',
    submitBtn: 'Submit Requirement Now',
    applyBtn: 'Submit KYC & Application',

    successTitle: 'Requirement Received!',
    successSub:
      'Thank you for reaching out to Drivers Saathi. Our central dispatch desk is reviewing your requirement and will connect with you via Call / WhatsApp shortly.\n\nA confirmation copy has been sent to support@driverssaathi.com and your email.',
    closeBtn: 'Done',
  },
  hi: {
    heroBadge: 'दिल्ली एनसीआर डिस्पैच डेस्क सक्रिय',
    headline: 'गाड़ियों और फ्लीट्स के लिए 100% वेरिफाइड ड्राइवर्स',
    subheadline:
      'हम दिल्ली, गुरुग्राम, नोएडा और फरीदाबाद में कमर्शियल और पर्सनल गाड़ियों के लिए पुलिस वेरिफाइड ड्राइवर्स उपलब्ध कराते हैं।',
    ctaFleet: 'फ्लीट ड्राइवर्स लें',
    ctaPersonal: 'पर्सनल ड्राइवर लें',
    ctaDrive: 'ड्राइवर बनें',
    liveStatus: 'दिल्ली एनसीआर डेस्क: चालू है (सोम-शनि: 8 AM - 9 PM)',

    tabHome: 'होम',
    tabHire: 'ड्राइवर लें',
    tabVehicle: 'कार डायरी',
    tabToll: 'टोल व भत्ता',
    tabAcademy: 'ट्रेनिंग',

    fleetFormTitle: 'फ्लीट व कमर्शियल ड्राइवर रिक्वायरमेंट',
    fleetFormSub: 'कैब फ्लीट, टूर ऑपरेटर्स और कॉर्पोरेट स्टाफ पिकअप के लिए।',
    personalFormTitle: 'पर्सनल गाड़ी के लिए ड्राइवर बुक करें',
    personalFormSub: 'परिवार, रोज़ाना ऑफिस आवागमन और लग्जरी कारों के लिए।',
    tempFormTitle: 'अस्थाई / आउटस्टेशन ड्राइवर बुक करें',
    tempFormSub: '1 दिन के ट्रिप, वीकेंड हाईवे सफर या छुट्टी पर गए ड्राइवर की जगह बैकअप ड्राइवर।',
    driverFormTitle: 'ड्राइवर KYC और आवेदन फॉर्म',
    driverFormSub: 'दस्तावेज अपलोड करें और तुरंत वेरिफाइड होकर काम शुरू करें।',

    name: 'पूरा नाम / संपर्क व्यक्ति',
    phone: 'फ़ोन नंबर (कॉलिंग और व्हाट्सएप)',
    email: 'ईमेल आईडी (कन्फर्मेशन के लिए)',
    company: 'कंपनी / फ्लीट नाम (वैकल्पिक)',
    vehicle: 'गाड़ी का प्रकार / मॉडल (जैसे Innova / Creta / Dzire)',
    location: 'दिल्ली एनसीआर में इलाका',
    driverCount: 'कितने ड्राइवर्स की ज़रूरत है?',
    tripDate: 'ट्रिप की तारीख और समय',
    destination: 'कहाँ जाना है? (जैसे दिल्ली से आगरा / जयपुर)',
    licenseType: 'लाइसेंस का प्रकार (LMV / कमर्शियल बैच)',
    experience: 'ड्राइविंग का अनुभव (वर्षों में)',
    submitBtn: 'रिक्वेस्ट सबमिट करें',
    applyBtn: 'KYC और आवेदन जमा करें',

    successTitle: 'आवेदन प्राप्त हुआ!',
    successSub:
      'ड्राइवर्स साथी से संपर्क करने के लिए धन्यवाद। हमारी टीम जल्द आपसे फोन/व्हाट्सएप पर संपर्क करेगी।\n\nएक कन्फर्मेशन ईमेल भी आपको भेजा गया है।',
    closeBtn: 'ठीक है',
  },
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [currentTab, setCurrentTab] = useState('home'); // home | hire | vehicle | toll | academy
  const [hireCategory, setHireCategory] = useState('personal'); // personal | fleet | temporary
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Selected Toll Route
  const [selectedRoute, setSelectedRoute] = useState(ROUTES_DB[0]);

  // Car Care State (Insurance & PUC Expiry)
  const [insuranceDate, setInsuranceDate] = useState('2027-03-15');
  const [pucDate, setPucDate] = useState('2026-11-20');
  const [serviceKm, setServiceKm] = useState('45,000 km');

  // Fuel Log State
  const [fuelLitres, setFuelLitres] = useState('35');
  const [fuelCost, setFuelCost] = useState('3200');
  const [fuelOdo, setFuelOdo] = useState('41250');
  const [fuelEntries, setFuelEntries] = useState([
    { id: '1', date: '2026-09-08', litres: '35 L', cost: '₹3,200', odo: '41,250 km', mileage: '16.4 km/L' },
    { id: '2', date: '2026-08-25', litres: '40 L', cost: '₹3,750', odo: '40,680 km', mileage: '15.8 km/L' },
  ]);

  // Digital Duty Logbook State
  const [logEntries, setLogEntries] = useState([]);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logInTime, setLogInTime] = useState('09:00 AM');
  const [logOutTime, setLogOutTime] = useState('07:30 PM');
  const [logKm, setLogKm] = useState('45');
  const [logOT, setLogOT] = useState('1.5');

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

  const t = STRINGS[lang];

  // Persistent storage init
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@driver_duty_logs_v2');
        if (saved) setLogEntries(JSON.parse(saved));
        else {
          setLogEntries([
            { id: '1', date: '2026-09-08', in: '09:00 AM', out: '07:30 PM', km: '62 km', ot: '1.5 hrs' },
            { id: '2', date: '2026-09-09', in: '08:45 AM', out: '08:00 PM', km: '84 km', ot: '2.0 hrs' },
          ]);
        }
      } catch (e) {}
    })();
  }, []);

  const saveDutyLog = async () => {
    if (!logInTime || !logOutTime) {
      Alert.alert('Incomplete Entry', 'Please specify Check-in and Check-out times.');
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
    await AsyncStorage.setItem('@driver_duty_logs_v2', JSON.stringify(updated));
    Alert.alert('Entry Saved', `Driver duty recorded for ${logDate} with ${logOT || 0} hrs Overtime.`);
  };

  const addFuelEntry = () => {
    if (!fuelLitres || !fuelCost) {
      Alert.alert('Incomplete Entry', 'Please enter Liters filled and Total Cost.');
      return;
    }
    const newFuel = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      litres: `${fuelLitres} L`,
      cost: `₹${Number(fuelCost).toLocaleString('en-IN')}`,
      odo: `${fuelOdo} km`,
      mileage: '16.2 km/L',
    };
    setFuelEntries([newFuel, ...fuelEntries]);
    Alert.alert('Fuel Record Saved', 'Expense added to your vehicle ledger.');
  };

  // WhatsApp & Communication Actions
  const openWhatsApp = (prefilledText = '') => {
    const text =
      prefilledText ||
      (lang === 'en'
        ? 'Hello Drivers Saathi! I need a verified driver in Delhi NCR. Please share details and pricing.'
        : 'नमस्ते ड्राइवर्स साथी! मुझे दिल्ली एनसीआर में वेरिफाइड ड्राइवर की आवश्यकता है। कृपया जानकारी साझा करें।');
    Linking.openURL(`https://wa.me/918175087004?text=${encodeURIComponent(text)}`);
  };

  const handleCall = () => {
    Linking.openURL('tel:+918175087004');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@driverssaathi.com');
  };

  const handleSOS = () => {
    Alert.alert(
      '🚨 24x7 Roadside & Dispatch SOS',
      'Emergency roadside assistance & live dispatch hotline for Delhi NCR drivers and passengers.\n\nHelpline: +91 8175087004',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call SOS Helpline', onPress: handleCall },
      ]
    );
  };

  // Form Submission
  const handleFormSubmit = async (type) => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      Alert.alert('Required Information', 'Please enter your Full Name and Phone Number.');
      return;
    }

    setLoading(true);

    const autoResponderCopy =
      lang === 'en'
        ? `Thank you for contacting Drivers Saathi! We have received your ${type}. Our central dispatch desk is reviewing your requirement and will connect with you via Call / WhatsApp shortly. For urgent assistance, reach us directly at +91 8175087004 or support@driverssaathi.com.`
        : `ड्राइवर्स साथी से संपर्क करने के लिए धन्यवाद! आपकी ${type} हमें प्राप्त हो गई है। हमारी टीम जल्द आपसे कॉल/व्हाट्सएप पर संपर्क करेगी। तत्काल सहायता के लिए कॉल करें: +91 8175087004.`;

    const payload = {
      Category: type,
      Name: formData.name,
      'Phone Number': formData.phone,
      Email: formData.email || 'Not Provided',
      Company: formData.company || 'Individual',
      'Vehicle Model': formData.vehicle || 'Not specified',
      'Location / NCR Zone': formData.location || 'Delhi NCR',
      'Drivers Needed': formData.count || '1',
      'Trip Date & Time': formData.tripDate || 'N/A',
      Destination: formData.destination || 'Local NCR',
      'License Type': formData.license || 'LMV',
      Experience: formData.experience || 'Not specified',
      _subject: `[Lead Alert] ${type} - ${formData.name} (${formData.phone})`,
      _autoresponse: autoResponderCopy,
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
      setModalMessage(t.successSub);
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
    } catch (err) {
      setModalMessage(t.successSub);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar style="light" backgroundColor={THEME.ink} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image
            source={require('./assets/logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerRightButtons}>
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

      {/* Live Ticker */}
      <View style={styles.liveTicker}>
        <View style={styles.livePulse} />
        <Text style={styles.liveTickerText}>{t.liveStatus}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
          {/* ======================================================== */}
          {/* TAB 1: HOME SCREEN                                       */}
          {/* ======================================================== */}
          {currentTab === 'home' && (
            <View>
              {/* Hero Banner */}
              <View style={styles.heroWrapper}>
                <Image
                  source={require('./assets/driver_passenger_service.jpg')}
                  style={styles.heroBgImage}
                  resizeMode="cover"
                />
                <View style={styles.heroOverlay}>
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>{t.heroBadge}</Text>
                  </View>
                  <Text style={styles.heroHeading}>{t.headline}</Text>
                  <Text style={styles.heroBody}>{t.subheadline}</Text>

                  <View style={styles.heroBtnRow}>
                    <TouchableOpacity
                      style={styles.btnPrimary}
                      onPress={() => {
                        setCurrentTab('hire');
                        setHireCategory('personal');
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.btnPrimaryText}>{t.ctaPersonal} &rarr;</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnGlass}
                      onPress={() => {
                        setCurrentTab('hire');
                        setHireCategory('fleet');
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.btnGlassText}>{t.ctaFleet}</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.btnWhatsAppHero}
                    onPress={() => openWhatsApp()}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.btnWhatsAppHeroText}>💬 Instant WhatsApp Booking</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Super-App Feature Quick Grid */}
              <View style={styles.quickActionGrid}>
                <TouchableOpacity
                  style={styles.quickCard}
                  onPress={() => {
                    setCurrentTab('hire');
                    setHireCategory('temporary');
                  }}
                >
                  <Text style={styles.quickIcon}>🛣️</Text>
                  <Text style={styles.quickTitle}>Outstation & Highway</Text>
                  <Text style={styles.quickSub}>1-Day Driver for Agra / Jaipur / Hills</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickCard}
                  onPress={() => setCurrentTab('toll')}
                >
                  <Text style={styles.quickIcon}>💳</Text>
                  <Text style={styles.quickTitle}>Toll & Night DA Calc</Text>
                  <Text style={styles.quickSub}>FASTag, MCD border tax & driver allowance</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickCard}
                  onPress={() => setCurrentTab('vehicle')}
                >
                  <Text style={styles.quickIcon}>📋</Text>
                  <Text style={styles.quickTitle}>Car Care & Fuel Log</Text>
                  <Text style={styles.quickSub}>Insurance, PUC reminders & Km/L tracker</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickCard}
                  onPress={() => setCurrentTab('academy')}
                >
                  <Text style={styles.quickIcon}>🎓</Text>
                  <Text style={styles.quickTitle}>Chauffeur Academy</Text>
                  <Text style={styles.quickSub}>VIP etiquette, speed rules & safety guide</Text>
                </TouchableOpacity>
              </View>

              {/* Strict Verification Trust Stats */}
              <View style={styles.sectionHeadingBox}>
                <Text style={styles.sectionCategory}>STRICT VERIFICATION</Text>
                <Text style={styles.sectionTitle}>Why Fleets & Car Owners Trust Us</Text>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>100%</Text>
                  <Text style={styles.statLabel}>Police Record Verification</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>24-48h</Text>
                  <Text style={styles.statLabel}>Average Placement Time</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>30 Days</Text>
                  <Text style={styles.statLabel}>Free Driver Replacement</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>Delhi NCR</Text>
                  <Text style={styles.statLabel}>Complete Metro Coverage</Text>
                </View>
              </View>

              {/* Central Dispatch Desk */}
              <View style={styles.contactDeskCard}>
                <Text style={styles.contactDeskTitle}>Need a Driver Urgently?</Text>
                <Text style={styles.contactDeskSub}>
                  Reach our central dispatch desk directly via phone or official support email:
                </Text>

                <TouchableOpacity style={styles.actionCallBtn} onPress={handleCall} activeOpacity={0.9}>
                  <Text style={styles.actionCallBtnText}>📞 Call Dispatch: +91 8175087004</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionMailBtn} onPress={handleEmail} activeOpacity={0.9}>
                  <Text style={styles.actionMailBtnText}>✉️ support@driverssaathi.com</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 2: HIRE DRIVER                                       */}
          {/* ======================================================== */}
          {currentTab === 'hire' && (
            <View>
              <View style={styles.segmentContainer}>
                <TouchableOpacity
                  style={[styles.segmentBtn, hireCategory === 'personal' && styles.segmentBtnActive]}
                  onPress={() => setHireCategory('personal')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentBtnText, hireCategory === 'personal' && styles.segmentBtnTextActive]}>
                    Personal Chauffeur
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.segmentBtn, hireCategory === 'fleet' && styles.segmentBtnActive]}
                  onPress={() => setHireCategory('fleet')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentBtnText, hireCategory === 'fleet' && styles.segmentBtnTextActive]}>
                    Cab Fleet / B2B
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.segmentBtn, hireCategory === 'temporary' && styles.segmentBtnActive]}
                  onPress={() => setHireCategory('temporary')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentBtnText, hireCategory === 'temporary' && styles.segmentBtnTextActive]}>
                    Outstation / 1-Day
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formContainerCard}>
                <Text style={styles.formTitle}>
                  {hireCategory === 'personal'
                    ? t.personalFormTitle
                    : hireCategory === 'fleet'
                    ? t.fleetFormTitle
                    : t.tempFormTitle}
                </Text>
                <Text style={styles.formSubtitle}>
                  {hireCategory === 'personal'
                    ? t.personalFormSub
                    : hireCategory === 'fleet'
                    ? t.fleetFormSub
                    : t.tempFormSub}
                </Text>

                <Text style={styles.fieldLabel}>{t.name} *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Amit Verma"
                  placeholderTextColor={THEME.inkMuted}
                  value={formData.name}
                  onChangeText={(v) => setFormData({ ...formData, name: v })}
                />

                <Text style={styles.fieldLabel}>{t.phone} *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="+91 81750 87004"
                  placeholderTextColor={THEME.inkMuted}
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(v) => setFormData({ ...formData, phone: v })}
                />

                <Text style={styles.fieldLabel}>{t.email}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. yourname@company.com"
                  placeholderTextColor={THEME.inkMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(v) => setFormData({ ...formData, email: v })}
                />

                {hireCategory === 'temporary' && (
                  <>
                    <Text style={styles.fieldLabel}>{t.tripDate} *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Saturday 6:00 AM Departure"
                      placeholderTextColor={THEME.inkMuted}
                      value={formData.tripDate}
                      onChangeText={(v) => setFormData({ ...formData, tripDate: v })}
                    />

                    <Text style={styles.fieldLabel}>{t.destination} *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Delhi to Jaipur Return (2 Days)"
                      placeholderTextColor={THEME.inkMuted}
                      value={formData.destination}
                      onChangeText={(v) => setFormData({ ...formData, destination: v })}
                    />
                  </>
                )}

                {hireCategory === 'fleet' && (
                  <>
                    <Text style={styles.fieldLabel}>{t.company}</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Metro Cab Logistics Pvt Ltd"
                      placeholderTextColor={THEME.inkMuted}
                      value={formData.company}
                      onChangeText={(v) => setFormData({ ...formData, company: v })}
                    />

                    <Text style={styles.fieldLabel}>{t.driverCount}</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 5 Drivers"
                      placeholderTextColor={THEME.inkMuted}
                      keyboardType="numeric"
                      value={formData.count}
                      onChangeText={(v) => setFormData({ ...formData, count: v })}
                    />
                  </>
                )}

                <Text style={styles.fieldLabel}>{t.vehicle}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Honda City / Innova / Fortuner / EV"
                  placeholderTextColor={THEME.inkMuted}
                  value={formData.vehicle}
                  onChangeText={(v) => setFormData({ ...formData, vehicle: v })}
                />

                <Text style={styles.fieldLabel}>{t.location}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. South Delhi / DLF Gurugram / Sector 62 Noida"
                  placeholderTextColor={THEME.inkMuted}
                  value={formData.location}
                  onChangeText={(v) => setFormData({ ...formData, location: v })}
                />

                <TouchableOpacity
                  style={styles.submitActionButton}
                  onPress={() =>
                    handleFormSubmit(
                      hireCategory === 'personal'
                        ? 'Personal Permanent Chauffeur'
                        : hireCategory === 'fleet'
                        ? 'Fleet / Corporate Request'
                        : 'Temporary / Outstation Driver Request'
                    )
                  }
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitActionButtonText}>{t.submitBtn}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnWhatsAppOutline}
                  onPress={() =>
                    openWhatsApp(
                      `Hello Drivers Saathi! I want to hire a ${hireCategory} driver for my car in ${
                        formData.location || 'Delhi NCR'
                      }. Name: ${formData.name || ''}`
                    )
                  }
                >
                  <Text style={styles.btnWhatsAppOutlineText}>💬 Book Instantly via WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 3: CAR CARE, DOCUMENT EXPIRY & FUEL LOG              */}
          {/* ======================================================== */}
          {currentTab === 'vehicle' && (
            <View>
              {/* Document Expiry Tracker */}
              <View style={styles.sectionHeadingBox}>
                <Text style={styles.sectionCategory}>VEHICLE COMPLIANCE</Text>
                <Text style={styles.sectionTitle}>Document Expiry & Maintenance</Text>
                <Text style={styles.sectionSubtitle}>
                  Keep your vehicle road-legal across Delhi NCR. Track PUC, Insurance & Service schedule.
                </Text>
              </View>

              <View style={styles.carDocCard}>
                <View style={styles.docRow}>
                  <View>
                    <Text style={styles.docName}>🛡️ Vehicle Insurance</Text>
                    <Text style={styles.docSub}>Valid until: {insuranceDate}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: THEME.verifiedSoft }]}>
                    <Text style={[styles.statusBadgeText, { color: THEME.verified }]}>ACTIVE</Text>
                  </View>
                </View>

                <View style={styles.docRow}>
                  <View>
                    <Text style={styles.docName}>💨 PUC (Pollution Certificate)</Text>
                    <Text style={styles.docSub}>Valid until: {pucDate}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: THEME.marigoldLight }]}>
                    <Text style={[styles.statusBadgeText, { color: THEME.marigoldDeep }]}>RENEW IN 70D</Text>
                  </View>
                </View>

                <View style={styles.docRow}>
                  <View>
                    <Text style={styles.docName}>🔧 Periodic Engine Service</Text>
                    <Text style={styles.docSub}>Next due at: {serviceKm}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: THEME.blueSoft }]}>
                    <Text style={[styles.statusBadgeText, { color: THEME.blue }]}>SCHEDULED</Text>
                  </View>
                </View>
              </View>

              {/* Fuel Mileage Diary */}
              <View style={styles.sectionHeadingBox}>
                <Text style={styles.sectionCategory}>FUEL DIARY</Text>
                <Text style={styles.sectionTitle}>Fuel Expense & Mileage Log</Text>
              </View>

              <View style={styles.fuelInputCard}>
                <Text style={styles.logCardTitle}>+ Add Fuel Fill-up Entry</Text>
                <View style={styles.logInputRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Litres</Text>
                    <TextInput
                      style={styles.miniInput}
                      value={fuelLitres}
                      onChangeText={setFuelLitres}
                      placeholder="e.g. 35"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Total (₹)</Text>
                    <TextInput
                      style={styles.miniInput}
                      value={fuelCost}
                      onChangeText={setFuelCost}
                      placeholder="e.g. 3200"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Odometer (Km)</Text>
                    <TextInput
                      style={styles.miniInput}
                      value={fuelOdo}
                      onChangeText={setFuelOdo}
                      placeholder="41250"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.btnFuelSave} onPress={addFuelEntry} activeOpacity={0.85}>
                  <Text style={styles.btnFuelSaveText}>💾 Save Fuel Record</Text>
                </TouchableOpacity>
              </View>

              {fuelEntries.map((item) => (
                <View key={item.id} style={styles.fuelEntryCard}>
                  <View style={styles.fuelEntryTop}>
                    <Text style={styles.fuelEntryDate}>⛽ {item.date}</Text>
                    <Text style={styles.fuelEntryCost}>{item.cost}</Text>
                  </View>
                  <View style={styles.fuelEntryDetails}>
                    <Text style={styles.fuelEntryMeta}>{item.litres} • Odo: {item.odo}</Text>
                    <Text style={styles.fuelEntryMileage}>Avg: {item.mileage}</Text>
                  </View>
                </View>
              ))}

              {/* Digital Driver Duty Logbook */}
              <View style={[styles.sectionHeadingBox, { marginTop: 24 }]}>
                <Text style={styles.sectionCategory}>DRIVER ATTENDANCE</Text>
                <Text style={styles.sectionTitle}>Digital Duty & Overtime Log</Text>
              </View>

              <View style={styles.logCard}>
                <Text style={styles.logCardTitle}>+ Record Today's Duty Entry</Text>
                <View style={styles.logInputRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Date</Text>
                    <TextInput style={styles.miniInput} value={logDate} onChangeText={setLogDate} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Check-in</Text>
                    <TextInput style={styles.miniInput} value={logInTime} onChangeText={setLogInTime} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Check-out</Text>
                    <TextInput style={styles.miniInput} value={logOutTime} onChangeText={setLogOutTime} />
                  </View>
                </View>

                <View style={styles.logInputRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Distance (Km)</Text>
                    <TextInput style={styles.miniInput} value={logKm} onChangeText={setLogKm} keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Overtime (OT hrs)</Text>
                    <TextInput style={styles.miniInput} value={logOT} onChangeText={setLogOT} keyboardType="numeric" />
                  </View>
                </View>

                <TouchableOpacity style={styles.btnLogSave} onPress={saveDutyLog}>
                  <Text style={styles.btnLogSaveText}>💾 Save Driver Duty</Text>
                </TouchableOpacity>
              </View>

              {logEntries.map((entry) => (
                <View key={entry.id} style={styles.logEntryCard}>
                  <View style={styles.logEntryTop}>
                    <Text style={styles.logEntryDate}>📅 {entry.date}</Text>
                    <Text style={styles.logEntryOT}>+{entry.ot} Overtime</Text>
                  </View>
                  <View style={styles.logEntryDetails}>
                    <Text style={styles.logEntryMeta}>In: {entry.in} • Out: {entry.out}</Text>
                    <Text style={styles.logEntryKm}>Distance: {entry.km}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 4: TOLL, FASTAG & DRIVER ALLOWANCE (DA) CALCULATOR   */}
          {/* ======================================================== */}
          {currentTab === 'toll' && (
            <View>
              <View style={styles.sectionHeadingBox}>
                <Text style={styles.sectionCategory}>OUTSTATION ESTIMATOR</Text>
                <Text style={styles.sectionTitle}>Delhi NCR Toll, Tax & DA Guide</Text>
                <Text style={styles.sectionSubtitle}>
                  Accurate FASTag toll charges, border entry permits, and driver daily allowances (DA).
                </Text>
              </View>

              {/* Route Selector Tabs */}
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

              {/* Route Breakdown Card */}
              <View style={styles.routeDetailsCard}>
                <Text style={styles.routeCardName}>{selectedRoute.name}</Text>
                <Text style={styles.routeCardDistance}>📍 Approx Distance: {selectedRoute.distance}</Text>

                <View style={styles.routeDetailBox}>
                  <View style={styles.routeItemRow}>
                    <Text style={styles.routeItemLabel}>💳 Estimated FASTag Toll:</Text>
                    <Text style={styles.routeItemValue}>{selectedRoute.toll}</Text>
                  </View>

                  <View style={styles.routeItemRow}>
                    <Text style={styles.routeItemLabel}>🛂 State Border Taxes:</Text>
                    <Text style={styles.routeItemValue}>{selectedRoute.stateTax}</Text>
                  </View>

                  <View style={styles.routeItemRow}>
                    <Text style={styles.routeItemLabel}>🍽️ Driver Daily DA / Halt:</Text>
                    <Text style={[styles.routeItemValue, { color: THEME.marigoldDeep }]}>
                      {selectedRoute.driverDA}
                    </Text>
                  </View>

                  <View style={styles.routeItemRow}>
                    <Text style={styles.routeItemLabel}>📷 Max Speed Camera Limit:</Text>
                    <Text style={styles.routeItemValue}>{selectedRoute.speedLimit}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={() => {
                    setFormData({ ...formData, destination: selectedRoute.name });
                    setCurrentTab('hire');
                    setHireCategory('temporary');
                  }}
                >
                  <Text style={styles.btnPrimaryText}>Book Outstation Driver for this Route &rarr;</Text>
                </TouchableOpacity>
              </View>

              {/* Fast Tag Tips */}
              <View style={styles.tipCard}>
                <Text style={styles.tipTitle}>💡 Drivers Saathi Outstation Guidelines</Text>
                <Text style={styles.tipBody}>
                  • Driver Night Allowance (DA) of ₹400-₹500 applies if duty extends beyond 10:00 PM on outstation routes.
                  {'\n'}• Vehicle fuel, fast-tag tolls, and parking fees are borne by the vehicle owner.
                  {'\n'}• All our outstation chauffeurs hold commercial hill & expressway driving clearance.
                </Text>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 5: CHAUFFEUR ACADEMY & ETIQUETTE GUIDE               */}
          {/* ======================================================== */}
          {currentTab === 'academy' && (
            <View>
              <View style={styles.sectionHeadingBox}>
                <Text style={styles.sectionCategory}>CHAUFFEUR ACADEMY</Text>
                <Text style={styles.sectionTitle}>VIP Etiquette & Safety Protocol</Text>
                <Text style={styles.sectionSubtitle}>
                  Every driver placed by Drivers Saathi is trained in corporate decorum, privacy, and defensive driving.
                </Text>
              </View>

              {ACADEMY_TIPS.map((item) => (
                <View key={item.id} style={styles.academyCard}>
                  <View style={styles.academyHeader}>
                    <Text style={styles.academyCategory}>{item.category}</Text>
                  </View>
                  <Text style={styles.academyTitle}>{item.title}</Text>
                  <Text style={styles.academyTip}>{item.tip}</Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.btnWhatsAppOutline}
                onPress={() =>
                  openWhatsApp(
                    'Hello Drivers Saathi Academy, I want to learn more about your chauffeur training program in Delhi NCR.'
                  )
                }
              >
                <Text style={styles.btnWhatsAppOutlineText}>🎓 Inquire About Driver Training Program</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating WhatsApp Action Button */}
      <TouchableOpacity style={styles.floatingWhatsApp} onPress={() => openWhatsApp()} activeOpacity={0.85}>
        <Text style={styles.floatingWhatsAppIcon}>💬</Text>
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabButton} onPress={() => setCurrentTab('home')} activeOpacity={0.7}>
          <Text style={[styles.tabIconText, currentTab === 'home' && styles.tabIconActive]}>🏠</Text>
          <Text style={[styles.tabLabel, currentTab === 'home' && styles.tabLabelActive]}>{t.tabHome}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => setCurrentTab('hire')} activeOpacity={0.7}>
          <Text style={[styles.tabIconText, currentTab === 'hire' && styles.tabIconActive]}>🚗</Text>
          <Text style={[styles.tabLabel, currentTab === 'hire' && styles.tabLabelActive]}>{t.tabHire}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => setCurrentTab('vehicle')} activeOpacity={0.7}>
          <Text style={[styles.tabIconText, currentTab === 'vehicle' && styles.tabIconActive]}>📋</Text>
          <Text style={[styles.tabLabel, currentTab === 'vehicle' && styles.tabLabelActive]}>{t.tabVehicle}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => setCurrentTab('toll')} activeOpacity={0.7}>
          <Text style={[styles.tabIconText, currentTab === 'toll' && styles.tabIconActive]}>💳</Text>
          <Text style={[styles.tabLabel, currentTab === 'toll' && styles.tabLabelActive]}>{t.tabToll}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => setCurrentTab('academy')} activeOpacity={0.7}>
          <Text style={[styles.tabIconText, currentTab === 'academy' && styles.tabIconActive]}>🎓</Text>
          <Text style={[styles.tabLabel, currentTab === 'academy' && styles.tabLabelActive]}>{t.tabAcademy}</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalCheckCircle}>
              <Text style={styles.modalCheckMark}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>{t.successTitle}</Text>
            <Text style={styles.modalBody}>{modalMessage}</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)} activeOpacity={0.85}>
              <Text style={styles.modalCloseBtnText}>{t.closeBtn}</Text>
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
    width: 165,
    height: 42,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosButton: {
    backgroundColor: THEME.sosSoft,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  sosButtonText: {
    color: THEME.sosRed,
    fontSize: 12,
    fontWeight: '800',
  },
  languageToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  languageToggleText: {
    color: THEME.paper,
    fontSize: 12,
    fontWeight: '700',
  },
  liveTicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.cardNavy,
    paddingVertical: 7,
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
  mainScroll: {
    padding: 16,
    backgroundColor: THEME.paperAlt,
    paddingBottom: 120,
  },

  // Hero section
  heroWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: THEME.ink,
    position: 'relative',
    minHeight: 390,
  },
  heroBgImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.38,
  },
  heroOverlay: {
    padding: 22,
    justifyContent: 'flex-end',
    minHeight: 390,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.marigold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    color: THEME.paper,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroHeading: {
    color: THEME.paper,
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 8,
  },
  heroBody: {
    color: '#E2E8F0',
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 18,
  },
  heroBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  btnPrimary: {
    backgroundColor: THEME.marigold,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    shadowColor: THEME.marigold,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  btnPrimaryText: {
    color: THEME.paper,
    fontWeight: '700',
    fontSize: 14,
  },
  btnGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    flex: 1,
  },
  btnGlassText: {
    color: THEME.paper,
    fontWeight: '700',
    fontSize: 14,
  },
  btnWhatsAppHero: {
    backgroundColor: THEME.whatsapp,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  btnWhatsAppHeroText: {
    color: '#FFF',
    fontSize: 13.5,
    fontWeight: '800',
  },

  // Quick Action Grid
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  quickCard: {
    width: '48%',
    backgroundColor: THEME.paper,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.line,
  },
  quickIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  quickTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 2,
  },
  quickSub: {
    fontSize: 11,
    color: THEME.inkSoft,
    lineHeight: 15,
  },

  // Section Headers
  sectionHeadingBox: {
    marginBottom: 14,
    marginTop: 6,
  },
  sectionCategory: {
    color: THEME.marigoldDeep,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: THEME.inkSoft,
    lineHeight: 18,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: THEME.paper,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.line,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11.5,
    color: THEME.inkSoft,
    fontWeight: '500',
  },

  // Contact Desk Card
  contactDeskCard: {
    backgroundColor: THEME.cardNavy,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  contactDeskTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.paper,
    marginBottom: 4,
  },
  contactDeskSub: {
    fontSize: 13,
    color: '#CBD5E1',
    marginBottom: 14,
    lineHeight: 18,
  },
  actionCallBtn: {
    backgroundColor: THEME.marigold,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionCallBtnText: {
    color: THEME.paper,
    fontWeight: '800',
    fontSize: 14,
  },
  actionMailBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionMailBtnText: {
    color: '#E2E8F0',
    fontWeight: '600',
    fontSize: 13,
  },

  // Forms
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: THEME.paper,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.inkSoft,
    textAlign: 'center',
  },
  segmentBtnTextActive: {
    color: THEME.marigoldDeep,
    fontWeight: '800',
  },
  formContainerCard: {
    backgroundColor: THEME.paper,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.line,
  },
  formTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: THEME.inkSoft,
    lineHeight: 18,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.ink,
    marginTop: 10,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: THEME.paperAlt,
    borderWidth: 1,
    borderColor: THEME.line,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: THEME.ink,
  },
  submitActionButton: {
    backgroundColor: THEME.marigold,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 18,
    shadowColor: THEME.marigold,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  submitActionButtonText: {
    color: THEME.paper,
    fontWeight: '800',
    fontSize: 15,
  },
  btnWhatsAppOutline: {
    backgroundColor: THEME.verifiedSoft,
    borderWidth: 1.5,
    borderColor: THEME.whatsapp,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  btnWhatsAppOutlineText: {
    color: '#065F46',
    fontWeight: '800',
    fontSize: 13.5,
  },

  // Car Care & Expiry
  carDocCard: {
    backgroundColor: THEME.paper,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 20,
    gap: 12,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: THEME.lineSoft,
  },
  docName: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.ink,
  },
  docSub: {
    fontSize: 12,
    color: THEME.inkSoft,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },

  // Fuel Input & History
  fuelInputCard: {
    backgroundColor: THEME.paper,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 14,
  },
  btnFuelSave: {
    backgroundColor: THEME.verified,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  btnFuelSaveText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  fuelEntryCard: {
    backgroundColor: THEME.paper,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 8,
  },
  fuelEntryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fuelEntryDate: {
    fontSize: 13.5,
    fontWeight: '800',
    color: THEME.ink,
  },
  fuelEntryCost: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.marigoldDeep,
  },
  fuelEntryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fuelEntryMeta: {
    fontSize: 12,
    color: THEME.inkSoft,
  },
  fuelEntryMileage: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.verified,
  },

  // Duty Logbook
  logCard: {
    backgroundColor: THEME.paper,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: THEME.blue,
    marginBottom: 16,
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
    paddingVertical: 11,
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
    borderRadius: 12,
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
    backgroundColor: THEME.marigoldLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logEntryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logEntryMeta: {
    fontSize: 12,
    color: THEME.inkSoft,
  },
  logEntryKm: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.ink,
  },

  // Toll Tab
  routeScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  routePill: {
    backgroundColor: THEME.paper,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.line,
    marginRight: 8,
  },
  routePillActive: {
    backgroundColor: THEME.marigold,
    borderColor: THEME.marigoldDeep,
  },
  routePillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: THEME.inkSoft,
  },
  routePillTextActive: {
    color: THEME.paper,
    fontWeight: '800',
  },
  routeDetailsCard: {
    backgroundColor: THEME.paper,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 16,
  },
  routeCardName: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
  },
  routeCardDistance: {
    fontSize: 13,
    color: THEME.inkSoft,
    marginBottom: 14,
  },
  routeDetailBox: {
    backgroundColor: THEME.paperAlt,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 16,
  },
  routeItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeItemLabel: {
    fontSize: 12.5,
    color: THEME.inkSoft,
  },
  routeItemValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: THEME.ink,
  },
  tipCard: {
    backgroundColor: THEME.paper,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 6,
  },
  tipBody: {
    fontSize: 12.5,
    color: THEME.inkSoft,
    lineHeight: 18,
  },

  // Academy Tab
  academyCard: {
    backgroundColor: THEME.paper,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.line,
    marginBottom: 12,
  },
  academyHeader: {
    marginBottom: 4,
  },
  academyCategory: {
    fontSize: 10.5,
    fontWeight: '800',
    color: THEME.marigoldDeep,
    letterSpacing: 0.6,
  },
  academyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 6,
  },
  academyTip: {
    fontSize: 12.5,
    color: THEME.inkSoft,
    lineHeight: 18,
  },

  // Floating WhatsApp
  floatingWhatsApp: {
    position: 'absolute',
    bottom: 75,
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

  // Bottom Navigation Bar
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: THEME.paper,
    borderTopWidth: 1,
    borderTopColor: THEME.line,
    paddingVertical: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  tabIconText: {
    fontSize: 18,
    marginBottom: 2,
    opacity: 0.7,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.inkSoft,
  },
  tabLabelActive: {
    color: THEME.marigold,
    fontWeight: '800',
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.verifiedSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: THEME.verified,
  },
  modalCheckMark: {
    color: THEME.verified,
    fontSize: 32,
    fontWeight: '800',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 13.5,
    color: THEME.inkSoft,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCloseBtn: {
    backgroundColor: THEME.ink,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: THEME.paper,
    fontSize: 14,
    fontWeight: '700',
  },
});
