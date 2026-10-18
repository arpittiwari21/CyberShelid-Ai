import re
import math
from urllib.parse import urlparse
from typing import List, Dict, Any

# Well-known URL shorteners frequently abused in phishing/smishing
SHORTENER_DOMAINS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd",
    "buff.ly", "rebrand.ly", "cutt.ly", "shorturl.at", "tiny.cc",
    "rb.gy", "bl.ink", "trib.al", "bc.vc", "shorte.st"
}

# High-risk or frequently abused free/cheap top-level domains
SUSPICIOUS_TLDS = {
    "xyz", "top", "buzz", "club", "tk", "ml", "ga", "cf", "gq",
    "work", "icu", "cam", "live", "loan", "vip", "rest", "fit",
    "surf", "click", "link", "stream", "date", "racing", "download",
    "bid", "country", "review", "accountant", "science", "party"
}

# Target brand names often impersonated in phishing attacks
TARGET_BRANDS = [
    "paypal", "amazon", "netflix", "google", "microsoft", "apple",
    "facebook", "instagram", "whatsapp", "chase", "wellsfargo",
    "bankofamerica", "citibank", "sbi", "hdfc", "icici", "axis",
    "paytm", "phonepe", "gpay", "fedex", "dhl", "ups", "usps",
    "incometax", "binance", "coinbase", "meta", "telegram", "dropbox"
]

# Sensitive action keywords commonly seen in malicious URL paths or query params
SUSPICIOUS_PATH_KEYWORDS = [
    "login", "signin", "verify", "verification", "security", "secure",
    "account-update", "banking", "kyc", "otp", "wallet", "claim",
    "reward", "free-gift", "winner", "recover", "authenticate",
    "credential", "billing", "suspended", "unauthorized", "confirm",
    "reactivate", "unlock", "passcode", "identity"
]

def calculate_entropy(text: str) -> float:
    """Calculates the Shannon entropy of a string to detect randomized DGA domains."""
    if not text:
        return 0.0
    prob = [float(text.count(c)) / len(text) for c in dict.fromkeys(list(text))]
    return -sum([p * math.log(p) / math.log(2.0) for p in prob])

def analyze_url(url_string: str) -> Dict[str, Any]:
    """
    Performs comprehensive rule-based and heuristic cybersecurity analysis
    on the provided URL string.
    """
    indicators = []
    detected_patterns = []
    
    clean_url = url_string.strip()
    
    # Check if scheme is present; if not, prepend for parsing
    if not clean_url.startswith(("http://", "https://", "ftp://")):
        parsed = urlparse("https://" + clean_url)
        has_explicit_scheme = False
    else:
        parsed = urlparse(clean_url)
        has_explicit_scheme = True

    hostname = (parsed.hostname or "").lower()
    path = parsed.path.lower()
    query = parsed.query.lower()
    full_url_lower = clean_url.lower()

    # 1. Scheme Check
    if has_explicit_scheme and parsed.scheme == "http":
        indicators.append({
            "name": "Unencrypted HTTP Protocol",
            "severity": "medium",
            "category": "URL & Domain",
            "description": "The URL uses plain HTTP rather than encrypted HTTPS, meaning all data transmitted can be intercepted in transit.",
            "evidence": "http://"
        })
        detected_patterns.append("insecure_http")

    # 2. Raw IP address as Hostname
    ip_regex = r"^(\d{1,3}\.){3}\d{1,3}$"
    if re.match(ip_regex, hostname):
        indicators.append({
            "name": "Direct IP Address Hostname",
            "severity": "high",
            "category": "URL & Domain",
            "description": "The URL points directly to an IP address instead of a recognized registered domain name. Legitimate institutions rarely serve user portals on raw IP addresses.",
            "evidence": hostname
        })
        detected_patterns.append("ip_hostname")

    # 3. @ Symbol in URL (credential/open redirect deception)
    if "@" in clean_url:
        indicators.append({
            "name": "Deceptive Embedded '@' Symbol",
            "severity": "high",
            "category": "Deceptive Tactics",
            "description": "The URL contains an '@' character. Browsers treat anything before the '@' as authentication credentials and actually navigate to the server specified AFTER the '@'.",
            "evidence": "@ in URL structure"
        })
        detected_patterns.append("at_symbol_obfuscation")

    # 4. Known URL Shortener
    if hostname in SHORTENER_DOMAINS:
        indicators.append({
            "name": "Obfuscated URL Shortener",
            "severity": "medium",
            "category": "URL & Domain",
            "description": f"The link uses a URL shortener service ({hostname}) to disguise the actual destination webpage.",
            "evidence": hostname
        })
        detected_patterns.append("url_shortener")

    # 5. Suspicious / Abused TLD
    domain_parts = hostname.split(".")
    if len(domain_parts) >= 2:
        tld = domain_parts[-1]
        if tld in SUSPICIOUS_TLDS:
            indicators.append({
                "name": "High-Risk Top-Level Domain (TLD)",
                "severity": "medium",
                "category": "URL & Domain",
                "description": f"The domain uses the '.{tld}' extension, which is disproportionately associated with spam, disposable phishing sites, and fraudulent campaigns.",
                "evidence": f".{tld}"
            })
            detected_patterns.append(f"suspicious_tld_{tld}")

    # 6. Excessive Subdomains (Domain Spoofing Trick)
    # E.g. paypal.com.account-update.xyz
    if len(domain_parts) > 3:
        indicators.append({
            "name": "Excessive Subdomain Stacking",
            "severity": "medium",
            "category": "URL & Domain",
            "description": f"The domain has {len(domain_parts) - 2} subdomain levels ({hostname}). Fraudsters stack subdomains to trick mobile users into thinking they are on a legitimate website.",
            "evidence": hostname
        })
        detected_patterns.append("excessive_subdomains")

    # 7. Brand Impersonation & Typosquatting in Domain or Path
    for brand in TARGET_BRANDS:
        legit_brand_domains = {
            f"{brand}.com", f"{brand}.co.in", f"{brand}.org", f"{brand}.net",
            f"{brand}.in", f"{brand}.gov.in", f"{brand}.edu"
        }
        is_legit_host = any(hostname == legit_domain or hostname.endswith("." + legit_domain) for legit_domain in legit_brand_domains)

        if not is_legit_host:
            # Check if brand appears in hostname
            if brand in hostname:
                indicators.append({
                    "name": f"Suspected Brand Impersonation ({brand.capitalize()})",
                    "severity": "high",
                    "category": "Impersonation",
                    "description": f"The domain references '{brand.capitalize()}' but does not belong to the authentic organization's domain registry.",
                    "evidence": hostname
                })
                detected_patterns.append(f"impersonation_{brand}")
            # Check if brand appears in path or query on unassociated host / raw IP
            elif brand in path or brand in query:
                indicators.append({
                    "name": f"Brand Spoofing in Path ({brand.capitalize()})",
                    "severity": "high",
                    "category": "Impersonation",
                    "description": f"The URL path references '{brand.capitalize()}' on an unassociated host ({hostname}). This is a common pattern in credential theft landing pages.",
                    "evidence": f"Path: {path}"
                })
                detected_patterns.append(f"impersonation_{brand}")

    # Common typosquatting substitutions (e.g., amaz0n, paypa1, g00gle)
    typo_patterns = [
        (r"paypa[l1i]", "PayPal"),
        (r"amaz[o0]n", "Amazon"),
        (r"netfl[i1x]{2}", "Netflix"),
        (r"g[o0]{2}gle", "Google"),
        (r"micr[o0]s[o0]ft", "Microsoft"),
        (r"app[l1i]e", "Apple"),
        (r"chase-.*\.com", "Chase Bank"),
        (r"sbi-.*\.com", "State Bank of India"),
        (r"hdfc-.*\.com", "HDFC Bank")
    ]
    for pattern, brand_name in typo_patterns:
        if re.search(pattern, hostname) and not any(hostname.endswith(f".{b}.com") or hostname == f"{b}.com" for b in [brand_name.lower()]):
            if not any(i["name"].startswith("Suspected Brand Impersonation") for i in indicators):
                indicators.append({
                    "name": f"Deceptive Brand Lookalike ({brand_name})",
                    "severity": "high",
                    "category": "Impersonation",
                    "description": f"The domain uses lookalike characters or hyphens to simulate {brand_name}.",
                    "evidence": hostname
                })
                detected_patterns.append("brand_typosquatting")

    # 8. Excessive Hyphens in Domain
    if hostname.count("-") >= 3:
        indicators.append({
            "name": "Excessive Hyphens in Domain Name",
            "severity": "medium",
            "category": "URL & Domain",
            "description": f"The domain contains {hostname.count('-')} hyphens, a technique frequently used to create misleading compound names.",
            "evidence": hostname
        })
        detected_patterns.append("hyphen_abuse")

    # 9. Suspicious Keywords in Path or Query
    matched_keywords = [kw for kw in SUSPICIOUS_PATH_KEYWORDS if kw in path or kw in query]
    if len(matched_keywords) >= 2:
        indicators.append({
            "name": "High-Risk Path/Action Keywords",
            "severity": "medium",
            "category": "Deceptive Tactics",
            "description": f"The URL path contains security-sensitive trigger keywords ({', '.join(matched_keywords[:4])}) typically found in credential phishing pages.",
            "evidence": f"Found: {', '.join(matched_keywords[:3])}"
        })
        detected_patterns.append("phishing_path_keywords")
    elif len(matched_keywords) == 1 and (indicators or hostname in SHORTENER_DOMAINS):
        indicators.append({
            "name": "Security-Sensitive Action in URL",
            "severity": "low",
            "category": "Deceptive Tactics",
            "description": f"The URL path references '{matched_keywords[0]}'. Verify you are on the authentic portal before entering credentials.",
            "evidence": matched_keywords[0]
        })
        detected_patterns.append("sensitive_path_keyword")

    # 10. High Entropy in Hostname (Random DGA string)
    first_subdomain = domain_parts[0] if domain_parts else ""
    if len(first_subdomain) > 10:
        entropy = calculate_entropy(first_subdomain)
        if entropy > 3.8:
            indicators.append({
                "name": "High Domain Randomness (DGA-like)",
                "severity": "medium",
                "category": "URL & Domain",
                "description": f"The domain prefix exhibits an unusually high character randomness score ({entropy:.2f}), typical of algorithmically generated disposable domains.",
                "evidence": first_subdomain
            })
            detected_patterns.append("high_entropy_domain")

    # 11. Abnormally Long URL
    if len(clean_url) > 120:
        indicators.append({
            "name": "Abnormally Long URL Structure",
            "severity": "low",
            "category": "URL & Domain",
            "description": f"The URL is {len(clean_url)} characters long. Extreme length is often used to push malicious domains out of view on mobile screens.",
            "evidence": f"Length: {len(clean_url)} chars"
        })
        detected_patterns.append("excessive_url_length")

    return {
        "hostname": hostname,
        "clean_url": clean_url,
        "indicators": indicators,
        "detected_patterns": detected_patterns
    }
