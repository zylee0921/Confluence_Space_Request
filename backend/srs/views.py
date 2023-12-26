import json  
import requests  
from requests.auth import HTTPBasicAuth  
from django.http import JsonResponse, HttpResponse
from django.conf import settings  
from django.core.mail import send_mail  
from django.template.loader import render_to_string

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
            verify=CERTIFICATE_PATH
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
    url = "https://confluence-dev.amd.com/rest/api/user/current" # Might need to update this later for normal users
    headers = {    
        "Accept": "application/json"    
    }    
  
    try:  
        get_response = requests.get(    
            url,    
            headers=headers,    
            auth=auth,    
            verify=CERTIFICATE_PATH
        )    
        get_response.raise_for_status()  
    except requests.exceptions.RequestException as e:  
        return JsonResponse({"error": f"Failed to fetch user data from Confluence API: {e}"}, status=500)  
  
    try:    
        data = json.loads(get_response.text)    
        return JsonResponse(data)    
    except json.decoder.JSONDecodeError:    
        return JsonResponse({"error": "Failed to parse JSON"}, status=500)  


# Retrieves the list of groups that the current user is part of
def get_current_user_groups(request):      
    user_data = json.loads(get_current_user(request).content)      
    username = user_data['username']  
    
    url = "https://confluence-dev.amd.com/rest/api/user/memberof?username={}".format(username)      
    headers = {      
        "Accept": "application/json"      
    }      
      
    try:      
        get_response = requests.get(      
            url,      
            headers=headers,      
            auth=auth,      
            verify=CERTIFICATE_PATH      
        )      
        get_response.raise_for_status()      
    except requests.exceptions.RequestException as e:      
        return JsonResponse({"error": f"Failed to fetch user groups from Confluence API: {e}"}, status=500)      
      
    try:      
        data = json.loads(get_response.text)   
        user_groups = [group['name'] for group in data['results']]  # Update this line based on the API response structure  
        return JsonResponse({"user_groups": user_groups})      
    except json.decoder.JSONDecodeError:      
        return JsonResponse({"error": "Failed to parse JSON"}, status=500)  


# Function used to send email
def send_request_email(request):      
    # Testing    
    print(f"Request method: {request.method}")    
    
    if request.method == 'POST':     
        data = json.loads(request.body)      
        target_email = data.get('target_email')      
        username = data.get('username')      
        cart_items = data.get('cart_items')    
        group = data.get('group')
            
        subject = 'Request Access'      
        if group:  
            message = f'The user, {username}, has requested access for the group, {group}, to the following spaces:\n\n'     
        else:  
            message = f'The user, {username}, has requested access to the following spaces:\n\n'     
        message += '\n'.join([f"{item['name']} (Key: {item['key']})" for item in cart_items])    
        from_email = 'zhiyolee@amd.com'     

        if group:
            html = render_to_string('contact/emails/groupform.html', {    
                'username': username,    
                'group': group,
                'cart_items': cart_items,    
            })    
        else:
            html = render_to_string('contact/emails/requestform.html', {    
                'username': username,    
                'cart_items': cart_items,    
            })    
    
        # Testing    
        print(f"Username: {username}")      
        if group:  
            print(f"Group: {group}")
        print(f"Cart items: {cart_items}")      
        print(html)    
        
        try:                    
            send_mail(subject, message, from_email, [target_email], html_message=html)      
            print("Email sent successfully")    
            return JsonResponse({'status': 'success', 'message': 'Email sent successfully'})         
        except Exception as e:      
            print(f"Error sending email: {e}")     
            return JsonResponse({'status': 'error', 'message': f'Error sending email: {e}'})      
    else:      
        return JsonResponse({'status': 'error', 'message': 'This endpoint only accepts POST requests'})    
