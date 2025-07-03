# Quy tắc đóng góp (Contribution Guidelines)

## 📂 Đặt tên nhánh (Branch Naming)
- `feature/<ten-tinh-nang>` – Thêm tính năng
- `bugfix/<ten-bug>` – Sửa bug
- `hotfix/<ten-hotfix>` – Sửa gấp ở production
- `refactor/<mo-ta>` – Refactor không thay đổi logic
- `test/<mo-ta>` – Viết/tối ưu test

## 📝 Quy tắc commit (Conventional Commits)
- `feat: Mô tả tính năng mới`
- `fix: Mô tả lỗi đã sửa`
- `refactor: Tối ưu mã, không thay đổi logic`
- `docs: Cập nhật tài liệu`
- `style: Thay đổi định dạng mã (format)`
- `test: Thêm/sửa test`
- `chore: Công việc phụ trợ (không ảnh hưởng logic)`

**Ví dụ:**
```
feat: thêm API đăng nhập người dùng
fix: sửa lỗi validate email khi tạo tài khoản
refactor: tách logic xử lý đơn hàng ra service riêng
```

## 🚀 Pull Request
- PR vào `develop`, không push thẳng `main`
- Tiêu đề rõ ràng: `feat: tạo API profile user`
- Miêu tả: Tính năng gì, ảnh hưởng chỗ nào, cần test gì?
- Gán người review nếu có

## 🔀 Merge Strategy