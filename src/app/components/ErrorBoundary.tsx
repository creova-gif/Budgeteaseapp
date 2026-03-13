import { Component, type ErrorInfo, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Analytics } from '@/app/utils/analytics';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Audit Item 15 — Error Handling
 * Catches runtime errors so the app never shows a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // AUDIT FIX #5: Wire crash to Analytics so errors reach monitoring
    Analytics.captureException(error, {
      component_stack: info.componentStack?.slice(0, 500) ?? '',
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full"
        >
          <div className="text-5xl mb-4">😔</div>
          <h1 className="text-xl font-black text-gray-900 mb-2">Kuna tatizo / Something went wrong</h1>
          <p className="text-sm text-gray-500 mb-6">
            Samahani, programu imekutana na hitilafu.{' '}
            <span className="block mt-1 text-xs text-gray-400 font-mono truncate">{this.state.errorMessage}</span>
          </p>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={this.handleReset}
            className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-bold text-sm mb-3"
          >
            🔄 Jaribu Tena / Try Again
          </motion.button>

          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="w-full py-3 text-red-500 text-sm font-medium"
          >
            Anza Upya / Hard Reset
          </button>

          <p className="text-xs text-gray-300 mt-4">BudgetEase v1.0.0 · support@budgetease.tz</p>
        </motion.div>
      </div>
    );
  }
}