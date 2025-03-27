// DOM Elements
const useCameraBtn = document.getElementById('useCamera');
const uploadImageBtn = document.getElementById('uploadImage');
const cameraView = document.getElementById('cameraView');
const uploadView = document.getElementById('uploadView');
const videoElement = document.getElementById('videoElement');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('captureBtn');
const stopCameraBtn = document.getElementById('stopCameraBtn');
const uploadFileInput = document.getElementById('upload-file');
const deleteBtn = document.getElementById('delete-btn');
const imagePreview = document.getElementById('image-preview');
const resultsView = document.getElementById('resultsView');
const attendanceResults = document.getElementById('attendance-results');
const attendanceTable = document.getElementById('attendance-table');
const presentCount = document.getElementById('present-count');
const absentCount = document.getElementById('absent-count');
const currentDateElement = document.getElementById('current-date');

let stream = null;


document.addEventListener("DOMContentLoaded", function () {
    loadData(); // Load data from localStorage on page load
});

document.getElementById("imageUpload").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            document.getElementById("imagePreview").innerHTML = `<img src="${e.target.result}" alt="Uploaded Image">`;
            extractTextFromImage(e.target.result);
        };

        reader.readAsDataURL(file);
    }
});

function extractTextFromImage(imageSrc) {
    document.getElementById("loadingMessage").innerText = "Extracting attendance data... Please wait.";

    Tesseract.recognize(
        imageSrc,
        "eng",
        { logger: m => console.log(m) } 
    ).then(({ data: { text } }) => {
        document.getElementById("loadingMessage").innerText = "";
        processAttendanceData(text);
    }).catch(error => {
        document.getElementById("loadingMessage").innerText = "Error extracting text. Try again!";
        console.error(error);
    });
}

function processAttendanceData(extractedText) {
    // Simulated extracted data
    const attendanceData = [
        { roll: 201, "3/25/2025": "P", "3/26/2026": "P" },
        { roll: 202, "3/25/2025": "P", "3/26/2026": "P" },
        { roll: 203, "3/25/2025": "P", "3/26/2026": "A" },
        { roll: 204, "3/25/2025": "P", "3/26/2026": "P" },
        { roll: 205, "3/25/2025": "P", "3/26/2026": "P" },
        { roll: 206, "3/25/2025": "A", "3/26/2026": "P" },
        { roll: 207, "3/25/2025": "A", "3/26/2026": "A" },
    ];

    saveToLocalStorage(attendanceData);
    displayAttendanceData(attendanceData);
}

function displayAttendanceData(attendanceData) {
    const tableBody = document.querySelector("#attendanceTable tbody");
    tableBody.innerHTML = "";

    let presentCount = 0, absentCount = 0, totalEntries = 0;

    attendanceData.forEach(record => {
        const row = `<tr>
                        <td contenteditable="true">${record.roll}</td>
                        <td contenteditable="true">${record["3/25/2025"]}</td>
                        <td contenteditable="true">${record["3/26/2026"]}</td>
                        <td><button onclick="deleteRow(this)">Delete</button></td>
                     </tr>`;
        tableBody.innerHTML += row;

        presentCount += (record["3/25/2025"] === "P" ? 1 : 0) + (record["3/26/2026"] === "P" ? 1 : 0);
        absentCount += (record["3/25/2025"] === "A" ? 1 : 0) + (record["3/26/2026"] === "A" ? 1 : 0);
        totalEntries += 2;
    });

    const presentPercentage = totalEntries ? ((presentCount / totalEntries) * 100).toFixed(2) : 0;
    const absentPercentage = totalEntries ? ((absentCount / totalEntries) * 100).toFixed(2) : 0;

    document.getElementById("presentCount").innerText = presentPercentage + "%";
    document.getElementById("absentCount").innerText = absentPercentage + "%";
}

function saveToLocalStorage(data) {
    localStorage.setItem("attendanceData", JSON.stringify(data));
}

function loadData() {
    const storedData = localStorage.getItem("attendanceData");
    if (storedData) {
        const attendanceData = JSON.parse(storedData);
        displayAttendanceData(attendanceData);
    }
}

document.getElementById("saveData").addEventListener("click", function () {
    const rows = document.querySelectorAll("#attendanceTable tbody tr");
    let updatedData = [];

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        updatedData.push({
            roll: cells[0].innerText,
            "3/25/2025": cells[1].innerText,
            "3/26/2026": cells[2].innerText
        });
    });

    saveToLocalStorage(updatedData);
    alert("Data saved successfully!");
});

document.getElementById("exportCSV").addEventListener("click", function () {
    let csv = "Roll No,3/25/2025,3/26/2026\n";
    document.querySelectorAll("#attendanceTable tbody tr").forEach(row => {
        let rowData = [];
        row.querySelectorAll("td").forEach(cell => rowData.push(cell.innerText));
        csv += rowData.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "attendance.csv";
    link.click();
});

function deleteRow(btn) {
    btn.parentElement.parentElement.remove();
}
