# 📋 Hướng dẫn Quản lý Công việc

## ✨ Tính năng mới: Thêm/Xóa công việc động

Bạn **KHÔNG CẦN** chỉnh code hay commit lên Git để thêm công việc mới. Tất cả được lưu trực tiếp vào Gist!

---

## 🎯 Cách sử dụng

### 1️⃣ **Mở modal Quản lý công việc**

Trên giao diện chính, click nút:
```
➕ Quản lý công việc
```

### 2️⃣ **Xem công việc hiện tại**

Modal sẽ hiển thị danh sách tất cả công việc:
```
📋 Công việc hiện tại:
├─ Rửa bát (10 điểm/lần) [🗑️ Xóa]
├─ Quét nhà (4 điểm/lần) [🗑️ Xóa]
├─ Đổ rác (3 điểm/lần) [🗑️ Xóa]
├─ Cất cơm (1 điểm/lần) [🗑️ Xóa]
├─ Cất ghế (1 điểm/lần) [🗑️ Xóa]
└─ Khác (1 điểm/lần) [🗑️ Xóa]
```

### 3️⃣ **Thêm công việc mới**

Điền thông tin:
- **Tên công việc**: Ví dụ: "Lau bàn", "Rửa quần áo", "Nấu cơm"
- **Điểm**: Số điểm cho công việc đó (mặc định: 1)

Ví dụ:
```
Tên công việc: Lau bàn
Điểm: 5
```

Sau đó click: **➕ Thêm công việc**

### 4️⃣ **Xóa công việc**

Click nút **🗑️ Xóa** bên cạnh công việc muốn xóa.

Hệ thống sẽ hỏi xác nhận trước khi xóa.

---

## 📝 Ví dụ thực tế

### Thêm công việc "Lau bàn" (5 điểm)

1. Click **➕ Quản lý công việc**
2. Nhập:
   - Tên: `Lau bàn`
   - Điểm: `5`
3. Click **➕ Thêm công việc**
4. Thấy thông báo: ✅ Đã thêm công việc thành công!
5. Trang sẽ tự động reload
6. Công việc "Lau bàn" sẽ xuất hiện trong danh sách của cả 2 con

### Xóa công việc "Khác"

1. Click **➕ Quản lý công việc**
2. Tìm "Khác (1 điểm/lần)"
3. Click **🗑️ Xóa**
4. Xác nhận: "Bạn có chắc chắn muốn xóa công việc này?"
5. Click **OK**
6. Thấy thông báo: ✅ Đã xóa công việc thành công!
7. Công việc sẽ biến mất khỏi danh sách

---

## 💾 Dữ liệu được lưu ở đâu?

- **Tất cả công việc** được lưu trong file `housework_data.json` trên **GitHub Gist**
- **Không cần commit** hay push code
- **Tự động cập nhật** mỗi khi thêm/xóa công việc
- **Dữ liệu không bao giờ mất** (lưu trên GitHub)

---

## ⚠️ Lưu ý quan trọng

### ✅ Được phép:
- Thêm công việc mới bất kỳ lúc nào
- Xóa công việc không cần dùng nữa
- Thay đổi tên công việc (xóa cái cũ, thêm cái mới)
- Thay đổi điểm của công việc (xóa cái cũ, thêm cái mới với điểm khác)

### ❌ Không được:
- Không cần chỉnh code
- Không cần commit lên Git
- Không cần restart app
- Không cần làm gì phức tạp

---

## 🔄 Quy trình thêm công việc

```
Bạn nhập tên + điểm
        ↓
Click "Thêm công việc"
        ↓
App gửi request tới server
        ↓
Server thêm vào Gist
        ↓
Gist lưu dữ liệu
        ↓
App tự động reload
        ↓
Công việc mới xuất hiện
```

---

## 🎨 Giao diện

### Modal Quản lý công việc

```
┌─────────────────────────────────────┐
│ ➕ Quản lý công việc                 │
├─────────────────────────────────────┤
│ 📋 Công việc hiện tại:              │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Rửa bát                         │ │
│ │ 10 điểm/lần          [🗑️ Xóa]  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Quét nhà                        │ │
│ │ 4 điểm/lần           [🗑️ Xóa]  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ ➕ Thêm công việc mới:              │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Tên công việc (vd: Lau bàn)    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌──────────────┐                    │
│ │ Điểm: [1]    │                    │
│ └──────────────┘                    │
│                                     │
│ [➕ Thêm công việc]                 │
│                                     │
├─────────────────────────────────────┤
│ [Đóng]                              │
└─────────────────────────────────────┘
```

---

## 🆘 Troubleshooting

### Lỗi: "Công việc này đã tồn tại"
- Bạn đã thêm công việc này rồi
- Xóa cái cũ rồi thêm lại nếu muốn thay đổi

### Lỗi: "Không thể thêm công việc"
- Kiểm tra kết nối internet
- Kiểm tra GIST_ID và GITHUB_TOKEN có đúng không
- Thử reload trang

### Công việc không xuất hiện
- Refresh trang (F5)
- Kiểm tra modal xem công việc có trong danh sách không
- Kiểm tra console (F12) xem có lỗi không

---

## 📞 Cần giúp?

Xem file `README.md` để biết thêm chi tiết về cách setup và sử dụng app.

---

**Chúc bạn quản lý công việc nhà vui vẻ! 🎉**

