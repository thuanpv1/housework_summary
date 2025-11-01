#!/usr/bin/env python3
"""
Script để sửa dữ liệu alert trong Gist
"""

import os
import json
from dotenv import load_dotenv
from alert_database import AlertDatabase

# Load environment variables
load_dotenv()

GIST_ID = os.environ.get('GIST_ID')
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
ALERT_GIST_ID = os.environ.get('ALERT_GIST_ID', GIST_ID)

print(f"ALERT_GIST_ID: {ALERT_GIST_ID}")

# Kiểm tra alert database
alert_db = AlertDatabase(ALERT_GIST_ID, GITHUB_TOKEN)

print("\n📊 Dữ liệu hiện tại trong Gist:")
data = alert_db.read_data()
print(json.dumps(data, indent=2, ensure_ascii=False))

# Sửa dữ liệu - xóa symbol có 'c' ở cuối
print("\n🔧 Sửa dữ liệu...")
new_data = {}

for symbol, alert_info in data.items():
    # Xóa 'c' ở cuối nếu có
    clean_symbol = symbol.rstrip('c') if symbol.endswith('c') else symbol
    new_data[clean_symbol] = alert_info
    print(f"  {symbol} → {clean_symbol}")

print("\n📊 Dữ liệu sau khi sửa:")
print(json.dumps(new_data, indent=2, ensure_ascii=False))

# Lưu lại
if alert_db.write_data(new_data, description="Fix: Remove 'c' suffix from symbols"):
    print("\n✅ Đã sửa và lưu thành công!")
else:
    print("\n❌ Lỗi khi lưu!")

