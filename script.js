const uploadForm = document.getElementById('uploadForm');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const fileInput = document.getElementById('fileElem');
const dropArea = document.getElementById('drop-area');
const fileLabel = document.getElementById('fileLabel');
const themeToggle = document.getElementById('themeToggle');
const icon = themeToggle.querySelector('i');

// Drag & drop (jika sudah ada, tidak perlu ditambah lagi)
dropArea.addEventListener('click', () => fileInput.click());
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('bg-primary', 'text-white');
});
dropArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropArea.classList.remove('bg-primary', 'text-white');
});
dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('bg-primary', 'text-white');
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        fileLabel.textContent = e.dataTransfer.files[0].name;
    }
});
fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
        fileLabel.textContent = fileInput.files[0].name;
    }
});

// Progress bar upload
uploadForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(uploadForm);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', window.location.pathname + window.location.search, true);

    xhr.upload.addEventListener('progress', function(e) {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            progressContainer.classList.remove('d-none');
            progressBar.style.width = percent + '%';
            progressBar.textContent = percent + '%';
        }
    });

    xhr.onload = function() {
        if (xhr.status === 200) {
            progressBar.style.width = '100%';
            progressBar.textContent = '100%';
            setTimeout(() => {
                progressContainer.classList.add('d-none');
                progressBar.style.width = '0%';
                progressBar.textContent = '0%';
                window.location.reload();
            }, 500);
        } else {
            alert('Upload failed!');
            progressContainer.classList.add('d-none');
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';
        }
    };

    xhr.onerror = function() {
        alert('Upload error!');
        progressContainer.classList.add('d-none');
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
    };

    xhr.send(formData);
});

document.getElementById('profileForm').onsubmit = async function(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const msgDiv = document.getElementById('profileMsg');
    msgDiv.textContent = '';
    msgDiv.classList.remove('text-danger', 'text-success');
    try {
        const res = await fetch('/profile', {
            method: 'POST',
            body: data
        });
        const result = await res.json();
        msgDiv.textContent = result.message;
        if(result.success) {
            msgDiv.classList.add('text-success');
            form.reset();
            // Tutup modal
            var modal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
            if(modal) modal.hide();
        } else {
            msgDiv.classList.add('text-danger');
        }
    } catch (err) {
        msgDiv.textContent = 'Server error. Please try again.';
        msgDiv.classList.add('text-danger');
    }
};

function setTheme(dark) {
    if (dark) {
        document.body.classList.add('dark-mode');
        icon.classList.remove('bi-moon');
        icon.classList.add('bi-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        icon.classList.remove('bi-sun');
        icon.classList.add('bi-moon');
        localStorage.setItem('theme', 'light');
    }
}
// Inisialisasi icon sesuai tema
setTheme(localStorage.getItem('theme') === 'dark');
themeToggle.addEventListener('click', () => {
    setTheme(!document.body.classList.contains('dark-mode'));
});

// Pastikan contextMenu, contextTarget, basePath sudah didefinisikan di tempat lain
document.querySelectorAll('.context-open a').forEach(function(anchor) {
    anchor.onclick = function(e) {
        e.preventDefault();
        if(typeof contextTarget !== 'undefined' && contextTarget) {
            const filePath = basePath + contextTarget.dataset.name;
            window.location.href = "{{ url_for('preview', filename='DUMMY') }}".replace('DUMMY', encodeURIComponent(filePath));
        }
    };
});

// Context menu logic
const contextMenu = document.getElementById('contextMenu');
let contextTarget = null;
let basePath = window.basePath || (typeof BASE_PATH !== 'undefined' ? BASE_PATH : (typeof path !== 'undefined' ? path : ''));
if(basePath && !basePath.endsWith('/')) basePath += '/';

function handleFileItemEvents() {
    document.querySelectorAll('.file-item').forEach(item => {
        // Klik kiri
        item.addEventListener('click', function(e) {
            if (e.button === 0) { // left click
                const type = this.dataset.type;
                const name = this.dataset.name;
                if(type === 'folder') {
                    const newPath = basePath + name;
                    window.location.href = window.dashboardUrl + (newPath ? '/' + encodeURIComponent(newPath) : '');
                } else if(type === 'file') {
                    const filePath = basePath + name;
                    window.location.href = window.previewUrl.replace('DUMMY', encodeURIComponent(filePath));
                }
            }
        });
        // Klik kanan
        item.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            contextTarget = this;
            const type = this.dataset.type;
            // Show/hide menu items
            contextMenu.querySelector('.context-preview').classList.toggle('d-none', type !== 'file');
            contextMenu.querySelector('.context-download').classList.toggle('d-none', type !== 'file');
            contextMenu.querySelector('.context-open').classList.toggle('d-none', type !== 'folder');
            // Position menu
            let x = e.clientX;
            let y = e.clientY;
            contextMenu.style.display = 'block';
            const menuRect = contextMenu.getBoundingClientRect();
            contextMenu.style.display = '';
            if (x + menuRect.width > window.innerWidth) x = window.innerWidth - menuRect.width - 5;
            if (y + menuRect.height > window.innerHeight) y = window.innerHeight - menuRect.height - 5;
            contextMenu.style.left = x + 'px';
            contextMenu.style.top = y + 'px';
            contextMenu.classList.remove('d-none');
        });
    });
}
handleFileItemEvents();
// Sembunyikan context menu jika klik di luar atau scroll
['click', 'scroll', 'resize'].forEach(evt => {
    window.addEventListener(evt, function(e) {
        if (!contextMenu.contains(e.target)) {
            contextMenu.classList.add('d-none');
        }
    });
});
// Action handlers
contextMenu.querySelector('.context-preview a').onclick = function(e) {
    e.preventDefault();
    if(contextTarget) {
        const filePath = basePath + contextTarget.dataset.name;
        window.location.href = window.previewUrl.replace('DUMMY', encodeURIComponent(filePath));
    }
};
contextMenu.querySelector('.context-download a').onclick = function(e) {
    e.preventDefault();
    if(contextTarget) {
        const filePath = basePath + contextTarget.dataset.name;
        window.location.href = window.downloadUrl.replace('DUMMY', encodeURIComponent(filePath));
    }
};
contextMenu.querySelector('.context-open a').onclick = function(e) {
    e.preventDefault();
    if(contextTarget) {
        const newPath = basePath + contextTarget.dataset.name;
        window.location.href = window.dashboardUrl + (newPath ? '/' + encodeURIComponent(newPath) : '');
    }
};
contextMenu.querySelector('.context-delete a').onclick = function(e) {
    e.preventDefault();
    if(contextTarget) {
        const type = contextTarget.dataset.type;
        const name = contextTarget.dataset.name;
        let url = '';
        if(type === 'file') {
            const filePath = basePath + name;
            url = window.deleteUrl.replace('DUMMY', encodeURIComponent(filePath));
        } else if(type === 'folder') {
            const folderPath = basePath + name;
            url = window.deleteFolderUrl.replace('DUMMY', encodeURIComponent(folderPath));
        }
        if(url && confirm('Delete this ' + type + '?')) {
            window.location.href = url;
        }
    }
};
contextMenu.querySelector('.context-properties a').onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if(!contextTarget) {
        alert('Tidak ada objek yang dipilih. Silakan klik kanan pada file/folder.');
        return;
    }
    const name = contextTarget.dataset.name;
    const dataPath = basePath + name;
    showPropertiesModal(dataPath, true);
    contextMenu.classList.add('d-none');
};
function showPropertiesModal(dataPath, forceShow) {
    const propertiesModal = new bootstrap.Modal(document.getElementById('propertiesModal'));
    const propertiesContent = document.getElementById('propertiesContent');
    propertiesContent.innerHTML = '<div class="text-center text-secondary">Memuat...</div>';
    if(forceShow) propertiesModal.show();
    fetch('/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: dataPath })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            const p = data.properties;
            let html = `<ul class='list-group'>`;
            html += `<li class='list-group-item'><strong>Nama:</strong> ${p.nama}</li>`;
            html += `<li class='list-group-item'><strong>Tipe:</strong> ${p.tipe}</li>`;
            if(p.ukuran !== null) html += `<li class='list-group-item'><strong>Ukuran:</strong> ${p.ukuran.toLocaleString()} byte</li>`;
            if(p.jumlah_item !== undefined) html += `<li class='list-group-item'><strong>Jumlah Item:</strong> ${p.jumlah_item}</li>`;
            html += `<li class='list-group-item'><strong>Waktu Dibuat:</strong> ${p.waktu_dibuat}</li>`;
            html += `<li class='list-group-item'><strong>Waktu Diubah:</strong> ${p.waktu_diubah}</li>`;
            html += `<li class='list-group-item'><strong>Path:</strong> ${p.path}</li>`;
            html += `</ul>`;
            propertiesContent.innerHTML = html;
        } else {
            propertiesContent.innerHTML = `<div class='text-danger'>${data.message || 'Gagal memuat properties.'}</div>`;
            if(forceShow) propertiesModal.show();
        }
    })
    .catch(() => {
        propertiesContent.innerHTML = `<div class='text-danger'>Gagal memuat properties.'}</div>`;
        if(forceShow) propertiesModal.show();
    });
}
document.querySelectorAll('.btn-properties').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        showPropertiesModal(this.getAttribute('data-path'));
    });
});

// Tampilkan modal konfirmasi saat klik "Delete Account"
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const confirmDeleteAccountBtn = document.getElementById('confirmDeleteAccountBtn');
const confirmDeleteModal = document.getElementById('confirmDeleteModal');

deleteAccountBtn.onclick = function() {
    var modal = new bootstrap.Modal(confirmDeleteModal);
    modal.show();
};

confirmDeleteAccountBtn.onclick = async function() {
    var modal = bootstrap.Modal.getInstance(confirmDeleteModal);
    if(modal) modal.hide();
    try {
        const res = await fetch('/delete_account', { method: 'POST' });
        const result = await res.json();
        if(result.success) {
            alert('Account deleted successfully.');
            window.location.href = '/login';
        } else {
            alert(result.message || 'Failed to delete account.');
        }
    } catch (err) {
        alert('Server error. Please try again.');
    }
};