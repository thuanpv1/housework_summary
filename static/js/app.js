// Global variables
let currentData = null;
let pointsChart = null;
let hasUnsavedChanges = false;

// Load data when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

// Load existing tasks into modal when opened
document.getElementById('tasksModal').addEventListener('show.bs.modal', () => {
    if (currentData) {
        displayExistingTasks(currentData);
    }
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
            hasUnsavedChanges = false;
            hideSaveButton();
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

    // Update summary table
    updateSummaryTable(data);
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
 * Update task count (local only, no save)
 */
function updateTask(childId, taskId, action) {
    try {
        // Update local data
        const currentCount = currentData.children[childId].tasks[taskId];
        const points = currentData.task_points[taskId];

        if (action === 'increment') {
            currentData.children[childId].tasks[taskId] = currentCount + 1;
        } else if (action === 'decrement' && currentCount > 0) {
            currentData.children[childId].tasks[taskId] = currentCount - 1;
        } else {
            return; // Don't go below 0
        }

        // Recalculate total points
        let totalPoints = 0;
        for (const [tId, count] of Object.entries(currentData.children[childId].tasks)) {
            const pts = currentData.task_points[tId] || 0;
            totalPoints += count * pts;
        }
        currentData.children[childId].total_points = totalPoints;

        // Update UI
        const countElement = document.getElementById(`${childId}_${taskId}_count`);
        countElement.textContent = currentData.children[childId].tasks[taskId];
        countElement.classList.add('updated');
        setTimeout(() => countElement.classList.remove('updated'), 300);

        // Update total points display
        document.getElementById(`${childId}TotalPoints`).textContent = `${totalPoints} điểm`;

        // Update chart and summary table
        updateChart(currentData);
        updateSummaryTable(currentData);

        // Mark as unsaved
        hasUnsavedChanges = true;
        showSaveButton();

    } catch (error) {
        console.error('Error updating task:', error);
        showError('Không thể cập nhật. Vui lòng thử lại.');
    }
}

/**
 * Show save button
 */
function showSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.style.display = 'block';
}

/**
 * Hide save button
 */
function hideSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.style.display = 'none';
}

/**
 * Save all data to Gist
 */
async function saveAllData() {
    try {
        showLoading();
        hideError();

        const response = await fetch('/api/save-all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            hasUnsavedChanges = false;
            hideSaveButton();
            hideLoading();
            showMainContent();
            alert('✅ Đã lưu dữ liệu thành công!');
            await loadData();
        } else {
            throw new Error(result.message || 'Unknown error');
        }

    } catch (error) {
        console.error('Error saving data:', error);
        hideLoading();
        showMainContent();
        showError('Không thể lưu dữ liệu. Vui lòng thử lại.');
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
 * Update summary table
 */
function updateSummaryTable(data) {
    const tbody = document.getElementById('summaryTableBody');
    tbody.innerHTML = '';

    // Update header names
    document.getElementById('summaryChild1Name').textContent = data.children.child1.name;
    document.getElementById('summaryChild2Name').textContent = data.children.child2.name;

    const taskLabels = data.task_labels;
    const taskPoints = data.task_points;

    // Create rows for each task
    for (const [taskId, label] of Object.entries(taskLabels)) {
        const child1Count = data.children.child1.tasks[taskId] || 0;
        const child2Count = data.children.child2.tasks[taskId] || 0;
        const points = taskPoints[taskId] || 0;

        const child1Total = child1Count * points;
        const child2Total = child2Count * points;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${label}</strong>
                <small class="text-muted d-block">${points} điểm/lần</small>
            </td>
            <td class="text-center">
                <div>${child1Count} lần</div>
                <small class="text-primary fw-bold">${child1Total} điểm</small>
            </td>
            <td class="text-center">
                <div>${child2Count} lần</div>
                <small class="text-success fw-bold">${child2Total} điểm</small>
            </td>
        `;
        tbody.appendChild(row);
    }

    // Update totals
    document.getElementById('summaryChild1Total').textContent = `${data.children.child1.total_points} điểm`;
    document.getElementById('summaryChild2Total').textContent = `${data.children.child2.total_points} điểm`;
}

/**
 * Update chart
 */
function updateChart(data) {
    const ctx = document.getElementById('pointsChart').getContext('2d');

    const child1Name = data.children.child1.name;
    const child2Name = data.children.child2.name;
    const taskLabels = data.task_labels;
    const taskPoints = data.task_points;

    // Destroy existing chart if exists
    if (pointsChart) {
        pointsChart.destroy();
    }

    // Tạo datasets cho từng loại công việc
    const taskIds = Object.keys(taskLabels);
    const colors = [
        { bg: 'rgba(255, 99, 132, 0.8)', border: 'rgba(255, 99, 132, 1)' },
        { bg: 'rgba(54, 162, 235, 0.8)', border: 'rgba(54, 162, 235, 1)' },
        { bg: 'rgba(255, 206, 86, 0.8)', border: 'rgba(255, 206, 86, 1)' },
        { bg: 'rgba(75, 192, 192, 0.8)', border: 'rgba(75, 192, 192, 1)' },
        { bg: 'rgba(153, 102, 255, 0.8)', border: 'rgba(153, 102, 255, 1)' },
        { bg: 'rgba(255, 159, 64, 0.8)', border: 'rgba(255, 159, 64, 1)' }
    ];

    const datasets = taskIds.map((taskId, index) => {
        const child1Count = data.children.child1.tasks[taskId] || 0;
        const child2Count = data.children.child2.tasks[taskId] || 0;
        const points = taskPoints[taskId] || 0;
        const label = taskLabels[taskId] || taskId;

        return {
            label: `${label} (${points}đ/lần)`,
            data: [child1Count * points, child2Count * points],
            backgroundColor: colors[index % colors.length].bg,
            borderColor: colors[index % colors.length].border,
            borderWidth: 1
        };
    });

    // Detect if mobile
    const isMobile = window.innerWidth <= 768;

    // Create new stacked bar chart
    pointsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [child1Name, child2Name],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: isMobile ? 8 : 15,
                        font: {
                            size: isMobile ? 10 : 12
                        },
                        boxWidth: isMobile ? 12 : 15,
                        boxHeight: isMobile ? 12 : 15,
                        usePointStyle: false
                    },
                    maxHeight: isMobile ? 100 : 150
                },
                title: {
                    display: false
                },
                tooltip: {
                    enabled: !isMobile, // Disable tooltip on mobile (hard to use)
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y || 0;

                            // Tính số lần làm việc
                            const taskId = taskIds[context.datasetIndex];
                            const childId = context.dataIndex === 0 ? 'child1' : 'child2';
                            const count = data.children[childId].tasks[taskId] || 0;

                            return `${label}: ${count} lần = ${value} điểm`;
                        },
                        footer: function(tooltipItems) {
                            let total = 0;
                            tooltipItems.forEach(item => {
                                total += item.parsed.y;
                            });
                            return 'Tổng: ' + total + ' điểm';
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: isMobile ? 12 : 14
                        }
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5,
                        font: {
                            size: isMobile ? 10 : 12
                        }
                    },
                    title: {
                        display: !isMobile,
                        text: 'Điểm'
                    }
                }
            },
            layout: {
                padding: {
                    top: 10,
                    bottom: isMobile ? 10 : 5
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

/**
 * Display existing tasks in modal
 */
function displayExistingTasks(data) {
    const container = document.getElementById('existingTasksList');
    container.innerHTML = '';

    const taskLabels = data.task_labels;
    const taskPoints = data.task_points;

    for (const [taskId, label] of Object.entries(taskLabels)) {
        const points = taskPoints[taskId] || 0;

        const taskItem = document.createElement('div');
        taskItem.className = 'task-management-item';
        taskItem.innerHTML = `
            <div class="task-management-info">
                <strong>${label}</strong>
                <small class="text-muted">${points} điểm/lần</small>
            </div>
            <button class="btn btn-sm btn-danger" onclick="deleteTask('${taskId}')">
                🗑️ Xóa
            </button>
        `;

        container.appendChild(taskItem);
    }
}

/**
 * Add new task
 */
async function addNewTask() {
    const taskName = document.getElementById('newTaskName').value.trim();
    const points = parseInt(document.getElementById('newTaskPoints').value) || 1;

    if (!taskName) {
        alert('Vui lòng nhập tên công việc!');
        return;
    }

    // Convert task name to task_id (lowercase, replace spaces with underscores)
    const taskId = taskName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    try {
        const response = await fetch('/api/add-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                task_id: taskId,
                task_name: taskName,
                points: points
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            alert('✅ Đã thêm công việc thành công!');
            document.getElementById('newTaskName').value = '';
            document.getElementById('newTaskPoints').value = '1';

            // Reload data
            await loadData();

            // Update modal
            displayExistingTasks(currentData);
        } else {
            throw new Error(result.message || 'Unknown error');
        }

    } catch (error) {
        console.error('Error adding task:', error);
        alert('❌ Không thể thêm công việc. ' + error.message);
    }
}

/**
 * Delete task
 */
async function deleteTask(taskId) {
    if (!confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
        return;
    }

    try {
        const response = await fetch('/api/delete-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                task_id: taskId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            alert('✅ Đã xóa công việc thành công!');

            // Reload data
            await loadData();

            // Update modal
            displayExistingTasks(currentData);
        } else {
            throw new Error(result.message || 'Unknown error');
        }

    } catch (error) {
        console.error('Error deleting task:', error);
        alert('❌ Không thể xóa công việc. ' + error.message);
    }
}

