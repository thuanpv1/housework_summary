// Global variables
let currentData = null;
let pointsChart = null;

// Load data when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

/**
 * Load data from API
 */
async function loadData() {
    try {
        showLoading();
        hideError();

        const response = await fetch('/api/data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status === 'success') {
            currentData = result.data;
            displayData(currentData);
            updateChart(currentData);
            updateLastUpdateTime(result.timestamp);
            hideLoading();
            showMainContent();
        } else {
            throw new Error(result.message || 'Unknown error');
        }

    } catch (error) {
        console.error('Error loading data:', error);
        showError('Không thể tải dữ liệu. Vui lòng kiểm tra cấu hình GIST_ID và GITHUB_TOKEN.');
        hideLoading();
    }
}

/**
 * Display data in the UI
 */
function displayData(data) {
    // Update child names
    document.getElementById('child1Name').textContent = data.children.child1.name;
    document.getElementById('child2Name').textContent = data.children.child2.name;
    
    // Update total points
    document.getElementById('child1TotalPoints').textContent = `${data.children.child1.total_points} điểm`;
    document.getElementById('child2TotalPoints').textContent = `${data.children.child2.total_points} điểm`;
    
    // Display tasks for child1
    displayChildTasks('child1', data);
    
    // Display tasks for child2
    displayChildTasks('child2', data);
}

/**
 * Display tasks for a specific child
 */
function displayChildTasks(childId, data) {
    const container = document.getElementById(`${childId}Tasks`);
    container.innerHTML = '';
    
    const tasks = data.children[childId].tasks;
    const taskPoints = data.task_points;
    const taskLabels = data.task_labels;
    
    for (const [taskId, count] of Object.entries(tasks)) {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        
        const points = taskPoints[taskId] || 0;
        const label = taskLabels[taskId] || taskId;
        
        taskItem.innerHTML = `
            <div class="task-info">
                <div class="task-name">${label}</div>
                <div class="task-points">${points} điểm/lần</div>
            </div>
            <div class="task-controls">
                <button class="btn-task btn-decrement" onclick="updateTask('${childId}', '${taskId}', 'decrement')">
                    −
                </button>
                <div class="task-count" id="${childId}_${taskId}_count">${count}</div>
                <button class="btn-task btn-increment" onclick="updateTask('${childId}', '${taskId}', 'increment')">
                    +
                </button>
            </div>
        `;
        
        container.appendChild(taskItem);
    }
}

/**
 * Update task count
 */
async function updateTask(childId, taskId, action) {
    try {
        const response = await fetch('/api/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                child_id: childId,
                task_id: taskId,
                action: action
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            // Update count with animation
            const countElement = document.getElementById(`${childId}_${taskId}_count`);
            countElement.textContent = result.new_count;
            countElement.classList.add('updated');
            setTimeout(() => countElement.classList.remove('updated'), 300);
            
            // Update total points
            document.getElementById(`${childId}TotalPoints`).textContent = `${result.total_points} điểm`;
            
            // Reload data to update chart
            await loadData();
        } else {
            throw new Error(result.message || 'Unknown error');
        }
        
    } catch (error) {
        console.error('Error updating task:', error);
        showError('Không thể cập nhật. Vui lòng thử lại.');
    }
}

/**
 * Reset all data
 */
async function resetData() {
    if (!confirm('Bạn có chắc chắn muốn reset tất cả dữ liệu về 0?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/reset', {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            alert('✅ Đã reset dữ liệu thành công!');
            await loadData();
        } else {
            throw new Error(result.message || 'Unknown error');
        }
        
    } catch (error) {
        console.error('Error resetting data:', error);
        showError('Không thể reset dữ liệu. Vui lòng thử lại.');
    }
}

/**
 * Update child names
 */
async function updateNames() {
    const child1Name = document.getElementById('child1NameInput').value.trim();
    const child2Name = document.getElementById('child2NameInput').value.trim();
    
    if (!child1Name || !child2Name) {
        alert('Vui lòng nhập đầy đủ tên cho cả 2 con!');
        return;
    }
    
    try {
        const response = await fetch('/api/update-names', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                child1_name: child1Name,
                child2_name: child2Name
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
            modal.hide();
            
            // Reload data
            await loadData();
            
            alert('✅ Đã cập nhật tên thành công!');
        } else {
            throw new Error(result.message || 'Unknown error');
        }
        
    } catch (error) {
        console.error('Error updating names:', error);
        alert('Không thể cập nhật tên. Vui lòng thử lại.');
    }
}

/**
 * Update chart
 */
function updateChart(data) {
    const ctx = document.getElementById('pointsChart').getContext('2d');
    
    const child1Points = data.children.child1.total_points;
    const child2Points = data.children.child2.total_points;
    const child1Name = data.children.child1.name;
    const child2Name = data.children.child2.name;
    
    // Destroy existing chart if exists
    if (pointsChart) {
        pointsChart.destroy();
    }
    
    // Create new chart
    pointsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [child1Name, child2Name],
            datasets: [{
                label: 'Tổng điểm',
                data: [child1Points, child2Points],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(240, 147, 251, 0.8)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(240, 147, 251, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5
                    }
                }
            }
        }
    });
}

/**
 * Update last update time
 */
function updateLastUpdateTime(timestamp) {
    const date = new Date(timestamp);
    const formattedTime = date.toLocaleString('vi-VN');
    document.getElementById('lastUpdate').textContent = `Cập nhật lúc: ${formattedTime}`;
}

/**
 * Show loading spinner
 */
function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('d-none');
    document.getElementById('mainContent').classList.add('d-none');
}

/**
 * Hide loading spinner
 */
function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('d-none');
}

/**
 * Show main content
 */
function showMainContent() {
    document.getElementById('mainContent').classList.remove('d-none');
}

/**
 * Show error message
 */
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorAlert').classList.remove('d-none');
}

/**
 * Hide error message
 */
function hideError() {
    document.getElementById('errorAlert').classList.add('d-none');
}

// Load current names into modal when opened
document.getElementById('settingsModal').addEventListener('show.bs.modal', () => {
    if (currentData) {
        document.getElementById('child1NameInput').value = currentData.children.child1.name;
        document.getElementById('child2NameInput').value = currentData.children.child2.name;
    }
});

