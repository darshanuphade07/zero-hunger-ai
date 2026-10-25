"""
Agronomic reference data for Maharashtra, India crops and soil zones.
Based on Mahatma Phule Krishi Vidyapeeth (MPKV), Rahuri and ICAR agricultural guidelines.
NOTE: These parameters serve as illustrative agronomic heuristics.
"""

MAHARASHTRA_LOCATIONS = [
    {"name": "Pune, Maharashtra", "lat": 18.5204, "lon": 73.8567, "soil_type": "Medium Black Soil", "key_crops": ["Sugarcane", "Onion", "Soybean", "Tomato"]},
    {"name": "Nashik, Maharashtra", "lat": 19.9975, "lon": 73.7898, "soil_type": "Red Sandy & Loamy Soil", "key_crops": ["Onion", "Tomato", "Grapes", "Wheat"]},
    {"name": "Nagpur, Maharashtra", "lat": 21.1458, "lon": 79.0882, "soil_type": "Deep Black Cotton Soil", "key_crops": ["Cotton", "Soybean", "Orange", "Chickpea"]},
    {"name": "Chhatrapati Sambhaji Nagar, Maharashtra", "lat": 19.8762, "lon": 75.3433, "soil_type": "Black Loamy Soil", "key_crops": ["Cotton", "Maize", "Soybean", "Sweet Lime"]},
    {"name": "Kolhapur, Maharashtra", "lat": 16.7050, "lon": 74.2433, "soil_type": "Alluvial & Rich Black Soil", "key_crops": ["Sugarcane", "Rice", "Soybean", "Groundnut"]},
    {"name": "Solapur, Maharashtra", "lat": 17.6599, "lon": 75.9064, "soil_type": "Medium to Shallow Black Soil", "key_crops": ["Pomegranate", "Sugarcane", "Jowar", "Onion"]},
    {"name": "Akola, Maharashtra", "lat": 20.7002, "lon": 77.0082, "soil_type": "Deep Heavy Clay (Regur)", "key_crops": ["Cotton", "Soybean", "Pigeon Pea (Tur)", "Chickpea"]},
    {"name": "Satara, Maharashtra", "lat": 17.6805, "lon": 74.0183, "soil_type": "Laterite & Red Clay Loam", "key_crops": ["Strawberry", "Ginger", "Sugarcane", "Turmeric"]}
]

MAHARASHTRA_CROPS = {
    "Soybean": {
        "marathi_name": "सोयाबीन",
        "season": "Kharif",
        "duration_days": 95,
        "kc": {
            "Initial": 0.40,
            "Vegetative": 0.75,
            "Flowering": 1.15,
            "Maturity": 0.50
        },
        "soil_moisture_ideal": {"min": 20.0, "optimum": 28.0, "max": 40.0, "critical_threshold": 18.0},
        "ph_ideal": {"min": 6.0, "optimum": 6.8, "max": 7.5},
        "npk_target_kg_ha": {"N": 30.0, "P": 60.0, "K": 40.0},
        "water_depth_mm_total": 450,
        "common_issues": ["Soybean Rust", "Yellow Mosaic Virus", "Stem Borer", "Pod Borer"]
    },
    "Cotton": {
        "marathi_name": "कापूस",
        "season": "Kharif",
        "duration_days": 160,
        "kc": {
            "Initial": 0.45,
            "Vegetative": 0.80,
            "Flowering": 1.20,
            "Maturity": 0.65
        },
        "soil_moisture_ideal": {"min": 18.0, "optimum": 26.0, "max": 38.0, "critical_threshold": 16.0},
        "ph_ideal": {"min": 6.5, "optimum": 7.2, "max": 8.2},
        "npk_target_kg_ha": {"N": 120.0, "P": 60.0, "K": 60.0},
        "water_depth_mm_total": 700,
        "common_issues": ["Pink Bollworm", "Cotton Leaf Curl Virus", "Bacterial Blight", "Grey Mildew"]
    },
    "Sugarcane": {
        "marathi_name": "ऊस",
        "season": "Annual / Adsali",
        "duration_days": 360,
        "kc": {
            "Initial": 0.40,
            "Vegetative": 0.90,
            "Flowering": 1.25,
            "Maturity": 0.75
        },
        "soil_moisture_ideal": {"min": 25.0, "optimum": 35.0, "max": 45.0, "critical_threshold": 22.0},
        "ph_ideal": {"min": 6.5, "optimum": 7.0, "max": 8.0},
        "npk_target_kg_ha": {"N": 250.0, "P": 115.0, "K": 115.0},
        "water_depth_mm_total": 2000,
        "common_issues": ["Red Rot", "Smut", "Early Shoot Borer", "Woolly Aphid"]
    },
    "Onion": {
        "marathi_name": "कांदा",
        "season": "Rabi / Late Kharif",
        "duration_days": 120,
        "kc": {
            "Initial": 0.50,
            "Vegetative": 0.75,
            "Flowering": 1.05,
            "Maturity": 0.75
        },
        "soil_moisture_ideal": {"min": 22.0, "optimum": 30.0, "max": 38.0, "critical_threshold": 19.0},
        "ph_ideal": {"min": 6.0, "optimum": 6.8, "max": 7.8},
        "npk_target_kg_ha": {"N": 100.0, "P": 50.0, "K": 50.0},
        "water_depth_mm_total": 400,
        "common_issues": ["Purple Blotch", "Downy Mildew", "Thrips", "Basal Rot"]
    },
    "Wheat": {
        "marathi_name": "गहू",
        "season": "Rabi",
        "duration_days": 110,
        "kc": {
            "Initial": 0.35,
            "Vegetative": 0.75,
            "Flowering": 1.15,
            "Maturity": 0.45
        },
        "soil_moisture_ideal": {"min": 18.0, "optimum": 26.0, "max": 35.0, "critical_threshold": 16.0},
        "ph_ideal": {"min": 6.0, "optimum": 7.0, "max": 8.0},
        "npk_target_kg_ha": {"N": 120.0, "P": 60.0, "K": 40.0},
        "water_depth_mm_total": 450,
        "common_issues": ["Brown Rust", "Loose Smut", "Powdery Mildew", "Armyworm"]
    },
    "Tomato": {
        "marathi_name": "टोमॅटो",
        "season": "Kharif / Rabi",
        "duration_days": 130,
        "kc": {
            "Initial": 0.45,
            "Vegetative": 0.85,
            "Flowering": 1.15,
            "Maturity": 0.80
        },
        "soil_moisture_ideal": {"min": 20.0, "optimum": 28.0, "max": 38.0, "critical_threshold": 17.0},
        "ph_ideal": {"min": 6.0, "optimum": 6.5, "max": 7.2},
        "npk_target_kg_ha": {"N": 150.0, "P": 80.0, "K": 100.0},
        "water_depth_mm_total": 600,
        "common_issues": ["Early Blight", "Late Blight", "Tomato Leaf Curl Virus", "Fruit Borer"]
    },
    "Chickpea": {
        "marathi_name": "हरभरा (चना)",
        "season": "Rabi",
        "duration_days": 100,
        "kc": {
            "Initial": 0.40,
            "Vegetative": 0.70,
            "Flowering": 1.00,
            "Maturity": 0.35
        },
        "soil_moisture_ideal": {"min": 15.0, "optimum": 22.0, "max": 32.0, "critical_threshold": 13.0},
        "ph_ideal": {"min": 6.5, "optimum": 7.2, "max": 8.2},
        "npk_target_kg_ha": {"N": 20.0, "P": 40.0, "K": 20.0},
        "water_depth_mm_total": 300,
        "common_issues": ["Fusarium Wilt", "Ascochyta Blight", "Helicoverpa Pod Borer"]
    },
    "Maize": {
        "marathi_name": "मका",
        "season": "Kharif / Rabi",
        "duration_days": 105,
        "kc": {
            "Initial": 0.40,
            "Vegetative": 0.80,
            "Flowering": 1.20,
            "Maturity": 0.55
        },
        "soil_moisture_ideal": {"min": 20.0, "optimum": 28.0, "max": 40.0, "critical_threshold": 17.0},
        "ph_ideal": {"min": 5.8, "optimum": 6.8, "max": 7.8},
        "npk_target_kg_ha": {"N": 120.0, "P": 60.0, "K": 40.0},
        "water_depth_mm_total": 500,
        "common_issues": ["Fall Armyworm", "Turcicum Leaf Blight", "Banded Leaf Sheath Blight"]
    }
}
