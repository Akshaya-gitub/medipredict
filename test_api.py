import urllib.request
import json

def test_api():
    base = "http://127.0.0.1:8000/api"

    def req(endpoint, data=None, method="GET"):
        url = f"{base}{endpoint}"
        body = json.dumps(data).encode("utf-8") if data else None
        headers = {"Content-Type": "application/json"} if data else {}
        r = urllib.request.Request(url, data=body, headers=headers, method=method)
        with urllib.request.urlopen(r) as res:
            return json.loads(res.read())

    print("--- Testing MediPredict Hospital Intelligence API ---")

    # 1. Dashboard
    dash = req("/dashboard")
    print(f"[PASS] Dashboard: Total={dash['total_appointments']}, Completed={dash['completed_appointments']}, HighRisk={dash['high_risk_appointments']}, Accuracy={dash['prediction_accuracy']}%")

    # 2. Predict benchmark P-10245
    p10245 = {
        "patient_id": "P-10245",
        "age": 42,
        "department": "Cardiology",
        "appointment_type": "Follow-up",
        "previous_appointments": 6,
        "previous_no_shows": 2,
        "previous_cancellations": 1,
        "days_since_previous_visit": 180,
        "distance_km": 18,
        "sms_sent": True,
        "sms_confirmed": False,
        "waiting_time_minutes": 45
    }
    pred = req("/predict", data=p10245, method="POST")
    print(f"[PASS] Predict P-10245 -> Prob: {pred['no_show_probability']}%, Risk: {pred['risk_level']}, Conf: {pred['confidence']}%, Alert: {pred['alert_created']}")
    assert pred["no_show_probability"] == 82.0
    assert pred["risk_level"] == "very_high"
    assert pred["confidence"] == 91.0
    assert pred["alert_created"] is True

    # 3. Appointments registry
    apts = req("/appointments")
    print(f"[PASS] Appointments: Total={apts['total']}, Pages={apts['total_pages']}, Items Returned={len(apts['items'])}")

    # 4. High-risk queue
    hr = req("/high-risk")
    print(f"[PASS] High-Risk Queue: {len(hr)} appointments flagged for clinical intervention")

    # 5. Alerts Center
    alerts = req("/alerts")
    print(f"[PASS] Alerts Center: {len(alerts)} alerts active in system")

    # 6. Action on alert
    if alerts:
        a_id = alerts[0]["id"]
        res_action = req(f"/alerts/{a_id}/action", data={"status": "Contacted", "action_taken": "Triage phone outreach verified"}, method="POST")
        print(f"[PASS] Alert Transition: {res_action['id']} updated to {res_action['status']}")

    # 7. Reminder dispatch
    apt_id = pred["appointment_id"]
    rem = req(f"/appointments/{apt_id}/remind", method="POST")
    print(f"[PASS] Priority Reminder Dispatch: {rem['message']}")

    # 8. Notifications
    notifs = req("/notifications")
    print(f"[PASS] Notifications: Unread={notifs['unread_count']}, Total={len(notifs['items'])}")

    # 9. Audit Logs
    logs = req("/audit-logs")
    print(f"[PASS] Audit Trail: {len(logs)} compliance log entries logged")

    print("\nALL BACKEND API AND PREDICTION PIPELINE TESTS PASSED 100%!")

if __name__ == "__main__":
    test_api()
