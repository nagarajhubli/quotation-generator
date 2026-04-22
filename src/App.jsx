import { useState } from 'react'

// ─── Calculation helpers ──────────────────────────────────────────────────────

function calcRow(row) {
  const qty = parseFloat(row.qty) || 0
  const rate = parseFloat(row.rate) || 0
  const lessDis = parseFloat(row.lessDis) || 0
  const gst = parseFloat(row.gst) || 0
  const total = qty * rate
  const discountAmt = total * (lessDis / 100)
  const afterDiscount = total - discountAmt
  const finalTotal = afterDiscount * (1 + gst / 100)
  return { total, discountAmt, finalTotal }
}

function calcGrandTotal(sections) {
  return sections
    .flatMap(s => s.rows)
    .reduce((sum, row) => sum + calcRow(row).finalTotal, 0)
}

function fmt(n) {
  return n > 0 ? n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : ''
}

function newRow() {
  return { id: crypto.randomUUID(), description: '', qty: '', rate: '', lessDis: '', gst: '', fabricDetails: '' }
}

function newSection(title = 'NEW SECTION') {
  return { id: crypto.randomUUID(), title, rows: [newRow()] }
}

// ─── Initial state ────────────────────────────────────────────────────────────

const DEFAULT_ROWS = ['MAIN CLOTH', 'B LINING', 'SHEER CLOTH', 'MTRACK', 'PLEATED STITCHING', 'BELTS', 'FIXING']

const LOGO_URL = 'https://insidezsaplings.in/wp-content/uploads/2025/07/inside-saplings-logo-768x185-1.png'

const initialState = {
  companyName: 'Insidez Saplings',
  companyAddress: 'CG Employees Colony (Kendriya Vihar), Mayuri Nagar, Miyapur, Hyderabad, Telangana – 500049 | Ph: +91 6304149548',
  customer: {
    name: '', address: '', mobile: '',
    exec: '', tech: '', date: '',
    bosNo: '', receipt: '', deliveryDate: '',
  },
  notes: '1) Chq/DD on favour of INSIDEZ SAPLINGS.\n2) 70% Advance along with your valuable order, balance of 30% before delivery.\n3) GST will be extra as applicable.\n4) Delivery shall be made only after payment.',
  sections: [
    {
      id: crypto.randomUUID(),
      title: 'HALL FRENCH DOOR CURTAINS',
      rows: DEFAULT_ROWS.map(d => ({ ...newRow(), description: d })),
    },
  ],
  advancePaid: '',
  roundingOff: '',
}

// ─── EditableField ─────────────────────────────────────────────────────────────

function EditableField({ value, onChange, placeholder = '', align = 'left', className = '', multiline = false }) {
  const [editing, setEditing] = useState(false)

  const style = { textAlign: align, width: '100%', display: 'block' }

  if (editing) {
    if (multiline) {
      return (
        <textarea
          autoFocus
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          style={{ ...style, resize: 'vertical', minHeight: 80, padding: 4, fontSize: 'inherit', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
      )
    }
    return (
      <input
        autoFocus
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={e => e.key === 'Enter' && setEditing(false)}
        style={{ ...style, padding: '1px 2px', fontSize: 'inherit', fontFamily: 'inherit', boxSizing: 'border-box' }}
        className={className}
      />
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`editable-span ${className}`}
      style={{ ...style, cursor: 'text', minHeight: 18, minWidth: 20 }}
    >
      {value || <span className="placeholder">{placeholder}</span>}
    </span>
  )
}

// ─── QuoteHeader ──────────────────────────────────────────────────────────────

function QuoteHeader({ quote, update }) {
  return (
    <div className="quote-header">
      <img src={LOGO_URL} alt="Insidez Saplings" className="company-logo" />
      <div className="company-tagline">Transforming Spaces with Excellence Since 2020</div>
      <div className="company-address">
        <EditableField value={quote.companyAddress} onChange={v => update('companyAddress', v)} align="center" />
      </div>
    </div>
  )
}

// ─── CustomerInfoGrid ─────────────────────────────────────────────────────────

function CustomerField({ label, value, onChange, placeholder }) {
  return (
    <div className="customer-field">
      <span className="customer-label">{label}</span>
      <span className="customer-colon">:</span>
      <EditableField value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  )
}

function CustomerInfoGrid({ customer, updateCustomer }) {
  const u = (f, v) => updateCustomer(f, v)
  return (
    <div className="customer-grid">
      <div className="customer-col">
        <CustomerField label="Name" value={customer.name} onChange={v => u('name', v)} placeholder="Customer name" />
        <CustomerField label="Add" value={customer.address} onChange={v => u('address', v)} placeholder="Address" />
        <CustomerField label="Mob #" value={customer.mobile} onChange={v => u('mobile', v)} placeholder="Mobile" />
      </div>
      <div className="customer-col">
        <CustomerField label="Exec" value={customer.exec} onChange={v => u('exec', v)} placeholder="Executive" />
        <CustomerField label="Tech" value={customer.tech} onChange={v => u('tech', v)} placeholder="Technician" />
        <CustomerField label="BOS #" value={customer.bosNo} onChange={v => u('bosNo', v)} placeholder="BOS number" />
        <CustomerField label="Receipt" value={customer.receipt} onChange={v => u('receipt', v)} placeholder="Receipt #" />
      </div>
      <div className="customer-col">
        <CustomerField label="Date" value={customer.date} onChange={v => u('date', v)} placeholder="DD/MM/YYYY" />
        <CustomerField label="Advance" value={customer.advance} onChange={v => u('advance', v)} placeholder="Amount" />
        <CustomerField label="Balance" value={customer.balance} onChange={v => u('balance', v)} placeholder="Amount" />
        <CustomerField label="Date of delivery" value={customer.deliveryDate} onChange={v => u('deliveryDate', v)} placeholder="/MM/YYYY" />
      </div>
    </div>
  )
}

// ─── ItemRow ──────────────────────────────────────────────────────────────────

function ItemRow({ row, rowNum, sectionId, updateRow, removeRow, canRemove }) {
  const { total, discountAmt, finalTotal } = calcRow(row)
  const upd = (field, val) => updateRow(sectionId, row.id, field, val)

  return (
    <tr className="item-row">
      <td className="cell-center">{rowNum}</td>
      <td><EditableField value={row.description} onChange={v => upd('description', v)} placeholder="Description" /></td>
      <td className="cell-right"><EditableField value={row.qty} onChange={v => upd('qty', v)} align="right" placeholder="0" /></td>
      <td className="cell-right"><EditableField value={row.rate} onChange={v => upd('rate', v)} align="right" placeholder="0" /></td>
      <td className="cell-computed">{fmt(total)}</td>
      <td className="cell-right"><EditableField value={row.lessDis} onChange={v => upd('lessDis', v)} align="right" placeholder="0" /></td>
      <td className="cell-computed">{fmt(discountAmt)}</td>
      <td className="cell-right"><EditableField value={row.gst} onChange={v => upd('gst', v)} align="right" placeholder="0" /></td>
      <td className="cell-computed cell-total">{fmt(finalTotal)}</td>
      <td><EditableField value={row.fabricDetails} onChange={v => upd('fabricDetails', v)} placeholder="Fabric" /></td>
      <td className="cell-action no-print">
        {canRemove && (
          <button className="btn-icon btn-danger" onClick={() => removeRow(sectionId, row.id)} title="Remove row">×</button>
        )}
      </td>
    </tr>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ section, updateRow, removeRow, removeSection, addRow, updateSectionTitle, rowOffset }) {
  return (
    <>
      <tr className="section-title-row">
        <td colSpan={2} className="section-title-cell">
          <EditableField value={section.title} onChange={v => updateSectionTitle(section.id, v)} />
        </td>
        <td colSpan={8} />
        <td className="cell-action no-print">
          <button className="btn-icon btn-danger" onClick={() => removeSection(section.id)} title="Remove section">×</button>
        </td>
      </tr>
      {section.rows.map((row, i) => (
        <ItemRow
          key={row.id}
          row={row}
          rowNum={rowOffset + i + 1}
          sectionId={section.id}
          updateRow={updateRow}
          removeRow={removeRow}
          canRemove={section.rows.length > 1}
        />
      ))}
      <tr className="add-row-tr no-print">
        <td colSpan={11}>
          <button className="btn-add-row" onClick={() => addRow(section.id)}>+ Add Row</button>
        </td>
      </tr>
    </>
  )
}

// ─── Main table ───────────────────────────────────────────────────────────────

function QuoteTable({ sections, updateRow, removeRow, removeSection, addRow, updateSectionTitle, addSection }) {
  let rowOffset = 0
  return (
    <div className="table-wrapper">
      <table className="quote-table">
        <colgroup>
          <col style={{ width: 38 }} />
          <col style={{ width: 170 }} />
          <col style={{ width: 48 }} />
          <col style={{ width: 60 }} />
          <col style={{ width: 72 }} />
          <col style={{ width: 56 }} />
          <col style={{ width: 72 }} />
          <col style={{ width: 44 }} />
          <col style={{ width: 80 }} />
          <col style={{ width: 110 }} />
          <col style={{ width: 28 }} />
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2}>SR.NO</th>
            <th rowSpan={2}>Description</th>
            <th rowSpan={2}>Qty</th>
            <th rowSpan={2}>Rate</th>
            <th rowSpan={2}>Total</th>
            <th colSpan={2}>LESS DIS</th>
            <th rowSpan={2}>GST</th>
            <th rowSpan={2}>Total</th>
            <th rowSpan={2}>Fabric details</th>
            <th rowSpan={2} className="no-print"></th>
          </tr>
          <tr>
            <th>%</th>
            <th>Amt</th>
          </tr>
        </thead>
        <tbody>
          {sections.map(section => {
            const offset = rowOffset
            rowOffset += section.rows.length
            return (
              <Section
                key={section.id}
                section={section}
                rowOffset={offset}
                updateRow={updateRow}
                removeRow={removeRow}
                removeSection={removeSection}
                addRow={addRow}
                updateSectionTitle={updateSectionTitle}
              />
            )
          })}
          <tr className="no-print">
            <td colSpan={11} style={{ paddingTop: 6, paddingBottom: 6 }}>
              <button className="btn-add-section" onClick={addSection}>+ Add Section</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function FooterNotes({ notes, onChange }) {
  return (
    <div className="footer-notes">
      <strong>Note:</strong>
      <div style={{ marginTop: 4 }}>
        <EditableField value={notes} onChange={onChange} multiline />
      </div>
    </div>
  )
}

function FooterTotals({ sections, advancePaid, roundingOff, updateQuote }) {
  const grandTotal = calcGrandTotal(sections)
  const rounding = parseFloat(roundingOff) || 0
  const rounded = grandTotal + rounding
  const advance = parseFloat(advancePaid) || 0
  const balance = rounded - advance

  return (
    <div className="footer-totals">
      <table>
        <tbody>
          <tr>
            <td className="totals-label">Total</td>
            <td className="totals-colon">:</td>
            <td className="totals-value">{fmt(grandTotal)}</td>
          </tr>
          <tr>
            <td className="totals-label">Rounding Off</td>
            <td className="totals-colon">:</td>
            <td className="totals-value">
              <EditableField value={roundingOff} onChange={v => updateQuote('roundingOff', v)} align="right" placeholder="0" />
            </td>
          </tr>
          <tr className="grand-total-row">
            <td className="totals-label">Grand Total</td>
            <td className="totals-colon">:</td>
            <td className="totals-value">{fmt(rounded)}</td>
          </tr>
          <tr>
            <td className="totals-label">Advance</td>
            <td className="totals-colon">:</td>
            <td className="totals-value">
              <EditableField value={advancePaid} onChange={v => updateQuote('advancePaid', v)} align="right" placeholder="0" />
            </td>
          </tr>
          <tr className="balance-row">
            <td className="totals-label">Balance</td>
            <td className="totals-colon">:</td>
            <td className="totals-value">{advance > 0 ? fmt(balance) : ''}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function SignatureRow() {
  return (
    <div className="signature-row">
      <div className="sig-block">
        <div className="sig-label">FOR INSIDEZ SAPLINGS</div>
      </div>
      <div className="sig-block" style={{ textAlign: 'center' }}>
        <div className="sig-line"></div>
        <div className="sig-label">MANAGER</div>
      </div>
      <div className="sig-block" style={{ textAlign: 'center' }}>
        <div className="sig-line"></div>
        <div className="sig-label">EXECUTIVE</div>
      </div>
      <div className="sig-block" style={{ textAlign: 'center' }}>
        <div className="sig-line"></div>
        <div className="sig-label">Authorised Signature</div>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [quote, setQuote] = useState(initialState)

  function update(field, value) {
    setQuote(q => ({ ...q, [field]: value }))
  }

  function updateCustomer(field, value) {
    setQuote(q => ({ ...q, customer: { ...q.customer, [field]: value } }))
  }

  function updateSectionTitle(sectionId, value) {
    setQuote(q => ({
      ...q,
      sections: q.sections.map(s => s.id === sectionId ? { ...s, title: value } : s),
    }))
  }

  function updateRow(sectionId, rowId, field, value) {
    setQuote(q => ({
      ...q,
      sections: q.sections.map(s =>
        s.id !== sectionId ? s : {
          ...s,
          rows: s.rows.map(r => r.id !== rowId ? r : { ...r, [field]: value }),
        }
      ),
    }))
  }

  function addSection() {
    setQuote(q => ({ ...q, sections: [...q.sections, newSection()] }))
  }

  function removeSection(sectionId) {
    setQuote(q => ({ ...q, sections: q.sections.filter(s => s.id !== sectionId) }))
  }

  function addRow(sectionId) {
    setQuote(q => ({
      ...q,
      sections: q.sections.map(s =>
        s.id !== sectionId ? s : { ...s, rows: [...s.rows, newRow()] }
      ),
    }))
  }

  function removeRow(sectionId, rowId) {
    setQuote(q => ({
      ...q,
      sections: q.sections.map(s =>
        s.id !== sectionId ? s : { ...s, rows: s.rows.filter(r => r.id !== rowId) }
      ),
    }))
  }

  return (
    <div className="app">
      <QuoteHeader quote={quote} update={update} />
      <CustomerInfoGrid customer={quote.customer} updateCustomer={updateCustomer} />
      <QuoteTable
        sections={quote.sections}
        updateRow={updateRow}
        removeRow={removeRow}
        removeSection={removeSection}
        addRow={addRow}
        updateSectionTitle={updateSectionTitle}
        addSection={addSection}
      />
      <div className="footer-row">
        <FooterNotes notes={quote.notes} onChange={v => update('notes', v)} />
        <FooterTotals
          sections={quote.sections}
          advancePaid={quote.advancePaid}
          roundingOff={quote.roundingOff}
          updateQuote={update}
        />
      </div>
      <SignatureRow />
      <button className="btn-print no-print" onClick={() => window.print()}>
        🖨 Print / Save PDF
      </button>
    </div>
  )
}
