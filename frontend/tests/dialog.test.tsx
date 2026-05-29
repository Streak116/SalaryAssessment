import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import Dialog from '@/components/Dialog';

describe('Reusable Dialog Component', () => {
  it('does not render when open is false', () => {
    const { container } = render(
      <Dialog
        open={false}
        title="Test Dialog"
        message="Test Message"
        onConfirm={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders title and message when open', () => {
    render(
      <Dialog
        open={true}
        title="Custom Title"
        message="Custom Message text here"
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByRole('heading', { name: /custom title/i })).toBeInTheDocument();
    expect(screen.getByText('Custom Message text here')).toBeInTheDocument();
  });

  describe('Info Type (default)', () => {
    it('renders with only one button (OK by default)', () => {
      const handleConfirm = vi.fn();
      render(
        <Dialog
          open={true}
          type="info"
          title="Info Title"
          message="Info Message"
          onConfirm={handleConfirm}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveTextContent('OK');

      fireEvent.click(buttons[0]);
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it('uses custom confirm label', () => {
      render(
        <Dialog
          open={true}
          type="info"
          title="Info Title"
          message="Info Message"
          confirmLabel="Got it"
          onConfirm={vi.fn()}
        />
      );
      expect(screen.getByRole('button', { name: /got it/i })).toBeInTheDocument();
    });
  });

  describe('Confirmation Type', () => {
    it('renders two buttons (Confirm and Cancel)', () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();

      render(
        <Dialog
          open={true}
          type="confirmation"
          title="Confirm Action"
          message="Are you sure?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );

      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      const confirmBtn = screen.getByRole('button', { name: /confirm/i });

      expect(cancelBtn).toBeInTheDocument();
      expect(confirmBtn).toBeInTheDocument();

      fireEvent.click(cancelBtn);
      expect(handleCancel).toHaveBeenCalledTimes(1);

      fireEvent.click(confirmBtn);
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it('supports custom button labels', () => {
      render(
        <Dialog
          open={true}
          type="confirmation"
          title="Confirm Action"
          message="Are you sure?"
          confirmLabel="Yes, Delete"
          cancelLabel="No, Keep"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /yes, delete/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /no, keep/i })).toBeInTheDocument();
    });
  });

  describe('Warning Type', () => {
    it('renders two buttons (Confirm and Cancel)', () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();

      render(
        <Dialog
          open={true}
          type="warning"
          title="Danger Warning"
          message="Warning details"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );

      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      const confirmBtn = screen.getByRole('button', { name: /confirm/i });

      expect(cancelBtn).toBeInTheDocument();
      expect(confirmBtn).toBeInTheDocument();

      fireEvent.click(cancelBtn);
      expect(handleCancel).toHaveBeenCalledTimes(1);

      fireEvent.click(confirmBtn);
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });
  });
});
