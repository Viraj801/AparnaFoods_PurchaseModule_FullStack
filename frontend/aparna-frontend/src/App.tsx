// @ts-nocheck
import {
    Building,
    CheckCircle,
    ChevronRight,
    Eye,
    FileText,
    History,
    IndianRupee,
    LayoutDashboard,
    Package,
    PlusCircle,
    Printer,
    RefreshCw,
    Search,
    Sparkles,
    Trash2,
    TrendingUp,
    Users,
    Weight
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Login from './Login';

const VARIANT_PRESETS = [
    "CLASSIC 10KG * 4",
    "CLASSIC 5KG * 8",
    "CREAMY SELLA 2ND WAND 50KG",
    "CREAMY SELLA CSR BROKEN 50KG",
    "CREAMY SELLA CSR WAND 50KG",
    "CREAMY SELLA DUBAR 50KG",
    "CREAMY SELLA MINI MOGRA 50KG",
    "CREAMY SELLA MIX BROKEN 50KG",
    "CREAMY SELLA MOGRA 50KG",
    "CREAMY SELLA NAKKU 40KG",
    "CREAMY SELLA NAKKU MTR 40KG",
    "CREAMY SELLA OVER SIZER 50KG",
    "RAW BASMATI 1121 50KG",
    "1509 STEAM RICE 50KG",
    "SHARBATI STEAM RICE 50KG"
];

const INITIAL_POS = [
    {
        id: 'PO-0070',
        poNumber: 'PO/26-27/0070',
        poDate: '2026-09-27',
        party: 'Radha Krishna Grain Corp',
        purchasedBy: 'Amit Sharma',
        broker: 'Mahesh Mandi Brokers',
        brokerage: 1850,
        paymentTerms: '15 Days PDC',
        danaCut: '0.5%',
        cd: '1.5%',
        freightPartyOrSelf: 'Party',
        bardana: 'Supplier Bag (Plastic)',
        remarks: 'Moisture within 11.5% limits. Premium milling batch.',
        village: 'Karnal Mandi',
        farmerName: 'Baldev Singh',
        mobileNumber: '9876543210',
        company: 'Aparna Foods Ltd.',
        status: 'Received',
        items: [
            { id: 1, variantName: 'CREAMY SELLA 2ND WAND 50KG', itemType: 'Rice', bags: 120, weight: 60.00, rate: 3950, amount: 237000 },
            { id: 2, variantName: 'CREAMY SELLA DUBAR 50KG', itemType: 'Rice', bags: 80, weight: 40.00, rate: 3400, amount: 136000 }
        ],
        totalBags: 200,
        totalWeight: 100.00,
        totalAmount: 373000
    },
    {
        id: 'PO-0069',
        poNumber: 'PO/26-27/0069',
        poDate: '2026-09-26',
        party: 'Kisan Agro Producers Co.',
        purchasedBy: 'Vikram Joshi',
        broker: 'Direct Farmer Purchase',
        brokerage: 0,
        paymentTerms: 'Immediate RTGS',
        danaCut: 'Nil',
        cd: '2.0%',
        freightPartyOrSelf: 'Self',
        bardana: 'Jute Bag Old',
        remarks: 'Direct paddy delivery at Yard 3.',
        village: 'Taraori',
        farmerName: 'Sukhwinder Pal',
        mobileNumber: '9812345678',
        company: 'Aparna Foods Ltd.',
        status: 'Pending',
        items: [
            { id: 1, variantName: 'CLASSIC 10KG * 4', itemType: 'Paddy', bags: 250, weight: 100.00, rate: 4200, amount: 420000 },
            { id: 2, variantName: 'CREAMY SELLA CSR BROKEN 50KG', itemType: 'Rice', bags: 100, weight: 50.00, rate: 2900, amount: 145000 }
        ],
        totalBags: 350,
        totalWeight: 150.00,
        totalAmount: 565000
    },
    {
        id: 'PO-0068',
        poNumber: 'PO/26-27/0068',
        poDate: '2026-09-24',
        party: 'Garg Trading Agency',
        purchasedBy: 'Amit Sharma',
        broker: 'Rajesh Mittal Broker',
        brokerage: 2400,
        paymentTerms: '30 Days Net',
        danaCut: '1.0%',
        cd: 'Nil',
        freightPartyOrSelf: 'Party',
        bardana: 'New HDPE Bags',
        remarks: 'Quality verified on batch sample 104.',
        village: 'Nissing',
        farmerName: 'Gurmeet Dhillon',
        mobileNumber: '9416023411',
        company: 'Aparna Foods Ltd.',
        status: 'Billed',
        items: [
            { id: 1, variantName: 'CREAMY SELLA MINI MOGRA 50KG', itemType: 'Rice', bags: 150, weight: 75.00, rate: 3100, amount: 232500 }
        ],
        totalBags: 150,
        totalWeight: 75.00,
        totalAmount: 232500
    }
];

/* Helper to format Currency in Indian numbering system */
const formatINR = (val) => {
    const num = Number(val) || 0;
    return '₹ ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};



export default function App() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('af_token') : null;
    if (!token) {
        return <Login />;
    }


    const API_BASE = 'https://aparnafoodspurchasemodule20260928170409-c3c6gjfcachzcjhp.indiasouthcentral-01.azurewebsites.net/api/purchaseorders';
    // helper to attach Authorization header from localStorage token
    const authFetch = async (input, init = {}) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('af_token') : null;
        const headers = new Headers(init.headers || {});
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return fetch(input, { ...init, headers });
    };
    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('af_token');
            // optionally clear other app state
            window.location.reload();
        }
    };
    const [activeTab, setActiveTab] = useState('entry'); // 'dashboard', 'entry', 'history'
    const [poList, setPoList] = useState(INITIAL_POS);
    const [toastMessage, setToastMessage] = useState(null);
    const [viewingPo, setViewingPo] = useState(null);
    const [editingPoId, setEditingPoId] = useState(null); // UI id like 'BPO-123' when editing existing server PO
    const [filterQuery, setFilterQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Form State for Purchase Order matching the Spreadsheet fields
    const [formData, setFormData] = useState({
        poNumber: 'PO/26-27/0071',
        poDate: '2026-09-27',
        party: '',
        purchasedBy: 'Aparna Foods Purchase Desk',
        broker: '',
        brokerage: '',
        paymentTerms: '15 Days',
        danaCut: '',
        cd: '',
        freightPartyOrSelf: 'Party',
        bardana: '',
        remarks: '',
        village: '',
        farmerName: '',
        mobileNumber: '',
        company: 'Aparna Foods Ltd.',
        status: 'Pending'
    });

    const [items, setItems] = useState([
        {
            id: Date.now(),
            variantName: 'CREAMY SELLA 2ND WAND 50KG',
            itemType: 'Rice',
            bags: 0,
            weight: 0.00,
            rate: 0
        }
    ]);
    const [selectedPoToEdit, setSelectedPoToEdit] = useState('');
    const [selectedPoToProcess, setSelectedPoToProcess] = useState('');

    // Load an existing PO into the entry form for editing
    const loadPoForEdit = (poId) => {
        const po = poList.find(p => p.id === poId);
        if (!po) {
            showToast('Could not locate the selected PO.');
            return;
        }

        // Populate formData and items for editing
        setFormData({
            poNumber: po.poNumber || '',
            poDate: po.poDate || '',
            party: po.party || '',
            purchasedBy: po.purchasedBy || 'Aparna Foods Purchase Desk',
            broker: po.broker || '',
            brokerage: po.brokerage || '',
            paymentTerms: po.paymentTerms || '15 Days',
            danaCut: po.danaCut || '',
            cd: po.cd || '',
            freightPartyOrSelf: po.freightPartyOrSelf || 'Party',
            bardana: po.bardana || '',
            remarks: po.remarks || '',
            village: po.village || '',
            farmerName: po.farmerName || '',
            mobileNumber: po.mobileNumber || '',
            company: po.company || 'Aparna Foods Ltd.',
            tdnNumber: po.tdnNumber || '',
            truckNumber: po.truckNumber || '',
            truckDateTime: po.truckDateTime ? po.truckDateTime.slice(0, 16) : '',
            status: po.status || 'Pending'
        });

        setItems((po.items || []).map(it => ({
            id: it.id || Date.now() + Math.random(),
            variantName: it.variantName,
            itemType: it.itemType || 'Rice',
            bags: it.bags || 0,
            weight: it.weight || 0,
            rate: it.rate || 0
        })));

        setEditingPoId(po.id);
        showToast(`Loaded ${po.poNumber} for editing.`);
    };

    // Mark a PO as processed (local update)
    const processPo = (poId) => {
        if (!poId) { showToast('Select a valid PO to process.'); return; }
        const po = poList.find(p => p.id === poId);
        if (!po) { showToast('Select a valid PO to process.'); return; }
        const updated = { ...po, status: 'Processed' };
        // If this is backend-saved PO, send update to server
        if (typeof poId === 'string' && poId.startsWith('BPO-')) {
            const numericId = parseInt(poId.replace('BPO-', ''), 10);
            (async () => {
                try {
                    const res = await authFetch(`${API_BASE}/${numericId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...mapUiPoToApi(updated) })
                    });
                    if (!res.ok) throw new Error('Failed to update status on server');
                    const updatedFromServer = await res.json();
                    setPoList(prev => prev.map(p => p.id === poId ? mapApiPoToUi(updatedFromServer) : p));
                    showToast(`Purchase Order ${po.poNumber} marked as Processed on server.`);
                } catch (err) {
                    setPoList(prev => prev.map(p => p.id === poId ? updated : p));
                    showToast(`Purchase Order ${po.poNumber} marked as Processed (local fallback).`);
                }
            })();
        } else {
            setPoList(prev => prev.map(p => p.id === poId ? updated : p));
            showToast(`Purchase Order ${po.poNumber} marked as Processed (local).`);
        }
    };

    // Verify a PO (local update)
    const verifyPo = (poId) => {
        if (!poId) { showToast('Select a valid PO to verify.'); return; }
        const po = poList.find(p => p.id === poId);
        if (!po) { showToast('Select a valid PO to verify.'); return; }
        const updated = { ...po, status: 'Verified' };
        // Persist status to backend for backend-saved POs
        if (typeof poId === 'string' && poId.startsWith('BPO-')) {
            const numericId = parseInt(poId.replace('BPO-', ''), 10);
            (async () => {
                try {
                    const res = await authFetch(`${API_BASE}/${numericId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...mapUiPoToApi(updated) })
                    });
                    if (!res.ok) throw new Error('Failed to update status on server');
                    const updatedFromServer = await res.json();
                    setPoList(prev => prev.map(p => p.id === poId ? mapApiPoToUi(updatedFromServer) : p));
                    showToast(`Purchase Order ${po.poNumber} marked as Verified on server.`);
                } catch (err) {
                    setPoList(prev => prev.map(p => p.id === poId ? updated : p));
                    showToast(`Purchase Order ${po.poNumber} marked as Verified (local fallback).`);
                }
            })();
        } else {
            setPoList(prev => prev.map(p => p.id === poId ? updated : p));
            showToast(`Purchase Order ${po.poNumber} marked as Verified (local).`);
        }
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => {
            setToastMessage(null);
        }, 3800);
    };

    // Map API PO to frontend UI shape
    const mapApiPoToUi = (po) => {
        const items = (po.items || []).map(it => ({
            id: it.itemId || Date.now(),
            variantName: it.variantName,
            itemType: it.itemType,
            bags: it.noOfBags || 0,
            weight: Number(it.weightInQtl) || 0,
            rate: Number(it.ratePerQtl) || 0,
            amount: Number(it.amount) || (Number(it.weightInQtl || 0) * Number(it.ratePerQtl || 0))
        }));

        const totalBags = items.reduce((s, it) => s + (it.bags || 0), 0);
        const totalWeight = items.reduce((s, it) => s + (Number(it.weight) || 0), 0);
        const totalAmount = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);

        return {
            id: `BPO-${po.poId}`,
            poNumber: po.poNumber,
            poDate: po.poDate,
            party: po.partyName,
            purchasedBy: po.purchasedBy,
            broker: po.broker,
            brokerage: Number(po.brokerage) || 0,
            paymentTerms: po.paymentTerms,
            danaCut: po.danaCut,
            cd: po.cd,
            freightPartyOrSelf: po.freightPartyOrSelf,
            bardana: po.bardana,
            remarks: po.remarks,
            village: po.village,
            farmerName: po.farmerName,
            mobileNumber: po.mobileNumber,
            company: po.company,
            tdnNumber: po.tdnNumber,
            truckNumber: po.truckNumber,
            truckDateTime: po.truckDateTime ? po.truckDateTime.slice(0, 16) : '',
            status: po.status || 'Pending',
            items,
            totalBags,
            totalWeight: Number(totalWeight.toFixed(2)),
            totalAmount: Number(totalAmount.toFixed(2))
        };
    };

    // Map frontend UI PO shape back to API DTO shape for PUT/POST
    const mapUiPoToApi = (uiPo) => {
        return {
            poNumber: uiPo.poNumber,
            poDate: uiPo.poDate,
            partyName: uiPo.party,
            purchasedBy: uiPo.purchasedBy,
            broker: uiPo.broker,
            brokerage: Number(uiPo.brokerage) || 0,
            status: uiPo.status || 'Pending',
            paymentTerms: uiPo.paymentTerms,
            danaCut: uiPo.danaCut,
            cd: uiPo.cd,
            freightPartyOrSelf: uiPo.freightPartyOrSelf,
            remarks: uiPo.remarks,
            bardana: uiPo.bardana,
            village: uiPo.village,
            farmerName: uiPo.farmerName,
            mobileNumber: uiPo.mobileNumber,
            company: uiPo.company,
            tdnNumber: uiPo.tdnNumber,
            truckNumber: uiPo.truckNumber,
            truckDateTime: uiPo.truckDateTime || null,
            items: (uiPo.items || []).map(it => ({
                variantName: it.variantName,
                itemType: it.itemType,
                noOfBags: Number(it.bags) || 0,
                weightInQtl: Number(it.weight) || 0,
                ratePerQtl: Number(it.rate) || 0
            }))
        };
    };

    // Fetch PO list from backend on mount (fall back to local data on error)
    useEffect(() => {
        const fetchPOs = async () => {
            try {
                const res = await authFetch(API_BASE);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                const mapped = data.map(mapApiPoToUi);
                // Prefer server data; fall back to initial sample data if empty
                if (mapped && mapped.length > 0) setPoList(mapped);
                else setPoList(INITIAL_POS);
            } catch (err) {
                // keep initial local data
                console.warn('Could not fetch PO list from API:', err);
                setPoList(INITIAL_POS);
            }
        };
        fetchPOs();
    }, []);

    const calculatedItems = useMemo(() => {
        return items.map(item => {
            const bags = Number(item.bags) || 0;
            const weight = Number(item.weight) || 0;
            const rate = Number(item.rate) || 0;
            const amount = Number((weight * rate).toFixed(2));
            return {
                ...item,
                bags,
                weight,
                rate,
                amount
            };
        });
    }, [items]);

    const totals = useMemo(() => {
        return calculatedItems.reduce(
            (acc, item) => {
                acc.bags += item.bags;
                acc.weight += item.weight;
                acc.amount += item.amount;
                return acc;
            },
            { bags: 0, weight: 0, amount: 0 }
        );
    }, [calculatedItems]);

    /* Handle Item Section Updates */
    const handleItemChange = (id, field, value) => {
        setItems(prev =>
            prev.map(row => (row.id === id ? { ...row, [field]: value } : row))
        );
    };

    const handleAddItemRow = () => {
        setItems(prev => [
            ...prev,
            {
                id: Date.now() + Math.random(),
                variantName: VARIANT_PRESETS[0],
                itemType: 'Rice',
                bags: 0,
                weight: 0.00,
                rate: 0.00
            }
        ]);
    };

    const handleRemoveItemRow = (id) => {
        if (items.length === 1) {
            showToast('At least one item row is required in the Purchase Order.');
            return;
        }
        setItems(prev => prev.filter(row => row.id !== id));
    };

    const handleResetForm = () => {
        setFormData({
            poNumber: `PO/26-27/00${70 + poList.length + 1}`,
            poDate: '2026-09-27',
            party: '',
            purchasedBy: 'Aparna Foods Purchase Desk',
            broker: '',
            brokerage: '',
            paymentTerms: '15 Days',
            danaCut: '',
            cd: '',
            freightPartyOrSelf: 'Party',
            bardana: '',
            remarks: '',
            village: '',
            farmerName: '',
            mobileNumber: '',
            company: 'Aparna Foods Ltd.',
            tdnNumber: '',
            truckNumber: '',
            truckDateTime: '',
            status: 'Pending'
        });
        setItems([
            {
                id: Date.now(),
                variantName: 'CREAMY SELLA 2ND WAND 50KG',
                itemType: 'Rice',
                bags: 0,
                weight: 0.00,
                rate: 0.00
            }
        ]);
        showToast('Form reset to default.');
    };

    const handleSavePO = (e) => {
        e.preventDefault();
        if (!formData.poNumber.trim()) {
            showToast('Error: PO Number is required.');
            return;
        }
        if (totals.amount <= 0 && totals.bags <= 0) {
            showToast('Please specify valid bags, weight, or rates in the items section.');
            return;
        }

        const payload = {
            poNumber: formData.poNumber,
            poDate: formData.poDate,
            partyName: formData.party,
            purchasedBy: formData.purchasedBy,
            broker: formData.broker,
            brokerage: Number(formData.brokerage) || 0,
            status: formData.status || 'Pending',
            paymentTerms: formData.paymentTerms,
            danaCut: formData.danaCut,
            cd: formData.cd,
            freightPartyOrSelf: formData.freightPartyOrSelf,
            remarks: formData.remarks,
            bardana: formData.bardana,
            village: formData.village,
            farmerName: formData.farmerName,
            mobileNumber: formData.mobileNumber,
            company: formData.company,
            tdnNumber: formData.tdnNumber,
            truckNumber: formData.truckNumber,
            truckDateTime: formData.truckDateTime || null,
            items: calculatedItems.map(it => ({
                variantName: it.variantName,
                itemType: it.itemType,
                noOfBags: Number(it.bags) || 0,
                weightInQtl: Number(it.weight) || 0,
                ratePerQtl: Number(it.rate) || 0
            }))
        };

        // If editing an existing backend PO, perform PUT; otherwise POST to create new
        (async () => {
            try {
                // placeholder: no-op to ensure patch context alignment
                if (editingPoId && typeof editingPoId === 'string' && editingPoId.startsWith('BPO-')) {
                    const numericId = parseInt(editingPoId.replace('BPO-', ''), 10);
                    const res = await authFetch(`${API_BASE}/${numericId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!res.ok) throw new Error('API error on update');
                    const updated = await res.json();
                    const uiPo = mapApiPoToUi(updated);
                    setPoList(prev => prev.map(p => p.id === editingPoId ? uiPo : p));
                    showToast(`Purchase Order ${uiPo.poNumber} updated on server.`);
                    setEditingPoId(null);
                    return;
                }

                // create new
                const res = await authFetch(API_BASE, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error('API error');
                const created = await res.json();
                const uiPo = mapApiPoToUi(created);
                setPoList(prev => [uiPo, ...prev]);
                showToast(`Purchase Order ${uiPo.poNumber} saved to server.`);
            } catch (err) {
                // On error, do NOT add or update local history. Keep the form state so user can retry.
                console.error('Save failed:', err);
                showToast('Could not save to server. Please try again.');
            }
        })();

        if (!editingPoId) {
            // Auto advance PO number and reset the form for the next entry
            const nextNum = 70 + poList.length + 2;
            setFormData(prev => ({
                ...prev,
                poNumber: `PO/26-27/00${nextNum}`,
                party: '',
                broker: '',
                farmerName: '',
                mobileNumber: '',
                village: '',
                remarks: '',
                tdnNumber: '',
                truckNumber: '',
                truckDateTime: ''
            }));
            setItems([{
                id: Date.now(),
                variantName: 'CREAMY SELLA 2ND WAND 50KG',
                itemType: 'Rice',
                bags: 0,
                weight: 0,
                rate: 0
            }]);
        }
    };

    const handleDeletePO = (id) => {
        // If this is a backend-saved PO (id prefixed with BPO-), call API to remove
        if (typeof id === 'string' && id.startsWith('BPO-')) {
            const numericId = parseInt(id.replace('BPO-', ''), 10);
            (async () => {
                    try {
                    const res = await authFetch(`${API_BASE}/${numericId}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('delete failed');
                    setPoList(prev => prev.filter(p => p.id !== id));
                    showToast('Purchase Order removed from server records.');
                    if (viewingPo?.id === id) setViewingPo(null);
                } catch (err) {
                    showToast('Could not delete from server; removed locally.');
                    setPoList(prev => prev.filter(p => p.id !== id));
                }
            })();
        } else {
            setPoList(prev => prev.filter(p => p.id !== id));
            showToast('Purchase Order removed from local records.');
            if (viewingPo?.id === id) setViewingPo(null);
        }
    };

    const stats = useMemo(() => {
        const totalOrders = poList.length;
        const totalBags = poList.reduce((acc, p) => acc + (p.totalBags || 0), 0);
        const totalWeight = poList.reduce((acc, p) => acc + (p.totalWeight || 0), 0);
        const totalSpend = poList.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
        const avgRate = totalWeight > 0 ? (totalSpend / totalWeight) : 0;

        // Variant distribution
        const variantWeights = {};
        poList.forEach(po => {
            po.items.forEach(it => {
                variantWeights[it.variantName] = (variantWeights[it.variantName] || 0) + (it.weight || 0);
            });
        });

        const topVariants = Object.entries(variantWeights)
            .map(([name, weight]) => ({ name, weight }))
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 5);

        return {
            totalOrders,
            totalBags,
            totalWeight: totalWeight.toFixed(2),
            totalSpend,
            avgRate: avgRate.toFixed(2),
            topVariants
        };
    }, [poList]);

    // Filtered list for history
    const filteredOrders = useMemo(() => {
        return poList.filter(po => {
            const matchSearch =
                po.poNumber.toLowerCase().includes(filterQuery.toLowerCase()) ||
                (po.party && po.party.toLowerCase().includes(filterQuery.toLowerCase())) ||
                (po.farmerName && po.farmerName.toLowerCase().includes(filterQuery.toLowerCase())) ||
                (po.village && po.village.toLowerCase().includes(filterQuery.toLowerCase())) ||
                (po.broker && po.broker.toLowerCase().includes(filterQuery.toLowerCase()));

            const matchStatus = statusFilter === 'ALL' || po.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [poList, filterQuery, statusFilter]);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center space-x-3 border-l-4 border-emerald-500 animate-slide-up">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-medium">{toastMessage}</span>
                </div>
            )}

                {/* ========================================================= */}
                {/* TAB: PROCESS PURCHASE ORDERS                             */}
                {/* ========================================================= */}
                {activeTab === 'process' && (
                    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-2 border-b border-slate-200">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-emerald-600" />
                                    Process Purchase Orders
                                </h2>
                                <p className="text-xs text-slate-500">Select a Purchase Order to inspect, verify, or mark as processed.</p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <select
                                    value={selectedPoToProcess}
                                    onChange={(e) => setSelectedPoToProcess(e.target.value)}
                                    className="text-xs py-1.5 px-2.5 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                                >
                                    <option value="">-- Select PO --</option>
                                    {poList.map(p => (
                                        <option key={p.id} value={p.id}>{`${p.poNumber} — ${p.party || '—'}`}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setSelectedPoToProcess('')}
                                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded hover:bg-slate-200 transition"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* Large PO preview area */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="bg-slate-50 min-h-[420px] p-4 rounded">
                                {selectedPoToProcess ? (
                                    (() => {
                                        const po = poList.find(p => p.id === selectedPoToProcess);
                                        if (!po) return <div className="text-center text-sm text-slate-500">Selected PO not found.</div>;
                                        return (
                                            <div className="space-y-6">
                                                {/* Order Header (styled like entry form) */}
                                                <div className="bg-white rounded-lg border border-emerald-600 shadow-sm overflow-hidden">
                                                    <div className="bg-amber-100/70 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
                                                        <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Order Header & Master Information</span>
                                                        <span className="text-xs font-mono font-semibold text-slate-600">STATUS: <span className="text-emerald-700">{po.status}</span></span>
                                                    </div>
                                                    <div className="p-4 sm:p-5 space-y-4">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                                                            <div className="sm:col-span-2">
                                                                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Party</label>
                                                                <div className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded bg-white text-slate-800">{po.party}</div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">PO Number</label>
                                                                <div className="w-full text-xs px-2.5 py-2 border border-emerald-300 bg-emerald-50/50 font-mono font-semibold text-emerald-900 rounded">{po.poNumber}</div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">PO Date</label>
                                                                <div className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded text-slate-700">{po.poDate}</div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Purchased By</label>
                                                                <div className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded text-slate-700">{po.purchasedBy}</div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Broker</label>
                                                                <div className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded text-slate-700">{po.broker || '—'}</div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                                                            <div>
                                                                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Payment Terms</label>
                                                                <div className="text-xs px-2.5 py-2 border border-slate-300 rounded">{po.paymentTerms || '—'}</div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Dana Cut</label>
                                                                <div className="text-xs px-2.5 py-2 border border-slate-300 rounded">{po.danaCut || '—'}</div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">CD (Cash Discount)</label>
                                                                <div className="text-xs px-2.5 py-2 border border-slate-300 rounded">{po.cd || '—'}</div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Freight Party/Self</label>
                                                                <div className="text-xs px-2.5 py-2 border border-slate-300 rounded">{po.freightPartyOrSelf || '—'}</div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Bardana</label>
                                                                <div className="text-xs px-2.5 py-2 border border-slate-300 rounded">{po.bardana || '—'}</div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Brokerage (₹)</label>
                                                                <div className="text-xs px-2.5 py-2 border border-slate-300 rounded">{formatINR(po.brokerage || 0)}</div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                                                            <div>
                                                                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Village / Tehsil</label>
                                                                <div className="text-xs px-2.5 py-2 border border-slate-300 rounded">{po.village || '—'}</div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Farmer / Grower Name</label>
                                                                <div className="text-xs px-2.5 py-2 border border-slate-300 rounded">{po.farmerName || '—'}</div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Mobile Number</label>
                                                                <div className="text-xs px-2.5 py-2 border border-slate-300 rounded">{po.mobileNumber || '—'}</div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Company</label>
                                                                <div className="text-xs px-2.5 py-2 border border-slate-300 rounded">{po.company || '—'}</div>
                                                            </div>
                                                            <div className="sm:col-span-2">
                                                                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Remarks</label>
                                                                <div className="text-xs px-2.5 py-2 border border-slate-300 rounded">{po.remarks || '—'}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Item Section (read-only) */}
                                                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                                    <div className="bg-emerald-800 text-white px-4 py-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="text-sm font-semibold">Item Section</h3>
                                                            <span className="text-xs bg-emerald-700/30 px-2 py-0.5 rounded">{(po.items||[]).length} Row{(po.items||[]).length>1?'s':''}</span>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 overflow-x-auto">
                                                        <table className="w-full text-left text-sm border-collapse">
                                                            <thead>
                                                                <tr className="bg-amber-100 text-slate-700 text-xs border-b border-slate-200">
                                                                    <th className="py-2 px-3">#</th>
                                                                    <th className="py-2 px-3">Variant Name (Preset or Custom)</th>
                                                                    <th className="py-2 px-3">Item Type</th>
                                                                    <th className="py-2 px-3 text-right">No of Bags</th>
                                                                    <th className="py-2 px-3 text-right">Weight (in Qtl)</th>
                                                                    <th className="py-2 px-3 text-right">Rate (per Qtl)</th>
                                                                    <th className="py-2 px-3 text-right">Amount (₹)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {po.items?.map((it, idx) => (
                                                                    <tr key={idx} className="border-b border-slate-100">
                                                                        <td className="py-3 px-3">{idx+1}</td>
                                                                        <td className="py-3 px-3">{it.variantName}</td>
                                                                        <td className="py-3 px-3">{it.itemType}</td>
                                                                        <td className="py-3 px-3 text-right font-mono">{it.bags}</td>
                                                                        <td className="py-3 px-3 text-right font-mono">{it.weight}</td>
                                                                        <td className="py-3 px-3 text-right font-mono">{formatINR(it.rate)}</td>
                                                                        <td className="py-3 px-3 text-right font-mono">{formatINR(it.amount)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            <tfoot>
                                                                <tr className="bg-amber-50 font-bold text-slate-800">
                                                                    <td className="py-3 px-3">TOTAL SUMMARY :</td>
                                                                    <td></td>
                                                                    <td className="text-right py-3 px-3">{po.totalBags} Bags</td>
                                                                    <td className="text-right py-3 px-3">{po.totalWeight} Qtl</td>
                                                                    <td></td>
                                                                    <td className="text-right py-3 px-3">Avg: 0.00 /Qtl</td>
                                                                    <td className="text-right py-3 px-3">{formatINR(po.totalAmount)}</td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400">Select a PO from the dropdown to view details.</div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="mt-4 flex justify-end space-x-3">
                                <button
                                    onClick={() => verifyPo(selectedPoToProcess)}
                                    disabled={!selectedPoToProcess}
                                    className="px-4 py-2 text-sm font-semibold bg-amber-500 text-white rounded hover:opacity-95 disabled:opacity-50"
                                >
                                    Verify Order
                                </button>
                          {/*       <button
                                    onClick={() => processPo(selectedPoToProcess)}
                                    disabled={!selectedPoToProcess}
                                    className="px-4 py-2 text-sm font-semibold bg-emerald-700 text-white rounded hover:bg-emerald-800 disabled:opacity-50"
                                >
                                    Mark as Processed
                                </button> */}
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB: UPDATE PURCHASE ORDERS                             */}
                {/* ========================================================= */}
                {activeTab === 'update' && (
                    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-2 border-b border-slate-200">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <RefreshCw className="w-5 h-5 text-emerald-600" />
                                    Update Purchase Order
                                </h2>
                                <p className="text-xs text-slate-500">Load an existing PO into the entry sheet to edit and save back to server.</p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <select
                                    value={selectedPoToEdit}
                                    onChange={(e) => setSelectedPoToEdit(e.target.value)}
                                    className="text-xs py-1.5 px-2.5 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                                >
                                    <option value="">-- Select PO to Edit --</option>
                                    {poList.map(p => (
                                        <option key={p.id} value={p.id}>{`${p.poNumber} — ${p.party || '—'}`}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => selectedPoToEdit ? loadPoForEdit(selectedPoToEdit) : showToast('Please choose a PO to load.')}
                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded hover:bg-emerald-800 transition"
                                >
                                    Load PO Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            {/* Top Header */}
            <header className="order-first bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-md">
                                <Building className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                                        APARNA FOODS
                                    </h1>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold uppercase tracking-wider">
                                        Purchase Module AF
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">Milling & Procurement ERP</p>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">

                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition ${activeTab === 'dashboard'
                                    ? 'bg-emerald-700 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span>Analytics Dashboard</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('entry')}
                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition ${activeTab === 'entry'
                                        ? 'bg-emerald-700 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                <PlusCircle className="w-4 h-4" />
                                <span>PO Entry Sheet</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('update')}
                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition ${activeTab === 'update'
                                    ? 'bg-emerald-700 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Update PO</span>
                            </button>
                            {/* New: PO Process & Update actions in the nav */}
                            <button
                                onClick={() => setActiveTab('process')}
                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition ${activeTab === 'process'
                                    ? 'bg-emerald-700 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Process PO</span>
                            </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition ${activeTab === 'history'
                                            ? 'bg-emerald-700 text-white shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    <History className="w-4 h-4" />
                                    <span>Order History ({poList.length})</span>
                                </button>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={logout}
                                title="Sign out"
                                className="px-3 py-1 text-sm font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* ========================================================= */}
                {/* TAB 1: PURCHASE ORDER ENTRY FORM (Spreadsheet Mirror)       */}
                {/* ========================================================= */}
                {(activeTab === 'entry' || (activeTab === 'update' && editingPoId)) && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-slate-200">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                    {editingPoId ? 'Update Purchase Order' : 'New Purchase Order Entry'}
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {editingPoId
                                        ? 'Edit the loaded purchase order and save your changes.'
                                        : 'Follows the exact layout & grid structure of the Aparna Foods Purchase Module sheet.'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 mt-3 md:mt-0">
                                <button
                                    type="button"
                                    onClick={handleResetForm}
                                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition"
                                >
                                    Clear / Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const tempPo = {
                                            id: 'PREVIEW',
                                            ...formData,
                                            items: calculatedItems,
                                            totalBags: totals.bags,
                                            totalWeight: totals.weight,
                                            totalAmount: totals.amount
                                        };
                                        setViewingPo(tempPo);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded hover:bg-emerald-100 transition"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    Quick Print Preview
                                </button>
                            </div>
                        </div>

                        {/* FORM CONTAINER */}
                        <form onSubmit={handleSavePO} className="space-y-6">

                            {/* Spreadsheet Main Header Grid Box */}
                            <div className="bg-white rounded-lg border border-emerald-600 shadow-sm overflow-hidden">
                                <div className="bg-amber-100/70 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                                        Order Header & Master Information
                                    </span>
                                    <span className="text-xs font-mono font-semibold text-slate-600">
                                        STATUS: <span className="text-emerald-700">{formData.status}</span>
                                    </span>
                                </div>

                                <div className="p-4 sm:p-5 space-y-4">
                                    {/* Row 1: Party, PO Number, PO Date, Purchased By, Broker, Brokerage */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                                        <div className="sm:col-span-2">
                                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                                                Party <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Shyam Traders / Mandi Board"
                                                required
                                                value={formData.party}
                                                onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                                                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                                                PO Number
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.poNumber}
                                                onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                                                className="w-full text-xs px-2.5 py-2 border border-emerald-300 bg-emerald-50/50 font-mono font-semibold text-emerald-900 rounded focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                                                PO Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.poDate}
                                                onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
                                                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                                                Purchased By
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Officer Name"
                                                value={formData.purchasedBy}
                                                onChange={(e) => setFormData({ ...formData, purchasedBy: e.target.value })}
                                                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                                                Broker
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Broker name"
                                                value={formData.broker}
                                                onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                                                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Row 2: Payment Terms, Dana Cut, CD, Freight Party/Self, Remarks, Bardana */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                                                Payment Terms
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 15 Days PDC"
                                                value={formData.paymentTerms}
                                                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                                                Dana Cut
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 0.5% / 1kg"
                                                value={formData.danaCut}
                                                onChange={(e) => setFormData({ ...formData, danaCut: e.target.value })}
                                                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                                                CD (Cash Discount)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 1.5% CD"
                                                value={formData.cd}
                                                onChange={(e) => setFormData({ ...formData, cd: e.target.value })}
                                                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                                                Freight Party/Self
                                            </label>
                                            <select
                                                value={formData.freightPartyOrSelf}
                                                onChange={(e) => setFormData({ ...formData, freightPartyOrSelf: e.target.value })}
                                                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                                            >
                                                <option value="Party">Party</option>
                                                <option value="Self">Self</option>
                                                <option value="To Pay">To Pay</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                                                Bardana
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. New HDPE / Jute"
                                                value={formData.bardana}
                                                onChange={(e) => setFormData({ ...formData, bardana: e.target.value })}
                                                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                                                Brokerage (₹)
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={formData.brokerage}
                                                onChange={(e) => setFormData({ ...formData, brokerage: e.target.value })}
                                                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Row 3: Village, Farmer Name, Mobile Number, Company, Remarks */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                                                Village / Tehsil
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Origin Village"
                                                value={formData.village}
                                                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                                                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                                                Farmer / Grower Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Full Farmer Name"
                                                value={formData.farmerName}
                                                onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                                                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                                                Mobile Number
                                            </label>
                                            <input
                                                type="tel"
                                                maxLength={10}
                                                placeholder="10-digit mobile"
                                                value={formData.mobileNumber}
                                                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                                                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                                                Company
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded bg-slate-50 focus:ring-1 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                                                Remarks
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Batch / Quality notes"
                                                value={formData.remarks}
                                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            { }
                            <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
                                <div className="bg-emerald-800 text-white px-4 py-2.5 flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold text-sm tracking-wide">Item Section</span>
                                        <span className="text-xs bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded">
                                            {items.length} {items.length === 1 ? 'Row' : 'Rows'}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddItemRow}
                                        className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded transition"
                                    >
                                        <PlusCircle className="w-3.5 h-3.5" />
                                        <span>Add Item Row</span>
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-amber-100/90 text-amber-950 text-xs font-bold border-b border-amber-200">
                                                <th className="py-2.5 px-3 w-8 text-center">#</th>
                                                <th className="py-2.5 px-3 min-w-[280px]">Variant Name (Preset or Custom)</th>
                                                <th className="py-2.5 px-3 min-w-[130px]">Item Type</th>
                                                <th className="py-2.5 px-3 min-w-[120px] text-right">No of Bags</th>
                                                <th className="py-2.5 px-3 min-w-[140px] text-right">Weight (in Qtl)</th>
                                                <th className="py-2.5 px-3 min-w-[140px] text-right">Rate (per Qtl)</th>
                                                <th className="py-2.5 px-3 min-w-[160px] text-right bg-amber-200/50">Amount (₹)</th>
                                                <th className="py-2.5 px-3 w-12 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 text-xs">
                                            {calculatedItems.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-slate-50 transition">
                                                    <td className="py-2 px-3 text-center font-mono text-slate-400">
                                                        {index + 1}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <div className="space-y-1">
                                                            <select
                                                                value={VARIANT_PRESETS.includes(item.variantName) ? item.variantName : 'CUSTOM'}
                                                                onChange={(e) => {
                                                                    if (e.target.value !== 'CUSTOM') {
                                                                        handleItemChange(item.id, 'variantName', e.target.value);
                                                                    }
                                                                }}
                                                                className="w-full text-xs font-medium bg-white border border-slate-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                            >
                                                                {VARIANT_PRESETS.map((v) => (
                                                                    <option key={v} value={v}>
                                                                        {v}
                                                                    </option>
                                                                ))}
                                                                <option value="CUSTOM">— Enter Custom Variant —</option>
                                                            </select>
                                                            {/* If Custom or user edited */}
                                                            {(!VARIANT_PRESETS.includes(item.variantName) || item.variantName === 'CUSTOM') && (
                                                                <input
                                                                    type="text"
                                                                    placeholder="Type custom variant..."
                                                                    value={item.variantName === 'CUSTOM' ? '' : item.variantName}
                                                                    onChange={(e) => handleItemChange(item.id, 'variantName', e.target.value)}
                                                                    className="w-full text-xs px-2 py-1 border border-amber-300 bg-amber-50 rounded focus:ring-1 focus:ring-amber-500 outline-none"
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <select
                                                            value={item.itemType}
                                                            onChange={(e) => handleItemChange(item.id, 'itemType', e.target.value)}
                                                            className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                        >
                                                            <option value="Rice">Rice</option>
                                                            <option value="Paddy">Paddy</option>
                                                            <option value="Broken">Broken</option>
                                                            <option value="Bran">Bran</option>
                                                            <option value="Husk">Husk</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-2 px-3 text-right">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={item.bags || ''}
                                                            placeholder="0"
                                                            onChange={(e) => handleItemChange(item.id, 'bags', e.target.value)}
                                                            className="w-full text-right text-xs px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3 text-right">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={item.weight || ''}
                                                            placeholder="0.00"
                                                            onChange={(e) => handleItemChange(item.id, 'weight', e.target.value)}
                                                            className="w-full text-right text-xs px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none font-mono font-medium"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3 text-right">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={item.rate || ''}
                                                            placeholder="0.00"
                                                            onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                                                            className="w-full text-right text-xs px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none font-mono text-emerald-800 font-semibold"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3 text-right bg-amber-50/40 font-mono font-bold text-slate-800">
                                                        {formatINR(item.amount)}
                                                    </td>
                                                    <td className="py-2 px-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItemRow(item.id)}
                                                            className="text-slate-400 hover:text-red-600 transition p-1"
                                                            title="Delete Row"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>

                                        {/* Table Footer Matching Sheet Totals */}
                                        <tfoot>
                                            <tr className="bg-amber-100 font-bold text-xs border-t-2 border-amber-300 text-slate-900">
                                                <td colSpan={3} className="py-3 px-3 text-right uppercase tracking-wider">
                                                    Total Summary :
                                                </td>
                                                <td className="py-3 px-3 text-right font-mono text-emerald-900 text-sm">
                                                    {totals.bags.toLocaleString('en-IN')} Bags
                                                </td>
                                                <td className="py-3 px-3 text-right font-mono text-emerald-900 text-sm">
                                                    {totals.weight.toFixed(2)} Qtl
                                                </td>
                                                <td className="py-3 px-3"></td>
                                                <td className="py-3 px-3 text-right font-mono text-sm text-emerald-950 bg-amber-200">
                                                    {formatINR(totals.amount)}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Bottom Buttons matching the green "Save" and pink "Clear" buttons in the sheet */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    Auto-calculates amount (Weight × Rate). Saves directly to local procurement database.
                                </div>

                                <div className="flex items-center space-x-3 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={handleResetForm}
                                        className="flex-1 sm:flex-initial px-6 py-2.5 rounded-md font-semibold text-xs text-red-800 bg-red-100 hover:bg-red-200 border border-red-300 shadow-sm transition"
                                    >
                                        Clear
                                    </button>

                                    <button
                                        type="submit"
                                        className="flex-1 sm:flex-initial px-8 py-2.5 rounded-md font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition flex items-center justify-center space-x-2"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        <span>{editingPoId ? 'Update Purchase Order' : 'Save Purchase Order'}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB 2: ANALYTICS & DASHBOARD OVERVIEW                     */}
                {/* ========================================================= */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <LayoutDashboard className="w-5 h-5 text-emerald-600" />
                                    Procurement Analytics & Dashboard
                                </h2>
                                <p className="text-xs text-slate-500">Live summary of active purchase orders, paddy intakes, and expenditure.</p>
                            </div>
                            <button
                                onClick={() => setActiveTab('entry')}
                                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-md shadow flex items-center gap-1.5"
                            >
                                <PlusCircle className="w-4 h-4" />
                                <span>+ New Purchase Order</span>
                            </button>
                        </div>

                        {/* KPI Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total POs</span>
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="mt-2 text-2xl font-extrabold text-slate-900 font-mono">{stats.totalOrders}</div>
                                <div className="mt-1 text-[11px] text-emerald-600 flex items-center">
                                    <TrendingUp className="w-3.5 h-3.5 mr-1" /> All procurement channels
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bags</span>
                                    <Package className="w-5 h-5 text-amber-600" />
                                </div>
                                <div className="mt-2 text-2xl font-extrabold text-slate-900 font-mono">
                                    {stats.totalBags.toLocaleString('en-IN')}
                                </div>
                                <div className="mt-1 text-[11px] text-slate-500">Standard & custom packing</div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity (Qtl)</span>
                                    <Weight className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="mt-2 text-2xl font-extrabold text-slate-900 font-mono">{stats.totalWeight}</div>
                                <div className="mt-1 text-[11px] text-blue-600">Quintals measured net</div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Expenditure</span>
                                    <IndianRupee className="w-5 h-5 text-emerald-700" />
                                </div>
                                <div className="mt-2 text-xl font-extrabold text-emerald-800 font-mono truncate">
                                    {formatINR(stats.totalSpend)}
                                </div>
                                <div className="mt-1 text-[11px] text-slate-500">Gross purchase commitment</div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Rate / Qtl</span>
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="mt-2 text-2xl font-extrabold text-slate-900 font-mono">
                                    ₹ {stats.avgRate}
                                </div>
                                <div className="mt-1 text-[11px] text-purple-600">Weighted procurement avg</div>
                            </div>
                        </div>

                        {/* Visual Breakdown Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Top Variant Distribution */}
                            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <Weight className="w-4 h-4 text-emerald-600" />
                                    Top Grain Variants by Weight (Qtl)
                                </h3>
                                <div className="space-y-3">
                                    {stats.topVariants.map((item, idx) => {
                                        const maxWeight = stats.topVariants[0]?.weight || 1;
                                        const percentage = Math.min(100, Math.round((item.weight / maxWeight) * 100));
                                        return (
                                            <div key={item.name} className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="font-medium text-slate-700 truncate max-w-[200px]" title={item.name}>
                                                        {idx + 1}. {item.name}
                                                    </span>
                                                    <span className="font-mono font-bold text-slate-900">{item.weight} Qtl</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {stats.topVariants.length === 0 && (
                                        <p className="text-xs text-slate-400 py-4 text-center">No variant data recorded yet.</p>
                                    )}
                                </div>
                            </div>

                            {/* Status Breakdown & Quick Metrics */}
                            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-600" />
                                    Order Fulfillment Status
                                </h3>
                                <div className="space-y-4 pt-1">
                                    {['Pending', 'Received', 'Billed'].map((st) => {
                                        const count = poList.filter(p => p.status === st).length;
                                        const pct = poList.length ? Math.round((count / poList.length) * 100) : 0;
                                        const colorMap = {
                                            Pending: 'bg-amber-500',
                                            Received: 'bg-blue-600',
                                            Billed: 'bg-emerald-600'
                                        };
                                        return (
                                            <div key={st} className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="font-semibold text-slate-700">{st} Orders</span>
                                                    <span className="font-mono text-slate-500">{count} orders ({pct}%)</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div className={`${colorMap[st]} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 p-3 rounded text-xs space-y-1 text-slate-600">
                                        <div className="flex justify-between">
                                            <span>Total Registered Farmers:</span>
                                            <strong className="text-slate-800 font-mono">
                                                {new Set(poList.map(p => p.farmerName).filter(Boolean)).size}
                                            </strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Active Mandi Brokers:</span>
                                            <strong className="text-slate-800 font-mono">
                                                {new Set(poList.map(p => p.broker).filter(Boolean)).size}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Key Suppliers / Parties */}
                            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-amber-600" />
                                    Key Parties & Mandis
                                </h3>
                                <div className="divide-y divide-slate-100 text-xs">
                                    {poList.slice(0, 4).map((po) => (
                                        <div key={po.id} className="py-2.5 flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold text-slate-800">{po.party || 'Direct Procurement'}</div>
                                                <div className="text-[11px] text-slate-400">
                                                    {po.village || 'Haryana'} • {po.farmerName || 'Farmer'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono font-bold text-emerald-800">{formatINR(po.totalAmount)}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{po.poNumber}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders Mini Table */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-800">Latest Purchase Orders</h3>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center"
                                >
                                    View All in History <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                            <th className="py-2.5 px-4 font-semibold">PO Number</th>
                                            <th className="py-2.5 px-4 font-semibold">Date</th>
                                            <th className="py-2.5 px-4 font-semibold">Party</th>
                                            <th className="py-2.5 px-4 font-semibold">Farmer Name</th>
                                            <th className="py-2.5 px-4 font-semibold text-right">Bags</th>
                                            <th className="py-2.5 px-4 font-semibold text-right">Weight (Qtl)</th>
                                            <th className="py-2.5 px-4 font-semibold text-right">Amount (₹)</th>
                                            <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {poList.slice(0, 5).map(po => (
                                            <tr key={po.id} className="hover:bg-slate-50">
                                                <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">{po.poNumber}</td>
                                                <td className="py-2.5 px-4 text-slate-600">{po.poDate}</td>
                                                <td className="py-2.5 px-4 font-medium text-slate-800">{po.party || '—'}</td>
                                                <td className="py-2.5 px-4 text-slate-600">{po.farmerName || '—'}</td>
                                                <td className="py-2.5 px-4 text-right font-mono">{po.totalBags}</td>
                                                <td className="py-2.5 px-4 text-right font-mono">{po.totalWeight}</td>
                                                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{formatINR(po.totalAmount)}</td>
                                                <td className="py-2.5 px-4 text-center">
                                                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold uppercase ${po.status === 'Received' ? 'bg-blue-100 text-blue-800' :
                                                            po.status === 'Billed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                        {po.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB 3: ORDER HISTORY & REPORTS                             */}
                {/* ========================================================= */}
                {activeTab === 'history' && (
                    <div className="space-y-5">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-2 border-b border-slate-200">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <History className="w-5 h-5 text-emerald-600" />
                                    Purchase Orders Record Log
                                </h2>
                                <p className="text-xs text-slate-500">Filter, inspect, export, and print previous Purchase Orders.</p>
                            </div>

                            {/* Filters */}
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search PO, Party, Farmer..."
                                        value={filterQuery}
                                        onChange={(e) => setFilterQuery(e.target.value)}
                                        className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 outline-none w-56"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="text-xs py-1.5 px-2.5 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Received">Received</option>
                                    <option value="Billed">Billed</option>
                                </select>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                            <th className="py-3 px-3">PO Number</th>
                                            <th className="py-3 px-3">Date</th>
                                            <th className="py-3 px-3">Party Name</th>
                                            <th className="py-3 px-3">Farmer / Village</th>
                                            <th className="py-3 px-3">Items Count</th>
                                            <th className="py-3 px-3 text-right">Bags</th>
                                            <th className="py-3 px-3 text-right">Weight (Qtl)</th>
                                            <th className="py-3 px-3 text-right">Total Amount (₹)</th>
                                            <th className="py-3 px-3 text-center">Status</th>
                                            <th className="py-3 px-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {filteredOrders.map((po) => (
                                            <tr key={po.id} className="hover:bg-slate-50 transition">
                                                <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                                                    {po.poNumber}
                                                </td>
                                                <td className="py-3 px-3 text-slate-600">{po.poDate}</td>
                                                <td className="py-3 px-3 font-semibold text-slate-800">{po.party || '—'}</td>
                                                <td className="py-3 px-3 text-slate-600">
                                                    <div>{po.farmerName || '—'}</div>
                                                    <div className="text-[10px] text-slate-400">{po.village || '—'}</div>
                                                </td>
                                                <td className="py-3 px-3 text-slate-600">
                                                    {po.items?.length || 0} variant(s)
                                                </td>
                                                <td className="py-3 px-3 text-right font-mono font-medium">{po.totalBags}</td>
                                                <td className="py-3 px-3 text-right font-mono font-medium">{po.totalWeight}</td>
                                                <td className="py-3 px-3 text-right font-mono font-bold text-emerald-900">
                                                    {formatINR(po.totalAmount)}
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold uppercase ${po.status === 'Received' ? 'bg-blue-100 text-blue-800' :
                                                            po.status === 'Billed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                        {po.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <div className="flex items-center justify-center space-x-1.5">
                                                        <button
                                                            onClick={async () => {
                                                                // If this PO came from backend (id like 'BPO-123'), fetch fresh details
                                                                if (typeof po.id === 'string' && po.id.startsWith('BPO-')) {
                                                                    const numericId = parseInt(po.id.replace('BPO-', ''), 10);
                                                                    try {
                                                                        const resp = await authFetch(`${API_BASE}/${numericId}`);
                                                                        if (resp.ok) {
                                                                            const serverPo = await resp.json();
                                                                            setViewingPo(mapApiPoToUi(serverPo));
                                                                            return;
                                                                        }
                                                                    } catch (err) {
                                                                        console.warn('Failed to fetch PO details from server', err);
                                                                    }
                                                                }
                                                                setViewingPo(po);
                                                            }}
                                                            title="View & Print PO Voucher"
                                                            className="p-1 rounded text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePO(po.id)}
                                                            title="Delete Record"
                                                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {filteredOrders.length === 0 && (
                                            <tr>
                                                <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                                                    No matching Purchase Orders found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            {viewingPo && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full p-6 relative max-h-[90vh] overflow-y-auto print:p-0 print:shadow-none">

                        {/* Modal Actions */}
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-4 print:hidden">
                            <div className="flex items-center space-x-2">
                                <span className="font-bold text-sm text-slate-800">Purchase Order Voucher Preview</span>
                                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
                                    {viewingPo.poNumber}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800 transition"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Print Voucher</span>
                                </button>
                                <button
                                    onClick={() => setViewingPo(null)}
                                    className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-semibold hover:bg-slate-300 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Printable Sheet Mirror Document */}
                        <div className="border border-slate-300 p-5 rounded-md text-xs space-y-4 font-sans bg-white">
                            {/* Header Box */}
                            <div className="text-center pb-3 border-b-2 border-emerald-700">
                                <h2 className="text-xl font-extrabold tracking-tight text-slate-900">{viewingPo.company || 'APARNA FOODS LTD.'}</h2>
                                <p className="text-xs text-slate-600 font-medium">PURCHASE ORDER VOUCHER</p>
                                <p className="text-[11px] text-slate-400">Taraori-Karnal Highway, Haryana • GSTIN: 06AAACA1234F1Z9</p>
                            </div>

                            {/* Master Key-Value Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-amber-50/70 p-3 rounded border border-amber-200">
                                <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">PO Number:</span>
                                    <span className="font-mono font-bold text-emerald-900">{viewingPo.poNumber}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">PO Date:</span>
                                    <span className="font-semibold">{viewingPo.poDate}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Party Name:</span>
                                    <span className="font-bold text-slate-800">{viewingPo.party || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Purchased By:</span>
                                    <span>{viewingPo.purchasedBy || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Broker:</span>
                                    <span>{viewingPo.broker || 'Direct'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Brokerage:</span>
                                    <span className="font-mono">₹ {viewingPo.brokerage || '0.00'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Payment Terms:</span>
                                    <span>{viewingPo.paymentTerms || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Dana Cut:</span>
                                    <span>{viewingPo.danaCut || 'Nil'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Cash Discount (CD):</span>
                                    <span>{viewingPo.cd || 'Nil'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Freight:</span>
                                    <span>{viewingPo.freightPartyOrSelf || 'Party'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Bardana:</span>
                                    <span>{viewingPo.bardana || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Farmer Name:</span>
                                    <span className="font-semibold">{viewingPo.farmerName || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Village:</span>
                                    <span>{viewingPo.village || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Mobile:</span>
                                    <span className="font-mono">{viewingPo.mobileNumber || '—'}</span>
                                </div>
                            </div>

                            {/* Items Section Table */}
                            <div className="border border-slate-200 rounded overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-amber-100 font-bold text-slate-800 text-[11px] border-b border-amber-200">
                                            <th className="p-2 w-8">#</th>
                                            <th className="p-2">Variant Name</th>
                                            <th className="p-2">Type</th>
                                            <th className="p-2 text-right">No of Bags</th>
                                            <th className="p-2 text-right">Weight (Qtl)</th>
                                            <th className="p-2 text-right">Rate (₹/Qtl)</th>
                                            <th className="p-2 text-right">Amount (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 text-xs">
                                        {viewingPo.items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="p-2 text-slate-400 font-mono">{idx + 1}</td>
                                                <td className="p-2 font-semibold text-slate-800">{item.variantName}</td>
                                                <td className="p-2 text-slate-600">{item.itemType}</td>
                                                <td className="p-2 text-right font-mono">{item.bags}</td>
                                                <td className="p-2 text-right font-mono">{item.weight.toFixed(2)}</td>
                                                <td className="p-2 text-right font-mono font-medium">{item.rate.toFixed(2)}</td>
                                                <td className="p-2 text-right font-mono font-bold text-emerald-900">{formatINR(item.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-amber-100/90 font-bold border-t-2 border-amber-300 text-xs">
                                            <td colSpan={3} className="p-2 text-right uppercase">Total:</td>
                                            <td className="p-2 text-right font-mono">{viewingPo.totalBags}</td>
                                            <td className="p-2 text-right font-mono">{viewingPo.totalWeight} Qtl</td>
                                            <td></td>
                                            <td className="p-2 text-right font-mono text-emerald-950 font-extrabold bg-amber-200">
                                                {formatINR(viewingPo.totalAmount)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Remarks & Signatures */}
                            <div className="pt-2 text-xs text-slate-600">
                                <span className="font-bold">Remarks: </span>
                                <span>{viewingPo.remarks || 'None'}</span>
                            </div>

                            <div className="pt-10 flex justify-between items-end text-xs text-slate-500 border-t border-slate-200 mt-6">
                                <div className="text-center w-36">
                                    <div className="border-b border-slate-400 pb-8"></div>
                                    <span className="mt-1 block font-semibold">Farmer / Broker Sig</span>
                                </div>
                                <div className="text-center w-36">
                                    <div className="border-b border-slate-400 pb-8"></div>
                                    <span className="mt-1 block font-semibold">Weighbridge Clerk</span>
                                </div>
                                <div className="text-center w-44">
                                    <div className="border-b border-slate-400 pb-8"></div>
                                    <span className="mt-1 block font-bold text-emerald-900">For Aparna Foods Ltd.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-3 mt-8">
                <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
                    Aparna Foods Purchase Order Management • Built to match Google Sheets Purchase Module AF specifications.
                </div>
            </footer>
        </div>
    );
}