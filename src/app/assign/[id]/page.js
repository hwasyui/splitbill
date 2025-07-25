'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, User, Minus, UtensilsCrossed } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loader from '@/components/ui/loader';
import Footer from '@/components/ui/footer';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

const generateRandomColor = () => {
    const colors = ['#F5C24C', '#FF6B6B', '#6BCB77', '#4D96FF', '#F9A826', '#8E7AB5', '#FF9F1C'];
    return colors[Math.floor(Math.random() * colors.length)];
};

export default function AssignPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [receiptData, setReceiptData] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [assignments, setAssignments] = useState({});
    const [unitAssignments, setUnitAssignments] = useState({});
    const [splitType, setSplitType] = useState('flexible');
    const [newProfileName, setNewProfileName] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/result/${id}`)
            .then(res => res.json())
            .then(data => {
                if (!data || !data.items) {
                    router.push('/');
                } else {
                    setReceiptData(data);
                }
            })
            .catch(() => router.push('/'));
    }, [id]);

    const addProfile = () => {
        if (!newProfileName.trim()) return;
        const newProfile = {
            id: uuidv4(),
            name: newProfileName.trim(),
            color: generateRandomColor(),
        };
        setProfiles([...profiles, newProfile]);
        setNewProfileName('');
        setDialogOpen(false);
    };

    const incrementQty = (itemIndex, profileId) => {
        const current = unitAssignments[itemIndex] || {};
        const item = receiptData.items[itemIndex];
        const newCount = (current[profileId] || 0) + 1;
        const totalAssigned = Object.values(current).reduce((a, b) => a + b, 0);

        if (newCount + totalAssigned - (current[profileId] || 0) <= item.qty) {
            setUnitAssignments({
                ...unitAssignments,
                [itemIndex]: {
                    ...current,
                    [profileId]: newCount,
                },
            });
        }
    };

    const decrementQty = (itemIndex, profileId) => {
        const current = unitAssignments[itemIndex] || {};
        const newCount = (current[profileId] || 0) - 1;
        if (newCount >= 0) {
            setUnitAssignments({
                ...unitAssignments,
                [itemIndex]: {
                    ...current,
                    [profileId]: newCount,
                },
            });
        }
    };

    const toggleAssignment = (itemIndex, profileId) => {
        if (splitType === 'unit') return;
        const current = assignments[itemIndex] || [];
        if (current.includes(profileId)) {
            setAssignments({
                ...assignments,
                [itemIndex]: current.filter(id => id !== profileId),
            });
        } else {
            setAssignments({
                ...assignments,
                [itemIndex]: [...current, profileId],
            });
        }
    };

    const calculateSplit = async () => {
        let tempProfiles = [...profiles];
        const subtotalPerPerson = {};
        const items = receiptData.items || [];
        const tax = receiptData.tax || 0;

        tempProfiles.forEach(p => {
            subtotalPerPerson[p.id] = {
                id: p.id,
                name: p.name,
                subtotal: 0,
                items: [],
            };
        });

        if (splitType === 'unit') {
            items.forEach((item, index) => {
                const assigned = unitAssignments[index] || {};
                let totalAssignedQty = 0;

                for (const profileId in assigned) {
                    const qty = assigned[profileId];
                    totalAssignedQty += qty;

                    if (!subtotalPerPerson[profileId]) continue;

                    const subtotal = qty * item.price;
                    subtotalPerPerson[profileId].subtotal += subtotal;
                    subtotalPerPerson[profileId].items.push({
                        name: item.name,
                        qty,
                        price: item.price,
                        total: subtotal,
                    });
                }

                const unassignedQty = item.qty - totalAssignedQty;
                if (unassignedQty > 0) {
                    const unassignedId = 'unassigned';
                    if (!subtotalPerPerson[unassignedId]) {
                        tempProfiles.push({
                            id: unassignedId,
                            name: 'Unassigned Subtotals',
                            color: '#CCCCCC',
                        });
                        subtotalPerPerson[unassignedId] = {
                            id: unassignedId,
                            name: 'Unassigned Subtotals',
                            subtotal: 0,
                            items: [],
                        };
                    }
                    const subtotal = unassignedQty * item.price;
                    subtotalPerPerson[unassignedId].subtotal += subtotal;
                    subtotalPerPerson[unassignedId].items.push({
                        name: item.name,
                        qty: unassignedQty,
                        price: item.price,
                        total: subtotal,
                    });
                }
            });
        } else {
            items.forEach((item, index) => {
                const totalItemCost = item.qty * item.price;
                const assignedProfiles = assignments[index] || [];

                if (assignedProfiles.length > 0) {
                    const perPersonShare = totalItemCost / assignedProfiles.length;
                    assignedProfiles.forEach(profileId => {
                        subtotalPerPerson[profileId].subtotal += perPersonShare;
                    });
                } else {
                    const unassignedId = 'unassigned';
                    if (!subtotalPerPerson[unassignedId]) {
                        tempProfiles.push({
                            id: unassignedId,
                            name: 'Unassigned Subtotals',
                            color: generateRandomColor()
                        });
                        subtotalPerPerson[unassignedId] = {
                            id: unassignedId,
                            name: 'Unassigned Subtotals',
                            subtotal: 0,
                            items: [],
                        };
                    }
                    subtotalPerPerson[unassignedId].subtotal += totalItemCost;
                }
            });
        }

        const realProfiles = tempProfiles.filter(p => p.id !== 'unassigned');
        const perPersonTax = splitType === 'unit' ? 0 : realProfiles.length > 0 ? tax / realProfiles.length : 0;

        const finalSplit = Object.values(subtotalPerPerson).map(p => {
            const isUnassigned = p.id === 'unassigned';
            const taxAmount = isUnassigned ? 0 : perPersonTax;
            return {
                id: p.id,
                name: p.name,
                subtotal: Math.round(p.subtotal),
                tax: Math.round(taxAmount),
                total: Math.round(p.subtotal + taxAmount),
                ...(splitType === 'unit' && !isUnassigned ? { items: p.items } : {}),
            };
        });

        const payload = {
            splitType,
            restaurant: receiptData.restaurant,
            date: receiptData.date,
            items,
            tax: Math.round(tax),
            split: finalSplit,
        };

        const res = await fetch('/api/save-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success && data.id) {
            router.push(`/result/${data.id}`);
        } else {
            alert('Failed to save result');
        }
    };

    if (!receiptData) return <Loader message="Preparing your receipt." />;

    return (
        <div className="flex flex-col min-h-screen">
        <main className="min-h-screen flex-grow bg-white bg-gradient-to-b from-[#FDF1E6] to-[#F7E1FF] text-[#3A2C5A]">
            <div className="text-center shadow-sm bg-[#FFF8F0] p-6">
                <div className="mb-4 flex items-center justify-center gap-2">
                    <h1 className="text-3xl font-bold">Assign People to Items</h1>
                </div>
                <p className="text-[#5A4B81] mb-2">
                    Restaurant: {receiptData.restaurant} | Date: {receiptData.date} | Tax: Rp{" "}
                    {Number(receiptData.tax || 0).toLocaleString()}
                </p>
            </div>
            <section className="p-4 sm:p-6 max-w-3xl mx-auto w-full">
                <div className="mb-4 mt-5 flex flex-col sm:flex-row sm:items-center">
                    <label className="text-xl font-semibold mr-4">Split Type:</label>
                    <Select value={splitType} onValueChange={setSplitType}>
                        <SelectTrigger className="w-full sm:w-[260px] border-dashed border-[#BCA1E2] font-semibold text-[#3A2C5A] focus:ring-[#BCA1E2]">
                            <SelectValue placeholder="Select split type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="flexible">Flexible (Shared Price)</SelectItem>
                            <SelectItem value="unit">Unit (Assign Qty)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <h2 className="text-xl font-semibold mr-4 mb-2">Profiles:</h2>
                        <div className="flex gap-2 flex-wrap">
                            {profiles.map((p) => (
                                <div
                                    key={p.id}
                                    className="px-4 py-2 rounded-full text-white text-sm flex items-center gap-2"
                                    style={{ backgroundColor: p.color }}
                                >
                                    <User className="w-4 h-4" /> {p.name}
                                </div>
                            ))}
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="border-dashed border-[#BCA1E2] text-[#3A2C5A]">
                                        <Plus className="w-4 h-4 mr-1" /> Add Person
                                    </Button>
                                </DialogTrigger>
                                <DialogContent
                                    className="sm:max-w-[400px] rounded-2xl border-none shadow-lg"
                                    style={{
                                        background: "linear-gradient(135deg, #FDF6EC, #E6D4F5)",
                                        color: "#3A2C5A",
                                    }}
                                >
                                    <DialogTitle className="text-lg font-bold text-center">Add a Person</DialogTitle>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="text-md text-[#3A2C5A]">
                                            Enter name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={newProfileName}
                                            onChange={(e) => setNewProfileName(e.target.value)}
                                            placeholder="e.g., Alice"
                                            className="bg-white border border-[#DCCEF7] focus:ring-[#BCA1E2]"
                                        />
                                        <Button
                                            className="mt-2 bg-[#F5C24C] hover:bg-[#eabf4a] text-[#3A2C5A] font-semibold"
                                            onClick={addProfile}
                                        >
                                            Add Profile
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {receiptData.items?.map((item, index) => {
                        const totalAssignedQty = Object.values(unitAssignments[index] || {}).reduce(
                            (a, b) => a + b,
                            0
                        );
                        return (
                            <div
                                key={index}
                                className="w-full border p-4 rounded-xl bg-[#FFF8F0] shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="mb-2 sm:mb-0">
                                    <h3 className="font-semibold text-lg">{item.name}</h3>
                                    <p className="text-sm text-[#5A4B81]">
                                        Qty: {item.qty} × Rp{item.price.toLocaleString()}
                                        {splitType === "unit" && (
                                            <span className="ml-2 text-red-600">
                                                ({totalAssignedQty}/{item.qty} assigned)
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex gap-3 flex-wrap justify-start sm:justify-end">
                                    {profiles.map((p) => {
                                        const isAssigned =
                                            splitType === "unit"
                                                ? (unitAssignments[index]?.[p.id] || 0) > 0
                                                : (assignments[index] || []).includes(p.id);
                                        const qty = unitAssignments[index]?.[p.id] || 0;
                                        return (
                                            <div key={p.id} className="flex flex-col items-center">
                                                <div
                                                    onClick={() => toggleAssignment(index, p.id)}
                                                    className={`cursor-pointer w-11 h-11 rounded-full flex flex-col items-center justify-center text-xs font-medium shadow transition-transform duration-200 ${isAssigned ? "ring-1 ring-offset-2 ring-white" : "opacity-80"
                                                        }`}
                                                    style={{
                                                        backgroundColor: isAssigned ? p.color : "#F3EFFF",
                                                        color: isAssigned ? "#fff" : "#3A2C5A",
                                                    }}
                                                >
                                                    <User className="w-3 h-3" />
                                                    <span className="text-[10px] font-medium">
                                                        {p.name.length > 4 ? `${p.name.slice(0, 4)}..` : p.name}
                                                    </span>
                                                    {splitType === "unit" && qty > 0 && (
                                                        <span className="text-[10px] font-semibold">{qty}x</span>
                                                    )}
                                                </div>
                                                {splitType === "unit" && (
                                                    <div className="flex gap-0">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="hover:cursor-pointer  w-5 h-5 space-x-0 p-0 m-0 gap-0"
                                                            onClick={() => decrementQty(index, p.id)}
                                                        >
                                                            <Minus className="w-1 h-1 text-red-500 space-x-0" strokeWidth={4} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="hover:cursor-pointer  w-5 h-5 space-x-0 p-0 m-0 gap-0"
                                                            onClick={() => incrementQty(index, p.id)}
                                                        >
                                                            <Plus className="w-1 h-1 text-yellow-500 space-x-0" strokeWidth={4} />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-10 text-center">
                    <Button
                        onClick={calculateSplit}
                        size="lg"
                        className="bg-[#F5C24C] hover:bg-[#ecc043] text-[#3A2C5A] text-lg px-10 md:px-50 py-5 rounded-full shadow-lg"
                    >
                        Finish
                    </Button>
                </div>
            </section>
        </main>
        <Footer/>
        </div>
    );
}
