import re
import logging
import httpx
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..config import settings
from ..database import get_db
from ..models import FarmerChatLog
from ..schemas import ChatMessage, ChatResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["Farmer Chatbot"])

OFFLINE_KNOWLEDGE_BASE = [
    {
        "keywords": ["pink bollworm", "bollworm", "cotton", "बोंडअळी", "कापूस"],
        "reply": (
            "**Pink Bollworm (गुलाबी बोंडअळी) Management in Cotton:**\n\n"
            "1. **Pheromone Traps**: Install 5 PBR / Gossyplure pheromone traps per acre for ETL monitoring, or 15-20 traps/acre for mass trapping.\n"
            "2. **Biological Control**: Release *Trichogramma bactrae* egg parasitoids @ 60,000 eggs/acre at 45 and 60 DAS.\n"
            "3. **Organic Spray**: Spray 5% Neem Seed Kernel Extract (NSKE) or Neem Oil 1500 ppm @ 5 ml/litre during square formation.\n"
            "4. **Targeted Chemical Spray (if crossing ETL > 8 moths/trap/day for 3 days)**:\n"
            "   - Profenophos 50% EC @ 2 ml/litre or Emamectin Benzoate 5% SG @ 0.5 g/litre.\n"
            "   - Chlorantraniliprole 18.5% SC @ 0.3 ml/litre for severe infestations.\n\n"
            "*Advice: Destroy rosette flowers and terminate cotton crop before January to prevent pest hibernation.*"
        ),
        "followups": ["What is the ETL for bollworm?", "How to make 5% NSKE?", "When to stop cotton picking?"]
    },
    {
        "keywords": ["rust", "soybean", "तांबेरा", "सोयाबीन"],
        "reply": (
            "**Soybean Rust (सोयाबीन तांबेरा) Advisory:**\n\n"
            "Soybean rust is triggered by prolonged leaf wetness and temperatures between 20°C and 28°C.\n\n"
            "1. **Early Signs**: Small brown-red pustules on the lower surface of bottom leaves.\n"
            "2. **Preventive Action**: Avoid excess nitrogen; spray *Trichoderma viride* @ 5g/litre on soil and lower canopy.\n"
            "3. **Chemical Intervention**:\n"
            "   - Propiconazole 25% EC @ 1 ml/litre or Tebuconazole 25.9% EC @ 1.5 ml/litre of water.\n"
            "   - Ensure thorough spray coverage reaching the bottom leaf surface.\n\n"
            "*Illustrative guide based on MPKV Rahuri recommendations.*"
        ),
        "followups": ["What varieties are rust resistant?", "Can I mix insecticide with fungicide?", "Spraying weather today?"]
    },
    {
        "keywords": ["ph", "alkaline", "acidic", "माती", "सामू", "gypsum", "lime"],
        "reply": (
            "**Soil pH (मातीचा सामू) Correction Guide:**\n\n"
            "- **Ideal Soil pH**: 6.5 to 7.5. In this range, macro and micro nutrients have peak bio-availability.\n"
            "- **Alkaline Soil (pH > 8.0)**: Common in canal command black cotton soils. Calcium binds phosphorus and locks up Iron/Zinc.\n"
            "  - *Remedy*: Apply Agricultural Gypsum @ 1 to 2.5 tonnes/ha based on ESP, followed by good drainage. Use organic pressmud or compost.\n"
            "- **Acidic Soil (pH < 6.0)**: Common in heavy rainfall red soil regions (Konkan/Western Ghats).\n"
            "  - *Remedy*: Apply agricultural lime (Chuna / CaCO3) @ 1.5 to 2 tonnes/ha mixed well during land preparation."
        ),
        "followups": ["How much gypsum per acre?", "Which crops tolerate alkaline soil?", "How to test soil salinity (EC)?"]
    },
    {
        "keywords": ["irrigation", "water", "drip", "पाणी", "सिंचन", "ठिबक"],
        "reply": (
            "**Smart Precision Irrigation Guidelines:**\n\n"
            "1. **Peak Water Demands**:\n"
            "   - Soybean: Flowering & Pod filling stages (Kc = 1.15).\n"
            "   - Cotton: Square formation to Boll maturation (Kc = 1.20).\n"
            "   - Sugarcane: Grand growth phase (May to August) (Kc = 1.25).\n"
            "   - Onion: Bulb enlargement (Kc = 1.05).\n"
            "2. **Drip Scheduling**: Run drip for 1.5 to 2.5 hours every alternate day in loam soils, or daily in lighter sandy soils.\n"
            "3. **Rain Check**: Always suspend irrigation when 24h rainfall probability exceeds 60% or when more than 10mm precipitation is forecasted."
        ),
        "followups": ["How to calculate drip runtime?", "Best irrigation time in summer?", "How to measure soil moisture without sensors?"]
    },
    {
        "keywords": ["jeevamrut", "organic", "सेंद्रिय", "जीवामृत", "compost"],
        "reply": (
            "**Preparation and Use of Jeevamrut (जीवामृत):**\n\n"
            "**Ingredients for 200 Litres (for 1 Acre):**\n"
            "- Fresh desi cow dung: 10 kg\n"
            "- Desi cow urine (Gomutra): 5 to 10 litres\n"
            "- Organic Jaggery (Gul): 2 kg\n"
            "- Pulse flour (Besan / Gram flour): 2 kg\n"
            "- Fertile uncultivated bund soil: 1 handful (contains native soil microbes)\n"
            "- Clean water: 200 litres\n\n"
            "**Method**: Mix clockwise in a shaded drum twice daily. Ferment for 48 to 72 hours. Apply through drip filtration or drenching every 15 days."
        ),
        "followups": ["How to filter Jeevamrut for drip?", "Can I use hybrid cow dung?", "What is Dashparni Ark?"]
    },
    {
        "keywords": ["fertilizer", "npk", "urea", "dap", "खत", "युरिया"],
        "reply": (
            "**Balanced Fertilizer Management Principles (4R Nutrient Stewardship):**\n\n"
            "1. **Right Source**: Combine basal SSP (Single Super Phosphate) with organic compost to supply Calcium and Sulphur alongside Phosphorus.\n"
            "2. **Right Rate**: Never apply excess Urea; high vegetative growth invites sucking pests like aphids, thrips, and jassids.\n"
            "3. **Right Time**: Split Nitrogen into 2-3 applications (Basal, Vegetative 30 DAS, Flowering 55 DAS).\n"
            "4. **Right Place**: Place fertilizer 5 cm away and 5 cm below seed depth; never broadcast urea directly on dry soil."
        ),
        "followups": ["Difference between SSP and DAP?", "What is 19:19:19 foliar spray?", "How to use Zinc sulphate?"]
    }
]

DEFAULT_FALLBACK_REPLY = (
    "Hello! I am **AgriMitra**, your AgriSmart AI precision farming assistant.\n\n"
    "I can advise on:\n"
    "- **Crop Diseases & Pest Control** (Soybean Rust, Cotton Bollworm, Tomato Blight, etc.)\n"
    "- **Smart Irrigation & Drip Scheduling**\n"
    "- **Soil Health, pH Amendments & Fertilizer Doses (NPK)**\n"
    "- **Organic Farming (Jeevamrut, Neem seed extract, Bio-fertilizers)**\n"
    "- **Agro-Meteorological Spraying Windows**\n\n"
    "Feel free to ask a question or tap one of the suggested topics below!"
)

@router.post("", response_model=ChatResponse)
async def chat_with_assistant(
    msg: ChatMessage,
    db: Session = Depends(get_db)
):
    """
    Farmer Chatbot endpoint.
    If GEMINI_API_KEY is present, runs Gemini with agricultural system prompt.
    Otherwise, gracefully responds via the built-in Marathi/English agronomic knowledge base.
    """
    user_text = msg.message.strip().lower()

    # 1. Try Gemini API if key is present
    if settings.GEMINI_API_KEY:
        try:
            gemini_reply = await _query_gemini(msg.message, msg.crop_context, msg.location_context)
            if gemini_reply:
                _save_chat_log(db, msg.message, gemini_reply, "gemini")
                return ChatResponse(
                    reply=gemini_reply,
                    mode="gemini",
                    source_notes="Powered by Google Gemini with agronomic system prompt.",
                    suggested_followups=["How to prevent this?", "Recommended organic alternative?", "What fertilizer should I apply next?"]
                )
        except Exception as exc:
            logger.warning("Gemini chat request failed (%s); using offline fallback", type(exc).__name__)

    # 2. Offline Knowledge Base Matching
    for entry in OFFLINE_KNOWLEDGE_BASE:
        if any(kw in user_text for kw in entry["keywords"]):
            _save_chat_log(db, msg.message, entry["reply"], "offline_demo")
            return ChatResponse(
                reply=entry["reply"],
                mode="offline_demo",
                source_notes="Offline Demo Fallback Mode: Generated from curated ICAR/MPKV agronomic rules. No API key required.",
                suggested_followups=entry["followups"]
            )

    # 3. Default fallback
    _save_chat_log(db, msg.message, DEFAULT_FALLBACK_REPLY, "offline_demo")
    return ChatResponse(
        reply=DEFAULT_FALLBACK_REPLY,
        mode="offline_demo",
        source_notes="Offline Demo Fallback Mode: No external LLM key active. Curated agricultural response.",
        suggested_followups=[
            "How to manage pink bollworm in cotton?",
            "What to do if my soil pH is 8.2?",
            "How to prepare Jeevamrut for 1 acre?",
            "Soybean rust prevention tips"
        ]
    )

async def _query_gemini(prompt: str, crop: str, location: str) -> str:
    system_instruction = (
        f"You are AgriMitra, an empathetic, highly knowledgeable precision agricultural AI extension specialist "
        f"helping farmers in Maharashtra, India. The current farm context is: Crop={crop}, Location={location}. "
        "Provide actionable, scientifically grounded, respectful advice referencing standard ICAR / MPKV Rahuri practices. "
        "Include both organic and approved integrated pest management (IPM) chemical alternatives where applicable. "
        "Keep language clear, concise, and structured with bullet points. Add Marathi terms in parentheses where helpful."
    )

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"{system_instruction}\n\nFarmer's Question: {prompt}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 600
        }
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.post(url, json=payload, headers={"x-goog-api-key": settings.GEMINI_API_KEY})
        if res.status_code != 200:
            logger.warning("Gemini chat returned HTTP %s; using offline fallback", res.status_code)
            return ""
        data = res.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]

def _save_chat_log(db: Session, question: str, answer: str, mode: str):
    try:
        log = FarmerChatLog(user_message=question, bot_response=answer, mode=mode)
        db.add(log)
        db.commit()
    except Exception:
        db.rollback()
