/**
 * Integration Tests - Complete User Journeys
 * Tests all 7 apps with realistic user flows
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('User Journey Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // ==========================================================================
  // AUTHENTICATION FLOW
  // ==========================================================================
  describe('Authentication Journey', () => {
    it('should show login screen when not authenticated', () => {
      render(<App />);
      expect(screen.getByText('TBWA Agency Databank')).toBeInTheDocument();
      expect(screen.getByText('Sign in to access your workspace')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('should login successfully with valid credentials', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Fill in credentials
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@tbwa-smp.com');
      await user.type(passwordInput, 'demo123');
      await user.click(submitButton);

      // Wait for redirect to app launcher
      await waitFor(() => {
        expect(screen.getByText('Select an application to continue')).toBeInTheDocument();
      });
    });

    it('should show error with empty credentials', async () => {
      const user = userEvent.setup();
      render(<App />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter both email and password')).toBeInTheDocument();
      });
    });

    it('should logout successfully', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Login first
      await user.type(screen.getByLabelText('Email'), 'admin@tbwa-smp.com');
      await user.type(screen.getByLabelText('Password'), 'demo123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Select an application to continue')).toBeInTheDocument();
      });

      // Open user menu and logout
      const userMenuButton = screen.getByRole('button', { name: /avatar/i });
      await user.click(userMenuButton);
      
      const logoutButton = screen.getByText('Log out');
      await user.click(logoutButton);

      // Should return to login screen
      await waitFor(() => {
        expect(screen.getByText('Sign in to access your workspace')).toBeInTheDocument();
      });
    });

    it('should use demo account quick-fill', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Click on Finance Director demo account
      const fdDemoButton = screen.getByText('Finance Director');
      await user.click(fdDemoButton);

      // Verify fields are filled
      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
      expect(emailInput.value).toBe('fd.finance@tbwa-smp.com');
    });
  });

  // ==========================================================================
  // APP LAUNCHER NAVIGATION
  // ==========================================================================
  describe('App Launcher Journey', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Login
      await user.type(screen.getByLabelText('Email'), 'admin@tbwa-smp.com');
      await user.type(screen.getByLabelText('Password'), 'demo123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Select an application to continue')).toBeInTheDocument();
      });
    });

    it('should display all 7 application cards', () => {
      expect(screen.getByText('Rate Card Pro')).toBeInTheDocument();
      expect(screen.getByText('Travel & Expense')).toBeInTheDocument();
      expect(screen.getByText('Gearroom')).toBeInTheDocument();
      expect(screen.getByText('Finance PPM')).toBeInTheDocument();
      expect(screen.getByText('Procure')).toBeInTheDocument();
      expect(screen.getByText('Creative Workroom')).toBeInTheDocument();
      expect(screen.getByText('Wiki & Docs')).toBeInTheDocument();
    });

    it('should navigate to Rate Card Pro', async () => {
      const user = userEvent.setup();
      const rateCardCard = screen.getByText('Rate Card Pro').closest('.cursor-pointer');
      
      await user.click(rateCardCard!);

      await waitFor(() => {
        expect(screen.getByText('Quote & Proposal Management')).toBeInTheDocument();
      });
    });

    it('should navigate back to launcher from app', async () => {
      const user = userEvent.setup();
      
      // Open an app
      const teCard = screen.getByText('Travel & Expense').closest('.cursor-pointer');
      await user.click(teCard!);

      await waitFor(() => {
        expect(screen.getByText('← All Apps')).toBeInTheDocument();
      });

      // Navigate back
      const backButton = screen.getByText('← All Apps');
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Select an application to continue')).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // RATE CARD PRO JOURNEY
  // ==========================================================================
  describe('Rate Card Pro User Journey', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Login as Finance Director
      await user.type(screen.getByLabelText('Email'), 'fd.finance@tbwa-smp.com');
      await user.type(screen.getByLabelText('Password'), 'demo123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        const rateCardCard = screen.getByText('Rate Card Pro').closest('.cursor-pointer');
        user.click(rateCardCard!);
      });
    });

    it('should display FD dashboard with pending requests', async () => {
      await waitFor(() => {
        expect(screen.getByText('Quote & Proposal Management')).toBeInTheDocument();
      });
    });

    it('should switch between Dashboard and Requests views', async () => {
      const user = userEvent.setup();
      
      await waitFor(() => {
        const requestsTab = screen.getByText('My Requests');
        user.click(requestsTab);
      });

      await waitFor(() => {
        expect(screen.getByText(/pending requests/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // TRAVEL & EXPENSE JOURNEY
  // ==========================================================================
  describe('Travel & Expense User Journey', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<App />);
      
      await user.type(screen.getByLabelText('Email'), 'employee@tbwa-smp.com');
      await user.type(screen.getByLabelText('Password'), 'demo123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        const teCard = screen.getByText('Travel & Expense').closest('.cursor-pointer');
        user.click(teCard!);
      });
    });

    it('should display T&E dashboard', async () => {
      await waitFor(() => {
        expect(screen.getByText(/expense management/i)).toBeInTheDocument();
      });
    });

    it('should navigate between expense sections', async () => {
      const user = userEvent.setup();
      
      await waitFor(() => {
        const cashAdvanceTab = screen.getByText('Cash Advance');
        user.click(cashAdvanceTab);
      });

      await waitFor(() => {
        expect(screen.getByText(/cash advance/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // GEARROOM JOURNEY
  // ==========================================================================
  describe('Gearroom User Journey', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<App />);
      
      await user.type(screen.getByLabelText('Email'), 'employee@tbwa-smp.com');
      await user.type(screen.getByLabelText('Password'), 'demo123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        const gearCard = screen.getByText('Gearroom').closest('.cursor-pointer');
        user.click(gearCard!);
      });
    });

    it('should display equipment catalog', async () => {
      await waitFor(() => {
        expect(screen.getByText(/equipment/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // FINANCE PPM JOURNEY
  // ==========================================================================
  describe('Finance PPM User Journey', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<App />);
      
      await user.type(screen.getByLabelText('Email'), 'fd.finance@tbwa-smp.com');
      await user.type(screen.getByLabelText('Password'), 'demo123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        const ppmCard = screen.getByText('Finance PPM').closest('.cursor-pointer');
        user.click(ppmCard!);
      });
    });

    it('should display portfolio dashboard', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Finance Clarity/i)).toBeInTheDocument();
      });
    });

    it('should show project metrics', async () => {
      await waitFor(() => {
        expect(screen.getByText('Total Projects')).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });

    it('should navigate between PPM views', async () => {
      const user = userEvent.setup();
      
      await waitFor(() => {
        const projectsTab = screen.getByText('Projects');
        user.click(projectsTab);
      });

      await waitFor(() => {
        expect(screen.getByText(/All projects in the portfolio/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // PROCURE JOURNEY
  // ==========================================================================
  describe('Procure User Journey', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<App />);
      
      await user.type(screen.getByLabelText('Email'), 'employee@tbwa-smp.com');
      await user.type(screen.getByLabelText('Password'), 'demo123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        const procureCard = screen.getByText('Procure').closest('.cursor-pointer');
        user.click(procureCard!);
      });
    });

    it('should display supplier catalog', async () => {
      await waitFor(() => {
        expect(screen.getByText(/SAP Ariba-style/i)).toBeInTheDocument();
      });
    });

    it('should search catalog items', async () => {
      const user = userEvent.setup();
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/search catalog/i);
        user.type(searchInput, 'photography');
      });

      await waitFor(() => {
        expect(screen.getByText(/Professional Photography/i)).toBeInTheDocument();
      });
    });

    it('should navigate to requisitions', async () => {
      const user = userEvent.setup();
      
      await waitFor(() => {
        const requisitionsTab = screen.getByText('My Requisitions');
        user.click(requisitionsTab);
      });

      await waitFor(() => {
        expect(screen.getByText(/Track your procurement requests/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // CREATIVE WORKROOM JOURNEY
  // ==========================================================================
  describe('Creative Workroom User Journey', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<App />);
      
      await user.type(screen.getByLabelText('Email'), 'employee@tbwa-smp.com');
      await user.type(screen.getByLabelText('Password'), 'demo123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        const creativeCard = screen.getByText('Creative Workroom').closest('.cursor-pointer');
        user.click(creativeCard!);
      });
    });

    it('should display creative projects', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Creative Project Collaboration/i)).toBeInTheDocument();
      });
    });

    it('should navigate between creative sections', async () => {
      const user = userEvent.setup();
      
      await waitFor(() => {
        const briefsTab = screen.getByText('Briefs');
        user.click(briefsTab);
      });

      await waitFor(() => {
        expect(screen.getByText(/Social Media Campaign Brief/i)).toBeInTheDocument();
      });
    });

    it('should view asset library', async () => {
      const user = userEvent.setup();
      
      await waitFor(() => {
        const assetsTab = screen.getByText('Asset Library');
        user.click(assetsTab);
      });

      await waitFor(() => {
        expect(screen.getByText(/All creative assets/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // WIKI & DOCS JOURNEY
  // ==========================================================================
  describe('Wiki & Docs User Journey', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<App />);
      
      await user.type(screen.getByLabelText('Email'), 'employee@tbwa-smp.com');
      await user.type(screen.getByLabelText('Password'), 'demo123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        const wikiCard = screen.getByText('Wiki & Docs').closest('.cursor-pointer');
        user.click(wikiCard!);
      });
    });

    it('should display workspaces', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Confluence\/Notion-style/i)).toBeInTheDocument();
        expect(screen.getByText('Company Wiki')).toBeInTheDocument();
      });
    });

    it('should search pages', async () => {
      const user = userEvent.setup();
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Search pages/i);
        user.type(searchInput, 'API');
      });
    });

    it('should navigate between wiki sections', async () => {
      const user = userEvent.setup();
      
      await waitFor(() => {
        const recentTab = screen.getByText('Recent');
        user.click(recentTab);
      });

      await waitFor(() => {
        expect(screen.getByText(/Recently Updated/i)).toBeInTheDocument();
      });
    });

    it('should view starred pages', async () => {
      const user = userEvent.setup();
      
      await waitFor(() => {
        const starredTab = screen.getByText('Starred');
        user.click(starredTab);
      });

      await waitFor(() => {
        expect(screen.getByText(/Pages you've marked as favorites/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // END-TO-END MULTI-APP JOURNEY
  // ==========================================================================
  describe('Complete Multi-App User Journey', () => {
    it('should navigate through all apps in sequence', async () => {
      const user = userEvent.setup();
      render(<App />);

      // 1. Login
      await user.type(screen.getByLabelText('Email'), 'admin@tbwa-smp.com');
      await user.type(screen.getByLabelText('Password'), 'demo123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Select an application to continue')).toBeInTheDocument();
      });

      // 2. Open Rate Card Pro
      await user.click(screen.getByText('Rate Card Pro').closest('.cursor-pointer')!);
      await waitFor(() => {
        expect(screen.getByText('Quote & Proposal Management')).toBeInTheDocument();
      });

      // 3. Back to launcher
      await user.click(screen.getByText('← All Apps'));
      await waitFor(() => {
        expect(screen.getByText('Select an application to continue')).toBeInTheDocument();
      });

      // 4. Open Finance PPM
      await user.click(screen.getByText('Finance PPM').closest('.cursor-pointer')!);
      await waitFor(() => {
        expect(screen.getByText(/Finance Clarity/i)).toBeInTheDocument();
      });

      // 5. Back to launcher
      await user.click(screen.getByText('← All Apps'));

      // 6. Open Procure
      await user.click(screen.getByText('Procure').closest('.cursor-pointer')!);
      await waitFor(() => {
        expect(screen.getByText(/SAP Ariba-style/i)).toBeInTheDocument();
      });

      // 7. Back and logout
      await user.click(screen.getByText('← All Apps'));
      const userMenuButton = screen.getByRole('button', { name: /avatar/i });
      await user.click(userMenuButton);
      await user.click(screen.getByText('Log out'));

      await waitFor(() => {
        expect(screen.getByText('Sign in to access your workspace')).toBeInTheDocument();
      });
    });
  });
});
