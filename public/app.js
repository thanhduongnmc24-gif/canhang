document.addEventListener('DOMContentLoaded', () => {

    // --- BẮT ĐẦU CODE CẬP NHẬT Ô A5 ---
    
    // 1. Lấy các element
    const selectKip = document.getElementById('select-kip');
    const selectNhaCan = document.getElementById('select-nha-can');
    const inputA5 = document.getElementById('input-a5');

    // 2. Hàm để cập nhật ô A5
    function updateA5() {
        if (!selectKip || !selectNhaCan || !inputA5) {
            console.error("Không tìm thấy element kíp, nhà cân hoặc input A5.");
            return;
        }
        
        const kipValue = selectKip.value;
        const nhaCanValue = selectNhaCan.value;
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1; // Tháng bắt đầu từ 0
        const year = today.getFullYear();
        const dateString = `Kíp ${kipValue} Ngày ${day} tháng ${month} năm ${year}_NC số: ${nhaCanValue}`;
        
        inputA5.value = dateString;
    }

    if (selectKip) selectKip.addEventListener('change', updateA5);
    if (selectNhaCan) selectNhaCan.addEventListener('change', updateA5);
    updateA5(); // Chạy 1 lần khi tải trang

    // --- KẾT THÚC CODE CẬP NHẬT Ô A5 ---

    // --- BẮT ĐẦU CODE CẬP NHẬT Ô GHI CHÚ (M9) ---

    // 1. Lấy thêm element
    const inputNhamay = document.getElementById('input-nhamay');
    const inputXuong = document.getElementById('input-xuong');
    const inputNoinhan = document.getElementById('input-noinhan');
    const inputM9 = document.getElementById('input-m9'); // Ô Ghi chú

    // 2. Hàm để cập nhật ô Ghi chú
    function updateGhiChu() {
        if (!inputNhamay || !inputXuong || !selectNhaCan || !inputNoinhan || !inputM9) {
            console.error("Không tìm thấy element nhà máy, xưởng, nhà cân, nơi nhận hoặc ghi chú.");
            return;
        }

        const nhaMayValue = inputNhamay.value;
        const xuongValue = inputXuong.value;
        const nhaCanValue = selectNhaCan.value; // Lấy value (NC1, NC2...)
        const noiNhanValue = inputNoinhan.value;

        const ghiChuString = `${nhaMayValue}(${xuongValue}) =>${nhaCanValue}=>${noiNhanValue}`;
        inputM9.value = ghiChuString;
    }

    // 3. Gắn sự kiện lắng nghe
    if (inputNhamay) inputNhamay.addEventListener('input', updateGhiChu);
    if (inputXuong) inputXuong.addEventListener('input', updateGhiChu);
    if (selectNhaCan) selectNhaCan.addEventListener('change', updateGhiChu); 
    if (inputNoinhan) inputNoinhan.addEventListener('input', updateGhiChu);
    updateGhiChu(); // Chạy 1 lần khi tải trang

    // --- KẾT THÚC CODE CẬP NHẬT Ô GHI CHÚ ---


    // --- CODE CHO CÁC NÚT BẤM ---
    const btnXlsx = document.getElementById('btn-xlsx');
    const btnPdf = document.getElementById('btn-pdf');
    const statusEl = document.getElementById('status');
    const btnCopy = document.getElementById('btn-copy'); 

    if(btnXlsx) btnXlsx.addEventListener('click', () => generateFile('xlsx'));
    if(btnPdf) btnPdf.addEventListener('click', () => generateFile('pdf'));
    if(btnCopy) btnCopy.addEventListener('click', copyData); 

    async function generateFile(format) {
        if (statusEl) {
            statusEl.textContent = `Đang xử lý tạo file ${format.toUpperCase()}, vui lòng chờ...`;
            statusEl.style.color = 'blue';
        }

        // 1. Lấy dữ liệu (ĐÚNG THEO ID CỦA ĐẠI CA)
        const data = {
            a5: document.getElementById('input-a5').value, 
            b9: document.getElementById('input-b9').value, // Nội dung
            c9: document.getElementById('input-c9').value, // Chứng từ
            d9: document.getElementById('input-d9').value, // Chủng loại
            e9: document.getElementById('input-e9').value, // Khách hàng
            f9: document.getElementById('input-f9').value, // Người đại diện
            g9: document.getElementById('input-g9').value, // CCCD
            h9: document.getElementById('input-h9').value, // BSX
            i9: document.getElementById('input-i9').value, // ĐVVC
            j9: document.getElementById('input-j9').value, // Số lô
            k9: document.getElementById('input-k9').value, // Khối lượng
            l9: document.getElementById('input-l9').value, // Mục đích
            m9: document.getElementById('input-m9').value, // Ghi chú (Đã được JS cập nhật)
            truongKip: document.getElementById('input-truongkip').value, 
        };

        try {
            // 2. Gọi API đến backend
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data, format }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Lỗi máy chủ: ${errorText}`);
            }

            // 3. Nhận file về dưới dạng 'blob'
            const blob = await response.blob();

            // 4. Tạo link tải về
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            
            // Tên file động
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0'); 
            const year = now.getFullYear();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const ngayThangNam = `${day}_${month}_${year}`;
            const thoiGian = `${hours}h${minutes}p${seconds}s`;
            let bsx = data.h9 || 'NoBSX'; 
            bsx = bsx.replace(/[^a-z0-9_-]/gi, '').trim(); 
            a.download = `NhuCauCanHang_${ngayThangNam}_${bsx}_${thoiGian}.${format}`;

            document.body.appendChild(a);
            
            a.click(); 

            // 5. Dọn dẹp
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            if (statusEl) {
                statusEl.textContent = 'Hoàn thành! Đã tải file.';
                statusEl.style.color = 'green';
            }

        } catch (error) {
            console.error('Lỗi khi tạo file:', error);
            if (statusEl) {
                statusEl.textContent = `Lỗi: ${error.message}`;
                statusEl.style.color = 'red';
            }
        }
    }
    
    // --- HÀM MỚI ĐỂ COPY DỮ LIỆU ---
    function copyData() {
        try {
            // 1. Lấy tất cả giá trị
            const nhaCanSelect = document.getElementById('select-nha-can');
            const nhaCanText = nhaCanSelect.options[nhaCanSelect.selectedIndex].text; // Lấy "Nhà cân 1"
            
            const truongKip = document.getElementById('input-truongkip').value;
            const cccd = document.getElementById('input-g9').value;
            const khachHang = document.getElementById('input-e9').value;
            const noiDung = document.getElementById('input-b9').value;
            const chungLoai = document.getElementById('input-d9').value;
            const daiDien = document.getElementById('input-f9').value;
            const bsx = document.getElementById('input-h9').value;
            const donViVanChuyen = document.getElementById('input-i9').value;
            const ghiChu = document.getElementById('input-m9').value; // Lấy ghi chú đã được JS cập nhật

            // 2. Tạo nội dung
            const textToCopy = `Gửi ACE ${nhaCanText}, ${truongKip} đăng kí thông tin cân hàng như sau:
Nội dung cân: ${noiDung}
Hàng hoá : ${chungLoai}
Khách hàng: ${khachHang}
Đại diện: ${daiDien}
Biển số xe: ${bsx};
Đơn vị vận chuyển :${donViVanChuyen}
Ghi chú: ${ghiChu}
Trân trọng!`;

            // 3. Copy vào clipboard
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            let success = false;
            try {
                success = document.execCommand('copy');
            } catch (err) {
                console.error('Không thể copy:', err);
            }
            document.body.removeChild(textArea);

            // 4. Báo trạng thái
            if (statusEl) {
                if (success) {
                    statusEl.textContent = 'Đã copy nội dung vào clipboard!';
                    statusEl.style.color = 'green';
                } else {
                    throw new Error('Không thể tự động copy.');
                }
            }

        } catch (error) {
            console.error('Lỗi khi copy:', error);
            if (statusEl) {
                statusEl.textContent = `Lỗi: ${error.message}`;
                statusEl.style.color = 'red';
            }
        }
    }
});