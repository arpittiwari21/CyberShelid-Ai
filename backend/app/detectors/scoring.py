from typing import List, Dict, Any, Tuple

def evaluate_risk(
    indicators: List[Dict[str, Any]],
    detected_patterns: List[str],
    input_type: str
) -> Tuple[str, int, str, List[Dict[str, str]]]:
    """
    Computes a calibrated risk score (0-100), risk level (Low, Medium, High),
    executive explanation summary, and contextual safety recommendations.
    """
    score = 5  # Base baseline
    
    high_count = sum(1 for i in indicators if i.get("severity") == "high")
    med_count = sum(1 for i in indicators if i.get("severity") == "medium")
    low_count = sum(1 for i in indicators if i.get("severity") == "low")

    # Add points based on severity weights
    score += high_count * 35
    score += med_count * 20
    score += low_count * 10

    # Compound multipliers for toxic indicator combinations
    patterns_set = set(detected_patterns)
    
    # Combination 1: Urgency + Credential Harvesting
    if "urgency_pressure" in patterns_set and "credential_harvesting" in patterns_set:
        score += 20
    
    # Combination 2: Link/Shortener + Credential Harvesting or Urgency
    if ("url_shortener" in patterns_set or "insecure_http" in patterns_set or "contains_embedded_urls" in patterns_set) and (
        "credential_harvesting" in patterns_set or "urgency_pressure" in patterns_set
    ):
        score += 15

    # Direct IP, brand typosquatting, or fake mirror sites automatically warrant high alert
    if (
        "ip_hostname" in patterns_set or
        "brand_typosquatting" in patterns_set or
        "fake_mirror_website" in patterns_set or
        any("impersonation_" in p for p in patterns_set)
    ):
        score = max(score, 88 if "fake_mirror_website" in patterns_set else 75)

    # Clamp score strictly between 0 and 100
    if not indicators:
        score = 8  # Safe baseline
    score = min(max(score, 0), 100)

    # Categorize Risk Level
    if score >= 65:
        risk_level = "High"
    elif score >= 30:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Executive Summary explanation
    if "fake_mirror_website" in patterns_set:
        summary = (
            "High Risk Unauthorized Mirror / Clone Portal Detected. The submission connects to or references "
            "an illicit mirror network (such as Netmirror) designed to mimic legitimate streaming platforms. "
            "Such sites present extreme risks of aggressive malvertising, rogue APK downloads, and payment credential theft."
        )
    elif risk_level == "High":
        summary = (
            "High Risk Threat Detected. The submission demonstrates active phishing or fraud indicators "
            "designed to harvest sensitive credentials, exploit urgency, or lead to deceptive infrastructure."
        )
    elif risk_level == "Medium":
        summary = (
            "Medium Risk Caution. The submission exhibits suspicious traits such as unverified domain patterns, "
            "shortened links, or promotional urgency. Exercise caution before clicking or interacting."
        )
    else:
        summary = (
            "Low Risk. No prevalent phishing markers, coercive urgency, or credential theft indicators "
            "were detected in this submission. Normal security hygiene is advised."
        )

    # Generate Practical Safety Recommendations
    recommendations = []

    # OTP / PIN / Credential rule
    if any(i.get("category") == "Sensitive Data Request" for i in indicators) or "credential_harvesting" in patterns_set:
        recommendations.append({
            "title": "Do NOT share your OTP, PIN, or CVV",
            "action": "Legitimate banks, government officials, and delivery services NEVER request your One-Time Password, UPI PIN, or ATM PIN. Any such request is a confirmed fraud attempt.",
            "priority": "critical"
        })

    # Link / Shortener safety
    if "url_shortener" in patterns_set or "insecure_http" in patterns_set or "contains_embedded_urls" in patterns_set or input_type == "url":
        recommendations.append({
            "title": "Avoid clicking unfamiliar or shortened links",
            "action": "Do not tap on unverified links received via SMS, WhatsApp, or unsolicited emails. Type the official URL manually into your web browser or use verified mobile applications.",
            "priority": "critical" if risk_level == "High" else "warning"
        })

    # Urgency & Coercion countermeasure
    if "urgency_pressure" in patterns_set or any(i.get("category") == "Urgent Language" for i in indicators):
        recommendations.append({
            "title": "Pause before acting — resist artificial deadlines",
            "action": "Scammers manufacture false urgency (e.g., 'Account blocked in 24 hours') to trigger panic. Real banks allow dispute procedures and do not abruptly lock accounts via plain text messages.",
            "priority": "warning"
        })

    # Impersonation countermeasure
    if "entity_impersonation" in patterns_set or any("impersonation" in p for p in patterns_set):
        recommendations.append({
            "title": "Verify through official contact channels",
            "action": "Contact the organization directly using the customer service telephone number printed on your physical bank card or official billing statement — NOT the phone number provided in the message.",
            "priority": "warning"
        })

    # Fake mirror / unauthorized pirate streaming countermeasure
    if "fake_mirror_website" in patterns_set:
        recommendations.append({
            "title": "Avoid fake mirror websites and pirated streaming clones",
            "action": "Netmirror and illicit streaming clones infringe intellectual property and frequently host deceptive advertising, rogue APK download prompts, and fake age/VIP verification forms designed to steal payment card credentials.",
            "priority": "critical"
        })
        recommendations.append({
            "title": "Use verified, licensed entertainment platforms",
            "action": "Access television series and movies exclusively through authentic providers (e.g., Netflix, Amazon Prime, Disney+, Apple TV) via their verified official domains or authorized app store applications.",
            "priority": "warning"
        })

    # Fake offers / Lottery countermeasure
    if "fraud_offer_bait" in patterns_set:
        recommendations.append({
            "title": "Disregard unsolicited lottery, job, or crypto offers",
            "action": "If an offer sounds too good to be true, it is fraud. Legitimate organizations never require upfront fees, gift card purchases, or registration payments to claim prizes or remote jobs.",
            "priority": "warning"
        })

    # General baseline security recommendation
    recommendations.append({
        "title": "Report and block the sender",
        "action": "Block the sender on your messaging platform and report the scam message or phishing URL to your mobile provider and national cybercrime portal.",
        "priority": "advisory"
    })

    return risk_level, score, summary, recommendations
