from retell import Retell

# Initialize Retell client
client = Retell(
    api_key="key_f4ee0732ce5b834666c2957b8f1e",
)

# Retrieve call details
call_response = client.call.retrieve("call_7445abc0f814871ec306c78cf60")

# Extract only required fields

summary = call_response.call_analysis.call_summary if call_response.call_analysis else "No summary available"
sentiment = call_response.call_analysis.user_sentiment if call_response.call_analysis else "No sentiment data"
recording_url = call_response.recording_url if call_response.recording_url else "No recording available"
call_sucess_rate = call_response.call_analysis.call_successful if call_response.call_analysis else "No call successful data"

# Print selected data
print(f"📞 **Call Summary:** {summary}")
print(f"🙂 **User Sentiment:** {sentiment}")
print(f"🔊 **Recording URL:** {recording_url}")
print(f" **Call Success Rate:** {call_sucess_rate}")
print(call_response)