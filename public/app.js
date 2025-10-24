document.addEventListener('DOMContentLoaded', () => {

    // --- BẮT ĐẦU CODE CẬP NHẬT Ô A5 ---
    const selectKip = document.getElementById('select-kip');
    const selectNhaCan = document.getElementById('select-nha-can');
    const inputA5 = document.getElementById('input-a5');

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
    updateA5(); 
    // --- KẾT THÚC CODE CẬP NHẬT Ô A5 ---


    // --- BẮT ĐẦU CODE CẬP NHẬT Ô GHI CHÚ (M9) MỚI ---
    const inputNoiNhan = document.getElementById('input-noinhan');
    const inputGhiChu = document.getElementById('input-m9');
    const inputXuong = document.getElementById('input-xuong');
    const inputNhaMay = document.getElementById('input-nhamay'); // Lấy ô nhà máy mới

    function updateGhiChu() {
        if (!selectNhaCan || !inputNoiNhan || !inputGhiChu || !inputXuong || !inputNhaMay) {
            console.error("Không tìm thấy element nhà cân, nơi nhận, xưởng, hoặc nhà máy.");
            return;
        }
        const nhaCanValue = selectNhaCan.value;
        const noiNhanValue = inputNoiNhan.value.trim();
        const xuongValue = inputXuong.value.trim();
        const nhaMayValue = inputNhaMay.value.trim(); // Lấy giá trị nhà máy

        // Cấu trúc mới: Nhà máy(xưởng) =>nhà cân=>nơi nhận
        inputGhiChu.value = `${nhaMayValue}(${xuongValue}) =>${nhaCanValue}=>${noiNhanValue}`;
    }

    // Gắn sự kiện lắng nghe:
    if (selectNhaCan) selectNhaCan.addEventListener('change', updateGhiChu);
    if (inputNoiNhan) inputNoiNhan.addEventListener('input', updateGhiChu);
    if (inputXuong) inputXuong.addEventListener('input', updateGhiChu);
    if (inputNhaMay) inputNhaMay.addEventListener('input', updateGhiChu); // Lắng nghe thay đổi của Nhà máy
    
    updateGhiChu(); 
    // --- KẾT THÚC CODE CẬP NHẬT Ô GHI CHÚ ---


    // --- CODE CHO CÁC NÚT BẤM (Không thay đổi) ---
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

        // 1. Lấy dữ liệu (ĐÃ THÊM XƯỞNG VÀ NHÀ MÁY)
        const data = {
            a5: document.getElementById('input-a5').value, 
            b9: document.getElementById('input-b9').value, 
            c9: document.getElementById('input-c9').value, 
            d9: document.getElementById('input-d9').value, 
            e9: document.getElementById('input-e9').value, 
            f9: document.getElementById('input-f9').value, 
            g9: document.getElementById('input-g9').value, 
            h9: document.getElementById('input-h9').value, // BSX
            i9: document.getElementById('input-i9').value, 
            j9: document.getElementById('input-j9').value, 
            k9: document.getElementById('input-k9').value, 
            l9: document.getElementById('input-l9').value, 
            m9: document.getElementById('input-m9').value, // Lấy giá trị Ghi chú đã được update
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
            
            // Logic tên file
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
    
    // --- HÀM COPY DỮ LIỆU ---
    function copyData() {
        try {
            // 1. Lấy tất cả giá trị
            const nhaCanSelect = document.getElementById('select-nha-can');
            const nhaCanText = nhaCanSelect.options[nhaCanSelect.selectedIndex].text; 
            
            const truongKip = document.getElementById('input-truongkip').value;
            const cccd = document.getElementById('input-g9').value;
            const khachHang = document.getElementById('input-e9').value;
            const noiDung = document.getElementById('input-b9').value;
            const chungLoai = document.getElementById('input-d9').value;
            const daiDien = document.getElementById('input-f9').value;
            const bsx = document.getElementById('input-h9').value;
            const donViVanChuyen = document.getElementById('input-i9').value;
            const ghiChu = document.getElementById('input-m9').value; // Lấy giá trị Ghi chú đã được update

            // 2. Tạo nội dung
            const textToCopy = `Gửi ACE ${nhaCanText}, ${truongKip} - ${cccd} - ${khachHang} đăng kí thông tin cân hàng như sau:
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

