import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.detectors.url_detector import analyze_url
from app.detectors.message_detector import analyze_message
from app.detectors.scoring import evaluate_risk

client = TestClient(app)

def test_url_detector():
    print("Testing URL detector...")
    # Test 1: Malicious IP URL with sensitive keyword
    res = analyze_url("http://192.168.1.100/paypal-login/verify.php")
    assert any(i["name"] == "Direct IP Address Hostname" for i in res["indicators"]), "Failed IP check"
    assert any("Impersonation" in i["name"] or "Brand" in i["name"] for i in res["indicators"]), "Failed brand check"
    
    risk_level, score, summary, recs = evaluate_risk(res["indicators"], res["detected_patterns"], "url")
    assert risk_level == "High", f"Expected High, got {risk_level} (score: {score})"
    assert score >= 65, f"Expected score >= 65, got {score}"
    print(f"Malicious URL score: {score}, risk: {risk_level} [PASSED]")

    # Test 2: Benign URL
    res_benign = analyze_url("https://www.google.com")
    risk_level_b, score_b, _, _ = evaluate_risk(res_benign["indicators"], res_benign["detected_patterns"], "url")
    assert risk_level_b == "Low", f"Expected Low, got {risk_level_b} (score: {score_b})"
    print(f"Benign URL score: {score_b}, risk: {risk_level_b} [PASSED]")

def test_message_detector_slide_example():
    print("Testing Message detector on slide 3 example...")
    # Exact example from Final_Project.pdf slide 3:
    slide_msg = "Your account will be closed in 24 hours. Click here to verify now: http://bit.ly/verify and share your OTP."
    res = analyze_message(slide_msg)
    
    # Must flag OTP, urgency, shortener
    indicators = res["indicators"]
    indicator_names = [i["name"] for i in indicators]
    print(f"Detected indicators: {indicator_names}")
    
    has_otp = any("OTP" in name for name in indicator_names)
    has_urgency = any("Urgent" in name or "Pressure" in name or "Deadline" in name or "Suspension" in name for name in indicator_names)
    has_shortener = any("Shortener" in name for name in indicator_names)
    
    assert has_otp, "Did not detect OTP request"
    assert has_urgency, "Did not detect urgency"
    assert has_shortener, "Did not detect URL shortener"
    
    risk_level, score, summary, recs = evaluate_risk(indicators, res["detected_patterns"], "message")
    assert risk_level == "High", f"Expected High, got {risk_level} (score: {score})"
    
    # Must include recommendation against sharing OTP
    rec_titles = [r["title"] for r in recs]
    assert any("OTP" in t for t in rec_titles), "Missing OTP recommendation"
    print(f"Slide example risk: {risk_level}, score: {score}, recs: {rec_titles} [PASSED]")

def test_api_endpoints():
    print("Testing API endpoints...")
    # 1. Health check
    h_res = client.get("/api/health")
    assert h_res.status_code == 200
    assert h_res.json()["status"] == "healthy"

    # 2. Post scan
    scan_payload = {
        "input_type": "auto",
        "content": "URGENT: Your HDFC Bank account is restricted. Update KYC immediately or service will stop: http://bit.ly/hdfc-kyc-auth and submit OTP"
    }
    s_res = client.post("/api/scan", json=scan_payload)
    assert s_res.status_code == 200, s_res.text
    data = s_res.json()
    assert data["risk_level"] == "High"
    assert data["id"] is not None
    record_id = data["id"]
    print(f"API Scan successful, created record #{record_id}")

    # 3. Check history
    hist_res = client.get("/api/history")
    assert hist_res.status_code == 200
    hist = hist_res.json()
    assert len(hist) >= 1
    assert any(item["id"] == record_id for item in hist)
    print("API History retrieval verified [PASSED]")

    # 4. Check stats
    stats_res = client.get("/api/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_scans"] >= 1
    assert stats["high_risk_count"] >= 1
    print(f"API Stats: {stats} [PASSED]")

    # 5. Check guidance
    guide_res = client.get("/api/guidance")
    assert guide_res.status_code == 200
    guide_data = guide_res.json()
    assert len(guide_data["personas"]) == 5
    print("API Guidance verified with 5 personas [PASSED]")

    # 6. Delete scan
    del_res = client.delete(f"/api/history/{record_id}")
    assert del_res.status_code == 200
    print(f"API Delete record #{record_id} [PASSED]")

def test_auth_endpoints():
    print("Testing Auth endpoints (Register, Login, Me)...")
    username = "test_user_auth"
    email = "auth_tester@example.com"
    password = "TestPassword99!"

    # 1. Register
    reg_res = client.post("/api/auth/register", json={
        "username": username,
        "email": email,
        "password": password,
        "role": "Online Shoppers"
    })
    # If user already registered in previous test run, status can be 200 or 400
    if reg_res.status_code == 400:
        pass
    else:
        assert reg_res.status_code == 200
        assert "access_token" in reg_res.json()
        print("Register endpoint verified [PASSED]")

    # 2. Login
    login_res = client.post("/api/auth/login", json={
        "login": username,
        "password": password
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token is not None
    print("Login endpoint verified [PASSED]")

    # 3. Me profile with Bearer token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["username"] == username
    print("Me profile endpoint verified [PASSED]")

if __name__ == "__main__":
    test_url_detector()
    test_message_detector_slide_example()
    test_api_endpoints()
    test_auth_endpoints()
    print("\nALL BACKEND AUTOMATED TESTS PASSED SUCCESSFULLY! [OK]")
