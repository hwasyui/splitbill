'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Minus, User, Check, Receipt, ChevronRight, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import StepBar from '@/components/ui/StepBar';
import Loader from '@/components/ui/loader';
import Toast from '@/components/ui/Toast';
import Footer from '@/components/ui/footer';
import { formatAmount } from '@/lib/currency';

const PROFILE_COLORS = ['#E84C3D', '#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#3B6F4A', '#44569C'];
const randomColor    = () => PROFILE_COLORS[Math.floor(Math.random() * PROFILE_COLORS.length)];

export default function AssignPage() {
  const router = useRouter();
  const { id } = useParams();

  const [receiptData,     setReceiptData]     = useState(null);
  const [profiles,        setProfiles]        = useState([]);
  const [itemMethods,     setItemMethods]     = useState({});   // idx → 'equal'|'unit'|'solo'|'perunit'
  const [assignments,     setAssignments]     = useState({});   // idx → [profileId,...]        (equal)
  const [unitAssignments, setUnitAssignments] = useState({});   // idx → { profileId: qty }      (unit)
  const [soloAssignments, setSoloAssignments] = useState({});   // idx → profileId               (solo)
  const [perUnitSlots,    setPerUnitSlots]    = useState({});   // idx → { unitIdx: [profileId,...] } (perunit)
  const [newName,         setNewName]         = useState('');
  const [dialogOpen,      setDialogOpen]      = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [toastMsg,        setToastMsg]        = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/result/${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data?.items || data?.error) { router.push('/bill-expired'); return; }
        setReceiptData(data);
      })
      .catch(() => router.push('/bill-expired'));
  }, [id, router]);

  const addProfile = () => {
    if (!newName.trim()) return;
    setProfiles(p => [...p, { id: uuidv4(), name: newName.trim(), color: randomColor() }]);
    setNewName('');
    setDialogOpen(false);
  };

  const setItemMethod = (idx, method) => {
    setItemMethods(prev     => ({ ...prev, [idx]: method }));
    setAssignments(prev     => { const n = { ...prev }; delete n[idx]; return n; });
    setUnitAssignments(prev => { const n = { ...prev }; delete n[idx]; return n; });
    setSoloAssignments(prev => { const n = { ...prev }; delete n[idx]; return n; });
    setPerUnitSlots(prev    => { const n = { ...prev }; delete n[idx]; return n; });
  };

  const toggleEqual = (itemIdx, profileId) => {
    const cur = assignments[itemIdx] || [];
    setAssignments({
      ...assignments,
      [itemIdx]: cur.includes(profileId) ? cur.filter(x => x !== profileId) : [...cur, profileId],
    });
  };

  const changeUnit = (itemIdx, profileId, delta) => {
    const cur   = unitAssignments[itemIdx] || {};
    const item  = receiptData.items[itemIdx];
    const next  = Math.max(0, (cur[profileId] || 0) + delta);
    const total = Object.values({ ...cur, [profileId]: next }).reduce((a, b) => a + b, 0);
    if (total > item.qty) return;
    setUnitAssignments({ ...unitAssignments, [itemIdx]: { ...cur, [profileId]: next } });
  };

  const setSolo = (itemIdx, profileId) => {
    setSoloAssignments(prev => ({
      ...prev,
      [itemIdx]: prev[itemIdx] === profileId ? null : profileId,
    }));
  };

  const togglePerUnit = (itemIdx, unitIdx, profileId) => {
    setPerUnitSlots(prev => {
      const itemSlots = { ...(prev[itemIdx] || {}) };
      const cur       = itemSlots[unitIdx] || [];
      itemSlots[unitIdx] = cur.includes(profileId)
        ? cur.filter(id => id !== profileId)
        : [...cur, profileId];
      return { ...prev, [itemIdx]: itemSlots };
    });
  };

  const isItemComplete = (idx) => {
    const method = itemMethods[idx] || 'equal';
    const item   = receiptData?.items?.[idx];
    if (method === 'solo')    return !!soloAssignments[idx];
    if (method === 'unit')    return Object.values(unitAssignments[idx] || {}).reduce((a, b) => a + b, 0) > 0;
    if (method === 'perunit') {
      if (!item) return false;
      const slots = perUnitSlots[idx] || {};
      for (let u = 0; u < item.qty; u++) {
        if (!slots[u]?.length) return false;
      }
      return true;
    }
    return (assignments[idx] || []).length > 0;
  };

  const perUnitProgress = (idx) => {
    const item  = receiptData?.items?.[idx];
    if (!item) return { assigned: 0, total: 0 };
    const slots    = perUnitSlots[idx] || {};
    const assigned = Array.from({ length: item.qty }, (_, u) => u)
      .filter(u => (slots[u] || []).length > 0).length;
    return { assigned, total: item.qty };
  };

  const assignedCount = receiptData?.items?.filter((_, i) => isItemComplete(i)).length || 0;
  const totalItems    = receiptData?.items?.length || 0;
  const progress      = totalItems > 0 ? (assignedCount / totalItems) * 100 : 0;

  const calculateSplit = async () => {
    setLoading(true);
    let tempProfiles = [...profiles];
    const subtotals  = {};
    const items      = receiptData.items || [];
    const tax        = receiptData.tax || 0;
    const currency   = receiptData.currency || 'IDR';

    tempProfiles.forEach(p => {
      subtotals[p.id] = { id: p.id, name: p.name, subtotal: 0, items: [] };
    });

    const ensureUnassigned = () => {
      if (!subtotals['unassigned']) {
        tempProfiles = [...tempProfiles, { id: 'unassigned', name: 'Unassigned', color: '#DDD0FF' }];
        subtotals['unassigned'] = { id: 'unassigned', name: 'Unassigned', subtotal: 0, items: [] };
      }
    };

    items.forEach((item, idx) => {
      const method = itemMethods[idx] || 'equal';
      const total  = item.qty * item.price;

      if (method === 'solo') {
        const soloId = soloAssignments[idx];
        if (soloId && subtotals[soloId]) {
          subtotals[soloId].subtotal += total;
          subtotals[soloId].items.push({ name: item.name, qty: item.qty, price: item.price, total });
        } else {
          ensureUnassigned();
          subtotals['unassigned'].subtotal += total;
          subtotals['unassigned'].items.push({ name: item.name, qty: item.qty, price: item.price, total });
        }

      } else if (method === 'unit') {
        const unitMap = unitAssignments[idx] || {};
        let assignedQty = 0;
        Object.entries(unitMap).forEach(([pid, qty]) => {
          if (!subtotals[pid] || qty === 0) return;
          assignedQty += qty;
          const sub = qty * item.price;
          subtotals[pid].subtotal += sub;
          subtotals[pid].items.push({ name: item.name, qty, price: item.price, total: sub });
        });
        const leftover = item.qty - assignedQty;
        if (leftover > 0) {
          ensureUnassigned();
          const sub = leftover * item.price;
          subtotals['unassigned'].subtotal += sub;
          subtotals['unassigned'].items.push({ name: item.name, qty: leftover, price: item.price, total: sub });
        }

      } else if (method === 'perunit') {
        const slots = perUnitSlots[idx] || {};
        for (let u = 0; u < item.qty; u++) {
          const participants = slots[u] || [];
          if (participants.length > 0) {
            const share = item.price / participants.length;
            const label = participants.length > 1
              ? `${item.name} (unit ${u + 1} ÷ ${participants.length})`
              : `${item.name} (unit ${u + 1})`;
            participants.forEach(pid => {
              if (!subtotals[pid]) return;
              subtotals[pid].subtotal += share;
              subtotals[pid].items.push({ name: label, qty: 1, price: item.price, total: share });
            });
          } else {
            ensureUnassigned();
            subtotals['unassigned'].subtotal += item.price;
            subtotals['unassigned'].items.push({
              name:  `${item.name} (unit ${u + 1})`,
              qty:   1,
              price: item.price,
              total: item.price,
            });
          }
        }

      } else {
        // equal (default)
        const selected = assignments[idx] || [];
        if (selected.length > 0) {
          const share = total / selected.length;
          const label = selected.length > 1 ? `${item.name} ÷ ${selected.length}` : item.name;
          selected.forEach(pid => {
            if (!subtotals[pid]) return;
            subtotals[pid].subtotal += share;
            subtotals[pid].items.push({ name: label, qty: item.qty, price: item.price, total: share });
          });
        } else {
          ensureUnassigned();
          subtotals['unassigned'].subtotal += total;
          subtotals['unassigned'].items.push({ name: item.name, qty: item.qty, price: item.price, total });
        }
      }
    });

    // tax is divided only among real people; the virtual unassigned bucket gets no tax share
    const perTax = profiles.length > 0 ? tax / profiles.length : 0;
    const finalSplit = Object.values(subtotals)
      .map(p => ({
        id:       p.id,
        name:     p.name,
        subtotal: Math.round(p.subtotal * 100) / 100,
        tax:      Math.round(perTax * 100) / 100,
        total:    Math.round((p.subtotal + perTax) * 100) / 100,
        items:    p.items.length > 0 ? p.items : undefined,
      }))
      .filter(p => p.total > 0);

    const payload = {
      currency,
      restaurant: receiptData.restaurant,
      date:       receiptData.date,
      items,
      tax:        Math.round(tax * 100) / 100,
      split:      finalSplit,
    };

    try {
      const res  = await fetch('/api/save-result', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.id) {
        setTimeout(() => router.push(`/result/${data.id}`), 1200);
      } else {
        setLoading(false);
        setToastMsg('Failed to save result. Please try again.');
      }
    } catch {
      setLoading(false);
      setToastMsg('Failed to save result. Please try again.');
    }
  };

  if (!receiptData) return <Loader message="Loading receipt data..." />;
  if (loading)      return <Loader message="Calculating split..." />;

  const currency = receiptData.currency || 'IDR';
  const fmt      = (n) => formatAmount(n, currency);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDE7] text-[#2D1B69]">
      {toastMsg && <Toast message={toastMsg} type="error" onClose={() => setToastMsg(null)} />}

      {/* Header */}
      <header className="bg-[#2D1B69] text-[#FFFDE7] border-b border-[#1E1245] sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-4 h-4 text-[#F5C24C]" />
            <span className="text-sm uppercase tracking-[0.25em] font-bold">Angelica's Split Bill</span>
          </div>
          <span className="text-[10px] text-[#8B72BE] tracking-[0.2em] uppercase hidden sm:block">by Angelica</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <StepBar current={3} />

        {/* Section header */}
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.45em] text-[#7C3AED] mb-1.5">Step 03 of 04</p>
          <h1 className="text-3xl font-bold uppercase tracking-tight leading-none">Assign Party</h1>
          <p className="text-sm text-[#5B3F8C] mt-2">
            {receiptData.restaurant} &middot; {receiptData.date}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6 border border-[#DDD0FF] bg-[#FEFCE8] p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase tracking-widest text-[#8B72BE]">Items Assigned</span>
            <span className="text-xs font-bold tabular-nums">
              <span className="text-[#7C3AED]">{assignedCount}</span>
              <span className="text-[#8B72BE]"> / {totalItems}</span>
            </span>
          </div>
          <div className="h-1.5 bg-[#EDE9FE] w-full">
            <motion.div
              className="h-full bg-[#7C3AED]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          {assignedCount === totalItems && totalItems > 0 && (
            <p className="text-[10px] text-[#7C3AED] uppercase tracking-widest mt-2 flex items-center gap-1">
              <Check className="w-3 h-3" /> All items assigned
            </p>
          )}
        </div>

        {/* Party roster */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#8B72BE] mb-3">Party Roster</p>
          <div className="flex flex-wrap gap-2 items-center">
            {profiles.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 px-3 py-1.5 border text-xs font-bold uppercase tracking-wider"
                style={{ borderColor: p.color, color: p.color, backgroundColor: `${p.color}18` }}
              >
                <User className="w-3 h-3" />
                {p.name}
              </div>
            ))}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 border-2 border-dashed border-[#DDD0FF]
                  text-xs uppercase tracking-widest text-[#8B72BE] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors">
                  <Plus className="w-3 h-3" /> Add Member
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm border border-[#DDD0FF] rounded-none bg-[#FEFCE8] shadow-2xl p-0">
                <div className="bg-[#2D1B69] px-5 py-3">
                  <DialogTitle className="text-sm uppercase tracking-widest text-[#FFFDE7]">Add Party Member</DialogTitle>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.35em] text-[#8B72BE] block mb-2">Name</label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addProfile()}
                      placeholder="e.g. Alice"
                      className="border-[#DDD0FF] rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-[#7C3AED] font-mono text-sm text-[#2D1B69]"
                    />
                  </div>
                  <button
                    onClick={addProfile}
                    className="w-full bg-[#F5C24C] text-[#2D1B69] py-2.5 text-xs uppercase tracking-[0.25em] font-bold
                      hover:bg-[#EAB308] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Confirm
                  </button>
                </div>
              </DialogContent>
            </Dialog>

            {profiles.length === 0 && (
              <span className="text-[10px] text-[#8B72BE] tracking-wide flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" /> Add at least one member
              </span>
            )}
          </div>
        </div>

        {/* Item list */}
        <div className="space-y-px border-t border-[#DDD0FF]">
          {receiptData.items?.map((item, idx) => {
            const method    = itemMethods[idx] || 'equal';
            const complete  = isItemComplete(idx);
            const unitMap   = unitAssignments[idx] || {};
            const unitTotal = Object.values(unitMap).reduce((a, b) => a + b, 0);
            const puProg    = method === 'perunit' ? perUnitProgress(idx) : null;

            return (
              <motion.div
                key={idx}
                layout
                className={`border-b border-[#DDD0FF] bg-[#FEFCE8] transition-all
                  ${complete ? 'border-l-4 border-l-[#F5C24C]' : 'border-l-4 border-l-transparent'}`}
              >
                {/* Item info */}
                <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide leading-tight text-[#2D1B69]">{item.name}</p>
                    <p className="text-[11px] text-[#8B72BE] mt-0.5 tabular-nums">
                      Qty {item.qty} &times; {fmt(item.price)}
                      {item.qty > 1 && (
                        <span className="ml-2 text-[#DDD0FF]">/ {fmt(item.price)} per unit</span>
                      )}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {complete ? (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#7C3AED] font-bold">
                        <Check className="w-3 h-3" /> Done
                      </span>
                    ) : puProg ? (
                      <span className="text-[10px] uppercase tracking-widest text-[#8B72BE] font-bold">
                        {puProg.assigned}/{puProg.total} units
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-widest text-[#8B72BE]">Pending</span>
                    )}
                    {method === 'unit' && (
                      <p className="text-[10px] tabular-nums text-[#8B72BE] mt-0.5">{unitTotal}/{item.qty} assigned</p>
                    )}
                  </div>
                </div>

                {/* Method selector + assignment controls */}
                <div className="px-4 pb-4">
                  {/* Method buttons */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {[
                      { value: 'equal',   label: '= Equal'    },
                      { value: 'unit',    label: '# Units'    },
                      { value: 'solo',    label: '→ Solo'     },
                      ...(item.qty > 1
                        ? [{ value: 'perunit', label: '÷ Per Unit' }]
                        : []),
                    ].map(({ value, label }) => {
                      const isActive = method === value;
                      return (
                        <button
                          key={value}
                          onClick={() => setItemMethod(idx, value)}
                          className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold border transition-colors
                            ${isActive
                              ? 'bg-[#2D1B69] text-[#FFFDE7] border-[#2D1B69]'
                              : 'bg-transparent text-[#8B72BE] border-[#DDD0FF] hover:border-[#7C3AED] hover:text-[#7C3AED]'}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {profiles.length === 0 ? (
                    <p className="text-[10px] text-[#8B72BE] tracking-wide">Add party members above to assign this item.</p>
                  ) : method === 'perunit' ? (
                    <div className="space-y-3">
                      {Array.from({ length: item.qty }, (_, u) => {
                        const unitPeeps = (perUnitSlots[idx] || {})[u] || [];
                        const share     = unitPeeps.length > 1 ? fmt(item.price / unitPeeps.length) : null;
                        return (
                          <div key={u} className="border border-dashed border-[#DDD0FF] p-3 bg-[#FFFDE7]">
                            {/* Unit header */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[9px] uppercase tracking-[0.3em] text-[#8B72BE] font-bold">
                                Unit {u + 1} — {fmt(item.price)}
                              </span>
                              {unitPeeps.length > 0 && (
                                <span className="text-[9px] text-[#7C3AED] uppercase tracking-widest font-bold">
                                  {unitPeeps.length === 1
                                    ? 'Solo'
                                    : `÷${unitPeeps.length} = ${share} each`}
                                </span>
                              )}
                            </div>
                            {/* Person chips for this unit */}
                            <div className="flex flex-wrap gap-1.5">
                              {profiles.map(p => {
                                const isOn = unitPeeps.includes(p.id);
                                return (
                                  <button
                                    key={p.id}
                                    onClick={() => togglePerUnit(idx, u, p.id)}
                                    className="flex items-center gap-1 px-2.5 py-1 border text-[10px] font-bold uppercase tracking-wide transition-all"
                                    style={isOn
                                      ? { backgroundColor: p.color, borderColor: p.color, color: '#fff' }
                                      : { backgroundColor: 'transparent', borderColor: '#DDD0FF', color: '#8B72BE' }}
                                  >
                                    <User className="w-2.5 h-2.5" />
                                    {p.name.length > 8 ? p.name.slice(0, 8) + '..' : p.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profiles.map((p) => {
                        if (method === 'unit') {
                          const qty = unitMap[p.id] || 0;
                          return (
                            <div key={p.id} className="flex items-center border border-[#DDD0FF]">
                              <button
                                onClick={() => changeUnit(idx, p.id, -1)}
                                className="px-2 py-1.5 hover:bg-[#EDE9FE] transition-colors text-[#8B72BE] hover:text-[#DC2626]"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <div
                                className="px-3 py-1.5 border-x border-[#DDD0FF] text-xs font-bold uppercase tracking-wide min-w-[4rem] text-center transition-colors"
                                style={qty > 0
                                  ? { backgroundColor: p.color, borderColor: p.color, color: '#fff' }
                                  : { color: '#8B72BE' }}
                              >
                                {qty > 0 ? `${p.name.slice(0, 4)} ×${qty}` : p.name.length > 5 ? p.name.slice(0, 5) + '..' : p.name}
                              </div>
                              <button
                                onClick={() => changeUnit(idx, p.id, 1)}
                                className="px-2 py-1.5 hover:bg-[#EDE9FE] transition-colors text-[#8B72BE] hover:text-[#7C3AED]"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        }

                        if (method === 'solo') {
                          const isSelected = soloAssignments[idx] === p.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => setSolo(idx, p.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold uppercase tracking-wide transition-all"
                              style={isSelected
                                ? { backgroundColor: p.color, borderColor: p.color, color: '#fff' }
                                : { backgroundColor: 'transparent', borderColor: '#DDD0FF', color: '#8B72BE' }}
                            >
                              <User className="w-3 h-3" />
                              {p.name.length > 8 ? p.name.slice(0, 8) + '..' : p.name}
                              {isSelected && <Check className="w-3 h-3 ml-1" />}
                            </button>
                          );
                        }

                        // equal (default)
                        const isOn = (assignments[idx] || []).includes(p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => toggleEqual(idx, p.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold uppercase tracking-wide transition-all"
                            style={isOn
                              ? { backgroundColor: p.color, borderColor: p.color, color: '#fff' }
                              : { backgroundColor: 'transparent', borderColor: '#DDD0FF', color: '#8B72BE' }}
                          >
                            <User className="w-3 h-3" />
                            {p.name.length > 8 ? p.name.slice(0, 8) + '..' : p.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Calculate CTA */}
        <div className="mt-8">
          {profiles.length === 0 ? (
            <div className="border border-dashed border-[#DDD0FF] p-4 text-center">
              <p className="text-xs uppercase tracking-widest text-[#8B72BE]">Add party members to proceed</p>
            </div>
          ) : (
            <button
              onClick={calculateSplit}
              className="w-full bg-[#F5C24C] text-[#2D1B69] py-4 text-sm uppercase tracking-[0.25em] font-bold
                hover:bg-[#EAB308] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              Calculate Split
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
