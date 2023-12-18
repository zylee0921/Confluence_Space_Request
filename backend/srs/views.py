import json  
import requests  
from requests.auth import HTTPBasicAuth  
from django.http import JsonResponse  
from django.conf import settings  
from django.core.mail import send_mail  

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
    
# def send_request_email(request):  
#     if request.method == 'POST':  
#         cart_items = request.POST.getlist('cart_items[]')  
#         username = request.POST.get('username')  
  
#         subject = 'Request Access to Spaces'  
#         message = f'The user with email {username} has requested access to the following spaces:\n\n'  
#         message += '\n'.join(cart_items)  
  
#         try:  
#             send_mail(
#                 subject, 
#                 message, 
#                 settings.EMAIL_HOST_USER, 
#                 ["zhiyolee@amd.com"], 
#                 fail_silently=False)  
#             return JsonResponse({'status': 'success', 'message': 'Email sent successfully'})  
#         except Exception as e:  
#             return JsonResponse({'status': 'error', 'message': f'Error sending email: {e}'})  
#     else:  
#         return JsonResponse({'status': 'error', 'message': 'Invalid request method'})  
    
def send_request_email(request):  
    if request.method == 'POST': 
        target_email = request.POST.get('target_email') 
        username = request.POST.get('username')  
        cart_items = request.POST.getlist('cart_items[]')  
        
        subject = 'Request Access'  
        message = f'The user with email {username} has requested access to the following spaces:\n\n' 
        message += '\n'.join(cart_items)
        from_email = 'zyamd0921@gmail.com'  
    
        try:  
            send_mail(subject, message, from_email, [target_email])  
            return JsonResponse({'status': 'success', 'message': 'Email sent successfully'})   
        except Exception as e:  
            return JsonResponse({'status': 'error', 'message': f'Error sending email: {e}'}) 
    else:  
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'})  
