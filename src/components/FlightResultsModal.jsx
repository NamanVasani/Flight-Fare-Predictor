import React, { useState } from 'react';
import { X, Plane, ArrowRight, CreditCard, Smartphone, Upload, CheckCircle2, Download, Loader2, ArrowLeft } from 'lucide-react';
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
  const airlineColor = flight.logoBg || '#3C1318';

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
  const seatLetter = (idx) => String.fromCharCode(65 + idx) + (12 + idx);

  const downloadTicketPdf = () => {
    const doc = new jsPDF();
    passengers.forEach((p, idx) => {
      if (idx > 0) doc.addPage();
      let y = 20;
      doc.setFillColor(60, 19, 24);
      doc.rect(0, 0, 210, 32, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('FlyFinder — Boarding Pass', 14, 18);
      doc.setFontSize(10);
      doc.text(`Ticket ${ticketNumber(idx)}`, 14, 26);
      doc.setTextColor(0, 0, 0);
      y = 42;

      doc.setFontSize(20);
      doc.text(`${source.code}`, 20, y);
      doc.setFontSize(10);
      doc.text('->', 60, y - 2);
      doc.setFontSize(20);
      doc.text(`${destination.code}`, 70, y);
      y += 8;
      doc.setFontSize(10);
      doc.text(`${source.city}  to  ${destination.city}`, 20, y);
      y += 10;

      doc.line(20, y, 190, y);
      y += 8;
      doc.setFontSize(11);
      doc.text(`Passenger: ${p.name}`, 20, y);
      doc.text(`Age: ${p.age}`, 140, y);
      y += 7;
      doc.text(`Airline: ${flight.airline} (${flight.code})`, 20, y);
      doc.text(`Seat: ${seatLetter(idx)}`, 140, y);
      y += 7;
      doc.text(`Departure: ${flight.depTime}`, 20, y);
      doc.text(`Arrival: ${flight.arrTime}`, 140, y);
      y += 7;
      doc.text(`Duration: ${flight.duration}`, 20, y);
      doc.text(`${flight.stopsLabel}`, 140, y);
      y += 7;
      doc.text(`Date of Journey: ${date}`, 20, y);
      y += 7;
      doc.text(`Fare Paid: ${formattedUnit}`, 20, y);
      y += 12;

      doc.line(20, y, 190, y);
      y += 8;
      doc.setFontSize(9);
      doc.text('Demo ticket generated for a student/portfolio project. Not valid for actual travel.', 20, y);
    });
    doc.save(`FlyFinder-Tickets-${bookingId}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF7F2] overflow-y-auto animate-fade-in">
      <div className="max-w-3xl mx-auto min-h-screen px-4 sm:px-8 py-8">

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={step === 'passengers' ? resetAndClose : () => setStep(step === 'payment' ? 'passengers' : 'passengers')}
            className="flex items-center gap-2 text-stone-500 hover:text-[#3C1318] font-bold text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> {step === 'passengers' ? 'Back to results' : 'Back'}
          </button>
          <button onClick={resetAndClose} className="p-2 rounded-full bg-white hover:bg-stone-200 text-[#3C1318] shadow-sm cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-6 sm:p-8 mb-6">
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
          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-6 sm:p-8 space-y-5">
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
          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-6 sm:p-8 space-y-5">
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

            <button onClick={handlePay} className="w-full bg-[#3C1318] hover:bg-[#280C10] text-white font-bold py-3 rounded-xl cursor-pointer">Pay {formattedTotal}</button>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#3C1318]" />
            <div className="font-bold text-stone-600">Processing payment of {formattedTotal}…</div>
          </div>
        )}

        {step === 'ticket' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-extrabold">Booking Confirmed — {passengers.length} Ticket{passengers.length > 1 ? 's' : ''}</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-emerald-600">Amount Paid</div>
                <div className="font-extrabold text-emerald-800">{formattedTotal}</div>
              </div>
            </div>

            {passengers.map((p, idx) => (
              <div key={idx} className="rounded-3xl overflow-hidden shadow-xl border border-stone-200">
                {/* Colored header strip, airline-branded */}
                <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: airlineColor }}>
                  <div className="text-white">
                    <div className="text-[10px] uppercase tracking-widest opacity-80">Boarding Pass</div>
                    <div className="font-extrabold text-lg">{flight.airline}</div>
                  </div>
                  <div className="text-right text-white">
                    <div className="text-[10px] uppercase tracking-widest opacity-80">Ticket</div>
                    <div className="font-mono font-bold">{ticketNumber(idx)}</div>
                  </div>
                </div>

                {/* Main ticket body */}
                <div className="bg-white p-6 flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-3xl font-black text-[#3C1318]">{source.code}</div>
                        <div className="text-xs text-stone-500">{source.city}</div>
                        <div className="text-sm font-bold text-stone-700 mt-1">{flight.depTime}</div>
                      </div>
                      <div className="flex-1 flex flex-col items-center px-4">
                        <div className="text-[10px] text-stone-400 font-bold">{flight.duration}</div>
                        <div className="w-full h-px bg-stone-300 my-1 relative">
                          <Plane className="w-4 h-4 absolute -top-2 left-1/2 -translate-x-1/2 text-stone-400" />
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold">{flight.stopsLabel}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-[#3C1318]">{destination.code}</div>
                        <div className="text-xs text-stone-500">{destination.city}</div>
                        <div className="text-sm font-bold text-stone-700 mt-1">{flight.arrTime}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-dashed border-stone-300 pt-4">
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase font-bold">Passenger</div>
                        <div className="font-bold text-[#3C1318] text-sm">{p.name}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase font-bold">Age</div>
                        <div className="font-bold text-[#3C1318] text-sm">{p.age}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase font-bold">Seat</div>
                        <div className="font-bold text-[#3C1318] text-sm">{seatLetter(idx)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase font-bold">Date</div>
                        <div className="font-bold text-[#3C1318] text-sm">{date}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase font-bold">Fare Paid</div>
                        <div className="font-bold text-[#3C1318] text-sm">{formattedUnit}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase font-bold">Booking ID</div>
                        <div className="font-bold text-[#3C1318] text-sm">{bookingId}</div>
                      </div>
                    </div>
                  </div>

                  {/* Perforated stub */}
                  <div className="sm:w-32 sm:border-l-2 sm:border-dashed sm:border-stone-300 sm:pl-6 flex sm:flex-col items-center justify-center gap-2 border-t-2 border-dashed border-stone-300 pt-4 sm:pt-0 sm:mt-0">
                    <div className="text-[10px] text-stone-400 font-bold uppercase">Gate</div>
                    <div className="font-black text-lg text-[#3C1318]">A{idx + 1}</div>
                    <div className="w-full h-8 bg-[repeating-linear-gradient(90deg,#3C1318_0,#3C1318_2px,transparent_2px,transparent_5px)] opacity-70 mt-2"></div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={downloadTicketPdf}
              className="w-full flex items-center justify-center gap-2 bg-[#3C1318] hover:bg-[#280C10] text-white font-bold py-4 rounded-xl cursor-pointer shadow-lg"
            >
              <Download className="w-5 h-5" /> Download All Tickets (PDF)
            </button>
            <button onClick={resetAndClose} className="w-full text-stone-500 font-bold py-2 cursor-pointer">Close</button>
          </div>
        )}

      </div>
    </div>
  );
}
