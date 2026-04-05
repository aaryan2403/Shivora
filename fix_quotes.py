import os
import re

files_to_check = [
    'src/app/collections/page.tsx', 'src/app/contact/page.tsx', 
    'src/app/faq/page.tsx', 'src/app/heritage/page.tsx', 
    'src/app/high-jewelry/page.tsx', 'src/app/privacy-policy/page.tsx', 
    'src/app/search/page.tsx', 'src/app/terms-of-service/page.tsx',
    'src/components/Footer.tsx', 'src/app/page.tsx'
]

replacements = {
    "can't": "can&apos;t",
    "don't": "don&apos;t",
    "You're": "You&apos;re",
    "we're": "we&apos;re",
    "We've": "We&apos;ve",
    "isn't": "isn&apos;t",
    "it's": "it&apos;s",
    "It's": "It&apos;s",
    "world's": "world&apos;s",
    "master's": "master&apos;s",
    "nature's": "nature&apos;s",
    "Let's": "Let&apos;s",
    "women's": "women&apos;s",
    "men's": "men&apos;s",
    "brand's": "brand&apos;s",
    "today's": "today&apos;s",
    "\'": "&apos;",
    '"': "&quot;" # We shouldn't replace all double quotes, only ones in text, so maybe skip double quotes
}

# Actually, doing direct replacement of ' inside > < might be better
for file_path in files_to_check:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Only replace specific words to be safe
        safe_replacements = {
            "can't": "can&apos;t",
            "don't": "don&apos;t",
            "You're": "You&apos;re",
            "we're": "we&apos;re",
            "we've": "we&apos;ve",
            "We've": "We&apos;ve",
            "isn't": "isn&apos;t",
            "it's": "it&apos;s",
            "It's": "It&apos;s",
            "world's": "world&apos;s",
            "master's": "master&apos;s",
            "nature's": "nature&apos;s",
            "Let's": "Let&apos;s",
            "women's": "women&apos;s",
            "men's": "men&apos;s",
            "brand's": "brand&apos;s",
            "today's": "today&apos;s",
            "craftsmen's": "craftsmen&apos;s",
            "Shivora's": "Shivora&apos;s"
        }
        
        new_content = content
        for k, v in safe_replacements.items():
            new_content = new_content.replace(k, v)
            
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Fixed quotes in {file_path}')
