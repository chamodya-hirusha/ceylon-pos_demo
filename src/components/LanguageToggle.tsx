import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LanguageToggle: React.FC = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        document.documentElement.lang = lng;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl w-10 h-10 hover:bg-muted transition-all duration-200">
                    <Languages className="w-5 h-5 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-pos-lg border-border/50 animate-in fade-in zoom-in duration-200">
                <DropdownMenuItem
                    onClick={() => toggleLanguage('en')}
                    className={`cursor-pointer rounded-lg m-1 font-medium transition-colors ${i18n.language.startsWith('en') ? 'bg-primary/10 text-primary' : ''}`}
                >
                    English
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => toggleLanguage('si')}
                    className={`cursor-pointer rounded-lg m-1 font-medium transition-colors ${i18n.language.startsWith('si') ? 'bg-primary/10 text-primary' : ''}`}
                >
                    සිංහල (Sinhala)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageToggle;
