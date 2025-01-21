const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {

    document.addEventListener('DOMContentLoaded', function () {

        const photoInput = document.getElementById('photoInput');
        const photoButton = document.getElementById('photoButton');
        const preview = document.getElementById('preview');
        let selectedFiles = [];

        photoButton.addEventListener('click', () => {
            photoInput.click();
        });

        photoInput.addEventListener('change', function (e) {
            const files = Array.from(e.target.files);
            selectedFiles = selectedFiles.concat(files);
            updatePreview();
        });

        function updatePreview() {
            preview.innerHTML = '';
            selectedFiles.forEach((file, index) => {
                const col = document.createElement('div');
                col.className = 'col';

                const container = document.createElement('div');
                container.className = 'preview-image-container';

                const img = document.createElement('img');
                img.className = 'preview-image';
                img.src = URL.createObjectURL(file);

                const removeBtn = document.createElement('button');
                removeBtn.className = 'btn btn-sm remove-image';
                removeBtn.innerHTML = '×';
                removeBtn.onclick = (e) => {
                    e.preventDefault();
                    selectedFiles = selectedFiles.filter((_, i) => i !== index);
                    updatePreview();
                };
                container.appendChild(img);
                container.appendChild(removeBtn);
                col.appendChild(container);
                preview.appendChild(col);
            });
        }

        uploadForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            if (selectedFiles.length === 0) {
                alert('בבקשה העלה לפחות תמונה אחת');
                return;
            }

            const formData = new FormData(uploadForm);
            selectedFiles.forEach(file => formData.append('image', file));

            try {
                const response = await fetch(uploadForm.action, {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    bootstrap.Modal.getInstance(document.getElementById('uploadModal')).hide();
                    window.location.reload();
                } else {
                    throw new Error();
                }
            } catch {
                alert('העלאה נכשלה :( תנסה בבקשה שוב!');
            }


        });

    });
}
