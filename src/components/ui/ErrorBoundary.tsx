import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4 bg-[#0b0f14] text-white select-none">
          <div className="max-w-md w-full p-4 rounded-xl bg-[#161e28] border border-red-500/40 shadow-2xl space-y-3 font-mono">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              <span>{this.props.fallbackTitle || 'Terjadi Masalah pada Tampilan'}</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              Panel ini mengalami kesalahan sementara. Anda dapat mereset panel ini tanpa memuat ulang seluruh halaman.
            </p>
            {this.state.error && (
              <div className="p-2.5 rounded bg-black/60 border border-white/10 text-[11px] text-red-300 break-words max-h-32 overflow-y-auto">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono text-xs cursor-pointer transition-colors shadow-lg active:scale-98"
            >
              Muat Ulang Panel (Retry)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
