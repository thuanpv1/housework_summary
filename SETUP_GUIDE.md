# 🚀 HƯỚNG DẪN SETUP NHANH

## Bước 1: Tạo GitHub Gist (5 phút)

### 1.1. Truy cập GitHub Gist
- Mở trình duyệt: https://gist.github.com/
- Đăng nhập GitHub (nếu chưa)

### 1.2. Tạo Gist mới
1. Click nút **"New gist"** (góc phải trên)
2. **Filename**: `housework_data.json`
3. **Content**: Copy đoạn JSON bên dưới:

```json
{
  "children": {
    "child1": {
      "name": "Con 1",
      "tasks": {
        "rua_bat": 0,
        "quet_nha": 0,
        "cat_ghe": 0,
        "cat_com": 0,
        "do_rac": 0,
        "khac": 0
      }
    },
    "child2": {
      "name": "Con 2",
      "tasks": {
        "rua_bat": 0,
        "quet_nha": 0,
        "cat_ghe": 0,
        "cat_com": 0,
        "do_rac": 0,
        "khac": 0
      }
    }
  },
  "task_points": {
    "rua_bat": 10,
    "quet_nha": 4,
    "cat_ghe": 1,
    "cat_com": 1,
    "do_rac": 3,
    "khac": 1
  },
  "last_updated": "2025-10-26T10:00:00"
}
```

4. Chọn **"Create secret gist"** (hoặc public nếu muốn)
5. Click **"Create gist"**

### 1.3. Lấy GIST_ID
- Sau khi tạo xong, xem URL trên thanh địa chỉ
- Ví dụ: `https://gist.github.com/username/a1b2c3d4e5f6g7h8i9j0`
- **GIST_ID** = `a1b2c3d4e5f6g7h8i9j0` (phần cuối URL)
- **LƯU LẠI GIST_ID NÀY!**

---

## Bước 2: Tạo GitHub Personal Access Token (3 phút)

### 2.1. Truy cập Settings
- Mở: https://github.com/settings/tokens
- Hoặc: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

### 2.2. Tạo Token mới
1. Click **"Generate new token"** → **"Generate new token (classic)"**
2. **Note**: `Housework Tracker App`
3. **Expiration**: `No expiration` (hoặc chọn thời gian bạn muốn)
4. **Select scopes**: Chỉ cần tick ✅ **gist**
5. Scroll xuống, click **"Generate token"**

### 2.3. Copy Token
- Token sẽ hiển thị: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **COPY NGAY** (chỉ hiển thị 1 lần duy nhất!)
- **LƯU VÀO NOTEPAD** để dùng ở bước sau

⚠️ **QUAN TRỌNG**: Nếu mất token này, bạn phải tạo lại từ đầu!

---

## Bước 3: Cấu hình App (2 phút)

### 3.1. Tạo file .env
Trong folder `D:\Study\housework_summary`, tạo file tên `.env` với nội dung:

```
GIST_ID=a1b2c3d4e5f6g7h8i9j0
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Thay thế**:
- `a1b2c3d4e5f6g7h8i9j0` → GIST_ID của bạn (từ Bước 1.3)
- `ghp_xxx...` → Token của bạn (từ Bước 2.3)

### 3.2. Cài đặt dependencies
Mở terminal trong folder `D:\Study\housework_summary`:

```bash
pip install -r requirements.txt
```

---

## Bước 4: Chạy App (1 phút)

### 4.1. Khởi động server
```bash
python app.py
```

### 4.2. Mở trình duyệt
Truy cập: http://localhost:5000

---

## ✅ Checklist

- [ ] Đã tạo GitHub Gist
- [ ] Đã copy GIST_ID
- [ ] Đã tạo GitHub Personal Access Token
- [ ] Đã copy Token
- [ ] Đã tạo file `.env` với đúng GIST_ID và GITHUB_TOKEN
- [ ] Đã chạy `pip install -r requirements.txt`
- [ ] Đã chạy `python app.py`
- [ ] Đã mở http://localhost:5000 và thấy giao diện

---

## 🐛 Troubleshooting

### Lỗi: "Database chưa được cấu hình"
- Kiểm tra file `.env` đã tạo chưa
- Kiểm tra GIST_ID và GITHUB_TOKEN có đúng không

### Lỗi: "Không thể tải dữ liệu"
- Kiểm tra GITHUB_TOKEN có quyền `gist` chưa
- Kiểm tra GIST_ID có đúng không
- Thử tạo lại token mới

### Lỗi: "Module not found"
- Chạy lại: `pip install -r requirements.txt`

### App không hiển thị dữ liệu
- Mở Developer Tools (F12) → Console để xem lỗi
- Kiểm tra file `housework_data.json` trong Gist có đúng format không

---

## 📞 Cần trợ giúp?

1. Kiểm tra file `README.md` để xem hướng dẫn chi tiết
2. Xem logs trong terminal khi chạy `python app.py`
3. Kiểm tra Console trong trình duyệt (F12)

---

**Chúc bạn setup thành công! 🎉**

