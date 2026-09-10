import React, { useState } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Brand Palette
const COLORS = {
  ink: '#0F172A',
  inkSoft: '#475569',
  marigold: '#FB8500',
  marigoldDeep: '#D97706',
  white: '#FFFFFF',
  paperAlt: '#F8FAFC',
  line: '#E2E8F0',
  verified: '#10B981',
  verifiedSoft: '#ECFDF5',
};

const STRINGS = {
  en: {
    tagline: 'Verified Drivers for Fleets & Private Cars',
    subtag: 'Delhi NCR Dispatch Desk: Active',
    tabHome: 'Home',
    tabHire: 'Hire Driver',
    tabDrive: 'Drive With Us',
    tabPricing: 'Pricing',
    callNow: 'Call Helpline: +91 8175087004',
    mailUs: 'Email: support@driverssaathi.com',
    fleetTitle: 'Fleet & Corporate Driver Placement',
    personalTitle: 'Personal / Private Car Chauffeur',
    driverTitle: 'Driver Partner Application (Join Saathi)',
    submit: 'Submit Requirement',
    applyNow: 'Submit Application',
    name: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    company: 'Company / Fleet Name (Optional)',
    location: 'City / Area in Delhi NCR',
    vehicle: 'Car Model (e.g. Creta / Innova)',
    licenseType: 'License Type (LMV / Commercial)',
    exp: 'Years of Experience',
    successMsg: 'Thank you! We have received your details. Our dispatch desk will call you shortly.',
    switchLang: 'हिन्दी',
  },
  hi: {
    tagline: 'गाड़ियों और फ्लीट्स के लिए वेरिफाइड ड्राइवर्स',
    subtag: 'दिल्ली एनसीआर हेल्पडेस्क: चालू है',
    tabHome: 'होम',
    tabHire: 'ड्राइवर चाहिए',
    tabDrive: 'ड्राइवर बनें',
    tabPricing: 'प्राइसिंग',
    callNow: 'हेल्पलाइन कॉल करें: 8175087004',
    mailUs: 'ईमेल: support@driverssaathi.com',
    fleetTitle: 'फ्लीट और कंपनी ड्राइवर्स',
    personalTitle: 'पर्सनल गाड़ी के लिए ड्राइवर',
    driverTitle: 'ड्राइवर्स साथी से जुड़ें (आवेदन फॉर्म)',
    submit: 'रिक्वेस्ट भेजें',
    applyNow: 'आवेदन जमा करें',
    name: 'पूरा नाम',
    phone: 'मोबाइल नंबर',
    email: 'ईमेल पता',
    company: 'कंपनी / फ्लीट नाम (वैकल्पिक)',
    location: 'दिल्ली एनसीआर में इलाका',
    vehicle: 'गाड़ी का मॉडल (जैसे Creta / Innova)',
    licenseType: 'लाइसेंस का प्रकार (LMV / कमर्शियल)',
    exp: 'ड्राइविंग का अनुभव (साल)',
    successMsg: 'धन्यवाद! आपकी जानकारी प्राप्त हो गई है। हमारी टीम जल्द आपसे संपर्क करेगी।',
    switchLang: 'English',
  },
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('home');
  const [subHireTab, setSubHireTab] = useState('fleet');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    location: '',
    vehicle: '',
    license: '',
    exp: '',
  });

  const t = STRINGS[lang];

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'hi' : 'en');
  };

  const makeCall = () => {
    Linking.openURL('tel:+918175087004');
  };

  const sendEmail = () => {
    Linking.openURL('mailto:support@driverssaathi.com');
  };

  const handleFormSubmit = async (type) => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      Alert.alert('Required Fields', 'Please enter your Name and Phone Number.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        Category: type,
        Name: formData.name,
        Phone: formData.phone,
        Email: formData.email,
        Company: formData.company,
        Location: formData.location,
        Vehicle: formData.vehicle,
        License: formData.license,
        Experience: formData.exp,
        _subject: `New ${type} from Drivers Saathi Mobile App`,
      };

      await fetch('https://formsubmit.co/ajax/support@driverssaathi.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      Alert.alert('Success', t.successMsg);
      setFormData({
        name: '',
        phone: '',
        email: '',
        company: '',
        location: '',
        vehicle: '',
        license: '',
        exp: '',
      });
    } catch (e) {
      Alert.alert('Sent', t.successMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={COLORS.ink} />

      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <Image
            source={require('./assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity style={styles.langBtn} onPress={toggleLanguage}>
          <Text style={styles.langBtnText}>{t.switchLang}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dispatchBar}>
        <View style={styles.pulseDot} />
        <Text style={styles.dispatchText}>{t.subtag}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {activeTab === 'home' && (
            <View>
              <View style={styles.heroCard}>
                <Text style={styles.heroBadge}>DELHI NCR #1 DRIVER NETWORK</Text>
                <Text style={styles.heroTitle}>Drivers Saathi</Text>
                <Text style={styles.heroSub}>{t.tagline}</Text>

                <View style={styles.heroActionRow}>
                  <TouchableOpacity
                    style={[styles.primaryBtn, { flex: 1 }]}
                    onPress={() => {
                      setActiveTab('hire');
                      setSubHireTab('fleet');
                    }}
                  >
                    <Text style={styles.primaryBtnText}>Hire Fleets &rarr;</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.secondaryBtn, { flex: 1 }]}
                    onPress={() => {
                      setActiveTab('hire');
                      setSubHireTab('personal');
                    }}
                  >
                    <Text style={styles.secondaryBtnText}>Personal Chauffeur</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.outlineBtn, { marginTop: 10 }]}
                  onPress={() => setActiveTab('drive')}
                >
                  <Text style={styles.outlineBtnText}>Drive with Us (Join as Driver)</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.featuresRow}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureNumber}>100%</Text>
                  <Text style={styles.featureLabel}>Police & Background Verified</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureNumber}>24-48h</Text>
                  <Text style={styles.featureLabel}>Fast Placement SLA</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureNumber}>Delhi NCR</Text>
                  <Text style={styles.featureLabel}>Complete Coverage</Text>
                </View>
              </View>

              <View style={styles.contactCard}>
                <Text style={styles.contactTitle}>Need Immediate Assistance?</Text>
                <TouchableOpacity style={styles.callBtn} onPress={makeCall}>
                  <Text style={styles.callBtnText}>{t.callNow}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.emailBtn} onPress={sendEmail}>
                  <Text style={styles.emailBtnText}>{t.mailUs}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'hire' && (
            <View>
              <View style={styles.subTabRow}>
                <TouchableOpacity
                  style={[styles.subTabItem, subHireTab === 'fleet' && styles.subTabActive]}
                  onPress={() => setSubHireTab('fleet')}
                >
                  <Text
                    style={[
                      styles.subTabText,
                      subHireTab === 'fleet' && styles.subTabTextActive,
                    ]}
                  >
                    Cab Fleet / B2B
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.subTabItem, subHireTab === 'personal' && styles.subTabActive]}
                  onPress={() => setSubHireTab('personal')}
                >
                  <Text
                    style={[
                      styles.subTabText,
                      subHireTab === 'personal' && styles.subTabTextActive,
                    ]}
                  >
                    Personal Car
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formCard}>
                <Text style={styles.formHeading}>
                  {subHireTab === 'fleet' ? t.fleetTitle : t.personalTitle}
                </Text>

                <Text style={styles.inputLabel}>{t.name} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />

                <Text style={styles.inputLabel}>{t.phone} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 81750 87004"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                />

                <Text style={styles.inputLabel}>{t.email}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                />

                {subHireTab === 'fleet' ? (
                  <>
                    <Text style={styles.inputLabel}>{t.company}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Metro Cabs / Tech Fleet"
                      value={formData.company}
                      onChangeText={(text) => setFormData({ ...formData, company: text })}
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.inputLabel}>{t.vehicle}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Honda City / Creta / Fortuner"
                      value={formData.vehicle}
                      onChangeText={(text) => setFormData({ ...formData, vehicle: text })}
                    />
                  </>
                )}

                <Text style={styles.inputLabel}>{t.location}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. South Delhi / Gurugram / Noida"
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                />

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() =>
                    handleFormSubmit(
                      subHireTab === 'fleet' ? 'Fleet Hire Request' : 'Personal Driver Hire'
                    )
                  }
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>{t.submit}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'drive' && (
            <View>
              <View style={styles.formCard}>
                <Text style={styles.formHeading}>{t.driverTitle}</Text>
                <Text style={styles.formNote}>
                  Join the highest-rated driver dispatch network in Delhi NCR. Get consistent salary,
                  verified owners, and on-time payouts.
                </Text>

                <Text style={styles.inputLabel}>{t.name} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Driver Full Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />

                <Text style={styles.inputLabel}>{t.phone} (WhatsApp) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                />

                <Text style={styles.inputLabel}>{t.licenseType}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. LMV Commercial Badge / Transport"
                  value={formData.license}
                  onChangeText={(text) => setFormData({ ...formData, license: text })}
                />

                <Text style={styles.inputLabel}>{t.exp}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 5 Years"
                  keyboardType="numeric"
                  value={formData.exp}
                  onChangeText={(text) => setFormData({ ...formData, exp: text })}
                />

                <Text style={styles.inputLabel}>{t.location}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Karol Bagh, Delhi / Sector 14 Gurugram"
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                />

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => handleFormSubmit('Driver Job Application')}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>{t.applyNow}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'pricing' && (
            <View>
              <View style={styles.planCard}>
                <Text style={styles.planTag}>FLEXIBLE</Text>
                <Text style={styles.planTitle}>Pay-Per-Hire</Text>
                <Text style={styles.planDesc}>
                  One-time onboarding fee per verified driver placement. 30-day replacement warranty
                  included.
                </Text>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    setActiveTab('hire');
                    setSubHireTab('fleet');
                  }}
                >
                  <Text style={styles.primaryBtnText}>Book Pay-Per-Hire</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.planCard}>
                <Text style={[styles.planTag, { backgroundColor: '#10B981' }]}>POPULAR</Text>
                <Text style={styles.planTitle}>Monthly Retainer</Text>
                <Text style={styles.planDesc}>
                  Continuous driver supply & dedicated backup pool for fleets and corporate offices.
                  Zero downtime.
                </Text>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    setActiveTab('hire');
                    setSubHireTab('fleet');
                  }}
                >
                  <Text style={styles.primaryBtnText}>Get Retainer Plan</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.planCard}>
                <Text style={[styles.planTag, { backgroundColor: '#6366F1' }]}>ENTERPRISE</Text>
                <Text style={styles.planTitle}>Enterprise Custom</Text>
                <Text style={styles.planDesc}>
                  Full fleet management, customized shifts, dedicated on-site account manager, and
                  custom SLAs.
                </Text>
                <TouchableOpacity style={styles.secondaryBtn} onPress={makeCall}>
                  <Text style={styles.secondaryBtnText}>Talk to Fleet Manager</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('home')}
        >
          <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>
            {t.tabHome}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('hire')}
        >
          <Text style={[styles.navText, activeTab === 'hire' && styles.navTextActive]}>
            {t.tabHire}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('drive')}
        >
          <Text style={[styles.navText, activeTab === 'drive' && styles.navTextActive]}>
            {t.tabDrive}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('pricing')}
        >
          <Text style={[styles.navText, activeTab === 'pricing' && styles.navTextActive]}>
            {t.tabPricing}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.ink,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 170,
    height: 42,
  },
  langBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  langBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  dispatchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.verified,
  },
  dispatchText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '500',
  },
  scrollContainer: {
    padding: 16,
    backgroundColor: COLORS.paperAlt,
    minHeight: '100%',
    paddingBottom: 90,
  },
  heroCard: {
    backgroundColor: COLORS.ink,
    borderRadius: 16,
    padding: 22,
    marginBottom: 16,
  },
  heroBadge: {
    color: COLORS.marigold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroSub: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: COLORS.marigold,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.marigold,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  outlineBtnText: {
    color: COLORS.marigold,
    fontWeight: '700',
    fontSize: 14,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  featureItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  featureNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 2,
  },
  featureLabel: {
    fontSize: 11,
    color: COLORS.inkSoft,
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 12,
  },
  callBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  callBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  emailBtn: {
    backgroundColor: COLORS.paperAlt,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  emailBtnText: {
    color: COLORS.ink,
    fontWeight: '600',
    fontSize: 13,
  },
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  subTabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  subTabActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.inkSoft,
  },
  subTabTextActive: {
    color: COLORS.marigoldDeep,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  formHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 6,
  },
  formNote: {
    fontSize: 13,
    color: COLORS.inkSoft,
    lineHeight: 18,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.paperAlt,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.ink,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 14,
  },
  planTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.marigold,
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 6,
  },
  planDesc: {
    fontSize: 13,
    color: COLORS.inkSoft,
    lineHeight: 18,
    marginBottom: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.inkSoft,
  },
  navTextActive: {
    color: COLORS.marigold,
    fontWeight: '700',
  },
});
