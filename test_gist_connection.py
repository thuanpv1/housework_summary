"""
Script để test kết nối với GitHub Gist
Chạy script này để kiểm tra GIST_ID và GITHUB_TOKEN có hoạt động không
"""

from gist_database import GistDatabase
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def test_connection():
    """Test kết nối với Gist"""
    
    print("=" * 60)
    print("🔍 KIỂM TRA KẾT NỐI GITHUB GIST")
    print("=" * 60)
    
    # Lấy credentials
    gist_id = os.environ.get('GIST_ID')
    github_token = os.environ.get('GITHUB_TOKEN')
    
    # Kiểm tra credentials
    print("\n1️⃣ Kiểm tra credentials...")
    if not gist_id:
        print("❌ GIST_ID chưa được cấu hình trong file .env")
        return False
    else:
        print(f"✅ GIST_ID: {gist_id}")
    
    if not github_token:
        print("❌ GITHUB_TOKEN chưa được cấu hình trong file .env")
        return False
    else:
        print(f"✅ GITHUB_TOKEN: {github_token[:10]}...{github_token[-4:]}")
    
    # Khởi tạo database
    print("\n2️⃣ Khởi tạo Gist Database...")
    db = GistDatabase(gist_id, github_token)
    print("✅ Database đã được khởi tạo")
    
    # Test đọc dữ liệu
    print("\n3️⃣ Test đọc dữ liệu từ Gist...")
    try:
        data = db.read_data()
        print("✅ Đọc dữ liệu thành công!")
        print(f"   - Số con: {len(data.get('children', {}))}")
        print(f"   - Số loại công việc: {len(data.get('task_points', {}))}")
        
        # Hiển thị tên các con
        if 'children' in data:
            for child_id, child_data in data['children'].items():
                print(f"   - {child_data.get('name', 'N/A')}")
        
    except Exception as e:
        print(f"❌ Lỗi khi đọc dữ liệu: {e}")
        return False
    
    # Test ghi dữ liệu
    print("\n4️⃣ Test ghi dữ liệu vào Gist...")
    try:
        # Thử cập nhật timestamp
        if db.write_data(data, description="Test connection from script"):
            print("✅ Ghi dữ liệu thành công!")
        else:
            print("❌ Không thể ghi dữ liệu")
            return False
    except Exception as e:
        print(f"❌ Lỗi khi ghi dữ liệu: {e}")
        return False
    
    # Kết luận
    print("\n" + "=" * 60)
    print("🎉 TẤT CẢ TESTS ĐỀU PASS!")
    print("=" * 60)
    print("\n✅ Bạn có thể chạy app bằng lệnh: python app.py")
    print("✅ Sau đó truy cập: http://localhost:5000")
    print("\n")
    
    return True

if __name__ == '__main__':
    try:
        test_connection()
    except KeyboardInterrupt:
        print("\n\n⚠️ Đã hủy test")
    except Exception as e:
        print(f"\n\n❌ Lỗi không mong đợi: {e}")

