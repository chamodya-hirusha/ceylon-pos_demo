import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { KeyRound, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ManagerPinDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    title?: string;
    description?: string;
}

const ManagerPinDialog: React.FC<ManagerPinDialogProps> = ({
    isOpen,
    onClose,
    onSuccess,
    title = "Manager Approval Required",
    description = "Please enter manager PIN to proceed with this return."
}) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const { t } = useTranslation();

    const handlePinInput = (digit: string) => {
        if (pin.length < 4) {
            const newPin = pin + digit;
            setPin(newPin);
            setError('');

            if (newPin.length === 4) {
                // In this demo, manager PIN is 9999 or 0000
                if (newPin === '9999' || newPin === '0000') {
                    onSuccess();
                    setPin('');
                    onClose();
                } else {
                    setError(t('invalid_pin'));
                    setTimeout(() => setPin(''), 500);
                }
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                        <KeyRound className="w-6 h-6 text-orange-600" />
                    </div>
                    <DialogTitle className="text-center">{title}</DialogTitle>
                    <DialogDescription className="text-center">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    <div className="flex justify-center gap-3 mb-8">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${pin.length > i ? 'bg-orange-500 border-orange-500' : 'bg-muted border-border'
                                    } ${error && 'border-destructive animate-pulse'}`}
                            >
                                {pin.length > i && <div className="w-3 h-3 rounded-full bg-white" />}
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="flex items-center justify-center gap-2 text-destructive text-sm font-medium mb-6">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
                            <button
                                key={key}
                                onClick={() => {
                                    if (key === 'C') setPin('');
                                    else if (key === '⌫') setPin(pin.slice(0, -1));
                                    else handlePinInput(key);
                                }}
                                className="h-12 rounded-xl border border-border hover:bg-muted font-bold transition-colors"
                            >
                                {key}
                            </button>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <button
                        onClick={onClose}
                        className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ManagerPinDialog;
