import React, { useState } from 'react';
import { X, Plane, ArrowRight, CreditCard, Smartphone, Upload, CheckCircle2, Download, Loader2, ArrowLeft, Clock, Luggage } from 'lucide-react';
import jsPDF from 'jspdf';

function hexToRgb(hex) {
  const clean = (hex || '#3C1318').replace('#', '');
  const bigint = parseInt(clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

export default function FlightResultsModal({ isOpen, onClose, source, destination, date, flight }) {
  const [step, setStep] = useState('passengers');
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState([{ name: '', age: '', aadharName: '' }]);
  const [paymentCategory, setPaymentCategory] = useState('card');
  const [cardType, setCardType] = useState('credit');
  const [upiApp, setUpiApp] = useState('googlepay');
  const [bookingId] = useState(() => 'FF' + Math.floor(1000000 + Math.random() * 9000000).toString().slice(0, 6).toUpperCase());
  const [pnr] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());

  if (!isOpen || !flight) return null;

  const unitPrice = flight.numericPrice || 0;
  const totalPrice = unitPrice * passengerCount;
  const formattedUnit = flight.formattedPrice;
  const formattedTotal = `₹ ${Math.round(totalPrice).toLocaleString('en-IN')}`;
  const airlineColor = flight.logoBg || '#0B2545';
  const baseFare = Math.round(unitPrice * 0.82);
  const taxes = Math.round(unitPrice * 0.13);
  const otherCharges = Math.round(unitPrice - baseFare - taxes);

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

  const seatLetter = (idx) => 'A' + (11 + idx);
  const flightNo = `${flight.code}-${100 + (flight.depHour || 0) * 3}`;

  // Draws one boarding-pass page for a single passenger onto a jsPDF doc
  const drawTicketPage = (doc, idx) => {
    const p = passengers[idx];
    const [r, g, b] = hexToRgb(airlineColor);

    // Header bar
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(17);
    doc.text(flight.airline.toUpperCase(), 14, 15);
    doc.setFontSize(8);
    doc.text('YOUR JOURNEY, OUR PRIORITY', 14, 21);

    doc.setFontSize(9);
    doc.text('BOOKING REF', 95, 13);
    doc.setFontSize(13);
    doc.text(pnr, 95, 20);

    doc.setFontSize(9);
    doc.text('BOARDING PASS', 160, 13);
    doc.setFontSize(8);
    doc.text('ECONOMY CLASS', 160, 18);

    // Dashed vertical divider
    doc.setDrawColor(200, 200, 200);
    let dy = 34;
    while (dy < 280) {
      doc.line(148, dy, 148, dy + 3);
      dy += 6;
    }

    doc.setTextColor(30, 30, 30);

    // LEFT PANEL — main ticket
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('FROM', 14, 44);
    doc.text('TO', 90, 44);
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(22);
    doc.text(source.code, 14, 56);
    doc.text(destination.code, 90, 56);
    doc.setFontSize(9);
    doc.text(source.city, 14, 62);
    doc.text(destination.city, 90, 62);

    doc.setDrawColor(230, 230, 230);
    doc.setFillColor(245, 243, 238);
    doc.roundedRect(14, 70, 128, 16, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text('PASSENGER', 18, 76);
    doc.text('PNR', 68, 76);
    doc.text('SEAT', 90, 76);
    doc.text('BOARDING', 108, 76);
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(p.name || '-', 18, 83);
    doc.text(pnr, 68, 83);
    doc.text(seatLetter(idx), 90, 83);
    doc.text(flight.depTime, 108, 83);

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('FARE SUMMARY', 14, 98);
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text('Base Fare', 14, 106);
    doc.text(`₹ ${baseFare.toLocaleString('en-IN')}`, 120, 106, { align: 'right' });
    doc.text('Taxes & Fees', 14, 113);
    doc.text(`₹ ${taxes.toLocaleString('en-IN')}`, 120, 113, { align: 'right' });
    doc.text('Other Charges', 14, 120);
    doc.text(`₹ ${otherCharges.toLocaleString('en-IN')}`, 120, 120, { align: 'right' });
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 124, 134, 124);
    doc.setFontSize(11);
    doc.text('TOTAL PAID', 14, 132);
    doc.text(`₹ ${unitPrice.toLocaleString('en-IN')}`, 120, 132, { align: 'right' });

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('DATE', 14, 148); doc.setTextColor(30,30,30); doc.text(date, 40, 148);
    doc.setTextColor(120, 120, 120);
    doc.text('DEPARTURE', 14, 156); doc.setTextColor(30,30,30); doc.text(flight.depTime, 45, 156);
    doc.setTextColor(120, 120, 120);
    doc.text('ARRIVAL', 14, 164); doc.setTextColor(30,30,30); doc.text(flight.arrTime, 40, 164);
    doc.setTextColor(120, 120, 120);
    doc.text('DURATION', 14, 172); doc.setTextColor(30,30,30); doc.text(`${flight.duration} • ${flight.stopsLabel}`, 45, 172);
    doc.setTextColor(120, 120, 120);
    doc.text('FLIGHT', 14, 180); doc.setTextColor(30,30,30); doc.text(flightNo, 40, 180);
    doc.setTextColor(120, 120, 120);
    doc.text('BAGGAGE', 14, 188); doc.setTextColor(30,30,30); doc.text('15kg Check-in • 7kg Cabin', 45, 188);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Demo ticket for a student/portfolio project. Not valid for actual travel.', 14, 205);

    // RIGHT PANEL — stub
    doc.setFillColor(r, g, b);
    doc.setFillColor(245, 248, 255);
    doc.rect(152, 30, 58, 200, 'F');
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(9);
    doc.setTextColor(120,120,120);
    doc.text('PASSENGER', 156, 44);
    doc.setFontSize(11);
    doc.setTextColor(30,30,30);
    doc.text(p.name || '-', 156, 51);

    doc.setFontSize(9);
    doc.setTextColor(120,120,120);
    doc.text('FROM', 156, 64); doc.text('TO', 156, 78);
    doc.setFontSize(11);
    doc.setTextColor(30,30,30);
    doc.text(`${source.code}  ${source.city}`, 156, 70);
    doc.text(`${destination.code}  ${destination.city}`, 156, 84);

    doc.setFontSize(9);
    doc.setTextColor(120,120,120);
    doc.text('FLIGHT', 156, 96); doc.text('DATE', 190, 96);
    doc.setFontSize(9);
    doc.setTextColor(30,30,30);
    doc.text(flightNo, 156, 102); doc.text(date, 185, 102);

    doc.setTextColor(120,120,120);
    doc.text('SEAT', 156, 112); doc.text('BOARDING', 190, 112);
    doc.setTextColor(30,30,30);
    doc.text(seatLetter(idx), 156, 118); doc.text(flight.depTime, 185, 118);

    doc.setTextColor(120,120,120);
    doc.text('GATE', 156, 128); doc.text('ZONE', 190, 128);
    doc.setTextColor(30,30,30);
    doc.text(`A${idx + 1}`, 156, 134); doc.text('2', 192, 134);

    // Fake barcode
    doc.setFillColor(20, 20, 20);
    let bx = 156;
    for (let i = 0; i < 34; i++) {
      const w = (i % 3 === 0) ? 1.4 : 0.6;
      doc.rect(bx, 145, w, 16, 'F');
      bx += w + 0.6;
    }
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text(`${pnr}  ${source.code}-${destination.code}`, 156, 166);

    doc.setFontSize(9);
    doc.setTextColor(r, g, b);
    doc.text('Have a nice flight!', 156, 210);
  };

  const downloadSingleTicket = (idx) => {
    const doc = new jsPDF();
    drawTicketPage(doc, idx);
    doc.save(`${flight.code}-Ticket-${passengers[idx].name.replace(/\s+/g, '_') || idx + 1}.pdf`);
  };

  const downloadAllTickets = () => {
    const doc = new jsPDF();
    passengers.forEach((p, idx) => {
      if (idx > 0) doc.addPage();
      drawTicketPage(doc, idx);
    });
    doc.save(`FlyFinder-Tickets-${bookingId}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF7F2] overflow-y-auto animate-fade-in">
      <div className="max-w-3xl mx-auto min-h-screen px-4 sm:px-8 py-8">

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={step === 'passengers' ? resetAndClose : () => setStep('passengers')}
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
                  <input type="text" placeholder="Full name" value={p.name} onChange={(e) => updatePassenger(idx, 'name', e.target.value)} className="border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3C1318]" />
                  <input type="number" placeholder="Age" min="1" value={p.age} onChange={(e) => updatePassenger(idx, 'age', e.target.value)} className="border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3C1318]" />
                </div>
                <label className="flex items-center gap-2 border border-dashed border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-500 cursor-pointer hover:bg-stone-50">
                  <Upload className="w-4 h-4" />
                  <span>{p.aadharName ? p.aadharName : 'Upload Aadhar (demo only — not stored)'}</span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => updatePassenger(idx, 'aadharName', e.target.files?.[0]?.name || '')} />
                </label>
              </div>
            ))}
            <div className="text-[11px] text-stone-400 italic">Demo project: uploaded files are never sent or saved anywhere — only the filename is shown here.</div>
            <div className="flex justify-between items-center border-t border-stone-200 pt-4">
              <span className="text-sm font-bold text-stone-600">Total ({passengerCount} × {formattedUnit})</span>
              <span className="text-xl font-extrabold text-[#3C1318]">{formattedTotal}</span>
            </div>
            <button onClick={handleConfirmPassengers} disabled={!allPassengersValid} className="w-full bg-[#3C1318] hover:bg-[#280C10] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all cursor-pointer">Continue to Payment</button>
          </div>
        )}

        {step === 'payment' && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-6 sm:p-8 space-y-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-500">Payment (Demo — no real charges)</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setPaymentCategory('card')} className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm cursor-pointer ${paymentCategory === 'card' ? 'border-[#3C1318] bg-[#3C1318] text-white' : 'border-stone-300 text-stone-600'}`}><CreditCard className="w-4 h-4" /> Card</button>
              <button onClick={() => setPaymentCategory('upi')} className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm cursor-pointer ${paymentCategory === 'upi' ? 'border-[#3C1318] bg-[#3C1318] text-white' : 'border-stone-300 text-stone-600'}`}><Smartphone className="w-4 h-4" /> UPI</button>
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
              <div key={idx} className="rounded-3xl overflow-hidden shadow-xl border border-stone-200 flex flex-col sm:flex-row">
                {/* MAIN STUB */}
                <div className="flex-1 bg-white">
                  <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: airlineColor }}>
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">{flight.code}</div>
                      <div>
                        <div className="font-extrabold leading-tight">{flight.airline}</div>
                        <div className="text-[9px] uppercase tracking-widest opacity-80">Your journey, our priority</div>
                      </div>
                    </div>
                    <div className="text-right text-white">
                      <div className="text-[9px] uppercase tracking-widest opacity-80">Booking Ref</div>
                      <div className="font-mono font-bold">{pnr}</div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-[10px] text-stone-400 font-bold">FROM</div>
                        <div className="text-3xl font-black text-[#3C1318]">{source.code}</div>
                        <div className="text-xs text-stone-500">{source.city}</div>
                      </div>
                      <Plane className="w-5 h-5 text-stone-300" />
                      <div className="text-right">
                        <div className="text-[10px] text-stone-400 font-bold">TO</div>
                        <div className="text-3xl font-black text-[#3C1318]">{destination.code}</div>
                        <div className="text-xs text-stone-500">{destination.city}</div>
                      </div>
                    </div>

                    <div className="bg-[#FAF7F2] rounded-xl p-3 grid grid-cols-4 gap-2 mb-4">
                      <div><div className="text-[9px] text-stone-400 font-bold uppercase">Passenger</div><div className="text-sm font-bold text-[#3C1318] truncate">{p.name}</div></div>
                      <div><div className="text-[9px] text-stone-400 font-bold uppercase">PNR</div><div className="text-sm font-bold text-[#3C1318]">{pnr}</div></div>
                      <div><div className="text-[9px] text-stone-400 font-bold uppercase">Seat</div><div className="text-sm font-bold text-[#3C1318]">{seatLetter(idx)}</div></div>
                      <div><div className="text-[9px] text-stone-400 font-bold uppercase">Boarding</div><div className="text-sm font-bold text-[#3C1318]">{flight.depTime}</div></div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-stone-100 pt-4">
                      <div className="flex items-center gap-1 text-stone-500"><Clock className="w-3.5 h-3.5" /> {date}</div>
                      <div className="text-stone-500">Flight {flightNo}</div>
                      <div className="text-stone-500">Dep {flight.depTime} • Arr {flight.arrTime}</div>
                      <div className="text-stone-500">{flight.duration} • {flight.stopsLabel}</div>
                      <div className="flex items-center gap-1 text-stone-500 col-span-2"><Luggage className="w-3.5 h-3.5" /> 15kg check-in • 7kg cabin</div>
                    </div>

                    <div className="border-t border-stone-100 mt-4 pt-4 flex justify-between items-center">
                      <span className="text-sm font-bold text-stone-500">Fare Paid</span>
                      <span className="text-lg font-extrabold text-[#3C1318]">{formattedUnit}</span>
                    </div>
                  </div>
                </div>

                {/* TEAR-OFF STUB */}
                <div className="sm:w-56 bg-[#F5F8FF] border-t-2 sm:border-t-0 sm:border-l-2 border-dashed border-stone-300 p-5 flex flex-col justify-between">
                  <div>
                    <div className="text-[9px] text-stone-400 font-bold uppercase">Passenger</div>
                    <div className="font-extrabold text-[#3C1318] mb-3">{p.name}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div><div className="text-stone-400 font-bold">FLIGHT</div><div className="font-bold text-[#3C1318]">{flightNo}</div></div>
                      <div><div className="text-stone-400 font-bold">SEAT</div><div className="font-bold text-[#3C1318]">{seatLetter(idx)}</div></div>
                      <div><div className="text-stone-400 font-bold">GATE</div><div className="font-bold text-[#3C1318]">A{idx + 1}</div></div>
                      <div><div className="text-stone-400 font-bold">ZONE</div><div className="font-bold text-[#3C1318]">2</div></div>
                    </div>
                    <div className="w-full h-10 bg-[repeating-linear-gradient(90deg,#111_0,#111_2px,transparent_2px,transparent_4px)] mb-1"></div>
                    <div className="text-[9px] text-stone-400 font-mono">{pnr} • {source.code}-{destination.code}</div>
                  </div>
                  <button
                    onClick={() => downloadSingleTicket(idx)}
                    className="mt-4 flex items-center justify-center gap-2 bg-[#3C1318] hover:bg-[#280C10] text-white text-xs font-bold py-2.5 rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Ticket
                  </button>
                </div>
              </div>
            ))}

            {passengers.length > 1 && (
              <button onClick={downloadAllTickets} className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#3C1318] text-[#3C1318] font-bold py-3 rounded-xl cursor-pointer">
                <Download className="w-4 h-4" /> Download All {passengers.length} Tickets (One PDF)
              </button>
            )}
            <button onClick={resetAndClose} className="w-full text-stone-500 font-bold py-2 cursor-pointer">Close</button>
          </div>
        )}

      </div>
    </div>
  );
}
