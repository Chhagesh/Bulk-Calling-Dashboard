from fastapi import FastAPI, BackgroundTasks, HTTPException, File, UploadFile
import firebase_admin
from pydantic import BaseModel
from firebase_admin import credentials, firestore
import csv
from io import StringIO
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from retell import Retell
import asyncio
import time
from call_analytics import get_call_analytics, get_call_details_by_number

# Initialize Firebase
# Initialize Firebase App (Only Once)
if not firebase_admin._apps:
    cred = credentials.Certificate("bulk-calling-dashboard-firebase-adminsdk-fbsvc-d21d3aa5ef.json")  # Replace with your actual path
    firebase_admin.initialize_app(cred)

db = firestore.client()
# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/analytics")
async def fetch_analytics():
    return get_call_analytics()


@app.get("/call_details_by_number/{phone_number}")
async def get_call_details(phone_number: str):
    return get_call_details_by_number(phone_number)



# Retell AI Configuration
RETELL_API_KEY = "___key___"
retell_client = Retell(api_key=RETELL_API_KEY)

class Contact(BaseModel):
    phone_number: str
    name: str

class ContactsList(BaseModel):
    contacts: list[Contact]

async def make_call_async(phone_number):
    try:
        response = await asyncio.to_thread(
            retell_client.call.create_phone_call,
            from_number=" put the retail no here ",
            to_number=phone_number
        )
        print(f"Call initiated: {response}")
        return response
    except Exception as e:
        print(f"Error making call: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def process_call_queue():
    print("Fetching pending calls from Firebase...")
    calls_ref = db.collection("calls").where("status", "==", "pending").stream()
    fetched_calls = [call.to_dict() | {"id": call.id} for call in calls_ref]
    
    if not fetched_calls:
        print("No pending calls found.")
        return

    for call in fetched_calls:
        phone_number = call.get("phone_number")
        if not phone_number:
            print(f"Skipping invalid call entry: {call}")
            continue
        
        response = retell_client.call.create_phone_call(
            from_number=" here is your retail  number ",
            to_number=phone_number
            
        )
        return response
    

@app.get("/check_firebase")
def check_firebase():
    calls_ref = db.collection("calls").stream()
    return {"calls": [doc.to_dict() for doc in calls_ref]}

@app.post("/upload_contacts")
async def upload_contacts(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    content = await file.read()
    csv_reader = csv.reader(StringIO(content.decode("utf-8")))
    next(csv_reader, None)  # Skip header
    
    contacts = [{"phone_number": row[0], "name": row[1], "status": "pending"} for row in csv_reader if len(row) >= 2]
    for contact in contacts:
        db.collection("calls").add(contact)
    return {"message": "Contacts uploaded successfully", "total_contacts": len(contacts)}

@app.post("/trigger_calls")
def trigger_calls(background_tasks: BackgroundTasks):
    background_tasks.add_task(process_call_queue)
    return {"message": "Call processing started"}

@app.post("/add_call")
def add_call(phone_number: str, name: str):
    db.collection("calls").add({"phone_number": phone_number, "name": name, "status": "pending"})
    return {"message": "Call added to queue"}

@app.get("/call_logs")
def get_call_logs():
    calls_ref = db.collection("calls").stream()
    return {"calls": [{"id": call.id, **call.to_dict()} for call in calls_ref]}

@app.post("/start_calls")
async def start_calls(data: ContactsList, background_tasks: BackgroundTasks):
    try:
        responses = []
        
        for index, contact in enumerate(data.contacts):
            print(f"📞 Queuing call to: {contact.phone_number}")
            
            # Find the contact document
            contact_query = db.collection("calls").where("phone_number", "==", contact.phone_number).stream()
            
            for doc in contact_query:
                doc_ref = doc.id
                # Keep status as pending until actual call starts
                responses.append({
                    "phone_number": contact.phone_number,
                    "status": "pending",
                    "position": index + 1
                })
                
                # Add to background tasks
                background_tasks.add_task(
                    process_call_sequence,
                    contact.phone_number,
                    doc_ref,
                    index,
                    len(data.contacts)
                )

        return {"message": "Calls queued successfully", "calls": responses}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_call_sequence(phone_number: str, doc_id: str, index: int, total_calls: int):
    try:
        # Wait if not first call
        if index > 0:
            await asyncio.sleep(300)  # 5 minute delay between calls
            
        response = await make_call_async(phone_number)
        call_id = response.call_id
        
        # Update with call details
        db.collection("calls").document(doc_id).update({
            "call_id": call_id,
            "start_timestamp": response.start_timestamp
        })
        
        # Monitor and update call status
        call_details = await poll_call_status(call_id)
        await update_call_details(call_id, call_details)
        
        print(f"✅ Call {index+1}/{total_calls} completed")
        
    except Exception as e:
        db.collection("calls").document(doc_id).update({
            "status": "failed",
            "error": str(e)
        })



import time

async def poll_call_status(call_id):
    """Poll call status every 5 seconds and update Firebase for ongoing calls."""
    while True:
        try:
            response = retell_client.call.retrieve(call_id)
            call_status = response.call_status

            print(f"🔄 Checking call {call_id}: Status = {call_status}")

            # 🟡 If call is "registered" or "ongoing", update Firebase
            if call_status in ["registered", "ongoing"]:
                contact_query = db.collection("calls").where("call_id", "==", call_id).stream()
                for doc in contact_query:
                    db.collection("calls").document(doc.id).update({
                        "status": "in_progress" if call_status == "ongoing" else "initiated"
                    })
            
            # ✅ If call is "ended" or "error", stop polling and return response
            if call_status in ["ended", "error"]:
                print(f"✅ Call {call_id} stopped polling with status: {call_status}")
                return response  # ✅ Exit polling loop

            await asyncio.sleep(5)  # Check every 5 seconds

        except Exception as e:
            print(f"❌ Error retrieving call {call_id}: {e}")
            await asyncio.sleep(5)  # Retry after delay





async def update_call_details(call_id: str, response):
    """Update Firebase with call details after it ends or fails."""
    try:
        call_status = response.call_status  # ✅ Can be "ended" or "error"
        disconnection_reason = response.disconnection_reason  # ✅ Track why it failed

        # 🔥 Simple logic: Ended → Completed, Error → Failed
        final_status = "completed" if call_status == "ended" else "failed"

        duration = response.call_cost.total_duration_seconds
        summary = response.call_analysis.call_summary if response.call_analysis else "No summary"
        sentiment = response.call_analysis.user_sentiment if response.call_analysis else "No sentiment data"
        transcript = response.transcript if response.transcript else "No transcript available"
        recording_url = response.recording_url if response.recording_url else "No recording available"
        call_sucess_rate = response.call_analysis.call_successful if response.call_analysis else "No call successful data"
        summary =  response.call_analysis.call_summary if response.call_analysis else "No summary available"
        recording_url = response.recording_url if response.recording_url else "No recording available"

        # 🔹 Find & update existing call document
        contact_query = db.collection("calls").where("call_id", "==", call_id).stream()
        for doc in contact_query:
            db.collection("calls").document(doc.id).update({
                "status": final_status,  # ✅ Now only "completed" or "failed"
                "disconnection_reason": disconnection_reason,  # ✅ Store reason for failure
                "duration": duration,
                "summary": summary,
                "sentiment": sentiment,
                "transcript": transcript,
                "recording_url": recording_url,
                "call_success_rate": call_sucess_rate,
                "summary": summary,
                "recording_url": recording_url,
            })

        print(f"📊 Call {call_id} updated as {final_status} ({disconnection_reason})")

    except Exception as e:
        print(f"❌ Error updating call details: {e}")






