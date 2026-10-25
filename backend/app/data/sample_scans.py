"""
Sample crop diagnostic presets for Demo Mode and offline fallback.
All guidance is clearly identified as educational / illustrative simulation.
"""

SAMPLE_CROP_SCANS = {
    "soybean_rust": {
        "id": "soybean_rust",
        "crop_name": "Soybean",
        "diagnosis": "Soybean Rust (Phakopsora pachyrhizi)",
        "condition_type": "Fungal Disease",
        "confidence_score": 0.94,
        "symptoms": [
            "Small, water-soaked flecks on lower leaves turning into brownish-red polygonal lesions",
            "Elevated pustules (uredinia) on the underside of leaves",
            "Premature defoliation starting from lower canopy during humid weather"
        ],
        "organic_treatments": [
            "Spray 5% Neem Seed Kernel Extract (NSKE) or Neem oil at 5ml/litre as an early protective barrier",
            "Foliar application of Trichoderma viride bio-fungicide @ 5g/litre of water",
            "Ensure proper crop spacing to improve air circulation and sunlight penetration"
        ],
        "chemical_treatments": [
            "Propiconazole 25% EC @ 1 ml/litre water or Tebuconazole 25.9% EC @ 1.5 ml/litre water",
            "Hexaconazole 5% EC @ 2 ml/litre upon first sighting of pustules",
            "Note: Always follow label instructions and pre-harvest interval (PHI) periods"
        ],
        "prevention_tips": [
            "Avoid overhead sprinkler irrigation during high humidity periods",
            "Rotate crops with non-legume crops (e.g. Maize or Jowar) for at least one season",
            "Use rust-tolerant varieties recommended by MPKV Rahuri (e.g. Phule Agrani, DS-228)"
        ],
        "urgency": "warning"
    },
    "cotton_leaf_curl": {
        "id": "cotton_leaf_curl",
        "crop_name": "Cotton",
        "diagnosis": "Cotton Leaf Curl Virus (CLCuV)",
        "condition_type": "Viral Disease (Whitefly Vector)",
        "confidence_score": 0.89,
        "symptoms": [
            "Upward or downward curling of leaf margins with vein thickening",
            "Enation (small leaf-like outgrowths) on the undersides of primary veins",
            "Stunted plant growth and reduced boll formation"
        ],
        "organic_treatments": [
            "Install yellow sticky traps (15-20 traps/acre) to monitor and catch adult whiteflies",
            "Spray Verticillium lecanii entomopathogenic fungi @ 5g/litre water",
            "Spray 5% Dashparni ark or Neem oil 1500 ppm @ 3ml/litre"
        ],
        "chemical_treatments": [
            "Target vector (Whitefly): Diafenthiuron 50% WP @ 1.25 g/litre or Pyriproxyfen 10% EC @ 2 ml/litre",
            "Spiromesifen 22.9% SC @ 1.5 ml/litre water",
            "Rotate insecticidal modes of action to prevent vector resistance"
        ],
        "prevention_tips": [
            "Destroy weed hosts like Abutilon and Parthenium in and around field borders",
            "Avoid late sowing; plant at recommended spacing",
            "Select tolerant hybrids approved for Maharashtra Vidarbha/Marathwada zones"
        ],
        "urgency": "critical"
    },
    "tomato_early_blight": {
        "id": "tomato_early_blight",
        "crop_name": "Tomato",
        "diagnosis": "Tomato Early Blight (Alternaria solani)",
        "condition_type": "Fungal Disease",
        "confidence_score": 0.92,
        "symptoms": [
            "Dark brown to black necrotic spots with concentric rings ('target board' appearance)",
            "Yellow halo surrounding lesions on older foliage",
            "Stem collar rot and sunken dark leathery spots on fruit calyx"
        ],
        "organic_treatments": [
            "Spray Pseudomonas fluorescens @ 5g/litre water on foliage",
            "Mulch the soil surface around plants to prevent splash dispersal of soil spores",
            "Prune bottom 12 inches of foliage once plant is established"
        ],
        "chemical_treatments": [
            "Mancozeb 75% WP @ 2.5 g/litre as preventive contact spray",
            "Chlorothalonil 75% WP @ 2 g/litre or Azoxystrobin + Difenoconazole @ 1 ml/litre",
            "Apply in early morning when dew has dried"
        ],
        "prevention_tips": [
            "Use drip irrigation rather than overhead sprinklers to keep foliage dry",
            "Follow 3-year crop rotation avoiding Solanaceae family (potato, brinjal, chilli)",
            "Ensure adequate Potassium and Calcium nutrition to strengthen cell walls"
        ],
        "urgency": "warning"
    },
    "sugarcane_red_rot": {
        "id": "sugarcane_red_rot",
        "crop_name": "Sugarcane",
        "diagnosis": "Sugarcane Red Rot (Colletotrichum falcatum)",
        "condition_type": "Fungal Disease",
        "confidence_score": 0.91,
        "symptoms": [
            "Discoloration and yellowing of the third or fourth leaf from top",
            "Longitudinal split reveals reddening of internal pith tissues with distinctive white cross bands",
            "Alcoholic sour odor from infected split canes"
        ],
        "organic_treatments": [
            "Hot water treatment of setts at 52°C for 30 minutes before planting",
            "Sett treatment with Trichoderma harzianum @ 10g/litre slurry before sowing",
            "Immediate uprooting and burning of infected clumps to arrest field spread"
        ],
        "chemical_treatments": [
            "Dip cane setts in Carbendazim 50% WP (1g/litre) or Thiophanate methyl (1.5g/litre) for 15 minutes before planting",
            "Soil drenching around adjacent healthy stools with Copper Oxychloride 50% WP @ 3g/litre"
        ],
        "prevention_tips": [
            "Never use ratoon crop from infected fields",
            "Ensure proper drainage; avoid waterlogging in black clay soils",
            "Plant certified red-rot resistant varieties such as Co 86032 or CoM 0265"
        ],
        "urgency": "critical"
    },
    "healthy_crop": {
        "id": "healthy_crop",
        "crop_name": "Soybean",
        "diagnosis": "Healthy Crop Canopy - No Pathological Symptoms",
        "condition_type": "Healthy",
        "confidence_score": 0.98,
        "symptoms": [
            "Uniform deep green chlorophyll distribution across leaf laminae",
            "No necrotic lesions, rust pustules, or chlorotic mottling observed",
            "Vigorous turgor pressure and intact leaf margins"
        ],
        "organic_treatments": [
            "Maintain current bi-weekly Jeevamrut or vermiwash soil drenches",
            "Routine foliar spraying of panchagavya @ 3% to stimulate beneficial phyllosphere microbes"
        ],
        "chemical_treatments": [
            "No chemical pesticides or fungicides required at this time",
            "Continue scheduled balanced NPK fertigation as per stage targets"
        ],
        "prevention_tips": [
            "Keep monitoring field scouts twice weekly, especially after rain showers",
            "Maintain clean irrigation channels and weed-free bunds"
        ],
        "urgency": "optimal"
    }
}
