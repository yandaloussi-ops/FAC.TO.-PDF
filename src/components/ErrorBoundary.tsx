import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, BookOpen, ShieldCheck } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FAC en PDF ErrorBoundary caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    try {
      window.location.hash = '';
    } catch {}
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-stone-900 text-stone-100 font-sans">
          <div className="max-w-lg w-full p-6 sm:p-8 bg-stone-950 border border-amber-600/30 rounded-3xl shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 mx-auto bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-amber-400 mb-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>FAC EN PDF · PROTECTION DE SESSION</span>
              </div>
              <h2 className="text-lg font-bold text-white">
                {this.props.fallbackTitle || 'استئناف المتابعة الآمنة / Reprise de Session'}
              </h2>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                تم رصد استثناء أثناء معالجة المحتوى الأكاديمي. بياناتك وجلستك محفوظة بأمان. يمكنك العودة للمتابعة مباشرة دون مغادرة التطبيق.
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                Une exception a été interceptée. Vos données de session sont intactes. Cliquez ci-dessous pour reprendre votre navigation sans quitter la plateforme.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة المحاولة / Réessayer</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-stone-700"
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية / Accueil</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

