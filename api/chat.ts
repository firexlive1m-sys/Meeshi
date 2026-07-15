import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim() !== "" && apiKey !== "undefined") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      } catch (err) {
        console.warn("Failed to initialize GoogleGenAI class:", err);
        return null;
      }
    }
  }
  return aiClient;
}

export default async function handler(req: any, res: any) {
  // Support CORS if needed
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, history } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const msgLower = message.toLowerCase().trim();
  
  // Robust system fallback response generator
  const getFallbackResponse = () => {
    if (msgLower.includes("combo") || msgLower.includes("both") || msgLower.includes("discount") || msgLower.includes("flipkart") || msgLower.includes("meesho + flipkart") || msgLower.includes("bundle") || msgLower.includes("pack") || msgLower.includes("offer") || msgLower.includes("dono")) {
      return "Haanji! Humare paas ek best-selling **Meesho + Flipkart Auto Listing combo pack** offer h:\n\n" +
        "• **Combo Features:** Isme Meesho aur Flipkart dono ke premium Chrome Extension auto-listing tools mil jayeinge standard lifetime update ke sath.\n" +
        "• **Plan Price:** Normal individual pricing ₹199 + ₹199 = ₹398 hoti h, par combo lene par **flat ₹50 discount** milta h. Toh aapko yeh bundle sirf **₹348** me milega.\n" +
        "• **Lifetime Support:** One-time purchase, lifetime update options, NO recurring monthly fees!\n\n" +
        "Aap niche buy now panel se directly humara highly popular Combo order complete select kar sakte hain.";
    }
    
    if (msgLower.includes("payment") || msgLower.includes("gpay") || msgLower.includes("phonepe") || msgLower.includes("paytm") || msgLower.includes("upi") || msgLower.includes("online") || msgLower.includes("fampay") || msgLower.includes("card") || msgLower.includes("pay ") || msgLower.includes("payme")) {
      return "Ji bilkul tension free rahiye! Sabhi automatic online checkout modes active aur fully secure hain:\n\n" +
        "• **Supported Modes:** Google Pay (GPay), PhonePe, Paytm, FamPay, any other UPI IDs, Net Banking, aur sabhi Credit/Debit Cards.\n" +
        "• Security check guaranteed aur complete fast payment integration h.";
    }

    if (msgLower.includes("kaise milega") || msgLower.includes("get the") || msgLower.includes("get tool") || msgLower.includes("download") || msgLower.includes("redirect") || msgLower.includes("milega") || msgLower.includes("purchase") || msgLower.includes("buy")) {
      return "Bahut hi safe aur asaan fast process hai. Buy karne ke baad yeh options automatically triggers ho jayenge:\n\n" +
        "• **2-Second Auto Redirect:** Jaise hi payment successfully clear hogi, purely **2 seconds ke andar system automatic secure download link page par load** kar dega!\n" +
        "• **Instant Guides:** Download page par Chrome Extension installation kit access files ke sath short step-by-step Hindi setup training guide video direct list play ho jayegi.\n" +
        "• **Secondary Backup:** Parallel me billing checkout details me fill kiye gaye Email ID aur primary WhatsApp contact par humare automation tools instant backup link send kar denge.";
    }

    if (msgLower.includes("how it works") || msgLower.includes("kaise kaam") || msgLower.includes("working") || msgLower.includes("work") || msgLower.includes("kaise kam") || msgLower.includes("fill") || msgLower.includes("feature") || msgLower.includes("chalega")) {
      return "Yeh tool asaan step-by-step Chrome Extension automation workflow par kaam karta h:\n\n" +
        "• **1. Extension Based 1-Click Auto Fill:** Yeh koi general database spreadsheets seed filling nahi hai! Jab aap Meesho ya Flipkart dashboard tab par 'Add Single Catalog' select page open karte hain, tab right-side panel me extension fully load ho jata h. 'Auto Fill' select touch par click karte hi yeh required form input attributes, dimensions, colors, packaging width/weight config, sizes check filters dynamically 1-click me select aur automatically autofill kar deta h! Is dauran aap non-blocking background me normal YouTube ya WhatsApp continue chala sakte hain.\n" +
        "• **2. AI integrated SEO Optimizer:** In-built smart AI product parameters read karke dynamic high ranking search tags tags, titles, description text list output ready karta h.\n" +
        "• **3. Shipping Fee optimization:** Legally correct packet volume configurations create karta h jis se standard packaging slabs map hokar shipping cost lowest rates (₹35 to ₹45 slabs) support me fix ho sake!\n" +
        "• **4. Dynamic Block Shield:** AI custom target details index changes apply karta h. Har copies catalog entries ke liye product ID, titles, unique SKU dynamically separate generate karega jisse warnings duplicate issues permanently avoid ho jayein.";
    }

    if (msgLower.includes("refund") || msgLower.includes("guarantee") || msgLower.includes("wapas") || msgLower.includes("replace") || msgLower.includes("policy") || msgLower.includes("safety")) {
      return "Sellers ka complete trust hi humari sabse badi policy h:\n\n" +
        "• **24-Hour refund/replacement promise:** Agar installation setups ya runtime block me koi genuine technical issue setup blocker aata hai to hum dynamic support check provide karte hain. 1-day (24 Hours) money refund or instant replacements guaranteed h!\n" +
        "• *Note:* Simple change of mind post-download par refund non-applicable h kyuki yeh premium digital software product h.";
    }

    if (msgLower.includes("lifetime") || msgLower.includes("monthly") || msgLower.includes("charges") || msgLower.includes("hidden") || msgLower.includes("one time") || msgLower.includes("kitna")) {
      return "Bilkul clear and honest pricing models h, koi monthly ya annual active loop charges nahi hain:\n\n" +
        "• **One-Time Buy:** Single Meesho or Flipkart tool ₹199 me lifetime access update details ke sath, Combo Pack is priced at flat **₹348** for both tools combined.\n" +
        "• Lifetime Updates aur live human installation details complete free features backup updates are included.";
    }

    if (msgLower.includes("support") || msgLower.includes("help") || msgLower.includes("contact") || msgLower.includes("phone") || msgLower.includes("whatsapp") || msgLower.includes("asgar") || msgLower.includes("call") || msgLower.includes("sir") || msgLower.includes("haldia")) {
      return "Aap direct developer and official setup managers se help support connect kar sakte hain:\n\n" +
        "• **Developer Owner:** Founder Sk Ali Asgar sir, from Haldia, West Bengal, PIN Pin Code: 721628.\n" +
        "• **Hotline Phone number:** WhatsApp call/messages directly on **6295429762**.\n" +
        "• **Hours:** Support active daily from Morning 9:00 AM to Night 10:00 PM for Jaipur & Surat sellers assistants setups.";
    }

    return "Namaste! 🙏 Sk Ali Asgar sir's 1-Click Chrome Extension Auto Listing Tool Support me aapka swagat h:\n\n" +
      "• **1-Click Auto Fill System:** Meesho & Flipkart seller portals catalogs page upload screen forms ko purely 1-click automatic auto fill karta h.\n" +
      "• **AI SEO Title/Description Tool:** Scans categories and crafts high-ranking SEO content copies automatically.\n" +
      "• **Shipping Fee Optimization:** Legally custom packing volume configuration setups to map parcel in regional rates (₹35-₹45 slabs).\n" +
      "• **Smart AI Unique Listing System:** Auto change titles, unique IDs, distinctive catalog values, and different SKU combinations to bypass product indexing duplication warning shields!\n" +
      "• **2-Second Auto Redirect:** After purchase, instantly redirects purely inside **2 seconds to direct secure download training screen** with step-by-step Hindi setup tutorials!\n" +
      "• **Unbeatable Pricing Offers:** Single Tool lifetime access at just **₹199**; Super popular Combo (Both tools combined) at just **₹348 Only**! No hidden active charges.\n\n" +
      "Aap niche button plans view kar sakte hain, ya support ke liye directly WhatsApp chat start kijiye!";
  };

  // Attempt Gemini call
  const client = getGeminiClient();
  if (!client) {
    console.info("Gemini client deactivated or secure keys empty. Serving rich fallback guides response instantly...");
    return res.json({ text: getFallbackResponse() });
  }

  try {
    const systemInstruction = `
You are the Official "Meesho & Flipkart Auto Listing Tool" Assistant Bot representing Sk Ali Asgar sir (Owner from Haldia, West Bengal, Pin 721628). You answer questions about the product in simple, polite, high-converting Hinglish or Hindi/English.

Exhaustive details you MUST follow for every customer question (Crucial Guidance):
1. Tool Nature (Extension-Based):
   - Clear Misunderstanding: Yeh koi background spreadsheet database seed compiler nahi hai! normal listing karte hain waise hi jab aap Meesho/Flipkart portal par 'Add Single Catalog' page upload select karte hain, toh Chrome Extension active hokar right pane me active visual panels load karta h. 
   - 1-Click Auto Fill System: 'Auto Fill' ke ek unique click se browser input fields, dimensions, packaging configurations (height/weight/depth), colors, sizes checkbox aur categories, metadata standard details ko auto list rules ke mutabik instantly automatically fill kar deta hai.
   - Non-blocking Background: Jab extension auto-fill feed process lead karti hai, is process ke dauraan check-out users continuous doosre tabs par YouTube videos dekh sakte hain ya WhatsApp messages use kar sakte hain bina listing workflow block kiye.

2. Product Features & Core Value:
   - Feature 1: One-Click Auto Fill System. Standard listing required fields, attributes, dimensions (length, height, width), SKU ID codes, variable checkbox filters automatically filled purely in 1-click.
   - Feature 2: AI SEO Keyword & Title Generator. Deep analytics scans categories, matches search volume keywords to dynamically generate high ranking seo optimized titles, labels & listing markup description texts.
   - Feature 3: AI Shipping Fee Optimization. Combines legally correct volumetric configurations and enhances visuals so listings maps legally in the lowest Regional shipping rates (₹35 to ₹45 slabs).
   - Feature 4: Smart AI Unique Listing. Each catalog duplication block shield prevents warnings by creating automatically fresh distinct copies of titles, descriptions, unique product IDs, and custom SKU codes!

3. Owner / Developer:
   - Sk Ali Asgar sir from Haldia, West Bengal, ZIP Pin Code 721628. Phone/WhatsApp: 6295429762.

4. Pricing plans & Updates (Strictly Lifetime Access):
   - Single target (Meesho Auto Listing Tool) price: ONLY ₹199 (Flat one-time buy, LIFETIME ACCESS!).
   - Single target (Flipkart Auto Listing Tool) price: ONLY ₹199 (Flat one-time buy, LIFETIME ACCESS!).
   - Combo Pack (Highly Popular Meesho + Flipkart listing bundle): standard ₹398, but flat ₹50 discount makes it only ₹348!
   - NO monthly billing, NO renewal charges, NO hidden subscription plans. Once purchased, active forever!

5. Support Line:
   - Active daily from 9:00 AM to 10:00 PM. Includes live human support guides who will guide you hand-to-hand if any setup errors come.
   - Genuine Surat and Jaipur seller assistance system setup guides are active to help.

6. Trusted Payments:
   - Supports PhonePe, Google Pay (GPay), Paytm, FamPay, UPI address portals, Net Banking, Debit cards etc.

7. Bulletproof Delivery redirects:
   - Jaise hi payment successfully complete hota hai, system purely **2 seconds ke andar automatic secure download page par redirect kar dega**.
   - Redirect download page par single click me standard files download karke step-by-step 7-minute Hindi video walkthrough play kar sakte hain. 
   - Side by side, dynamic email copy aur automated official WhatsApp backups instant send ho jate hain checkout credentials par.

8. Guarantee:
   - offer secure 24-Hour refund or automatic item replacements if real technical installer bugs block operations. No refund on simple change of mind after purchase.

Tone: Strictly text-oriented. No voice calls, mics, speaking, voice playback reference since we completely removed speech module. Keep replies beautifully organized in Hinglish bullet points, extremely friendly, motivating, simple, and polite. Always guide them to click buy or tap WhatsApp for further support.
`;

    // Ensure history starts with 'user' and alternates roles properly
    const chatHistory: any[] = [];
    let foundFirstUser = false;
    let lastRole = "";

    if (Array.isArray(history)) {
      for (const h of history) {
        const role = h.role === 'model' ? 'model' : 'user';
        if (role === 'user') {
          foundFirstUser = true;
        }
        if (foundFirstUser) {
          if (role !== lastRole) {
            const textContent = Array.isArray(h.parts) 
              ? (h.parts[0]?.text || "") 
              : (typeof h.parts === 'string' ? h.parts : "");
            
            if (textContent.trim()) {
              chatHistory.push({
                role: role,
                parts: [{ text: textContent }]
              });
              lastRole = role;
            }
          }
        }
      }
    }

    const contents = [...chatHistory];
    if (lastRole !== 'user') {
      contents.push({ role: "user", parts: [{ text: message }] });
    } else {
      if (contents.length > 0) {
        contents[contents.length - 1] = { role: "user", parts: [{ text: message }] };
      } else {
        contents.push({ role: "user", parts: [{ text: message }] });
      }
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return res.json({ text: response.text });
  } catch (error: any) {
    console.warn("Gemini Chat failed. Serving rich fallback guides response instantly...");
    return res.json({ text: getFallbackResponse() });
  }
}
