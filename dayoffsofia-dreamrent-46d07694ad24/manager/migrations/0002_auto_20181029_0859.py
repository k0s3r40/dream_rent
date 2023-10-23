# Generated by Django 2.0 on 2018-10-29 08:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('manager', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='GUEST',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='HOST',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='id_pic',
            field=models.ImageField(default=None, upload_to='media/user_ids/'),
        ),
        migrations.AddField(
            model_name='user',
            name='phonenumber',
            field=models.CharField(default=None, max_length=30),
        ),
    ]
