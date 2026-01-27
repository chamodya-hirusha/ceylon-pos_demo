import React, { useState } from 'react';
import { useTheme, themePresets, backgroundPresets, fontPresets } from '@/contexts/ThemeContext';
import { useShop } from '@/contexts/ShopContext';
import {
  Settings as SettingsIcon,
  Percent,
  Receipt,
  Palette,
  Database,
  Save,
  RefreshCw,
  Printer,
  Download,
  Upload,
  Check,
} from 'lucide-react';

const Settings: React.FC = () => {
  const { shopDetails, setShopDetails } = useShop();
  const [taxRate, setTaxRate] = useState(8);
  const {
    primaryColor, setPrimaryColor,
    backgroundColor, setBackgroundColor,
    fontColor, setFontColor
  } = useTheme();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setShopDetails(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2 lg:mt-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">System Settings</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Configure your POS system preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Receipt & Company Details (Large Card) */}
        <div className="pos-card p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Extended Receipt Profile</h3>
                <p className="text-sm text-muted-foreground">Manage shop identity and thermal print details</p>
              </div>
            </div>
            <button className="pos-btn-primary flex items-center gap-2 px-8">
              <Save className="w-4 h-4" />
              Update Global Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo Section */}
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Business Logo</label>
              <div
                className="aspect-square rounded-3xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-3 group relative overflow-hidden transition-all hover:bg-muted/30 hover:border-primary/50"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                {shopDetails.logo ? (
                  <img src={shopDetails.logo} alt="Logo" className="w-full h-full object-contain p-4" />
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="text-center px-4">
                      <p className="text-xs font-bold text-foreground">Click to upload</p>
                      <p className="text-[10px] text-muted-foreground mt-1 text-balance">Compatible with Black/Blue thermal printers</p>
                    </div>
                  </>
                )}
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
              {shopDetails.logo && (
                <button
                  onClick={() => setShopDetails(prev => ({ ...prev, logo: null }))}
                  className="w-full py-2 text-xs font-bold text-destructive hover:bg-destructive/5 rounded-xl transition-colors"
                >
                  Remove Logo
                </button>
              )}
            </div>

            {/* Form Fields */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase">Shop / Company Name</label>
                <input
                  type="text"
                  value={shopDetails.name}
                  onChange={e => setShopDetails({ ...shopDetails, name: e.target.value })}
                  className="pos-input"
                  placeholder="Global Hardware Ltd"
                />
              </div>

              <div>
                <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase">Branch Identifier</label>
                <input
                  type="text"
                  value={shopDetails.branch}
                  onChange={e => setShopDetails({ ...shopDetails, branch: e.target.value })}
                  className="pos-input"
                  placeholder="Nugegoda Branch"
                />
              </div>

              <div>
                <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase">Reg No (BR / VAT)</label>
                <input
                  type="text"
                  value={shopDetails.brNo}
                  onChange={e => setShopDetails({ ...shopDetails, brNo: e.target.value })}
                  className="pos-input"
                  placeholder="PV 002345"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase">Physical Address</label>
                <input
                  type="text"
                  value={shopDetails.address}
                  onChange={e => setShopDetails({ ...shopDetails, address: e.target.value })}
                  className="pos-input"
                  placeholder="Street, City, Zip"
                />
              </div>

              <div>
                <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase">Tel / WhatsApp</label>
                <div className="relative">
                  <input
                    type="text"
                    value={shopDetails.phone}
                    onChange={e => setShopDetails({ ...shopDetails, phone: e.target.value })}
                    className="pos-input"
                    placeholder="+94 ..."
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase">Official Email</label>
                <input
                  type="email"
                  value={shopDetails.email}
                  onChange={e => setShopDetails({ ...shopDetails, email: e.target.value })}
                  className="pos-input"
                  placeholder="hello@shop.com"
                />
              </div>

              <div className="pt-4 sm:col-span-2 border-t border-border/30 mt-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase text-primary">Terminal / Counter No</label>
                  <input
                    type="text"
                    value={shopDetails.terminal}
                    onChange={e => setShopDetails({ ...shopDetails, terminal: e.target.value })}
                    className="pos-input border-primary/20 bg-primary/5"
                    placeholder="T-01"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase">Display Cashier ID</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShopDetails({ ...shopDetails, showCashier: true })}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all text-xs font-bold ${shopDetails.showCashier ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}
                    >
                      Show
                    </button>
                    <button
                      onClick={() => setShopDetails({ ...shopDetails, showCashier: false })}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all text-xs font-bold ${!shopDetails.showCashier ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}
                    >
                      Hide
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50">
            <label className="text-xs font-bold mb-2 block text-muted-foreground uppercase">Receipt Footer (Thermal Template)</label>
            <textarea
              value={shopDetails.receiptFooter}
              onChange={e => setShopDetails(prev => ({ ...prev, receiptFooter: e.target.value }))}
              className="pos-input h-20 resize-none font-mono text-sm leading-relaxed"
              placeholder="Footer text..."
            />
          </div>
        </div>

        {/* Tax Settings */}
        <div className="pos-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Printer className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Printer Settings</h3>
              <p className="text-sm text-muted-foreground">Configure thermal printer</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
              <div>
                <p className="font-medium text-foreground">Thermal Printer</p>
                <p className="text-sm text-muted-foreground">USB Connection</p>
              </div>
              <span className="pos-badge-success">Connected</span>
            </div>
            <button className="pos-btn-secondary flex items-center gap-2 w-full justify-center">
              <RefreshCw className="w-4 h-4" />
              Test Print
            </button>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="pos-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Database className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Backup & Restore</h3>
              <p className="text-sm text-muted-foreground">Manage database backups</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-secondary/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Last Backup</p>
              <p className="font-medium text-foreground">Today, 10:30 AM</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="pos-btn-primary flex items-center gap-2 justify-center">
                <Download className="w-4 h-4" />
                Backup
              </button>
              <button className="pos-btn-secondary flex items-center gap-2 justify-center">
                <Upload className="w-4 h-4" />
                Restore
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="pos-card p-6 mt-6 space-y-12">
        {/* Primary Color Selection */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Brand Customization</h3>
              <p className="text-sm text-muted-foreground">Select your business primary brand color</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {themePresets.map((theme) => (
              <button
                key={theme.name}
                onClick={() => setPrimaryColor(theme.hsl)}
                className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 group ${primaryColor === theme.hsl
                  ? 'bg-primary/5 border-2 border-primary shadow-lg shadow-primary/5'
                  : 'bg-muted/30 border-2 border-transparent hover:border-border hover:bg-muted/50'
                  }`}
              >
                <div
                  className="w-12 h-12 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110 flex items-center justify-center"
                  style={{ backgroundColor: `hsl(${theme.hsl})` }}
                >
                  {primaryColor === theme.hsl && (
                    <Check className="w-6 h-6 text-white drop-shadow-md" />
                  )}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${primaryColor === theme.hsl ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                  {theme.name}
                </span>

                {primaryColor === theme.hsl && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-card">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Background Color Selection */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Background Theme</h3>
              <p className="text-sm text-muted-foreground">Customize the overall workspace atmosphere</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {backgroundPresets.map((bg) => (
              <button
                key={bg.name}
                onClick={() => setBackgroundColor(bg.hsl)}
                className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 group ${backgroundColor === bg.hsl
                  ? 'bg-primary/5 border-2 border-primary shadow-lg shadow-primary/5'
                  : 'bg-muted/30 border-2 border-transparent hover:border-border hover:bg-muted/50'
                  }`}
              >
                <div
                  className="w-12 h-12 rounded-xl border border-border shadow-inner transition-transform duration-300 group-hover:scale-110 flex items-center justify-center"
                  style={{ backgroundColor: `hsl(${bg.hsl})` }}
                >
                  {backgroundColor === bg.hsl && (
                    <Check className={`w-6 h-6 ${bg.hsl.includes('10%') || bg.hsl.includes('11%') ? 'text-white' : 'text-primary'}`} />
                  )}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${backgroundColor === bg.hsl ? 'text-primary' : 'text-muted-foreground'}`}>
                  {bg.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Typography Color Selection */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Typography Color</h3>
              <p className="text-sm text-muted-foreground">Adjust text contrast for your environment</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {fontPresets.map((font) => (
              <button
                key={font.name}
                onClick={() => setFontColor(font.hsl)}
                className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 group ${fontColor === font.hsl
                  ? 'bg-primary/5 border-2 border-primary shadow-lg shadow-primary/5'
                  : 'bg-muted/30 border-2 border-transparent hover:border-border hover:bg-muted/50'
                  }`}
              >
                <div
                  className="w-12 h-12 rounded-xl border border-border shadow-inner transition-transform duration-300 group-hover:scale-110 flex items-center justify-center"
                  style={{ backgroundColor: `hsl(${font.hsl})` }}
                >
                  <span className="text-lg font-black" style={{ color: `hsl(${font.hsl === '0 0% 100%' ? '215 25% 15%' : '0 0% 100%'})` }}>Aa</span>
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${fontColor === font.hsl ? 'text-primary' : 'text-muted-foreground'}`}>
                  {font.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
