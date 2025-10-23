document.addEventListener('DOMContentLoaded', () => {

    // --- BẮT ĐẦU CODE MỚI ĐỂ CẬP NHẬT Ô A5 ---
    
    // 1. Lấy các element
    const selectKip = document.getElementById('select-kip');
    const selectNhaCan = document.getElementById('select-nha-can');
    const inputA5 = document.getElementById('input-a5');

    // 2. Hàm để cập nhật ô A5
    function updateA5() {
        // Kiểm tra xem các element có tồn tại không
        if (!selectKip || !selectNhaCan || !inputA5) {
            console.error("Không tìm thấy element kíp, nhà cân hoặc input A5.");
            return;
        }

        const kipValue = selectKip.value;
        const nhaCanValue = selectNhaCan.value;

        // Lấy ngày tháng hiện tại
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1; // Tháng bắt đầu từ 0
        const year = today.getFullYear();

        // Tạo chuỗi
        const dateString = `Kíp ${kipValue} Ngày ${day} tháng ${month} năm ${year}_NC số: ${nhaCanValue}`;
        
        // Gán vào ô input A5
        inputA5.value = dateString;
    }

    // 3. Thêm sự kiện "change" (khi người dùng thay đổi lựa chọn)
    if (selectKip) selectKip.addEventListener('change', updateA5);
    if (selectNhaCan) selectNhaCan.addEventListener('change', updateA5);

    // 4. Chạy hàm này 1 lần khi tải trang để điền giá trị ban đầu
    updateA5();

    // --- KẾT THÚC CODE MỚI ---


    // (Phần code cũ cho các nút bấm)
    const btnXlsx = document.getElementById('btn-xlsx');
    const btnPdf = document.getElementById('btn-pdf');
    const statusEl = document.getElementById('status');

    if(btnXlsx) btnXlsx.addEventListener('click', () => generateFile('xlsx'));
    if(btnPdf) btnPdf.addEventListener('click', () => generateFile('pdf'));

    async function generateFile(format) {
        if (statusEl) {
            statusEl.textContent = `Đang xử lý tạo file ${format.toUpperCase()}, vui lòng chờ...`;
            statusEl.style.color = 'blue';
        }

        // 1. Lấy dữ liệu (ĐÃ SỬA LẠI TOÀN BỘ ID CHO ĐÚNG)
        const data = {
            a5: document.getElementById('input-a5').value,
            a9: document.getElementById('input-a9').value,
            b9: document.getElementById('input-b9').value,
            c9: document.getElementById('input-c9').value,
            d9: document.getElementById('input-d9').value,
            e9: document.getElementById('input-e9').value,
            f9: document.getElementById('input-f9').value,
            g9: document.getElementById('input-g9').value,
            h9: document.getElementById('input-h9').value,
            i9: document.getElementById('input-i9').value,
            j9: document.getElementById('input-j9').value,
            k9: document.getElementById('input-k9').value,
            l9: document.getElementById('input-l9').value,
            m9: document.getElementById('input-m9').value,
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
            a.download = `NhuCauCanHang_${Date.now()}.${format}`; // Tên file tải về
            document.body.appendChild(a);
            
            a.click(); // Tự động nhấn link để tải

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
});

