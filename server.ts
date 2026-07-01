import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON body parser with generous limit for base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- DATABASE SIMULATION ---
// We use a robust in-memory database seeded with realistic data for a beautiful initial experience.
let reports = [
  {
    id: "rep-1",
    title: "San Francisco Sierra Foothills Wildfire",
    description: "Dry lightning strike initiated a brush fire. Expanding rapidly due to dry vegetation and high wind speed. Residents are advised to prepare for evacuation.",
    type: "wildfire",
    severity: "high",
    location: { lat: 37.7749, lng: -122.4194, address: "Sierra Foothills, East SF Bay Area" },
    status: "reviewing",
    reportedBy: "Citizen Hema",
    reportedAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    imageUrl: "",
    aiAssessment: {
      damageAssessment: "Initial analysis of heat signatures and vegetation density indicates critical spread risk to local residential tracts. Dense timber and brush serve as high-energy fuels.",
      hazardsIdentified: ["Heavy smoke inhalation risk", "Active fire front moving at 15mph", "Embers sparking spot fires"],
      recommendedResponse: "Issue immediate pre-evacuation notices for Zone A. Stage structural protection units at the residential boundary. Setup atmospheric monitoring stations.",
      confidenceScore: 0.92
    }
  },
  {
    id: "rep-2",
    title: "Miami Beach Street Flooding",
    description: "King tide paired with heavy rainstorm has caused severe coastal street flooding. Vehicles are stranded on main avenues. Water level is rising up to 2 feet on lower floors.",
    type: "flood",
    severity: "critical",
    location: { lat: 25.7617, lng: -80.1918, address: "Collins Ave, Miami Beach, FL" },
    status: "dispatched",
    reportedBy: "Responder Dave",
    reportedAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    imageUrl: "",
    aiAssessment: {
      damageAssessment: "Urban coastal inundation with storm drain backup. Structural integrity of retaining sea walls is under stress. Saltwater intrusion may affect local substations.",
      hazardsIdentified: ["Electrocution from submerged transformers", "Debris in deep moving water", "Contaminated runoff"],
      recommendedResponse: "Dispatch shallow-draft rescue vessels. Establish high-water barrier dams. Redirect traffic away from Biscayne Blvd. Activate emergency pumping stations.",
      confidenceScore: 0.95
    }
  },
  {
    id: "rep-3",
    title: "Seattle Foothills Landslide",
    description: "Saturated slope has collapsed across State Route 9. Blocked both directions. No initial reports of injuries, but utility poles are downed.",
    type: "landslide",
    severity: "medium",
    location: { lat: 47.6062, lng: -122.3321, address: "State Route 9, Cascade Foothills, WA" },
    status: "resolved",
    reportedBy: "Admin Hema",
    reportedAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
    imageUrl: "",
    aiAssessment: {
      damageAssessment: "Mass earth movement triggering structural failure of asphalt. Soil is highly saturated clay-silt matrix, requiring geotechnical stabilization before heavy machinery clears debris.",
      hazardsIdentified: ["Secondary slope failure risk", "Downed live electric wires", "Compromised water main"],
      recommendedResponse: "Deploy slope stability sensors. Cut power to downed lines immediately. Set up detours on Route 2. Use geogrid retaining blocks for reconstruction.",
      confidenceScore: 0.88
    }
  }
];

let alerts = [
  {
    id: "alert-1",
    title: "Red Flag Fire Weather Warning",
    message: "Critical fire weather conditions of high temperatures, low relative humidity, and dry wind gusts up to 45 mph. Any spark will lead to rapid wildfire expansion. Outdoor burning is strictly prohibited.",
    type: "danger",
    area: "All Northern California Counties",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    active: true
  },
  {
    id: "alert-2",
    title: "Excessive Heatwave Advisory",
    message: "A high-pressure system will cause temperatures to rise to record-breaking levels. Limit outdoor activities between 10 AM and 6 PM. Check on vulnerable neighbors.",
    type: "warning",
    area: "Phoenix Metropolitan and Maricopa County",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    active: true
  }
];

let allocations = [
  {
    id: "alloc-1",
    reportId: "rep-2",
    responderTeam: "Miami Emergency Rescue Unit 4",
    personnelCount: 8,
    vehiclesAllocated: ["Heavy Rescue Truck", "Zodiac Inflatable Boat"],
    equipmentSent: ["Submersible Water Pumps", "Emergency Floatation Devices", "High-intensity Spotlights"],
    status: "on-scene",
    allocatedAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
  }
];

// List of registered or demo users
let users = [
  { id: "usr-1", name: "Hema Admin", email: "hema2007l22@gmail.com", role: "admin", verified: true },
  { id: "usr-2", name: "Officer Dave", email: "responder@disasterintel.org", role: "responder", verified: true },
  { id: "usr-3", name: "Citizen Maria", email: "citizen@disasterintel.org", role: "citizen", verified: false }
];

// --- LAZY GEMINI API INITIALIZATION ---
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY env variable is not set. Using smart offline simulated intelligence.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// --- API ENDPOINTS ---

// Health & System Configuration
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Auth / Identity APIs
app.post("/api/auth/login", (req, res) => {
  const { email, name, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Find user or register a session user
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      name: name || email.split("@")[0],
      email: email.toLowerCase(),
      role: role || (email.toLowerCase() === "hema2007l22@gmail.com" ? "admin" : "citizen"),
      verified: true
    };
    users.push(user);
  }
  res.json(user);
});

// Disaster Reports APIs
app.get("/api/reports", (req, res) => {
  res.json(reports);
});

app.post("/api/reports", async (req, res) => {
  try {
    const { title, description, type, severity, location, imageUrl, reportedBy } = req.body;
    
    if (!title || !type || !location) {
      return res.status(400).json({ error: "Title, type, and location are required." });
    }

    const reportId = `rep-${Date.now()}`;
    let aiAssessment = null;

    const client = getGeminiClient();
    if (client) {
      try {
        console.log(`Analyzing report ${reportId} with Gemini...`);
        let promptText = `Analyze the following disaster report and extract a JSON assessment detailing damage, visible hazards, and recommended tactical response:
        Title: ${title}
        Type: ${type}
        Description: ${description}
        Location: ${JSON.stringify(location)}
        
        Your response MUST be strict JSON matching this structure:
        {
          "damageAssessment": "description of current impact and structures affected",
          "hazardsIdentified": ["hazard 1", "hazard 2"],
          "recommendedResponse": "immediate advice for responders/citizens",
          "confidenceScore": 0.95
        }`;

        let contents: any = promptText;

        if (imageUrl && imageUrl.startsWith("data:image/")) {
          const match = imageUrl.match(/^data:(image\/\w+);base64,(.+)$/);
          if (match) {
            const mimeType = match[1];
            const base64Data = match[2];
            console.log("Analyzing uploaded disaster image using Gemini Vision model...");
            
            contents = {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Data
                  }
                },
                {
                  text: `Identify the damage and hazard in this image for disaster type: ${type}. Return an assessment JSON structure:
                  {
                    "damageAssessment": "detailed findings of damage visible in the image",
                    "hazardsIdentified": ["hazard 1", "hazard 2"],
                    "recommendedResponse": "exact recommended responder step based on visible structural status",
                    "confidenceScore": 0.95
                  }
                  Provide ONLY valid JSON. No Markdown formatting, no codeblocks.`
                }
              ]
            };
          }
        }

        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                damageAssessment: { type: Type.STRING, description: "Detailed description of the structural or environmental damage." },
                hazardsIdentified: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Specific visible or imminent hazards (e.g. fire front, collapsed walls, flooding, utility lines down)." 
                },
                recommendedResponse: { type: Type.STRING, description: "Actionable recommendations for rescue teams and citizen safety." },
                confidenceScore: { type: Type.NUMBER, description: "A floating confidence score between 0 and 1." }
              },
              required: ["damageAssessment", "hazardsIdentified", "recommendedResponse", "confidenceScore"]
            }
          }
        });

        if (response && response.text) {
          aiAssessment = JSON.parse(response.text.trim());
        }
      } catch (geminiError) {
        console.error("Gemini reporting assessment failed, using local model fallback:", geminiError);
        aiAssessment = generateLocalMockAssessment(type, description);
      }
    } else {
      aiAssessment = generateLocalMockAssessment(type, description);
    }

    const newReport = {
      id: reportId,
      title,
      description,
      type,
      severity: severity || "medium",
      location,
      status: "reported",
      reportedBy: reportedBy || "Citizen",
      reportedAt: new Date().toISOString(),
      imageUrl: imageUrl || "",
      aiAssessment
    };

    reports.unshift(newReport);
    res.status(201).json(newReport);
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: "Failed to create report" });
  }
});

// Update Report Status (for Responders/Admins)
app.put("/api/reports/:id", (req, res) => {
  const { id } = req.params;
  const { status, severity, title, description } = req.body;

  const reportIdx = reports.findIndex(r => r.id === id);
  if (reportIdx === -1) {
    return res.status(404).json({ error: "Report not found" });
  }

  const updatedReport = {
    ...reports[reportIdx],
    status: status || reports[reportIdx].status,
    severity: severity || reports[reportIdx].severity,
    title: title || reports[reportIdx].title,
    description: description || reports[reportIdx].description
  };

  reports[reportIdx] = updatedReport;
  res.json(updatedReport);
});

// Resource Allocation Endpoint
app.get("/api/allocations", (req, res) => {
  res.json(allocations);
});

app.post("/api/reports/:id/allocate", (req, res) => {
  const { id } = req.params;
  const { responderTeam, personnelCount, vehiclesAllocated, equipmentSent } = req.body;

  const report = reports.find(r => r.id === id);
  if (!report) {
    return res.status(404).json({ error: "Disaster report not found." });
  }

  const newAllocation = {
    id: `alloc-${Date.now()}`,
    reportId: id,
    responderTeam: responderTeam || "District Quick Response Division",
    personnelCount: parseInt(personnelCount) || 5,
    vehiclesAllocated: vehiclesAllocated || ["Transport Unit"],
    equipmentSent: equipmentSent || ["First Aid Kit"],
    status: "deploying",
    allocatedAt: new Date().toISOString()
  };

  // Automatically update status to dispatched
  report.status = "dispatched";

  allocations.push(newAllocation);
  res.status(201).json({ allocation: newAllocation, report });
});

app.put("/api/allocations/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allocIdx = allocations.findIndex(a => a.id === id);
  if (allocIdx === -1) {
    return res.status(404).json({ error: "Allocation not found" });
  }

  allocations[allocIdx].status = status;
  
  // If completed, optionally resolve the report
  if (status === "completed") {
    const report = reports.find(r => r.id === allocations[allocIdx].reportId);
    if (report) {
      report.status = "resolved";
    }
  }

  res.json(allocations[allocIdx]);
});

// Alerts APIs
app.get("/api/alerts", (req, res) => {
  res.json(alerts.filter(a => a.active));
});

app.post("/api/alerts", (req, res) => {
  const { title, message, type, area } = req.body;
  if (!title || !message || !type) {
    return res.status(400).json({ error: "Title, message, and type are required." });
  }

  const newAlert = {
    id: `alert-${Date.now()}`,
    title,
    message,
    type,
    area: area || "General Affected Region",
    createdAt: new Date().toISOString(),
    active: true
  };

  alerts.unshift(newAlert);
  res.status(201).json(newAlert);
});

app.delete("/api/alerts/:id", (req, res) => {
  const { id } = req.params;
  const alertIdx = alerts.findIndex(a => a.id === id);
  if (alertIdx !== -1) {
    alerts[alertIdx].active = false;
    return res.json({ success: true, message: "Alert dismissed." });
  }
  res.status(404).json({ error: "Alert not found" });
});

// AI Interactive Chatbot
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const client = getGeminiClient();
  if (client) {
    try {
      console.log(`Generating chat response with Gemini for: "${message.substring(0, 40)}..."`);
      
      // Map history to the Gemini SDK expected format if history exists
      // Let's create a conversational prompt that includes recent history
      let promptText = "You are the AI Disaster Intelligence Platform Expert Chatbot, an authoritative emergency response assistant.\n";
      promptText += "Provide clear, calm, and actionable advice to help people save lives, stay safe, and coordinate rescue.\n";
      promptText += "Respond in beautiful, readable markdown. Bold important warnings and instructions.\n\n";
      
      if (history && history.length > 0) {
        promptText += "Conversation history:\n";
        history.forEach((msg: any) => {
          promptText += `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
        });
      }
      promptText += `User: ${message}\nAssistant:`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
      });

      const reply = response.text || "I apologize, but I could not formulate a response at this moment. Please follow local emergency broadcasts.";
      return res.json({ text: reply });
    } catch (chatError) {
      console.error("Gemini chat failed, using local emergency dispatcher simulation:", chatError);
      return res.json({ text: getLocalMockChatReply(message) });
    }
  } else {
    return res.json({ text: getLocalMockChatReply(message) });
  }
});

// AI Visual Damage Analysis
app.post("/api/analyze-damage", async (req, res) => {
  const { imageUrl, disasterType } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ error: "Base64 image is required" });
  }

  const client = getGeminiClient();
  if (client) {
    try {
      const match = imageUrl.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!match) {
        return res.status(400).json({ error: "Invalid image format. Must be base64 data URL." });
      }

      const mimeType = match[1];
      const base64Data = match[2];

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            },
            {
              text: `Analyze this image for damage regarding a ${disasterType || 'disaster'}. Extract a comprehensive JSON object:
              {
                "structuralIntegrity": "high" | "moderate" | "critical" | "destroyed",
                "floodDepthMeters": number | null,
                "fireIntensity": "none" | "smoke" | "active" | "consuming",
                "immediateThreats": ["threat 1", "threat 2"],
                "estimatedDamageCostUSD": string,
                "suggestedRemediation": "detailed structural advice"
              }
              Return ONLY the raw JSON string. Do not wrap in markdown tags.`
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              structuralIntegrity: { type: Type.STRING, enum: ["high", "moderate", "critical", "destroyed"] },
              floodDepthMeters: { type: Type.NUMBER },
              fireIntensity: { type: Type.STRING, enum: ["none", "smoke", "active", "consuming"] },
              immediateThreats: { type: Type.ARRAY, items: { type: Type.STRING } },
              estimatedDamageCostUSD: { type: Type.STRING },
              suggestedRemediation: { type: Type.STRING }
            },
            required: ["structuralIntegrity", "immediateThreats", "estimatedDamageCostUSD", "suggestedRemediation"]
          }
        }
      });

      if (response && response.text) {
        return res.json(JSON.parse(response.text.trim()));
      } else {
        throw new Error("Empty response from Gemini Vision");
      }
    } catch (err) {
      console.error("Gemini Image analysis error:", err);
      return res.json(generateLocalMockDamageAnalysis(disasterType || "flood"));
    }
  } else {
    return res.json(generateLocalMockDamageAnalysis(disasterType || "flood"));
  }
});

// AI Regional Risk Prediction API
app.post("/api/predict-risk", async (req, res) => {
  const { factors, region, disasterType } = req.body;
  if (!region || !disasterType || !factors) {
    return res.status(400).json({ error: "Region, disasterType, and environmental factors are required." });
  }

  const client = getGeminiClient();
  if (client) {
    try {
      console.log(`Predicting regional risk for ${region} with factors...`);
      const promptText = `Assess the risk of a ${disasterType} in the region ${region} with the following indicators:
      Temperature: ${factors.temperature}°F
      Humidity: ${factors.humidity}%
      Wind Speed: ${factors.windSpeed} mph
      Seismic Activity (0-10 scale): ${factors.seismicActivity}
      Vegetation Dryness (0-100 scale): ${factors.vegetationDryness}
      Historical Incident Count in area: ${factors.historicalIncidentsCount}

      Provide your expert assessment as a clean JSON structure:
      {
        "region": "${region}",
        "riskLevel": "low" | "medium" | "high",
        "disasterType": "${disasterType}",
        "confidenceScore": number,
        "environmentalFactors": ["factor description 1", "factor description 2"],
        "recommendations": ["preparatory advice 1", "preparatory advice 2"]
      }`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              region: { type: Type.STRING },
              riskLevel: { type: Type.STRING, enum: ["low", "medium", "high"] },
              disasterType: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER },
              environmentalFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["region", "riskLevel", "disasterType", "confidenceScore", "environmentalFactors", "recommendations"]
          }
        }
      });

      if (response && response.text) {
        return res.json(JSON.parse(response.text.trim()));
      } else {
        throw new Error("No text output returned from Gemini");
      }
    } catch (error) {
      console.error("Gemini risk prediction failed, utilizing local fallback models:", error);
      return res.json(generateLocalMockRiskPrediction(region, disasterType, factors));
    }
  } else {
    return res.json(generateLocalMockRiskPrediction(region, disasterType, factors));
  }
});

// Automated Disaster Incident Report Generator (PDF / HTML format summary)
app.get("/api/reports/:id/summary", (req, res) => {
  const { id } = req.params;
  const report = reports.find(r => r.id === id);
  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  const relatedAllocations = allocations.filter(a => a.reportId === id);

  // Return a beautifully structured PDF summary in raw HTML for easy browser downloading or printable view.
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Official Disaster Incident Summary - ${report.id}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 40px; background-color: #ffffff; }
        .header { border-bottom: 3px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #dc2626; text-transform: uppercase; letter-spacing: 1px; }
        .report-meta { font-size: 12px; color: #6b7280; text-align: right; margin-top: -30px; }
        h1 { font-size: 28px; font-weight: 700; margin-top: 10px; color: #111827; }
        .section-title { font-size: 16px; font-weight: bold; text-transform: uppercase; color: #374151; background-color: #f3f4f6; padding: 6px 12px; margin-top: 30px; border-left: 4px solid #dc2626; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px; }
        .field { margin-bottom: 15px; }
        .label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #4b5563; }
        .value { font-size: 14px; color: #111827; margin-top: 2px; }
        .severity-badge { display: inline-block; padding: 2px 8px; font-size: 11px; font-weight: bold; text-transform: uppercase; border-radius: 4px; }
        .severity-critical { background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
        .severity-high { background-color: #ffedd5; color: #9a3412; border: 1px solid #fed7aa; }
        .severity-medium { background-color: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
        .severity-low { background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .ai-box { background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 6px; margin-top: 15px; }
        .ai-title { font-weight: bold; color: #1e40af; font-size: 14px; margin-bottom: 8px; display: flex; align-items: center; }
        .hazards-list { margin: 5px 0 0 20px; padding: 0; }
        .hazards-list li { margin-bottom: 4px; font-size: 13.5px; }
        .allocation-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .allocation-table th { background-color: #f9fafb; font-size: 12px; text-align: left; padding: 8px 12px; border-bottom: 2px solid #e5e7eb; color: #4b5563; text-transform: uppercase; }
        .allocation-table td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13.5px; }
        .footer { border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 40px; font-size: 11px; color: #9ca3af; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">AI Disaster Intelligence Platform</div>
        <div class="report-meta">
          <strong>Incident Report ID:</strong> ${report.id}<br/>
          <strong>Generated On:</strong> ${new Date().toLocaleString()}
        </div>
        <h1>${report.title}</h1>
      </div>

      <div class="grid">
        <div>
          <div class="field">
            <div class="label">Disaster Category</div>
            <div class="value" style="text-transform: capitalize;">${report.type}</div>
          </div>
          <div class="field">
            <div class="label">Reported Date/Time</div>
            <div class="value">${new Date(report.reportedAt).toLocaleString()}</div>
          </div>
          <div class="field">
            <div class="label">Reported By</div>
            <div class="value">${report.reportedBy}</div>
          </div>
        </div>
        <div>
          <div class="field">
            <div class="label">Severity Level</div>
            <div class="value">
              <span class="severity-badge severity-${report.severity}">${report.severity}</span>
            </div>
          </div>
          <div class="field">
            <div class="label">Incident Location Coordinates</div>
            <div class="value">Lat: ${report.location.lat}, Lng: ${report.location.lng}</div>
          </div>
          <div class="field">
            <div class="label">Physical Address</div>
            <div class="value">${report.location.address}</div>
          </div>
        </div>
      </div>

      <div class="section-title">Incident Description</div>
      <div class="value" style="margin-top: 8px; font-size: 14px;">${report.description}</div>

      ${report.aiAssessment ? `
        <div class="section-title">AI Cognitive Assessment (Google Gemini Pro)</div>
        <div class="ai-box">
          <div class="ai-title">🤖 Structural damage & hazard evaluation</div>
          <div class="value" style="margin-bottom: 12px; font-style: italic;">"${report.aiAssessment.damageAssessment}"</div>
          
          <div class="label">Active Environmental Hazards:</div>
          <ul class="hazards-list">
            ${report.aiAssessment.hazardsIdentified.map(h => `<li>${h}</li>`).join("")}
          </ul>
          
          <div class="label" style="margin-top: 12px;">Tactical Recommendations:</div>
          <div class="value" style="font-size: 13.5px; color: #1e3a8a;">${report.aiAssessment.recommendedResponse}</div>
          
          <div class="label" style="margin-top: 8px; font-size: 11px; color: #4b5563;">Assessed confidence level: ${(report.aiAssessment.confidenceScore * 100).toFixed(1)}%</div>
        </div>
      ` : ""}

      <div class="section-title">Responder Deployments & Resource Allocations</div>
      ${relatedAllocations.length > 0 ? `
        <table class="allocation-table">
          <thead>
            <tr>
              <th>Deployment Team</th>
              <th>Personnel Count</th>
              <th>Dispatched Vehicles</th>
              <th>Emergency Equipment Sent</th>
              <th>Dispatch Date</th>
            </tr>
          </thead>
          <tbody>
            ${relatedAllocations.map(a => `
              <tr>
                <td><strong>${a.responderTeam}</strong></td>
                <td>${a.personnelCount} members</td>
                <td>${a.vehiclesAllocated.join(", ")}</td>
                <td>${a.equipmentSent.join(", ")}</td>
                <td>${new Date(a.allocatedAt).toLocaleString()}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : `
        <div class="value" style="margin-top: 8px; font-size: 14px; color: #6b7280; font-style: italic;">No responding resource units have been officially allocated to this incident yet.</div>
      `}

      <div class="footer">
        Confidential Emergency Operation Center Summary. This document was generated automatically by the AI Disaster Intelligence Platform. 
        For internal agency review only. Action plans should be cross-verified by authorized human command personnel.
      </div>
    </body>
    </html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.send(htmlTemplate);
});

// --- HELPER FUNCTIONS FOR FALLBACK MOCK INTELLIGENCE ---

function generateLocalMockAssessment(type: string, description: string) {
  const genericAssessments: Record<string, any> = {
    wildfire: {
      damageAssessment: "Satellite thermal imagery simulation indicates rapidly moving wildland fire. Dense forest fuel load coupled with high winds poses immediate risk to nearby buildings.",
      hazardsIdentified: ["Smoke plume blinding nearby roads", "High-heat radiant energy ignition", "Sudden wind-driven fire whirls"],
      recommendedResponse: "Issue immediate evacuations for houses within a 3-mile radius. Dispatch wildland water tankers and establish a secondary containment line.",
      confidenceScore: 0.89
    },
    flood: {
      damageAssessment: "Topographic maps match flash water retention pools. Low-lying buildings have rising water level up to lower utility panels. Sewer backup in progress.",
      hazardsIdentified: ["Contaminated flash waters", "Slick surface mudslides", "Basement entrapment hazard"],
      recommendedResponse: "Mobilize boat patrols to evacuate residents. Cut local electrical grid feed to flooded basement areas. Position sandbags at structural thresholds.",
      confidenceScore: 0.91
    },
    earthquake: {
      damageAssessment: "Local seismic models indicate structural stress on masonry buildings. Plaster damage and partial facade collapse observed on older brick structures.",
      hazardsIdentified: ["Gas pipeline rupture risk", "Subsequent structural collapsing aftershocks", "Glass spray hazards on sidewalks"],
      recommendedResponse: "Order immediate evacuations of compromised buildings. Turn off central municipal gas lines. Setup exterior safe casualty treatment camp.",
      confidenceScore: 0.87
    },
    landslide: {
      damageAssessment: "Geological friction slip detected. A mass landslide has blocked access routes. The slope is highly unstable and could fail further under moisture.",
      hazardsIdentified: ["Secondary slope collapse", "Underground sewer fracture", "Unstable debris weight shifting"],
      recommendedResponse: "Block local highway traffic instantly. Do not send heavy vehicles onto the debris path without stability rigging. Implement acoustic slope listening devices.",
      confidenceScore: 0.85
    },
    cyclone: {
      damageAssessment: "Severe hurricane/wind storm impact. Metal roofs have peeled, lightweight structures destroyed, and local tree branches blocking access routes.",
      hazardsIdentified: ["Airborne projectile debris", "Widespread fallen high-voltage lines", "Severe tidal storm surges"],
      recommendedResponse: "Enforce a mandatory curfew. Alert emergency responders to hold dispatch until local gust speeds drop below safety limits.",
      confidenceScore: 0.90
    },
    heatwave: {
      damageAssessment: "Extreme heat index. Municipal power transformer units are operating at peak thermal limit, raising risk of localized brownouts.",
      hazardsIdentified: ["Severe dehydration & heat exhaustion", "Power system failures", "Water supply stress"],
      recommendedResponse: "Establish continuous operations in municipal air-conditioned cooling centers. Distribute emergency drinking water bottles. Postpone heavy outdoor labor.",
      confidenceScore: 0.94
    },
    other: {
      damageAssessment: "General emergency event reported. Environmental state displays unordinary signatures that require closer human ocular verification.",
      hazardsIdentified: ["Localized threat boundary", "Uncertain compound damage"],
      recommendedResponse: "Dispatch local scout team to investigate and establish communications with the operations center.",
      confidenceScore: 0.82
    }
  };

  return genericAssessments[type] || genericAssessments.other;
}

function generateLocalMockDamageAnalysis(disasterType: string) {
  return {
    structuralIntegrity: "critical",
    floodDepthMeters: disasterType.includes("flood") ? 1.2 : null,
    fireIntensity: disasterType.includes("fire") ? "active" : "none",
    immediateThreats: [
      "Water ingress into ground electrical cabinets",
      "Compromised load-bearing brick wall on the east side",
      "Unstable loose roof panels liable to fly off in high winds"
    ],
    estimatedDamageCostUSD: "$120,000 - $180,000",
    suggestedRemediation: "Install horizontal structural shoring braces on the outer walls immediately. Establish a 50-foot exclusion zone for safety. Pump out sitting water prior to utilities inspection."
  };
}

function generateLocalMockRiskPrediction(region: string, disasterType: string, factors: any) {
  let score = 0.2;
  const conditions: string[] = [];
  const recommendations: string[] = [];

  if (disasterType === "wildfire") {
    if (factors.temperature > 90) { score += 0.3; conditions.push("High heat indexes (>90°F) drying out forest floor."); }
    if (factors.vegetationDryness > 70) { score += 0.3; conditions.push("Vegetation dryness is critical, serving as high fuel energy."); }
    if (factors.windSpeed > 15) { score += 0.2; conditions.push("High wind gusts will accelerate fire front movement."); }
    recommendations.push("Prohibit all outdoor open flames immediately.");
    recommendations.push("Clear dry brush within a 30-foot perimeter of all buildings.");
    recommendations.push("Pre-stage water aircraft tankers at local airbases.");
  } else if (disasterType === "flood") {
    if (factors.humidity > 80) { score += 0.3; conditions.push("Excessive air moisture content suggesting heavy storm development."); }
    if (factors.historicalIncidentsCount > 5) { score += 0.3; conditions.push("High historical flood records indicate vulnerable low-lying geology."); }
    recommendations.push("Activate emergency stormwater pumping circuits.");
    recommendations.push("Distribute high-water barriers and sandbags to Collins Ave residents.");
    recommendations.push("Broadcast flash-flood alerts via regional cellphone carrier nets.");
  } else if (disasterType === "earthquake") {
    if (factors.seismicActivity > 4) { score += 0.6; conditions.push("Active foreshock activity detected in local fault lines."); }
    recommendations.push("Conduct immediate structural integrity audits of historic concrete columns.");
    recommendations.push("Review gas lines shutoff valves with resident managers.");
    recommendations.push("Establish medical staging hubs outside high-density areas.");
  } else {
    score = 0.5;
    conditions.push("Fluctuations in dynamic climate indices are registering warning levels.");
    recommendations.push("Monitor satellite data streams on an hourly cycle.");
    recommendations.push("Issue readiness briefings for rescue units.");
  }

  score = Math.min(score + (factors.historicalIncidentsCount * 0.05), 0.98);
  const riskLevel = score > 0.75 ? "high" : score > 0.4 ? "medium" : "low";

  return {
    region,
    riskLevel,
    disasterType,
    confidenceScore: parseFloat(score.toFixed(2)),
    environmentalFactors: conditions,
    recommendations,
    lastUpdated: new Date().toISOString()
  };
}

function getLocalMockChatReply(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("flood") || msg.includes("water") || msg.includes("rain")) {
    return `### 🚨 Urgent Flash Flood Safety Response

If you are experiencing rising waters, please execute these procedures immediately:

1. **Move to Higher Ground**: Immediately seek elevated locations. If trapped inside a building, move to the top floor or roof. **Do not go into closed attic areas** where you could be trapped.
2. **Avoid Moving Waters**: Do not walk, swim, or drive through flooded areas. **Just 6 inches of moving water** can knock an adult off their feet; **12 inches** can float a standard sedan.
3. **Turn Off Utility Mainlines**: If instructed by local officials, safely shut off your master circuit breaker and natural gas lines to avoid electrical fire triggers.
4. **Emergency Contact**: Call **911** for immediate water rescue, or report an incident on the platform map so response teams can see your coordinates.

*Do you need assistance generating a custom family emergency plan for floods? Please let me know.*`;
  }
  
  if (msg.includes("fire") || msg.includes("smoke") || msg.includes("wildfire")) {
    return `### 🔥 Urgent Wildfire Safety & Evacuation Guidance

A fire threat requires swift, coordinated response actions. Adhere to this checklist:

* **Evacuation Orders**: If a mandatory evacuation order is issued for your zone, **leave immediately**. Do not wait to see if the fire is visible. Smoke can block escape routes in minutes.
* **Property Preparation**:
  * Shut all windows, exterior doors, and fireplace dampers.
  * Turn off propane gas tanks at the source.
  * Move flammable furniture/patio sets into the garage or house.
  * Leave lights on inside the home to make it visible to fire crews through dense smoke.
* **Personal Protection**: Dress in long sleeves, cotton pants, and sturdy leather boots. Put on an N95 respirator mask or damp cloth over your nose and mouth to block hot ember ash.
* **Route safety**: Keep your vehicle lights turned on and windshield wipers operating if smoke is heavy.

*Would you like to analyze a regional wind prediction map or review emergency evacuation points?*`;
  }

  if (msg.includes("earthquake") || msg.includes("seismic") || msg.includes("shake")) {
    return `### 🫨 Earthquake Survival Procedures

During seismic tremors, execute the **Drop, Cover, and Hold On** maneuver:

1. **DROP**: Get down onto your hands and knees. This protects you from falling and keeps you low.
2. **COVER**: Cover your head and neck under a sturdy table, desk, or robust piece of furniture. If no shelter is nearby, cover your face and head with your arms and crouch next to an interior wall.
3. **HOLD ON**: Hold onto your shelter until the shaking fully stops. Be prepared to move with it if it slides.

**What to Avoid**:
* Do NOT run outside during shaking. Most injuries occur from falling debris outside buildings.
* Do NOT use elevators.
* Keep clear of glass windows, mirrors, bookcases, and unstable high furniture.

*Once shaking terminates, inspect gas lines for leaks before striking matches.*`;
  }

  return `### 🤖 AI Emergency Assistance Dispatch

Welcome to the **AI Disaster Intelligence Chatbot**. I am actively connected to local meteorological data streams and the Gemini emergency database.

I can assist you with:
* **Specific Disaster Instructions**: Type "What should I do during a flood/earthquake/wildfire?"
* **Evacuation Preparation**: Ask "How do I assemble an emergency kit?"
* **Platform Support**: Ask "How do I report an incident with a damage photo?"

*Please describe your current situation or the hazard you are preparing for so I can generate precise safety instructions.*`;
}

// --- VITE MIDDLEWARE CONFIGURATION ---
// Integrates the Vite dev server inside our Express container
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite Development Server Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving Production Build files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Disaster Intelligence Platform server running on http://localhost:${PORT}`);
  });
}

startServer();
