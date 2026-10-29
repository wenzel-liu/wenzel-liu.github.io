import { describe, expect, it } from 'vitest';
import { normalizePagePath, isNavItemActive } from './nav';

describe('nav helpers', () => {
  it('maps root path to index.html', () => {
    expect(normalizePagePath('/')).toBe('index.html');
    expect(normalizePagePath('/lwh/')).toBe('index.html');
  });

  it('extracts html file name from nested path', () => {
    expect(normalizePagePath('/experience.html')).toBe('experience.html');
  });

  it('matches active nav by file name', () => {
    expect(isNavItemActive('/blog.html', 'blog.html')).toBe(true);
    expect(isNavItemActive('/research.html', 'blog.html')).toBe(false);
    expect(isNavItemActive('/projects.html', 'projects.html')).toBe(true);
    expect(isNavItemActive('/projects.html', 'blog.html')).toBe(false);
  });

  it('keeps the blog section active while reading a nested article', () => {
    expect(isNavItemActive('/posts/rna-metabolism-heart-disease.html', 'blog.html')).toBe(true);
    expect(isNavItemActive('/posts/rna-metabolism-heart-disease.html', 'index.html')).toBe(false);
    expect(isNavItemActive('/medprism/', 'blog.html')).toBe(true);
    expect(isNavItemActive('/sci-industrialist/abundance/', 'blog.html')).toBe(true);
  });
});
