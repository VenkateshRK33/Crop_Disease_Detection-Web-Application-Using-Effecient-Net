import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageUpload from './ImageUpload';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('ImageUpload Component', () => {
  const mockOnAnalysisStart = jest.fn();
  const mockOnAnalysisComplete = jest.fn();
  const mockUpdatePipelineStep = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  test('renders upload box with instructions', () => {
    render(
      <ImageUpload
        onAnalysisStart={mockOnAnalysisStart}
        onAnalysisComplete={mockOnAnalysisComplete}
        updatePipelineStep={mockUpdatePipelineStep}
      />
    );

    expect(screen.getByText(/Click or drag to upload plant image/i)).toBeInTheDocument();
    expect(screen.getByText(/Supported formats: JPG, PNG, WEBP/i)).toBeInTheDocument();
  });

  test('validates file type - accepts valid image types', () => {
    render(
      <ImageUpload
        onAnalysisStart={mockOnAnalysisStart}
        onAnalysisComplete={mockOnAnalysisComplete}
        updatePipelineStep={mockUpdatePipelineStep}
      />
    );

    const input = screen.getByLabelText(/Click or drag to upload plant image/i);
    const validFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [validFile] } });

    expect(screen.queryByText(/Invalid file type/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Change Image/i)).toBeInTheDocument();
  });

  test('validates file type - rejects invalid file types', () => {
    render(
      <ImageUpload
        onAnalysisStart={mockOnAnalysisStart}
        onAnalysisComplete={mockOnAnalysisComplete}
        updatePipelineStep={mockUpdatePipelineStep}
      />
    );

    const input = screen.getByLabelText(/Click or drag to upload plant image/i);
    const invalidFile = new File(['document'], 'test.pdf', { type: 'application/pdf' });

    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
  });

  test('validates file size - rejects files over 10MB', () => {
    render(
      <ImageUpload
        onAnalysisStart={mockOnAnalysisStart}
        onAnalysisComplete={mockOnAnalysisComplete}
        updatePipelineStep={mockUpdatePipelineStep}
      />
    );

    const input = screen.getByLabelText(/Click or drag to upload plant image/i);
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(screen.getByText(/File size exceeds 10MB/i)).toBeInTheDocument();
  });

  test('displays preview after file selection', () => {
    render(
      <ImageUpload
        onAnalysisStart={mockOnAnalysisStart}
        onAnalysisComplete={mockOnAnalysisComplete}
        updatePipelineStep={mockUpdatePipelineStep}
      />
    );

    const input = screen.getByLabelText(/Click or drag to upload plant image/i);
    const validFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [validFile] } });

    expect(screen.getByAltText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Remove Image')).toBeInTheDocument();
    expect(screen.getByText('Analyze Plant')).toBeInTheDocument();
  });

  test('removes image when remove button is clicked', () => {
    render(
      <ImageUpload
        onAnalysisStart={mockOnAnalysisStart}
        onAnalysisComplete={mockOnAnalysisComplete}
        updatePipelineStep={mockUpdatePipelineStep}
      />
    );

    const input = screen.getByLabelText(/Click or drag to upload plant image/i);
    const validFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [validFile] } });
    expect(screen.getByAltText('Preview')).toBeInTheDocument();

    const removeButton = screen.getByText('Remove Image');
    fireEvent.click(removeButton);

    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });

  test('handles successful analysis', async () => {
    const mockResponse = {
      data: {
        success: true,
        prediction: {
          disease: 'Tomato_Late_blight',
          confidence: 0.95,
          topPredictions: []
        },
        conversationId: 'conv-123'
      }
    };

    axios.post.mockResolvedValue(mockResponse);

    render(
      <ImageUpload
        onAnalysisStart={mockOnAnalysisStart}
        onAnalysisComplete={mockOnAnalysisComplete}
        updatePipelineStep={mockUpdatePipelineStep}
      />
    );

    const input = screen.getByLabelText(/Click or drag to upload plant image/i);
    const validFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [validFile] } });

    const analyzeButton = screen.getByText('Analyze Plant');
    fireEvent.click(analyzeButton);

    expect(mockOnAnalysisStart).toHaveBeenCalled();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:4000/api/analyze',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      );
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(mockOnAnalysisComplete).toHaveBeenCalled();
    }, { timeout: 3000 });

    expect(mockOnAnalysisComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        prediction: mockResponse.data.prediction,
        imageUrl: 'mock-url'
      })
    );
  });

  test('handles network error with retry button', async () => {
    axios.post.mockRejectedValue({ request: {} });

    render(
      <ImageUpload
        onAnalysisStart={mockOnAnalysisStart}
        onAnalysisComplete={mockOnAnalysisComplete}
        updatePipelineStep={mockUpdatePipelineStep}
      />
    );

    const input = screen.getByLabelText(/Click or drag to upload plant image/i);
    const validFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [validFile] } });

    const analyzeButton = screen.getByText('Analyze Plant');
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  test('disables buttons during analysis', async () => {
    axios.post.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <ImageUpload
        onAnalysisStart={mockOnAnalysisStart}
        onAnalysisComplete={mockOnAnalysisComplete}
        updatePipelineStep={mockUpdatePipelineStep}
      />
    );

    const input = screen.getByLabelText(/Click or drag to upload plant image/i);
    const validFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [validFile] } });

    const analyzeButton = screen.getByText('Analyze Plant');
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    });

    expect(screen.getByText('Remove Image')).toBeDisabled();
    expect(screen.getByText('Analyzing...')).toBeDisabled();
  });
});
