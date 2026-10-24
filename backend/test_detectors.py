import sys
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.detectors.url_detector import analyze_url
from app.detectors.message_detector import analyze_message
from app.detectors.scoring import evaluate_risk
from app.detectors.ml_classifier import predict_ml_threat

def test_netmirror_all():
    print("Testing Netmirror fake website detection across engines...")
    targets = [
        "https://netmirror.app",
        "netmirror.pe",
        "netmirror.to",
        "net-mirror.com",
        "net mirror website",
        "net mirror",
        "https://netmirror.app/movies",
        "http://netmirror.cc/stream"
    ]
    for target in targets:
        # Test URL detector
        url_res = analyze_url(target)
        u_risk, u_score, _, recs = evaluate_risk(url_res["indicators"], url_res["detected_patterns"], "url")
        assert u_risk == "High", f"{target} expected High URL risk, got {u_risk} ({u_score})"
        assert u_score >= 80, f"{target} expected URL score >= 80, got {u_score}"
        
        # Test Message detector
        msg_res = analyze_message(target)
        m_risk, m_score, _, _ = evaluate_risk(msg_res["indicators"], msg_res["detected_patterns"], "message")
        assert m_risk == "High", f"{target} expected High MSG risk, got {m_risk} ({m_score})"
        assert m_score >= 80, f"{target} expected MSG score >= 80, got {m_score}"
        
        # Test ML classifier
        ml_res = predict_ml_threat(target)
        assert ml_res["ml_risk"] == "High" or ml_res["ml_score"] >= 65, f"{target} ML score {ml_res['ml_score']} too low"
        print(f"  [OK] {target:30} -> URL: {u_risk} ({u_score}/100), MSG: {m_risk} ({m_score}/100), ML: {ml_res['ml_risk']} ({ml_res['ml_score']}%)")

    # Verify benign site
    benign_res = analyze_url("https://www.google.com")
    b_risk, b_score, _, _ = evaluate_risk(benign_res["indicators"], benign_res["detected_patterns"], "url")
    assert b_risk == "Low"
    print(f"  [OK] https://www.google.com          -> URL: {b_risk} ({b_score}/100)")
    
    print("\nALL DETECTOR THREAT SCENARIOS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_netmirror_all()
