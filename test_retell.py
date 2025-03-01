import asyncio
from retell import Retell

# Initialize Retell client
retell_client = Retell(
    api_key="key_f4ee0732ce5b834666c2957b8f1e"
)

async def make_call():
    try:
        # Remove 'await' since it's not an async function
        response = retell_client.call.create_phone_call(
            from_number="+18454566808",
            to_number="+917879556952"
        )
        
        print(f"Call initiated: {response}")  # Should print the PhoneCallResponse object
    except Exception as e:
        print(f"Error making call: {e}")

# Run the async function in an event loop
asyncio.run(make_call())
