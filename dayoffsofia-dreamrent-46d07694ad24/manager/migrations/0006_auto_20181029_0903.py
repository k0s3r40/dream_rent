# Generated by Django 2.0 on 2018-10-29 09:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('manager', '0005_auto_20181029_0903'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='id_pic',
            field=models.ImageField(default=None, upload_to='user_ids/'),
        ),
    ]
