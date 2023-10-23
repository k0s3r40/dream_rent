from django.db import models

# Create your models here.
from DreamRent import settings

from django.db import models
from django.contrib.auth.models import AbstractUser
import os


#####################################################
# USER
#####################################################

class User(AbstractUser):
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ['id']
    email = models.EmailField(max_length=70, blank=True, null=True, unique=True)
    country = models.CharField(null=True, blank=True, max_length=255)
    city = models.CharField(null=True, blank=True, max_length=255)
    address = models.CharField(null=True, blank=True, max_length=255)
    language = models.CharField(null=True, blank=True, max_length=255)
    verified = models.BooleanField(blank=True, default=False)
    verification_email = models.CharField(null=True, blank=True, max_length=255)
    pass_reset_link = models.CharField(null=True, blank=True, max_length=255)
    phonenumber = models.CharField(blank=True, max_length=30, null=True)
    id_pic = models.ImageField(upload_to='user_ids/', default=None)
    HOST = models.BooleanField(default=False, blank=True)
    GUEST = models.BooleanField(default=False, blank=True)

    def show_email(self):
        return (self.email)

    def show_username(self):
        return (self.username)

    def __str__(self):
        return ("{}").format(self.username)


#####################################################
# PAYMENT METHODS
#####################################################


class PaymentMethod(models.Model):
    class Meta:
        verbose_name = "Payment method"
        verbose_name_plural = "Payment methods"

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    pay_pal = models.CharField(null=True, blank=True, max_length=255)
    ccn = models.CharField(null=True, blank=True, max_length=255, verbose_name="Credit Card Number",)
    ccv = models.CharField(null=True, blank=True, max_length=3, verbose_name="CCV",)
    ced = models.CharField(null=True, blank=True, max_length=3, verbose_name="Expiration date", )
    def __str__(self):
        return '{}'.format(self.user)


#####################################################
# WITHDRAW METHODS
#####################################################


class WithdrawMethod(models.Model):
    class Meta:
        verbose_name = "Withdraw method"
        verbose_name_plural = "Withdraw methods"

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    IBAN = models.CharField(null=True, blank=True, max_length=255)
    SWIFT = models.CharField(null=True, blank=True, max_length=255, verbose_name="Credit Card Number",)
    def __str__(self):
        return '{}'.format(self.user)

#####################################################
# SITE TYPES
#####################################################


class SiteType(models.Model):
    class Meta:
        verbose_name = "Site type"
        verbose_name_plural = "Site types"
    name = models.CharField(null=True, blank=True, max_length=255)

    def __str__(self):
        return '{}'.format(self.name)



#####################################################
# SITE TAGS
#####################################################


class SiteTag(models.Model):
    class Meta:
        verbose_name = "Site tag"
        verbose_name_plural = "Site tags"
    name = models.CharField(null=True, blank=True, max_length=255)

    def __str__(self):
        return '{}'.format(self.name)


#####################################################
# SITES
#####################################################


class Site(models.Model):
    class Meta:
        verbose_name = "Site"
        verbose_name_plural = "Sites"

    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(null=True, blank=True, max_length=255)
    address = models.CharField(null=True, blank=True, max_length=255)
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    price = models.FloatField(null=True, blank=True)
    site_type = models.ForeignKey(SiteType, on_delete=models.CASCADE, default=None)
    tags = models.ManyToManyField(SiteTag, related_name='tags')

    def __str__(self):
        return '{}'.format(self.owner)







#####################################################
# RESERVATIONS
#####################################################



class Reservation(models.Model):
    class Meta:
        verbose_name = "Reservation"
        verbose_name_plural = "Reservations"
    site = models.ForeignKey(Site, on_delete=models.DO_NOTHING)
    date_from = models.DateField(null=True, blank=True)
    date_to = models.DateField(null=True, blank=True)
    guest = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    price = models.FloatField(null=True, blank=True)
    def __str__(self):
        return '{}'.format(self.site)
