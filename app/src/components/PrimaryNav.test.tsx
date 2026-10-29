import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PrimaryNav } from './PrimaryNav';

describe('PrimaryNav', () => {
  it('marks the active page with aria-current', () => {
    render(<PrimaryNav currentPath="/experience.html" />);

    expect(screen.getByRole('link', { name: 'Experience' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Bio' })).not.toHaveAttribute('aria-current', 'page');
  });
});
