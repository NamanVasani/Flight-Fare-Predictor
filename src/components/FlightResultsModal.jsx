import React, { useState } from 'react';
import { X, Plane, ArrowRight, CreditCard, Smartphone, Upload, CheckCircle2, Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

export default function FlightResultsModal({ isOpen, onClose, source, destination, date, flight }) {
  const [step, setStep] = useState('passengers');
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState([{ name: '', age: '', aadharName: '' }]);
  const [paymentCategory, setPaymentCategory] = useState('card');
  const [cardType, setCardType] = useState('credit');
  const [upiApp, setUpiApp] = useState('googlepay');
  const [bookingId] = useState(() => 'FF' + Math.floor(100000 + Math.random() * 900000));

  if (!isOpen || !flight) return null;

  const unitPrice = flight.numericPrice || 0;
  const totalPrice = unitPrice * passengerCount;
  const formattedUnit = flight.formattedPrice;
  const formattedTotal = `₹ ${Math.round(totalPrice).toLocaleString('en-IN')}`;

  const resetAndClose = () => {
    setStep('passengers');
    setPassengerCount(1);
    setPassengers([{ name: '', age: '', aadharName: '' }]);
    setPaymentCategory('card');
    onClose();
  };

  const handlePassengerCountChange = (n) => {
    const count = Math.max(1, Math.min(6, n));
    setPassengerCount(count);
    setPassengers((prev) => {
      const next = [...prev];
      while (next.length < count) next.push({ name: '', age: '', aadharName: '' });
      return next.slice(0, count);
    });
  };

  const updatePassenger = (idx, field, value) => {
    setPassengers((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const allPassengersValid = passengers.every((p) => p.name.trim() !== '' && p.age !== '' && Number(p.age) > 0);

  const handleConfirmPassengers = () => {
    if (!allPassengersValid) return;
    setStep('payment');
  };

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => setStep('ticket'), 1800);
  };

  const ticketNumber = (idx) => `${bookingId}-${String(idx + 1).padStart(2, '0')}`;

  const downloadTicketPdf = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text('FlyFinder — E-Ticket', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Booking ID: ${bookingId}   Date of Journey: ${date}`, 20, y);
    y += 6;
    doc.line(20, y, 190, y);
    y += 10;

    doc.setFontSize(13);
    doc.text(`${source.city} (${source.code})  ->  ${destination.city} (${destination.code})`, 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`${flight.airline} (${flight.code})  •  ${flight.depTime} - ${flight.arrTime}  •  ${flight.duration}  •  ${flight.stopsLabel}`, 20, y);
    y += 6;
    doc.text(`Fare: ${formattedUnit} x ${passengers.length} passenger(s) = ${formattedTotal}`, 20, y);
    y += 10;
    doc.line(20, y, 190, y);
    y += 10;

    passengers.forEach((p, i) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.text(`Ticket ${i + 1} of ${passengers.length}  —  ${ticketNumber(i)}`, 20, y);
      y += 7;
      doc.setFontSize(10);
      doc.text(`Passenger: ${p.name}   Age: ${p.age}`, 25, y);
      y += 6;
      doc.text(`Fare for this ticket: ${formattedUnit}`, 25, y);
      y += 10;
    });

    doc.setFontSize(9);
    if (y > 260) { doc.addPage(); y = 20; }
    doc.text('This is a demo ticket generated for a student/portfolio project.', 20, y);
    y += 6;
    doc.text('Not valid for actual travel.', 20, y);

    doc.save(`FlyFinder-Ticket-${bookingId}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3C1318]/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl p-6 sm:p-8 relative">

        <button
          onClick={resetAndClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-[#3C1318] transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="text-xs text-stone-500 font-medium mb-1">{date}</div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3C1318] mb-1 flex items-center gap-2">
            <span>{source.city} ({source.code})</span>
            <ArrowRight className="w-5 h-5 text-[#35979A]" />
            <span>{destination.city} ({destination.code})</span>
          </h2>
          <div className="text-sm text-stone-600 font-medium flex items-center gap-2">
            <Plane className="w-4 h-4 text-stone-400" />
            <span>{flight.airline} • {flight.depTime} → {flight.arrTime} • {flight.duration} • {flight.stopsLabel}</span>
          </div>
          <div className="text-sm font-bold text-stone-500 mt-1">{formattedUnit} per passenger</div>
        </div>

        {step === 'passengers' && (
          <div className="space-y-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-500">Passenger Details</h3>

            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-stone-700">Number of passengers</label>
              <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden">
                <button onClick={() => handlePassengerCountChange(passengerCount - 1)} className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 font-bold cursor-pointer">−</button>
                <span className="px-4 font-bold">{passengerCount}</span>
                <button onClick={() => handlePassengerCountChange(passengerCount + 1)} className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 font-bold cursor-pointer">+</button>
              </div>
            </div>

            {passengers.map((p, idx) => (
              <div key={idx} className="border border-stone-200 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-extrabold text-stone-500 uppercase">Passenger {idx + 1}</div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={p.name}
                    onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
                    className="border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3C1318]"
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    min="1"
                    value={p.age}
                    onChange={(e) => updatePassenger(idx, 'age', e.target.value)}
                    className="border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3C1318]"
                  />
                </div>
                <label className="flex items-center gap-2 border border-dashed border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-500 cursor-pointer hover:bg-stone-50">
                  <Upload className="w-4 h-4" />
                  <span>{p.aadharName ? p.aadharName : 'Upload Aadhar (demo only — not stored)'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => updatePassenger(idx, 'aadharName', e.target.files?.[0]?.name || '')}
                  />
                </label>
              </div>
            ))}

            <div className="text-[11px] text-stone-400 italic">
              Demo project: uploaded files are never sent or saved anywhere — only the filename is shown here.
            </div>

            <div className="flex justify-between items-center border-t border-stone-200 pt-4">
              <span className="text-sm font-bold text-stone-600">Total ({passengerCount} × {formattedUnit})</span>
              <span className="text-xl font-extrabold text-[#3C1318]">{formattedTotal}</span>
            </div>

            <button
              onClick={handleConfirmPassengers}
              disabled={!allPassengersValid}
              className="w-full bg-[#3C1318] hover:bg-[#280C10] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all cursor-pointer"
            >
              Continue to Payment
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-500">Payment (Demo — no real charges)</h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentCategory('card')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm cursor-pointer ${paymentCategory === 'card' ? 'border-[#3C1318] bg-[#3C1318] text-white' : 'border-stone-300 text-stone-600'}`}
              >
                <CreditCard className="w-4 h-4" /> Card
              </button>
              <button
                onClick={() => setPaymentCategory('upi')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm cursor-pointer ${paymentCategory === 'upi' ? 'border-[#3C1318] bg-[#3C1318] text-white' : 'border-stone-300 text-stone-600'}`}
              >
                <Smartphone className="w-4 h-4" /> UPI
              </button>
            </div>

            {paymentCategory === 'card' && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button onClick={() => setCardType('credit')} className={`flex-1 py-2 rounded-lg border text-sm font-bold cursor-pointer ${cardType === 'credit' ? 'border-[#3C1318] bg-stone-100' : 'border-stone-300 text-stone-500'}`}>Credit Card</button>
                  <button onClick={() => setCardType('debit')} className={`flex-1 py-2 rounded-lg border text-sm font-bold cursor-pointer ${cardType === 'debit' ? 'border-[#3C1318] bg-stone-100' : 'border-stone-300 text-stone-500'}`}>Debit Card</button>
                </div>
                <input type="text" placeholder="Card number (demo — any digits)" maxLength="19" className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="MM/YY" className="border border-stone-300 rounded-xl px-3 py-2 text-sm" />
                  <input type="text" placeholder="CVV" maxLength="3" className="border border-stone-300 rounded-xl px-3 py-2 text-sm" />
                </div>
              </div>
            )}

            {paymentCategory === 'upi' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setUpiApp('googlepay')} className={`py-2 rounded-lg border text-sm font-bold cursor-pointer ${upiApp === 'googlepay' ? 'border-[#3C1318] bg-stone-100' : 'border-stone-300 text-stone-500'}`}>Google Pay</button>
                  <button onClick={() => setUpiApp('phonepe')} className={`py-2 rounded-lg border text-sm font-bold cursor-pointer ${upiApp === 'phonepe' ? 'border-[#3C1318] bg-stone-100' : 'border-stone-300 text-stone-500'}`}>PhonePe</button>
                </div>
                <input type="text" placeholder="UPI ID (e.g. name@bank)" className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm" />
              </div>
            )}

            <div className="flex justify-between items-center border-t border-stone-200 pt-4">
              <span className="text-sm font-bold text-stone-600">Total ({passengerCount} × {formattedUnit})</span>
              <span className="text-xl font-extrabold text-[#3C1318]">{formattedTotal}</span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('passengers')} className="flex-1 border border-stone-300 text-stone-600 font-bold py-3 rounded-xl cursor-pointer">Back</button>
              <button onClick={handlePay} className="flex-1 bg-[#3C1318] hover:bg-[#280C10] text-white font-bold py-3 rounded-xl cursor-pointer">Pay {formattedTotal}</button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#3C1318]" />
            <div className="font-bold text-stone-600">Processing payment of {formattedTotal}…</div>
          </div>
        )}

        {step === 'ticket' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-extrabold">Booking Confirmed — {passengers.length} Ticket{passengers.length > 1 ? 's' : ''}</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-stone-500">Amount Paid</div>
                <div className="font-extrabold text-[#3C1318]">{formattedTotal}</div>
              </div>
            </div>

            {passengers.map((p, idx) => (
              <div key={idx} className="border-2 border-dashed border-stone-300 rounded-2xl p-5 bg-[#FAF7F2]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xs text-stone-500 font-medium">Ticket No.</div>
                    <div className="font-extrabold text-[#3C1318]">{ticketNumber(idx)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-stone-500 font-medium">Date of Journey</div>
                    <div className="font-extrabold text-[#3C1318]">{date}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-stone-300 pt-3 mb-3">
                  <div className="text-center">
                    <div className="font-extrabold text-lg">{source.code}</div>
                    <div className="text-xs text-stone-500">{flight.depTime}</div>
                  </div>
                  <Plane className="w-5 h-5 text-stone-400" />
                  <div className="text-center">
                    <div className="font-extrabold text-lg">{destination.code}</div>
                    <div className="text-xs text-stone-500">{flight.arrTime}</div>
                  </div>
                </div>

                <div className="text-sm text-stone-600 border-t border-stone-300 pt-3">
                  <div>{flight.airline} • {flight.duration} • {flight.stopsLabel}</div>
                  <div className="font-extrabold text-[#3C1318] mt-2">{p.name} <span className="font-medium text-stone-500">(Age {p.age})</span></div>
                  <div className="text-xs text-stone-500 mt-1">Fare: {formattedUnit}</div>
                </div>
              </div>
            ))}

            <button
              onClick={downloadTicketPdf}
              className="w-full flex items-center justify-center gap-2 bg-[#3C1318] hover:bg-[#280C10] text-white font-bold py-3 rounded-xl cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download All Tickets (PDF)
            </button>
            <button onClick={resetAndClose} className="w-full text-stone-500 font-bold py-2 cursor-pointer">Close</button>
          </div>
        )}

      </div>
    </div>
  );
}
