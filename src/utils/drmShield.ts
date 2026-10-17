import { DRMSecurityAlert } from '../types';

export interface DRMListenerOptions {
  onSecurityAlert: (alert: DRMSecurityAlert) => void;
  onBlurChange: (blurred: boolean) => void;
}

export function setupDrmProtection({ onSecurityAlert, onBlurChange }: DRMListenerOptions): () => void {
  // 1. Context Menu blocker (Right-click)
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    onSecurityAlert({
      id: Math.random().toString(),
      type: 'dev_tools',
      title: 'Action Restreinte',
      message: 'Le clic droit et le menu contextuel sont désactivés pour protéger les droits d\'auteur.',
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  // 2. Keyboard shortcuts blocker (PrintScreen, Ctrl+P, Ctrl+S, Ctrl+C, Devtools, macOS screen captures)
  const handleKeyDown = (e: KeyboardEvent) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    // Detect PrintScreen
    if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
      e.preventDefault();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('FAC en PDF : Capture d\'écran strictement interdite. Licence protégée.');
        }
      } catch {
        // ignore clipboard error
      }
      onBlurChange(true);
      onSecurityAlert({
        id: Math.random().toString(),
        type: 'screenshot_shortcut',
        title: 'Tentative de Capture Détectée',
        message: 'La touche Capture d\'écran (PrintScreen) a été bloquée. Le contenu a été temporairement masqué pour préserver l\'intégrité des cours.',
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }

    // Ctrl/Cmd + P (Print)
    if (isCtrlOrCmd && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      onSecurityAlert({
        id: Math.random().toString(),
        type: 'print_attempt',
        title: 'Impression Bloquée',
        message: 'L\'impression et l\'exportation de ce document sont strictement interdites par la politique FAC en PDF.',
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }

    // Ctrl/Cmd + S (Save)
    if (isCtrlOrCmd && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      onSecurityAlert({
        id: Math.random().toString(),
        type: 'screenshot_shortcut',
        title: 'Téléchargement Interdit',
        message: 'Ce livre est accessible uniquement en lecture dans l\'application.',
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }

    // Ctrl/Cmd + C (Copy)
    if (isCtrlOrCmd && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      onSecurityAlert({
        id: Math.random().toString(),
        type: 'clipboard_clear',
        title: 'Copie de Texte Verrouillée',
        message: 'La copie intégrale ou partielle du polycopié est verrouillée pour respecter les droits des enseignants.',
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }

    // F12 or Ctrl/Cmd + Shift + I/J/C (DevTools)
    if (
      e.key === 'F12' ||
      (isCtrlOrCmd && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key)) ||
      (isCtrlOrCmd && (e.key === 'u' || e.key === 'U'))
    ) {
      e.preventDefault();
      onSecurityAlert({
        id: Math.random().toString(),
        type: 'dev_tools',
        title: 'Outils d\'Inspection Bloqués',
        message: 'L\'accès aux outils de développement est restreint pendant la consultation.',
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }

    // macOS screenshot shortcuts (Cmd + Shift + 3, 4, 5)
    if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
      e.preventDefault();
      onBlurChange(true);
      onSecurityAlert({
        id: Math.random().toString(),
        type: 'screenshot_shortcut',
        title: 'Raccourci Capture macOS Détecté',
        message: 'Les captures d\'écran partielles et totales sont bloquées.',
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  };

  // 3. Clear clipboard on PrintScreen keyup
  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('FAC en PDF : Capture restreinte.');
        }
      } catch {
        // ignore
      }
    }
  };

  // 4. Window blur & visibility change (Snipping tool / Alt+Tab / external recorder detection)
  const handleWindowBlur = () => {
    onBlurChange(true);
  };

  const handleWindowFocus = () => {
    onBlurChange(false);
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      onBlurChange(true);
    } else {
      onBlurChange(false);
    }
  };

  window.addEventListener('contextmenu', handleContextMenu);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('blur', handleWindowBlur);
  window.addEventListener('focus', handleWindowFocus);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    window.removeEventListener('contextmenu', handleContextMenu);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('blur', handleWindowBlur);
    window.removeEventListener('focus', handleWindowFocus);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
