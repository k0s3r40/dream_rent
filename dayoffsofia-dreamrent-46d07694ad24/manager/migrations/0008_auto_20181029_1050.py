# Generated by Django 2.0 on 2018-10-29 10:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('manager', '0007_paymentmethod_site_siteoption_siteoptionlist_withdrawmethod'),
    ]

    operations = [
        migrations.CreateModel(
            name='SiteOptionItem',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=255, null=True)),
                ('data_type', models.CharField(choices=[('boolean', 'Boolean'), ('list', 'List')], max_length=255)),
                ('site_option', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='manager.SiteOption')),
            ],
            options={
                'verbose_name_plural': 'Site option lists',
                'verbose_name': 'Site option list',
            },
        ),
        migrations.RemoveField(
            model_name='siteoptionlist',
            name='site_option',
        ),
        migrations.DeleteModel(
            name='SiteOptionList',
        ),
    ]