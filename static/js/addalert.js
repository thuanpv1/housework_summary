// Global variables
let currentAlerts = {};
let editingSymbol = null;

// Load data when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadAlerts();
});

/**
 * Load alerts from API
 */
async function loadAlerts() {
    try {
        const response = await fetch('/api/alert/data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status === 'success') {
            currentAlerts = result.data;
            displayAlerts(currentAlerts);
            hideError();
        } else {
            throw new Error(result.message || 'Unknown error');
        }

    } catch (error) {
        console.error('Error loading alerts:', error);
        showError('Không thể tải dữ liệu alert. Vui lòng kiểm tra cấu hình.');
    }
}

/**
 * Display alerts in the UI
 */
function displayAlerts(alerts) {
    const container = document.getElementById('alertsList');
    const emptyMessage = document.getElementById('emptyMessage');
    
    if (Object.keys(alerts).length === 0) {
        container.innerHTML = '';
        emptyMessage.style.display = 'block';
        return;
    }
    
    emptyMessage.style.display = 'none';
    container.innerHTML = '';
    
    for (const [symbol, data] of Object.entries(alerts)) {
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        
        const directionText = data.direction === 'above' ? '📈 Trên' : '📉 Dưới';
        const directionBadge = data.direction === 'above' ? 'badge bg-success' : 'badge bg-danger';
        
        alertItem.innerHTML = `
            <div class="alert-symbol">${symbol}</div>
            <div class="alert-info">
                <div class="alert-price">
                    <strong>Giá:</strong> ${data.alert_price}
                </div>
                <div class="alert-direction">
                    <span class="${directionBadge}">${directionText}</span>
                </div>
            </div>
            <div class="alert-actions">
                <button class="btn btn-sm btn-warning" onclick="openEditModal('${symbol}')">
                    ✏️ Chỉnh sửa
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteAlert('${symbol}')">
                    🗑️ Xóa
                </button>
            </div>
        `;
        
        container.appendChild(alertItem);
    }
}

/**
 * Add new alert
 */
async function addNewAlert() {
    const symbol = document.getElementById('newSymbol').value.trim().toUpperCase();
    const price = parseFloat(document.getElementById('newPrice').value);
    const direction = document.getElementById('newDirection').value;
    
    if (!symbol) {
        showError('Vui lòng nhập Symbol!');
        return;
    }
    
    if (isNaN(price)) {
        showError('Vui lòng nhập Giá hợp lệ!');
        return;
    }
    
    if (symbol in currentAlerts) {
        showError(`Alert cho ${symbol} đã tồn tại!`);
        return;
    }
    
    try {
        const response = await fetch('/api/alert/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                symbol: symbol,
                alert_price: price,
                direction: direction
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showSuccess(`✅ Đã thêm alert cho ${symbol}!`);
            document.getElementById('newSymbol').value = '';
            document.getElementById('newPrice').value = '';
            document.getElementById('newDirection').value = 'above';
            await loadAlerts();
        } else {
            throw new Error(result.message || 'Unknown error');
        }
        
    } catch (error) {
        console.error('Error adding alert:', error);
        showError('Không thể thêm alert. Vui lòng thử lại.');
    }
}

/**
 * Open edit modal
 */
function openEditModal(symbol) {
    editingSymbol = symbol;
    const alert = currentAlerts[symbol];
    
    document.getElementById('editSymbol').value = symbol;
    document.getElementById('editPrice').value = alert.alert_price;
    document.getElementById('editDirection').value = alert.direction;
    
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
}

/**
 * Save edited alert
 */
async function saveEditAlert() {
    const symbol = editingSymbol;
    const newPrice = parseFloat(document.getElementById('editPrice').value);
    const newDirection = document.getElementById('editDirection').value;
    
    if (isNaN(newPrice)) {
        showError('Vui lòng nhập Giá hợp lệ!');
        return;
    }
    
    try {
        // Update price
        let response = await fetch('/api/alert/update-price', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                symbol: symbol,
                alert_price: newPrice
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Update direction
        response = await fetch('/api/alert/update-direction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                symbol: symbol,
                direction: newDirection
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showSuccess(`✅ Đã cập nhật alert cho ${symbol}!`);
            const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            modal.hide();
            await loadAlerts();
        } else {
            throw new Error(result.message || 'Unknown error');
        }
        
    } catch (error) {
        console.error('Error saving alert:', error);
        showError('Không thể lưu alert. Vui lòng thử lại.');
    }
}

/**
 * Delete alert
 */
async function deleteAlert(symbol) {
    if (!confirm(`Bạn có chắc chắn muốn xóa alert cho ${symbol}?`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/alert/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                symbol: symbol
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showSuccess(`✅ Đã xóa alert cho ${symbol}!`);
            await loadAlerts();
        } else {
            throw new Error(result.message || 'Unknown error');
        }
        
    } catch (error) {
        console.error('Error deleting alert:', error);
        showError('Không thể xóa alert. Vui lòng thử lại.');
    }
}

/**
 * Show success message
 */
function showSuccess(message) {
    const alert = document.getElementById('successAlert');
    document.getElementById('successMessage').textContent = message;
    alert.classList.remove('d-none');
    setTimeout(() => {
        alert.classList.add('d-none');
    }, 3000);
}

/**
 * Show error message
 */
function showError(message) {
    const alert = document.getElementById('errorAlert');
    document.getElementById('errorMessage').textContent = message;
    alert.classList.remove('d-none');
    setTimeout(() => {
        alert.classList.add('d-none');
    }, 3000);
}

/**
 * Hide error message
 */
function hideError() {
    document.getElementById('errorAlert').classList.add('d-none');
}

