import { render, screen } from '@testing-library/react';
import VisualPipeline from './VisualPipeline';

describe('VisualPipeline Component', () => {
  const mockSteps = [
    {
      id: 1,
      label: 'Upload Image',
      status: 'complete',
      icon: '📤',
      message: '✓ Image uploaded'
    },
    {
      id: 2,
      label: 'Analyze Disease',
      status: 'active',
      icon: '🔬',
      message: 'Analyzing...'
    },
    {
      id: 3,
      label: 'Generate Advice',
      status: 'pending',
      icon: '💡',
      message: ''
    }
  ];

  test('renders all pipeline steps', () => {
    render(<VisualPipeline steps={mockSteps} />);

    expect(screen.getByText('Upload Image')).toBeInTheDocument();
    expect(screen.getByText('Analyze Disease')).toBeInTheDocument();
    expect(screen.getByText('Generate Advice')).toBeInTheDocument();
  });

  test('displays step icons', () => {
    render(<VisualPipeline steps={mockSteps} />);

    expect(screen.getByText('📤')).toBeInTheDocument();
    expect(screen.getByText('🔬')).toBeInTheDocument();
    expect(screen.getByText('💡')).toBeInTheDocument();
  });

  test('displays step messages when provided', () => {
    render(<VisualPipeline steps={mockSteps} />);

    expect(screen.getByText('✓ Image uploaded')).toBeInTheDocument();
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });

  test('applies correct CSS classes for step status', () => {
    const { container } = render(<VisualPipeline steps={mockSteps} />);

    const steps = container.querySelectorAll('.pipeline-step');
    expect(steps[0]).toHaveClass('complete');
    expect(steps[1]).toHaveClass('active');
    expect(steps[2]).toHaveClass('pending');
  });

  test('shows checkmark for completed steps', () => {
    render(<VisualPipeline steps={mockSteps} />);

    const checkmarks = screen.getAllByText('✓');
    expect(checkmarks.length).toBeGreaterThan(0);
  });

  test('shows spinner for active steps', () => {
    const { container } = render(<VisualPipeline steps={mockSteps} />);

    const spinner = container.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveTextContent('⟳');
  });

  test('handles steps without messages', () => {
    const stepsWithoutMessages = [
      {
        id: 1,
        label: 'Step 1',
        status: 'pending',
        icon: '1️⃣'
      },
      {
        id: 2,
        label: 'Step 2',
        status: 'pending',
        icon: '2️⃣'
      }
    ];

    render(<VisualPipeline steps={stepsWithoutMessages} />);

    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  test('updates when step status changes', () => {
    const { rerender, container } = render(<VisualPipeline steps={mockSteps} />);

    const updatedSteps = mockSteps.map(step =>
      step.id === 2 ? { ...step, status: 'complete', message: '✓ Analysis complete' } : step
    );

    rerender(<VisualPipeline steps={updatedSteps} />);

    expect(screen.getByText('✓ Analysis complete')).toBeInTheDocument();
    const steps = container.querySelectorAll('.pipeline-step');
    expect(steps[1]).toHaveClass('complete');
  });

  test('renders empty pipeline gracefully', () => {
    const { container } = render(<VisualPipeline steps={[]} />);

    const pipelineSection = container.querySelector('.pipeline-section');
    expect(pipelineSection).toBeInTheDocument();
    expect(pipelineSection.children.length).toBe(0);
  });

  test('handles multiple steps with same status', () => {
    const allPendingSteps = [
      { id: 1, label: 'Step 1', status: 'pending', icon: '1️⃣' },
      { id: 2, label: 'Step 2', status: 'pending', icon: '2️⃣' },
      { id: 3, label: 'Step 3', status: 'pending', icon: '3️⃣' }
    ];

    const { container } = render(<VisualPipeline steps={allPendingSteps} />);

    const steps = container.querySelectorAll('.pipeline-step.pending');
    expect(steps.length).toBe(3);
  });
});
