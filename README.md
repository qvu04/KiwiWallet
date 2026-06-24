# Ví Thông Minh — Ứng dụng Quản Lý Chi Tiêu Cá Nhân

Ứng dụng web full-stack giúp bạn theo dõi thu chi, lập ngân sách, đặt mục tiêu tài chính, nhắc nhở hóa đơn và xem báo cáo trực quan. Toàn bộ giao diện bằng **tiếng Việt**, hỗ trợ **chế độ tối (dark mode)**.

> Bản dựng thử (MVP) theo đúng yêu cầu: backend và frontend tách riêng, cơ sở dữ liệu Supabase (PostgreSQL).

---

## 1. Tính năng

| # | Tính năng | Mô tả |
|---|-----------|-------|
| 1 | Theo dõi & ghi nhận thu chi | Ghi lại mọi khoản thu (lương, thưởng, lợi nhuận) và chi (ăn uống, hóa đơn, mua sắm) kèm ngày, ghi chú |
| 2 | Phân loại giao dịch | Gắn giao dịch vào hạng mục cụ thể (ăn uống, giải trí, nhu yếu phẩm, giáo dục...). Tự tạo sẵn 9 hạng mục mặc định khi đăng ký |
| 3 | Lập kế hoạch ngân sách | Đặt hạn mức chi cho từng hạng mục theo tuần/tháng, cảnh báo khi sắp/đã vượt hạn mức |
| 4 | Mục tiêu tài chính | Lập kế hoạch tiết kiệm (mua xe, du lịch, mua nhà, quỹ khẩn cấp); tự gợi ý số tiền cần tiết kiệm mỗi tháng |
| 5 | Báo cáo trực quan | Biểu đồ tròn (chi theo hạng mục), biểu đồ cột & đường (thu/chi theo tháng), lọc theo khoảng thời gian |
| 6 | Cảnh báo & nhắc nhở | Nhắc hóa đơn định kỳ (tiền nhà, điện nước, thẻ tín dụng); cảnh báo vượt ngân sách trên trang Tổng quan |
| 7 | Dark mode | Nút chuyển sáng/tối có hiệu ứng trượt mượt mà, ghi nhớ lựa chọn |

---

## 2. Công nghệ sử dụng

**Backend**
- Node.js + Express.js — REST API
- Supabase (PostgreSQL) — cơ sở dữ liệu
- JWT + bcryptjs — xác thực & mã hóa mật khẩu

**Frontend**
- React.js (Vite)
- TailwindCSS — giao diện
- Framer Motion (thư viện `motion`) — animation
- React Hook Form — quản lý form
- React Icons — icon
- Recharts — biểu đồ
- Axios + React Router

---

## 3. Cấu trúc thư mục

```
.
├── backend_quanlychitieu/      # API Node/Express
│   ├── db/schema.sql           # Script tạo bảng cho Supabase
│   └── src/
│       ├── config/             # Kết nối Supabase
│       ├── controllers/        # Logic từng nhóm tính năng
│       ├── middleware/         # Xác thực, xử lý lỗi
│       ├── routes/             # Khai báo endpoint
│       └── index.js            # Khởi động server
│
├── frontend_quanlychitieu/     # Giao diện React
│   └── src/
│       ├── api/                # Cấu hình axios
│       ├── components/         # Layout, Modal, DarkModeSwitch...
│       ├── context/            # AuthContext, ThemeContext
│       ├── pages/              # Dashboard, Transactions, Budgets...
│       └── utils/              # Định dạng tiền tệ, icon
│
└── README.md
```

---

## 4. Hướng dẫn cài đặt & chạy

### Yêu cầu
- Node.js phiên bản 18 trở lên
- Một tài khoản Supabase miễn phí (https://supabase.com)

### Bước 1 — Tạo cơ sở dữ liệu Supabase
1. Tạo một project mới trên Supabase.
2. Vào **SQL Editor**, mở file `backend_quanlychitieu/db/schema.sql`, dán toàn bộ nội dung và bấm **Run** để tạo bảng.
3. Vào **Project Settings → API**, lấy 2 giá trị:
   - `Project URL`
   - `service_role` key (mục Project API keys — đây là key bí mật, chỉ dùng ở backend)

### Bước 2 — Chạy Backend
```bash
cd backend_quanlychitieu
cp .env.example .env        # tạo file .env
# Mở .env và điền: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
npm install
npm run dev                 # chạy ở http://localhost:4000
```

### Bước 3 — Chạy Frontend
```bash
cd frontend_quanlychitieu
cp .env.example .env        # mặc định trỏ tới http://localhost:4000/api
npm install
npm run dev                 # mở http://localhost:5173
```

### Bước 4 — Sử dụng
Mở trình duyệt tại `http://localhost:5173`, **đăng ký** tài khoản mới rồi bắt đầu thêm giao dịch. Hệ thống tự tạo sẵn các hạng mục thu/chi mặc định cho bạn.

---

## 5. Danh sách API chính

| Phương thức | Endpoint | Chức năng |
|-------------|----------|-----------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| GET  | `/api/auth/me` | Thông tin người dùng |
| GET/POST/PUT/DELETE | `/api/categories` | Quản lý hạng mục |
| GET/POST/PUT/DELETE | `/api/transactions` | Quản lý giao dịch |
| GET/POST/PUT/DELETE | `/api/budgets` | Quản lý ngân sách (kèm số đã chi) |
| GET/POST/PUT/DELETE | `/api/goals` | Quản lý mục tiêu |
| GET/POST/PUT/DELETE | `/api/reminders` | Quản lý nhắc nhở |
| GET | `/api/reports/summary` | Tổng hợp dữ liệu cho báo cáo |

Tất cả endpoint (trừ đăng ký/đăng nhập) yêu cầu gửi kèm header `Authorization: Bearer <token>`.

---

## 6. Ghi chú về cơ sở dữ liệu

Yêu cầu gốc đề cập cả Supabase lẫn MongoDB. Bản này dùng **Supabase (PostgreSQL)** theo lựa chọn của bạn — tận dụng dữ liệu quan hệ (giao dịch ↔ hạng mục) và khả năng truy vấn tổng hợp mạnh mẽ cho phần báo cáo. Backend dùng `service_role key` nên truy vấn trực tiếp, không phụ thuộc Row Level Security; nếu triển khai thực tế nên bật RLS hoặc giữ key này tuyệt đối bí mật ở phía server.

---

## 7. Gợi ý hướng kiếm tiền (tham khảo)

Đây là bản MVP để kiểm chứng ý tưởng. Một vài hướng thương mại hóa phổ biến cho ứng dụng dạng này: gói **Premium** (mở khóa báo cáo nâng cao, xuất Excel/PDF, không giới hạn mục tiêu), **đồng bộ ngân hàng** tự động, ứng dụng di động, hoặc bản **B2B** cho nhóm/gia đình. Trước khi đầu tư sâu, nên thử nghiệm với người dùng thật để đo nhu cầu. Lưu ý: đây là thông tin tham khảo, không phải lời khuyên tài chính.
