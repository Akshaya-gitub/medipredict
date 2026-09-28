import os
import sys
import json
import random
import datetime

# Ensure app package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, engine, Base
from app.models.models import (
    User, Patient, Department, Appointment, Prediction, Alert, Notification, AuditLog, PredictionRule
)
from app.prediction_engine.engine import run_prediction_engine

def seed_database():
    print("Initializing database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print("Seeding Users...")
        users = [
            User(username="admin", email="admin@saintjude-hospital.org", full_name="Dr. Eleanor Vance", role="Administrator"),
            User(username="staff", email="nurse.clara@saintjude-hospital.org", full_name="Nurse Clara Reynolds", role="Hospital Staff"),
            User(username="viewer", email="auditor.james@saintjude-hospital.org", full_name="James Thorne (Auditor)", role="Viewer"),
        ]
        db.add_all(users)
        db.commit()

        print("Seeding Departments...")
        departments_data = [
            {"name": "Cardiology", "code": "CARD", "head_doctor": "Dr. Marcus Chen", "staff": 14, "rate": 24.2, "desc": "Cardiovascular medicine, catheterization & post-op follow-up"},
            {"name": "Dermatology", "code": "DERM", "head_doctor": "Dr. Sarah Jenkins", "staff": 8, "rate": 18.5, "desc": "Clinical dermatology, biopsies and outpatient skin therapies"},
            {"name": "Orthopedics", "code": "ORTH", "head_doctor": "Dr. Robert Bradley", "staff": 12, "rate": 22.8, "desc": "Musculoskeletal surgery, joint rehabilitation & cast clinics"},
            {"name": "Pediatrics", "code": "PEDI", "head_doctor": "Dr. Maya Lin", "staff": 16, "rate": 14.1, "desc": "Child wellness, immunizations, and developmental tracking"},
            {"name": "General Medicine", "code": "GENM", "head_doctor": "Dr. Arthur Pendelton", "staff": 22, "rate": 16.9, "desc": "Primary care, comprehensive physicals and chronic condition triage"},
            {"name": "Dental", "code": "DENT", "head_doctor": "Dr. Olivia Taylor", "staff": 9, "rate": 26.4, "desc": "Oral surgery, endodontics, cleanings & hygiene maintenance"},
            {"name": "Neurology", "code": "NEUR", "head_doctor": "Dr. Gregory House", "staff": 11, "rate": 20.1, "desc": "Cognitive disorders, epilepsy, migraine management and nerve conduction"},
        ]
        dept_objs = []
        for d in departments_data:
            dept = Department(
                name=d["name"],
                code=d["code"],
                head_doctor=d["head_doctor"],
                active_staff=d["staff"],
                avg_no_show_rate=d["rate"],
                description=d["desc"]
            )
            dept_objs.append(dept)
            db.add(dept)
        db.commit()

        print("Seeding Prediction Rules...")
        rules_data = [
            ("Previous No-Show History (>=2)", "History", "Patient has missed 2 or more historical appointments", 20),
            ("Historical Attendance Failure Rate (>30%)", "History", "No-show ratio exceeds 30% of lifetime visits", 15),
            ("SMS Confirmation Absence", "Communication", "Appointment reminder was sent but remains unacknowledged", 15),
            ("Extended Booking Interval (>120 Days)", "Scheduling", "Time elapsed since last clinical visit exceeds 4 months", 10),
            ("Transit Distance Barrier (>15 km)", "Logistics", "Distance between patient residence and facility exceeds 15 km", 10),
            ("Prior Visit Cancellation Recorded", "History", "Patient cancelled or requested rescheduling on preceding encounter", 10),
            ("Prolonged Clinic Lobby Wait (>40 mins)", "Clinic", "Average rooming delay exceeds 40 minutes", 5),
            ("Weekend Appointment Schedule", "Scheduling", "Consultation set for Saturday or Sunday clinic hours", 5),
            ("New Patient Intake", "History", "First visit to healthcare network with no behavioral history", 5),
        ]
        for r_name, r_cat, r_desc, r_w in rules_data:
            rule = PredictionRule(name=r_name, category=r_cat, condition_desc=r_desc, weight=r_w, is_active=True)
            db.add(rule)
        db.commit()

        print("Seeding 110+ Patients...")
        first_names = ["Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia", "James", "Isabella", "Benjamin", "Mia", "Lucas", "Charlotte", "Henry", "Amelia", "Alexander", "Harper", "Mason", "Evelyn", "Michael", "Abigail", "Daniel", "Emily", "Jacob", "Elizabeth", "Logan", "Mila", "Jackson", "Ella", "Sebastian", "Avery", "Jack", "Sofia", "Aiden", "Camila", "Owen", "Aria", "Samuel", "Scarlett", "Matthew", "Victoria", "Joseph", "Madison", "Levi", "Luna", "David", "Grace", "John", "Chloe", "Wyatt", "Penelope", "Carter", "Layla", "Julian", "Riley", "Luke", "Zoey", "Grayson", "Nora", "Isaac", "Lily", "Jayden", "Eleanor", "Theodore", "Hannah", "Gabriel", "Lillian", "Anthony", "Addison", "Dylan", "Aubrey", "Leo", "Ellie", "Lincoln", "Stella", "Jaxon", "Natalie", "Asher", "Zoe", "Christopher", "Leah", "Josiah", "Hazel", "Andrew", "Violet", "Thomas", "Aurora", "Joshua", "Savannah", "Ezra", "Audrey", "Hudson", "Brooklyn", "Charles", "Bella", "Caleb", "Claire", "Isaiah", "Skylar", "Ryan"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"]

        # Ensure our 4 key prompt scenarios exist!
        scenario_patients = [
            {"id": "P-10001", "name": "Arthur Pendelton", "age": 58, "gender": "Male", "dist": 3.0, "tot": 8, "att": 8, "ns": 0, "canc": 0, "gap": 21},
            {"id": "P-10025", "name": "Elena Rostova", "age": 34, "gender": "Female", "dist": 12.0, "tot": 5, "att": 3, "ns": 1, "canc": 1, "gap": 95},
            {"id": "P-10245", "name": "Sarah Connor", "age": 42, "gender": "Female", "dist": 18.0, "tot": 6, "att": 3, "ns": 2, "canc": 1, "gap": 180},
            {"id": "P-10420", "name": "Marcus Aurelius", "age": 67, "gender": "Male", "dist": 35.0, "tot": 10, "att": 4, "ns": 5, "canc": 1, "gap": 240},
        ]

        patients_dict = {}
        for sp in scenario_patients:
            p = Patient(
                id=sp["id"],
                full_name=sp["name"],
                age=sp["age"],
                gender=sp["gender"],
                phone=f"+1 (555) {random.randint(100, 999)}-{random.randint(1000, 9999)}",
                distance_km=sp["dist"],
                total_appointments=sp["tot"],
                attended_count=sp["att"],
                no_show_count=sp["ns"],
                cancellation_count=sp["canc"],
                days_since_previous_visit=sp["gap"],
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(200, 500))
            )
            patients_dict[p.id] = p
            db.add(p)

        # Generate remaining 105 patients
        for i in range(1, 106):
            pid = f"P-{10000 + i}"
            if pid in patients_dict:
                continue
            
            age = random.randint(18, 84)
            gender = random.choice(["Male", "Female", "Other"])
            name = f"{random.choice(first_names)} {random.choice(last_names)}"
            dist = round(random.choice([2.5, 4.0, 7.5, 11.0, 16.5, 22.0, 31.5, 42.0]), 1)
            
            tot_apts = random.randint(1, 12)
            # Create distribution of behavior
            rand_profile = random.random()
            if rand_profile < 0.65: # Reliable
                ns = 0 if tot_apts <= 4 else random.choice([0, 1])
                canc = random.choice([0, 0, 1])
            elif rand_profile < 0.85: # Moderate
                ns = random.choice([1, 2])
                canc = random.choice([0, 1, 2])
            else: # High risk historical
                max_ns = max(1, min(5, tot_apts))
                ns = random.randint(1, max_ns)
                canc = random.randint(0, max(0, tot_apts - ns))

            att = max(0, tot_apts - ns - canc)
            gap = random.choice([14, 28, 45, 60, 90, 120, 180, 240])

            patient = Patient(
                id=pid,
                full_name=name,
                age=age,
                gender=gender,
                phone=f"+1 (555) {random.randint(100, 999)}-{random.randint(1000, 9999)}",
                distance_km=dist,
                total_appointments=tot_apts,
                attended_count=att,
                no_show_count=ns,
                cancellation_count=canc,
                days_since_previous_visit=gap,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(60, 400))
            )
            patients_dict[pid] = patient
            db.add(patient)

        db.commit()

        print("Seeding 180+ Appointments with Predictions and Alerts...")
        appointment_types = ["New consultation", "Follow-up", "Routine check-up", "Diagnostic appointment", "Therapy session"]
        departments_list = [d["name"] for d in departments_data]

        now = datetime.datetime.utcnow()

        # Seed key scenario appointments specifically for tomorrow
        scenario_appointments = [
            {
                "apt_id": "APT-10001",
                "patient_id": "P-10001",
                "dept": "General Medicine",
                "type": "Routine check-up",
                "date": now + datetime.timedelta(days=1, hours=9),
                "sms_sent": True,
                "sms_conf": True,
                "dist": 3.0,
                "wait": 20,
                "gap": 21,
                "status": "Scheduled"
            },
            {
                "apt_id": "APT-10025",
                "patient_id": "P-10025",
                "dept": "Dermatology",
                "type": "Follow-up",
                "date": now + datetime.timedelta(days=1, hours=11),
                "sms_sent": True,
                "sms_conf": False,
                "dist": 12.0,
                "wait": 35,
                "gap": 95,
                "status": "Scheduled"
            },
            {
                "apt_id": "APT-10245",
                "patient_id": "P-10245",
                "dept": "Cardiology",
                "type": "Follow-up",
                "date": now + datetime.timedelta(days=1, hours=10, minutes=30),
                "sms_sent": True,
                "sms_conf": False,
                "dist": 18.0,
                "wait": 45,
                "gap": 180,
                "status": "Scheduled"
            },
            {
                "apt_id": "APT-10420",
                "patient_id": "P-10420",
                "dept": "Orthopedics",
                "type": "Therapy session",
                "date": now + datetime.timedelta(days=1, hours=14, minutes=15),
                "sms_sent": True,
                "sms_conf": False,
                "dist": 35.0,
                "wait": 55,
                "gap": 240,
                "status": "Scheduled"
            }
        ]

        all_patient_ids = list(patients_dict.keys())
        appointments_to_create = list(scenario_appointments)

        # 1. Add 90 past appointments with actual historical outcomes
        for i in range(1, 91):
            pid = random.choice(all_patient_ids)
            p = patients_dict[pid]
            dept = random.choice(departments_list)
            atype = random.choice(appointment_types)
            
            days_back = random.randint(1, 45)
            apt_date = now - datetime.timedelta(days=days_back, hours=random.randint(8, 16))
            
            # Determine outcome
            r_outcome = random.random()
            if p.no_show_count >= 2 and r_outcome < 0.55:
                status = "No-Show"
            elif r_outcome < 0.18:
                status = "No-Show"
            elif r_outcome < 0.28:
                status = "Cancelled"
            else:
                status = "Attended"

            sms_s = True
            sms_c = True if status == "Attended" else (random.random() < 0.3)
            dist = p.distance_km
            wait = random.choice([15, 25, 35, 45, 60])
            gap = p.days_since_previous_visit

            appointments_to_create.append({
                "apt_id": f"APT-{20000 + i}",
                "patient_id": pid,
                "dept": dept,
                "type": atype,
                "date": apt_date,
                "sms_sent": sms_s,
                "sms_conf": sms_c,
                "dist": dist,
                "wait": wait,
                "gap": gap,
                "status": status
            })

        # 2. Add 85 upcoming appointments for today, tomorrow, and next 10 days
        for i in range(1, 86):
            pid = random.choice(all_patient_ids)
            p = patients_dict[pid]
            dept = random.choice(departments_list)
            atype = random.choice(appointment_types)

            days_forward = random.choice([0, 1, 1, 2, 2, 3, 4, 5, 7, 9])
            hour = random.choice([8, 9, 10, 11, 13, 14, 15, 16])
            minute = random.choice([0, 15, 30, 45])
            apt_date = now + datetime.timedelta(days=days_forward, hours=hour, minutes=minute)

            sms_s = True
            # realistic reminder confirmation status
            sms_c = True if (p.no_show_count == 0 and random.random() < 0.85) else (random.random() < 0.4)
            dist = p.distance_km
            wait = random.choice([20, 30, 45, 60])
            gap = p.days_since_previous_visit

            appointments_to_create.append({
                "apt_id": f"APT-{30000 + i}",
                "patient_id": pid,
                "dept": dept,
                "type": atype,
                "date": apt_date,
                "sms_sent": sms_s,
                "sms_conf": sms_c,
                "dist": dist,
                "wait": wait,
                "gap": gap,
                "status": "Scheduled"
            })

        # Create all appointments and run predictions
        alert_counter = 1000
        for item in appointments_to_create:
            p = patients_dict[item["patient_id"]]
            
            apt = Appointment(
                id=item["apt_id"],
                patient_id=item["patient_id"],
                department=item["dept"],
                appointment_type=item["type"],
                scheduled_date=item["date"] - datetime.timedelta(days=random.randint(3, 21)),
                appointment_date=item["date"],
                status=item["status"],
                sms_sent=item["sms_sent"],
                sms_confirmed=item["sms_conf"],
                distance_km=item["dist"],
                waiting_time_minutes=item["wait"],
                days_since_previous_visit=item["gap"],
                notes=None,
                created_at=item["date"] - datetime.timedelta(days=random.randint(3, 21))
            )
            db.add(apt)

            # Run prediction engine
            pred_data = run_prediction_engine(
                patient_id=p.id,
                age=p.age,
                gender=p.gender,
                department=item["dept"],
                appointment_type=item["type"],
                previous_appointments=p.total_appointments,
                previous_no_shows=p.no_show_count,
                previous_cancellations=p.cancellation_count,
                days_since_previous_visit=item["gap"],
                distance_km=item["dist"],
                sms_sent=item["sms_sent"],
                sms_confirmed=item["sms_conf"],
                waiting_time_minutes=item["wait"],
                appointment_date_obj=item["date"]
            )

            # Store prediction
            pred = Prediction(
                id=f"PRD-{item['apt_id']}",
                appointment_id=item["apt_id"],
                patient_id=p.id,
                no_show_probability=pred_data["no_show_probability"],
                risk_level=pred_data["risk_level"],
                confidence=pred_data["confidence"],
                risk_factors=json.dumps([rf.model_dump() for rf in pred_data["risk_factors"]]),
                scoring_breakdown=json.dumps([sb.model_dump() for sb in pred_data["scoring_breakdown"]]),
                explanation=pred_data["explanation"],
                recommendation=pred_data["recommendation"],
                created_at=item["date"] - datetime.timedelta(days=1)
            )
            db.add(pred)

            # If high or very high risk and upcoming, generate alert
            if pred_data["risk_level"] in ["high", "very_high"] and item["status"] == "Scheduled":
                alert_counter += 1
                alert_id = f"ALT-{alert_counter}"
                
                # Variety of alert statuses
                rand_s = random.random()
                if item["apt_id"] == "APT-10245":
                    a_status = "New" # Prompt Hackathon Demo scenario starts as New!
                elif rand_s < 0.45:
                    a_status = "New"
                elif rand_s < 0.70:
                    a_status = "Contacted"
                elif rand_s < 0.88:
                    a_status = "Monitoring"
                else:
                    a_status = "Resolved"

                alert = Alert(
                    id=alert_id,
                    patient_id=p.id,
                    appointment_id=item["apt_id"],
                    risk_level=pred_data["risk_level"],
                    detection_time=now - datetime.timedelta(hours=random.randint(1, 48)),
                    description=f"Elevated no-show risk ({pred_data['no_show_probability']}%) in {item['dept']}. " + ("SMS unconfirmed." if not item["sms_conf"] else "Multiple prior no-shows."),
                    recommended_action=pred_data["recommendation"].split("\n")[0] if pred_data["recommendation"] else "Contact patient for verbal confirmation",
                    status=a_status,
                    action_taken="Follow-up call scheduled" if a_status == "Contacted" else ("Patient confirmed arrival" if a_status == "Resolved" else None),
                    resolved_at=now - datetime.timedelta(hours=2) if a_status == "Resolved" else None
                )
                db.add(alert)

        db.commit()

        print("Seeding Notifications...")
        notifs = [
            Notification(
                title="Critical High-Risk Appointment Alert",
                message="Patient P-10245 (Cardiology, Tomorrow 10:30 AM) predicted at 82% no-show probability. Unconfirmed reminder.",
                type="very_high_risk",
                is_read=False,
                link="/high-risk",
                created_at=now - datetime.timedelta(minutes=15)
            ),
            Notification(
                title="Cardiology Department Spike",
                message="Cardiology no-show rate increased by 18% over the past 30 days. Action required.",
                type="department_spike",
                is_read=False,
                link="/analytics",
                created_at=now - datetime.timedelta(hours=2)
            ),
            Notification(
                title="SMS Unconfirmed Cluster",
                message="42% of high-risk patients tomorrow have not responded to automated reminders.",
                type="reminder_unconfirmed",
                is_read=False,
                link="/alerts",
                created_at=now - datetime.timedelta(hours=5)
            ),
            Notification(
                title="System Intelligence Update",
                message="Prediction engine calibrated with 180+ clinical historical visits. Accuracy: 89.2%.",
                type="system",
                is_read=True,
                link="/dashboard",
                created_at=now - datetime.timedelta(days=1)
            ),
        ]
        db.add_all(notifs)
        db.commit()

        print("Seeding Audit Trail...")
        audit_events = [
            ("Dr. Eleanor Vance", "Prediction Rule Configured", "Rule #2 (SMS Confirmation)", "Success", "Weight verified at 15 points"),
            ("Nurse Clara Reynolds", "Appointment Prediction Generated", "APT-10245 (P-10245)", "Success", "Score: 82% (VERY HIGH), Confidence: 91%"),
            ("System", "High-Risk Alert Created", "ALT-1001 (P-10245)", "Success", "Triggered automated alert for cardiology follow-up"),
            ("Nurse Clara Reynolds", "Patient Contact Initiated", "ALT-1002 (P-10025)", "Success", "Phone contact attempted; voicemail left"),
            ("Dr. Marcus Chen", "Department Analytics Export", "Cardiology Clinic", "Success", "Generated monthly clinic utilization summary"),
            ("James Thorne", "Audit Trail Inspection", "Hospital Registry", "Success", "Verified HIPAA-compliant logistical feature extraction"),
        ]
        for user, act, tgt, res, det in audit_events:
            log = AuditLog(
                timestamp=now - datetime.timedelta(minutes=random.randint(5, 300)),
                user=user,
                action=act,
                target=tgt,
                result=res,
                details=det
            )
            db.add(log)
        db.commit()

        print("Database seeded successfully with 100+ patients, 180+ appointments, predictions, alerts, and audit logs!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
