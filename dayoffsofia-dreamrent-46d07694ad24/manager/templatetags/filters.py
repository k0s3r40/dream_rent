from django import template
from datetime import datetime
from datetime import timedelta
register = template.Library()
from datetime import date



@register.filter(is_safe=True)
def verified(a):
    if a.verified:
        return False
    else:
        return True


