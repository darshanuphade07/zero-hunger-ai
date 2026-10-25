from typing import Dict, Any, List
from .base_agent import BaseAgent
from ..data.maharashtra_crops import MAHARASHTRA_CROPS

class SoilAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="SoilAgent",
            description="Evaluates NPK stoichiometry, pH reaction, and generates fertilizer & organic amendment recommendations."
        )

    async def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        crop_name = inputs.get("crop_name", "Soybean")
        ph = float(inputs.get("ph", 6.8))
        n = float(inputs.get("nitrogen", 220.0))
        p = float(inputs.get("phosphorus", 18.0))
        k = float(inputs.get("potassium", 190.0))
        moisture = float(inputs.get("moisture", 24.0))
        oc = float(inputs.get("organic_carbon", 0.55))
        is_simulated = bool(inputs.get("is_simulated", False))

        crop_info = MAHARASHTRA_CROPS.get(crop_name, MAHARASHTRA_CROPS["Soybean"])
        target_npk = crop_info.get("npk_target_kg_ha", {"N": 100.0, "P": 50.0, "K": 50.0})

        # 1. pH Evaluation
        ph_eval = self._evaluate_ph(ph)

        # 2. Nutrient Status Evaluation
        nutrients = {
            "Nitrogen (N)": self._evaluate_nitrogen(n, target_npk["N"]),
            "Phosphorus (P)": self._evaluate_phosphorus(p, target_npk["P"]),
            "Potassium (K)": self._evaluate_potassium(k, target_npk["K"]),
            "Organic Carbon (OC)": self._evaluate_organic_carbon(oc)
        }

        # 3. Fertilizer Calculation
        fertilizer_plan, organic_amendments = self._generate_amendments(
            ph, n, p, k, oc, target_npk, ph_eval
        )

        # 4. Composite Soil Fertility Index (0-100)
        fertility_index = self._calculate_fertility_index(ph, n, p, k, oc)

        # Determine Urgency
        deficient_count = sum(1 for item in nutrients.values() if item["status"] in ["Deficient", "Low"])
        if ph < 5.5 or ph > 8.5 or deficient_count >= 3:
            urgency = "critical"
        elif deficient_count >= 1 or ph < 6.0 or ph > 8.0:
            urgency = "warning"
        else:
            urgency = "optimal"

        return {
            "ph_evaluation": ph_eval,
            "nutrients": nutrients,
            "soil_fertility_index": round(fertility_index, 1),
            "fertilizer_plan": fertilizer_plan,
            "organic_amendments": organic_amendments,
            "urgency": urgency,
            "is_simulated_data": is_simulated,
            "disclaimer": (
                "Illustrative agronomic model only. Rules & thresholds are educational heuristics "
                "based on standard ICAR/MPKV guidelines and do not replace certified soil testing laboratory analysis."
            )
        }

    def _evaluate_ph(self, ph: float) -> Dict[str, Any]:
        if ph < 5.5:
            return {
                "value": ph,
                "classification": "Strongly Acidic",
                "risk": "Phosphorus and Molybdenum fixation, potential Aluminum/Manganese toxicity.",
                "amendment": "Apply agricultural lime (calcium carbonate) @ 1.5 - 2.5 tonnes/ha to raise pH."
            }
        elif 5.5 <= ph < 6.5:
            return {
                "value": ph,
                "classification": "Slightly Acidic",
                "risk": "Acceptable for most crops; slight micronutrient imbalance possible.",
                "amendment": "Incorporate well-decomposed FYM or compost; liming only needed if pH drops below 6.0."
            }
        elif 6.5 <= ph <= 7.5:
            return {
                "value": ph,
                "classification": "Neutral / Optimal",
                "risk": "Ideal soil reaction zone for macro and micronutrient bio-availability.",
                "amendment": "Maintain balanced organic matter inputs; no chemical pH amendments needed."
            }
        elif 7.5 < ph <= 8.5:
            return {
                "value": ph,
                "classification": "Moderately Alkaline (Calcareous)",
                "risk": "Calcium dominance can precipitate Phosphorus and cause Zinc/Iron deficiency chlorosis.",
                "amendment": "Apply Agricultural Gypsum @ 500-1000 kg/ha and use acid-forming fertilizers (e.g. Ammonium Sulphate)."
            }
        else:
            return {
                "value": ph,
                "classification": "Strongly Alkaline / Sodic",
                "risk": "High Exchangeable Sodium Percentage (ESP), poor soil structure, reduced aeration.",
                "amendment": "Mandatory deep sub-soiling, apply Gypsum @ 2-3 tonnes/ha followed by leaching with good quality water."
            }

    def _evaluate_nitrogen(self, val: float, target: float) -> Dict[str, Any]:
        if val < 140:
            status = "Deficient"
            rec = f"Severely deficient. Top-dress Urea in split doses to supply {target} kg/ha N."
        elif val < 280:
            status = "Low"
            rec = f"Low available Nitrogen. Apply recommended base dose of Urea/DAP."
        elif val <= 560:
            status = "Optimal"
            rec = "Adequate available Nitrogen for balanced vegetative development."
        else:
            status = "High"
            rec = "High Nitrogen. Reduce urea to avoid excessive succulent foliage and pest susceptibility."

        return {
            "value": val,
            "status": status,
            "ideal_range": "280 - 560 kg/ha",
            "recommendation": rec
        }

    def _evaluate_phosphorus(self, val: float, target: float) -> Dict[str, Any]:
        if val < 10:
            status = "Deficient"
            rec = f"Severely low P. Apply Single Super Phosphate (SSP) @ 250-350 kg/ha near root zone."
        elif val < 25:
            status = "Optimal"
            rec = "Good available Phosphorus. Maintain with standard starter fertilizer."
        else:
            status = "High"
            rec = "High Phosphorus. Skip P fertilizer this season to prevent Zinc antagonism."

        return {
            "value": val,
            "status": status,
            "ideal_range": "10 - 25 kg/ha",
            "recommendation": rec
        }

    def _evaluate_potassium(self, val: float, target: float) -> Dict[str, Any]:
        if val < 110:
            status = "Deficient"
            rec = f"Deficient K. Apply Muriate of Potash (MOP 60% K2O) @ 60-80 kg/ha to improve disease resistance and drought tolerance."
        elif val <= 280:
            status = "Optimal"
            rec = "Optimum Potassium level supporting sturdy stalks and grain/fruit filling."
        else:
            status = "High"
            rec = "High Potassium reserve in soil. Standard basal maintenance suffices."

        return {
            "value": val,
            "status": status,
            "ideal_range": "110 - 280 kg/ha",
            "recommendation": rec
        }

    def _evaluate_organic_carbon(self, val: float) -> Dict[str, Any]:
        if val < 0.50:
            status = "Low"
            rec = "Critical: Low organic matter. Inoculate with bio-fertilizers and apply 5-10 t/ha farmyard manure."
        elif val <= 0.75:
            status = "Medium"
            rec = "Moderate organic carbon. Supplement with green manuring (Sunhemp/Dhaincha)."
        else:
            status = "High"
            rec = "Excellent organic carbon content, promoting robust microbial diversity and water holding capacity."

        return {
            "value": val,
            "status": status,
            "ideal_range": "> 0.75 %",
            "recommendation": rec
        }

    def _generate_amendments(self, ph: float, n: float, p: float, k: float, oc: float, target: Dict[str, float], ph_eval: Dict[str, Any]) -> tuple:
        fert_plan: List[str] = []
        organic_plan: List[str] = []

        # Chemical plan
        if n < 280:
            urea_needed = round((target["N"] / 0.46), 1)
            fert_plan.append(f"Urea (46% N): Apply ~{urea_needed} kg/ha in 2-3 split applications (basal + flowering).")
        if p < 18:
            ssp_needed = round((target["P"] / 0.16), 1)
            fert_plan.append(f"Single Super Phosphate (SSP 16% P2O5): Apply ~{ssp_needed} kg/ha as basal application.")
        if k < 150:
            mop_needed = round((target["K"] / 0.60), 1)
            fert_plan.append(f"Muriate of Potash (MOP 60% K2O): Apply ~{mop_needed} kg/ha during vegetative phase.")

        if ph > 8.0:
            fert_plan.append("Micronutrient Spray: Chelated Zinc (Zn-EDTA 12%) @ 1.5 g/litre + Ferrous Sulphate (FeSO4) @ 2.5 g/litre.")
        if ph_eval["amendment"]:
            fert_plan.append(f"pH Amendment: {ph_eval['amendment']}")

        # Organic plan
        if oc < 0.75:
            organic_plan.append("Farmyard Manure (FYM): Incorporate 5 tonnes/acre of well-rotted FYM before final harrowing.")
            organic_plan.append("Vermicompost: Apply 1 tonne/acre enriched with Trichoderma bio-culture.")
        organic_plan.append("Neem Seed Cake: Apply 200 kg/acre to suppress soil-borne grubs and slow down nitrogen leaching.")
        organic_plan.append("Biofertilizer Consortium: Soil inoculation with Azotobacter / Rhizobium + PSB (Phosphate Solubilizing Bacteria) @ 2 kg/acre.")

        return fert_plan, organic_plan

    def _calculate_fertility_index(self, ph: float, n: float, p: float, k: float, oc: float) -> float:
        # Score 0 to 100 based on deviations from ideal
        ph_score = max(0, 100 - abs(ph - 7.0) * 35)
        n_score = min(100, (n / 350.0) * 100) if n <= 350 else max(60, 100 - (n - 350) * 0.1)
        p_score = min(100, (p / 20.0) * 100) if p <= 20 else 100
        k_score = min(100, (k / 200.0) * 100) if k <= 200 else 100
        oc_score = min(100, (oc / 0.8) * 100)

        weights = [0.20, 0.25, 0.20, 0.20, 0.15]
        scores = [ph_score, n_score, p_score, k_score, oc_score]
        return sum(w * s for w, s in zip(weights, scores))
