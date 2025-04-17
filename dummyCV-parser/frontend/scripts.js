// frontend/scripts.js
function resetButton(event) {
    event.target.disabled = false;
    event.target.textContent = 'Upload';
    event.target.classList.remove('loading');
}

async function upload(event) {
    const fileInput = document.querySelector('input[type="file"]');
    const file = fileInput.files[0];
    const resultDiv = document.getElementById('cv-info');

    if (!file) {
        return alert('Please select a file');
    }

    event.target.disabled = true;
    event.target.textContent = 'Uploading...';
    event.target.classList.add('loading');

    try {
        // Create form data for the file upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload file to our backend
        const uploadResponse = await fetch('http://localhost:3100/upload-cv', {
            method: 'POST',
            body: formData
        });

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.message || 'Failed to upload file');
        }

        const uploadData = await uploadResponse.json();
        const fileUrl = uploadData.fileUrl;
        
        event.target.textContent = 'Processing CV...';
        
        // Process CV with backend
        const cvResponse = await fetch("http://localhost:3100/process-cv", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileUrl: fileUrl
            })
        });

        if (!cvResponse.ok) {
            throw new Error('Failed to process CV');
        }

        const cvData = await cvResponse.json();
        
        // Display results
        resultDiv.innerHTML = `
            <h2>CV Information</h2>
            <pre>${JSON.stringify(cvData, null, 2)}</pre>
        `;
        
        resetButton(event);
    } catch (err) {
        console.error(err);
        resetButton(event);
        resultDiv.innerHTML = `<p class="error">Error: ${err.message}</p>`;
        alert('Error: ' + err.message);
    }
}