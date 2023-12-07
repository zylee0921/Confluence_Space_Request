import requests
from requests.auth import HTTPBasicAuth
import json

url = "https://confluence-dev.amd.com/rest/api/space?type=global&limit=5000"

auth = HTTPBasicAuth("confadmin", "17n3e0o")

headers = {  
  "Accept": "application/json"  
}  
  
response = requests.request(  
   "GET",  
   url,  
   headers=headers,  
   auth=auth,  
   verify=False # Could be problematic here
)  
  
print("Status code:", response.status_code)
print("Response text:", response.text)
  
try:  
    print(json.dumps(json.loads(response.text), sort_keys=True, indent=4, separators=(",", ": ")))  
except json.decoder.JSONDecodeError:  
    print("Failed to parse JSON")  