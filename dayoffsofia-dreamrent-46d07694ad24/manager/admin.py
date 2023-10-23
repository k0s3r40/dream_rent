from django.contrib import admin
from .models import *
admin.site.register(User)
admin.site.register(PaymentMethod)
admin.site.register(WithdrawMethod)
admin.site.register(Site)
admin.site.register(SiteTag)
admin.site.register(SiteType)




