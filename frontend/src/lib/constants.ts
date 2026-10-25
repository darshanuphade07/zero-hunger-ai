export const MAHARASHTRA_LOCATIONS = [
  { name: "Pune, Maharashtra", lat: 18.5204, lon: 73.8567, soil_type: "Medium Black Soil", crops: ["Sugarcane", "Onion", "Soybean", "Tomato"] },
  { name: "Nashik, Maharashtra", lat: 19.9975, lon: 73.7898, soil_type: "Red Sandy & Loamy Soil", crops: ["Onion", "Tomato", "Wheat"] },
  { name: "Nagpur, Maharashtra", lat: 21.1458, lon: 79.0882, soil_type: "Deep Black Cotton Soil", crops: ["Cotton", "Soybean", "Chickpea"] },
  { name: "Chhatrapati Sambhaji Nagar, Maharashtra", lat: 19.8762, lon: 75.3433, soil_type: "Black Loamy Soil", crops: ["Cotton", "Maize", "Soybean"] },
  { name: "Kolhapur, Maharashtra", lat: 16.7050, lon: 74.2433, soil_type: "Alluvial & Rich Black Soil", crops: ["Sugarcane", "Soybean"] },
  { name: "Solapur, Maharashtra", lat: 17.6599, lon: 75.9064, soil_type: "Medium Black Soil", crops: ["Sugarcane", "Onion"] },
  { name: "Akola, Maharashtra", lat: 20.7002, lon: 77.0082, soil_type: "Deep Heavy Clay (Regur)", crops: ["Cotton", "Soybean", "Chickpea"] },
  { name: "Satara, Maharashtra", lat: 17.6805, lon: 74.0183, soil_type: "Laterite & Red Clay Loam", crops: ["Sugarcane", "Tomato"] },
];

export const CROPS = [
  { name: "Soybean", marathi: "सोयाबीन", defaultStage: "Vegetative" },
  { name: "Cotton", marathi: "कापूस", defaultStage: "Flowering" },
  { name: "Sugarcane", marathi: "ऊस", defaultStage: "Vegetative" },
  { name: "Onion", marathi: "कांदा", defaultStage: "Vegetative" },
  { name: "Wheat", marathi: "गहू", defaultStage: "Flowering" },
  { name: "Tomato", marathi: "टोमॅटो", defaultStage: "Flowering" },
  { name: "Chickpea", marathi: "हरभरा (चना)", defaultStage: "Vegetative" },
  { name: "Maize", marathi: "मका", defaultStage: "Vegetative" },
];

export const GROWTH_STAGES = ["Initial", "Vegetative", "Flowering", "Maturity"];

export const SOIL_TEXTURES = [
  "Black Cotton Soil (Clay Loam)",
  "Medium Deep Black Soil",
  "Red Loamy Soil",
  "Sandy Loam Soil",
  "Alluvial Silt Loam",
];

export const IRRIGATION_METHODS = [
  "Drip Irrigation (Recommended)",
  "Micro-Sprinkler",
  "Furrow / Basin Irrigation",
];
