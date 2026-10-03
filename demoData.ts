import { InvestigationRecord, Campaign } from './types';

export const DEMO_INVESTIGATIONS: InvestigationRecord[] = [
  {
    id: 'TRP-2026-00124',
    title: 'State Bank KYC Verification Phishing Ring',
    timestamp: '2026-09-28T10:45:00Z',
    fraud_type: 'KYC Phishing / Bank Impersonation',
    risk_score: 94,
    risk_level: 'Critical',
    confidence: 0.93,
    victim_description: 'Received urgent SMS warning that SBI netbanking account would be blocked in 2 hours unless KYC was updated via link. Opened link and entered credentials + received immediate OTP payment request for ₹49,999.',
    isDemoCase: true,
    campaign_name: 'SBI-PanKYC-Campaign-09',
    evidences: [
      {
        id: 'EVD-01',
        type: 'text',
        name: 'SMS Message.txt',
        content: 'URGENT: Dear SBI Customer, your YONO account will be DEACTIVATED today due to pending KYC update. Click http://sbi-kyc-update-portal-882.xyz/login immediately to update PAN or pay penalty ₹5,000.',
        timestamp: '2026-09-28T10:32:00Z'
      },
      {
        id: 'EVD-02',
        type: 'url',
        name: 'Suspicious Domain URL',
        content: 'http://sbi-kyc-update-portal-882.xyz/login',
        timestamp: '2026-09-28T10:36:00Z'
      },
      {
        id: 'EVD-03',
        type: 'image',
        name: 'Payment Request Screenshot.png',
        content: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
        timestamp: '2026-09-28T10:43:00Z'
      }
    ],
    entities: [
      { id: 'ENT-101', type: 'organization', value: 'State Bank of India (SBI Impersonated)', role: 'Impersonated Entity', confidence: 0.99, isSuspicious: true },
      { id: 'ENT-102', type: 'domain', value: 'sbi-kyc-update-portal-882.xyz', role: 'Phishing Domain', confidence: 0.98, isSuspicious: true },
      { id: 'ENT-103', type: 'phone', value: '+91 98765 43210', role: 'Scam Sender Origin', confidence: 0.91, isSuspicious: true },
      { id: 'ENT-104', type: 'payment_id', value: 'paytm-merchant88@paytm', role: 'Mule Gateway VPA', confidence: 0.89, isSuspicious: true },
      { id: 'ENT-105', type: 'amount', value: '₹49,999', role: 'Unauthorised Transaction Claim', confidence: 0.95, isSuspicious: true },
      { id: 'ENT-106', type: 'scam_term', value: 'KYC Deactivation / YONO Lockout', role: 'Urgency Pressure Keyword', confidence: 0.97, isSuspicious: true }
    ],
    why_risky: [
      'Spoofed Official Identity: Domain "sbi-kyc-update-portal-882.xyz" uses typosquatting mimicking official SBI portal.',
      'Manufactured Urgency: Threatens 2-hour account lock and ₹5,000 fine to induce panic and force fast action.',
      'Credential & OTP Harvesting: Fake login screen captures netbanking password followed immediately by automated OTP prompt.',
      'Known Threat Campaign: Domain and VPA "paytm-merchant88@paytm" match 27 prior reported incidents across 3 states.'
    ],
    timeline: [
      { id: 'TL-1', timestamp: '10:32 AM', stage: 'Initial Contact', description: 'SMS received from unregistered long code (+91 98765 43210)', sourceEvidenceName: 'SMS Message.txt', status: 'CONFIRMED' },
      { id: 'TL-2', timestamp: '10:36 AM', stage: 'Impersonation', description: 'User opened http://sbi-kyc-update-portal-882.xyz showing cloned SBI YONO header', sourceEvidenceName: 'Suspicious Domain URL', status: 'CONFIRMED' },
      { id: 'TL-3', timestamp: '10:40 AM', stage: 'Credential Request', description: 'Fake portal prompted user for Netbanking Username, Password, and PAN card number', sourceEvidenceName: 'Payment Request Screenshot.png', status: 'INFERRED' },
      { id: 'TL-4', timestamp: '10:43 AM', stage: 'Financial Loss Trigger', description: 'Attacker submitted ₹49,999 transaction request via mule VPA paytm-merchant88@paytm and requested OTP', sourceEvidenceName: 'Payment Request Screenshot.png', status: 'CONFIRMED' }
    ],
    attack_stages: [
      { stage: 'Initial Contact', status: 'completed', description: 'Automated bulk SMS sent with panic framing' },
      { stage: 'Impersonation', status: 'completed', description: 'Cloned bank portal hosted on cheap .xyz TLD' },
      { stage: 'Social Engineering', status: 'completed', description: 'Threat of fine and account lockout' },
      { stage: 'Credential Request', status: 'completed', description: 'Login details harvested' },
      { stage: 'Financial Loss', status: 'active', description: 'Immediate OTP intercept attempt' }
    ],
    connected_entities: [
      { id: 'NODE-1', label: '+91 98765 43210', type: 'phone', riskScore: 92, incidentCount: 14, connectedNodes: ['NODE-2', 'NODE-3'], confidence: 0.91, note: 'Observed in 14 submitted incidents across Maharashtra & Gujarat' },
      { id: 'NODE-2', label: 'sbi-kyc-update-portal-882.xyz', type: 'domain', riskScore: 98, incidentCount: 27, connectedNodes: ['NODE-1', 'NODE-4'], confidence: 0.96, note: 'Registered 3 days ago via NameCheap with WHOIS privacy shield' },
      { id: 'NODE-3', label: 'paytm-merchant88@paytm', type: 'payment_id', riskScore: 89, incidentCount: 8, connectedNodes: ['NODE-1'], confidence: 0.88, note: 'Flagged as compromised merchant mule account' },
      { id: 'NODE-4', label: 'SBI-PanKYC-Campaign-09', type: 'campaign', riskScore: 95, incidentCount: 41, connectedNodes: ['NODE-2'], confidence: 0.94, note: 'Active multi-state phishing campaign targeting YONO users' }
    ],
    recommended_actions: {
      immediate: [
        'DO NOT share any OTP received on your mobile phone.',
        'Immediately disconnect or close the web browser tab.',
        'Call SBI Cyber Helpline / Toll-free 1800 11 2211 or 1930 to freeze netbanking immediately.'
      ],
      accountProtection: [
        'Change SBI Netbanking & YONO password immediately from official site (online.sbi).',
        'Enable Two-Factor Authentication (2FA) and profile password lock.',
        'Check recent transaction history for unrecognized pending debit requests.'
      ],
      evidencePreservation: [
        'Take full screenshots of SMS text, sender number, and URL.',
        'Save bank SMS alerts containing transaction reference numbers.',
        'Export this TRAPNET AI Evidence Report for official cybercrime submission.'
      ],
      reporting: [
        'File formal complaint on National Cyber Crime Reporting Portal (cybercrime.gov.in) under Category "Financial Fraud".',
        'Call national emergency helpline 1930 within 3 hours (Golden Hour protocol for fund freezing).'
      ]
    },
    ml_features: [
      { featureName: 'Suspicious TLD (.xyz / free host)', weight: 25, detectedValue: '.xyz non-standard TLD', impact: 'Critical' },
      { featureName: 'Brand Typosquatting Match', weight: 20, detectedValue: 'sbi-kyc-update-portal', impact: 'Critical' },
      { featureName: 'Urgency & Penalizing Language', weight: 18, detectedValue: 'DEACTIVATED / ₹5,000 fine', impact: 'High' },
      { featureName: 'Mule VPA Association', weight: 16, detectedValue: 'Match in 8 previous reports', impact: 'High' },
      { featureName: 'Unverified Sender Number', weight: 15, detectedValue: 'Standard 10-digit mobile (+91 98...) instead of Bank SMS Header (e.g. AD-SBIINB)', impact: 'High' }
    ]
  },
  {
    id: 'TRP-2026-00219',
    title: 'High-Yield Crypto Investment & Task Scam',
    timestamp: '2026-09-27T14:20:00Z',
    fraud_type: 'Investment Scam / Task Scam',
    risk_score: 88,
    risk_level: 'Critical',
    confidence: 0.89,
    victim_description: 'Added to a Telegram group named "Apex Wealth Crypto VIP Signals". Promised 300% daily returns for liking YouTube videos and investing ₹10,000 in crypto wallet address. Paid ₹10,000, shown fake profit of ₹45,000 on dashboard, but withdrawal blocked unless ₹25,000 "tax fee" paid.',
    isDemoCase: true,
    campaign_name: 'Apex-Crypto-Task-Ring',
    evidences: [
      {
        id: 'EVD-10',
        type: 'text',
        name: 'Telegram Chat Transcript.txt',
        content: 'Admin @Crypto_Master_VIP: Congratulations! Task #4 completed. Your wallet balance is now ₹45,000. To withdraw funds to your bank account, kindly deposit 18% GST clearance fee ₹8,100 to UPI ID fastpay.crypto@icici.',
        timestamp: '2026-09-27T13:10:00Z'
      },
      {
        id: 'EVD-11',
        type: 'url',
        name: 'Fake Trading Dashboard URL',
        content: 'https://apex-wealth-trade-app.online/dashboard',
        timestamp: '2026-09-27T13:15:00Z'
      }
    ],
    entities: [
      { id: 'ENT-201', type: 'person', value: '@Crypto_Master_VIP', role: 'Telegram Handler Alias', confidence: 0.92, isSuspicious: true },
      { id: 'ENT-202', type: 'payment_id', value: 'fastpay.crypto@icici', role: 'Destination UPI ID', confidence: 0.95, isSuspicious: true },
      { id: 'ENT-203', type: 'domain', value: 'apex-wealth-trade-app.online', role: 'Fake Investment Portal', confidence: 0.97, isSuspicious: true },
      { id: 'ENT-204', type: 'amount', value: '₹10,000 initial / ₹8,100 requested', role: 'Loss & Extortion Amounts', confidence: 0.94, isSuspicious: true }
    ],
    why_risky: [
      'Unrealistic Return Claims: Promises 300% guaranteed returns within hours.',
      'Advance Fee / Tax Extortion: Blocks withdrawal demanding additional "GST/Tax" deposits.',
      'Unregulated Domain: Site registered on cheap TLD (.online) without regulatory SEBI/FINRA credentials.',
      'Telegram Channel Pattern: Classic Pig Butchering / Task Scam funnel.'
    ],
    timeline: [
      { id: 'TL-21', timestamp: 'Yesterday', stage: 'Initial Contact', description: 'Added without consent to Telegram VIP Group', status: 'CONFIRMED' },
      { id: 'TL-22', timestamp: '11:00 AM', stage: 'Trust Establishment', description: 'Assigned initial small task and paid ₹150 reward to build trust', status: 'CONFIRMED' },
      { id: 'TL-23', timestamp: '01:10 PM', stage: 'Financial Loss', description: 'User deposited ₹10,000 via UPI ID fastpay.crypto@icici', status: 'CONFIRMED' },
      { id: 'TL-24', timestamp: '02:00 PM', stage: 'Follow-up Extortion', description: 'Demand for ₹8,100 tax fee before release of fictitious ₹45,000 profits', status: 'CONFIRMED' }
    ],
    attack_stages: [
      { stage: 'Initial Contact', status: 'completed', description: 'Unsolicited Telegram group add' },
      { stage: 'Trust Establishment', status: 'completed', description: 'Small payout reward given' },
      { stage: 'Investment Trap', status: 'completed', description: 'Lured into depositing ₹10,000' },
      { stage: 'Withdrawal Lock', status: 'active', description: 'Demanding fake tax fees' }
    ],
    connected_entities: [
      { id: 'NODE-20', label: 'fastpay.crypto@icici', type: 'payment_id', riskScore: 94, incidentCount: 19, connectedNodes: ['NODE-21'], confidence: 0.92, note: 'Mule UPI ID linked to 19 investment scam reports' },
      { id: 'NODE-21', label: 'apex-wealth-trade-app.online', type: 'domain', riskScore: 96, incidentCount: 11, connectedNodes: ['NODE-20'], confidence: 0.95, note: 'Hosted on Russian bulletproof server' }
    ],
    recommended_actions: {
      immediate: [
        'STOP depositing any additional money or "tax/processing fees".',
        'Block and report the Telegram user @Crypto_Master_VIP and group.'
      ],
      accountProtection: [
        'Report the UPI ID fastpay.crypto@icici to ICICI Bank & BHIM/Paytm app immediately.',
        'Secure your messaging accounts with 2-Step Verification.'
      ],
      evidencePreservation: [
        'Export full Telegram chat history and user IDs.',
        'Save bank UPI transaction receipts showing UTR numbers.'
      ],
      reporting: [
        'File complaint on cybercrime.gov.in under Category "Investment/Task Scam".'
      ]
    },
    ml_features: [
      { featureName: 'Guaranteed Unrealistic Return Indicator', weight: 30, detectedValue: '300% return claim', impact: 'Critical' },
      { featureName: 'Advance Fee Extortion Pattern', weight: 25, detectedValue: 'GST tax required before withdrawal', impact: 'Critical' },
      { featureName: 'Telegram Solitary Group Funnel', weight: 20, detectedValue: 'Unsolicited VIP group', impact: 'High' }
    ]
  },
  {
    id: 'TRP-2026-00305',
    title: 'Part-Time Work-From-Home Rating Scam',
    timestamp: '2026-09-26T18:10:00Z',
    fraud_type: 'Job Scam / E-Commerce Task Fraud',
    risk_score: 78,
    risk_level: 'High',
    confidence: 0.86,
    victim_description: 'Offered part-time job earning ₹3,000/day by rating hotels on Google Maps. Asked to buy "prepaid merchant packages" to unlock higher commission.',
    isDemoCase: true,
    campaign_name: 'PartTime-Review-Scam-04',
    evidences: [
      {
        id: 'EVD-30',
        type: 'text',
        name: 'WhatsApp Offer Text.txt',
        content: 'Hello! I am Sarah from HR Global Recruitment. We saw your profile on Naukri. Earn ₹2,000-₹5,000 daily working 1 hour from home. Contact Manager on Telegram t.me/hr_sarah_recruit.',
        timestamp: '2026-09-26T17:00:00Z'
      }
    ],
    entities: [
      { id: 'ENT-301', type: 'organization', value: 'HR Global Recruitment (Fake)', role: 'Fake Recruiter', confidence: 0.88, isSuspicious: true },
      { id: 'ENT-302', type: 'url', value: 't.me/hr_sarah_recruit', role: 'Telegram Channel redirect', confidence: 0.91, isSuspicious: true }
    ],
    why_risky: [
      'Unsolicited Job Offer: Sent via WhatsApp without prior application.',
      'Prepaid Task Model: Real jobs never ask candidates to pay money or deposit security funds to work.'
    ],
    timeline: [
      { id: 'TL-31', timestamp: '05:00 PM', stage: 'Initial Contact', description: 'WhatsApp message received', status: 'CONFIRMED' }
    ],
    attack_stages: [
      { stage: 'Initial Contact', status: 'completed', description: 'WhatsApp recruiting hook' },
      { stage: 'Social Engineering', status: 'active', description: 'Promise of easy daily income' }
    ],
    connected_entities: [],
    recommended_actions: {
      immediate: ['Cease communication immediately.', 'Do not send any registration fee.'],
      accountProtection: ['Block number on WhatsApp.'],
      evidencePreservation: ['Screenshot chat transcript.'],
      reporting: ['Report number on Chakshu portal (tafcop.srikrishnadevaraya.in/chakshu).']
    },
    ml_features: [
      { featureName: 'Unsolicited WFH Offer', weight: 35, detectedValue: 'WhatsApp recruitment spam', impact: 'High' }
    ]
  },
  {
    id: 'TRP-2026-00412',
    title: 'Customs Duty / FedEx Express Parcel Smuggling Scam',
    timestamp: '2026-09-25T11:00:00Z',
    fraud_type: 'Delivery Scam / Impersonation / Extortion',
    risk_score: 91,
    risk_level: 'Critical',
    confidence: 0.94,
    victim_description: 'Received IVR call claiming a FedEx parcel containing illegal drugs/passports bound for Taiwan was intercepted in Mumbai Customs. Connected to fake police officer demanding video verification and clearance deposit.',
    isDemoCase: true,
    campaign_name: 'FedEx-Customs-Extortion-Ring',
    evidences: [
      {
        id: 'EVD-40',
        type: 'text',
        name: 'Call Transcript & SMS.txt',
        content: 'This is FedEx Customer Care. Your parcel #FX-99218 has been seized by Mumbai Cyber Crime Branch. Press 1 to speak with Officer Sharma or face immediate arrest warrant.',
        timestamp: '2026-09-25T10:15:00Z'
      }
    ],
    entities: [
      { id: 'ENT-401', type: 'organization', value: 'FedEx Express / Mumbai Police (Impersonated)', role: 'Impersonated Authority', confidence: 0.98, isSuspicious: true },
      { id: 'ENT-402', type: 'phone', value: '+91 81234 56789', role: 'IVR Origin Number', confidence: 0.92, isSuspicious: true }
    ],
    why_risky: [
      'Digital Arrest Extortion: Law enforcement agencies never conduct arrests or demand money over Skype/WhatsApp video calls.',
      'Fear & Legal Threats: Threatens immediate arrest warrant to bypass critical thinking.'
    ],
    timeline: [
      { id: 'TL-41', timestamp: '10:15 AM', stage: 'Initial Contact', description: 'Automated IVR call warning of parcel seizure', status: 'CONFIRMED' }
    ],
    attack_stages: [
      { stage: 'Initial Contact', status: 'completed', description: 'Automated IVR call' },
      { stage: 'Impersonation', status: 'active', description: 'Fake police officer video call' }
    ],
    connected_entities: [],
    recommended_actions: {
      immediate: ['Disconnect video call immediately.', 'Do not transfer any money for "verification".'],
      accountProtection: ['Report number to police cyber cell.'],
      evidencePreservation: ['Record call timestamp and phone number.'],
      reporting: ['Call 1930 Cyber Crime Helpline immediately.']
    },
    ml_features: [
      { featureName: 'Digital Arrest / Law Enforcement Extortion', weight: 40, detectedValue: 'Mumbai Cyber Branch threat', impact: 'Critical' }
    ]
  },
  {
    id: 'TRP-2026-00588',
    title: 'Executive CEO Impersonation & Corporate Gift Card Fraud',
    timestamp: '2026-09-24T09:30:00Z',
    fraud_type: 'Impersonation / Business Email Compromise (BEC)',
    risk_score: 82,
    risk_level: 'High',
    confidence: 0.88,
    victim_description: 'Email received appearing to come from company CEO requesting immediate purchase of 10 Apple Gift Cards ($500 each) for client appreciation.',
    isDemoCase: true,
    campaign_name: 'Executive-BEC-Targeting-Tech',
    evidences: [
      {
        id: 'EVD-50',
        type: 'text',
        name: 'Email Header & Body.txt',
        content: 'From: CEO <ceo-office-direct@exec-desk-mail.com>\nTo: finance@company.com\nSubject: URGENT: Client Gift Cards Needed Now\n\nI am currently in a board meeting and cannot take calls. Please purchase 10 x $500 Apple Gift cards immediately and email me the claim codes.',
        timestamp: '2026-09-24T09:00:00Z'
      }
    ],
    entities: [
      { id: 'ENT-501', type: 'email', value: 'ceo-office-direct@exec-desk-mail.com', role: 'Spoofed Executive Email', confidence: 0.94, isSuspicious: true },
      { id: 'ENT-502', type: 'amount', value: '$5,000 ($500 x 10)', role: 'Gift Card Request', confidence: 0.96, isSuspicious: true }
    ],
    why_risky: [
      'Lookalike Domain Email: Domain exec-desk-mail.com does not match internal corporate domain.',
      'Bypassing Internal Controls: Excuses inability to take phone calls due to "board meeting".'
    ],
    timeline: [
      { id: 'TL-51', timestamp: '09:00 AM', stage: 'Initial Contact', description: 'Urgent email sent to finance team', status: 'CONFIRMED' }
    ],
    attack_stages: [
      { stage: 'Initial Contact', status: 'completed', description: 'Executive spoofed email' },
      { stage: 'Social Engineering', status: 'active', description: 'Gift card purchase demand' }
    ],
    connected_entities: [],
    recommended_actions: {
      immediate: ['Verify request via direct phone call or Slack/Teams message to CEO.'],
      accountProtection: ['Flag email header in IT Security portal.'],
      evidencePreservation: ['Export raw .eml file.'],
      reporting: ['Report internally to CISO / Security Operations Center.']
    },
    ml_features: [
      { featureName: 'Display Name Spoofing', weight: 30, detectedValue: 'Mismatch between CEO name & external domain', impact: 'High' }
    ]
  }
];

export const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: 'CMP-01',
    name: 'SBI-PanKYC-Campaign-09',
    fraudType: 'KYC Phishing / Bank Impersonation',
    relatedIncidentsCount: 41,
    domainsCount: 3,
    phonesCount: 5,
    emailsCount: 2,
    upiCount: 4,
    riskLevel: 'Critical',
    status: 'Active',
    description: 'Bulk SMS campaign targeting YONO users with malicious .xyz domains and automated OTP intercept VPAs.',
    entities: ['sbi-kyc-update-portal-882.xyz', '+91 98765 43210', 'paytm-merchant88@paytm']
  },
  {
    id: 'CMP-02',
    name: 'Apex-Crypto-Task-Ring',
    fraudType: 'Investment Scam / Task Scam',
    relatedIncidentsCount: 28,
    domainsCount: 2,
    phonesCount: 8,
    emailsCount: 1,
    upiCount: 3,
    riskLevel: 'Critical',
    status: 'Under Investigation',
    description: 'Telegram investment ring promising 300% daily returns followed by GST tax extortion.',
    entities: ['apex-wealth-trade-app.online', 'fastpay.crypto@icici', '@Crypto_Master_VIP']
  },
  {
    id: 'CMP-03',
    name: 'FedEx-Customs-Extortion-Ring',
    fraudType: 'Delivery / Digital Arrest Extortion',
    relatedIncidentsCount: 19,
    domainsCount: 1,
    phonesCount: 12,
    emailsCount: 0,
    upiCount: 2,
    riskLevel: 'Critical',
    status: 'Active',
    description: 'Automated IVR calls impersonating Mumbai Cyber Police and FedEx customs officials.',
    entities: ['+91 81234 56789', 'Mumbai Cyber Cell Impersonated']
  }
];

export const AUTHORITATIVE_KNOWLEDGE_SOURCES = [
  {
    source: 'CERT-In (Indian Computer Emergency Response Team)',
    title: 'Advisory CIAD-2025-0042: Phishing Campaigns Impersonating Banking Portals',
    url: 'https://www.cert-in.org.in',
    summary: 'Official advisory warning against SMS containing shortened or non-standard TLD links (.xyz, .top, .online) claiming bank account deactivation. Banks never request passwords or OTPs via SMS.'
  },
  {
    source: 'RBI (Reserve Bank of India)',
    title: 'BE AWARE: A Booklet on Modus Operandi of Financial Frauds',
    url: 'https://www.rbi.org.in',
    summary: 'RBI directive emphasizing that banks do not require customers to click external web links to complete KYC updates. All KYC updates must occur through official banking apps or physical branches.'
  },
  {
    source: 'National Cyber Crime Reporting Portal (1930)',
    title: 'Financial Fraud Immediate Reporting & Golden Hour Recovery Framework',
    url: 'https://cybercrime.gov.in',
    summary: 'Standard Operating Procedure for victims of cyber financial fraud: Report within 2-3 hours to helpline 1930 or cybercrime.gov.in to initiate bank account lien freezing before funds leave mule networks.'
  }
];
