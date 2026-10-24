from fastapi import APIRouter
from typing import Dict, Any, List

router = APIRouter(prefix="/api/guidance", tags=["Guidance"])

TARGET_PERSONAS_GUIDANCE = [
    {
        "id": "students",
        "title": "Students & Academic Researchers",
        "icon": "GraduationCap",
        "description": "Protection against fake scholarship announcements, exam result links, and deceptive paid internship offers.",
        "common_threats": [
            "Fake government or private scholarship portals demanding upfront processing fees.",
            "Deceptive emails claiming 'Your university portal account has expired, verify now'.",
            "Phony remote internship postings requesting bank account details or initial deposits.",
            "Malicious pirated textbook or software download links that deliver spyware."
        ],
        "key_rules": [
            "Official scholarships never ask for application processing fees or bank card PINs.",
            "Always access university portals via bookmarked links or your institution's official .edu or .ac.in domain.",
            "Verify any internship offer via the official corporate career page or LinkedIn company profile.",
            "Never download course materials from unverified file-sharing links or suspicious .exe files."
        ],
        "example_scam": "Congratulations! You have been selected for the $5,000 National Merit Scholarship. Click http://bit.ly/claim-award and deposit $50 verification fee."
    },
    {
        "id": "shoppers",
        "title": "Online Shoppers",
        "icon": "ShoppingBag",
        "description": "Defenses against counterfeit storefronts, fake courier delivery SMS messages, and fake invoice payment demands.",
        "common_threats": [
            "Smishing messages claiming 'Your FedEx/DHL/India Post package is held pending address confirmation'.",
            "Social media advertisements offering luxury goods or electronics at 90% discount on newly registered domains.",
            "Fake order cancellation or unauthorized transaction warnings prompting users to click a link to cancel.",
            "Counterfeit payment gateway pages that steal card numbers and CVV codes."
        ],
        "key_rules": [
            "Check tracking numbers inside the verified courier app, never via SMS links.",
            "Beware of newly registered domains (.top, .buzz, .xyz) advertising unbelievable discounts.",
            "Ensure the payment portal shows the padlock icon, uses https://, and is hosted on a recognized payment processor.",
            "Use credit cards or trusted virtual payment wallets with buyer protection instead of direct wire transfers."
        ],
        "example_scam": "USPS: Your parcel #94001000 could not be delivered due to incomplete address. Update now within 12h: http://usps-tracking-portal.xyz/pay"
    },
    {
        "id": "payments",
        "title": "Digital Payment Users",
        "icon": "CreditCard",
        "description": "Safeguards against UPI QR code deception, OTP theft, unauthorized transfer requests, and fake refund calls.",
        "common_threats": [
            "Receiving money fraud: Scammers sending a UPI payment request / QR code saying 'Scan and enter PIN to receive ₹5,000 cashback'.",
            "Social engineering calls posing as bank managers demanding your OTP to 'unfreeze' your account.",
            "Fake lottery or government scheme payout links requesting debit card details and CVV.",
            "Remote access scams requesting users to install apps like AnyDesk, TeamViewer, or QuickSupport to 'assist' with payments."
        ],
        "key_rules": [
            "Entering your UPI PIN or OTP ALWAYS DEDUCTS money from your account. You NEVER need to enter a PIN to receive funds.",
            "Banks and regulatory bodies will NEVER call to ask for your OTP, CVV, or passwords under any circumstance.",
            "Never approve collect requests on UPI apps from unknown senders.",
            "Never install screen-sharing software at the behest of an unknown caller."
        ],
        "example_scam": "Dear customer, your bank account will be blocked today due to pending KYC. Click http://bit.ly/sbi-kyc-verify and enter your OTP to keep active."
    },
    {
        "id": "businesses",
        "title": "Small Businesses & Freelancers",
        "icon": "Briefcase",
        "description": "Mitigation against fraudulent invoices, Business Email Compromise (BEC), vendor spoofing, and fake legal threats.",
        "common_threats": [
            "Fraudulent invoices from spoofed vendor email addresses with 'updated banking details'.",
            "Urgent emails supposedly from the CEO or founder instructing quick wire transfers or gift card purchases.",
            "Fake tax or regulatory audit notices threatening immediate penalty if payment is not made within 24 hours.",
            "Phishing emails targeting corporate Microsoft 365 or Google Workspace login credentials."
        ],
        "key_rules": [
            "Implement a mandatory secondary out-of-band verification (e.g. phone call to verified number) for any bank detail changes.",
            "Scrutinize sender email addresses carefully for subtle typosquatting (e.g., @c0mpany.com vs @company.com).",
            "Enforce Multi-Factor Authentication (MFA/2FA) on all business email and cloud accounts.",
            "Train employees to spot urgency and resist skipping approval protocols."
        ],
        "example_scam": "URGENT INVOICE OVERDUE: Please remit the balance payment to our new escrow bank account immediately to avoid contract cancellation: http://invoice-pay.vip/dl"
    },
    {
        "id": "general",
        "title": "General Internet Users",
        "icon": "Globe",
        "description": "Essential cyber hygiene, password security, phishing prevention, and safe everyday digital navigation.",
        "common_threats": [
            "Password reset emails for services you never requested.",
            "Tech support popups screaming 'Virus detected! Call Microsoft toll-free now'.",
            "Social media direct messages offering cryptocurrency investment schemes or claiming to have compromising web camera footage.",
            "Unsolicited WhatsApp or Telegram messages offering easy money for liking YouTube videos.",
            "Fake brand mirror websites (e.g. Netmirror, clone streaming portals) offering free movies that deploy malvertising, push rogue APKs, and harvest credit cards via fake age-verification forms."
        ],
        "key_rules": [
            "Use a dedicated password manager and create unique, 14+ character passphrases for each online service.",
            "Enable authenticator-app-based Two-Factor Authentication (2FA) wherever supported.",
            "Never trust browser popups claiming your computer is infected; browsers cannot detect system malware.",
            "Treat unexpected urgent messages with healthy skepticism: stop, verify, and question the request.",
            "Never enter payment or login credentials on unofficial streaming mirrors; use only verified authentic entertainment providers."
        ],
        "example_scam": "Apple Support: Your iCloud ID has been locked due to suspicious activity. Verify identity within 2 hours at http://apple-id-recovery-team.com"
    }
]

THREAT_INDICATOR_KNOWLEDGE = [
    {
        "category": "Domain & URL Anatomy",
        "concept": "TLD & Subdomain Spoofing",
        "explanation": "Scammers abuse cheap or free top-level domains (.xyz, .top, .buzz) and stack subdomains (e.g. paypal.com.auth-server.xyz) so the familiar brand appears at the start while the actual destination is controlled by the attacker."
    },
    {
        "category": "Deception Tactics",
        "concept": "Fake Brand Mirrors & Streaming Clones",
        "explanation": "Unauthorized clone portals (such as Netmirror) mimic legitimate entertainment platforms to lure users with free content, then expose them to intrusive malvertising, drive-by malware downloads, and fake payment verification gates."
    },
    {
        "category": "Psychological Manipulation",
        "concept": "Manufactured Urgency",
        "explanation": "Attackers apply tight deadlines ('within 24 hours', 'immediate action required') to trigger emotional panic, prompting victims to bypass critical reasoning and enter credentials hastily."
    },
    {
        "category": "Information Harvesting",
        "concept": "Credential Interception",
        "explanation": "Phishing sites replicate authentic login screens to capture passwords and OTPs in real-time, allowing automated bots or attackers to immediately hijack your account."
    },
    {
        "category": "Deception Tactics",
        "concept": "URL Shorteners & Obfuscation",
        "explanation": "Services like bit.ly or tinyurl compress long URLs into short tokens, preventing users from seeing the destination domain before clicking. CyberShield AI analyzes and flags these shorteners."
    }
]

@router.get("")
def get_guidance():
    return {
        "personas": TARGET_PERSONAS_GUIDANCE,
        "indicators_knowledge": THREAT_INDICATOR_KNOWLEDGE,
        "golden_rules": [
            "Never share an OTP, UPI PIN, or password with anyone, ever.",
            "Never click on links in unsolicited messages regarding deliveries, taxes, or bank blocks.",
            "Always navigate directly to official websites by typing the verified URL.",
            "Report cyber fraud incidents immediately to national reporting authorities (e.g., cybercrime.gov.in or ic3.gov)."
        ]
    }
