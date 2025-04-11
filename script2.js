// script2.js - Shared functionality for institute, department, and supervisor pages

// Shared data structure with localStorage persistence
const sharedData = window.sharedData || (window.sharedData = {
    institutes: JSON.parse(localStorage.getItem('institutes')) || [
        { name: "Department of Radiology", status: "active" },
        { name: "SPGS", status: "inactive" },
        { name: "DIR", status: "active" },
        { name: "Medical Unit-V", status: "active" },
        { name: "Paeds Unit-I", status: "active" }
    ],
    departments: JSON.parse(localStorage.getItem('departments')) || [
        { name: "Department of Radiology", institute: "", status: "inactive" },
        { name: "DIR", institute: "Department of Radiology", status: "active" },
        { name: "Medical Unit-V", institute: "", status: "active" },
        { name: "Paeds Unit-I", institute: "SPGS", status: "active" }
    ],
    supervisors: JSON.parse(localStorage.getItem('supervisors')) || [
        { 
            name: "Dr. Smith", 
            department: "Radiology", 
            institute: "Department of Radiology", 
            email: "dr.smith@duhs.edu.pk",
            status: "active" 
        }
    ]
});

// Function to save data to localStorage
function saveData() {
    localStorage.setItem('institutes', JSON.stringify(sharedData.institutes));
    localStorage.setItem('departments', JSON.stringify(sharedData.departments));
    localStorage.setItem('supervisors', JSON.stringify(sharedData.supervisors));
}

// Common utility functions
const utils = {
    // Initialize form controls
    initFormControls: function(form, editIndexInput, cancelEditBtn) {
        return {
            resetForm: function() {
                form.reset();
                document.querySelector('input[name="status"][value="active"]').checked = true;
                editIndexInput.value = "-1";
                cancelEditBtn.style.display = "none";
            },
            setEditMode: function(title, submitText) {
                form.querySelector('#formTitle').textContent = title;
                form.querySelector('#submitBtn').textContent = submitText;
                cancelEditBtn.style.display = "inline-flex";
            },
            setAddMode: function(title, submitText) {
                form.querySelector('#formTitle').textContent = title;
                form.querySelector('#submitBtn').textContent = submitText;
                cancelEditBtn.style.display = "none";
            }
        };
    },

    // Render status badge
    renderStatusBadge: function(status) {
        const statusClass = status === 'active' ? 'status-active' : 'status-inactive';
        const statusText = status === 'active' ? 'ACTIVE' : 'IN ACTIVE';
        return `<span class="px-3 py-1 rounded-full text-xs font-semibold ${statusClass}">${statusText}</span>`;
    },

    // Add event listeners to table rows
    addTableRowListeners: function(container, editHandler, deleteHandler) {
        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', editHandler);
        });
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteHandler);
        });
    }
};

// Institute Page Functions
const institutePage = {
    init: function() {
        this.form = document.getElementById('instituteForm');
        this.tableBody = document.getElementById('institutesTableBody');
        this.editIndexInput = document.getElementById('editIndex');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.formControls = utils.initFormControls(this.form, this.editIndexInput, this.cancelEditBtn);

        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.cancelEditBtn.addEventListener('click', this.cancelEdit.bind(this));
        
        this.renderInstitutes();
    },

    renderInstitutes: function() {
        this.tableBody.innerHTML = '';
        sharedData.institutes.forEach((institute, index) => {
            const row = document.createElement('tr');
            row.className = 'institute-card';
            row.setAttribute('data-index', index);
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${institute.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${utils.renderStatusBadge(institute.status)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button class="text-blue-600 hover:text-blue-900 mr-3 edit-btn">Edit</button>
                    <button class="text-red-600 hover:text-red-900 delete-btn">Delete</button>
                </td>
            `;
            this.tableBody.appendChild(row);
        });
        
        utils.addTableRowListeners(this.tableBody, this.handleEdit.bind(this), this.handleDelete.bind(this));
    },

    handleSubmit: function(e) {
        e.preventDefault();
        
        const instituteName = document.getElementById('instituteName').value;
        const status = document.querySelector('input[name="status"]:checked').value;
        const editIndex = parseInt(this.editIndexInput.value);
        
        if (!instituteName) {
            alert('Please enter an institute name');
            return;
        }
        
        const newInstitute = { name: instituteName, status: status };
        
        if (editIndex >= 0) {
            sharedData.institutes[editIndex] = newInstitute;
            this.cancelEdit();
        } else {
            sharedData.institutes.push(newInstitute);
        }
        
        saveData();
        this.renderInstitutes();
        this.formControls.resetForm();
    },

    handleEdit: function(e) {
        const row = e.target.closest('tr');
        const index = parseInt(row.getAttribute('data-index'));
        const institute = sharedData.institutes[index];
        
        document.getElementById('instituteName').value = institute.name;
        document.querySelector(`input[name="status"][value="${institute.status}"]`).checked = true;
        
        this.formControls.setEditMode("EDIT INSTITUTE", "UPDATE");
        this.editIndexInput.value = index;
    },

    handleDelete: function(e) {
        if (confirm('Are you sure you want to delete this institute?')) {
            const row = e.target.closest('tr');
            const index = parseInt(row.getAttribute('data-index'));
            
            // Also remove departments and supervisors associated with this institute
            const instituteName = sharedData.institutes[index].name;
            
            sharedData.departments = sharedData.departments.filter(dept => dept.institute !== instituteName);
            sharedData.supervisors = sharedData.supervisors.filter(sup => sup.institute !== instituteName);
            
            sharedData.institutes.splice(index, 1);
            saveData();
            this.renderInstitutes();
            
            if (parseInt(this.editIndexInput.value) === index) {
                this.cancelEdit();
            }
        }
    },

    cancelEdit: function() {
        this.formControls.setAddMode("ADD NEW INSTITUTE", "SAVE & ADD MORE");
        this.formControls.resetForm();
    }
};

// Department Page Functions
const departmentPage = {
    init: function() {
        this.form = document.getElementById('departmentForm');
        this.tableBody = document.getElementById('departmentsTableBody');
        this.instituteSelect = document.getElementById('instituteSelect');
        this.editIndexInput = document.getElementById('editIndex');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.formControls = utils.initFormControls(this.form, this.editIndexInput, this.cancelEditBtn);

        this.populateInstituteDropdown();
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.cancelEditBtn.addEventListener('click', this.cancelEdit.bind(this));
        
        this.renderDepartments();
    },

    populateInstituteDropdown: function() {
        this.instituteSelect.innerHTML = '<option value="">SELECT INSTITUTE NAME</option>';
        sharedData.institutes.forEach(institute => {
            if (institute.status === 'active') {
                const option = document.createElement('option');
                option.value = institute.name;
                option.textContent = institute.name;
                this.instituteSelect.appendChild(option);
            }
        });
    },

    renderDepartments: function() {
        this.tableBody.innerHTML = '';
        sharedData.departments.forEach((department, index) => {
            const instituteExists = sharedData.institutes.some(inst => 
                inst.name === department.institute && inst.status === 'active');
            const instituteDisplay = department.institute && instituteExists ? department.institute : '-';
            
            const row = document.createElement('tr');
            row.className = 'department-card';
            row.setAttribute('data-index', index);
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${department.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${instituteDisplay}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${utils.renderStatusBadge(department.status)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button class="text-blue-600 hover:text-blue-900 mr-3 edit-btn">Edit</button>
                    <button class="text-red-600 hover:text-red-900 delete-btn">Delete</button>
                </td>
            `;
            this.tableBody.appendChild(row);
        });
        
        utils.addTableRowListeners(this.tableBody, this.handleEdit.bind(this), this.handleDelete.bind(this));
    },

    handleSubmit: function(e) {
        e.preventDefault();
        
        const departmentName = document.getElementById('departmentName').value;
        const institute = this.instituteSelect.value;
        const status = document.querySelector('input[name="status"]:checked').value;
        const editIndex = parseInt(this.editIndexInput.value);
        
        if (!departmentName) {
            alert('Please enter a department name');
            return;
        }
        
        const newDepartment = { name: departmentName, institute: institute, status: status };
        
        if (editIndex >= 0) {
            sharedData.departments[editIndex] = newDepartment;
            this.cancelEdit();
        } else {
            sharedData.departments.push(newDepartment);
        }
        
        saveData();
        this.renderDepartments();
        this.formControls.resetForm();
    },

    handleEdit: function(e) {
        const row = e.target.closest('tr');
        const index = parseInt(row.getAttribute('data-index'));
        const department = sharedData.departments[index];
        
        document.getElementById('departmentName').value = department.name;
        this.instituteSelect.value = department.institute;
        document.querySelector(`input[name="status"][value="${department.status}"]`).checked = true;
        
        this.formControls.setEditMode("EDIT DEPARTMENT", "UPDATE");
        this.editIndexInput.value = index;
    },

    handleDelete: function(e) {
        if (confirm('Are you sure you want to delete this department?')) {
            const row = e.target.closest('tr');
            const index = parseInt(row.getAttribute('data-index'));
            
            // Also remove supervisors associated with this department
            const departmentName = sharedData.departments[index].name;
            sharedData.supervisors = sharedData.supervisors.filter(sup => sup.department !== departmentName);
            
            sharedData.departments.splice(index, 1);
            saveData();
            this.renderDepartments();
            
            if (parseInt(this.editIndexInput.value) === index) {
                this.cancelEdit();
            }
        }
    },

    cancelEdit: function() {
        this.formControls.setAddMode("ADD NEW DEPARTMENT", "SAVE & ADD MORE");
        this.formControls.resetForm();
    }
};

// Supervisor Page Functions
const supervisorPage = {
    init: function() {
        this.form = document.getElementById('supervisorForm');
        this.tableBody = document.getElementById('supervisorsTableBody');
        this.departmentSelect = document.getElementById('departmentSelect');
        this.instituteSelect = document.getElementById('instituteSelect');
        this.editIndexInput = document.getElementById('editIndex');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.formControls = utils.initFormControls(this.form, this.editIndexInput, this.cancelEditBtn);

        this.populateDepartmentDropdown();
        this.populateInstituteDropdown();
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.cancelEditBtn.addEventListener('click', this.cancelEdit.bind(this));
        
        this.renderSupervisors();
    },

    populateDepartmentDropdown: function() {
        this.departmentSelect.innerHTML = '<option value="">SELECT DEPARTMENT</option>';
        sharedData.departments.forEach(dept => {
            if (dept.status === 'active') {
                const option = document.createElement('option');
                option.value = dept.name;
                option.textContent = dept.name;
                this.departmentSelect.appendChild(option);
            }
        });
    },

    populateInstituteDropdown: function() {
        this.instituteSelect.innerHTML = '<option value="">SELECT INSTITUTE</option>';
        sharedData.institutes.forEach(inst => {
            if (inst.status === 'active') {
                const option = document.createElement('option');
                option.value = inst.name;
                option.textContent = inst.name;
                this.instituteSelect.appendChild(option);
            }
        });
    },

    renderSupervisors: function() {
        this.tableBody.innerHTML = '';
        sharedData.supervisors.forEach((supervisor, index) => {
            const statusBadge = utils.renderStatusBadge(supervisor.status);
            
            const row = document.createElement('tr');
            row.className = 'supervisor-card';
            row.setAttribute('data-index', index);
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${supervisor.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${supervisor.department || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${supervisor.institute || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${supervisor.email || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button class="text-blue-600 hover:text-blue-900 mr-3 edit-btn">Edit</button>
                    <button class="text-red-600 hover:text-red-900 delete-btn">Delete</button>
                </td>
            `;
            this.tableBody.appendChild(row);
        });
        
        utils.addTableRowListeners(this.tableBody, this.handleEdit.bind(this), this.handleDelete.bind(this));
    },

    handleSubmit: function(e) {
        e.preventDefault();
        
        const supervisorName = document.getElementById('supervisorName').value;
        const department = this.departmentSelect.value;
        const institute = this.instituteSelect.value;
        const email = document.getElementById('email').value;
        const status = document.querySelector('input[name="status"]:checked').value;
        const editIndex = parseInt(this.editIndexInput.value);
        
        if (!supervisorName) {
            alert('Please enter a supervisor name');
            return;
        }
        
        const newSupervisor = {
            name: supervisorName,
            department: department,
            institute: institute,
            email: email,
            status: status
        };
        
        if (editIndex >= 0) {
            sharedData.supervisors[editIndex] = newSupervisor;
            this.cancelEdit();
        } else {
            sharedData.supervisors.push(newSupervisor);
        }
        
        saveData();
        this.renderSupervisors();
        this.formControls.resetForm();
    },

    handleEdit: function(e) {
        const row = e.target.closest('tr');
        const index = parseInt(row.getAttribute('data-index'));
        const supervisor = sharedData.supervisors[index];
        
        document.getElementById('supervisorName').value = supervisor.name;
        this.departmentSelect.value = supervisor.department;
        this.instituteSelect.value = supervisor.institute;
        document.getElementById('email').value = supervisor.email;
        document.querySelector(`input[name="status"][value="${supervisor.status}"]`).checked = true;
        
        this.formControls.setEditMode("EDIT SUPERVISOR", "UPDATE");
        this.editIndexInput.value = index;
    },

    handleDelete: function(e) {
        if (confirm('Are you sure you want to delete this supervisor?')) {
            const row = e.target.closest('tr');
            const index = parseInt(row.getAttribute('data-index'));
            
            sharedData.supervisors.splice(index, 1);
            saveData();
            this.renderSupervisors();
            
            if (parseInt(this.editIndexInput.value) === index) {
                this.cancelEdit();
            }
        }
    },

    cancelEdit: function() {
        this.formControls.setAddMode("ADD NEW SUPERVISOR", "SAVE & ADD MORE");
        this.formControls.resetForm();
    }
};

// Initialize the appropriate page based on which form is present
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('instituteForm')) {
        institutePage.init();
    } else if (document.getElementById('departmentForm')) {
        departmentPage.init();
    } else if (document.getElementById('supervisorForm')) {
        supervisorPage.init();
    }
});