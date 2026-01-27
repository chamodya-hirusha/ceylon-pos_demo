# Return Mode - User Guide

## How to Process a Return in Ceylon POS

### Step 1: Access Sales History
- **For Cashiers:** Click the History icon in POS header or press `Shift + H`
- **For Admin/Manager:** Navigate to Admin → Sales History

### Step 2: Initiate Return
1. Find the invoice you want to return
2. Click the **Return** button (🔄 icon) on the right side of the invoice row
3. System will enter **Return Mode** and navigate to POS

### Step 3: Select Items to Return
**In Return Mode, you can:**
- ✅ Search for products by name or barcode (only original items will appear)
- ✅ Click on products to add them to the return cart
- ✅ Adjust quantities (cannot exceed sold quantity)
- ✅ Remove items you don't want to return

**Visual Indicators:**
- Orange pulsing badge at top: "RETURN MODE – Original Bill #SALE-XXXXX"
- Orange cart panel header
- Toast message: "Added to Return: [Product Name]"

### Step 4: Confirm Return
1. Review the return cart items and quantities
2. Click the orange **"Confirm Return"** button
3. Select payment method (usually Cash for refunds)
4. If Cash: Enter refund amount
5. Click **"Process Refund"** or press Enter

### Step 5: Print Return Receipt
- Return invoice will automatically open for printing
- Return invoice shows:
  - Unique Return ID (RET-XXXX)
  - Link to original invoice
  - Returned items and quantities
  - Refund amount

### What Happens Automatically:
✅ **Return Invoice Created** - Separate record with unique ID  
✅ **Inventory Restocked** - Returned quantities added back to stock  
✅ **Original Invoice Locked** - Status changed to "Returned"  
✅ **Return Button Disabled** - Cannot return the same invoice again  
✅ **Return History Updated** - Return appears in Return History

---

## Viewing Return History

### Access Return History:
- **From Sales History:** Click "View Returns" button
- **For Cashiers:** Navigate to `/pos/returns`
- **For Admin/Manager:** Navigate to Admin → Return History

### Return History Features:
- 📊 Summary statistics (Total Returns, Total Refunded, Average Refund)
- 🔍 Search by Return ID, Original Bill ID, or Cashier name
- 📅 Filter by date range
- 📄 Pagination for easy browsing
- 📥 Export to PDF

### What You'll See:
- **Return ID:** Unique identifier (RET-XXXX)
- **Original Bill:** Link to the original sale invoice
- **Date & Time:** When the return was processed
- **Cashier:** Who processed the return
- **Items:** Number of items returned
- **Refund Amount:** Total refund issued

---

## Important Rules

### ⚠️ Return Restrictions:
1. **One Return Per Invoice** - Each invoice can only be returned once
2. **Original Items Only** - Can only return items that were in the original sale
3. **Quantity Limits** - Cannot return more than what was sold
4. **No Modifications** - Original sale invoice is never changed

### 🔒 Security:
- Returned invoices are locked and cannot be edited
- Return button is disabled after processing
- Complete audit trail maintained
- Role-based access control

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F1` | Focus search box |
| `F2` | Hold bill |
| `F3` | Open payment screen |
| `F9` | Print/Preview invoice |
| `Shift + H` | Open Sales History |
| `Arrow Keys` | Navigate products |
| `Enter` | Select product / Confirm payment |
| `Esc` | Close modals / Cancel |

---

## Troubleshooting

### "Cannot add this item in Return Mode"
**Cause:** Trying to add a product that wasn't in the original invoice  
**Solution:** Only search for and add items from the original sale

### "Invoice Already Returned"
**Cause:** Trying to return an invoice that has already been returned  
**Solution:** Each invoice can only be returned once. Check Return History for the existing return record

### Return button is grayed out
**Cause:** Invoice has already been returned  
**Solution:** This is normal - returned invoices cannot be returned again

### Quantity won't increase beyond a certain number
**Cause:** Quantity validation prevents returning more than was sold  
**Solution:** This is correct behavior - you can only return up to the sold quantity

---

## Best Practices

1. **Verify Items:** Always double-check items and quantities before confirming
2. **Print Receipt:** Always print the return receipt for customer records
3. **Check Inventory:** Verify that inventory was properly restocked after return
4. **Document Reason:** Note the reason for return (if required by store policy)
5. **Customer Verification:** Verify customer has original receipt before processing return

---

## Support

For technical issues or questions:
- Contact your system administrator
- Refer to the main POS documentation
- Check the RETURN_MODE_IMPLEMENTATION.md file for technical details
