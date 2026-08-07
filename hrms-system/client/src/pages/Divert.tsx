import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { Target, Plus, Search, Filter, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { API } from '../services/api';

export default function Divert() {
  const [diverts, setDiverts] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Form State
  const [productWanted, setProductWanted] = useState<string>('');
  const [sectionId, setSectionId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [priceRange, setPriceRange] = useState<string>('');
  const [reasonCode, setReasonCode] = useState<string>('OUT_OF_STOCK');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerMobile, setCustomerMobile] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [divRes, secRes] = await Promise.all([
        API.getDiverts(),
        API.getSections()
      ]);
      if (divRes && divRes.diverts) setDiverts(divRes.diverts);
      if (secRes && secRes.sections) setSections(secRes.sections);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDivert = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await API.createDivert({
        sectionId,
        productWanted,
        quantity,
        priceRange,
        reasonCode,
        customerName,
        customerMobile,
        createdBy: 'Floor Staff'
      });
      setShowModal(false);
      setProductWanted('');
      setCustomerName('');
      setCustomerMobile('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to raise sourcing divert.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout title="Sourcing Diverts" subtitle="Track and manage unavailable merchandise requests raised by floor staff">
      <div className="space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="badge b-new font-bold text-xs py-1 px-3">
              Total Diverts: {diverts.length}
            </span>
            <span className="badge b-hold font-bold text-xs py-1 px-3">
              Open Sourcing: {diverts.filter(d => d.status === 'open' || d.status === 'sourcing').length}
            </span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-gold text-xs py-2.5 px-5 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Raise Sourcing Divert</span>
          </button>
        </div>

        {/* Diverts Table */}
        <div className="card-glass overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 font-bold">Loading diverts...</div>
          ) : diverts.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-bold">No sourcing diverts logged.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-[#1E2D4E] text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Ref No</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Product Requested</th>
                    <th className="p-4">Qty</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">PM Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {diverts.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-black text-[#1E2D4E]">#{item.refNo || item.id.slice(0, 6)}</td>
                      <td className="p-4 text-gray-600">{new Date(item.entryDate).toLocaleDateString()}</td>
                      <td className="p-4 font-bold text-[#1E2D4E]">{item.productWanted}</td>
                      <td className="p-4">{item.quantity} pcs</td>
                      <td className="p-4 text-gray-600">{item.reasonCode}</td>
                      <td className="p-4">
                        <div className="font-bold text-[#1E2D4E]">{item.customerName || 'Walk-in'}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{item.customerMobile}</div>
                      </td>
                      <td className="p-4">
                        <span className={`badge ${
                          item.status === 'available' ? 'b-sel' : item.status === 'sourcing' ? 'b-short' : 'b-new'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 max-w-xs truncate">{item.pmNotes || 'Awaiting PM review'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Raise Divert Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="card-glass p-6 max-w-lg w-full animate-scale-in">
              <h3 className="text-lg font-black text-[#1E2D4E] mb-4">Raise New Sourcing Divert</h3>
              <form onSubmit={handleCreateDivert} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product / Fabric Wanted</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Pure Kanjivaram Silk Saree (Green/Gold border)"
                    value={productWanted}
                    onChange={(e) => setProductWanted(e.target.value)}
                    className="input-modern"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Store Section</label>
                    <select
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}
                      className="select-modern"
                    >
                      <option value="">Select Section</option>
                      {sections.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                      className="input-modern"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Price Range</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹5,000 - ₹8,000"
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="input-modern"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Reason Code</label>
                    <select
                      value={reasonCode}
                      onChange={(e) => setReasonCode(e.target.value)}
                      className="select-modern"
                    >
                      <option value="OUT_OF_STOCK">Out of Stock</option>
                      <option value="COLOR_UNAVAILABLE">Color Unavailable</option>
                      <option value="SIZE_MISSING">Size Missing</option>
                      <option value="PRICE_HIGH">Price High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Customer Name</label>
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="input-modern"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Customer Mobile</label>
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      className="input-modern"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn-gold text-xs py-2 px-5"
                  >
                    {creating ? 'Submitting...' : 'Raise Sourcing Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
