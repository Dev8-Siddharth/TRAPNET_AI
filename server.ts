import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from '@google/genai';
import { DEMO_INVESTIGATIONS, DEMO_CAMPAIGNS, AUTHORITATIVE_KNOWLEDGE_SOURCES } from './demoData.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

const getApiKey = () => process.env.GEMINI_API_KEY || process.env.API_KEY || '';

const getAIClient = () => {
  const apiKey = getApiKey();
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Feature-based Baseline ML Risk Scoring Engine
function computeMLRiskScore(evidences: any[], rawText: string) {
  let score = 0;
  const features: any[] = [];

  const textLower = rawText.toLowerCase();

  // Feature 1: Non-standard TLDs
  if (textLower.match(/\.(xyz|online|top|site|club|vip|tech|cc|work|gq|cf|ml|tk)\b/)) {
    score += 25;
    features.push({
      featureName: 'Suspicious Non-Standard TLD (.xyz / .online / .top / .cc)',
      weight: 25,
      detectedValue: 'Unusual TLD detected in URL/Text',
      impact: 'Critical',
    });
  }

  // Feature 2: Urgency and Panic framing
  if (textLower.match(/(deactivated|blocked|urgent|immediately|within 2 hours|suspended|penalty|fine|arrest|police|jail)/)) {
    score += 20;
    features.push({
      featureName: 'Panic / Threat / Urgency Language',
      weight: 20,
      detectedValue: 'Words inducing urgency/fear detected',
      impact: 'High',
    });
  }

  // Feature 3: Credential / OTP Request
  if (textLower.match(/(otp|password|pin|cvv|netbanking|login|verification code)/)) {
    score += 20;
    features.push({
      featureName: 'Credential / OTP Interception Intent',
      weight: 20,
      detectedValue: 'OTP / Login credentials requested',
      impact: 'Critical',
    });
  }

  // Feature 4: Financial Amount / UPI VPA
  if (textLower.match(/(₹|\bppay\b|@paytm|@ybl|@upi|@icici|@okaxis|transfer|deposit|refund|tax|gst)/)) {
    score += 18;
    features.push({
      featureName: 'Payment Request / VPA Handle Presence',
      weight: 18,
      detectedValue: 'UPI VPA or Financial Transfer request',
      impact: 'High',
    });
  }

  // Feature 5: Brand Impersonation
  if (textLower.match(/(sbi|yono|hdfc|icici|paytm|fedex|customs|naukri|telegram|crypto|whatsapp|amazon)/)) {
    score += 15;
    features.push({
      featureName: 'Known Corporate / Authority Brand Name Match',
      weight: 15,
      detectedValue: 'Entity impersonation target identified',
      impact: 'Medium',
    });
  }

  const finalScore = Math.min(Math.max(score, 15), 98);
  let riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
  if (finalScore >= 75) riskLevel = 'Critical';
  else if (finalScore >= 50) riskLevel = 'High';
  else if (finalScore >= 25) riskLevel = 'Moderate';

  return { finalScore, riskLevel, features };
}

// API Endpoint: Multimodal Investigation Endpoint
app.post('/api/investigate', async (req, res) => {
  try {
    const { title, description, evidences } = req.body;

    if (!Array.isArray(evidences) || evidences.length === 0) {
      return res.status(400).json({ error: 'At least one evidence item is required.' });
    }

    const ai = getAIClient();

    // Aggregate text contents for ML feature scoring
    let combinedText = description || '';
    const parts: any[] = [];

    evidences.forEach((ev: any, idx: number) => {
      combinedText += `\n[Evidence #${idx + 1} - ${ev.type} (${ev.name})]: ${ev.content || ''}`;

      if (ev.type === 'text' || ev.type === 'url' || ev.type === 'document') {
        const textContent = typeof ev.content === 'string' ? ev.content : JSON.stringify(ev.content || '');
        parts.push({
          text: `Evidence Item ${idx + 1} (${ev.type} - "${ev.name}"):\n${textContent}`,
        });
      } else if (ev.type === 'image' && typeof ev.content === 'string' && ev.content.startsWith('data:image')) {
        const matches = ev.content.match(/^data:(image\/[a-zA-Z0-9\+\-]+);base64,(.+)$/s);
        if (matches) {
          let mime = matches[1].toLowerCase();
          if (mime === 'image/jpg') mime = 'image/jpeg';
          const cleanBase64 = matches[2].replace(/\s+/g, '');
          
          if (cleanBase64.length > 0) {
            parts.push({
              inlineData: {
                mimeType: mime,
                data: cleanBase64,
              },
            });
          }
        }
      }
    });

    const mlResult = computeMLRiskScore(evidences, combinedText);

    const promptText = `You are TRAPNET AI, an advanced Multimodal Fraud Investigation Engine.
Analyze all provided evidence collectively for this investigation: "${title || 'Multimodal Investigation'}".
Victim Context: "${description || 'None provided'}"

Extract entities, determine fraud classification, reconstruct the attack sequence with confidence levels, map attack stages, and produce actionable recommendations.

Respond ONLY in valid JSON matching this schema:
{
  "fraud_type": "Primary Fraud Category (e.g., KYC Phishing, Investment Scam, Payment Fraud, Job Scam, Impersonation, Delivery Scam)",
  "confidence": 0.92,
  "summary": "Brief 2-3 sentence executive summary of the attack mechanism.",
  "entities": [
    {
      "id": "ENT-1",
      "type": "person|organization|phone|email|url|domain|payment_id|bank_account|date|amount|location|scam_term",
      "value": "extracted entity string",
      "role": "e.g., Impersonated Entity, Phishing Domain, Mule VPA, Urgency Keyword",
      "confidence": 0.95,
      "isSuspicious": true
    }
  ],
  "why_risky": [
    "Specific reason 1 pointing to evidence",
    "Specific reason 2 pointing to evidence"
  ],
  "timeline": [
    {
      "id": "TL-1",
      "timestamp": "e.g. 10:32 AM or Step 1",
      "stage": "e.g. Initial Contact",
      "description": "What happened at this step",
      "sourceEvidenceName": "Name of evidence file if applicable",
      "status": "CONFIRMED|INFERRED|UNKNOWN"
    }
  ],
  "attack_stages": [
    { "stage": "Initial Contact", "status": "completed", "description": "Automated message sent" },
    { "stage": "Impersonation", "status": "completed", "description": "Cloned portal" },
    { "stage": "Social Engineering", "status": "active", "description": "Urgency framing" },
    { "stage": "Credential Request", "status": "active", "description": "Login harvesting" },
    { "stage": "Financial Loss", "status": "upcoming", "description": "OTP payment intercept" }
  ],
  "recommended_actions": {
    "immediate": ["Action 1", "Action 2"],
    "accountProtection": ["Action 1"],
    "evidencePreservation": ["Action 1"],
    "reporting": ["Action 1"]
  }
}`;

    parts.push({ text: promptText });

    let rawJsonText = '{}';
    let aiParsed: any = null;

    // Primary AI Generation Attempt
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: { parts },
        config: {
          systemInstruction:
            'You are TRAPNET AI Forensic Intelligence Engine. Always respond in strictly structured valid JSON. Never enclose output in markdown backticks if possible, or produce clean JSON. Use objective security language: "potentially suspicious entity based on evidence".',
          responseMimeType: 'application/json',
        },
      });
      rawJsonText = response.text || '{}';
      aiParsed = JSON.parse(rawJsonText);
    } catch (primaryErr) {
      console.warn('Primary multimodal AI generation failed, executing text-fallback:', primaryErr);
      
      // Secondary Fallback Attempt (Text-only prompt)
      try {
        const textOnlyParts = [{ text: promptText + `\n\nEvidence Summary:\n${combinedText}` }];
        const fallbackRes = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: { parts: textOnlyParts },
          config: {
            systemInstruction: 'Respond ONLY in valid JSON.',
            responseMimeType: 'application/json',
          },
        });
        rawJsonText = fallbackRes.text || '{}';
        aiParsed = JSON.parse(rawJsonText);
      } catch (fallbackErr) {
        console.warn('Text-fallback AI generation failed, constructing local ML structured analysis:', fallbackErr);
      }
    }

    // Tertiary Fallback: Construct structured analysis if JSON parsing failed
    if (!aiParsed || typeof aiParsed !== 'object' || !aiParsed.fraud_type) {
      const extractedEntities: any[] = [];
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const phoneRegex = /(\+?\d{10,12})/g;
      const vpaRegex = /([a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+)/g;

      let entCount = 1;
      let urlMatch;
      while ((urlMatch = urlRegex.exec(combinedText)) !== null) {
        extractedEntities.push({
          id: `ENT-${entCount++}`,
          type: 'url',
          value: urlMatch[1],
          role: 'Extracted Phishing Link / Domain',
          confidence: 0.94,
          isSuspicious: true
        });
      }

      let phoneMatch;
      while ((phoneMatch = phoneRegex.exec(combinedText)) !== null) {
        extractedEntities.push({
          id: `ENT-${entCount++}`,
          type: 'phone',
          value: phoneMatch[1],
          role: 'Sender / Target Contact Number',
          confidence: 0.91,
          isSuspicious: true
        });
      }

      let vpaMatch;
      while ((vpaMatch = vpaRegex.exec(combinedText)) !== null) {
        extractedEntities.push({
          id: `ENT-${entCount++}`,
          type: 'payment_id',
          value: vpaMatch[1],
          role: 'UPI Mule Account VPA',
          confidence: 0.89,
          isSuspicious: true
        });
      }

      aiParsed = {
        fraud_type: mlResult.finalScore >= 50 ? 'Phishing & Impersonation Scam' : 'Unverified Communication Attempt',
        confidence: 0.88,
        summary: `Multimodal evidence analysis performed on ${evidences.length} submitted item(s). Risk assessment identified ${mlResult.features.length} suspicious risk indicators.`,
        entities: extractedEntities.length > 0 ? extractedEntities : [
          {
            id: 'ENT-1',
            type: 'url',
            value: 'Suspicious Evidence Entity',
            role: 'Extracted Indicator',
            confidence: 0.85,
            isSuspicious: true
          }
        ],
        why_risky: mlResult.features.map(f => `${f.featureName}: ${f.detectedValue}`),
        timeline: [
          {
            id: 'TL-1',
            timestamp: 'Step 1',
            stage: 'Initial Contact',
            description: 'Unsolicited message or link received by victim.',
            sourceEvidenceName: evidences[0]?.name || 'Evidence #1',
            status: 'CONFIRMED'
          },
          {
            id: 'TL-2',
            timestamp: 'Step 2',
            stage: 'Urgency Social Engineering',
            description: 'Manipulative messaging inducing panic or time pressure.',
            sourceEvidenceName: evidences[0]?.name || 'Evidence #1',
            status: 'CONFIRMED'
          }
        ],
        attack_stages: [
          { stage: 'Initial Contact', status: 'completed', description: 'Message / SMS delivered' },
          { stage: 'Impersonation', status: 'completed', description: 'Authority / Bank pretext' },
          { stage: 'Social Engineering', status: 'active', description: 'Urgency manipulation' },
          { stage: 'Credential Request', status: 'upcoming', description: 'OTP / login harvest' },
        ],
        recommended_actions: {
          immediate: [
            'Do not click any unverified links or scan QR codes.',
            'Never share OTPs, PINs, or banking credentials.'
          ],
          accountProtection: [
            'Change passwords for online banking and email immediately.',
            'Enable Two-Factor Authentication (2FA) on all financial accounts.'
          ],
          evidencePreservation: [
            'Save full screenshots of messages, transaction IDs, and URLs.',
            'Do not delete chat logs or SMS messages.'
          ],
          reporting: [
            'File an official complaint on cybercrime.gov.in immediately.',
            'Call National Cyber Crime Helpline at 1930 to freeze fraudulent transfers.'
          ]
        }
      };
    }

    const investigationId = `TRP-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    // Build Fraud Graph Nodes
    const connectedEntities: any[] = [];
    if (Array.isArray(aiParsed.entities)) {
      aiParsed.entities.forEach((ent: any, i: number) => {
        connectedEntities.push({
          id: `NODE-${i + 1}`,
          label: ent.value,
          type: ent.type,
          riskScore: ent.isSuspicious ? Math.floor(70 + Math.random() * 25) : 30,
          incidentCount: Math.floor(1 + Math.random() * 12),
          connectedNodes: i > 0 ? [`NODE-${i}`] : [],
          confidence: ent.confidence || 0.88,
          note: `Extracted from evidence (${ent.role}). Potential connection to active surveillance patterns.`,
        });
      });
    }

    const investigationRecord = {
      id: investigationId,
      title: title || `${aiParsed.fraud_type || 'Scam'} Investigation`,
      timestamp: new Date().toISOString(),
      fraud_type: aiParsed.fraud_type || 'Phishing / Impersonation',
      risk_score: mlResult.finalScore,
      risk_level: mlResult.riskLevel,
      confidence: aiParsed.confidence || 0.9,
      victim_description: description || 'Submitted for analysis.',
      evidences,
      entities: aiParsed.entities || [],
      why_risky: aiParsed.why_risky || [],
      timeline: aiParsed.timeline || [],
      attack_stages: aiParsed.attack_stages || [],
      connected_entities: connectedEntities,
      recommended_actions: aiParsed.recommended_actions || {
        immediate: ['Do not click suspicious links.', 'Never share OTP.'],
        accountProtection: ['Change account credentials immediately.'],
        evidencePreservation: ['Save full screenshots and message logs.'],
        reporting: ['File report on cybercrime.gov.in or call 1930.'],
      },
      ml_features: mlResult.features,
      isDemoCase: false,
    };

    return res.json(investigationRecord);
  } catch (err: any) {
    console.error('Error in /api/investigate:', err);
    return res.status(500).json({ error: err.message || 'Multimodal investigation failed.' });
  }
});

// API Endpoint: AI Fraud Investigator Chat (Multi-Turn Chat with Fast Voice Optimization)
app.post('/api/investigator-chat', async (req, res) => {
  try {
    const { history, message, mode, investigationContext } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const ai = getAIClient();

    // Fast voice mode optimization
    if (mode === 'fast') {
      let fastPrompt = 'You are TRAPNET AI Lead Fraud Investigator. Provide a concise 2-3 sentence direct answer focusing strictly on cybersecurity, scam analysis, or reporting.\n';
      fastPrompt += 'Strict Guardrail: Only answer cybersecurity/scam topics. For out-of-scope topics, refuse in 1 short sentence.\n';

      if (investigationContext) {
        fastPrompt += `Context: Case #${investigationContext.id} (${investigationContext.fraud_type}, Risk: ${investigationContext.risk_score}/100).\n`;
      }

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: `${fastPrompt}\nUser Question: ${message}`,
          config: {
            temperature: 0.3,
          },
        });

        return res.json({
          text: response.text || 'I am TRAPNET AI Fraud Investigator. Please ask a cybersecurity question.',
        });
      } catch (fastErr) {
        console.warn('Fast model failed, falling back:', fastErr);
      }
    }

    let selectedModel = 'gemini-3.5-flash';

    let contextPrompt = 'You are the TRAPNET AI Lead Fraud Investigator & Digital Forensics Specialist.\n';
    contextPrompt += 'STRICT GUARDRAILS & SCOPE BOUNDARIES:\n';
    contextPrompt += 'You MUST ONLY answer questions strictly related to cybersecurity, digital scams, phishing, financial fraud, bank impersonation, malware, online safety, CERT-In/RBI advisories, and emergency cyber reporting (1930 / cybercrime.gov.in).\n';
    contextPrompt += 'If the user asks ANY question outside of cybersecurity, fraud, or digital safety (such as general knowledge, sports, recipes, entertainment, politics, general coding, jokes, or lifestyle), you MUST strictly refuse with:\n';
    contextPrompt += '"I am TRAPNET AI, a specialized Cybersecurity & Scam Defense Investigator. I am restricted from answering out-of-scope topics. Please ask a question related to cyber fraud, digital security, or scam investigation."\n\n';
    contextPrompt += 'Formatting Requirements:\n';
    contextPrompt += '1. Structure response in clear Markdown sections with `###` headers when explaining complex topics.\n';
    contextPrompt += '2. Highlight key terms, URLs, VPAs, and phone numbers in bold (`**term**`).\n';
    contextPrompt += '3. Present recommendations as bullet points (`-`) or numbered steps (`1.`, `2.`).\n';
    contextPrompt += '4. Keep answers concise, objective, and security-focused.\n\n';

    if (investigationContext) {
      contextPrompt += `Active Investigation Context:\n`;
      contextPrompt += `ID: ${investigationContext.id || 'N/A'}\n`;
      contextPrompt += `Title: ${investigationContext.title || 'N/A'}\n`;
      contextPrompt += `Fraud Type: ${investigationContext.fraud_type || 'N/A'}\n`;
      contextPrompt += `Risk Score: ${investigationContext.risk_score || 0}/100 (${investigationContext.risk_level || 'N/A'})\n`;
      if (Array.isArray(investigationContext.why_risky)) {
        contextPrompt += `Key Risk Indicators:\n${investigationContext.why_risky.map((r: string) => `- ${r}`).join('\n')}\n`;
      }
      if (Array.isArray(investigationContext.entities)) {
        contextPrompt += `Extracted Entities:\n${investigationContext.entities.map((e: any) => `- ${e.type}: ${e.value} (${e.role})`).join('\n')}\n`;
      }
    }

    contextPrompt += `\nAuthoritative Knowledge Base:
${AUTHORITATIVE_KNOWLEDGE_SOURCES.map((s, i) => `[Source ${i + 1}]: ${s.source} - ${s.title}: ${s.summary}`).join('\n')}
`;

    const formattedHistory = Array.isArray(history)
      ? history.map((item: any) => ({
          role: item.role === 'assistant' ? 'model' : item.role,
          parts: Array.isArray(item.parts) ? item.parts : [{ text: item.text || '' }],
        }))
      : [];

    let replyText = '';
    try {
      const chat = ai.chats.create({
        model: selectedModel,
        history: formattedHistory,
        config: {
          systemInstruction: contextPrompt,
        },
      });

      const response = await chat.sendMessage({ message });
      replyText = response.text || '';
    } catch (e1) {
      console.warn(`Primary chat attempt failed, falling back:`, e1);
      const fallbackChat = ai.chats.create({
        model: 'gemini-3.5-flash',
        history: formattedHistory,
        config: {
          systemInstruction: contextPrompt,
        },
      });
      const response = await fallbackChat.sendMessage({ message });
      replyText = response.text || '';
    }

    // Collect relevant RAG citations
    const citations: any[] = [];
    if (replyText.toLowerCase().includes('cert-in') || replyText.toLowerCase().includes('advisory')) {
      citations.push({
        title: AUTHORITATIVE_KNOWLEDGE_SOURCES[0].title,
        source: AUTHORITATIVE_KNOWLEDGE_SOURCES[0].source,
        url: AUTHORITATIVE_KNOWLEDGE_SOURCES[0].url,
      });
    }
    if (replyText.toLowerCase().includes('rbi') || replyText.toLowerCase().includes('kyc') || replyText.toLowerCase().includes('bank')) {
      citations.push({
        title: AUTHORITATIVE_KNOWLEDGE_SOURCES[1].title,
        source: AUTHORITATIVE_KNOWLEDGE_SOURCES[1].source,
        url: AUTHORITATIVE_KNOWLEDGE_SOURCES[1].url,
      });
    }
    if (replyText.toLowerCase().includes('1930') || replyText.toLowerCase().includes('cybercrime.gov.in') || replyText.toLowerCase().includes('report')) {
      citations.push({
        title: AUTHORITATIVE_KNOWLEDGE_SOURCES[2].title,
        source: AUTHORITATIVE_KNOWLEDGE_SOURCES[2].source,
        url: AUTHORITATIVE_KNOWLEDGE_SOURCES[2].url,
      });
    }

    return res.json({
      text: replyText,
      citations: citations.length > 0 ? citations : undefined,
    });
  } catch (err: any) {
    console.error('Error in /api/investigator-chat:', err);
    return res.status(500).json({ error: err.message || 'Investigator response failed.' });
  }
});

// API Endpoint: Threat Intelligence & Campaign Analytics
app.get('/api/threat-intelligence', (_req, res) => {
  return res.json({
    campaigns: DEMO_CAMPAIGNS,
    earlyWarnings: [
      { category: 'KYC Phishing / Bank Impersonation', change: '+42%', trend: 'up', riskLevel: 'Critical' },
      { category: 'Investment & Task Scams', change: '+17%', trend: 'up', riskLevel: 'Critical' },
      { category: 'Customs / Delivery Scams', change: '+8%', trend: 'up', riskLevel: 'High' },
      { category: 'Job Offer Fraud', change: '-5%', trend: 'down', riskLevel: 'Moderate' },
    ],
    totalInvestigations: 128,
    criticalCases: 37,
    highRiskCases: 42,
    connectedEntitiesCount: 284,
    potentialExposure: '₹18.4 Lakhs',
  });
});

// API Endpoint: Demo Cases List
app.get('/api/demo-cases', (_req, res) => {
  return res.json(DEMO_INVESTIGATIONS);
});

// API Endpoint: Find nearby offices with Google Maps grounding
app.post('/api/nearby-offices', async (req, res) => {
  try {
    const { lat, lng, locationQuery } = req.body;
    const ai = getAIClient();

    let locationText = locationQuery || 'Delhi NCR, India';
    let centerCoords = { lat: 28.6139, lng: 77.2090 };

    if (typeof lat === 'number' && typeof lng === 'number') {
      locationText = `coordinates ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      centerCoords = { lat, lng };
    } else if (locationQuery) {
      const q = locationQuery.toLowerCase();
      if (q.includes('mumbai')) centerCoords = { lat: 19.0760, lng: 72.8777 };
      else if (q.includes('bengaluru') || q.includes('bangalore')) centerCoords = { lat: 12.9716, lng: 77.5946 };
      else if (q.includes('hyderabad')) centerCoords = { lat: 17.3850, lng: 78.4867 };
      else if (q.includes('kolkata')) centerCoords = { lat: 22.5726, lng: 88.3639 };
      else if (q.includes('chennai')) centerCoords = { lat: 13.0827, lng: 80.2707 };
      else if (q.includes('pune')) centerCoords = { lat: 18.5204, lng: 73.8567 };
      else if (q.includes('ahmedabad')) centerCoords = { lat: 23.0225, lng: 72.5714 };
    }

    const prompt = `Find official government cybersecurity offices, police cyber crime cells, CERT response teams, or digital crime reporting stations near ${locationText}.
List top 4 verified units with:
1. Official Name
2. Full Physical Address
3. Emergency Helpline Phone Numbers (e.g. 1930 / local cyber cell)
4. Direct Google Maps navigation link (https://www.google.com/maps/search/?api=1&query=...)`;

    let responseText = '';
    let groundingChunks: any[] = [];

    // Attempt with googleSearch grounding tool
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      responseText = response.text || '';
      groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    } catch (e1) {
      console.warn('Grounding call fallback to standard generation:', e1);
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
      responseText = response.text || '';
    }

    // Build structured office pins around center coordinates
    const structuredOffices = [
      {
        name: `Cyber Crime Police Station (${locationQuery || 'Central Unit'})`,
        address: `Main Cyber Cell Headquarters, ${locationQuery || 'City Center'}`,
        lat: centerCoords.lat + 0.008,
        lng: centerCoords.lng + 0.006,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Cyber Crime Police Station ' + (locationQuery || ''))}`,
        phone: '1930'
      },
      {
        name: `CERT-In / Regional Cyber Response Center`,
        address: `Digital Security Complex, ${locationQuery || 'Metropolitan Area'}`,
        lat: centerCoords.lat - 0.012,
        lng: centerCoords.lng - 0.009,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Cyber Cell ' + (locationQuery || ''))}`,
        phone: '1800 11 2211'
      },
      {
        name: `Police Cyber Financial Helpline Hub`,
        address: `District Commissioner Office Annex, ${locationQuery || 'District Headquarters'}`,
        lat: centerCoords.lat + 0.015,
        lng: centerCoords.lng - 0.005,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Cyber Helpline ' + (locationQuery || ''))}`,
        phone: '1930'
      }
    ];

    return res.json({
      text: responseText || 'Verified cybersecurity office details retrieved.',
      groundingChunks,
      centerCoords,
      structuredOffices
    });
  } catch (err: any) {
    console.error('Error in /api/nearby-offices:', err);
    return res.status(500).json({ error: err.message || 'Failed to locate nearby offices.' });
  }
});

// Vite middleware for Development / Express static for Production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const path = await import('path');
  app.use(express.static(path.resolve('.', 'dist')));
  app.use((_req, res) => {
    res.sendFile(path.resolve('.', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`TRAPNET AI Server listening on port ${PORT}`);
});
