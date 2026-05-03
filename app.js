// --- STATE MANAGEMENT ---
let state = {
    deals: [
        { id: 1, name: "Acme Corp", type: "Business", status: "Lead", progress: 0 },
        { id: 2, name: "Jane Smith", type: "Individual", status: "In Progress", progress: 40 },
        { id: 3, name: "TechNova Inc", type: "Business", status: "Completed", progress: 100 }
    ],
    currentDealId: 1,
    clientOnboardingStatus: 'email', // email -> form -> completed
    formStep: 1,
    docsUploaded: { tax: false, inc: false },
    isSigned: false
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initViewSwitchers();
    renderDealsTable();
    initUploaders();
    initSignature();
});

// --- UTILS: TOAST NOTIFICATIONS ---
function showToast(message, type = 'primary') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- VIEW SWITCHING ---
function initViewSwitchers() {
    document.getElementById('btn-staff-view').addEventListener('click', () => switchView('staff'));
    document.getElementById('btn-client-view').addEventListener('click', () => switchView('client'));
    document.getElementById('btn-reset').addEventListener('click', resetDemo);
}

function switchView(view) {
    // Update buttons
    document.getElementById('btn-staff-view').classList.toggle('active', view === 'staff');
    document.getElementById('btn-client-view').classList.toggle('active', view === 'client');

    // Update sections
    document.getElementById('staff-view').classList.toggle('active', view === 'staff');
    document.getElementById('client-view').classList.toggle('active', view === 'client');

    if (view === 'client') {
        updateClientPortalView();
    } else {
        renderDealsTable(); // refresh table
    }
}

// --- CRM / STAFF LOGIC (Modules 1, 7, 8) ---
function switchStaffTab(tabName) {
    // Update nav links
    document.querySelectorAll('.nav-links li').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-${tabName}`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.staff-tab').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('active');
    });
    const activeTab = document.getElementById(`tab-${tabName}`);
    activeTab.style.display = 'block';
    
    // Add brief animation delay
    setTimeout(() => {
        activeTab.classList.add('active');
    }, 10);
}

function renderDealsTable() {
    const tbody = document.getElementById('deals-table-body');
    tbody.innerHTML = '';

    state.deals.forEach(deal => {
        let actionBtn = '';
        let statusBadge = '';
        
        switch(deal.status) {
            case 'Lead':
                statusBadge = `<span class="badge bg-warning">Lead</span>`;
                actionBtn = `<button class="btn btn-sm btn-primary" onclick="triggerOnboarding(${deal.id})">Trigger Onboarding</button>`;
                break;
            case 'Onboarding Initiated':
            case 'In Progress':
                statusBadge = `<span class="badge bg-primary">${deal.status}</span>`;
                actionBtn = `<button class="btn btn-sm btn-outline" disabled>Awaiting Client</button>`;
                break;
            case 'Completed':
                statusBadge = `<span class="badge bg-success">Completed</span>`;
                actionBtn = `<button class="btn btn-sm btn-success">View Profile</button>`;
                break;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${deal.name}</strong></td>
            <td>${deal.type}</td>
            <td>${statusBadge}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="flex:1; height: 6px; background: var(--bg-surface-hover); border-radius: 3px; overflow: hidden;">
                        <div style="width: ${deal.progress}%; height: 100%; background: ${deal.progress === 100 ? 'var(--success)' : 'var(--primary)'};"></div>
                    </div>
                    <span class="text-sm text-muted">${deal.progress}%</span>
                </div>
            </td>
            <td>${actionBtn}</td>
        `;
        tbody.appendChild(tr);
    });

    // Check if internal tasks should be shown
    const completedDeal = state.deals.find(d => d.id === state.currentDealId && d.status === 'Completed');
    if (completedDeal && state.currentDealId === 1) {
        document.getElementById('internal-tasks-panel').style.display = 'block';
        renderInternalTasks();
    }
}

function triggerOnboarding(id) {
    const deal = state.deals.find(d => d.id === id);
    if(deal) {
        deal.status = 'Onboarding Initiated';
        deal.progress = 5;
        state.clientOnboardingStatus = 'email';
        renderDealsTable();
        showToast('Module 1: Onboarding Workflow Triggered Automatically', 'success');
        showToast('Automated Welcome Email dispatched to client.', 'primary');
    }
}

function renderInternalTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = `
        <div class="task-item">
            <div class="task-info">
                <h4>Review Onboarding Documents - Acme Corp</h4>
                <div class="task-meta"><span>Assignee: Junior Accountant</span> <span>Due: Today</span></div>
            </div>
            <span class="badge bg-warning">Pending</span>
        </div>
        <div class="task-item">
            <div class="task-info">
                <h4>Setup QuickBooks Account</h4>
                <div class="task-meta"><span>Assignee: Tech Admin</span> <span>Due: Tomorrow</span></div>
            </div>
            <span class="badge bg-warning">Pending</span>
        </div>
    `;
}

// --- CLIENT PORTAL LOGIC (Modules 2, 3, 4, 6) ---

function updateClientPortalView() {
    const emailView = document.getElementById('client-email-view');
    const formView = document.getElementById('client-form-view');

    if (state.clientOnboardingStatus === 'email') {
        emailView.classList.add('active');
        formView.classList.remove('active');
    } else {
        emailView.classList.remove('active');
        formView.classList.add('active');
        showStep(state.formStep);
    }
}

document.getElementById('btn-start-onboarding').addEventListener('click', () => {
    state.clientOnboardingStatus = 'form';
    state.formStep = 1;
    updateDealProgress(20, 'In Progress');
    showToast('Client opened intake form link.', 'primary');
    updateClientPortalView();
});

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    
    if (step === 'success') {
        document.getElementById('step-success').classList.add('active');
        return;
    }

    // Show current step
    document.getElementById(`step-${step}`).classList.add('active');
    
    let navStep = step === 'verify' ? 7 : step;
    
    // Update Nav
    if (navStep !== 'verify') {
        document.querySelectorAll('.step').forEach(el => {
            el.classList.remove('active');
            const stepNum = parseInt(el.id.replace('nav-step-', ''));
            if (stepNum < navStep) {
                el.classList.add('completed');
            } else {
                el.classList.remove('completed');
            }
        });
        const activeNav = document.getElementById(`nav-step-${navStep}`);
        if(activeNav) activeNav.classList.add('active');
    }

    // Step specific logic
    if (step === 'verify') {
        runAutomatedVerification();
    }
}

function nextStep(step) {
    state.formStep = step;
    let progress = Math.round((step / 8) * 90); 
    if(step === 8) progress = 90;
    updateDealProgress(progress, 'In Progress');
    showStep(step);
}

function prevStep(step) {
    state.formStep = step;
    showStep(step);
}

// Module 3: Documents
function initUploaders() {
    const attachUploader = (id, key) => {
        const area = document.getElementById(id);
        const status = document.getElementById(`status-${key}`);
        
        area.addEventListener('click', () => {
            // Simulate file dialog & upload
            status.innerHTML = '<span class="text-warning"><i class="fas fa-spinner fa-spin"></i> Uploading & Scanning...</span>';
            setTimeout(() => {
                state.docsUploaded[key] = true;
                area.style.borderColor = 'var(--success)';
                area.style.background = 'rgba(16, 185, 129, 0.05)';
                area.innerHTML = '<i class="fas fa-file-pdf" style="color:var(--success)"></i><p>Document_uploaded.pdf</p>';
                status.innerHTML = '<span class="text-success"><i class="fas fa-check"></i> Validated</span>';
            }, 1000);
        });
    };
    attachUploader('upload-tax', 'tax');
    attachUploader('upload-inc', 'inc');
}

function validateDocuments() {
    if (state.docsUploaded.tax && state.docsUploaded.inc) {
        showStep('verify');
    } else {
        showToast('Validation Error. Please upload all required documents.', 'danger');
    }
}

// Module 4: Verification
function runAutomatedVerification() {
    document.getElementById('verification-actions').style.display = 'none';
    const items = [
        { id: 'verify-data', time: 1000 },
        { id: 'verify-docs', time: 2000 },
        { id: 'verify-aml', time: 3000 }
    ];

    items.forEach(item => {
        document.getElementById(item.id).classList.remove('done');
        setTimeout(() => {
            document.getElementById(item.id).classList.add('done');
        }, item.time);
    });

    setTimeout(() => {
        showToast('Module 4: All verifications passed automatically.', 'success');
        document.getElementById('verification-actions').style.display = 'flex';
    }, 3200);
}

// Module 6: E-Signature
function initSignature() {
    const pad = document.getElementById('signature-pad');
    pad.addEventListener('click', () => {
        if (!state.isSigned) {
            state.isSigned = true;
            pad.classList.add('signed');
            pad.innerHTML += '<img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/John_Hancock_Signature.svg" class="signature-img" style="filter: invert(1); opacity:0.8;">';
            document.getElementById('btn-submit-onboarding').disabled = false;
            showToast('Document digitally signed.', 'success');
        }
    });
}

function submitOnboarding() {
    updateDealProgress(100, 'Completed');
    showStep('success');
    showToast('Module 10: Handoff complete. Internal tasks generated.', 'success');
}

function updateDealProgress(progress, status) {
    const deal = state.deals.find(d => d.id === state.currentDealId);
    if(deal) {
        deal.progress = progress;
        deal.status = status;
    }
}

// Reset
function resetDemo() {
    state.deals[0].status = 'Lead';
    state.deals[0].progress = 0;
    state.clientOnboardingStatus = 'email';
    state.formStep = 1;
    state.docsUploaded = { tax: false, inc: false };
    state.isSigned = false;
    
    // Reset UI
    document.getElementById('upload-tax').innerHTML = '<i class="fas fa-cloud-upload-alt"></i><p>Drag & drop or <span>browse</span></p>';
    document.getElementById('upload-tax').style = '';
    document.getElementById('status-tax').innerHTML = '';
    
    document.getElementById('upload-inc').innerHTML = '<i class="fas fa-cloud-upload-alt"></i><p>Drag & drop or <span>browse</span></p>';
    document.getElementById('upload-inc').style = '';
    document.getElementById('status-inc').innerHTML = '';

    const pad = document.getElementById('signature-pad');
    pad.classList.remove('signed');
    pad.innerHTML = '<span>Click here to sign</span>';
    document.getElementById('btn-submit-onboarding').disabled = true;

    document.getElementById('internal-tasks-panel').style.display = 'none';

    switchStaffTab('dashboard');
    switchView('staff');
    showToast('Demo state reset.', 'warning');
}
