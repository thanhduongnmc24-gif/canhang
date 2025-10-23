document.addEventListener('DOMContentLoaded', () => {
    const btnXlsx = document.getElementById('btn-xlsx');
    const btnPdf = document.getElementById('btn-pdf');
    const statusEl = document.getElementById('status');

    btnXlsx.addEventListener('click', () => generateFile('xlsx'));
    btnPdf.addEventListener('click', () => generateFile('pdf'));

    async function generateFile(format) {
        statusEl.textContent = `Đang xử lý tạo file ${format.toUpperCase()}, vui lòng chờ...`;
        statusEl.style.color = 'blue';

        // 1. Lấy dữ liệu
        const data = {
            a5: document.getElementById('input-a5').value,
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

            statusEl.textContent = 'Hoàn thành! Đã tải file.';
            statusEl.style.color = 'green';

        } catch (error) {
            console.error('Lỗi khi tạo file:', error);
            statusEl.textContent = `Lỗi: ${error.message}`;
            statusEl.style.color = 'red';
        }
    }
});
