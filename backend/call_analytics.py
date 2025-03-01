from fastapi import FastAPI , HTTPException
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, firestore

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase if not already initialized
if not firebase_admin._apps:
    cred = credentials.Certificate("bulk-calling-dashboard-firebase-adminsdk-fbsvc-d21d3aa5ef.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

@app.get("/analytics")
def get_call_analytics():
    try:
        calls = db.collection("calls").stream()
        total_calls = 0
        completed = 0
        failed = 0
        ongoing = 0
        durations = []
        success_count = 0
        failure_count = 0
        success_total = 0
        sentiments = {"positive": 0, "neutral": 0, "negative": 0}
        disconnection_reasons = {}
        
        for call in calls:
            data = call.to_dict()
            total_calls += 1
            
            # Count statuses
            status = data.get("status", "unknown")
            if status == "completed":
                completed += 1
            elif status == "failed":
                failed += 1
            elif status == "in_progress":
                ongoing += 1
            
            # Track durations
            if "duration" in data:
                durations.append(data["duration"])
            
            # Track success rate only if explicitly set
            if "call_success_rate" in data:
                success_total += 1
                if data["call_success_rate"]:
                    success_count += 1
                else:
                    failure_count += 1
            
            # Track sentiment only if explicitly set
            if "sentiment" in data and data["sentiment"]:
                sentiment = data["sentiment"].lower()
                if sentiment in sentiments:
                    sentiments[sentiment] += 1
            
            # Track disconnection reasons
            reason = data.get("disconnection_reason")
            if reason:
                disconnection_reasons[reason] = disconnection_reasons.get(reason, 0) + 1
            
        # Compute success rate
        success_rate = (success_count / success_total * 100) if success_total > 0 else 0
        
        # Compute duration stats
        avg_duration = sum(durations) / len(durations) if durations else 0
        max_duration = max(durations, default=0)
        min_duration = min(durations, default=0)
        
        return {
            "total_calls": total_calls,
            "completed": completed,
            "failed": failed,
            "ongoing": ongoing,
            "success_rate": {
                "percentage": round(success_rate, 2),
                "successful_calls": success_count,
                "failed_calls": failure_count
            },
            "durations": {
                "avg": avg_duration,
                "max": max_duration,
                "min": min_duration
            },
            "sentiments": sentiments,
            "disconnection_reasons": disconnection_reasons
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/call_details_by_number/{phone_number}")
def get_call_details_by_number(phone_number: str):
    try:
        # Query Firebase for the document where phone_number matches
        call_query = db.collection("calls").where("phone_number", "==", phone_number).stream()

        call_details = []
        for doc in call_query:
            call_data = doc.to_dict()
            call_data["id"] = doc.id  # Include document ID
            call_details.append(call_data)

        if not call_details:
            raise HTTPException(status_code=404, detail="No calls found for this phone number")

        return {"call_details": call_details}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
