DEBUG = True

INTERNAL_IPS = ('127.0.0.1',)

ADMINS = (
    ('slavov', 'slavov17@gmail.com'),
    ('ceco', 'dimitrovovich@gmail.com')
)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'dreamrent',
        'USER': 'dreamrent',
        'PASSWORD': 'dreamrent',
        'HOST': 'localhost',
    }
}


