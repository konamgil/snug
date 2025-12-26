#!/usr/bin/env python3
"""
Simple script to guide manual screenshot saving.
Since we have the screenshots displayed, you can manually save them.
"""

import os

OUTPUT_DIR = r'C:\Users\User\workspace\snug\apps\web\public\images\host-intro'

images = [
    'pain-point-1.png - man at desk with worried expression',
    'pain-point-2.png - woman in bed at night with laptop',
    'value-illustration.png - apartment building illustration',
    'dashboard-preview.png - host dashboard screenshot',
    'dashboard-circle.png - dashboard in circle',
    'operations-preview.png - operations management screenshot',
    'eligibility-1.png - short-term accommodation card with woman',
    'eligibility-2.png - long-term residential card with man',
]

# Create directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

print(f"Output directory created: {OUTPUT_DIR}\n")
print("Images to save:")
for i, img in enumerate(images, 1):
    print(f"{i}. {img}")

print(f"\nSave each screenshot to: {OUTPUT_DIR}")
