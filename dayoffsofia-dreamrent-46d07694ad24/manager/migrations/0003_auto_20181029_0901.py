# Generated by Django 2.0 on 2018-10-29 09:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('manager', '0002_auto_20181029_0859'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='phonenumber',
            field=models.CharField(max_length=30, null=True),
        ),
    ]
