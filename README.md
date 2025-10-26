# 📊 Housework Tracker

Webapp theo dõi công việc nhà của các con, tính điểm và thưởng cuối tuần.

## ✨ Tính năng

- 📈 **Biểu đồ tổng điểm**: Xem ai làm được nhiều việc hơn
- ➕➖ **Cộng/trừ điểm dễ dàng**: Mỗi công việc có nút +/- riêng
- 💾 **Lưu trữ trên GitHub Gist**: Dữ liệu được lưu tự động, không mất khi restart
- 🔄 **Reset dữ liệu**: Bắt đầu vòng mới sau khi tổng kết
- ⚙️ **Tùy chỉnh tên**: Đặt tên cho 2 con của bạn

## 📋 Danh mục công việc

| Công việc | Điểm |
|-----------|------|
| Rửa bát   | 10   |
| Quét nhà  | 4    |
| Đổ rác    | 3    |
| Cất cơm   | 1    |
| Cất ghế   | 1    |
| Khác      | 1    |

## 🚀 Hướng dẫn cài đặt

### Bước 1: Tạo GitHub Gist

1. Truy cập https://gist.github.com/
2. Click **"New gist"**
3. Tạo file tên `housework_data.json` với nội dung:
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
4. Chọn **"Create secret gist"** hoặc **"Create public gist"**
5. Copy **GIST_ID** từ URL (phần cuối URL)
   - Ví dụ: `https://gist.github.com/username/a1b2c3d4e5f6g7h8i9j0`
   - GIST_ID là: `a1b2c3d4e5f6g7h8i9j0`

### Bước 2: Tạo GitHub Personal Access Token

1. Truy cập https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Đặt tên: `Housework Tracker`
4. Chọn scope: **✅ gist**
5. Click **"Generate token"**
6. **Copy token** (chỉ hiển thị 1 lần!)

### Bước 3: Cấu hình môi trường

1. Copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```

2. Mở file `.env` và điền thông tin:
```
GIST_ID=a1b2c3d4e5f6g7h8i9j0
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Bước 4: Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### Bước 5: Chạy ứng dụng

```bash
python app.py
```

Truy cập: http://localhost:5000

## 🌐 Deploy lên Render.com

### Bước 1: Push code lên GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/housework-tracker.git
git push -u origin main
```

### Bước 2: Tạo Web Service trên Render

1. Truy cập https://render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository
4. Cấu hình:
   - **Name**: `housework-tracker`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`

### Bước 3: Thêm Environment Variables

Trong Render Dashboard → **Environment**:
- `GIST_ID` = `your_gist_id`
- `GITHUB_TOKEN` = `your_github_token`

### Bước 4: Deploy

Click **"Create Web Service"** và đợi deploy xong!

## 📱 Sử dụng

1. **Cộng điểm**: Click nút **+** bên cạnh công việc
2. **Trừ điểm**: Click nút **−** bên cạnh công việc
3. **Xem biểu đồ**: Tự động cập nhật sau mỗi lần thay đổi
4. **Đổi tên**: Click **⚙️ Cài đặt tên** để đặt tên cho 2 con
5. **Reset**: Click **🔄 Reset dữ liệu** để bắt đầu vòng mới

## 🛠️ Cấu trúc project

```
housework_summary/
├── app.py                  # Flask backend
├── gist_database.py        # Gist API module
├── requirements.txt        # Dependencies
├── .env                    # Environment variables (không commit)
├── .env.example           # Template cho .env
├── templates/
│   └── index.html         # Frontend HTML
├── static/
│   ├── css/
│   │   └── style.css      # Styles
│   └── js/
│       └── app.js         # JavaScript logic
└── README.md              # Hướng dẫn
```

## 🔧 API Endpoints

- `GET /api/data` - Lấy tất cả dữ liệu
- `POST /api/update` - Cập nhật công việc (cộng/trừ)
- `POST /api/reset` - Reset tất cả dữ liệu về 0
- `POST /api/update-names` - Cập nhật tên 2 con

## ⚠️ Lưu ý

- **Không commit file `.env`** vào Git (đã có trong `.gitignore`)
- **GitHub Token** chỉ hiển thị 1 lần, hãy lưu cẩn thận
- **Gist free tier** giới hạn 1MB/file
- **Rate limit**: 5,000 requests/hour (đủ dùng)

## 📝 License

MIT License - Tự do sử dụng và chỉnh sửa!

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Tạo issue hoặc pull request.

---

Made with ❤️ for tracking housework and rewarding kids!

