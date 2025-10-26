# ✨ Danh sách tính năng Housework Tracker

## 📊 Tính năng chính

### 1. 📈 Biểu đồ tổng điểm
- **Stacked bar chart** hiển thị điểm từng loại công việc
- **Legend chi tiết** với tên công việc + điểm/lần
- **Responsive** trên desktop và mobile
- **Tự động cập nhật** khi thay đổi dữ liệu

### 2. 📋 Bảng chi tiết công việc
- Hiển thị **số lần làm** từng công việc
- Hiển thị **tổng điểm** từ công việc đó
- **Dễ đọc** trên mobile
- **Hover effect** để dễ nhìn

### 3. ➕➖ Cộng/trừ điểm
- **Nút + và -** cho từng công việc
- **Lưu tự động** lên Gist mỗi lần nhấn
- **Không cho phép âm** (không thể trừ dưới 0)
- **Hiệu ứng animation** khi cập nhật

### 4. 👥 Hai panels cho 2 con
- **Panel riêng** cho mỗi con
- **Màu sắc khác nhau** (xanh tím vs hồng đỏ)
- **Tổng điểm hiển thị** ở header
- **Responsive** trên mobile

### 5. ⚙️ Cài đặt tên
- **Đổi tên 2 con** qua modal
- **Lưu vào Gist** tự động
- **Cập nhật toàn bộ giao diện** khi thay đổi

### 6. ➕ Quản lý công việc (NEW!)
- **Thêm công việc mới** động
- **Xóa công việc** không cần dùng
- **Không cần code** hay commit
- **Lưu trực tiếp vào Gist**

### 7. 🔄 Reset dữ liệu
- **Reset tất cả về 0** để bắt đầu vòng mới
- **Xác nhận trước khi reset**
- **Lưu vào Gist** ngay lập tức

### 8. 🔄 Tải lại dữ liệu
- **Nút Tải lại** để refresh dữ liệu từ Gist
- **Hữu ích** khi có người khác cập nhật
- **Cập nhật biểu đồ** tự động

### 9. 📱 Responsive Design
- **Desktop**: Giao diện đầy đủ
- **Tablet**: Tự động điều chỉnh
- **Mobile**: Tối ưu cho màn hình nhỏ
  - Chart cao hơn, legend không bị che
  - Bảng chi tiết dễ đọc
  - Buttons nhỏ gọn nhưng dễ nhấn

### 10. 💾 Lưu trữ trên GitHub Gist
- **Không mất dữ liệu** khi restart
- **Miễn phí** (GitHub free tier)
- **Tự động sync** giữa các thiết bị
- **Lịch sử thay đổi** trên GitHub

---

## 🎯 Danh mục công việc mặc định

| Công việc | Điểm | Mô tả |
|-----------|------|-------|
| Rửa bát | 10 | Công việc nặng nhất |
| Quét nhà | 4 | Công việc vừa |
| Đổ rác | 3 | Công việc vừa |
| Cất cơm | 1 | Công việc nhẹ |
| Cất ghế | 1 | Công việc nhẹ |
| Khác | 1 | Công việc khác |

---

## 🔧 API Endpoints

### GET /api/data
Lấy tất cả dữ liệu
```json
{
  "status": "success",
  "data": {
    "children": {...},
    "task_points": {...},
    "task_labels": {...}
  }
}
```

### POST /api/update
Cập nhật công việc (cộng/trừ)
```json
{
  "child_id": "child1",
  "task_id": "rua_bat",
  "action": "increment"
}
```

### POST /api/reset
Reset tất cả dữ liệu về 0

### POST /api/update-names
Cập nhật tên 2 con
```json
{
  "child1_name": "Bin",
  "child2_name": "Tho"
}
```

### POST /api/add-task
Thêm công việc mới
```json
{
  "task_id": "lau_ban",
  "task_name": "Lau bàn",
  "points": 5
}
```

### POST /api/delete-task
Xóa công việc
```json
{
  "task_id": "lau_ban"
}
```

---

## 🎨 Giao diện

### Màu sắc
- **Header**: Gradient xanh tím (667eea → 764ba2)
- **Panel Con 1**: Gradient xanh tím
- **Panel Con 2**: Gradient hồng đỏ (f093fb → f5576c)
- **Buttons +**: Xanh lá (11998e → 38ef7d)
- **Buttons -**: Đỏ cam (ee0979 → ff6a00)

### Font
- **Header**: Display 4 (2rem trên mobile)
- **Task name**: 0.95rem (desktop), 0.9rem (mobile)
- **Task points**: 0.8rem (desktop), 0.75rem (mobile)
- **Buttons**: 1rem (desktop), 0.9rem (mobile)

---

## 📊 Dữ liệu JSON

```json
{
  "children": {
    "child1": {
      "name": "Bin",
      "tasks": {
        "rua_bat": 5,
        "quet_nha": 2,
        ...
      }
    },
    "child2": {
      "name": "Tho",
      "tasks": {
        "rua_bat": 3,
        "quet_nha": 1,
        ...
      }
    }
  },
  "task_points": {
    "rua_bat": 10,
    "quet_nha": 4,
    ...
  },
  "task_labels": {
    "rua_bat": "Rửa bát",
    "quet_nha": "Quét nhà",
    ...
  },
  "last_updated": "2025-10-26T12:43:10"
}
```

---

## 🚀 Deployment

### Local
```bash
python app.py
# Truy cập: http://localhost:5000
```

### Render.com
1. Push code lên GitHub
2. Connect GitHub repo trên Render
3. Thêm environment variables: GIST_ID, GITHUB_TOKEN
4. Deploy!

---

## 📱 Hỗ trợ thiết bị

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Tablet (iPad, Android tablet)
- ✅ Mobile (iPhone, Android phone)
- ✅ Responsive design tự động

---

## 🔐 Bảo mật

- **GitHub Token**: Lưu trong environment variables
- **Gist ID**: Lưu trong environment variables
- **Không lưu password** trong code
- **HTTPS** khi deploy trên Render

---

## 📈 Hiệu suất

- **Load time**: < 1 giây
- **Update time**: < 500ms
- **API response**: < 1 giây
- **Chart render**: < 500ms

---

## 🎯 Roadmap (Tương lai)

- [ ] Export dữ liệu ra Excel
- [ ] Thống kê tuần/tháng
- [ ] Thưởng tự động
- [ ] Notification khi ai đó cập nhật
- [ ] Dark mode
- [ ] Multi-language

---

**Phiên bản hiện tại: 1.0.0**
**Cập nhật lần cuối: 26/10/2025**

