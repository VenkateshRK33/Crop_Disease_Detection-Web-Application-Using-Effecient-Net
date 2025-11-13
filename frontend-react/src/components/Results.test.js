import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Results from './Results';

// Mock fetch for streaming
global.fetch = jest.fn();

describe('Results Component', () => {
  const mockData = {
    prediction: {
      disease: 'Tomato_Late_blight',
      confidence: 0.95,
      topPredictions: [
        { class: 'Tomato_Late_blight', confidence: 0.95 },
        { class: 'Tomato_Early_blight', confidence: 0.03 },
        { class: 'Tomato_Leaf_Mold', confidence: 0.01 }
      ]
    },
    conversationId: 'conv-123',
    suggestedQuestions: [
      'What causes this disease?',
      'How can I treat it?',
      'How can I prevent it?'
    ],
    imageUrl: 'mock-image-url'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockStreamingResponse = (chunks) => {
    let chunkIndex = 0;
    const encoder = new TextEncoder();
    
    return {
      ok: true,
      body: {
        getReader: () => ({
          read: async () => {
            if (chunkIndex < chunks.length) {
              const chunk = chunks[chunkIndex++];
              const encoded = encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`);
              return { done: false, value: encoded };
            }
            return { done: true };
          }
        })
      }
    };
  };

  test('renders disease information correctly', async () => {
    global.fetch.mockResolvedValue(mockStreamingResponse([
      { chunk: 'Initial advice', done: false },
      { done: true }
    ]));

    render(<Results data={mockData} />);

    expect(screen.getByText('Tomato Late Blight')).toBeInTheDocument();
    expect(screen.getByText(/95.0%/)).toBeInTheDocument();
    expect(screen.getByAltText('Uploaded plant')).toBeInTheDocument();
  });

  test('displays low confidence warning when confidence < 50%', async () => {
    const lowConfidenceData = {
      ...mockData,
      prediction: {
        ...mockData.prediction,
        confidence: 0.45
      }
    };

    global.fetch.mockResolvedValue(mockStreamingResponse([
      { chunk: 'Advice', done: false },
      { done: true }
    ]));

    render(<Results data={lowConfidenceData} />);

    await waitFor(() => {
      expect(screen.getByText('Low Confidence Detection')).toBeInTheDocument();
    });

    expect(screen.getByText(/Consider retaking the image/i)).toBeInTheDocument();
  });

  test('displays alternative predictions', async () => {
    global.fetch.mockResolvedValue(mockStreamingResponse([
      { chunk: 'Advice', done: false },
      { done: true }
    ]));

    render(<Results data={mockData} />);

    await waitFor(() => {
      expect(screen.getByText('Alternative Possibilities:')).toBeInTheDocument();
    });

    expect(screen.getByText('Tomato Early Blight')).toBeInTheDocument();
    expect(screen.getByText('Tomato Leaf Mold')).toBeInTheDocument();
  });

  test('streams initial AI advice on mount', async () => {
    const chunks = [
      { chunk: 'This is ', done: false },
      { chunk: 'a test ', done: false },
      { chunk: 'response', done: false },
      { done: true }
    ];

    global.fetch.mockResolvedValue(mockStreamingResponse(chunks));

    render(<Results data={mockData} />);

    await waitFor(() => {
      expect(screen.getByText(/This is a test response/)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/chat/stream/${mockData.conversationId}`)
    );
  });

  test('displays suggested questions before user asks', async () => {
    global.fetch.mockResolvedValue(mockStreamingResponse([
      { chunk: 'Initial advice', done: false },
      { done: true }
    ]));

    render(<Results data={mockData} />);

    await waitFor(() => {
      expect(screen.getByText('What causes this disease?')).toBeInTheDocument();
    });

    expect(screen.getByText('How can I treat it?')).toBeInTheDocument();
    expect(screen.getByText('How can I prevent it?')).toBeInTheDocument();
  });

  test('hides suggested questions after user asks a question', async () => {
    global.fetch.mockResolvedValue(mockStreamingResponse([
      { chunk: 'Response', done: false },
      { done: true }
    ]));

    render(<Results data={mockData} />);

    await waitFor(() => {
      expect(screen.getByText('What causes this disease?')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Ask a follow-up question...');
    fireEvent.change(input, { target: { value: 'My question' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.queryByText('What causes this disease?')).not.toBeInTheDocument();
    });
  });

  test('handles user message input and send', async () => {
    global.fetch.mockResolvedValue(mockStreamingResponse([
      { chunk: 'Response', done: false },
      { done: true }
    ]));

    render(<Results data={mockData} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Ask a follow-up question...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Ask a follow-up question...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'How do I treat this?' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('How do I treat this?')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('question=How%20do%20I%20treat%20this%3F')
    );
  });

  test('handles Enter key to send message', async () => {
    global.fetch.mockResolvedValue(mockStreamingResponse([
      { chunk: 'Response', done: false },
      { done: true }
    ]));

    render(<Results data={mockData} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Ask a follow-up question...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Ask a follow-up question...');

    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Test question')).toBeInTheDocument();
    });
  });

  test('disables input during loading', async () => {
    global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Results data={mockData} />);

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Ask a follow-up question...');
      expect(input).toBeDisabled();
    });
  });

  test('displays streaming cursor during message streaming', async () => {
    const chunks = [
      { chunk: 'Streaming', done: false }
    ];

    global.fetch.mockResolvedValue(mockStreamingResponse(chunks));

    render(<Results data={mockData} />);

    await waitFor(() => {
      const cursor = document.querySelector('.cursor');
      expect(cursor).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('handles suggested question click', async () => {
    let fetchCallCount = 0;
    global.fetch.mockImplementation(() => {
      fetchCallCount++;
      return Promise.resolve(mockStreamingResponse([
        { chunk: 'Response', done: false },
        { done: true }
      ]));
    });

    render(<Results data={mockData} />);

    await waitFor(() => {
      expect(screen.getByText('What causes this disease?')).toBeInTheDocument();
    });

    const initialCallCount = fetchCallCount;
    const suggestedButton = screen.getByText('What causes this disease?');
    
    fireEvent.click(suggestedButton);

    // Verify that a new fetch call was made
    await waitFor(() => {
      expect(fetchCallCount).toBeGreaterThan(initialCallCount);
    }, { timeout: 2000 });
  });
});
