from django.shortcuts import render
from django.http import HttpResponse
# Create your views here.
from DreamRent import settings
from .models import  User
import os
from django.http import HttpResponseRedirect
from django.contrib import messages
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import time
from django.contrib.auth import login,logout
import random
import string
from django.contrib.auth import authenticate, login
stamp = lambda: int(round(time.time() * 1000))
from threading import Thread
from django.core.mail import send_mail
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

def generate_unique_url():
    return ''.join((random.choice(string.ascii_uppercase + string.digits)) for x in range(1, 200))

def email(request, subject, to, text_content, html_content):
    from_email = settings.EMAIL_HOST
    msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
    msg.attach_alternative(html_content, "text/html")
    msg.send()



def send_activation_email(request, user):
        subject = "DreamRent please verify your email"
        plain = "Hello, " + user.first_name + " please visit " + settings.HOST_NAME + user.verification_email + ", so we can confirm your email."
        html = '<html>' + \
               "<p>Hello, " + user.first_name + " please click " + "<a href=" + settings.HOST_NAME + user.verification_email + ">here</a>" + ", so we can confirm your email.</p>" + \
               '<html>'
        email(request,  subject, user.email,plain, html)


def home(request):
    context = {'static': os.path.join(settings.BASE_DIR, 'static')}
    #messages.success(request, 'Your account has been validated')
    return render(request, 'home.html',context)






def register_user(request):
    r = request.POST
    try:
        print(User.objects.get(email=r['email']))
        messages.error(request, 'An user with this email is already registered')
        return HttpResponseRedirect('/')
    except:

        user = User.objects.create_user(
            first_name = r['first_name'],
            last_name =r['last_name'],
            email = r['email'],
            password=r['password'],
            username=r['email'],
            verification_email='verify-user?confirm=' + generate_unique_url()

        )
        user.save()


        t = Thread(target=send_activation_email, args=(request,user), )
        t.daemon = True
        t.start()

        login(request, user, backend='django.contrib.auth.backends.ModelBackend')

    return HttpResponseRedirect('/')


def login_user(request):
    username = request.POST['email']
    password = request.POST['password']
    user = authenticate(username=username, password=password)

    if user is None:
        messages.warning(request, "Wrong credentials")
        return HttpResponseRedirect('/')
    else:
        login(request, user)
        return HttpResponseRedirect('/')


def disconnect_user(request):
    logout(request)
    return HttpResponseRedirect('/')





def verify_user(request):
    if request.GET.get('confirm'):
        confirm = request.GET.get('confirm')
        try:
            user = User.objects.get(verification_email='verify-user?confirm=' + confirm)
            user.verification_email = ''
            user.verified = True
            user.save()
            messages.error(request, 'Your account has been validated')
            return HttpResponseRedirect('/')
        except:
            return HttpResponseRedirect('/')



    else:
        return HttpResponseRedirect('/')

def explore(request):
    return render(request,'explore.html')


def dashboard(request):
    return render(request, 'dashboard.html')