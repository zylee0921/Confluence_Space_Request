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
    # The Confluence Rest API has a limit of showing 500 results   
    limit = 500  
    start = 0  
    all_spaces = []  
      
    while True:  
        url = f"https://confluence-dev.amd.com/rest/api/space?type=global&limit={limit}&start={start}"         
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
            all_spaces.extend(data['results'])  
              
            # If the number of results is less than the limit, break the loop  
            if len(data['results']) < limit:  
                break  
              
            # Otherwise, increment the start value for the next request  
            start += limit  
        except json.decoder.JSONDecodeError:      
            return JsonResponse({"error": "Failed to parse JSON"}, status=500)    
      
    return JsonResponse(all_spaces, safe=False)  

    


# To get current user, "https://confluence-dev.amd.com/rest/api/user/current"

# To get the whole list of members, "https://confluence-dev.amd.com/rest/api/group/confluence-users/member"

# Retrieves the current user information
def get_current_user(request):  
    if request.method == 'POST':  
        try:  
            data = json.loads(request.body)  
            username = data.get('username')  
        except json.decoder.JSONDecodeError:  
            return JsonResponse({"error": "Failed to parse JSON"}, status=500)  
    else:  
        username = request.GET.get('username')  
  
    print(f"Username: {username}")  
  
    if username:  
        url = f"https://confluence.amd.com/rest/api/user?username={username}"  
    else:  
        url = "https://confluence.amd.com/rest/api/user/current"  
  
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
        if 'username' not in data:  
            return JsonResponse({"error": "Invalid username"}, status=404)  
        return JsonResponse(data)  
    except json.decoder.JSONDecodeError:  
        return JsonResponse({"error": "Failed to parse JSON"}, status=500)  
  



# Retrieves the list of groups that the current user is part of
def get_current_user_groups(request):      
    if request.method == 'POST':  
        try:  
            data = json.loads(request.body)  
            username = data.get('username')  
        except json.decoder.JSONDecodeError:  
            return JsonResponse({"error": "Failed to parse JSON"}, status=500)  
    else:  
        username = request.GET.get('username')   
    
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
        user_groups = [group['name'] for group in data['results']]
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
        user_key = data.get('user_key')      
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
                'user_key': user_key,    
                'group': group,
                'cart_items': cart_items,   
            })    
        else:
            html = render_to_string('contact/emails/requestform.html', {    
                'username': username,
                'user_key': user_key,    
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
    


# Grants permission to a user or group for a specific space
def grant_permission(request):  
    user_key = request.GET.get('user_key')  
    group_name = request.GET.get('group_name')  
    space_key = request.GET.get('space_key')   
  
    print(f"User Key: {user_key}")  
    if group_name:  
        print(f"Group Name: {group_name}")  
    print(f"Space Key: {space_key}")   
  
    # Define the Confluence REST API endpoint for updating space permissions  
    space_permissions_url = f"https://confluence-dev.amd.com/rest/api/space/{space_key}/permission"  
 
    # Set the permission data for the user or group (View for now)  
    if group_name:  
        permission_data = {  
            "subject": {  
                "type": "group",  
                "identifier": group_name  
            },  
            "operation": {  
                "key": "read",  
                "target": "page"  
            },  
            "_links": {}  
        }  
    else:  
        permission_data = {  
            "subject": {
                "type": "user",
                "identifier": user_key
            },
            "operation": {
                "key": "read",
                "target": "space"
            },
            "_links": {}  
        }  

    # Send a POST request to the Confluence REST API to update the space permissions  
    response = requests.post(  
        space_permissions_url,  
        json=permission_data,  
        auth=auth, 
        verify=CERTIFICATE_PATH
    )  
  
    if response.status_code == 200:  
        return JsonResponse({"status": "success", "message": "Permission granted"})  
    else:  
        print(f"Confluence API error: {response.status_code} - {response.content}")  # Print the error details
        return JsonResponse({"status": "error", "message": "Failed to grant permission"})
