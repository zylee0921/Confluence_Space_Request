from django.http import JsonResponse  
from requests.auth import HTTPBasicAuth  
import requests  
import json  
  
def get_spaces(request):  
    url = "https://confluence-dev.amd.com/rest/api/space?type=global&limit=5000"  
    auth = HTTPBasicAuth("confadmin", "17n3e0o")  
    headers = {  
        "Accept": "application/json"  
    }  
    get_response = requests.get(  
        url,  
        headers=headers,  
        auth=auth,  
        verify=False  # Could be problematic here  
    )  
  
    try:  
        data = json.loads(get_response.text)  
        return JsonResponse(data)  
    except json.decoder.JSONDecodeError:  
        return JsonResponse({"error": "Failed to parse JSON"}, status=500)  
