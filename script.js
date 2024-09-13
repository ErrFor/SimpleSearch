
const apiKey = 'AIzaSyDEkhxSj3di6-gQGTF6rhr1jfEChp9QDxs';
const cx = '576dc3c5d7fc64463';

// Function to hide elements initially
function hideElements() {
    const downloadButton = document.getElementById('download-button');
    const formatSelect = document.getElementById('format-select');
    downloadButton.style.display = 'none';
    formatSelect.style.display = 'none';
}

// Function to show elements after search results are fetched
function showElements() {
    const downloadButton = document.getElementById('download-button');
    const formatSelect = document.getElementById('format-select');
    downloadButton.style.display = 'block';
    formatSelect.style.display = 'block';
}

// Hide elements on page load
hideElements();

document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const query = document.getElementById('query').value;
    fetchResults(query);
});

function fetchResults(query, start = 1) {
    fetch(`https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}&start=${start}&num=10`)
        .then(response => response.json())
        .then(data => {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '';

            // Show results container
            resultsDiv.style.display = 'block';

            if (data.items) {
                const results = data.items.map(result => ({
                    title: result.title,
                    link: result.link,
                    snippet: result.snippet
                }));

                results.forEach(result => {
                    const div = document.createElement('div');
                    div.innerHTML = `<h2><a href="${result.link}">${result.title}</a></h2><p>${result.snippet}</p>`;
                    resultsDiv.appendChild(div);
                });

                // Show download button and format select after results are loaded
                showElements();

                const downloadButton = document.getElementById('download-button');
                const formatSelect = document.getElementById('format-select');

                downloadButton.onclick = () => {
                    const format = formatSelect.value;
                    let blob, url, a;

                    if (format === 'json') {
                        blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
                    } else if (format === 'csv') {
                        const csvContent = results.map(e => `"${e.title.replace(/"/g, '""')}",${e.link},"${e.snippet.replace(/"/g, '""')}"`).join('\n');
                        blob = new Blob([csvContent], { type: 'text/csv' });
                    } else if (format === 'xml') {
                        const xmlContent = results.map(e => `<result><title>${e.title}</title><link>${e.link}</link><snippet>${e.snippet}</snippet></result>`).join('');
                        blob = new Blob([`<results>${xmlContent}</results>`], { type: 'application/xml' });
                    }

                    url = URL.createObjectURL(blob);
                    a = document.createElement('a');
                    a.href = url;
                    a.download = `results.${format}`;
                    a.click();
                    URL.revokeObjectURL(url);
                };
            } else {
                resultsDiv.innerHTML = '<p>No results found.</p>';
                document.getElementById('download-button').style.display = 'none';
            }
        })
        .catch(error => console.error('Error fetching search results:', error));
}