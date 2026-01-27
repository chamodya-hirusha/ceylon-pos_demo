import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Keyboard,
    Search,
    Pause,
    CreditCard,
    X,
    Trash2,
    LogOut,
    ChevronRight,
    Move,
    CornerDownLeft,
    PlusCircle,
    MinusCircle,
    Percent,
    Printer,
    Receipt,
    Languages,
    Banknote,
    Settings,
    RotateCcw
} from 'lucide-react';
import { useShortcuts, ShortcutConfig } from '@/contexts/ShortcutContext';
import { toast } from 'sonner';

interface ShortcutDialogProps {
    onClose: () => void;
}

const ShortcutDialog: React.FC<ShortcutDialogProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const { shortcuts, updateShortcut, resetShortcuts } = useShortcuts();
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [recordingAction, setRecordingAction] = useState<string | null>(null);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!recordingAction) return;

        e.preventDefault();
        e.stopPropagation();

        // Don't record just modifier keys
        if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

        const config: ShortcutConfig = {
            key: e.key.toLowerCase(),
            ctrl: e.ctrlKey,
            shift: e.shiftKey,
            alt: e.altKey,
            label: `${e.ctrlKey ? 'Ctrl + ' : ''}${e.shiftKey ? 'Shift + ' : ''}${e.altKey ? 'Alt + ' : ''}${e.key.toUpperCase()}`
        };

        updateShortcut(recordingAction, config);
        setRecordingAction(null);
        toast.success(`Updated shortcut for ${recordingAction}`);
    }, [recordingAction, updateShortcut]);

    useEffect(() => {
        if (recordingAction) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [recordingAction, handleKeyDown]);

    const shortcutActions = [
        { id: 'search', label: t('search'), icon: Search },
        { id: 'hold', label: t('hold'), icon: Pause },
        { id: 'pay', label: t('pay_now'), icon: CreditCard },
        { id: 'held_bills', label: t('held_bills'), icon: Keyboard },
        { id: 'history', label: t('sales_history'), icon: Receipt },
        { id: 'clear_cart', label: t('clear_cart'), icon: Trash2 },
        { id: 'discount', label: t('discount'), icon: Percent },
        { id: 'print', label: 'Print Invoice', icon: Printer },
        { id: 'logout', label: t('logout'), icon: LogOut },
        { id: 'cash', label: 'Cash Payment', icon: Banknote },
        { id: 'card', label: 'Card Payment', icon: CreditCard },
        { id: 'credit', label: 'Credit Sale', icon: Banknote },
    ];

    const standardShortcuts = [
        { key: 'Arrows', label: 'Navigate Products', icon: Move },
        { key: 'Enter', label: 'Add Focused Product', icon: CornerDownLeft },
        { key: '+ / =', label: 'Increase Quantity', icon: PlusCircle },
        { key: '-', label: 'Decrease Quantity', icon: MinusCircle },
        { key: 'Esc', label: t('back'), icon: X },
    ];

    return (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in">
            <div className="bg-card rounded-3xl shadow-pos-lg w-full max-w-lg m-4 overflow-hidden border border-border/50">
                <div className="p-5 border-b border-border/50 flex items-center justify-between bg-secondary/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Keyboard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">Keyboard Shortcuts</h3>
                            <p className="text-xs text-muted-foreground">Manage your terminal shortcuts</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsCustomizing(!isCustomizing)}
                            className={`p-2 rounded-xl transition-all ${isCustomizing ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-background text-muted-foreground'}`}
                            title="Customize Shortcuts"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-background transition-colors text-muted-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-4 overflow-auto max-h-[60vh] scrollbar-thin">
                    <div className="space-y-6">
                        {/* Customizable Shortcuts */}
                        <section>
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2 flex justify-between items-center">
                                POS Actions
                                {isCustomizing && (
                                    <button
                                        onClick={resetShortcuts}
                                        className="text-[10px] bg-secondary px-2 py-0.5 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center gap-1"
                                    >
                                        <RotateCcw className="w-2.5 h-2.5" />
                                        Reset All
                                    </button>
                                )}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {shortcutActions.map((action) => (
                                    <div
                                        key={action.id}
                                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all group ${recordingAction === action.id
                                                ? 'bg-primary/5 border-primary shadow-inner ring-2 ring-primary/20'
                                                : 'bg-secondary/20 border-transparent hover:border-border'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl bg-background flex items-center justify-center border border-border group-hover:scale-105 transition-transform ${recordingAction === action.id ? 'animate-pulse' : ''}`}>
                                                <action.icon className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{action.label}</span>
                                        </div>
                                        {isCustomizing ? (
                                            <button
                                                onClick={() => setRecordingAction(recordingAction === action.id ? null : action.id)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all ${recordingAction === action.id
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-background hover:bg-primary/10 hover:text-primary text-muted-foreground border border-border'
                                                    }`}
                                            >
                                                {recordingAction === action.id ? 'Recording...' : shortcuts[action.id]?.label || 'Click to set'}
                                            </button>
                                        ) : (
                                            <kbd className="px-2 py-1 bg-background border border-border shadow-sm rounded-lg text-foreground font-mono text-[10px] font-bold min-w-[30px] text-center">
                                                {shortcuts[action.id]?.label || '-'}
                                            </kbd>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Standard Controls */}
                        <section>
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">System Controls</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 opacity-80">
                                {standardShortcuts.map((s, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 rounded-2xl bg-secondary/10 border border-transparent"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-background/50 flex items-center justify-center border border-border/50">
                                                <s.icon className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{s.label}</span>
                                        </div>
                                        <kbd className="px-2 py-1 bg-background/50 border border-border/50 rounded-lg text-muted-foreground font-mono text-[10px] font-bold">
                                            {s.key}
                                        </kbd>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                <div className="p-5 border-t border-border/50 bg-secondary/10">
                    {isCustomizing ? (
                        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl border border-primary/20">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                                <Keyboard className="w-4 h-4" />
                            </div>
                            <p className="text-xs text-foreground font-medium leading-tight">
                                Customization mode active. Click any action to record a new key combination.
                            </p>
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center italic">
                            Tip: These shortcuts are synced to your account and available everywhere you log in.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShortcutDialog;
