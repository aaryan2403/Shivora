import urllib.request
import re
url = 'https://unsplash.com/s/photos/jewelry'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        ids = re.findall(r'"id":"([a-zA-Z0-9_-]{11})"', html)
        print(list(set(ids))[:20])
except Exception as e:
    print(e)
