// --- 1. Cursor Interaction Effect ---
const cursorGlow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', (e) => {
    // Smooth tracking
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});
document.addEventListener('mousedown', () => cursorGlow.style.transform = 'translate(-50%, -50%) scale(0.8)');
document.addEventListener('mouseup', () => cursorGlow.style.transform = 'translate(-50%, -50%) scale(1)');

// --- 2. KSSR Mock Database (Scalable) ---
const kssrData = {
    "English": {
        "Year 1": {
            themes: ["World of Self, Family and Friends", "World of Stories", "World of Knowledge"],
            cs: [
                "1.1 Recognise and reproduce target language sounds",
                "2.1 Communicate simple information intelligibly",
                "3.1 Recognise words in linear and non-linear texts"
            ],
            ls: [
                "1.1.1 Recognise and reproduce with support a limited range of high frequency target language phonemes",
                "2.1.1 Give very basic personal information using fixed phrases",
                "3.1.1 Identify, recognise and name the letters of the alphabet"
            ]
        },
        "Year 2": {
            themes: ["World of Self, Family and Friends", "World of Stories", "World of Knowledge"],
            cs: [
                "1.2 Understand meaning in a variety of familiar contexts",
                "2.2 Use appropriate communication strategies"
            ],
            ls: [
                "1.2.1 Understand with support the main idea of simple sentences",
                "2.2.1 Keep interaction going in short exchanges by using suitable non-verbal responses"
            ]
        }
    },
    "Mathematics": {
        "Year 1": {
            themes: ["Numbers and Operations", "Measurement and Geometry", "Statistics and Probability"],
            cs: [
                "1.1 Quantity intuitively",
                "1.2 Number value",
                "2.1 Add and subtract within 100"
            ],
            ls: [
                "1.1.1 State quantity by comparing",
                "1.2.1 Name numbers up to 100",
                "2.1.1 Add two numbers within 100"
            ]
        }
    }
};

// --- 3. DOM Elements ---
const form = document.getElementById('lesson-form');
const subjectSelect = document.getElementById('subject');
const yearSelect = document.getElementById('year');
const themeSelect = document.getElementById('theme');
const csSelect = document.getElementById('content-standard');
const lsSelect = document.getElementById('learning-standard');
const objectiveBuilder = document.getElementById('objective-builder');
const lessonObjective = document.getElementById('lesson-objective');

// Sections
const formSection = document.getElementById('form-container');
const outputSection = document.getElementById('output-container');

// --- 4. Dynamic Dropdown Logic ---
function populateDropdown(selectElement, optionsArray) {
    selectElement.innerHTML = '<option value="" disabled selected>Select an option</option>';
    if (!optionsArray) return;
    optionsArray.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        selectElement.appendChild(option);
    });
}

function updateKssrOptions() {
    const subject = subjectSelect.value;
    const year = yearSelect.value;

    if (subject && year && kssrData[subject] && kssrData[subject][year]) {
        const data = kssrData[subject][year];
        populateDropdown(themeSelect, data.themes);
        populateDropdown(csSelect, data.cs);
        populateDropdown(lsSelect, data.ls);
    } else {
        // Clear dropdowns if no match
        populateDropdown(themeSelect, []);
        populateDropdown(csSelect, []);
        populateDropdown(lsSelect, []);
    }
}

subjectSelect.addEventListener('change', updateKssrOptions);
yearSelect.addEventListener('change', updateKssrOptions);

// Objective Builder Logic
objectiveBuilder.addEventListener('change', (e) => {
    const currentText = lessonObjective.value;
    const appendText = e.target.value;
    if(appendText) {
        lessonObjective.value = currentText ? `${currentText}\n${appendText}` : appendText;
        e.target.value = ""; // reset builder
        saveToLocalStorage(); // trigger save
    }
});

// --- 5. Local Storage Persistence ---
function saveToLocalStorage() {
    const formData = {};
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        formData[input.id] = input.value;
    });
    localStorage.setItem('kssrPlannerData', JSON.stringify(formData));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('kssrPlannerData');
    if (savedData) {
        const formData = JSON.parse(savedData);
        
        // Restore Subject and Year first to trigger dependency logic
        if (formData['subject']) subjectSelect.value = formData['subject'];
        if (formData['year']) yearSelect.value = formData['year'];
        updateKssrOptions(); // Hydrate the dependent dropdowns

        // Restore everything else
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (formData[input.id] && input.id !== 'objective-builder') {
                input.value = formData[input.id];
            }
        });
    }
}

// Auto-save on any form change
form.addEventListener('input', saveToLocalStorage);
form.addEventListener('change', saveToLocalStorage);

// Clear data
document.getElementById('clear-btn').addEventListener('click', () => {
    if(confirm('Are you sure you want to clear all data?')) {
        localStorage.removeItem('kssrPlannerData');
        form.reset();
        updateKssrOptions();
    }
});

// --- 6. Form Submission & Output Generation ---
form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Mapping inputs to outputs
    const fields = [
        'teacher-name', 'class-name', 'date', 'day', 'time', 'pupils',
        'theme', 'topic', 'content-standard', 'learning-standard',
        'lesson-objective', 'success-criteria', 'teaching-aids',
        'emk', 'hots', 'assessment', 'reflection'
    ];

    // Populate standard fields
    fields.forEach(field => {
        const val = document.getElementById(field).value || '-';
        const outTarget = document.getElementById(`out-${field.replace(/-\w+/g, (m) => m.replace('-',''))}`);
        // Handle specific naming discrepancies map
        const exactMap = {
            'teacher-name': 'out-teacher', 'class-name': 'out-class',
            'content-standard': 'out-cs', 'learning-standard': 'out-ls',
            'lesson-objective': 'out-objective', 'success-criteria': 'out-success',
            'teaching-aids': 'out-aids'
        };
        const targetId = exactMap[field] || `out-${field}`;
        const targetEl = document.getElementById(targetId);
        if(targetEl) {
            targetEl.textContent = val;
        }
    });

    // Handle Title
    document.getElementById('out-subject-year').textContent = `${subjectSelect.value} - ${yearSelect.value}`;

    // Switch Views
    formSection.classList.add('hidden');
    outputSection.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- 7. Output Action Buttons ---
document.getElementById('edit-btn').addEventListener('click', () => {
    outputSection.classList.add('hidden');
    formSection.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('print-btn').addEventListener('click', () => {
    window.print();
});

document.getElementById('pdf-btn').addEventListener('click', () => {
    const element = document.getElementById('lesson-plan-card');
    const opt = {
        margin:       0.5,
        filename:     `LessonPlan_${subjectSelect.value}_${document.getElementById('date').value}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    // UI Feedback
    const btn = document.getElementById('pdf-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
    
    html2pdf().set(opt).from(element).save().then(() => {
        btn.innerHTML = originalText;
    });
});

// --- 8. Init ---
window.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    
    // Set default date to today if empty
    const dateInput = document.getElementById('date');
    if(!dateInput.value) {
        dateInput.valueAsDate = new Date();
    }
});
