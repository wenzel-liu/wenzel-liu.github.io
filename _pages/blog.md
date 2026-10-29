---
layout: portfolio-redirect
redirect_to: /blog.html
title: Blogs
permalink: /blog/
---

<div class="modern-homepage">
  <nav class="main-nav">
    <div class="nav-container">
      <div class="nav-links">
        <a href="/" class="nav-link">Home</a>
        <a href="/bio/" class="nav-link">Bio</a>
        <a href="/blog/" class="nav-link active">Blogs</a>
        <a href="/experience/" class="nav-link">Experience</a>
        <a href="/projects/" class="nav-link">Projects</a>
        <a href="/uses/" class="nav-link">Uses</a>
      </div>
      <div class="theme-toggle">
        <button class="theme-btn" onclick="toggleTheme()">🌙</button>
      </div>
    </div>
  </nav>

  <main class="main-content">
    <div class="content-container">
      <h1 class="main-title">Blogs</h1>
      
      <div class="search-container">
        <input type="text" class="search-box" placeholder="Search blog posts..." id="searchInput">
      </div>
      
      <div class="blog-list">
        {% for post in site.posts %}
        <div class="blog-item">
          <div class="blog-date">{{ post.date | date: "%b %d, %Y" }}</div>
          <div class="blog-content">
            <h2 class="blog-title">
              <span class="blog-icon">
                {% if post.categories contains "research" %}🔬
                {% elsif post.categories contains "academic" %}🎓
                {% elsif post.categories contains "personal" %}📝
                {% else %}📖{% endif %}
              </span>
              {{ post.title }}
            </h2>
            <p class="blog-description">
              {{ post.excerpt | strip_html | truncate: 150 }}
            </p>
            <div class="blog-tags">
              {% for tag in post.tags limit:3 %}
                <span class="tag">{{ tag }}</span>
              {% endfor %}
            </div>
            <a href="{{ post.url | relative_url }}" class="read-more">Read more →</a>
          </div>
        </div>
        {% endfor %}
        
        {% if site.posts.size == 0 %}
        <div class="no-posts">
          <p>No blog posts available yet. Check back soon!</p>
        </div>
        {% endif %}
      </div>
      
      <div class="no-results" id="noResults" style="display: none;">
        No blog posts found matching your search.
      </div>
    </div>
  </main>
</div>

<style>
.search-container {
  margin-bottom: 2rem;
  text-align: center;
}

.search-box {
  width: 100%;
  max-width: 400px;
  padding: 12px 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-box:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
}

.search-box::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.blog-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.blog-item {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.blog-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.15);
}

.blog-date {
  min-width: 120px;
  color: #4CAF50;
  font-weight: 600;
  font-size: 14px;
}

.blog-content {
  flex: 1;
}

.blog-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.blog-icon {
  font-size: 1.2rem;
}

.blog-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.blog-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.tag {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
}

.read-more {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.read-more:hover {
  color: #66BB6A;
}

.no-posts, .no-results {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

@media (max-width: 768px) {
  .blog-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .blog-date {
    min-width: auto;
  }
}
</style>

<script>
function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const themeBtn = document.querySelector('.theme-btn');
  themeBtn.textContent = document.body.classList.contains('light-theme') ? '☀️' : '🌙';
}

// Blog search functionality
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const blogItems = document.querySelectorAll('.blog-item');
  const noResults = document.getElementById('noResults');

  if (searchInput && blogItems.length > 0) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase().trim();
      let visibleItems = 0;

      blogItems.forEach(item => {
        const title = item.querySelector('.blog-title').textContent.toLowerCase();
        const description = item.querySelector('.blog-description').textContent.toLowerCase();
        const tags = Array.from(item.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase()).join(' ');
        
        if (searchTerm === '' || title.includes(searchTerm) || description.includes(searchTerm) || tags.includes(searchTerm)) {
          item.style.display = 'flex';
          visibleItems++;
        } else {
          item.style.display = 'none';
        }
      });

      // Show/hide no results message
      if (noResults) {
        if (visibleItems === 0 && searchTerm !== '') {
          noResults.style.display = 'block';
        } else {
          noResults.style.display = 'none';
        }
      }
    });
  }
});
</script> 