import re
from typing import List, Dict, Any
from .url_detector import analyze_url

# Regex patterns for urgent coercive phrases (English & Hinglish)
URGENCY_PATTERNS = [
    (r"\b(within|in)\s+(\d+|24|48|12|2)\s+(hours?|hrs?|mins?|minutes?)\b", "Artificial Deadline / Time Pressure"),
    (r"\b(account\s+(will\s+be\s+)?(closed|suspended|blocked|terminated|disabled|frozen))\b", "Threat of Account Suspension"),
    (r"\b(immediate(ly)?\s+action\s+required|act\s+now|urgent\s+notice|action\s+required)\b", "Urgent Call to Action"),
    (r"\b(final\s+(notice|warning|reminder)|last\s+chance)\b", "Escalating Pressure / Final Warning"),
    (r"\b(legal\s+action|police\s+complaint|arrest\s+warrant|court\s+notice)\b", "Intimidation / Coercive Legal Threat"),
    (r"\b(electricity|power)\s+(will\s+be\s+)?(disconnected|cut\s+off)\s+tonight\b", "Utility Disconnection Threat"),
    (r"\b(expires?\s+(today|soon|within)|limited\s+time\s+offer)\b", "Artificial Expiration Scarcity"),
    (r"\b(turant|shighra|24\s*ghante|aaj\s*raat|jaldi\s+karein)\b", "Urgent Coercive Pressure (Multilingual/Hinglish)"),
    (r"\b(band\s+ho\s+jayega|block\s+ho\s+jayega|kat\s+di\s+jayegi|rok\s+di\s+jayegi)\b", "Suspension Threat (Multilingual/Hinglish)")
]

# Sensitive credentials that should NEVER be requested via message or email
SENSITIVE_CREDENTIAL_PATTERNS = [
    (r"\b(otp|one[- ]time\s+passwords?)\b", "Request for One-Time Password (OTP)"),
    (r"\b(upi\s*pin|atm\s*pin|debit\s*card\s*pin|mpin)\b", "Request for Secret PIN / UPI PIN"),
    (r"\b(cvv|cvc|card\s+verification\s+value|3[- ]digit\s+code)\b", "Request for Card Security Code (CVV)"),
    (r"\b(passwords?|login\s+credentials?|passcode)\b", "Request for Account Password"),
    (r"\b(card\s+number|expiry\s+date|valid\s+thru)\b", "Request for Payment Card Details"),
    (r"\b(seed\s+phrase|private\s+key|recovery\s+phrase)\b", "Request for Crypto Wallet Key"),
    (r"\b(pan\s*card|aadhaar(\s*card)?|ssn|social\s+security\s+number)\b", "Request for Identity Documents"),
    (r"\b(otp\s+(share|bhejo|batao|dalein|dijiye)|pin\s+(share|batao|enter\s+karo))\b", "Secret OTP/PIN Solicitation (Multilingual/Hinglish)")
]

# Impersonation triggers
IMPERSONATION_PATTERNS = [
    (r"\b(sbi|hdfc(\s*bank)?|icici(\s*bank)?|axis\s*bank|chase(\s*bank)?|wells\s*fargo|bank\s*of\s*america|citibank)\b", "Financial Institution Impersonation"),
    (r"\b(income\s*tax(\s*department)?|irs|customs(\s*department)?|cyber\s*crime\s*cell)\b", "Government / Tax Authority Impersonation"),
    (r"\b(fedex|dhl|ups|india\s*post|usps|courier|parcel|delivery\s+(failed|on\s+hold))\b", "Courier / Delivery Service Impersonation"),
    (r"\b(netflix|amazon\s*prime|apple\s*id|google\s*account|microsoft\s*account)\b", "Digital Subscription / Service Provider Impersonation"),
    (r"\b(paytm|phonepe|gpay|google\s*pay|paypal)\b", "Payment Gateway / Digital Wallet Impersonation")
]

# Scam hooks, lottery, job offers, investment frauds
FRAUD_OFFER_PATTERNS = [
    (r"\b(won|winner|lottery|lucky\s*draw|prize\s*of|\$?\d+[\d,]*\s*(usd|inr|dollars?|rupees?|crores?|lakhs?))\b", "Unsolicited Prize / Lottery Bait"),
    (r"\b(work\s+from\s+home|earn\s+\d+[\d,]*\s+(daily|per\s+day)|part[- ]time\s+job\s+without\s+investment)\b", "Deceptive Job / Easy Money Scheme"),
    (r"\b(guaranteed\s+(returns?|profit)|double\s+your\s+money|crypto\s+investment\s+scheme)\b", "High-Yield Investment Fraud Bait"),
    (r"\b(claim\s+(your\s+)?(cashback|reward|free\s+recharge|gift\s+card|iphone))\b", "Cashback / Free Gift Bait"),
    (r"\b(pre[- ]approved\s+loan|loan\s+approved\s+without\s+cibil|instant\s+personal\s+loan)\b", "Predatory / Fake Loan Offer"),
    (r"\b(inaam|lottery\s+lagi|ghar\s+baithe\s+kamayein|bina\s+investment)\b", "Fraudulent Lottery / Income Bait (Multilingual/Hinglish)")
]

# Fake mirror, pirate streaming, and unauthorized content download lures
FAKE_MIRROR_PATTERNS = [
    (r"\b(net\s*mirror|netmirror(\.(app|pe|to|io|cc|com|xyz|me|org|fun))?)\b", "Netmirror / Unauthorized Brand Mirror Network"),
    (r"\b(mirror\s+(website|site|portal|link)|pirated?\s+(movies?|content|shows?|series))\b", "Illicit Mirror / Pirated Media Platform"),
    (r"\b(free\s+(netflix|hotstar|prime|disney|ott)\s*(movies?|shows?|series|subscription|account|login)?)\b", "Fake Free Streaming / Subscription Lure"),
    (r"\b(watch\s+free\s+(latest\s+)?(movies?|series|shows?)|download\s+free\s+(movie|apk|series))\b", "Unverified Media / Rogue APK Download"),
    (r"\b(bina\s+subscription\s+(dekh|movie|netflix)|free\s+me\s+movie\s+dekh)\b", "Pirate Streaming Bait (Multilingual/Hinglish)")
]

def extract_urls(text: str) -> List[str]:
    """Extracts all HTTP/HTTPS links and bare domains from plain text."""
    url_pattern = r"(https?://[^\s<>\"]+|www\.[^\s<>\"]+|[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-z]{2,}(?:/[^\s<>\"]*)?)"
    matches = re.findall(url_pattern, text)
    # Filter out common abbreviations or sentence endings mistakenly captured
    clean_matches = []
    for m in matches:
        m = m.rstrip(".,;!?)")
        if "." in m and not m.endswith("."):
            clean_matches.append(m)
    return clean_matches

def analyze_message(message_text: str) -> Dict[str, Any]:
    """
    Performs multi-layer rule-based analysis on suspicious SMS, email, or chat text,
    including natural language coercion indicators and embedded link inspections.
    """
    indicators = []
    detected_patterns = []
    clean_text = message_text.strip()
    text_lower = clean_text.lower()

    # 1. Check for Urgency & Coercive Pressure
    for pattern, rule_title in URGENCY_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            matched_phrase = match.group(0)
            indicators.append({
                "name": rule_title,
                "severity": "high" if "suspended" in rule_title.lower() or "threat" in rule_title.lower() or "deadline" in rule_title.lower() else "medium",
                "category": "Urgent Language",
                "description": f"The message employs artificial urgency ('{matched_phrase}') to prompt hasty action before the recipient can verify authenticity.",
                "evidence": matched_phrase
            })
            detected_patterns.append("urgency_pressure")
            break  # Record highest representative urgency

    # 2. Check for Sensitive Information Harvesting (OTP, PIN, Password)
    for pattern, rule_title in SENSITIVE_CREDENTIAL_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            matched_phrase = match.group(0)
            indicators.append({
                "name": rule_title,
                "severity": "high",
                "category": "Sensitive Data Request",
                "description": f"The message directly solicits confidential security data ('{matched_phrase}'). Legitimate banks and service providers NEVER ask for passwords, OTPs, or PINs.",
                "evidence": matched_phrase
            })
            detected_patterns.append("credential_harvesting")

    # 3. Check for Impersonation of Authorities or Institutions
    for pattern, rule_title in IMPERSONATION_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            matched_phrase = match.group(0)
            # Only flag if combined with an action or link, or explicit claim
            indicators.append({
                "name": rule_title,
                "severity": "medium",
                "category": "Impersonation",
                "description": f"The message references a reputable institution ('{matched_phrase}'). Attackers frequently impersonate trusted brands to establish false credibility.",
                "evidence": matched_phrase
            })
            detected_patterns.append("entity_impersonation")
            break

    # 4. Check for Fraudulent Financial Hooks / Fake Offers
    for pattern, rule_title in FRAUD_OFFER_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            matched_phrase = match.group(0)
            indicators.append({
                "name": rule_title,
                "severity": "high" if "lottery" in rule_title.lower() or "investment" in rule_title.lower() else "medium",
                "category": "Deceptive Tactics",
                "description": f"The message contains enticing financial lures ('{matched_phrase}'). Unsolicited prizes, jobs, or loans with guaranteed returns are classic advance-fee fraud indicators.",
                "evidence": matched_phrase
            })
            detected_patterns.append("fraud_offer_bait")
            break

    # 5. Extract and Analyze Embedded URLs
    embedded_urls = extract_urls(clean_text)
    if embedded_urls:
        detected_patterns.append("contains_embedded_urls")
        for u in embedded_urls[:2]:  # inspect top 2 embedded URLs
            url_res = analyze_url(u)
            for u_ind in url_res["indicators"]:
                # Tag evidence to show it came from the embedded link
                u_ind_copy = dict(u_ind)
                u_ind_copy["evidence"] = f"In embedded link '{u}': {u_ind_copy.get('evidence', '')}"
                indicators.append(u_ind_copy)
            detected_patterns.extend(url_res["detected_patterns"])
    elif any(kw in text_lower for kw in ["click here", "tap here", "visit link", "open this link"]):
        indicators.append({
            "name": "Deceptive Link Prompt",
            "severity": "medium",
            "category": "Deceptive Tactics",
            "description": "The message instructs the recipient to click an unspecified link or take action without transparent destination details.",
            "evidence": "Call to click unverified link"
        })
        detected_patterns.append("blind_link_call_to_action")

    # 6. KYC / Account Verification Phishing
    if "kyc" in text_lower and any(kw in text_lower for kw in ["update", "pending", "expire", "complete", "mandate"]):
        indicators.append({
            "name": "KYC Expiration Scam Narrative",
            "severity": "high",
            "category": "Deceptive Tactics",
            "description": "The message claims urgent 'KYC update' is required to prevent account blockage. This is one of the most common banking fraud vectors.",
            "evidence": "KYC update / expiration claim"
        })
        detected_patterns.append("kyc_fraud_narrative")

    # 7. Fake Mirror / Unauthorized Pirate Streaming Detection
    for pattern, rule_title in FAKE_MIRROR_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            matched_phrase = match.group(0)
            indicators.append({
                "name": rule_title,
                "severity": "high",
                "category": "Deceptive Tactics",
                "description": f"The submission references an unauthorized fake mirror / pirated streaming site ('{matched_phrase}'). Attackers and piracy rings utilize fake OTT mirrors to distribute adware, collect payment details under the guise of free trials or age verification, or deliver rogue APKs.",
                "evidence": matched_phrase
            })
            detected_patterns.append("fake_mirror_website")
            break

    return {
        "text": clean_text,
        "indicators": indicators,
        "detected_patterns": list(set(detected_patterns)),
        "embedded_urls": embedded_urls
    }
