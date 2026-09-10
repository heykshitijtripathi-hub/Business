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

// ─── Minimal Executive Design System ───────────────────────────────────────────
// Inspired by Apple, Linear & Stripe: pure neutrals, hairline dividers, selective accent
const THEME = {
  bg: '#FFFFFF',
  bgSubtle: '#F9FAFB',
  card: '#FFFFFF',
  border: '#E5E7EB',
  borderSubtle: '#F3F4F6',
  text: '#111827',          // Primary Charcoal
  textSecondary: '#6B7280', // Secondary Gray
  textTertiary: '#9CA3AF',  // Muted Label
  accent: '#111827',        // Executive Charcoal CTA (Apple/Uber style)
  accentWarm: '#D97706',    // Warm Amber (used only for key highlights)
  accentWarmSoft: '#FEF3C7',
  green: '#059669',
  greenSoft: '#ECFDF5',
};

// ─── Verified Chauffeurs Data ──────────────────────────────────────────────────
const CHAUFFEURS = [
  {
    id: 'c1',
    name: 'Rameshwar Dayal',
    experience: '15 years experience',
    rating: '4.9',
    reviews: 184,
    specialty: 'Automatic & Luxury SUVs',
    location: 'South Delhi & Gurugram',
    photo: require('./assets/indian_driver_portrait.jpg'),
    bio: 'Former executive chauffeur for corporate directors. Trained in defensive driving and VIP protocol.',
  },
  {
    id: 'c2',
    name: 'Vikramaditya Singh',
    experience: '11 years experience',
    rating: '4.9',
    reviews: 142,
    specialty: 'German Sedans & Electric Vehicles',
    location: 'Gurugram & Central Delhi',
    photo: require('./assets/indian_driver_wheel.jpg'),
    bio: 'Specialist in luxury vehicles (BMW, Mercedes, Audi). Smooth handling, punctual, non-smoker.',
  },
  {
    id: 'c3',
    name: 'Mohan Lal Verma',
    experience: '18 years experience',
    rating: '5.0',
    reviews: 260,
    specialty: 'Highway & Outstation Trips',
    location: 'Delhi NCR & Noida',
    photo: require('./assets/driver_passenger_service.jpg'),
    bio: 'Extensive highway and expressway driving record. Familiar with Agra, Jaipur, and Chandigarh routes.',
  },
];

export default function App() {
  // Navigation: 'home' | 'chauffeurs' | 'bookings' | 'help'
  const [activeTab, setActiveTab] = useState('home');

  // Booking Modal
  const [bookingModal, setBookingModal] = useState({ visible: false, service: null, chauffeur: null });
  const [loading, setLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({ visible: false, message: '' });

  // Form State
  const [form, setForm] = useState({
    name: '',
    phone: '',
    car: '',
    location: '',
    transmission: 'Automatic',
    plan: 'placement', // 'placement' (₹4,500) | 'monthly' (₹3,500/mo)
  });

  // Client Bookings
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@ds_minimal_bookings');
        if (saved) setBookings(JSON.parse(saved));
        else {
          setBookings([
            {
              id: 'DS-4091',
              service: 'Personal Chauffeur Placement',
              driver: 'Rameshwar Dayal',
              car: 'Hyundai Creta',
              status: 'Active',
              date: '04 Sep 2026',
              warranty: '30-day replacement active',
            },
          ]);
        }
      } catch (e) {}
    })();
  }, []);

  const openCall = () => Linking.openURL('tel:+918175087004');

  const openWhatsApp = (customText = '') => {
    const text = customText || 'Hello Drivers Saathi, I would like to inquire about hiring a driver.';
    Linking.openURL(`https://wa.me/918175087004?text=${encodeURIComponent(text)}`);
  };

  const handleOpenBooking = (service, chauffeur = null) => {
    setBookingModal({
      visible: true,
      service: service || { title: 'Personal Chauffeur Placement', price: '₹4,500' },
      chauffeur: chauffeur,
    });
  };

  const handleConfirmBooking = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      Alert.alert('Required', 'Please enter your name and phone number.');
      return;
    }

    setLoading(true);
    const bookingId = `DS-${Math.floor(1000 + Math.random() * 9000)}`;
    const title = bookingModal.chauffeur
      ? `Chauffeur: ${bookingModal.chauffeur.name}`
      : (bookingModal.service?.title || 'Driver Service');

    const fee = form.plan === 'monthly' ? '₹3,500 / month retainer' : '₹4,500 placement fee';

    const payload = {
      BookingID: bookingId,
      Service: title,
      SelectedDriver: bookingModal.chauffeur?.name || 'Assigned by desk',
      Name: form.name,
      Phone: form.phone,
      CarModel: form.car || 'Private Vehicle',
      Location: form.location || 'Delhi NCR',
      Transmission: form.transmission,
      Plan: fee,
      _subject: `[Booking #${bookingId}] ${title} - ${form.name}`,
      _autoresponse: `Thank you for contacting Drivers Saathi. Your request #${bookingId} has been received. Our account manager will contact you within one business day.\n\nHelpline: +91 8175087004`,
    };

    try {
      await fetch('https://formsubmit.co/ajax/support@driverssaathi.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const newRecord = {
        id: bookingId,
        service: title,
        driver: bookingModal.chauffeur?.name || 'Allocation in progress',
        car: form.car || 'Private vehicle',
        status: 'Confirmed',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        warranty: '30-day replacement active',
      };

      const updated = [newRecord, ...bookings];
      setBookings(updated);
      await AsyncStorage.setItem('@ds_minimal_bookings', JSON.stringify(updated));

      setBookingModal({ visible: false, service: null, chauffeur: null });
      setConfirmationModal({
        visible: true,
        message: `Booking ${bookingId} confirmed.\n\nOur account manager will call you at ${form.phone} within one business day to coordinate candidate interview details.`,
      });
      setForm({ name: '', phone: '', car: '', location: '', transmission: 'Automatic', plan: 'placement' });
    } catch (e) {
      Alert.alert('Notice', 'Your request has been recorded. Our team will contact you shortly.');
      setBookingModal({ visible: false, service: null, chauffeur: null });
    } finally {
      setLoading(false);
    }
  };

  // ─── TAB 1: HOME SCREEN (SERVICES) ───────────────────────────────────────────
  const renderHomeScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Editorial Headline */}
      <View style={styles.heroSection}>
        <Text style={styles.heroPreTitle}>DELHI NCR</Text>
        <Text style={styles.heroTitle}>Private Chauffeurs, Vetted and Placed.</Text>
        <Text style={styles.heroDescription}>
          Police-cleared, experienced drivers for your daily commute, luxury vehicles, and outstation travel.
        </Text>
      </View>

      {/* Trust Points - Simple text line */}
      <View style={styles.trustBar}>
        <Text style={styles.trustText}>Police Verified</Text>
        <Text style={styles.trustDot}>•</Text>
        <Text style={styles.trustText}>30-Day Free Replacement</Text>
        <Text style={styles.trustDot}>•</Text>
        <Text style={styles.trustText}>GST Invoices</Text>
      </View>

      {/* Services List */}
      <View style={styles.servicesContainer}>
        {/* Service 1: Personal Chauffeur */}
        <View style={styles.serviceItemCard}>
          <Image source={require('./assets/indian_driver_portrait.jpg')} style={styles.serviceImage} resizeMode="cover" />
          <View style={styles.serviceBody}>
            <View style={styles.serviceHeaderRow}>
              <Text style={styles.serviceName}>Personal Chauffeur</Text>
              <Text style={styles.servicePrice}>₹4,500</Text>
            </View>
            <Text style={styles.serviceSummary}>
              Full-time driver dedicated to your private car. Route familiar, punctual, with a 30-day replacement warranty.
            </Text>
            <View style={styles.serviceActionRow}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => handleOpenBooking({ title: 'Personal Chauffeur Placement', price: '₹4,500' })}
                activeOpacity={0.9}
              >
                <Text style={styles.btnPrimaryText}>Book Placement</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => openWhatsApp('Inquiring about personal chauffeur placement.')}
                activeOpacity={0.8}
              >
                <Text style={styles.btnSecondaryText}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Service 2: Outstation Highway Trips */}
        <View style={styles.serviceItemCard}>
          <Image source={require('./assets/driver_passenger_service.jpg')} style={styles.serviceImage} resizeMode="cover" />
          <View style={styles.serviceBody}>
            <View style={styles.serviceHeaderRow}>
              <Text style={styles.serviceName}>Outstation & Highway</Text>
              <Text style={styles.servicePrice}>From ₹1,500/day</Text>
            </View>
            <Text style={styles.serviceSummary}>
              Experienced commercial drivers for expressway travel to Agra, Jaipur, Chandigarh, and Uttarakhand.
            </Text>
            <View style={styles.serviceActionRow}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => handleOpenBooking({ title: 'Outstation Highway Trip', price: '₹1,500/day' })}
                activeOpacity={0.9}
              >
                <Text style={styles.btnPrimaryText}>Plan Trip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => openWhatsApp('Inquiring about an outstation highway driver.')}
                activeOpacity={0.8}
              >
                <Text style={styles.btnSecondaryText}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Service 3: Corporate Fleet Retainer */}
        <View style={styles.serviceItemCard}>
          <Image source={require('./assets/fleet_cabs_delhi.jpg')} style={styles.serviceImage} resizeMode="cover" />
          <View style={styles.serviceBody}>
            <View style={styles.serviceHeaderRow}>
              <Text style={styles.serviceName}>Corporate Fleet Retainer</Text>
              <Text style={styles.servicePrice}>B2B Contract</Text>
            </View>
            <Text style={styles.serviceSummary}>
              Continuous driver supply for corporate shuttles, travel desks, and logistics. Dedicated backup pool with guaranteed 4-hour SLA.
            </Text>
            <View style={styles.serviceActionRow}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => handleOpenBooking({ title: 'Corporate Fleet Retainer', price: 'B2B Contract' })}
                activeOpacity={0.9}
              >
                <Text style={styles.btnPrimaryText}>Request Proposal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSecondary} onPress={openCall} activeOpacity={0.8}>
                <Text style={styles.btnSecondaryText}>Call Desk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Driver Onboarding Strip */}
      <View style={styles.driverRecruitmentStrip}>
        <View style={{ flex: 1 }}>
          <Text style={styles.recruitmentTitle}>Are you a professional driver?</Text>
          <Text style={styles.recruitmentSubtitle}>Join our network of verified family and corporate chauffeurs.</Text>
        </View>
        <TouchableOpacity
          style={styles.btnRecruitment}
          onPress={() => openWhatsApp('Hello, I am a driver and would like to register with Drivers Saathi.')}
        >
          <Text style={styles.btnRecruitmentText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ─── TAB 2: CHAUFFEURS DIRECTORY ─────────────────────────────────────────────
  const renderChauffeursScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Verified Candidates</Text>
        <Text style={styles.pageSubtitle}>Pre-screened chauffeurs available for interviews and 1-day trials.</Text>
      </View>

      {CHAUFFEURS.map(c => (
        <View key={c.id} style={styles.chauffeurCard}>
          <View style={styles.chauffeurHeader}>
            <Image source={c.photo} style={styles.chauffeurAvatar} resizeMode="cover" />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={styles.chauffeurNameRow}>
                <Text style={styles.chauffeurName}>{c.name}</Text>
                <Text style={styles.chauffeurRating}>{c.rating} ({c.reviews})</Text>
              </View>
              <Text style={styles.chauffeurMeta}>{c.experience} • {c.location}</Text>
              <Text style={styles.chauffeurSpecialty}>{c.specialty}</Text>
            </View>
          </View>

          <Text style={styles.chauffeurBio}>{c.bio}</Text>

          <View style={styles.chauffeurFooter}>
            <TouchableOpacity
              style={styles.btnPrimaryCompact}
              onPress={() => handleOpenBooking({ title: `Placement with ${c.name}`, price: '₹4,500' }, c)}
              activeOpacity={0.9}
            >
              <Text style={styles.btnPrimaryCompactText}>Schedule Trial</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSecondaryCompact}
              onPress={() => openWhatsApp(`Inquiring about driver candidate ${c.name}.`)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnSecondaryCompactText}>Inquire</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  // ─── TAB 3: BOOKINGS & RECENT PLACEMENTS ──────────────────────────────────────
  const renderBookingsScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Bookings</Text>
        <Text style={styles.pageSubtitle}>Active placements, service history, and replacement claims.</Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No active placements</Text>
          <Text style={styles.emptyDescription}>Your scheduled chauffeur trials and placements will appear here.</Text>
        </View>
      ) : (
        bookings.map(b => (
          <View key={b.id} style={styles.bookingCard}>
            <View style={styles.bookingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bookingNumber}>{b.id}</Text>
                <Text style={styles.bookingTitle}>{b.service}</Text>
                <Text style={styles.bookingMeta}>Chauffeur: {b.driver} • {b.car}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{b.status}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.bookingFooter}>
              <Text style={styles.warrantyNote}>{b.warranty}</Text>
              <TouchableOpacity
                style={styles.btnTextAction}
                onPress={() => openWhatsApp(`Support request for booking ${b.id}.`)}
              >
                <Text style={styles.btnTextActionLabel}>Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  // ─── TAB 4: HELP & DISPATCH DESK ─────────────────────────────────────────────
  const renderHelpScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Support & Inquiries</Text>
        <Text style={styles.pageSubtitle}>Connect with our Delhi NCR dispatch desk directly.</Text>
      </View>

      <View style={styles.contactBlock}>
        <Text style={styles.contactTitle}>Dispatch Hotline</Text>
        <Text style={styles.contactText}>Operational Monday to Saturday, 8:00 AM to 9:00 PM</Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={openCall}>
          <Text style={styles.btnPrimaryText}>Call +91 8175087004</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.contactBlock, { marginTop: 14 }]}>
        <Text style={styles.contactTitle}>WhatsApp Client Desk</Text>
        <Text style={styles.contactText}>For candidate profiles, rate inquiries, and schedule confirmations.</Text>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => openWhatsApp()}>
          <Text style={styles.btnSecondaryText}>Chat on WhatsApp</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.faqSection}>
        <Text style={styles.faqHeading}>Frequently Asked Questions</Text>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How does the 30-day replacement warranty work?</Text>
          <Text style={styles.faqAnswer}>
            If you are not satisfied with your assigned driver's punctuality or conduct within the first 30 days, we provide a replacement candidate at zero additional placement fee.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Are all drivers police verified?</Text>
          <Text style={styles.faqAnswer}>
            Yes. Every candidate undergoes Aadhaar authentication, Parivahan driving license verification, and local police record screening before being presented to clients.
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  // ─── MODAL: CLEAN BOOKING SHEET ──────────────────────────────────────────────
  const renderBookingModal = () => {
    if (!bookingModal.visible) return null;
    const title = bookingModal.chauffeur
      ? `Hire ${bookingModal.chauffeur.name}`
      : (bookingModal.service?.title || 'Book Chauffeur');

    return (
      <Modal visible={bookingModal.visible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>{title}</Text>
                <Text style={styles.sheetSubtitle}>Delhi NCR placement desk</Text>
              </View>
              <TouchableOpacity
                style={styles.sheetCloseBtn}
                onPress={() => setBookingModal({ visible: false, service: null, chauffeur: null })}
              >
                <Text style={styles.sheetCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* Placement Plan Toggle */}
              <View style={styles.planSelector}>
                <TouchableOpacity
                  style={[styles.planOption, form.plan === 'placement' && styles.planOptionActive]}
                  onPress={() => setForm({ ...form, plan: 'placement' })}
                >
                  <Text style={[styles.planTitle, form.plan === 'placement' && styles.planTitleActive]}>
                    One-Time Placement
                  </Text>
                  <Text style={styles.planPrice}>₹4,500</Text>
                  <Text style={styles.planSub}>30-day warranty</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.planOption, form.plan === 'monthly' && styles.planOptionActive]}
                  onPress={() => setForm({ ...form, plan: 'monthly' })}
                >
                  <Text style={[styles.planTitle, form.plan === 'monthly' && styles.planTitleActive]}>
                    Monthly Retainer
                  </Text>
                  <Text style={styles.planPrice}>₹3,500/mo</Text>
                  <Text style={styles.planSub}>Continuous backup</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Priya Sharma"
                placeholderTextColor={THEME.textTertiary}
                value={form.name}
                onChangeText={v => setForm({ ...form, name: v })}
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="+91 98765 43210"
                placeholderTextColor={THEME.textTertiary}
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={v => setForm({ ...form, phone: v })}
              />

              <Text style={styles.inputLabel}>Car Model</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Hyundai Creta / Honda City"
                placeholderTextColor={THEME.textTertiary}
                value={form.car}
                onChangeText={v => setForm({ ...form, car: v })}
              />

              <Text style={styles.inputLabel}>Location / Area</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Vasant Vihar / DLF Phase 5 Gurugram"
                placeholderTextColor={THEME.textTertiary}
                value={form.location}
                onChangeText={v => setForm({ ...form, location: v })}
              />

              <Text style={styles.inputLabel}>Transmission</Text>
              <View style={styles.segmentedRow}>
                {['Automatic', 'Manual', 'Luxury / EV'].map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.segmentBtn, form.transmission === t && styles.segmentBtnActive]}
                    onPress={() => setForm({ ...form, transmission: t })}
                  >
                    <Text style={[styles.segmentBtnText, form.transmission === t && styles.segmentBtnTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.btnSubmitBooking}
              onPress={handleConfirmBooking}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnSubmitBookingText}>
                  Request Placement ({form.plan === 'monthly' ? '₹3,500/mo' : '₹4,500'})
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  // ─── MAIN SCAFFOLD ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      {/* Clean Minimal Header */}
      <View style={styles.header}>
        <View style={styles.brandGroup}>
          <Image
            source={require('./assets/driver-saathi-logo-light.png')}
            style={styles.headerEmblem}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandTitle}>DRIVERS SAATHI</Text>
            <Text style={styles.brandSub}>Delhi NCR</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.headerCallBtn} onPress={openCall} activeOpacity={0.8}>
          <Text style={styles.headerCallText}>+91 8175087004</Text>
        </TouchableOpacity>
      </View>

      {/* Main Tab Screen */}
      <View style={{ flex: 1 }}>
        {activeTab === 'home' && renderHomeScreen()}
        {activeTab === 'chauffeurs' && renderChauffeursScreen()}
        {activeTab === 'bookings' && renderBookingsScreen()}
        {activeTab === 'help' && renderHelpScreen()}
      </View>

      {/* Minimal Bottom Navigation */}
      <View style={styles.bottomBar}>
        {[
          { key: 'home', label: 'Services' },
          { key: 'chauffeurs', label: 'Chauffeurs' },
          { key: 'bookings', label: 'Bookings' },
          { key: 'help', label: 'Support' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Booking Modal */}
      {renderBookingModal()}

      {/* Confirmation Dialog */}
      <Modal visible={confirmationModal.visible} transparent animationType="fade">
        <View style={styles.modalBackdropCenter}>
          <View style={styles.confirmationCard}>
            <Text style={styles.confirmTitle}>Request Received</Text>
            <Text style={styles.confirmMessage}>{confirmationModal.message}</Text>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => {
                setConfirmationModal({ visible: false, message: '' });
                setActiveTab('bookings');
              }}
            >
              <Text style={styles.btnPrimaryText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── CLEAN, HUMAN-CRAFTED STYLESHEET ──────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.bg,
  },

  // Minimal Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.bg,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerEmblem: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.text,
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 10,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  headerCallText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textSecondary,
  },

  // Bottom Navigation Bar
  bottomBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    backgroundColor: THEME.bg,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: THEME.textSecondary,
  },
  tabLabelActive: {
    color: THEME.text,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 16,
    height: 2,
    backgroundColor: THEME.text,
    borderRadius: 1,
  },

  // Main Scroll Container
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Hero Section
  heroSection: {
    marginBottom: 16,
  },
  heroPreTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textTertiary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.text,
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 20,
  },

  // Trust Bar
  trustBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME.borderSubtle,
    marginBottom: 24,
    gap: 8,
  },
  trustText: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  trustDot: {
    fontSize: 10,
    color: THEME.textTertiary,
  },

  // Services
  servicesContainer: {
    gap: 20,
  },
  serviceItemCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  serviceImage: {
    width: '100%',
    height: 160,
  },
  serviceBody: {
    padding: 16,
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.text,
    letterSpacing: -0.3,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
  },
  serviceSummary: {
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 19,
    marginBottom: 16,
  },
  serviceActionRow: {
    flexDirection: 'row',
    gap: 10,
  },

  // Buttons
  btnPrimary: {
    flex: 1,
    backgroundColor: THEME.accent,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  btnSecondary: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: THEME.text,
    fontSize: 13,
    fontWeight: '600',
  },

  // Driver Recruitment Strip
  driverRecruitmentStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    backgroundColor: THEME.bgSubtle,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    marginTop: 24,
    gap: 12,
  },
  recruitmentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.text,
  },
  recruitmentSubtitle: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  btnRecruitment: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: THEME.text,
  },
  btnRecruitmentText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
  },

  // Chauffeurs Page
  pageHeader: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.text,
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginTop: 4,
  },
  chauffeurCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 16,
  },
  chauffeurHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chauffeurAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  chauffeurNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chauffeurName: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.text,
  },
  chauffeurRating: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  chauffeurMeta: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  chauffeurSpecialty: {
    fontSize: 11.5,
    color: THEME.textTertiary,
    marginTop: 2,
  },
  chauffeurBio: {
    fontSize: 12.5,
    color: THEME.textSecondary,
    lineHeight: 18,
    marginVertical: 10,
  },
  chauffeurFooter: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.borderSubtle,
    paddingTop: 12,
  },
  btnPrimaryCompact: {
    flex: 1,
    backgroundColor: THEME.text,
    paddingVertical: 9,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnPrimaryCompactText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  btnSecondaryCompact: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
  },
  btnSecondaryCompactText: {
    color: THEME.text,
    fontSize: 12,
    fontWeight: '600',
  },

  // Bookings Page
  bookingCard: {
    backgroundColor: THEME.card,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 12,
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.textTertiary,
    marginBottom: 2,
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.text,
  },
  bookingMeta: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: THEME.greenSoft,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: THEME.green,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.borderSubtle,
    marginVertical: 10,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  warrantyNote: {
    fontSize: 11.5,
    color: THEME.textSecondary,
  },
  btnTextActionLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: THEME.text,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 4,
  },
  emptyDescription: {
    fontSize: 13,
    color: THEME.textSecondary,
    textAlign: 'center',
  },

  // Support Screen
  contactBlock: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.text,
  },
  contactText: {
    fontSize: 12.5,
    color: THEME.textSecondary,
    marginTop: 4,
    marginBottom: 14,
  },
  faqSection: {
    marginTop: 28,
  },
  faqHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 14,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 12.5,
    color: THEME.textSecondary,
    lineHeight: 18,
  },

  // Bottom Sheet Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 28,
  },
  sheetHandle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.text,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  sheetCloseBtn: {
    padding: 4,
  },
  sheetCloseText: {
    fontSize: 14,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  planSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  planOption: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.bgSubtle,
  },
  planOptionActive: {
    borderColor: THEME.text,
    backgroundColor: '#FFFFFF',
  },
  planTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  planTitleActive: {
    color: THEME.text,
  },
  planPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.text,
    marginTop: 2,
  },
  planSub: {
    fontSize: 10,
    color: THEME.textTertiary,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.text,
    marginTop: 10,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: THEME.text,
    backgroundColor: '#FFFFFF',
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    backgroundColor: THEME.bgSubtle,
  },
  segmentBtnActive: {
    borderColor: THEME.text,
    backgroundColor: THEME.text,
  },
  segmentBtnText: {
    fontSize: 11,
    fontWeight: '500',
    color: THEME.textSecondary,
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
  },
  btnSubmitBooking: {
    backgroundColor: THEME.text,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 18,
  },
  btnSubmitBookingText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },

  // Confirmation Modal
  modalBackdropCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 13,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
});
