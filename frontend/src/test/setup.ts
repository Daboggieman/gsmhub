import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Minimal mock for navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '',
}));

// No TSX/JSX in this file for now to isolate transformer issues
vi.mock('next/image', () => ({
  default: () => 'Mocked Image',
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => 'Mocked Icon',
}));
