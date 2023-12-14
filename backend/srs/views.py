import json  
import requests  
from requests.auth import HTTPBasicAuth  
from django.http import JsonResponse  
from django.conf import settings  

# Permission/Authentication/Certification Stuff
auth = HTTPBasicAuth(settings.CONFLUENCE_USERNAME, settings.CONFLUENCE_PASSWORD)  
CERTIFICATE_PATH = '../certfile.crt' 
  
# Retrieves the list of spaces
def get_spaces(request):    
    url = "https://confluence-dev.amd.com/rest/api/space?type=global&limit=5000"       
    headers = {    
        "Accept": "application/json"    
    }    
  
    try:  
        get_response = requests.get(    
            url,    
            headers=headers,    
            auth=auth,    
            verify=CERTIFICATE_PATH  # Add certification verification in the future
        )    
        get_response.raise_for_status()  
    except requests.exceptions.RequestException as e:  
        return JsonResponse({"error": f"Failed to fetch space data from Confluence API: {e}"}, status=500)  
  
    try:    
        data = json.loads(get_response.text)    
        return JsonResponse(data)    
    except json.decoder.JSONDecodeError:    
        return JsonResponse({"error": "Failed to parse JSON"}, status=500)  

# To get current user, "https://confluence-dev.amd.com/rest/api/user/current"

# To get the whole list of members, "https://confluence-dev.amd.com/rest/api/group/confluence-users/member"

# Retrieves the current logged-in user information
def get_current_user(request):    
    url = "https://confluence-dev.amd.com/rest/api/user/current" # Might need to update this later
    headers = {    
        "Accept": "application/json"    
    }    
  
    try:  
        get_response = requests.get(    
            url,    
            headers=headers,    
            auth=auth,    
            verify=CERTIFICATE_PATH  # Add certification verification in the future
        )    
        get_response.raise_for_status()  
    except requests.exceptions.RequestException as e:  
        return JsonResponse({"error": f"Failed to fetch user data from Confluence API: {e}"}, status=500)  
  
    try:    
        data = json.loads(get_response.text)    
        return JsonResponse(data)    
    except json.decoder.JSONDecodeError:    
        return JsonResponse({"error": "Failed to parse JSON"}, status=500)  
