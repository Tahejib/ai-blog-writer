const resultDiv = document.getElementById('result');
const loadingDiv = document.getElementById('loading');
const historyDiv = document.getElementById('history');
const toggleBtn = document.getElementById('toggleTheme');
const generateBtn = document.getElementById('generateBtn');

// Load theme from localStorage
document.body.classList.toggle('dark', localStorage.getItem('theme') === 'dark');

const topicInput = document.getElementById('topicInput');

// Restore draft on page load
window.addEventListener('DOMContentLoaded', () => {
  const savedDraft = localStorage.getItem('draftTopic');
  if (savedDraft) {
    topicInput.value = savedDraft;
  }
});

// Save draft whenever user types
topicInput.addEventListener('input', () => {
  localStorage.setItem('draftTopic', topicInput.value);
});


// Toggle Theme
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const mode = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', mode);
  toggleBtn.innerText = mode === 'dark' ? '☀️' : '🌙';
});

function generateBlog() {
  
  const topic = document.getElementById('topicInput').value.trim();
  if (!topic) {
    resultDiv.innerText = "⚠️ Please enter a blog topic.";
    return;
  }

  document.getElementById('overlay').style.display = 'flex'; // show overlay
  resultDiv.innerText = '';
  document.getElementById('actions').style.display = 'none';

  setTimeout(() => {
    const blog = `
    🌟 Title: ${topic}

    Welcome to this blog post about "${topic}"! Let's explore it.

    🔹 ${topic} is trending in tech.
    🔹 It's useful in many areas.
    🔹 Mastering ${topic} helps in career.

    Thanks for reading!

    ✍️ Blog created by: AI Blog Writer (Free Version)
    `;

    typeText(blog.trim(), resultDiv, () => {
      const wordCount = blog.trim().split(/\s+/).length;
const readTime = Math.ceil(wordCount / 200);
document.getElementById('stats').innerText = `📖 ${wordCount} words • ⏱️ ${readTime} min read`;

  document.getElementById('actions').style.display = 'block';
  document.getElementById('overlay').style.display = 'none';
  saveToHistory(topic, blog.trim());
  
});

  }, 1200);
}

// Save blog to local history
function saveToHistory(topic, content) {
  const history = JSON.parse(localStorage.getItem('blogs') || "[]");
  const newEntry = {
    topic,
    content,
    date: new Date().toLocaleString()
  };
  history.unshift(newEntry);
  localStorage.setItem('blogs', JSON.stringify(history));
  renderHistory();
}

// Add edit and delete buttons for each history item
function renderHistory(searchTerm = '') {
  const history = JSON.parse(localStorage.getItem('blogs') || "[]");
  
  const filtered = history.filter(entry => 
    entry.topic.toLowerCase().includes(searchTerm) || 
    entry.content.toLowerCase().includes(searchTerm)
  );

  historyDiv.innerHTML = filtered.length ? filtered.map((entry, index) => `
  <div class="history-item">
    <strong>${entry.topic}</strong>
    <button class="favorite-btn" onclick="toggleFavorite(${index})" aria-label="Toggle Favorite">
      ${entry.favorite ? '⭐' : '☆'}
    </button>
    <br/>
    <em>${entry.date}</em><br/>
    <p>${entry.content.slice(0, 100)}...</p>
  </div>
`).join('') : `<p>No matching history found.</p>`;

}


function editHistory(index) {
  const history = JSON.parse(localStorage.getItem('blogs') || "[]");
  const entry = history[index];
  document.getElementById('topicInput').value = entry.topic;
  resultDiv.innerText = entry.content;
  // Remove the entry being edited from history so it can be replaced on next save
  history.splice(index, 1);
  localStorage.setItem('blogs', JSON.stringify(history));
  renderHistory();
}

function deleteHistory(index) {
  const history = JSON.parse(localStorage.getItem('blogs') || "[]");
  history.splice(index, 1);
  localStorage.setItem('blogs', JSON.stringify(history));
  renderHistory();
}

function clearHistory() {
  if (confirm("Are you sure you want to clear all blog history?")) {
    localStorage.removeItem('blogs');
    renderHistory();
  }
}


function copyBlog() {
  const text = resultDiv.textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast("📋 Blog copied to clipboard!");
  });
}


function downloadBlog() {
  const blogContent = resultDiv.innerText;
  if (!blogContent.trim()) {
    showToast("⚠️ No blog to export.");
    return;
  }

  const blogElement = document.createElement('div');
  blogElement.style.padding = '20px';
  blogElement.style.fontFamily = 'Georgia, serif';
  blogElement.style.lineHeight = '1.6';
  blogElement.style.color = '#111';
  blogElement.innerHTML = `<h2 style="color:#1976d2;">AI Blog</h2><pre>${blogContent}</pre>`;

  const opt = {
    margin:       0.5,
    filename:     'blog.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().from(blogElement).set(opt).save();
}



// Load on start
renderHistory();
toggleBtn.innerText = document.body.classList.contains('dark') ? '☀️' : '🌙';

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const content = resultDiv.innerText;

  const lines = doc.splitTextToSize(content, 180);
  doc.text(lines, 10, 10);
  doc.save("blog.pdf");

  showToast("📝 Blog exported as PDF!");
}


function typeText(text, element, callback) {
  let index = 0;
  element.innerText = '';
  const interval = setInterval(() => {
    element.innerText += text.charAt(index);
    index++;
    if (index === text.length) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 20);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
function sendEmail() {
  const email = document.getElementById('emailInput').value.trim();
  const blogContent = resultDiv.innerText;

  if (!email) {
    showToast("⚠️ Please enter a valid email address.");
    return;
  }
  if (!blogContent) {
    showToast("⚠️ No blog content to send.");
    return;
  }

  // For demo purposes, we'll open the user's mail client using mailto:
  const subject = encodeURIComponent("AI Blog Writer - Your Generated Blog");
  const body = encodeURIComponent(blogContent);

  const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

  window.location.href = mailtoLink;

  showToast(`📧 Email client opened to send blog to ${email}`);
}
document.getElementById('sendEmailBtn').addEventListener('click', sendEmail);


function toggleFavorite(index) {
  const history = JSON.parse(localStorage.getItem('blogs') || "[]");
  if (history[index]) {
    history[index].favorite = !history[index].favorite; // toggle favorite flag
    localStorage.setItem('blogs', JSON.stringify(history));
    renderHistory();
  }
}
