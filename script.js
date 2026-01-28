let modules = [];
const form = document.getElementById('moduleForm');
const moduleList = document.getElementById('moduleList');
const resultsDiv = document.getElementById('results');
const calculateBtn = document.getElementById('calculateBtn');
const alertsDiv = document.getElementById('alerts');

// Load saved modules from localStorage on page load
window.addEventListener('load', () => {
    const savedModules = localStorage.getItem('gradeCalculatorModules');
    if (savedModules) {
        modules = JSON.parse(savedModules);
        updateModuleList();
        if (modules.length > 0) calculateBtn.style.display = 'block';
    }
});

// Save modules to localStorage
function saveModules() {
    localStorage.setItem('gradeCalculatorModules', JSON.stringify(modules));
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    alertsDiv.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

// Real-time validation function
function validateInput(input, errorDiv, condition, errorMsg) {
    if (condition) {
        input.classList.add('invalid');
        errorDiv.textContent = errorMsg;
        errorDiv.style.display = 'block';
        return false;
    } else {
        input.classList.remove('invalid');
        errorDiv.style.display = 'none';
        return true;
    }
}

// Attach real-time validation to inputs
document.getElementById('moduleName').addEventListener('input', () => {
    validateInput(document.getElementById('moduleName'), document.getElementById('nameError'),
        document.getElementById('moduleName').value.trim() === '', 'Module name is required.');
});
document.getElementById('td').addEventListener('input', () => {
    const td = document.getElementById('td');
    validateInput(td, document.getElementById('tdError'),
        td.value && (parseFloat(td.value) < 0 || parseFloat(td.value) > 20), 'TD must be between 0 and 20.');
});
document.getElementById('tp').addEventListener('input', () => {
    const tp = document.getElementById('tp');
    validateInput(tp, document.getElementById('tpError'),
        tp.value && (parseFloat(tp.value) < 0 || parseFloat(tp.value) > 20), 'TP must be between 0 and 20.');
});
document.getElementById('exam').addEventListener('input', () => {
    const exam = document.getElementById('exam');
    validateInput(exam, document.getElementById('examError'),
        !exam.value || parseFloat(exam.value) < 0 || parseFloat(exam.value) > 20, 'Exam must be between 0 and 20.');
});
document.getElementById('coefficient').addEventListener('input', () => {
    const coeff = document.getElementById('coefficient');
    validateInput(coeff, document.getElementById('coeffError'),
        !coeff.value || parseFloat(coeff.value) <= 0, 'Coefficient must be greater than 0.');
});

function calculatePMark(td, tp) {
    if (tp !== null && td !== null) return ((tp * 2) + td) / 3;
    if (tp !== null) return tp;
    if (td !== null) return td;
    return null;
}

function calculateModuleGrade(pMark, exam) {
    return pMark !== null ? (pMark * 0.4) + (exam * 0.6) : exam;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('moduleName').value.trim();
    const td = document.getElementById('td').value ? parseFloat(document.getElementById('td').value) : null;
    const tp = document.getElementById('tp').value ? parseFloat(document.getElementById('tp').value) : null;
    const exam = parseFloat(document.getElementById('exam').value);
    const coefficient = parseFloat(document.getElementById('coefficient').value);

    // Final validation on submit
    let isValid = true;
    isValid &= validateInput(document.getElementById('moduleName'), document.getElementById('nameError'), !name, 'Module name is required.');
    isValid &= validateInput(document.getElementById('exam'), document.getElementById('examError'), isNaN(exam) || exam < 0 || exam > 20, 'Exam must be between 0 and 20.');
    isValid &= validateInput(document.getElementById('coefficient'), document.getElementById('coeffError'), isNaN(coefficient) || coefficient <= 0, 'Coefficient must be greater than 0.');
    if (td !== null) isValid &= validateInput(document.getElementById('td'), document.getElementById('tdError'), td < 0 || td > 20, 'TD must be between 0 and 20.');
    if (tp !== null) isValid &= validateInput(document.getElementById('tp'), document.getElementById('tpError'), tp < 0 || tp > 20, 'TP must be between 0 and 20.');

    if (!isValid) {
        showAlert('Please fix the errors before adding the module.', 'error');
        return;
    }

    const pMark = calculatePMark(td, tp);
    const moduleGrade = calculateModuleGrade(pMark, exam);

    modules.push({ name, td, tp, exam, coefficient, pMark, moduleGrade });
    saveModules(); // Save after adding
    updateModuleList();
    form.reset();
    // Reset error displays
    document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
    document.querySelectorAll('input').forEach(el => el.classList.remove('invalid'));
    calculateBtn.style.display = 'block';
    showAlert('Module added successfully!', 'success');
});

function updateModuleList() {
    moduleList.innerHTML = '';
    modules.forEach((mod, index) => {
        const item = document.createElement('div');
        item.className = 'module-item';
        item.innerHTML = `
            <div class="details">
                <strong>${mod.name}</strong> - P Mark: ${mod.pMark !== null ? mod.pMark.toFixed(2) : 'N/A'}, Module Grade: ${mod.moduleGrade.toFixed(2)}, Coefficient: ${mod.coefficient}
            </div>
            <button class="remove-btn" onclick="removeModule(${index})"><i class="fas fa-trash"></i></button>
        `;
        moduleList.appendChild(item);
    });
}

function removeModule(index) {
    modules.splice(index, 1);
    saveModules(); // Save after removing
    updateModuleList();
    if (modules.length === 0) calculateBtn.style.display = 'none';
    resultsDiv.style.display = 'none';
}

function calculateSemester() {
    if (modules.length === 0) {
        showAlert('No modules to calculate.', 'error');
        return;
    }
    let totalWeightedSum = 0;
    let totalCoefficients = 0;
    modules.forEach(mod => {
        totalWeightedSum += mod.moduleGrade * mod.coefficient;
        totalCoefficients += mod.coefficient;
    });
    const semesterGrade = totalWeightedSum / totalCoefficients;

    resultsDiv.innerHTML = `
        <h2><i class="fas fa-chart-line"></i> Results</h2>
        <p><strong>Semester Grade:</strong> ${semesterGrade.toFixed(2)}</p>
        <p><strong>Total Weighted Sum:</strong> ${totalWeightedSum.toFixed(2)}</p>
        <p><strong>Total Coefficients:</strong> ${totalCoefficients.toFixed(2)}</p>
        <button class="export-btn" onclick="exportResults(${semesterGrade.toFixed(2)}, ${totalWeightedSum.toFixed(2)}, ${totalCoefficients.toFixed(2)})"><i class="fas fa-download"></i> Export Summary</button>
    `;
    resultsDiv.style.display = 'block';
}

function exportResults(semGrade, weightedSum, coeffs) {
    const summary = `Semester Grade: ${semGrade}\nTotal Weighted Sum: ${weightedSum}\nTotal Coefficients: ${coeffs}\n\nModules:\n${modules.map(m => `${m.name}: Grade ${m.moduleGrade.toFixed(2)}, Coeff ${m.coefficient}`).join('\n')}`;
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grade_summary.txt';
    a.click();
    URL.revokeObjectURL(url);
}